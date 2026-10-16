/**
 * NUCLEAR WIPE SCRIPT
 * Clears EVERY collection in the database completely.
 * Preserves only the department login users (admin, managers).
 * Run: node scripts/nukeAllData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('❌ MONGO_URI not set'); process.exit(1); }

async function nukeAllData() {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('✅ Connected to MongoDB\n');
  console.log('💣 Starting full database wipe...\n');

  // Load every model
  const User               = require('../models/User');
  const Product            = require('../models/Product');
  const GlobalProduct      = require('../models/GlobalProduct');
  const Invoice            = require('../models/Invoice');
  const CreditTransaction  = require('../models/CreditTransaction');
  const FranchisePartner   = require('../models/FranchisePartner');
  const ChannelPartner     = require('../models/ChannelPartner');
  const Order              = require('../models/Order');
  const ProcurementRequest = require('../models/ProcurementRequest');
  const B2BInvoice         = require('../models/B2BInvoice');
  const Quotation          = require('../models/Quotation');
  const RFP                = require('../models/RFP');
  const StoreProfile       = require('../models/StoreProfile');
  const WalletTransaction  = require('../models/WalletTransaction');
  const TechhansaCatalog   = require('../models/TechhansaCatalog');
  const CompanySettings    = require('../models/CompanySettings');
  const Notification       = require('../models/Notification');
  const Contact            = require('../models/Contact');
  const FormSubmission     = require('../models/FormSubmission');

  // Department user IDs to KEEP
  const keepUserIds = ['admin', 'account.manager', 'inventory.manager', 'finance.manager', 'warehouse.manager'];

  const results = [];

  // ── Collections to FULLY wipe ──────────────────────────────────
  const wipeAll = [
    { name: 'Products (store inventory)',   model: Product },
    { name: 'GlobalProducts (catalog)',     model: GlobalProduct },
    { name: 'Invoices',                     model: Invoice },
    { name: 'CreditTransactions',           model: CreditTransaction },
    { name: 'FranchisePartners',            model: FranchisePartner },
    { name: 'ChannelPartners',              model: ChannelPartner },
    { name: 'Orders',                       model: Order },
    { name: 'ProcurementRequests',          model: ProcurementRequest },
    { name: 'B2BInvoices',                  model: B2BInvoice },
    { name: 'Quotations',                   model: Quotation },
    { name: 'RFPs',                         model: RFP },
    { name: 'StoreProfiles',               model: StoreProfile },
    { name: 'WalletTransactions',          model: WalletTransaction },
    { name: 'TechhansaCatalog',            model: TechhansaCatalog },
    { name: 'Notifications',               model: Notification },
    { name: 'ContactForms',                model: Contact },
    { name: 'FormSubmissions',             model: FormSubmission },
  ];

  for (const col of wipeAll) {
    try {
      const r = await col.model.deleteMany({});
      results.push({ name: col.name, deleted: r.deletedCount, status: '✅' });
      console.log(`  ✅  ${col.name.padEnd(35)} — deleted ${r.deletedCount}`);
    } catch (err) {
      results.push({ name: col.name, deleted: 0, status: '⚠️ ' });
      console.log(`  ⚠️  ${col.name.padEnd(35)} — ${err.message}`);
    }
  }

  // ── Users: delete everyone EXCEPT department logins ────────────
  try {
    const r = await User.deleteMany({ userId: { $nin: keepUserIds } });
    console.log(`  ✅  ${'Users (franchise/channel/emp)'.padEnd(35)} — deleted ${r.deletedCount}`);
  } catch (err) {
    console.log(`  ⚠️  Users — ${err.message}`);
  }

  // ── CompanySettings: reset to blank ────────────────────────────
  try {
    await CompanySettings.deleteMany({});
    await new CompanySettings({
      companyName: '', registeredAddress: '', gstin: '',
      stateName: '', contactNumber: '', email: '',
      globalGstPercentage: 18,
      declaration: 'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.',
      authorizedSignatoryText: 'Verified by & Authorised Signatory\nCompany Secretary',
      bankDetails: { accountHolderName: '', bankName: '', branchName: '', accountNo: '', ifscCode: '' }
    }).save();
    console.log(`  ✅  ${'CompanySettings'.padEnd(35)} — reset to blank`);
  } catch (err) {
    console.log(`  ⚠️  CompanySettings — ${err.message}`);
  }

  // ── Reset credit on remaining users ────────────────────────────
  try {
    await User.updateMany({}, { $set: { totalCredit: 0, usedCredit: 0 } });
    console.log(`  ✅  ${'User credits'.padEnd(35)} — all reset to 0`);
  } catch (err) {
    console.log(`  ⚠️  User credits — ${err.message}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 DATABASE FULLY WIPED — System is fresh & empty');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n  Preserved department logins:');
  console.log('  ┌─────────────────────┬─────────────────────┬─────────────┐');
  console.log('  │ Department          │ User ID             │ Password    │');
  console.log('  ├─────────────────────┼─────────────────────┼─────────────┤');
  console.log('  │ Super Admin         │ admin               │ Admin@2026  │');
  console.log('  │ Account Manager     │ account.manager     │ AccMgr@2026 │');
  console.log('  │ Inventory Manager   │ inventory.manager   │ InvMgr@2026 │');
  console.log('  │ Finance Manager     │ finance.manager     │ FinMgr@2026 │');
  console.log('  │ Warehouse Manager   │ warehouse.manager   │ WrhMgr@2026 │');
  console.log('  └─────────────────────┴─────────────────────┴─────────────┘\n');

  await mongoose.connection.close();
  process.exit(0);
}

nukeAllData().catch(err => {
  console.error('❌ Wipe failed:', err.message);
  process.exit(1);
});
