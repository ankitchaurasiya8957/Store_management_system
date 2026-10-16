import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IndianRupee, ShieldCheck, ArrowRight, Wallet, Banknote, Building2 } from 'lucide-react';
import { useFranchise } from '../context/FranchiseContext';
import toast from 'react-hot-toast';
import axios from '../../../../api/axios';

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { metrics, approveB2BInvoice, companySettings } = useFranchise();
  const invoice = location.state?.invoice;

  const [paymentMethod, setPaymentMethod] = useState('');
  const [advanceSubMethod, setAdvanceSubMethod] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!invoice) {
    return (
      <div className="p-12 text-center text-slate-500">
        No invoice selected for checkout.
        <br />
        <button onClick={() => navigate('/franchise/procurement')} className="mt-4 text-indigo-600 underline font-semibold">Go Back</button>
      </div>
    );
  }

  const totalAmount = location.state?.finalAmount || invoice.amount || 0;
  const gstMultiplier = 1 + (companySettings?.globalGstPercentage ?? 18) / 100;
  // totalAmount is already GST-inclusive from the procurement page logic
  const subtotal = totalAmount / gstMultiplier;
  const gst = totalAmount - subtotal;

  const availableCredit = metrics?.walletBalance || 0;
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
      let finalReceiptUrl = undefined;

      if (paymentMethod === 'Advance Payment' && receiptFile) {
        const formData = new FormData();
        formData.append('file', receiptFile);

        const uploadRes = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/franchise/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (uploadRes.data.success) {
          finalReceiptUrl = uploadRes.data.url;
        }
      }

      const paymentDetails = {
        paymentMethod: paymentMethod === 'Credit' ? 'Credit' : advanceSubMethod,
        utrNumber: paymentMethod === 'Advance Payment' ? utrNumber : undefined,
        transactionDate: paymentMethod === 'Advance Payment' ? transactionDate : undefined,
        receiptUrl: finalReceiptUrl
      };

      await approveB2BInvoice(invoice._id || invoice.id, paymentDetails);
      toast.success(`Order ${invoice.invoiceNo || invoice.id} approved and paid successfully!`);
      navigate('/franchise/procurement');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to approve invoice');
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (num) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(num);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto pb-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Secure Checkout</h1>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Payment Method Selection */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-600" />
              Select Payment Method
            </h2>

            <div className="space-y-4">
              {/* Credit Option */}
              <label className={`block p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'Credit' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Credit"
                      checked={paymentMethod === 'Credit'}
                      onChange={() => setPaymentMethod('Credit')}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">Pay with Credit Line</div>
                      <div className="text-sm text-slate-500">Available: {formatCurrency(availableCredit)}</div>
                    </div>
                  </div>
                  {!hasEnoughCredit && (
                    <span className="text-xs font-semibold px-2.5 py-1 bg-rose-100 text-rose-700 rounded-full">Insufficient</span>
                  )}
                </div>
              </label>

              {/* Advance Payment Option */}
              <label className={`block p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'Advance Payment' ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Advance Payment"
                      checked={paymentMethod === 'Advance Payment'}
                      onChange={() => setPaymentMethod('Advance Payment')}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">Advance Payment</div>
                      <div className="text-sm text-slate-500">NEFT / RTGS / UPI</div>
                    </div>
                  </div>
                </div>
              </label>
            </div>

            {/* Advance Payment Details */}
            {paymentMethod === 'Advance Payment' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 p-4 border-t border-slate-100">
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
                  <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2"><Building2 className="w-4 h-4" /> Bank Details</h4>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p><span className="font-medium text-slate-900">Account Name:</span> {companySettings?.bankDetails?.accountHolderName || 'AK Solutions Solutions Pvt Ltd'}</p>
                      <p><span className="font-medium text-slate-900">Bank Name:</span> {companySettings?.bankDetails?.bankName || 'HDFC Bank'}</p>
                      <p><span className="font-medium text-slate-900">Branch Name:</span> {companySettings?.bankDetails?.branchName || 'N/A'}</p>
                      <p><span className="font-medium text-slate-900">Account Number:</span> {companySettings?.bankDetails?.accountNo || '50200012345678'}</p>
                      <p><span className="font-medium text-slate-900">IFSC Code:</span> {companySettings?.bankDetails?.ifscCode || 'HDFC0001234'}</p>
                    </div>
                  </div>
                )}

                {advanceSubMethod === 'UPI' && (
                  <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col items-center">
                    <h4 className="font-semibold text-slate-900 mb-2">Scan to Pay</h4>
                    <div className="w-40 h-40 bg-white border border-slate-300 rounded-xl flex items-center justify-center mb-2 overflow-hidden">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=AK Solutions@hdfcbank&pn=AK Solutions Retail&am=${totalAmount}&cu=INR`)}`}
                        alt="UPI QR Code"
                        className="w-full h-full object-cover p-2"
                      />
                    </div>
                    <p className="text-sm font-medium text-slate-900">AK Solutions@hdfcbank</p>
                  </div>
                )}

                {advanceSubMethod && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">UTR / Transaction Reference No. *</label>
                      <input type="text" value={utrNumber} onChange={e => setUtrNumber(e.target.value)} className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg text-sm bg-slate-50" placeholder="e.g. 123456789012" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Date *</label>
                      <input type="date" value={transactionDate} onChange={e => setTransactionDate(e.target.value)} className="w-full px-4 py-2 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg text-sm bg-slate-50" />
                    </div>

                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Order Summary</h2>

            <div className="mb-4 pb-4 border-b border-slate-100 text-sm">
              <div className="flex justify-between text-slate-600 mb-1">
                <span>Invoice No</span>
                <span className="font-semibold text-slate-800">{invoice.invoiceNo || invoice.id}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Request ID</span>
                <span>{invoice.requestId || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 mb-4">
                <span>GST ({companySettings?.globalGstPercentage ?? 18}%)</span>
                <span>₹{gst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-slate-800 font-bold text-lg pt-4 border-t border-slate-200">
                <span>Total Payable</span>
                <span className="text-lg text-indigo-600">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? 'Processing...' : (paymentMethod === 'Advance Payment' ? 'Approve & Place Order' : 'Approve and Pay')}
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-xs text-slate-500 text-center mt-3 flex items-center justify-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
