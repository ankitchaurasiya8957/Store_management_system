const express = require('express');
const router = express.Router();
// const pool = require('../db');
const FranchisePartner = require('../models/FranchisePartner');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const resend = require('../utils/resendClient');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/franchise');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const uploaderName = (req.body.name || 'franchise').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    cb(null, uploaderName + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf' && ext !== '.zip') {
      return cb(new Error('Only PDF and ZIP files are allowed'));
    }
    cb(null, true);
  }
});

router.post('/apply', upload.single('documents'), async (req, res) => {
  /* POSTGRES LOGIC COMMENTED OUT
  const client = await pool.connect();

  try {
    const {
      name, dob, contactNumber, panCard, aadharCard, permanentAddress,
      occupation, companyName, designation, experience,
      message,
      accountNumber, ifscCode, bankAddress, bankName
    } = req.body;

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const documentPath = req.file ? `${baseUrl}/uploads/franchise/${req.file.filename}` : null;

    // 1. Insert Franchise Partner Application
    const applicationQuery = `
      INSERT INTO franchise_partner 
      (name, dob, contact_number, pan_card, aadhar_card, permanent_address, occupation, company_name, designation, experience, message, account_number, ifsc_code, bank_address, bank_name, document_path)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id;
    `;
    const applicationValues = [
      name, dob, contactNumber, panCard, aadharCard, permanentAddress,
      occupation, companyName, designation, experience,
      message,
      accountNumber, ifscCode, bankAddress, bankName, documentPath
    ];

    const appResult = await client.query(applicationQuery, applicationValues);
    const applicationId = appResult.rows[0].id;
  */

  try {
    const {
      name, dob, contactNumber, panCard, aadharCard, permanentAddress,
      occupation, companyName, designation, experience,
      message,
      accountNumber, ifscCode, bankAddress, bankName
    } = req.body;

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const documentPath = req.file ? `${baseUrl}/uploads/franchise/${req.file.filename}` : null;

    // 1. Insert Franchise Partner Application using MongoDB
    const newApplication = await FranchisePartner.create({
      name, dob, contactNumber, panCard, aadharCard, permanentAddress,
      occupation, companyName, designation, experience,
      message,
      accountNumber, ifscCode, bankAddress, bankName, documentPath
    });
    const applicationId = newApplication._id;

    // Send Email Notification
    try {
      let attachments = [];
      if (req.file && fs.existsSync(req.file.path)) {
        attachments.push({
          filename: req.file.originalname,
          content: fs.readFileSync(req.file.path)
        });
      }

      await resend.emails.send({
        from: 'AK Solutions Notifications <onboarding@resend.dev>',
        to: 'customer.support@techhansha.com',
        subject: 'Notification from Franchise Partner Form',
        html: `
          <h2>New Franchise Partner Application</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>DOB:</strong> ${dob}</p>
          <p><strong>Contact Number:</strong> ${contactNumber}</p>
          <p><strong>PAN:</strong> ${panCard}</p>
          <p><strong>Aadhar:</strong> ${aadharCard}</p>
          <p><strong>Address:</strong> ${permanentAddress}</p>
          <p><strong>Occupation:</strong> ${occupation}</p>
          <p><strong>Company:</strong> ${companyName || 'N/A'}</p>
          <p><strong>Designation:</strong> ${designation || 'N/A'}</p>
          <p><strong>Experience:</strong> ${experience || 'N/A'}</p>
          <p><strong>Bank Name:</strong> ${bankName}</p>
          <p><strong>Account Number:</strong> ${accountNumber}</p>
          <p><strong>IFSC:</strong> ${ifscCode}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `,
        attachments
      });
      console.log("✅ Franchise Email sent successfully");
    } catch (emailError) {
      console.error("❌ Failed to send franchise email:", emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Franchise application submitted successfully',
      applicationId
    });

  } catch (error) {
    console.error('Error submitting franchise application:', error);

    // Clean up uploaded file if DB insertion failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Server error while submitting application',
      error: error.message
    });
  }
  /* POSTGRES FINALLY LOGIC COMMENTED OUT
  finally {
    client.release();
  }
  */
});

const StoreProfile = require('../models/StoreProfile');
const WalletTransaction = require('../models/WalletTransaction');
const B2BInvoice = require('../models/B2BInvoice');
const TechhansaCatalog = require('../models/TechhansaCatalog');
const GlobalProduct = require('../models/GlobalProduct');
const User = require('../models/User');

