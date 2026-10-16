/**
 * Fresh System Setup Script
 * - Clears ALL old seed/dummy data
 * - Creates one admin user per role with clean credentials
 * - Resets CompanySettings to blank (fill via admin settings page)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ MONGO_URI not set in .env');
  process.exit(1);
}

async function freshSetup() {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('✅ Connected to MongoDB');

  const User = require('../models/User');
  const CompanySettings = require('../models/CompanySettings');
  const StoreProfile = require('../models/StoreProfile');
  const WalletTransaction = require('../models/WalletTransaction');
  const B2BInvoice = require('../models/B2BInvoice');
  const TechhansaCatalog = require('../models/TechhansaCatalog');
  const Product = require('../models/Product');

  // ─────────────────────────────────────────
  // 1. CLEAR OLD SEED / DUMMY DATA
  // ─────────────────────────────────────────
  console.log('\n🧹 Clearing old seed data...');

  // Remove old dummy users created by /api/auth/seed
  const oldSeedIds = [
    'admin123', 'franchise123', 'employee123',
    'channel123', 'accountmanager123', 'inventorymanager123',
    'financemanager123', 'EMP-001'
  ];
  const deletedUsers = await User.deleteMany({ userId: { $in: oldSeedIds } });
  console.log(`   🗑  Removed ${deletedUsers.deletedCount} old seed users`);

  // Remove dummy store/franchise data
  await StoreProfile.deleteMany({ storeId: 'STORE-001' });
  await WalletTransaction.deleteMany({ storeId: 'STORE-001' });
  await B2BInvoice.deleteMany({ storeId: 'STORE-001' });
  await Product.deleteMany({ storeId: 'STORE-001' });
  await TechhansaCatalog.deleteMany({});
  console.log('   🗑  Removed dummy store STORE-001 data');

  // Reset CompanySettings to blank
  await CompanySettings.deleteMany({});
  const freshSettings = new CompanySettings({
    companyName: '',
    registeredAddress: '',
    gstin: '',
    stateName: '',
    contactNumber: '',
    email: '',
    globalGstPercentage: 18,
    declaration: 'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.',
    authorizedSignatoryText: 'Verified by & Authorised Signatory\nCompany Secretary',
    bankDetails: {
      accountHolderName: '',
      bankName: '',
      branchName: '',
      accountNo: '',
      ifscCode: ''
    }
  });
  await freshSettings.save();
  console.log('   ✅ Company Settings reset to blank (fill via Admin → Settings)');

  // ─────────────────────────────────────────
  // 2. CREATE FRESH DEPARTMENT USERS
  // ─────────────────────────────────────────
  console.log('\n👤 Creating department users...');

  const salt = await bcrypt.genSalt(10);

  const departments = [
    { userId: 'admin',             password: 'Admin@2026',     role: 'admin',             name: 'Super Admin' },
    { userId: 'account.manager',   password: 'AccMgr@2026',    role: 'account_manager',   name: 'Account Manager' },
    { userId: 'inventory.manager', password: 'InvMgr@2026',    role: 'inventory_manager', name: 'Inventory Manager' },
    { userId: 'finance.manager',   password: 'FinMgr@2026',    role: 'finance_manager',   name: 'Finance Manager' },
    { userId: 'warehouse.manager', password: 'WrhMgr@2026',    role: 'warehouse_manager', name: 'Warehouse Manager' },
  ];

  const createdUsers = [];
  for (const dept of departments) {
    // Skip if already exists (idempotent)
    const existing = await User.findOne({ userId: dept.userId });
    if (existing) {
      console.log(`   ⚠️  User "${dept.userId}" already exists — skipped`);
      createdUsers.push({ ...dept, status: 'already exists' });
      continue;
    }

    const hashed = await bcrypt.hash(dept.password, salt);
    await User.create({
      userId: dept.userId,
      password: hashed,
      role: dept.role,
      name: dept.name,
      status: 'Active'
    });
    console.log(`   ✅ Created: ${dept.userId} (${dept.role})`);
    createdUsers.push(dept);
  }

  // ─────────────────────────────────────────
  // 3. SUMMARY
  // ─────────────────────────────────────────
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 FRESH SETUP COMPLETE — Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('  Department          | User ID              | Password');
  console.log('  ─────────────────────────────────────────────────────');
  for (const d of departments) {
    console.log(`  ${d.role.padEnd(20)}| ${d.userId.padEnd(22)}| ${d.password}`);
  }
  console.log('');
  console.log('  ⚠️  Franchise & Channel partners are created via');
  console.log('     Admin → Entity Management (not pre-seeded).');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await mongoose.connection.close();
  process.exit(0);
}

freshSetup().catch(err => {
  console.error('❌ Setup failed:', err);
  process.exit(1);
});
