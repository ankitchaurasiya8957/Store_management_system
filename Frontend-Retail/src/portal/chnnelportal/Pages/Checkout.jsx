import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthContext } from '../../../context/AuthContext';
import { IndianRupee, ShieldCheck, ArrowRight, Wallet, Banknote, Building2 } from 'lucide-react';
import { fetchWithAuth } from '../../../utils/api.js';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext); // Need login/refresh to update credit
  const quotation = location.state?.quotation;
  const passedTotalAmount = location.state?.displayTotalAmount;

  const [paymentMethod, setPaymentMethod] = useState(''); // 'Credit' | 'Advance Payment'
  const [advanceSubMethod, setAdvanceSubMethod] = useState(''); // 'NEFT' | 'UPI'

  const [utrNumber, setUtrNumber] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [companySettings, setCompanySettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/settings/company`);
        const data = await res.json();
        setCompanySettings(data);
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }
    };
    fetchSettings();
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!quotation) {
    return (
      <div className="p-12 text-center text-gray-500">
        No quotation selected for checkout.
        <br />
        <button onClick={() => navigate('/channel/quotations')} className="mt-4 text-blue-600 underline">Go Back</button>
      </div>
    );
  }

  const totalAmount = passedTotalAmount || (quotation.amount || quotation.totalAmount || 0);
  const gstMultiplier = 1 + (companySettings?.globalGstPercentage ?? 18) / 100;
  // totalAmount is already GST-inclusive from the quotations page logic
  const subtotal = totalAmount / gstMultiplier;
  const gst = totalAmount - subtotal;

  const availableCredit = (user?.totalCredit || 0) - (user?.usedCredit || 0);
  const hasEnoughCredit = availableCredit >= totalAmount;

  const handleSubmit = async () => {
    setError('');

    if (!paymentMethod) {
      setError('Please select a payment method.');
      return;
    }

    if (paymentMethod === 'Credit' && !hasEnoughCredit) {
      setError('Insufficient Credit Limit.');
      return;
    }

    if (paymentMethod === 'Advance Payment') {
      if (!advanceSubMethod) {
        setError('Please select NEFT or UPI.');
        return;
      }
      if (!utrNumber || !transactionDate) {
        setError('Please provide UTR Number and Transaction Date.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = {
        quotationReference: quotation._id,
        totalAmount,
        paymentMethod: paymentMethod === 'Credit' ? 'Credit' : advanceSubMethod,
        utrNumber: paymentMethod === 'Advance Payment' ? utrNumber : undefined,
        transactionDate: paymentMethod === 'Advance Payment' ? transactionDate : undefined,
        receiptUrl: paymentMethod === 'Advance Payment' ? receiptUrl : undefined,
        userId: user.userId
      };

      const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/procurement/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');

      // Refresh user context to update credit if paid via credit
      if (paymentMethod === 'Credit') {
        const updatedUser = {
          ...user,
          usedCredit: (user.usedCredit || 0) + totalAmount
        };
        const updatedUserFinal = { ...updatedUser, walletBalance: data.walletBalance };
        login(updatedUserFinal, sessionStorage.getItem('token'));
      }

      navigate('/channel/orders', { state: { success: 'Order placed successfully!' } });
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto pb-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Secure Checkout</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Payment Method Selection */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              Select Payment Method
            </h2>

            <div className="space-y-4">
              {/* Credit Option */}
              <label className={`block p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'Credit' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200 hover:border-blue-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Credit"
                      checked={paymentMethod === 'Credit'}
                      onChange={() => setPaymentMethod('Credit')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Pay with Credit Line</div>
                      <div className="text-sm text-gray-500">Available: {formatCurrency(availableCredit)}</div>
                    </div>
                  </div>
                  {!hasEnoughCredit && (
                    <span className="text-xs font-semibold px-2.5 py-1 bg-red-100 text-red-700 rounded-full">Insufficient</span>
                  )}
                </div>
              </label>

              {/* Advance Payment Option */}
              <label className={`block p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'Advance Payment' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200 hover:border-blue-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Advance Payment"
                      checked={paymentMethod === 'Advance Payment'}
                      onChange={() => setPaymentMethod('Advance Payment')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">Advance Payment</div>
                      <div className="text-sm text-gray-500">NEFT / RTGS / UPI</div>
                    </div>
                  </div>
                </div>
              </label>
            </div>

            {/* Advance Payment Details */}
            {paymentMethod === 'Advance Payment' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 border-t border-gray-100">
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setAdvanceSubMethod('NEFT')}
                    className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${advanceSubMethod === 'NEFT' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                  >
                    NEFT / RTGS
                  </button>
                  <button
                    onClick={() => setAdvanceSubMethod('UPI')}
                    className={`flex-1 py-2 px-4 rounded-lg border text-sm font-medium transition-colors ${advanceSubMethod === 'UPI' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                  >
                    UPI
                  </button>
                </div>

                {advanceSubMethod === 'NEFT' && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><Building2 className="w-4 h-4" /> Bank Details</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><span className="font-medium text-gray-900">Account Name:</span> {companySettings?.bankDetails?.accountHolderName || 'AK Solutions Solutions Pvt Ltd'}</p>
                      <p><span className="font-medium text-gray-900">Bank Name:</span> {companySettings?.bankDetails?.bankName || 'HDFC Bank'}</p>
                      <p><span className="font-medium text-gray-900">Branch Name:</span> {companySettings?.bankDetails?.branchName || 'N/A'}</p>
                      <p><span className="font-medium text-gray-900">Account Number:</span> {companySettings?.bankDetails?.accountNo || '50200012345678'}</p>
                      <p><span className="font-medium text-gray-900">IFSC Code:</span> {companySettings?.bankDetails?.ifscCode || 'HDFC0001234'}</p>
                    </div>
                  </div>
                )}

                {advanceSubMethod === 'UPI' && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center">
                    <h4 className="font-semibold text-gray-900 mb-2">Scan to Pay</h4>
                    <div className="w-40 h-40 bg-white border border-gray-300 rounded-xl flex items-center justify-center mb-2">
                      <span className="text-gray-400 text-sm">QR Code Placeholder</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">AK Solutions@hdfcbank</p>
                  </div>
                )}

                {advanceSubMethod && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">UTR / Transaction Reference No. *</label>
                      <input type="text" value={utrNumber} onChange={e => setUtrNumber(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. 123456789012" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Date *</label>
                      <input type="date" value={transactionDate} onChange={e => setTransactionDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Upload Receipt (Optional)</label>
                      <input type="file" onChange={e => setReceiptUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700" />
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Order Summary</h2>
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>GST (18%)</span>
                <span>{formatCurrency(gst)}</span>
              </div>
              <div className="flex justify-between text-gray-900 font-bold pt-3 border-t">
                <span>Total Payable</span>
                <span className="text-lg text-blue-600">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Place Order'}
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
