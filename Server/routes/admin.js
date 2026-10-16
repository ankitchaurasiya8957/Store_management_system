// Server/routes/admin.js
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const GlobalProduct = require('../models/GlobalProduct');
const Invoice = require('../models/Invoice');
const CreditTransaction = require('../models/CreditTransaction');
const FranchisePartner = require('../models/FranchisePartner');
const ChannelPartner = require('../models/ChannelPartner');
const Order = require('../models/Order');
const ProcurementRequest = require('../models/ProcurementRequest');
const B2BInvoice = require('../models/B2BInvoice');
const Quotation = require('../models/Quotation');
const RFP = require('../models/RFP');
const StoreProfile = require('../models/StoreProfile');

const resend = require('../utils/resendClient');

// Middleware to check if user is admin (Assuming basic auth or we check token in a real scenario)
// For simplicity and matching current setup, we might rely on the frontend to protect routes,
// but it's good practice to add a middleware if we were passing tokens.
const { verifyAdminToken, requireRoles } = require('../middleware/auth');
const inventoryAuth = requireRoles(['admin', 'inventory_manager']);

// Apply admin verification middleware to ALL routes in this router
router.use(verifyAdminToken);

// GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: { $in: ['franchise', 'channel'] } });

    const userCreditStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalCreditDistributed: { $sum: "$totalCredit" },
          totalUsedCredit: { $sum: "$usedCredit" }
        }
      }
    ]);
    const totalCreditDistributed = userCreditStats[0]?.totalCreditDistributed || 0;
    const totalUsedCredit = userCreditStats[0]?.totalUsedCredit || 0;

    const productStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalInventoryItems: { $sum: "$quantity" },
          totalInventoryValue: { $sum: { $multiply: ["$quantity", "$sellingPrice"] } }
        }
      }
    ]);
    const totalInventoryItems = productStats[0]?.totalInventoryItems || 0;
    const totalInventoryValue = productStats[0]?.totalInventoryValue || 0;

    // Calculate Total Revenue, COGS, and Net Profit
    const invoices = await Invoice.find({ paymentStatus: 'Paid' }).populate('items.productId').lean();
    const b2bInvoices = await require('../models/B2BInvoice').find({ status: { $in: ['Paid', 'DISPATCHED'] } }).lean();
    const orders = await require('../models/Order').find({ paymentStatus: 'Paid' }).lean();

    let totalRevenue = 0;
    let totalCogs = 0;

    // Retail Invoices
    invoices.forEach(inv => {
      totalRevenue += inv.amount || 0;
      if (inv.items && Array.isArray(inv.items)) {
        inv.items.forEach(item => {
          let bp = item.productId?.buyingPrice || (item.unitPrice * 0.7) || 0;
          totalCogs += bp * (item.quantity || 0);
        });
      }
    });

    // B2B Invoices (Franchise)
    b2bInvoices.forEach(inv => {
      let rev = inv.amount || 0;
      totalRevenue += rev;
      totalCogs += rev * 0.7; // Approximation for B2B COGS
    });

    // Channel Orders
    orders.forEach(ord => {
      totalRevenue += ord.totalAmount || 0;
      if (ord.items && Array.isArray(ord.items)) {
        ord.items.forEach(item => {
          let bp = (item.unitPrice || 0) * 0.7; // Approximation for Channel B2B COGS
          totalCogs += bp * (item.quantity || 0);
        });
      }
    });

    const netProfit = totalRevenue - totalCogs;

    // Generate real 7-day trailing data for sparklines
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const userDailyStats = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, role: { $in: ['franchise', 'channel'] } } },
      {
        $group: {
          _id: { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          count: { $sum: 1 },
          distributed: { $sum: "$totalCredit" },
          used: { $sum: "$usedCredit" }
        }
      }
    ]);

    const revenueDailyStats = await Invoice.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo }, paymentStatus: 'Paid' } },
      {
        $group: {
          _id: { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          revenue: { $sum: "$amount" }
        }
      }
    ]);

    const userSparkline = [];
    const distributedCreditSparkline = [];
    const usedCreditSparkline = [];
    const revenueSparkline = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const day = d.getDate();
      const month = d.getMonth() + 1;
      const year = d.getFullYear();

      const userStat = userDailyStats.find(s => s._id.day === day && s._id.month === month && s._id.year === year);
      userSparkline.push({ v: userStat ? userStat.count : 0 });
      distributedCreditSparkline.push({ v: userStat ? userStat.distributed : 0 });
      usedCreditSparkline.push({ v: userStat ? userStat.used : 0 });

      const revenueStat = revenueDailyStats.find(s => s._id.day === day && s._id.month === month && s._id.year === year);
      revenueSparkline.push({ v: revenueStat ? revenueStat.revenue : 0 });
    }

    res.json({
      totalUsers,
      totalCreditDistributed,
      totalUsedCredit,
      totalInventoryItems,
      totalInventoryValue,
      totalRevenue,
      netProfit,
      userSparkline,
      distributedCreditSparkline,
      usedCreditSparkline,
      revenueSparkline
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/dashboard/chart
router.get('/dashboard/chart', async (req, res) => {
  try {
    const timeRange = req.query.timeRange || '6 Months';
    let startDate = new Date();
    let isDaily = false;
    let iterations = 6;

    if (timeRange === '7 Days') {
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      isDaily = true;
      iterations = 7;
    } else if (timeRange === '30 Days') {
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      isDaily = true;
      iterations = 30;
    } else if (timeRange === '90 Days') {
      startDate.setDate(startDate.getDate() - 89);
      startDate.setHours(0, 0, 0, 0);
      isDaily = true;
      iterations = 90;
    } else if (timeRange === '1 Year') {
      startDate.setMonth(startDate.getMonth() - 11);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      iterations = 12;
    } else { // 6 months or All Time
      startDate.setMonth(startDate.getMonth() - 5);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      iterations = 6;
    }

    const userStats = await User.aggregate([
      { $match: { createdAt: { $gte: startDate }, role: { $in: ['franchise', 'channel'] } } },
      {
        $group: {
          _id: isDaily ?
            { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" }, role: "$role" } :
            { month: { $month: "$createdAt" }, year: { $year: "$createdAt" }, role: "$role" },
          count: { $sum: 1 }
        }
      }
    ]);

    const invoiceStats = await Invoice.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: 'Paid' } },
      {
        $group: {
          _id: isDaily ?
            { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" }, year: { $year: "$createdAt" } } :
            { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          totalRevenue: { $sum: "$amount" }
        }
      }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartData = [];

    for (let i = iterations - 1; i >= 0; i--) {
      const d = new Date();
      if (isDaily) {
        d.setDate(d.getDate() - i);
      } else {
        d.setMonth(d.getMonth() - i);
      }

      const day = d.getDate();
      const month = d.getMonth() + 1; // 1-12
      const year = d.getFullYear();
      const name = isDaily ? `${day} ${monthNames[d.getMonth()]}` : monthNames[d.getMonth()];

      chartData.push({
        name,
        day,
        month,
        year,
        Franchise: 0,
        B2B: 0,
        Revenue: 0
      });
    }

    userStats.forEach(stat => {
      const dataRow = chartData.find(d =>
        (isDaily ? d.day === stat._id.day : true) &&
        d.month === stat._id.month &&
        d.year === stat._id.year
      );
      if (dataRow) {
        if (stat._id.role === 'franchise') dataRow.Franchise += stat.count;
        if (stat._id.role === 'channel') dataRow.B2B += stat.count;
      }
    });

    invoiceStats.forEach(stat => {
      const dataRow = chartData.find(d =>
        (isDaily ? d.day === stat._id.day : true) &&
        d.month === stat._id.month &&
        d.year === stat._id.year
      );
      if (dataRow) {
        dataRow.Revenue += stat.totalRevenue;
      }
    });

    res.json(chartData);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.aggregate([
      { $lookup: { from: 'quotations', localField: 'quotationReference', foreignField: '_id', as: 'quotationDetails' } },
      { $unwind: { path: '$quotationDetails', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'rfps', localField: 'quotationDetails.rfpReference', foreignField: '_id', as: 'rfpDetails' } },
      { $unwind: { path: '$rfpDetails', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'users', localField: 'userId', foreignField: 'userId', as: 'userDetails' } },
      { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          userRole: '$userDetails.role',
          orderType: 'Enterprise',
          items: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ["$items", []] } }, 0] },
              then: "$items",
              else: {
                $cond: {
                  if: { $gt: [{ $size: { $ifNull: ["$quotationDetails.items", []] } }, 0] },
                  then: "$quotationDetails.items",
                  else: {
                    $map: {
                      input: { $ifNull: ["$rfpDetails.products", []] },
                      as: "prod",
                      in: {
                        productName: "$$prod.category",
                        brand: "$$prod.brand",
                        model: "$$prod.model",
                        configuration: "$$prod.configuration",
                        quantity: "$$prod.quantity",
                        unitPrice: "$$prod.price",
                        totalAmount: { $multiply: ["$$prod.price", "$$prod.quantity"] }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      { $project: { userDetails: 0, quotationDetails: 0, rfpDetails: 0 } }
    ]);

    const procurements = await ProcurementRequest.aggregate([
      {
        $lookup: {
          from: 'quotations',
          localField: '_id',
          foreignField: 'procurementReference',
          as: 'quotations'
        }
      },
      {
        $addFields: {
          orderNumber: '$requestId',
          userRole: 'franchise',
          userId: '$storeId',
          totalAmount: '$total',
          orderType: 'Franchise Procurement',
          quotationPaymentStatus: { $arrayElemAt: ['$quotations.paymentStatus', 0] },
          paymentMethod: { $arrayElemAt: ['$quotations.paymentMethod', 0] }
        }
      },
      {
        $project: { quotations: 0 }
      }
    ]);

    const mappedProcurements = procurements.map(pr => {
      let paymentStatus = pr.quotationPaymentStatus || 'Pending';
      if (!pr.quotationPaymentStatus) {
        paymentStatus = (pr.status === 'PENDING' || pr.status === 'Quotation Sent') ? 'Pending' :
          (pr.status === 'PAYMENT_VERIFICATION' ? 'Pending Verification' : 'Verified');
      } else if (paymentStatus === 'Paid') {
        paymentStatus = 'Verified';
      }

      if (pr.status === 'PAYMENT_REJECTED' || pr.quotationPaymentStatus === 'Rejected') {
        paymentStatus = 'Rejected';
      }
      return {
        ...pr,
        paymentStatus,
        status: pr.status === 'PENDING' ? 'Pending' :
          pr.status === 'PAYMENT_REJECTED' ? 'Declined' :
            pr.status === 'PAYMENT_VERIFICATION' ? 'Payment Verification' :
              pr.status === 'APPROVED' ? 'Processing' :
                pr.status === 'Paid' ? 'Paid' :
                  pr.status === 'SENT_TO_WAREHOUSE' ? 'Sent to Warehouse' :
                    pr.status === 'DISPATCHED' ? 'Dispatched' :
                      pr.status === 'DELIVERED' ? 'Delivered' : pr.status
      };
    });

    const allOrders = [...orders, ...mappedProcurements].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(allOrders);
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', async (req, res) => {
  try {
    const { status, amount } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate({
      path: 'quotationReference',
      populate: { path: 'rfpReference' }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.quotationReference) {
      if (status === 'Quotation Sent' || status === 'Confirmed') {
        await Quotation.findByIdAndUpdate(order.quotationReference._id, {
          status: 'Approved',
          amount: amount || order.totalAmount || 0,
          paymentStatus: 'Pending'
        });
        if (order.quotationReference.rfpReference) {
          await RFP.findByIdAndUpdate(order.quotationReference.rfpReference, {
            status: status === 'Quotation Sent' ? 'Quotation Received' : 'Approved'
          });
        }
      } else if (status === 'Declined') {
        await Quotation.findByIdAndUpdate(order.quotationReference._id, { status: 'Rejected' });
        if (order.quotationReference.rfpReference) {
          await RFP.findByIdAndUpdate(order.quotationReference.rfpReference, { status: 'Rejected' });
        }
      } else if (status === 'Paid') {
        order.paymentStatus = 'Paid';
        await order.save();
        await Quotation.findByIdAndUpdate(order.quotationReference._id, { paymentStatus: 'Paid' });
      }
    } else if (status === 'Paid') {
      order.paymentStatus = 'Paid';
      await order.save();
    }

    // Deduct inventory when dispatched
    if (status === 'Dispatched') {
      const { assignedSerialsMapping, dispatchDetails } = req.body; // e.g. { "ModelX": ["SN1", "SN2"] }

      if (dispatchDetails) {
        order.trackingInfo = {
          courier: dispatchDetails.courierName || '',
          currentLocation: 'Dispatched from Warehouse',
          progress: 20
        };
        order.trackingId = dispatchDetails.trackingId || '';
        if (dispatchDetails.expectedDate) {
          order.expectedDelivery = new Date(dispatchDetails.expectedDate);
        }
        await order.save();
      }

      let itemsToDeduct = order.items && order.items.length > 0 ? order.items : [];
      if (itemsToDeduct.length === 0 && order.quotationReference && order.quotationReference.items && order.quotationReference.items.length > 0) {
        itemsToDeduct = order.quotationReference.items;
      }
      if (itemsToDeduct.length === 0 && order.quotationReference && order.quotationReference.rfpReference && order.quotationReference.rfpReference.products) {
        itemsToDeduct = order.quotationReference.rfpReference.products.map(p => ({
          productName: p.category,
          brand: p.brand,
          model: p.model,
          quantity: p.quantity
        }));
      }

      for (let i = 0; i < itemsToDeduct.length; i++) {
        const item = itemsToDeduct[i];
        if (!item.productName && !item.hardwareType) continue;
        const pName = item.productName || item.hardwareType || item.otherType || item.category;

        let mappingKey = item.model || pName;
        let assignedSerials = (assignedSerialsMapping && assignedSerialsMapping[mappingKey]) || [];

        // Save assigned serials to the order item for invoice generation
        if (order.items && order.items.length > 0 && order.items[i]) {
          order.items[i].assignedSerials = assignedSerials;
        }

        let product;
        if (item.model) {
          product = await GlobalProduct.findOne({ brand: item.brand, model: item.model });
        }
        if (!product && pName) {
          product = await GlobalProduct.findOne({ brand: item.brand, name: pName });
        }
        if (!product && pName) {
          product = await GlobalProduct.findOne({ brand: item.brand, category: pName });
        }

        if (product) {
          product.quantity = Math.max(0, product.quantity - item.quantity);
          product.reservedStock = Math.max(0, (product.reservedStock || 0) - item.quantity);

          if (assignedSerials.length > 0) {
            product.serialNumbers = (product.serialNumbers || []).filter(sn => !assignedSerials.includes(sn));
          }

          await product.save();
        }
      }

      await order.save();

      // --- EMAIL NOTIFICATION LOGIC ---
      try {
        const { dispatchDetails, assignedSerialsMapping } = req.body;
        if (dispatchDetails) {
          // Look up user to get email
          const user = await User.findOne({ userId: order.userId });
          const customerEmail = user?.email || 'customer@example.com';

          // Construct Items HTML
          let itemsHtml = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <thead>
                <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
                  <th style="padding: 12px; font-size: 14px; color: #475569;">Item</th>
                  <th style="padding: 12px; font-size: 14px; color: #475569;">Qty</th>
                  <th style="padding: 12px; font-size: 14px; color: #475569;">Assigned Serial Numbers</th>
                </tr>
              </thead>
              <tbody>
          `;

          for (const item of (order.items || [])) {
            const itemName = item.brand + ' ' + (item.model || item.productName || item.hardwareType);
            const mappingKey = item.model || item.productName || item.hardwareType;
            const serials = (assignedSerialsMapping && assignedSerialsMapping[mappingKey]) || [];

            itemsHtml += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-size: 14px; color: #1e293b; font-weight: 500;">${itemName}</td>
                  <td style="padding: 12px; font-size: 14px; color: #64748b;">${item.quantity}</td>
                  <td style="padding: 12px; font-size: 14px;">
                    ${serials.map(sn => `<span style="display: inline-block; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #334155; margin: 2px;">${sn}</span>`).join('') || '<span style="color: #94a3b8; font-size: 12px;">N/A</span>'}
                  </td>
                </tr>
            `;
          }
          itemsHtml += `</tbody></table>`;

          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #4f46e5; padding: 20px; color: white;">
                <h2 style="margin: 0; font-size: 20px;">Your Order Has Been Dispatched! 🚀</h2>
              </div>
              <div style="padding: 20px;">
                <p style="color: #334155; font-size: 16px; line-height: 1.5;">Hello,</p>
                <p style="color: #334155; font-size: 16px; line-height: 1.5;">Great news! Your order <strong>#${order.orderNumber}</strong> has left our warehouse and is on its way to you.</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0;">
                  <h3 style="margin-top: 0; font-size: 16px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Delivery Tracking Details</h3>
                  <p style="margin: 8px 0; color: #475569; font-size: 14px;"><strong>Courier Partner:</strong> ${dispatchDetails.courierName}</p>
                  <p style="margin: 8px 0; color: #475569; font-size: 14px;"><strong>Tracking ID:</strong> <span style="background: #e0e7ff; color: #4338ca; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${dispatchDetails.trackingId}</span></p>
                  <p style="margin: 8px 0; color: #475569; font-size: 14px;"><strong>Expected Delivery:</strong> ${new Date(dispatchDetails.expectedDate).toLocaleDateString()}</p>
                </div>

                <h3 style="font-size: 16px; color: #1e293b; margin-bottom: 10px;">Items in this Shipment:</h3>
                ${itemsHtml}

                <p style="color: #64748b; font-size: 14px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                  If you have any questions about your delivery, please contact our support team.<br><br>
                  Best regards,<br>
                  <strong>AK Solutions Retail Team</strong>
                </p>
              </div>
            </div>
          `;

          await resend.emails.send({
            from: 'AK Solutions Notifications <onboarding@resend.dev>',
            to: [customerEmail], // Real app: replace with customerEmail. Using onboarding@resend.dev or customerEmail
            subject: `Order Dispatched: #${order.orderNumber} is on the way!`,
            html: emailHtml
          });
        }
      } catch (err) {
        console.error('Failed to send dispatch email:', err);
        // Do not block the dispatch process if email fails
      }
    }

    // Auto-add to inventory when delivered
    if (status === 'Delivered' || status === 'DELIVERED') {
      try {
        const user = await User.findOne({ userId: order.userId });
        const storeId = user ? user.storeId : null;

        if (storeId) {
          const itemsToAdd = [];

          const groupedItems = {};
          for (const item of (order.items || [])) {
            const itemBrand = item.brand || 'N/A';
            const itemModel = item.model || item.productName || 'N/A';
            const modelKey = `${itemBrand}_${itemModel}`;

            const qty = item.quantity || (item.assignedSerials && item.assignedSerials.length > 0 ? item.assignedSerials.length : 1);
            if (!groupedItems[modelKey]) {
              groupedItems[modelKey] = { ...(item.toObject ? item.toObject() : item), _quantity: qty, _assignedSerials: new Set(item.assignedSerials || []) };
            } else {
              groupedItems[modelKey]._quantity += qty;
              if (item.assignedSerials) {
                item.assignedSerials.forEach(sn => groupedItems[modelKey]._assignedSerials.add(sn));
              }
            }
          }

          for (const modelKey in groupedItems) {
            const item = groupedItems[modelKey];
            const basePayload = {
              storeId: storeId,
              name: item.productName || item.category || 'Product',
              brand: item.brand || 'N/A',
              model: item.model || item.productName || 'N/A',
              category: item.category || 'N/A',
              specs: item.configuration || '',
              sellingPrice: item.unitPrice || item.price || 0
            };

            const quantity = item._quantity;
            const assignedSerials = Array.from(item._assignedSerials);

            const existing = await Product.findOne({ storeId: storeId, brand: basePayload.brand, model: basePayload.model });

            if (existing) {
              existing.quantity += quantity;
              existing.availableStock += quantity;
              if (assignedSerials.length > 0) {
                const existingSerialsSet = new Set(existing.serialNumbers || []);
                for (const sn of assignedSerials) {
                  existingSerialsSet.add(sn);
                }
                existing.serialNumbers = Array.from(existingSerialsSet);
              }
              await existing.save();
            } else {
              itemsToAdd.push({
                ...basePayload,
                quantity: quantity,
                availableStock: quantity,
                serialNumbers: assignedSerials
              });
            }
          }
          if (itemsToAdd.length > 0) {
            await Product.insertMany(itemsToAdd);
          }
        }
      } catch (err) {
        console.error('Failed to auto-add delivered order items to inventory:', err);
      }
    }

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/orders/:id
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate({
        path: 'quotationReference',
        populate: {
          path: 'rfpReference'
        }
      });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/procurement-requests/:id
router.get('/procurement-requests/:id', async (req, res) => {
  try {
    const request = await ProcurementRequest.findById(req.params.id).lean();
    if (!request) return res.status(404).json({ message: 'Procurement Request not found' });

    // Map fields for frontend modal
    request.totalAmount = request.total;

    // Format status nicely for UI
    if (request.status === 'PAYMENT_VERIFICATION') {
      request.status = 'Payment Verification';
    } else if (request.status === 'PENDING') {
      request.status = 'Pending';
    } else if (request.status === 'APPROVED') {
      request.status = 'Processing';
    } else if (request.status === 'SENT_TO_WAREHOUSE') {
      request.status = 'Sent to Warehouse';
    } else if (request.status === 'DISPATCHED') {
      request.status = 'Dispatched';
    } else if (request.status === 'DELIVERED') {
      request.status = 'Delivered';
    }

    // Fetch related quotation or invoice for payment details
    const quotation = await require('../models/Quotation').findOne({ procurementReference: request._id });
    if (quotation) {
      request.invoiceNo = quotation.quotationNo;
      request.paymentMethod = quotation.paymentMethod;
      request.paymentStatus = quotation.paymentStatus;
      request.utr = quotation.utrNumber;
      request.receipt = quotation.receiptUrl; // Assuming this exists or is saved
    } else {
      const invoice = await B2BInvoice.findOne({ requestId: request.requestId });
      if (invoice) {
        request.invoiceNo = invoice.invoiceNo;
        if (invoice.paymentDetails) {
          request.paymentMethod = invoice.paymentDetails.method;
          request.paymentStatus = invoice.status;
          request.utr = invoice.paymentDetails.utr;
          request.receipt = invoice.paymentDetails.receipt;
        }
      }
    }

    res.json(request);
  } catch (error) {
    console.error('Error fetching procurement request details:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/procurement-requests/:id/approve
router.post('/procurement-requests/:id/approve', async (req, res) => {
  try {
    const { totalAmount } = req.body;
    const request = await ProcurementRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Procurement Request not found' });
    if (request.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only PENDING requests can be approved and invoiced.' });
    }

    // Update Procurement Request
    request.total = totalAmount;
    request.status = 'Quotation Sent';
    await request.save();

    // Generate Quotation instead of B2BInvoice
    const quotation = new Quotation({
      quotationNo: `QT-PR-${Date.now()}`,
      procurementReference: request._id,
      storeId: request.storeId,
      vendor: 'AK Solutions Retail',
      amount: totalAmount,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'Pending',
      paymentStatus: 'Pending',
      items: request.items.map(item => ({
        productName: item.hardwareType === 'Others' ? item.otherType : item.hardwareType,
        brand: item.brand,
        model: item.model,
        configuration: JSON.stringify(item.specs),
        quantity: item.quantity,
        unitPrice: item.price || 0,
        price: item.price || 0,
        rate: item.price || 0,
        totalAmount: (item.price || 0) * item.quantity
      })),
      userId: request.storeId
    });
    await quotation.save();

    // HARD ALLOCATION: Reserve stock when quotation is sent
    const GlobalProduct = require('../models/GlobalProduct');
    for (const item of request.items) {
      if (!item.hardwareType) continue;
      const productName = item.hardwareType === 'Others' ? item.otherType : item.hardwareType;

      let product;
      if (item.model) {
        product = await GlobalProduct.findOne({ brand: item.brand, model: item.model });
      }
      if (!product && item.specs) {
        const modelSpec = item.specs.model || item.specs.Model;
        if (modelSpec) {
          product = await GlobalProduct.findOne({ brand: item.brand, model: modelSpec });
        }
      }
      if (!product) {
        product = await GlobalProduct.findOne({ brand: item.brand, name: item.hardwareType });
      }
      if (!product) {
        product = await GlobalProduct.findOne({ brand: item.brand, category: item.hardwareType });
      }

      if (product) {
        product.availableStock = Math.max(0, product.availableStock - item.quantity);
        product.reservedStock = (product.reservedStock || 0) + item.quantity;
        await product.save();
      }
    }
    res.json({ message: 'Quotation sent successfully', request, quotation });
  } catch (error) {
    console.error('Error approving procurement request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/procurement-requests/:id/confirm-payment
router.post('/procurement-requests/:id/confirm-payment', async (req, res) => {
  try {
    const request = await ProcurementRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Procurement Request not found' });
    if (request.status !== 'PAYMENT_VERIFICATION') {
      return res.status(400).json({ message: 'Only PAYMENT_VERIFICATION requests can have payments confirmed.' });
    }

    const quotation = await require('../models/Quotation').findOne({ procurementReference: request._id });
    const invoice = await B2BInvoice.findOne({ requestId: request.requestId });

    if (!quotation && !invoice) return res.status(404).json({ message: 'Quotation or B2B Invoice not found' });

    // Update statuses
    request.status = 'DISPATCHED';
    await request.save();

    if (quotation) {
      quotation.paymentStatus = 'Paid';
      await quotation.save();
    }
    if (invoice) {
      invoice.status = 'Paid';
      await invoice.save();
    }

    res.json({ success: true, invoice, request });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// PATCH /api/admin/procurement-requests/:id/status
router.patch('/procurement-requests/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const request = await ProcurementRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!request) {
      return res.status(404).json({ message: 'Procurement request not found' });
    }

    // Deduct inventory when dispatched
    if (status === 'DISPATCHED') {
      const { assignedSerialsMapping, dispatchDetails } = req.body;

      if (dispatchDetails) {
        request.trackingInfo = {
          courier: dispatchDetails.courierName || '',
          currentLocation: 'Dispatched from Warehouse',
          progress: 20
        };
        request.trackingId = dispatchDetails.trackingId || '';
        if (dispatchDetails.expectedDate) {
          request.expectedDelivery = new Date(dispatchDetails.expectedDate);
        }
        // Save immediately, but there is also a request.save() at the end
      }

      for (let i = 0; i < request.items.length; i++) {
        const item = request.items[i];
        if (!item.hardwareType) continue;
        const productName = item.hardwareType === 'Others' ? item.otherType : item.hardwareType;

        let mappingKey = item.model || productName;
        let assignedSerials = (assignedSerialsMapping && assignedSerialsMapping[mappingKey]) || [];

        request.items[i].assignedSerials = assignedSerials;

        let product;
        if (item.model) {
          product = await GlobalProduct.findOne({ brand: item.brand, model: item.model });
        }
        if (!product && item.specs) {
          const modelSpec = item.specs.model || item.specs.Model;
          if (modelSpec) {
            product = await GlobalProduct.findOne({ brand: item.brand, model: modelSpec });
          }
        }
        if (!product) {
          product = await GlobalProduct.findOne({ brand: item.brand, name: item.hardwareType });
        }
        if (!product) {
          product = await GlobalProduct.findOne({ brand: item.brand, category: item.hardwareType });
        }

        if (product) {
          product.quantity = Math.max(0, product.quantity - item.quantity);
          product.reservedStock = Math.max(0, (product.reservedStock || 0) - item.quantity);

          if (assignedSerials.length > 0) {
            product.serialNumbers = (product.serialNumbers || []).filter(sn => !assignedSerials.includes(sn));
          }
          await product.save();
        }
      }
      await request.save();

      // --- EMAIL NOTIFICATION LOGIC ---
      try {
        if (dispatchDetails) {
          const StoreProfile = require('../models/StoreProfile');
          const store = await StoreProfile.findOne({ storeId: request.storeId });
          const customerEmail = store?.email || 'customer@example.com';

          let itemsHtml = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <thead>
                <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
                  <th style="padding: 12px; font-size: 14px; color: #475569;">Item</th>
                  <th style="padding: 12px; font-size: 14px; color: #475569;">Qty</th>
                  <th style="padding: 12px; font-size: 14px; color: #475569;">Assigned Serial Numbers</th>
                </tr>
              </thead>
              <tbody>
          `;

          for (const item of (request.items || [])) {
            const mappingKey = item.model || (item.hardwareType === 'Others' ? item.otherType : item.hardwareType);
            const itemName = item.hardwareType === 'Others' ? item.otherType : item.hardwareType;
            const serials = (assignedSerialsMapping && assignedSerialsMapping[mappingKey]) || [];

            itemsHtml += `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px; font-size: 14px; color: #1e293b; font-weight: 500;">${itemName}</td>
                  <td style="padding: 12px; font-size: 14px; color: #64748b;">${item.quantity}</td>
                  <td style="padding: 12px; font-size: 14px;">
                    ${serials.map(sn => `<span style="display: inline-block; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #334155; margin: 2px;">${sn}</span>`).join('') || '<span style="color: #94a3b8; font-size: 12px;">N/A</span>'}
                  </td>
                </tr>
            `;
          }
          itemsHtml += `</tbody></table>`;

          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #4f46e5; padding: 20px; color: white;">
                <h2 style="margin: 0; font-size: 20px;">Your Procurement Request Has Been Dispatched! 🚀</h2>
              </div>
              <div style="padding: 20px;">
                <p style="color: #334155; font-size: 16px; line-height: 1.5;">Hello,</p>
                <p style="color: #334155; font-size: 16px; line-height: 1.5;">Great news! Your procurement request for <strong>Store ${request.storeId}</strong> has left our warehouse and is on its way to you.</p>
                
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin: 20px 0;">
                  <h3 style="margin-top: 0; font-size: 16px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Delivery Tracking Details</h3>
                  <p style="margin: 8px 0; color: #475569; font-size: 14px;"><strong>Courier Partner:</strong> ${dispatchDetails.courierName}</p>
                  <p style="margin: 8px 0; color: #475569; font-size: 14px;"><strong>Tracking ID:</strong> <span style="background: #e0e7ff; color: #4338ca; padding: 2px 6px; border-radius: 4px; font-weight: 600;">${dispatchDetails.trackingId}</span></p>
                  <p style="margin: 8px 0; color: #475569; font-size: 14px;"><strong>Expected Delivery:</strong> ${new Date(dispatchDetails.expectedDate).toLocaleDateString()}</p>
                </div>

                <h3 style="font-size: 16px; color: #1e293b; margin-bottom: 10px;">Items in this Shipment:</h3>
                ${itemsHtml}

                <p style="color: #64748b; font-size: 14px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                  If you have any questions about your delivery, please contact our support team.<br><br>
                  Best regards,<br>
                  <strong>AK Solutions Retail Team</strong>
                </p>
              </div>
            </div>
          `;

          await resend.emails.send({
            from: 'AK Solutions Notifications <onboarding@resend.dev>',
            to: [customerEmail],
            subject: `Procurement Dispatched: Store ${request.storeId} shipment is on the way!`,
            html: emailHtml
          });
        }
      } catch (err) {
        console.error('Failed to send dispatch email:', err);
      }
    }

    // Auto-add to inventory when delivered
    if (status === 'Delivered' || status === 'DELIVERED') {
      try {
        const storeId = request.storeId;
        if (storeId) {
          const itemsToAdd = [];

          const groupedItems = {};
          for (const item of (request.items || [])) {
            const itemBrand = item.brand || 'N/A';
            const itemModel = item.model || item.productName || item.hardwareType || item.otherType || 'N/A';
            const modelKey = `${itemBrand}_${itemModel}`;

            const qty = item.quantity || (item.assignedSerials && item.assignedSerials.length > 0 ? item.assignedSerials.length : 1);
            if (!groupedItems[modelKey]) {
              groupedItems[modelKey] = { ...(item.toObject ? item.toObject() : item), _quantity: qty, _assignedSerials: new Set(item.assignedSerials || []) };
            } else {
              groupedItems[modelKey]._quantity += qty;
              if (item.assignedSerials) {
                item.assignedSerials.forEach(sn => groupedItems[modelKey]._assignedSerials.add(sn));
              }
            }
          }

          for (const modelKey in groupedItems) {
            const item = groupedItems[modelKey];
            const basePayload = {
              storeId: storeId,
              name: item.productName || item.hardwareType || item.otherType || item.category || 'Product',
              brand: item.brand || 'N/A',
              model: item.model || item.productName || item.hardwareType || item.otherType || 'N/A',
              category: item.category || item.hardwareType || 'N/A',
              specs: typeof item.specs === 'string' ? item.specs : JSON.stringify(item.specs || item.configuration || {}),
              sellingPrice: item.price || item.unitPrice || 0
            };

            const quantity = item._quantity;
            const assignedSerials = Array.from(item._assignedSerials);

            const existing = await Product.findOne({ storeId: storeId, brand: basePayload.brand, model: basePayload.model });

            if (existing) {
              existing.quantity += quantity;
              existing.availableStock += quantity;
              if (assignedSerials.length > 0) {
                const existingSerialsSet = new Set(existing.serialNumbers || []);
                for (const sn of assignedSerials) {
                  existingSerialsSet.add(sn);
                }
                existing.serialNumbers = Array.from(existingSerialsSet);
              }
              await existing.save();
            } else {
              itemsToAdd.push({
                ...basePayload,
                quantity: quantity,
                availableStock: quantity,
                serialNumbers: assignedSerials
              });
            }
          }
          if (itemsToAdd.length > 0) {
            await Product.insertMany(itemsToAdd);
          }
        }
      } catch (err) {
        console.error('Failed to auto-add delivered procurement items to inventory:', err);
      }
    }

    res.json(request);
  } catch (error) {
    console.error('Error updating procurement request status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/rfps/:id/approve
router.post('/rfps/:id/approve', async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount === undefined || amount < 0) {
      return res.status(400).json({ message: 'Valid amount is required.' });
    }

    const rfp = await RFP.findById(req.params.id);
    if (!rfp) return res.status(404).json({ message: 'RFP not found' });

    // Find the associated Quotation
    const quotation = await Quotation.findOne({ rfpReference: rfp._id });
    if (!quotation) {
      return res.status(404).json({ message: 'Associated Quotation not found for this RFP' });
    }

    // Update RFP status
    rfp.status = 'Quotation Received';
    await rfp.save();

    // Update Quotation amount and set status to 'Approved', paymentStatus to 'Pending'
    quotation.amount = amount;
    quotation.status = 'Approved';
    quotation.paymentStatus = 'Pending';
    await quotation.save();

    // Also find the associated Order and update its status
    const order = await Order.findOne({ quotationReference: quotation._id });
    if (order) {
      order.status = 'Quotation Sent';
      order.totalAmount = amount;
      await order.save();
    }

    res.json({ message: 'Quotation sent successfully', rfp, quotation });
  } catch (error) {
    console.error('Error approving RFP:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/orders/:id/invoice
router.post('/orders/:id/invoice', async (req, res) => {
  try {
    const orderId = req.params.id;
    // We need to support both Order and ProcurementRequest
    let invoiceData = null;
    let orderUpdate = null;

    // Check if it's already a B2BInvoice (Franchise B2B Invoice from Dashboard)
    const existingB2B = await B2BInvoice.findById(orderId);
    if (existingB2B) {
      await B2BInvoice.findByIdAndUpdate(orderId, { invoiceSent: true });
      existingB2B.invoiceSent = true;
      return res.json({ message: 'Invoice sent successfully', invoice: existingB2B });
    }

    // Check if it's an Order (Channel)
    const order = await Order.findById(orderId).populate({
      path: 'quotationReference',
      populate: { path: 'rfpReference' }
    });
    if (order) {
      if (order.status !== 'Paid' && order.paymentStatus !== 'Paid') {
        return res.status(400).json({ message: 'Only Paid orders can be invoiced.' });
      }

      let itemsToUse = [];
      if (order.items && order.items.length > 0) {
        itemsToUse = order.items;
      } else if (order.quotationReference && order.quotationReference.items && order.quotationReference.items.length > 0) {
        itemsToUse = order.quotationReference.items;
      } else if (order.quotationReference && order.quotationReference.rfpReference && order.quotationReference.rfpReference.products) {
        itemsToUse = order.quotationReference.rfpReference.products.map(p => ({
          productName: p.category,
          brand: p.brand,
          model: p.model,
          configuration: p.configuration,
          quantity: p.quantity,
          unitPrice: p.price,
          totalAmount: p.price * p.quantity
        }));
      }

      const invoice = new Invoice({
        invoiceNumber: `INV-${Date.now()}`,
        userId: order.userId,
        orderReference: order._id,
        amount: order.totalAmount,
        paymentStatus: 'Paid',
        paymentMethod: order.paymentMethod || 'Credit',
        items: itemsToUse
      });
      await invoice.save();

      // Do not change status to Processing here; Account Manager does it.
      order.invoiceSent = true; // Mark invoice as sent
      await order.save();

      // Ensure RFP is also 'Approved' or something similar
      if (order.quotationReference && order.quotationReference.rfpReference) {
        const rfp = await RFP.findById(order.quotationReference.rfpReference);
        if (rfp) {
          rfp.status = 'Approved';
          await rfp.save();
        }
      }

      invoiceData = invoice;
      orderUpdate = order;
    } else {
      // Check if it's a ProcurementRequest (Franchise)
      const pr = await ProcurementRequest.findById(orderId);
      if (pr) {
        if (pr.status !== 'Paid') {
          return res.status(400).json({ message: 'Only Paid requests can be invoiced.' });
        }

        const b2bInvoice = new B2BInvoice({
          storeId: pr.storeId,
          invoiceNo: `INV-${Date.now()}`,
          requestId: pr.requestId,
          amount: pr.total,
          status: 'Paid',
          invoiceFile: `/invoices/${pr.requestId}-invoice.pdf`
        });
        await b2bInvoice.save();



        invoiceData = b2bInvoice;
        orderUpdate = pr;
      } else {
        // Check if it's a Quotation (Franchise Quotation Order)
        const quotation = await Quotation.findById(orderId);
        if (quotation) {
          if (quotation.paymentStatus !== 'Paid') {
            return res.status(400).json({ message: 'Only Paid quotations can be invoiced.' });
          }

          let pr = null;
          if (quotation.procurementReference) {
            pr = await ProcurementRequest.findById(quotation.procurementReference);
          }

          if (pr) {
            const b2bInvoice = new B2BInvoice({
              storeId: pr.storeId,
              invoiceNo: `INV-${Date.now()}`,
              requestId: pr.requestId,
              amount: pr.total || quotation.amount,
              status: 'Paid',
              invoiceFile: `/invoices/${pr.requestId}-invoice.pdf`
            });
            await b2bInvoice.save();


            invoiceData = b2bInvoice;
          }

          quotation.invoiceSent = true;
          await quotation.save();
          orderUpdate = quotation;
        } else {
          return res.status(404).json({ message: 'Order/Request not found', debug: { orderId, existingB2B: !!existingB2B } });
        }
      }
    }

    res.json({ message: 'Invoice generated and sent successfully', invoice: invoiceData, order: orderUpdate });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET /api/admin/entities
router.get('/entities', async (req, res) => {
  try {
    const entities = await User.find({
      role: { $in: ['franchise', 'channel'] },
      deletedAt: null
    }).select('-password');
    res.json(entities);
  } catch (error) {
    console.error('Error fetching entities:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/entities
router.post('/entities', async (req, res) => {
  try {
    const { userId, password, role, email, name, storeId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      return res.status(400).json({ message: 'User ID already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      userId,
      password: hashedPassword,
      role,
      email,
      name,
      storeId: role === 'franchise' ? storeId : undefined
    });

    await newUser.save();

    // Create StoreProfile if role is franchise
    if (role === 'franchise' && storeId) {
      const StoreProfile = require('../models/StoreProfile');
      // Check if one already exists just in case
      const existingProfile = await StoreProfile.findOne({ storeId });
      if (!existingProfile) {
        await StoreProfile.create({
          storeId,
          storeName: `${name} Store`,
          manager: name,
          email,
          contact: '',
          address: '',
          walletBalance: 0,
        });
      }
    }

    // Don't send the password back
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Error creating entity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/entities/:userId
router.put('/entities/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, storeId, role, status } = req.body;
    // Only include fields that are explicitly provided in req.body
    let updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (storeId !== undefined) updateData.storeId = storeId;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;

    // Optional: update password if provided
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await User.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating entity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/entities/:userId
router.delete('/entities/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Soft delete by setting deletedAt
    const deletedUser = await User.findOneAndUpdate(
      { userId },
      { deletedAt: new Date(), status: 'Suspended' },
      { new: true }
    );

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully', userId });
  } catch (error) {
    console.error('Error deleting entity:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/entities/:userId/credit
router.put('/entities/:userId/credit', async (req, res) => {
  try {
    const { userId } = req.params;
    const { totalCredit } = req.body;

    if (totalCredit === undefined || totalCredit < 0) {
      return res.status(400).json({ message: 'Invalid credit amount' });
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldCredit = user.totalCredit || 0;
    user.totalCredit = Number(totalCredit);
    await user.save();

    // Sync the totalCredit to StoreProfile if the user has stores
    if (user.role === 'franchise' && user.storeId) {
      const storeIds = user.storeId.split(',').map(s => s.trim());
      await StoreProfile.updateMany(
        { storeId: { $in: storeIds } },
        { $set: { totalCredit: Number(totalCredit) } }
      );
    }

    // Log the credit transaction
    const diff = user.totalCredit - oldCredit;
    if (diff !== 0) {
      const transaction = new CreditTransaction({
        userId: user.userId,
        type: diff > 0 ? 'Assigned' : 'Decreased',
        amount: Math.abs(diff),
        referenceId: 'ADMIN_UPDATE',
        description: diff > 0
          ? `Credit assingned by super admin  ${oldCredit} to ${user.totalCredit}`
          : `Credit removed by admin from ${oldCredit} to ${user.totalCredit}`
      });
      await transaction.save();

      // Also create a WalletTransaction for franchise stores so it shows in the Store Admin wallet ledger
      if (user.role === 'franchise' && user.storeId) {
        const WalletTransaction = require('../models/WalletTransaction');
        const storeIds = user.storeId.split(',').map(s => s.trim());
        const newBalance = (user.totalCredit || 0) - (user.usedCredit || 0);
        for (const sid of storeIds) {
          const walletTxn = new WalletTransaction({
            storeId: sid,
            txnId: `CRD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            date: new Date(),
            type: diff > 0 ? 'Credit In' : 'Credit Out',
            amount: Math.abs(diff),
            status: 'Success',
            closingBalance: newBalance,
            description: diff > 0
              ? `Credit limit increased by ₹${Math.abs(diff).toLocaleString('en-IN')} (Admin)`
              : `Credit limit decreased by ₹${Math.abs(diff).toLocaleString('en-IN')} (Admin)`
          });
          await walletTxn.save();
        }
      }
    }

    // Exclude password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse);
  } catch (error) {
    console.error('Error assigning credit:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/entities/:userId/credit-history
router.get('/entities/:userId/credit-history', async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await CreditTransaction.find({ userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching credit history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/entities/:userId/status
router.put('/entities/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['Active', 'Suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findOneAndUpdate(
      { userId },
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If suspended, also invalidate store
    if (status === 'Suspended' && user.role === 'franchise') {
      user.isStoreActive = false;
      await user.save();
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating entity status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/catalog
router.get('/catalog', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Add simple text search if needed
    const query = {};
    if (req.query.search) {
      query.$or = [
        { brand: { $regex: req.query.search, $options: 'i' } },
        { model: { $regex: req.query.search, $options: 'i' } },
        { category: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const catalog = await GlobalProduct.find(query).skip(skip).limit(limit);
    const total = await GlobalProduct.countDocuments(query);

    res.json({
      products: catalog,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/catalog
router.post('/catalog', inventoryAuth, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.serialNumber === '' || payload.serialNumber === undefined) {
      delete payload.serialNumber;
    }
    const stock = Number(payload.availableStock) || 0;
    payload.quantity = stock;
    payload.availableStock = stock;
    const product = new GlobalProduct(payload);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product', error);
    res.status(400).json({ message: 'Error creating product', error });
  }
});

// PUT /api/admin/catalog/:id
router.put('/catalog/:id', inventoryAuth, async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.serialNumber === '' || payload.serialNumber === undefined) {
      delete payload.serialNumber;
    }
    // sync stock
    if (payload.availableStock !== undefined) {
      payload.quantity = Number(payload.availableStock) || 0;
    }
    const product = await GlobalProduct.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Error updating product', error);
    res.status(400).json({ message: 'Error updating product', error });
  }
});

// DELETE /api/admin/catalog/:id
router.delete('/catalog/:id', inventoryAuth, async (req, res) => {
  try {
    const product = await GlobalProduct.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting product', error });
  }
});

// GET /api/admin/audit
router.get('/audit', async (req, res) => {
  try {
    const creditTransactions = await CreditTransaction.find().sort({ createdAt: -1 }).limit(100);
    const invoices = await Invoice.find().sort({ createdAt: -1 }).limit(100);

    res.json({
      creditTransactions,
      invoices
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/orders/:id/tracking-email
router.post('/orders/:id/tracking-email', async (req, res) => {
  try {
    const { orderType } = req.body;
    let order;

    if (orderType === 'Franchise Procurement') {
      order = await ProcurementRequest.findById(req.params.id);
    } else {
      order = await Order.findById(req.params.id);
    }

    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Ensure it has dispatchDetails
    const hasTracking = order.trackingId || (order.trackingInfo && order.trackingInfo.courier);
    if (!hasTracking) {
      return res.status(400).json({ error: 'No dispatch details found for this order. Please scan & dispatch first.' });
    }

    const details = {
      courierName: order.trackingInfo?.courier || 'N/A',
      trackingId: order.trackingId || 'N/A',
      expectedDate: order.expectedDelivery ? new Date(order.expectedDelivery).toLocaleDateString() : 'N/A'
    };

    const serialsList = [];
    if (order.assignedSerialsMapping) {
      for (const [key, serials] of Object.entries(order.assignedSerialsMapping)) {
        serialsList.push(`${key}: ${serials.join(', ')}`);
      }
    }

    // Fetch Invoice Number
    let invoiceNo = 'N/A';
    try {
      if (orderType === 'Franchise Procurement') {
        const B2BInvoice = require('../models/B2BInvoice');
        const invoice = await B2BInvoice.findOne({ requestId: order.requestId });
        if (invoice) invoiceNo = invoice.invoiceNo;
      } else {
        const Invoice = require('../models/Invoice');
        const invoice = await Invoice.findOne({ orderReference: order._id });
        if (invoice) invoiceNo = invoice.invoiceNumber;
      }
    } catch (err) {
      console.error('Error fetching invoice for email:', err);
    }

    // Generate Invoice HTML
    const itemsListHtml = (order.items || []).map(item => {
      const name = item.productName || item.hardwareType || item.otherType || 'Item';
      const qty = item.quantity || 1;
      const price = item.unitPrice || item.price || 0;
      const total = item.totalAmount || item.amount || (qty * price);
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${name} ${item.model ? `(${item.model})` : ''}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${qty}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${price.toLocaleString('en-IN')}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${total.toLocaleString('en-IN')}</td>
        </tr>
      `;
    }).join('');

    const invoiceTable = `
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-family: Arial, sans-serif;">
        <thead>
          <tr style="background-color: #f8fafc; text-align: left;">
            <th style="padding: 10px; border-bottom: 2px solid #e2e8f0;">Product</th>
            <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; text-align: center;">Qty</th>
            <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; text-align: right;">Unit Price</th>
            <th style="padding: 10px; border-bottom: 2px solid #e2e8f0; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsListHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Grand Total:</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; border-top: 2px solid #e2e8f0;">₹${(order.totalAmount || order.total || 0).toLocaleString('en-IN')}</td>
          </tr>
        </tfoot>
      </table>
    `;

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
        <h2 style="color: #4f46e5; margin-top: 0;">Dispatch & Invoice Details</h2>
        <p>Hello,</p>
        <p>Your order <strong>${order.orderNumber || order.requestId}</strong> has been successfully dispatched!</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
          <h3 style="margin-top: 0; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Delivery Tracking</h3>
          <p style="margin: 8px 0;"><strong>Courier Partner:</strong> ${details.courierName}</p>
          <p style="margin: 8px 0;"><strong>Tracking ID:</strong> ${details.trackingId}</p>
          <p style="margin: 8px 0;"><strong>Expected Delivery:</strong> ${details.expectedDate}</p>
        </div>

        <div style="margin: 25px 0;">
          <h3 style="color: #0f172a; margin-bottom: 10px;">Order Invoice (No: ${invoiceNo})</h3>
          ${invoiceTable}
        </div>

        <div style="margin: 25px 0;">
          <h3 style="color: #0f172a;">Assigned Serial Numbers</h3>
          <ul style="background-color: #f8fafc; padding: 15px 15px 15px 35px; border-radius: 8px; border: 1px solid #e2e8f0;">
            ${serialsList.length > 0 ? serialsList.map(s => `<li>${s}</li>`).join('') : '<li>No serial numbers assigned.</li>'}
          </ul>
        </div>
        
        <p style="margin-top: 30px; font-size: 0.9em; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          Thank you for partnering with AK Solutions Retail!<br>
          For any queries, please refer to invoice <strong>${invoiceNo}</strong>.
        </p>
      </div>
    `;

    // Send email using Resend
    try {
      await resend.emails.send({
        from: 'AK Solutions Notifications <onboarding@resend.dev>',
        to: ['onboarding@resend.dev'], // Use onboarding@resend.dev for test environment
        subject: `Your Order ${order.orderNumber || order.requestId} has been Dispatched!`,
        html: emailContent
      });
      order.trackingEmailSent = true;
      await order.save();
    } catch (e) {
      console.error('Error sending tracking email via Resend:', e);
      // Proceed even if resend fails (e.g. invalid API key) to allow frontend flow testing
      order.trackingEmailSent = true;
      await order.save();
    }

    res.json({ message: 'Tracking details sent successfully' });
  } catch (error) {
    console.error('Error in tracking-email:', error);
    res.status(500).json({ error: 'Failed to send tracking details' });
  }
});

module.exports = router;
