import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Filter, FileText, Download, Eye, ExternalLink, XCircle } from 'lucide-react';
import { exportToCSV } from '../../../utils/exportUtils';
import { AuthContext } from '../../../context/AuthContext';
import axios from '../../../api/axios';
import toast from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function Quotations() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext) || { user: null };
  const [quotations, setQuotations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuotation, setSelectedQuotation] = useState(location.state?.openQuotation || null);
  const [rfps, setRfps] = useState([]);
  const [companySettings, setCompanySettings] = useState(null);

  useEffect(() => {
    if (user?.userId) {
      fetchQuotations();
      fetchRfps();
      fetchCompanySettings();
    }
  }, [user]);

  const fetchCompanySettings = async () => {
    try {
      const res = await axios.get('/api/settings/company');
      setCompanySettings(res.data);
    } catch (err) {
      console.error('Failed to fetch company settings', err);
    }
  };

  const fetchQuotations = async () => {
    if (!user?.userId) return;
    try {
      const res = await axios.get(`/api/procurement/quotations?userId=${user.userId}`);
      setQuotations(res.data);
    } catch (err) {
      console.error('Failed to fetch quotations', err);
    }
  };

  const fetchRfps = async () => {
    if (!user?.userId) return;
    try {
      const res = await axios.get(`/api/procurement/rfp?userId=${user.userId}`);
      setRfps(res.data);
    } catch (err) {
      console.error('Failed to fetch RFPs', err);
    }
  };

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  const handlePaymentClick = () => {
    setPaymentMethod('');
    setUtrNumber('');
    setIsPaymentModalOpen(true);
  };

  const submitPayment = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    if ((paymentMethod === 'NEFT' || paymentMethod === 'UPI') && !utrNumber.trim()) {
      toast.error('Please enter the UTR / Reference Number');
      return;
    }

    setIsPaying(true);
    try {
      const payload = { paymentMethod, utrNumber: utrNumber.trim() };
      const res = await axios.post(`/api/procurement/quotations/${selectedQuotation._id}/pay`, payload);
      toast.success(res.data.message || 'Payment submitted successfully!');
      setSelectedQuotation({ ...selectedQuotation, paymentStatus: res.data.quotation.paymentStatus });
      setIsPaymentModalOpen(false);
      fetchQuotations();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Payment failed');
    } finally {
      setIsPaying(false);
    }
  };

  const filteredQs = quotations.filter(q => {
    // Hide quotations that are Rejected or still Pending admin approval
    if (q.status === 'Rejected' || q.status === 'Pending') return false;

    const qtId = q.quotationNo || q.quotationId || '';
    const vendor = q.vendorName || q.vendor || '';
    return qtId.toLowerCase().includes(searchQuery.toLowerCase()) || vendor.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getCardAmount = (qt) => {
    const gstMultiplier = 1 + (companySettings?.globalGstPercentage ?? 18) / 100;
    const rItems = qt.items?.length > 0 ? qt.items : (qt.rfpReference?.products || []);
    if (rItems.length > 0) {
      return rItems.reduce((sum, item) => sum + ((item.unitPrice || item.price || item.rate || 0) * (item.quantity || 1) * gstMultiplier), 0);
    }
    return (qt.amount || qt.rfpReference?.estimatedTotal || qt.totalAmount || 0) * gstMultiplier;
  };

  const fallbackTotalAmount = selectedQuotation?.amount || selectedQuotation?.rfpReference?.estimatedTotal || selectedQuotation?.totalAmount || 0;

  const selectedRfp = selectedQuotation?.rfpReference || rfps.find(r => r.rfpId === selectedQuotation?.quotationNo?.replace('QT-', ''));
  const rawItems = (selectedQuotation?.items?.length > 0) ? selectedQuotation.items : (selectedRfp?.products || []);

  const gstMultiplier = 1 + (companySettings?.globalGstPercentage ?? 18) / 100;
  const gstRateDecimal = (companySettings?.globalGstPercentage ?? 18) / 100;

  const quotationItems = rawItems.map(p => {
    let unitPrice = p.unitPrice ?? p.price;

    if (unitPrice === undefined || unitPrice === 0 || unitPrice == null) {
      if (rawItems.length === 1 && fallbackTotalAmount > 0) {
        // If we only have the fallback total, assume it is GST inclusive
        unitPrice = fallbackTotalAmount / (p.quantity || 1);
      } else {
        unitPrice = 0;
      }
    }

    const qty = p.quantity || 1;
    const baseAmt = unitPrice * qty;
    const gstAmt = baseAmt * gstRateDecimal;
    const totalAmount = baseAmt + gstAmt;

    return { ...p, unitPrice, totalAmount, gstAmt, baseAmt };
  });

  const displayTotalAmount = quotationItems.length > 0
    ? quotationItems.reduce((sum, item) => sum + (item.totalAmount || 0), 0)
    : (fallbackTotalAmount * gstMultiplier);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-[1600px] mx-auto pb-12 space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quotations</h1>
          <p className="text-slate-500 text-sm mt-1">Review and manage received quotations.</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Quotation ID or Vendor..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
          <button onClick={() => exportToCSV('quotations.csv', filteredQs, [
            { key: 'quotationNo', label: 'Quotation ID' },
            { key: 'vendor', label: 'Vendor' },
            { key: 'status', label: 'Status' },
            { key: 'amount', label: 'Total Amount' },
            { key: 'validUntil', label: 'Valid Until' }
          ])} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shrink-0">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-3">
        {filteredQs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center text-slate-500">
            No quotations found.
          </div>
        ) : (
          filteredQs.map((qt) => (
            <motion.div key={qt._id} variants={itemVariants} className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-blue-600 text-sm cursor-pointer hover:underline">{qt.quotationNo || qt.quotationId}</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${qt.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                    {qt.status === 'Pending' ? 'Pending Admin Approval' : qt.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelectedQuotation(qt)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">{qt.vendorName || (qt.vendor === 'TBD' ? 'AK Solutions Retail' : qt.vendor)}</h3>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">Value:</span>
                  <span className="text-slate-700 font-semibold text-emerald-600">₹{getCardAmount(qt).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">Valid Until:</span>
                  <span className="text-slate-700">{new Date(qt.validUntil).toLocaleDateString()}</span>
                </div>
                {qt.rfpReference && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-medium">Related RFP:</span>
                    <span className="text-blue-500 cursor-pointer hover:underline">{qt.rfpReference.rfpId}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">Payment:</span>
                  <span className={`font-semibold ${qt.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {qt.paymentStatus || 'Pending'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* View Quotation Modal */}
      {selectedQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Quotation Details</h2>
                <p className="text-sm text-slate-500 mt-1">{selectedQuotation.quotationNo || selectedQuotation.quotationId}</p>
              </div>
              <button onClick={() => setSelectedQuotation(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Vendor</p>
                  <p className="text-slate-900 font-semibold">{selectedQuotation.vendorName || (selectedQuotation.vendor === 'TBD' ? 'AK Solutions Retail' : selectedQuotation.vendor) || 'AK Solutions Retail'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Total Amount</p>
                  <p className="font-bold text-emerald-600">₹{displayTotalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Valid Until</p>
                  <p className="text-slate-900 font-semibold">{new Date(selectedQuotation.validUntil).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${selectedQuotation.status === 'Pending' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                    {selectedQuotation.status === 'Pending' ? 'Pending Admin Approval' : selectedQuotation.status}
                  </span>
                </div>
                {selectedQuotation.rfpReference && (
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Related RFP</p>
                    <p className="text-blue-600 font-semibold">{selectedQuotation.rfpReference.rfpId}</p>
                  </div>
                )}
                {selectedQuotation.notes && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-slate-500 mb-1">Notes / Terms</p>
                    <p className="text-slate-900 bg-slate-50 p-4 rounded-xl text-sm border border-slate-100">{selectedQuotation.notes}</p>
                  </div>
                )}
              </div>

              {quotationItems.length > 0 && (
                <>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Quoted Items</h3>
                  <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700">Item</th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700 text-center">Qty</th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">Base Price</th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">GST Amount</th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {quotationItems.map((item, i) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-slate-900">{item.name || item.productName || `${item.brand} ${item.category} (${item.model})`}</td>
                            <td className="px-4 py-3 text-sm text-slate-900 text-center font-medium">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">{item.baseAmt !== undefined ? `₹${item.baseAmt?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">{item.gstAmt !== undefined ? `₹${item.gstAmt?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-slate-900 text-right font-bold text-emerald-600">{item.totalAmount !== undefined ? `₹${item.totalAmount?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setSelectedQuotation(null)} className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors">
                Close
              </button>
              {selectedQuotation.status === 'Pending' && (
                <button disabled className="px-6 py-2 bg-slate-200 text-slate-500 font-medium rounded-lg cursor-not-allowed" title="Awaiting admin approval">
                  Awaiting Approval
                </button>
              )}
              {selectedQuotation.status === 'Approved' && selectedQuotation.paymentStatus === 'Pending' && (
                <button
                  onClick={handlePaymentClick}
                  disabled={isPaying}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {isPaying ? 'Processing...' : `Pay ₹${displayTotalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`}
                </button>
              )}
              {selectedQuotation.paymentStatus === 'Pending Verification' && (
                <button
                  disabled
                  className="px-6 py-2 bg-amber-100 text-amber-700 font-bold rounded-lg cursor-not-allowed border border-amber-200"
                >
                  Payment Verifying
                </button>
              )}
              {selectedQuotation.paymentStatus === 'Paid' && (
                <button
                  disabled
                  className="px-6 py-2 bg-emerald-100 text-emerald-700 font-bold rounded-lg cursor-not-allowed border border-emerald-200"
                >
                  Paid
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Payment Selection Modal */}
      {isPaymentModalOpen && selectedQuotation && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Make Payment</h2>
                <p className="text-xs text-slate-500 mt-0.5">Amount to pay: <strong className="text-emerald-600">₹{displayTotalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</strong></p>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Select Payment Method</label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setPaymentMethod('Credit Lines')}
                    className={`p-2.5 border rounded-xl text-left transition-all flex items-center justify-between ${paymentMethod === 'Credit Lines' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <div>
                      <span className="font-semibold text-slate-800 text-sm block">Credit Lines</span>
                      <span className="text-[11px] text-slate-500">Pay using approved limits</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'Credit Lines' ? 'border-blue-500' : 'border-slate-300'}`}>
                      {paymentMethod === 'Credit Lines' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                    </div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('NEFT')}
                    className={`p-2.5 border rounded-xl text-left transition-all flex items-center justify-between ${paymentMethod === 'NEFT' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <div>
                      <span className="font-semibold text-slate-800 text-sm block">NEFT / RTGS</span>
                      <span className="text-[11px] text-slate-500">Direct bank transfer</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'NEFT' ? 'border-blue-500' : 'border-slate-300'}`}>
                      {paymentMethod === 'NEFT' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                    </div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-2.5 border rounded-xl text-left transition-all flex items-center justify-between ${paymentMethod === 'UPI' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <div>
                      <span className="font-semibold text-slate-800 text-sm block">UPI</span>
                      <span className="text-[11px] text-slate-500">Scan QR or enter ID</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'UPI' ? 'border-blue-500' : 'border-slate-300'}`}>
                      {paymentMethod === 'UPI' && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                    </div>
                  </button>
                </div>
              </div>

              {paymentMethod === 'UPI' && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  <p className="text-xs font-medium text-slate-700 mb-1.5">Scan QR Code</p>
                  <div className="w-24 h-24 bg-white border border-slate-200 rounded-lg mx-auto flex items-center justify-center p-1.5 mb-1.5">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=AK Solutions@bank&pn=AK Solutions&am=${displayTotalAmount}`} alt="UPI QR" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">AK Solutions@bank</p>
                </div>
              )}

              {paymentMethod === 'NEFT' && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <p className="text-slate-700 font-medium mb-1.5 border-b border-slate-200 pb-1.5">Bank Details</p>
                  <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 mt-1.5">
                    <span className="text-slate-500">Bank:</span><span className="font-semibold text-slate-900">{companySettings?.bankDetails?.bankName || 'HDFC Bank'}</span>
                    <span className="text-slate-500">Branch:</span><span className="font-semibold text-slate-900">{companySettings?.bankDetails?.branchName || 'N/A'}</span>
                    <span className="text-slate-500">A/C Name:</span><span className="font-semibold text-slate-900">{companySettings?.bankDetails?.accountHolderName || 'AK Solutions Retail'}</span>
                    <span className="text-slate-500">A/C No:</span><span className="font-semibold text-slate-900 font-mono">{companySettings?.bankDetails?.accountNo || '50200012345678'}</span>
                    <span className="text-slate-500">IFSC:</span><span className="font-semibold text-slate-900 font-mono">{companySettings?.bankDetails?.ifscCode || 'HDFC0001234'}</span>
                  </div>
                </div>
              )}

              {(paymentMethod === 'NEFT' || paymentMethod === 'UPI') && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">UTR / Reference Number *</label>
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="12-digit UTR number"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase"
                  />
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
              <button onClick={() => setIsPaymentModalOpen(false)} className="px-5 py-2 text-sm bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={submitPayment}
                disabled={isPaying || !paymentMethod}
                className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {isPaying ? 'Processing...' : 'Submit Payment'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
