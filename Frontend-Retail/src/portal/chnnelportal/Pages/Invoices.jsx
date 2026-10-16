import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Search, Receipt, Download, ExternalLink, Eye, XCircle, Printer, MessageCircle, Send } from 'lucide-react';
import { printInvoice } from '../../../utils/printUtils';
import { AuthContext } from '../../../context/AuthContext';
import { numberToWords } from '../../../utils/numberToWords';
import { fetchWithAuth } from '../../../utils/api.js';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function Invoices() {
  const { user } = useContext(AuthContext) || { user: null };
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [trackingInvoice, setTrackingInvoice] = useState(null);
  const [rfps, setRfps] = useState([]);
  const [companySettings, setCompanySettings] = useState(null);
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    if (user?.userId) {
      fetchInvoices();
      fetchRfps();
      fetchCompanySettings();
    }
  }, [user]);

  const fetchCompanySettings = async () => {
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/settings/company`);
      const data = await res.json();
      setCompanySettings(data);
    } catch (err) {
      console.error('Failed to fetch company settings', err);
    }
  };

  const fetchInvoices = async () => {
    if (!user?.userId) return;
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/procurement/invoices?userId=${user.userId}`);
      let data = [];

      try {
        if (res.ok) {
          data = await res.json();
        }
      } catch (e) {
        console.warn("Could not parse JSON from backend. It might be missing the endpoint.");
      }

      if (!data || data.length === 0) {
        setInvoices([]);
      } else {
        setInvoices(data);
      }
    } catch (err) {
      console.error('Failed to fetch invoices', err);
    }
  };

  const fetchRfps = async () => {
    if (!user?.userId) return;
    try {
      const res = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/procurement/rfp?userId=${user.userId}`);
      const data = await res.json();
      setRfps(data);
    } catch (err) {
      console.error('Failed to fetch RFPs', err);
    }
  };

  // Helper to format invoice number specifically for Channel Portal
  const getFormattedInvoiceNumber = (inv) => {
    if (!inv) return '';

    // Sequence Number (001 to infinity)
    const index = invoices.findIndex(i => (i._id || i.invoiceId) === (inv._id || inv.invoiceId));
    const seqNum = index >= 0 ? index + 1 : 1;

    // Company Name Short
    const compName = companySettings?.companyName || 'AK Solutions RETAIL';
    const compShort = compName.toLowerCase().includes('AK Solutions') ? 'THS' : compName.substring(0, 3).toUpperCase();

    // State Name Short
    const stateStr = companySettings?.stateName || companySettings?.registeredAddress || 'Uttar Pradesh';
    const stateStrLower = stateStr.toLowerCase();
    let stateShort = stateStrLower.includes('uttar pradesh') || stateStrLower.includes('up') ? 'UP' :
      stateStrLower.includes('madhya pradesh') || stateStrLower.includes('mp') ? 'MP' :
        stateStrLower.includes('delhi') || stateStrLower.includes('dl') ? 'DL' :
          stateStrLower.includes('maharashtra') || stateStrLower.includes('mh') ? 'MH' :
            stateStr.substring(0, 2).toUpperCase();

    // Year (Google Calendar current ongoing year)
    const date = inv.createdAt ? new Date(inv.createdAt) : new Date();
    const year = date.getFullYear();
    const fy = `${year.toString().substring(2)}-${(year + 1).toString().substring(2)}`;

    return `${compShort}/${stateShort}/${fy}/${seqNum.toString().padStart(3, '0')}`;
  };

  const filteredInvoices = invoices.filter(i => {
    const invId = getFormattedInvoiceNumber(i);
    return invId.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedRfp = selectedInvoice ? rfps.find(r => r.rfpId === selectedInvoice.invoiceNumber?.replace('INV-', '')) : null;
  const invoiceItems = selectedInvoice?.items || selectedRfp?.products || [];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-[1600px] mx-auto pb-12 space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Invoices</h1>
          <p className="text-slate-500 text-sm mt-1">Review and download your procurement invoices.</p>
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
              placeholder="Search by Invoice ID..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-3">
        {filteredInvoices.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center text-slate-500">
            No invoices found.
          </div>
        ) : (
          filteredInvoices.map((inv) => (
            <motion.div key={inv._id} variants={itemVariants} className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-blue-600 text-sm cursor-pointer hover:underline" onClick={() => setSelectedInvoice(inv)}>
                    {getFormattedInvoiceNumber(inv)}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${inv.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {(inv.paymentStatus === 'Unpaid' && inv.amount === 0) ? 'Pending Admin Approval' : (inv.paymentStatus || 'Pending')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {inv.paymentStatus === 'Paid' && (
                    <button onClick={() => setTrackingInvoice(inv)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Delivery Tracking">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /><path d="M14 9h4" /><path d="M14 15h4" /></svg>
                    </button>
                  )}
                  <button onClick={() => setSelectedInvoice(inv)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 mt-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">Amount:</span>
                  <span className="text-slate-700 font-semibold text-emerald-600">
                    {((inv.items && inv.items.length > 0)
                      ? inv.items.reduce((acc, item) => acc + ((item.rate || item.unitPrice || 0) * (item.quantity || 0) * (1 + ((companySettings?.globalGstPercentage ?? 18) / 100))), 0)
                      : ((inv.amount || 0) * (1 + ((companySettings?.globalGstPercentage ?? 18) / 100)))).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium">Date:</span>
                  <span className="text-slate-700">{new Date(inv.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Tracking Modal */}
      {trackingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-emerald-50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Delivery Tracking</h2>
                <p className="text-sm text-slate-500 mt-1">Invoice: {getFormattedInvoiceNumber(trackingInvoice)}</p>
              </div>
              <button onClick={() => setTrackingInvoice(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-emerald-100 rounded-full transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {trackingInvoice.orderReference?.trackingId || trackingInvoice.orderReference?.trackingInfo?.courier ? (
                <>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Courier Partner</h3>
                    <p className="font-bold text-slate-800 text-lg">{trackingInvoice.orderReference?.trackingInfo?.courier || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Tracking ID</h3>
                    <p className="font-bold text-slate-800 text-lg font-mono">{trackingInvoice.orderReference?.trackingId || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Expected Delivery</h3>
                    <p className="font-bold text-slate-800 text-lg">
                      {trackingInvoice.orderReference?.expectedDelivery
                        ? new Date(trackingInvoice.orderReference.expectedDelivery).toLocaleDateString('en-GB')
                        : 'N/A'}
                    </p>
                  </div>
                  {trackingInvoice.orderReference?.items?.some(item => item.assignedSerials && item.assignedSerials.length > 0) && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4 md:col-span-full">
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Dispatched Serial Numbers</h3>
                      <div className="space-y-3">
                        {trackingInvoice.orderReference.items.map((item, idx) => {
                          if (!item.assignedSerials || item.assignedSerials.length === 0) return null;
                          return (
                            <div key={idx}>
                              <p className="text-sm font-bold text-slate-700 mb-1">{item.model || item.productName || item.category || 'Product'}</p>
                              <div className="flex flex-wrap gap-2">
                                {item.assignedSerials.map((sn, i) => (
                                  <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-slate-600">
                                    {sn}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 text-center">
                  <h3 className="text-amber-800 font-bold mb-2">Not Dispatched Yet</h3>
                  <p className="text-sm text-amber-700">Delivery tracking information will be available once the order has been dispatched from the warehouse.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setTrackingInvoice(null)} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-colors">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* View Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-7xl h-[125vh] max-h-[125vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Invoice Details</h2>
                <p className="text-sm text-slate-500 mt-1">{getFormattedInvoiceNumber(selectedInvoice)}</p>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">

              {/* Professional Invoice Header */}
              <div className="flex flex-col md:flex-row border border-slate-700 mb-6">

                {/* Left Side: Company & Buyer Details */}
                <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-slate-700">
                  {/* Company Details */}
                  <div className="p-4 border-b border-slate-700">
                    <h3 className="font-bold text-slate-900 uppercase">{companySettings?.companyName || 'AK Solutions RETAIL PVT LTD'}</h3>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{companySettings?.registeredAddress || 'Address'}</p>
                    <div className="mt-2 text-sm text-slate-700 space-y-0.5">
                      <p><strong>GSTIN/UIN:</strong> {companySettings?.gstin || 'N/A'}</p>
                      <p><strong>State Name:</strong> {companySettings?.stateName || 'N/A'}</p>
                      <p><strong>Contact:</strong> {companySettings?.contactNumber || 'N/A'}</p>
                      <p><strong>E-Mail:</strong> {companySettings?.email || 'N/A'}</p>
                    </div>
                  </div>
                  {/* Buyer Details */}
                  <div className="p-4 flex-1">
                    <h4 className="text-sm text-slate-500 mb-1">Buyer (Bill to)</h4>
                    <p className="font-bold text-slate-900 uppercase">{user?.companyName || user?.name || 'Buyer Name'}</p>
                    <p className="text-sm text-slate-700">{user?.address || 'Buyer Address'}</p>
                    <p className="text-sm text-slate-700 mt-1"><strong>Phone:</strong> {user?.phone || 'N/A'}</p>
                    <p className="text-sm text-slate-700"><strong>Email:</strong> {user?.email || 'N/A'}</p>
                  </div>
                </div>

                {/* Right Side: Invoice Meta Details */}
                <div className="flex-1 flex flex-col">
                  <div className="flex border-b border-slate-700">
                    <div className="flex-1 p-4 border-r border-slate-700">
                      <p className="text-sm text-slate-500">Invoice No.</p>
                      <p className="font-bold text-slate-900">{getFormattedInvoiceNumber(selectedInvoice)}</p>
                    </div>
                    <div className="flex-1 p-4">
                      <p className="text-sm text-slate-500">Dated</p>
                      <p className="font-bold text-slate-900">{new Date(selectedInvoice.createdAt).toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                  <div className="flex border-b border-slate-700">
                    <div className="flex-1 p-4 border-r border-slate-700">
                      <p className="text-sm text-slate-500">Related Order</p>
                      <p className="font-bold text-slate-900">{selectedInvoice.orderReference?.orderId || selectedInvoice.orderReference?.orderNumber || (typeof selectedInvoice.orderReference === 'string' ? selectedInvoice.orderReference : 'N/A')}</p>
                    </div>
                    <div className="flex-1 p-4">
                      <p className="text-sm text-slate-500">Mode/Terms of Payment</p>
                      <p className="font-bold text-slate-900">{selectedInvoice.paymentStatus || 'Pending'}</p>
                    </div>
                  </div>
                  <div className="flex-1 p-4 border-b border-slate-700 flex flex-col justify-center">
                    <p className="text-sm text-slate-500">Country</p>
                    <p className="font-bold text-slate-900">India</p>
                  </div>
                  <div className="flex-1 p-4">
                    <p className="text-sm text-slate-500">Terms of Delivery</p>
                    <p className="font-bold text-slate-900">As per standard terms</p>
                  </div>
                </div>
              </div>

              {invoiceItems.length > 0 && (
                <>
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Invoice Items</h3>
                  {/* Product Details Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700 whitespace-nowrap">Serial No.</th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700 whitespace-nowrap">Item / Category</th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700 whitespace-nowrap">Brand</th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700 whitespace-nowrap">Model</th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700 whitespace-nowrap">Configuration</th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700 whitespace-nowrap">Purchase Date</th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700 text-center whitespace-nowrap">Qty</th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700 text-right whitespace-nowrap">Rate</th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700 text-right whitespace-nowrap">GST Amount</th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700 text-right whitespace-nowrap">Total Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {invoiceItems.map((item, i) => {
                          const rate = item.rate || item.unitPrice || 0;
                          const qty = item.quantity || 0;
                          const hsn = item.hsn || '-';
                          const gstRate = companySettings?.globalGstPercentage ?? 18;
                          const taxableValue = rate * qty;
                          const gstAmount = taxableValue * (gstRate / 100);
                          const totalAmount = taxableValue + gstAmount;

                          const configStr = (() => {
                            if (typeof item.configuration === 'string' && item.configuration) {
                              try {
                                const parsed = JSON.parse(item.configuration);
                                if (typeof parsed === 'object' && parsed !== null) {
                                  return Object.entries(parsed).map(([k, v]) => `${k}: ${v}`).join('\n');
                                }
                              } catch (e) {
                                return item.configuration;
                              }
                              return item.configuration;
                            }
                            if (item.specs && typeof item.specs === 'object' && Object.keys(item.specs).length > 0) {
                              return Object.entries(item.specs)
                                .map(([k, v]) => `${k}: ${v}`)
                                .join('\n');
                            }
                            if (item.configuration && typeof item.configuration === 'object') {
                              return Object.entries(item.configuration).map(([k, v]) => `${k}: ${v}`).join('\n');
                            }
                            return item.details || '-';
                          })();

                          return (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 text-sm text-slate-900 font-medium text-center">{i + 1}</td>
                              <td className="px-4 py-3 text-sm text-slate-900">{item.name || item.productName || item.category || '-'}</td>
                              <td className="px-4 py-3 text-sm text-slate-900">{item.brand || '-'}</td>
                              <td className="px-4 py-3 text-sm text-slate-900">{item.model || '-'}</td>
                              <td className="px-4 py-3 text-sm text-slate-500 whitespace-pre-wrap break-words min-w-[200px]">{configStr}</td>
                              <td className="px-4 py-3 text-sm text-slate-500">{new Date(selectedRfp?.createdAt || selectedInvoice.createdAt).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-sm text-slate-900 text-center font-medium">{qty}</td>
                              <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium"> {rate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium text-slate-500">
                                {gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-900 text-right font-bold text-emerald-600">
                                {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot className="bg-slate-50 border-t border-slate-200">
                        <tr>
                          <td colSpan="6" className="px-4 py-3 text-sm font-bold text-slate-700 text-right">TOTAL</td>
                          <td className="px-4 py-3 text-sm font-bold text-slate-900 text-center">{selectedInvoice.totalQuantity || invoiceItems.reduce((acc, item) => acc + (item.quantity || 0), 0)}</td>
                          <td className="px-4 py-3 text-sm font-bold text-slate-900 text-center text-slate-400">-</td>
                          <td className="px-4 py-3 text-sm font-bold text-slate-700 text-right">
                            {(() => {
                              const totalGst = invoiceItems.reduce((acc, item) => {
                                const r = item.rate || item.unitPrice || 0;
                                const q = item.quantity || 0;
                                const gRate = companySettings?.globalGstPercentage ?? 18;
                                return acc + (r * q * (gRate / 100));
                              }, 0);
                              return ` ${totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                            })()}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-emerald-700 text-right">
                            {(() => {
                              const amt = (invoiceItems && invoiceItems.length > 0) ? invoiceItems.reduce((acc, item) => {
                                const r = item.rate || item.unitPrice || 0;
                                const q = item.quantity || 0;
                                const gRate = companySettings?.globalGstPercentage ?? 18;
                                const tVal = r * q;
                                return acc + tVal + (tVal * (gRate / 100));
                              }, 0) : selectedInvoice.amount;
                              return ` ${amt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                            })()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Professional Invoice Summary & Footer */}
                  <div className="border border-slate-700 border-t-0 mt-[-24px] mb-6 flex flex-col">

                    {/* Buyer Details */}
                    {(() => {
                      const buyer = (selectedInvoice.buyerDetails && selectedInvoice.buyerDetails.buyerId)
                        ? selectedInvoice.buyerDetails
                        : {
                          buyerId: user?.userId || selectedInvoice.userId || '-',
                          productId: selectedRfp?.rfpId || selectedInvoice.orderReference?.orderNumber || (typeof selectedInvoice.orderReference === 'string' ? selectedInvoice.orderReference : '-'),
                          buyerName: user?.name || user?.companyName || '-',
                          paymentDetails: (user?.totalCredit > 0) ? 'Credit Limit' : 'Advance Payment'
                        };
                      return (
                        <div className="p-4 border-b border-slate-700 bg-white">
                          <h3 className="font-bold text-slate-900 mb-3 text-sm">Buyer Details</h3>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-slate-700">
                            <p><strong>Buyer ID:</strong> {buyer.buyerId}</p>
                            <p><strong>Product ID:</strong> {buyer.productId}</p>
                            <p><strong>Buyer Name:</strong> {buyer.buyerName}</p>
                            <p><strong>Payment Details:</strong> {buyer.paymentDetails}</p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Amount Chargeable (in words) */}
                    <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                      <div className="p-4 border-r border-slate-700 flex flex-col justify-between">
                        <span className="text-slate-500">Amount Chargeable (in words)</span>
                        <p className="font-bold text-slate-900 capitalize">
                          INR {numberToWords(Math.round((invoiceItems && invoiceItems.length > 0) ? invoiceItems.reduce((acc, item) => acc + ((item.rate || item.unitPrice || 0) * (item.quantity || 0) * (1 + ((companySettings?.globalGstPercentage ?? 18) / 100))), 0) : selectedInvoice.amount))} Only
                        </p>
                      </div>
                      <div className="text-sm text-right">
                        <span className="text-slate-500 italic block">E. & O.E</span>
                      </div>
                    </div>

                    {/* Taxable Value & Tax Amount */}
                    <div className="p-4 border-b border-slate-700 flex justify-between bg-slate-50">
                      <div className="text-sm w-1/2">
                        <span className="text-slate-500">Tax Amount (in words) : </span>
                        <p className="font-bold text-slate-900 capitalize">
                          INR {numberToWords(Math.round(invoiceItems.reduce((acc, item) => acc + ((item.rate || item.unitPrice || 0) * (item.quantity || 0) * ((companySettings?.globalGstPercentage ?? 18) / 100)), 0)))} Only
                        </p>
                      </div>
                      <div className="text-sm w-1/2 flex flex-col items-end gap-1">
                        <div className="flex justify-between w-48">
                          <span className="text-slate-500">Taxable Value:</span>
                          <span className="font-bold text-slate-900">
                            {invoiceItems.reduce((acc, item) => acc + ((item.rate || item.unitPrice || 0) * (item.quantity || 0)), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex justify-between w-48">
                          <span className="text-slate-500">Total Tax:</span>
                          <span className="font-bold text-slate-900">
                            {invoiceItems.reduce((acc, item) => acc + ((item.rate || item.unitPrice || 0) * (item.quantity || 0) * ((companySettings?.globalGstPercentage ?? 18) / 100)), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Balances (from old UI, preserved cleanly) */}
                    <div className="p-4 border-b border-slate-700 flex justify-between bg-white">
                      <div className="text-sm flex items-center gap-2">
                        <span className="text-slate-500">Received Amount:</span>
                        <span className="font-bold text-emerald-600"> {(() => {
                          const computedTotal = (invoiceItems && invoiceItems.length > 0) ? invoiceItems.reduce((acc, item) => acc + ((item.rate || item.unitPrice || 0) * (item.quantity || 0) * (1 + ((companySettings?.globalGstPercentage ?? 18) / 100))), 0) : selectedInvoice.amount;
                          const received = (selectedInvoice.paymentStatus === 'Paid' || selectedInvoice.paymentStatus === 'Credit') ? computedTotal : (selectedInvoice.receivedAmount || 0);
                          return received.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        })()}</span>
                      </div>
                      <div className="text-sm flex items-center gap-2">
                        <span className="text-slate-500">Balance Amount:</span>
                        <span className="font-bold text-amber-600"> {(() => {
                          const computedTotal = (invoiceItems && invoiceItems.length > 0) ? invoiceItems.reduce((acc, item) => acc + ((item.rate || item.unitPrice || 0) * (item.quantity || 0) * (1 + ((companySettings?.globalGstPercentage ?? 18) / 100))), 0) : selectedInvoice.amount;
                          const received = (selectedInvoice.paymentStatus === 'Paid' || selectedInvoice.paymentStatus === 'Credit') ? computedTotal : (selectedInvoice.receivedAmount || 0);
                          const balance = Math.max(0, computedTotal - received);
                          return balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        })()}</span>
                      </div>
                    </div>

                    {/* Bottom Section: Declaration & Bank Details */}
                    <div className="flex flex-col md:flex-row">

                      {/* Left: Declaration */}
                      <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-slate-700 flex flex-col">
                        <div className="mb-4 text-sm">
                          <p className="underline font-medium mb-1">Declaration</p>
                          <p className="text-slate-700">{companySettings?.declaration || 'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.'}</p>
                        </div>
                      </div>

                      {/* Right: Bank Details & Signatory */}
                      <div className="flex-1 flex flex-col">
                        {/* Bank Details */}
                        <div className="p-4 border-b border-slate-700 text-sm">
                          <p className="underline font-medium mb-1">Company's Bank Details</p>
                          <div className="grid grid-cols-[120px_1fr] gap-x-2 gap-y-0.5">
                            <span className="text-slate-600">A/c Holder's Name</span>
                            <span className="font-bold text-slate-900">: {companySettings?.bankDetails?.accountHolderName || 'N/A'}</span>
                            <span className="text-slate-600">Bank Name</span>
                            <span className="font-bold text-slate-900">: {companySettings?.bankDetails?.bankName || 'N/A'}</span>
                            <span className="text-slate-600">A/c No.</span>
                            <span className="font-bold text-slate-900">: {companySettings?.bankDetails?.accountNo || 'N/A'}</span>
                            <span className="text-slate-600">Branch & IFS Code</span>
                            <span className="font-bold text-slate-900">: {companySettings?.bankDetails?.branchName ? `${companySettings.bankDetails.branchName}, ` : ''}{companySettings?.bankDetails?.ifscCode || 'N/A'}</span>
                          </div>
                        </div>

                        {/* Signatory */}
                        <div className="p-4 flex-1 flex flex-col justify-between min-h-[120px] text-right text-sm">
                          <p className="font-bold text-slate-900">for AK Solutions RETAIL PVT LTD</p>
                          <div className="mt-auto">
                            <p className="text-slate-500 whitespace-pre-wrap leading-tight">{companySettings?.authorizedSignatoryText || 'Authorised Signatory'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tax Breakdown */}
                  {selectedInvoice.taxBreakdown && selectedInvoice.taxBreakdown.length > 0 && (
                    <div className="mb-6">
                      <div className="border border-slate-200 rounded-xl overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs md:text-sm min-w-[600px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              <th className="px-4 py-2 font-semibold text-slate-700 whitespace-nowrap">HSN/SAC</th>
                              <th className="px-4 py-2 font-semibold text-slate-700 text-right whitespace-nowrap">Taxable Value</th>
                              <th className="px-4 py-2 font-semibold text-slate-700 text-right whitespace-nowrap">CGST Rate</th>
                              <th className="px-4 py-2 font-semibold text-slate-700 text-right whitespace-nowrap">CGST Amt</th>
                              <th className="px-4 py-2 font-semibold text-slate-700 text-right whitespace-nowrap">SGST Rate</th>
                              <th className="px-4 py-2 font-semibold text-slate-700 text-right whitespace-nowrap">SGST Amt</th>
                              <th className="px-4 py-2 font-semibold text-slate-700 text-right whitespace-nowrap">Total Tax Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedInvoice.taxBreakdown.map((tax, i) => (
                              <tr key={i}>
                                <td className="px-4 py-2 text-slate-900 font-medium">{tax.hsn}</td>
                                <td className="px-4 py-2 text-slate-900 text-right"> {tax.taxableValue?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="px-4 py-2 text-slate-600 text-right">{tax.cgstRate}%</td>
                                <td className="px-4 py-2 text-slate-600 text-right"> {tax.cgstAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="px-4 py-2 text-slate-600 text-right">{tax.sgstRate}%</td>
                                <td className="px-4 py-2 text-slate-600 text-right"> {tax.sgstAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="px-4 py-2 font-bold text-slate-900 text-right"> {tax.totalTaxAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Amount in words */}
                  {selectedInvoice.totalAmountInWords && (
                    <div className="mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                      <p className="text-sm font-semibold text-blue-900 mb-1">Total Amount (in words)</p>
                      <p className="text-sm text-blue-800 font-medium">{selectedInvoice.totalAmountInWords}</p>
                    </div>
                  )}

                  {/* Bank Details & Terms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {selectedInvoice.bankDetails && selectedInvoice.bankDetails.name && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-900 mb-3">Bank Details</h3>
                        <div className="space-y-1.5 text-sm text-slate-600">
                          <p><span className="font-medium text-slate-700 inline-block w-24">Name:</span> {selectedInvoice.bankDetails.name}</p>
                          <p><span className="font-medium text-slate-700 inline-block w-24">IFSC Code:</span> {selectedInvoice.bankDetails.ifscCode}</p>
                          <p><span className="font-medium text-slate-700 inline-block w-24">Account No:</span> {selectedInvoice.bankDetails.accountNo}</p>
                          <p><span className="font-medium text-slate-700 inline-block w-24">Bank:</span> {selectedInvoice.bankDetails.bankName}</p>
                        </div>
                      </div>
                    )}

                    {selectedInvoice.termsAndConditions && selectedInvoice.termsAndConditions.length > 0 && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-900 mb-3">Terms and Conditions</h3>
                        <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-600">
                          {selectedInvoice.termsAndConditions.map((term, i) => (
                            <li key={i}>{term}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setSelectedInvoice(null)} className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors">
                Close
              </button>
              <button onClick={() => setShowWhatsappModal(true)} className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-sm">
                <MessageCircle className="w-4 h-4" /> Share on WhatsApp
              </button>
              <button onClick={() => printInvoice({ invoice: selectedInvoice, companySettings, user, rfp: selectedRfp })} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm">
                <Printer className="w-4 h-4" /> Print PDF
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* WhatsApp Share Modal */}
      {showWhatsappModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-emerald-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Share via WhatsApp</h3>
                  <p className="text-xs text-slate-500">Send Invoice Details to any Number</p>
                </div>
              </div>
              <button onClick={() => setShowWhatsappModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-emerald-100 rounded-full transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">WhatsApp Mobile Number</label>
              <div className="flex flex-col gap-2">
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  autoFocus
                />
                <p className="text-xs text-slate-500">Include country code (e.g. +91). A chat will open with pre-filled invoice details.</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowWhatsappModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!whatsappNumber) {
                    alert('Please enter a WhatsApp number');
                    return;
                  }

                  const formattedNumber = whatsappNumber.replace(/[^\d+]/g, '');
                  const invoiceItems = selectedInvoice.items || [];
                  const computedTotal = (invoiceItems && invoiceItems.length > 0) ? invoiceItems.reduce((acc, item) => acc + ((item.rate || item.unitPrice || 0) * (item.quantity || 0) * (1 + ((item.taxRate || 18) / 100))), 0) : selectedInvoice.amount;
                  const formattedTotal = computedTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
                  const date = new Date(selectedInvoice.createdAt).toLocaleDateString('en-GB');

                  const message = `Hello,\n\nHere are the details for your recent AK Solutions Retail Invoice:\n\n*Invoice No:* ${selectedInvoice.invoiceNumber || 'N/A'}\n*Date:* ${date}\n*Total Amount:* ${formattedTotal}\n*Status:* ${selectedInvoice.paymentStatus || 'Pending'}\n\nPlease check your email or partner portal to download the full PDF.`;

                  const encodedMessage = encodeURIComponent(message);
                  const waUrl = `https://wa.me/${formattedNumber}?text=${encodedMessage}`;

                  window.open(waUrl, '_blank');

                  setShowWhatsappModal(false);
                  setWhatsappNumber('');
                }}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
                Open WhatsApp
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