// --- NEW API ENDPOINTS FOR FRANCHISE PORTAL ---

// 1. Get Store Profile & Metrics
router.get('/:storeId/profile', async (req, res) => {
  try {
    const profile = await StoreProfile.findOne({ storeId: req.params.storeId }).lean();
    if (!profile) return res.status(404).json({ success: false, message: 'Store not found' });

    // Find the franchise owner user (not employees) — supports comma-separated storeIds
    const user = await User.findOne({
      role: 'franchise',
      storeId: { $regex: req.params.storeId }
    });
    if (user) {
      profile.totalCredit = user.totalCredit || 0;
      profile.usedCredit = user.usedCredit || 0;
    }

    // Map credit logic to walletBalance for frontend compatibility
    profile.walletBalance = (profile.totalCredit || 0) - (profile.usedCredit || 0);

    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error fetching store profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Upload generic file
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const baseUrl = `${protocol}://${req.get('host')}`;
  const fileUrl = `${baseUrl}/uploads/franchise/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });
});

// Update Store Profile
router.put('/:storeId/profile', async (req, res) => {
  try {
    const allowedUpdates = ['storeName', 'address', 'manager', 'employees', 'timings', 'gst', 'contact', 'email'];
    const updateData = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    }

    const profile = await StoreProfile.findOneAndUpdate(
      { storeId: req.params.storeId },
      { $set: updateData },
      { new: true }
    );

    if (!profile) return res.status(404).json({ success: false, message: 'Store not found' });
    res.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error updating store profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// 2. Get Wallet Transactions
router.get('/:storeId/wallet', async (req, res) => {
  try {
    const transactions = await WalletTransaction.find({ storeId: req.params.storeId }).sort({ date: -1 });
    res.json({ success: true, data: transactions });
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// Removed: Add Funds to Wallet (Button removed per user request)

// 4. Get Quotations and B2B Invoices for Franchise Procurement Approvals
router.get('/:storeId/b2b-invoices', async (req, res) => {
  try {
    const Quotation = require('../models/Quotation');
    const quotations = await Quotation.find({ storeId: req.params.storeId }).populate('procurementReference').sort({ createdAt: -1 });
    const invoices = await B2BInvoice.find({ storeId: req.params.storeId }).sort({ createdAt: -1 });

    // Map quotations to the format expected by the frontend 'approvals' tab
    const mappedQuotations = quotations.map(q => ({
      _id: q._id,
      documentNo: q.quotationNo, // Changed from invoiceNo to avoid frontend confusion
      requestId: q.procurementReference ? (q.procurementReference.requestId || q.procurementReference._id?.toString() || q.procurementReference.toString()) : 'N/A',
      amount: q.amount,
      status: q.paymentStatus,
      date: new Date(q.createdAt).toLocaleDateString(),
      type: 'Quotation',
      documentFile: `/quotations/${q.quotationNo}.pdf`, // Changed from invoiceFile
      items: q.items || []
    }));

    const mappedInvoices = invoices.map(inv => ({
      _id: inv._id,
      documentNo: inv.invoiceNo, // Changed from invoiceNo
      requestId: inv.requestId,
      amount: inv.amount,
      status: inv.status,
      date: new Date(inv.createdAt).toLocaleDateString(),
      type: 'Invoice',
      documentFile: inv.invoiceFile || `/invoices/${inv.invoiceNo}.pdf`, // Changed from invoiceFile
      items: inv.items || []
    }));

    // Merge and sort
    const combined = [...mappedQuotations, ...mappedInvoices].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({ success: true, data: combined });
  } catch (error) {
    console.error('Error fetching approvals data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 5. Approve Quotation / B2B Invoice
router.put('/:storeId/b2b-invoices/:id/approve', async (req, res) => {
  try {
    const { storeId, id } = req.params;
    const { paymentMethod, utrNumber, transactionDate, receiptUrl } = req.body;

    const Quotation = require('../models/Quotation');
    const ProcurementRequest = require('../models/ProcurementRequest');

    // Check if it's a quotation first
    let itemToApprove = await Quotation.findById(id);
    let isQuotation = true;

    if (!itemToApprove) {
      itemToApprove = await B2BInvoice.findById(id);
      isQuotation = false;
    }

    if (!itemToApprove) return res.status(404).json({ success: false, message: 'Item not found' });
    if ((isQuotation ? itemToApprove.paymentStatus : itemToApprove.status) === 'Paid') return res.status(400).json({ success: false, message: 'Already paid' });
    if (itemToApprove.storeId !== storeId) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const profile = await StoreProfile.findOne({ storeId });
    if (!profile) return res.status(404).json({ success: false, message: 'Store not found' });

    const availableCredit = (profile.totalCredit || 0) - (profile.usedCredit || 0);

    const isAdvancePayment = (paymentMethod && paymentMethod !== 'Credit');

    const reqstId = isQuotation ? itemToApprove.procurementReference : itemToApprove.requestId;
    if (reqstId) {
      const reqst = isQuotation ? await ProcurementRequest.findById(reqstId) : await ProcurementRequest.findOne({ requestId: reqstId });
      if (reqst) {
        reqst.status = isAdvancePayment ? 'PAYMENT_VERIFICATION' : (isQuotation ? 'Paid' : 'DISPATCHED');
        await reqst.save();
      }
    }

    // Adjust credits
    if (!isAdvancePayment) {
      profile.usedCredit = (profile.usedCredit || 0) + itemToApprove.amount;
    }
    await profile.save();

    const user = await User.findOne({ role: 'franchise', storeId: { $regex: storeId } });
    if (user) {
      user.usedCredit = profile.usedCredit;
      await user.save();

      if (!isAdvancePayment) {
        const CreditTransaction = require('../models/CreditTransaction');

        // Log Credit Deduction
        const creditTxn = new CreditTransaction({
          userId: user.userId,
          type: 'Deducted',
          amount: itemToApprove.amount,
          referenceId: isQuotation ? itemToApprove.quotationNo : itemToApprove.invoiceNo,
          description: `Payment for ${isQuotation ? 'Quotation' : 'Invoice'} ${isQuotation ? itemToApprove.quotationNo : itemToApprove.invoiceNo}`
        });
        await creditTxn.save();

        // Log Wallet Transaction for Transaction Ledger
        const newBalance = (profile.totalCredit || 0) - (profile.usedCredit || 0);
        const walletTxn = new WalletTransaction({
          storeId: storeId,
          txnId: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          date: new Date(),
          type: 'Credit Out',
          amount: itemToApprove.amount,
          status: 'Success',
          closingBalance: newBalance,
          description: `Payment for ${isQuotation ? 'Quotation' : 'Invoice'} ${isQuotation ? itemToApprove.quotationNo : itemToApprove.invoiceNo}`
        });
        await walletTxn.save();
      } else {
        // Log Wallet Transaction for Transaction Ledger even for advance payments
        const newBalance = (profile.totalCredit || 0) - (profile.usedCredit || 0);
        const walletTxn = new WalletTransaction({
          storeId: storeId,
          txnId: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          date: new Date(),
          type: `Advance Payment (${paymentMethod})`,
          amount: itemToApprove.amount,
          status: 'Pending',
          closingBalance: newBalance,
          description: `Advance Payment for ${isQuotation ? 'Quotation' : 'Invoice'} ${isQuotation ? itemToApprove.quotationNo : itemToApprove.invoiceNo} (UTR: ${utrNumber})`
        });
        await walletTxn.save();
      }
    }

    // Update item
    if (isQuotation) {
      itemToApprove.paymentStatus = isAdvancePayment ? 'Pending Verification' : 'Paid';
    } else {
      itemToApprove.status = isAdvancePayment ? 'Payment Verification' : 'Paid';
    }

    // Store payment details if needed
    if (paymentMethod && paymentMethod !== 'Credit') {
      if (isQuotation) {
        itemToApprove.paymentMethod = paymentMethod;
        itemToApprove.utrNumber = utrNumber;
        itemToApprove.transactionDate = transactionDate;
        if (receiptUrl) {
          itemToApprove.receiptUrl = receiptUrl;
        }
      } else {
        itemToApprove.paymentDetails = {
          method: paymentMethod,
          utr: utrNumber,
          date: transactionDate,
          receipt: receiptUrl
        };
      }
    }

    await itemToApprove.save();

    res.json({ success: true, item: itemToApprove });
  } catch (error) {
    console.error('Error approving b2b invoice:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 6. Get Employees
router.get('/:storeId/employees', async (req, res) => {
  try {
    const employees = await User.find({ storeId: req.params.storeId, role: 'employee' }).sort({ createdAt: -1 });
    res.json({ success: true, data: employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create Employee
router.post('/:storeId/employees', async (req, res) => {
  try {
    const { userId, password, name, phone, email, dailyTarget } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User ID already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newEmployee = new User({
      userId,
      password: hashedPassword,
      name,
      phone,
      email,
      role: 'employee',
      storeId: req.params.storeId,
      status: 'Active',
      dailyTarget: dailyTarget !== undefined ? Number(dailyTarget) : 100000
    });

    await newEmployee.save();
    res.status(201).json({ success: true, data: newEmployee });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ success: false, message: 'Server error creating employee' });
  }
});

// Update Employee Details
router.put('/:storeId/employees/:id', async (req, res) => {
  try {
    const { name, phone, email, password, dailyTarget } = req.body;

    const mongoose = require('mongoose');
    const isValidObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const query = { storeId: req.params.storeId, role: 'employee' };

    if (isValidObjectId) {
      query.$or = [{ _id: req.params.id }, { userId: req.params.id }];
    } else {
      query.userId = req.params.id;
    }

    const employee = await User.findOne(query);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (name) employee.name = name;
    if (phone) employee.phone = phone;
    if (email) employee.email = email;
    if (password) employee.password = password;
    if (dailyTarget !== undefined) employee.dailyTarget = Number(dailyTarget);

    await employee.save();
    res.json({ success: true, data: employee });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ success: false, message: 'Server error updating employee' });
  }
});

// Toggle Employee Status
router.put('/:storeId/employees/:id/status', async (req, res) => {
  try {
    const employee = await User.findOne({ _id: req.params.id, storeId: req.params.storeId, role: 'employee' });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    employee.status = employee.status === 'Active' ? 'Inactive' : 'Active';
    await employee.save();

    res.json({ success: true, data: employee });
  } catch (error) {
    console.error('Error toggling employee status:', error);
    res.status(500).json({ success: false, message: 'Server error toggling status' });
  }
});

const ProcurementRequest = require('../models/ProcurementRequest');

// 8. Get Procurement Requests
router.get('/:storeId/requests', async (req, res) => {
  try {
    const requests = await ProcurementRequest.find({ storeId: req.params.storeId }).sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    console.error('Error fetching procurement requests:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 9. Create Procurement Request
router.post('/:storeId/requests', async (req, res) => {
  try {
    const { items, totalAmount, date } = req.body;
    const storeId = req.params.storeId;

    // Auto-increment logic
    const lastRequest = await ProcurementRequest.findOne().sort({ createdAt: -1 });
    let nextNum = 1;
    if (lastRequest && lastRequest.requestId && lastRequest.requestId.startsWith('REQ-')) {
      const match = lastRequest.requestId.match(/REQ-(\d+)/);
      if (match) {
        // If there are existing requests that have giant timestamp IDs, we might want to start fresh 
        // or just increment from the last small number. Let's handle parsing carefully.
        const parsed = parseInt(match[1]);
        // If it's a timestamp ID (length > 6), maybe default to 1 or ignore it, but for now we just increment
        // It's safer to just increment what we find. If they have 'REQ-17866...', next will be 'REQ-17866...+1'
        // But the user specifically wants REQ-001. We can just count documents as a fallback or enforce 3 digits.
        if (parsed > 1000000) {
          // It's a timestamp, let's start fresh based on count
          const count = await ProcurementRequest.countDocuments();
          nextNum = count + 1;
        } else {
          nextNum = parsed + 1;
        }
      }
    }
    const requestId = `REQ-${String(nextNum).padStart(3, '0')}`;

    // Removed credit limitation check here.
    // Procurement requests should NOT be blocked by credit limits because:
    // 1. The Admin manually sets the final B2BInvoice amount.
    // 2. The Franchise can opt to pay via Advance Payment (NEFT/UPI) at checkout.

    const newRequest = new ProcurementRequest({
      storeId,
      requestId,
      date,
      items,
      totalAmount,
      total: totalAmount // keeping total for backward compatibility if needed
    });

    await newRequest.save();
    res.status(201).json({ success: true, data: newRequest });
  } catch (error) {
    console.error('Error creating procurement request:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message, stack: error.stack });
  }
});

// 7. Get AK Solutions Catalog (now from GlobalProduct)
router.get('/catalog/all', async (req, res) => {
  try {
    const catalog = await GlobalProduct.find({});
    res.json({ success: true, data: catalog });
  } catch (error) {
    console.error('Error fetching catalog:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
