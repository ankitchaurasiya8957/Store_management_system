const express = require('express');
const router = express.Router();
const RFP = require('../models/RFP');
const Quotation = require('../models/Quotation');
const Order = require('../models/Order');
const User = require('../models/User');
const CompanySettings = require('../models/CompanySettings');
const CreditTransaction = require('../models/CreditTransaction');
const Invoice = require('../models/Invoice');

// GET Invoices
router.get('/invoices', async (req, res) => {
  try {
    if (!req.query.userId) return res.json([]);
    const invoices = await Invoice.find({ userId: req.query.userId })
      .populate('orderReference')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});


// GET Dashboard Stats
router.get('/dashboard-stats', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.json({
        pendingRFPs: 0,
        approvedOrders: 0,
        deliveredOrders: 0,
        totalSpending: 0
      });
    }
    const filter = { userId };

    const pendingRFPs = await RFP.countDocuments({ ...filter, status: { $in: ['Draft', 'Submitted', 'Under Review', 'Approved'] } });
    const approvedOrders = await RFP.countDocuments({ ...filter, status: 'Approved' });
    const deliveredOrders = await Order.countDocuments({ ...filter, status: 'Delivered' });
    const totalInvoices = await Invoice.countDocuments(filter);

    // Calculate total spending (actual deducted credit)
    const user = await User.findOne({ userId });
    const totalSpending = user?.usedCredit || 0;

    res.json({
      pendingRFPs, // This now represents "Active RFPs"
      approvedOrders,
      deliveredOrders,
      totalInvoices,
      totalSpending
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all RFPs
router.get('/rfp', async (req, res) => {
  try {
    if (!req.query.userId) return res.json([]);
    const filter = { userId: req.query.userId };
    const rfps = await RFP.find(filter).sort({ createdAt: -1 });
    res.json(rfps);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST new RFP
router.post('/rfp', async (req, res) => {
  try {
    const newRFP = new RFP(req.body);
    await newRFP.save();

    if (newRFP.status !== 'Draft') {
      const CompanySettings = require('../models/CompanySettings');
      let settings = await CompanySettings.findOne();
      const gstRate = settings && settings.globalGstPercentage !== undefined ? settings.globalGstPercentage : 18;

      // Create placeholder Quotation
      // Build items array from RFP products
      const mappedItems = (newRFP.products || []).map(p => {
        const rate = p.price || 0;
        const qty = p.quantity || 1;
        const gstAmount = rate * (gstRate / 100);
        const unitTotal = rate + gstAmount;
        const totalAmount = unitTotal * qty;
        return {
          productName: p.category || '',
          brand: p.brand || '',
          model: p.model || '',
          configuration: p.configuration || '',
          quantity: qty,
          unitPrice: rate,
          totalAmount: totalAmount,
          hsn: p.hsn || '-',
          taxRate: p.taxRate || gstRate
        };
      });

      const newQuotation = new Quotation({
        quotationNo: `QT-${newRFP.rfpId}`,
        rfpReference: newRFP._id,
        vendor: 'TBD',
        amount: 0,
        validUntil: newRFP.expectedDeliveryDate,
        status: 'Pending',
        userId: newRFP.userId,
        items: mappedItems
      });
      await newQuotation.save();

      // Create placeholder Order
      const newOrder = new Order({
        orderNumber: `ORD-${newRFP.rfpId}`,
        quotationReference: newQuotation._id,
        expectedDelivery: newRFP.expectedDeliveryDate,
        status: 'Pending',
        totalAmount: req.body.estimatedTotal || 0,
        userId: newRFP.userId,
        items: mappedItems
      });
      await newOrder.save();
    }

    res.status(201).json(newRFP);
  } catch (error) {
    console.error('Error creating RFP:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all Quotations
router.get('/quotations', async (req, res) => {
  try {
    if (!req.query.userId) return res.json([]);
    const filter = { userId: req.query.userId };
    const quotations = await Quotation.find(filter).populate('rfpReference').sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /quotations/:id/pay
router.post('/quotations/:id/pay', async (req, res) => {
  try {
    const { paymentMethod, utrNumber } = req.body;
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    if (quotation.paymentStatus === 'Paid' || quotation.paymentStatus === 'Pending Verification') {
      return res.status(400).json({ error: 'Quotation payment is already processed or pending verification' });
    }

    quotation.paymentMethod = paymentMethod;
    if (utrNumber) quotation.utrNumber = utrNumber;
    quotation.transactionDate = new Date();

    if (paymentMethod === 'Credit Lines') {
      const amountToPay = quotation.amount;
      const user = await User.findOne({ userId: quotation.userId });

      if (!user) {
        return res.status(404).json({ error: 'User account not found for credit deduction' });
      }

      const availableCredit = user.totalCredit - user.usedCredit;

      if (availableCredit < amountToPay) {
        return res.status(400).json({ error: `Insufficient credit limit. Available: ₹${availableCredit.toLocaleString('en-IN')}` });
      }

      // Deduct the credit
      user.usedCredit += amountToPay;
      await user.save();

      // Log the transaction
      const transaction = new CreditTransaction({
        userId: user.userId,
        amount: amountToPay,
        type: 'Deducted',
        description: `Payment for Quotation ${quotation.quotationNo}`,
        referenceId: quotation._id.toString()
      });
      await transaction.save();

      quotation.paymentStatus = 'Pending Verification';
      await Order.findOneAndUpdate(
        { quotationReference: quotation._id },
        {
          paymentStatus: 'Pending Verification',
          paymentMethod: quotation.paymentMethod,
          transactionDate: new Date()
        }
      );
    } else {
      quotation.paymentStatus = 'Pending Verification';
      await Order.findOneAndUpdate(
        { quotationReference: quotation._id },
        {
          paymentStatus: 'Pending Verification',
          utrNumber: utrNumber,
          transactionDate: new Date(),
          paymentMethod: paymentMethod
        }
      );
    }

    await quotation.save();

    res.json({ message: 'Payment submitted successfully', quotation });
  } catch (error) {
    console.error('Error processing quotation payment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all Orders
router.get('/orders', async (req, res) => {
  try {
    if (!req.query.userId) return res.json([]);
    const filter = { userId: req.query.userId };
    const orders = await Order.find(filter).populate('quotationReference').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET specific Order by orderNumber (with deep population)
router.get('/orders/:orderNumber', async (req, res) => {
  try {
    const order = await Order.findOne({ orderNumber: req.params.orderNumber })
      .populate({
        path: 'quotationReference',
        populate: {
          path: 'rfpReference'
        }
      });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// PUT update RFP
router.put('/rfp/:id', async (req, res) => {
  try {
    const oldRFP = await RFP.findOne({ rfpId: req.params.id });
    if (!oldRFP) {
      return res.status(404).json({ error: 'RFP not found' });
    }

    const updatedRFP = await RFP.findOneAndUpdate({ rfpId: req.params.id }, req.body, { returnDocument: 'after' });

    // Create placeholders if transitioning from Draft
    if (oldRFP.status === 'Draft' && updatedRFP.status !== 'Draft') {
      const existingQuotation = await Quotation.findOne({ quotationNo: `QT-${updatedRFP.rfpId}` });
      if (!existingQuotation) {
        const newQuotation = new Quotation({
          quotationNo: `QT-${updatedRFP.rfpId}`,
          rfpReference: updatedRFP._id,
          vendor: 'AK Solutions Retail',
          amount: updatedRFP.estimatedTotal || 0,
          validUntil: updatedRFP.expectedDeliveryDate,
          status: 'Pending',
          userId: updatedRFP.userId
        });
        await newQuotation.save();

        const newOrder = new Order({
          orderNumber: `ORD-${updatedRFP.rfpId}`,
          quotationReference: newQuotation._id,
          expectedDelivery: updatedRFP.expectedDeliveryDate,
          status: 'Pending',
          totalAmount: req.body.estimatedTotal || updatedRFP.estimatedTotal || 0,
          userId: updatedRFP.userId
        });
        await newOrder.save();

        const CompanySettings = require('../models/CompanySettings');
        let settings = await CompanySettings.findOne();
        const gstRate = settings && settings.globalGstPercentage !== undefined ? settings.globalGstPercentage : 18;

        // Build productDetails from RFP products
        const prodDetails = (updatedRFP.products || []).map(p => {
          const rate = 0;
          const gstAmount = rate * (gstRate / 100);
          const totalAmount = rate + gstAmount;
          return {
            productName: p.category || '',
            brand: p.brand || '',
            model: p.model || '',
            configuration: p.configuration || '',
            serialNumber: '',
            rate,
            gstAmount,
            totalAmount
          };
        });

      }
    }

    // Sync statuses if RFP gets Approved or Rejected
    if (updatedRFP.status === 'Approved') {
      const prodDetails = (updatedRFP.products || []).map(p => {
        const rate = Math.floor(Math.random() * 40000) + 10000; // Realistic random price 10k-50k
        const quantity = p.quantity || 1;
        const totalAmount = rate * quantity;
        return {
          productName: p.category || '',
          brand: p.brand || '',
          model: p.model || '',
          configuration: p.configuration || '',
          quantity,
          unitPrice: rate,
          totalAmount
        };
      });
      const grandTotal = prodDetails.reduce((sum, item) => sum + item.totalAmount, 0);

      await Quotation.findOneAndUpdate({ quotationNo: `QT-${updatedRFP.rfpId}` }, { status: 'Approved', items: prodDetails, amount: grandTotal });
      await Order.findOneAndUpdate({ orderNumber: `ORD-${updatedRFP.rfpId}` }, { status: 'Confirmed', items: prodDetails, totalAmount: grandTotal });
    } else if (updatedRFP.status === 'Rejected') {
      await Quotation.findOneAndUpdate({ quotationNo: `QT-${updatedRFP.rfpId}` }, { status: 'Rejected' });
      await Order.findOneAndUpdate({ orderNumber: `ORD-${updatedRFP.rfpId}` }, { status: 'Rejected' });
    }

    res.json(updatedRFP);
  } catch (error) {
    console.error('Error updating RFP:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE RFP
router.delete('/rfp/:id', async (req, res) => {
  try {
    const deletedRFP = await RFP.findOneAndDelete({ rfpId: req.params.id });
    if (!deletedRFP) {
      return res.status(404).json({ error: 'RFP not found' });
    }
    res.json({ message: 'RFP deleted successfully' });
  } catch (error) {
    console.error('Error deleting RFP:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET reports
router.get('/reports', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const filter = { userId };

    // Fetch all relevant data
    const orders = await Order.find(filter);
    const rfps = await RFP.find(filter);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Daily Metrics
    const todayOrders = orders.filter(o => new Date(o.createdAt) >= todayStart);
    const todayRfps = rfps.filter(r => new Date(r.createdAt) >= todayStart);

    const daily = {
      spend: todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
      orders: todayOrders.length,
      rfps: todayRfps.length,
      invoicesPaid: 0 // Retained field with 0 value to not break frontend if it's still expecting it elsewhere
    };

    // Monthly Metrics (Last 12 months)
    const monthly = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      const monthStart = d;
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const monthOrders = orders.filter(o => {
        const date = new Date(o.createdAt);
        return date >= monthStart && date <= monthEnd;
      });
      const spend = monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      monthly.push({
        name: monthName,
        spend: spend,
        orders: monthOrders.length
      });
    }

    // Yearly Metrics (Last 5 years)
    const yearly = [];
    for (let i = 4; i >= 0; i--) {
      const year = now.getFullYear() - i;
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31, 23, 59, 59);

      const yearOrders = orders.filter(o => {
        const date = new Date(o.createdAt);
        return date >= yearStart && date <= yearEnd;
      });
      const spend = yearOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      yearly.push({
        name: year.toString(),
        spend: spend,
        orders: yearOrders.length
      });
    }

    res.json({ daily, monthly, yearly });
  } catch (error) {
    console.error('Error generating reports:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST new Order (Checkout)
router.post('/orders', async (req, res) => {
  try {
    const {
      quotationReference,
      expectedDelivery,
      totalAmount,
      paymentMethod,
      utrNumber,
      transactionDate,
      receiptUrl,
      userId
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    let paymentStatus = 'None';
    const orderNumber = `ORD-${Date.now()}`;

    if (paymentMethod === 'Credit') {
      const user = await User.findOne({ userId });
      if (!user) return res.status(404).json({ error: 'User not found' });

      const availableCredit = (user.totalCredit || 0) - (user.usedCredit || 0);
      if (availableCredit < totalAmount) {
        return res.status(400).json({ error: 'Insufficient credit limit.' });
      }

      // Immediately deduct it since we're creating an order checkout
      user.usedCredit = (user.usedCredit || 0) + totalAmount;
      await user.save();
      paymentStatus = 'Paid';

      // Log reservation as deduction
      const transaction = new CreditTransaction({
        userId: user.userId,
        amount: totalAmount,
        type: 'Deducted',
        description: `Paid credit for Order ${orderNumber}`,
      });
      await transaction.save();

    } else if (paymentMethod === 'NEFT' || paymentMethod === 'UPI' || paymentMethod === 'Advance Payment') {
      paymentStatus = 'Pending Verification';
    }

    const newOrder = new Order({
      orderNumber,
      quotationReference, // Can be null if they skip quotation
      expectedDelivery: expectedDelivery || new Date(),
      status: 'Pending',
      totalAmount,
      paymentMethod,
      paymentStatus,
      utrNumber,
      transactionDate,
      receiptUrl,
      userId
    });

    await newOrder.save();

    // HARD ALLOCATION: Reserve stock when Order is placed
    const GlobalProduct = require('../models/GlobalProduct');
    const Quotation = require('../models/Quotation');
    const quotation = quotationReference ? await Quotation.findById(quotationReference).populate('rfpReference') : null;
    const rfpProducts = quotation?.rfpReference?.products || [];
    for (const p of rfpProducts) {
      if (!p.brand || (!p.model && !p.category)) continue;

      let product;
      if (p.model) {
        product = await GlobalProduct.findOne({ brand: p.brand, model: p.model });
      }
      if (!product && p.category) {
        product = await GlobalProduct.findOne({ name: p.category });
      }

      if (product) {
        product.availableStock = Math.max(0, product.availableStock - p.quantity);
        product.reservedStock = (product.reservedStock || 0) + p.quantity;
        await product.save();
      }
    }

    res.status(201).json(newOrder);

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET Credit Transactions
router.get('/credit-transactions', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const transactions = await CreditTransaction.find({ userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching credit transactions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;
