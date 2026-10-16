const mongoose = require('mongoose');

const CompanySettingsSchema = new mongoose.Schema({
  companyName: { type: String, default: 'AK Solutions RETAIL PVT LTD' },
  registeredAddress: { type: String, default: 'REGD. OFF-SHI 8/27A-K-3 GILAT BAZAR BYPASS\nSHIVPURKOT, VARANASI, UP-221002' },
  gstin: { type: String, default: 'N/A' },
  stateName: { type: String, default: 'N/A' },
  contactNumber: { type: String, default: '+91-7007650206 , 9711888951' },
  email: { type: String, default: 'finance@AK Solutions.com' },
  globalGstPercentage: { type: Number, default: 18 },
  bankDetails: {
    accountHolderName: { type: String, default: 'AK Solutions RETAIL PVT LTD' },
    bankName: { type: String, default: 'N/A' },
    accountNo: { type: String, default: 'N/A' },
    ifscCode: { type: String, default: 'N/A' },
    branchName: { type: String, default: 'N/A' }
  },
  declaration: { type: String, default: 'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.' },
  authorizedSignatoryText: { type: String, default: 'Verified by & Authorised Signatory\nCompany Secretary' }
}, { timestamps: true });

module.exports = mongoose.model('CompanySettings', CompanySettingsSchema);
