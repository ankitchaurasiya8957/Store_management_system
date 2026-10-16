import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreHorizontal, ChevronDown, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; const tableVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const getStatusStyles = (status) => {
  switch (status) {
    case 'Approved': return { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Approved' };
    case 'Draft': return { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Draft' };
    case 'Under Review': return { bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Under Review' };
    case 'Submitted': return { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending Admin Approval' };
    case 'Quotation Received': return { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Quotation Received' };
    case 'Rejected': return { bg: 'bg-red-50', text: 'text-red-700', label: 'Rejected' };
    case 'Accepted': return { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Accepted' };
    case 'Pending Review': return { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending Review' };
    case 'Confirmed': return { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Confirmed' };
    case 'Delivered': return { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Delivered' };
    case 'Pending': return { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending' };
    default: return { bg: 'bg-slate-100', text: 'text-slate-700', label: status };
  }
};

import { AuthContext } from '../../../context/AuthContext';
import { fetchWithAuth } from '../../../utils/api.js';

export default function ProcurementTables() {
  const { user } = useContext(AuthContext) || { user: null };
  const navigate = useNavigate();
  const [rfps, setRfps] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [companySettings, setCompanySettings] = useState(null);
  const [selectedRfp, setSelectedRfp] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [rfpSearch, setRfpSearch] = useState('');
  const [showRfpSearch, setShowRfpSearch] = useState(false);
  const [rfpFilter, setRfpFilter] = useState('All');
  const [qtFilter, setQtFilter] = useState('All');

  const statuses = ['All', 'Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Quotation Received'];
  const qtStatuses = ['All', 'Pending', 'Approved', 'Rejected'];

  const filteredRfps = rfps.filter(rfp => {
    const matchesSearch = (rfp.rfpId || '').toLowerCase().includes(rfpSearch.toLowerCase()) || (rfp.title || '').toLowerCase().includes(rfpSearch.toLowerCase());
    const matchesFilter = rfpFilter === 'All' || rfp.status === rfpFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredQuotations = quotations.filter(qt => {
    return qtFilter === 'All' || qt.status === qtFilter;
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.userId) return;
      try {
        const [rfpRes, qtRes, settingsRes] = await Promise.all([
          fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/procurement/rfp?userId=${user.userId}`),
          fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/procurement/quotations?userId=${user.userId}`),
          fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/settings/company`)
        ]);
        if (rfpRes.ok) {
          const rfpData = await rfpRes.json();
          setRfps(rfpData.slice(0, 5)); // Limit to 5 recent
        }
        if (qtRes.ok) {
          const qtData = await qtRes.json();
          setQuotations(qtData.slice(0, 5));
        }
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setCompanySettings(settingsData);
        }
      } catch (err) {
        console.error('Failed to fetch table data:', err);
      }
    };
    fetchData();
  }, [user]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

        {/* Recent RFPs - Card List Layout */}
        <motion.div variants={tableVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          {/* HATA DIYA GAYA HAI: border-b border-slate-100 */}
          <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-slate-900">Recent RFPs</h2>
            <div className="flex items-center gap-2 relative">
              {showRfpSearch && (
                <input
                  type="text"
                  placeholder="Search RFPs..."
                  value={rfpSearch}
                  onChange={(e) => setRfpSearch(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 w-40"
                  autoFocus
                />
              )}
              <button onClick={() => setShowRfpSearch(!showRfpSearch)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <div className="relative group">
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-100 shadow-xl rounded-xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                  {statuses.map(s => (
                    <button key={s} onClick={() => setRfpFilter(s)} className={`block w-full text-left px-4 py-2 text-sm ${rfpFilter === s ? 'text-blue-600 bg-blue-50 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                      {s === 'Submitted' ? 'Pending' : s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* HATA DIYA GAYA HAI: divide-y divide-slate-100 */}
          <div className="pb-2">
            {filteredRfps.length > 0 ? filteredRfps.map((rfp) => {
              const styles = getStatusStyles(rfp.status);
              const date = new Date(rfp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              return (
                <div
                  key={rfp._id}
                  onClick={() => setSelectedRfp(rfp)}
                  className="p-4 hover:bg-slate-50/80 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-blue-600 text-sm group-hover:underline">{rfp.rfpId}</span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles.bg} ${styles.text}`}>
                      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current"></span>
                      {styles.label || rfp.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 font-medium">{rfp.title}</span>
                    <span className="text-sm text-slate-600 font-semibold">{date}</span>
                  </div>
                </div>
              );
            }) : <div className="p-4 text-sm text-slate-500">No recent RFPs.</div>}

          </div>
        </motion.div>

        {/* Recent Quotations - Card List Layout */}
        <motion.div variants={tableVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          {/* HATA DIYA GAYA HAI: border-b border-slate-100 */}
          <div className="p-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Quotations</h2>
            <div className="flex gap-2 relative group">
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors">
                {qtFilter === 'All' ? 'Filter' : (qtFilter === 'Pending' ? 'Pending Admin Approval' : qtFilter)} <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-100 shadow-xl rounded-xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                {qtStatuses.map(s => (
                  <button key={s} onClick={() => setQtFilter(s)} className={`block w-full text-left px-4 py-2 text-sm ${qtFilter === s ? 'text-blue-600 bg-blue-50 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                    {s === 'Pending' ? 'Pending Admin Approval' : s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* HATA DIYA GAYA HAI: divide-y divide-slate-100 */}
          <div className="pb-2">
            {filteredQuotations.length > 0 ? filteredQuotations.map((qt) => {
              const styles = getStatusStyles(qt.status);
              const date = new Date(qt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              return (
                <div
                  key={qt._id}
                  onClick={() => setSelectedQuotation(qt)}
                  className="p-4 hover:bg-slate-50/80 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-blue-600 text-sm group-hover:underline">{qt.quotationNo || qt.quotationId || 'QT-XXXX'}</span>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles.bg} ${styles.text}`}>
                      {styles.label || qt.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 font-medium">{qt.vendorName || (qt.vendor === 'TBD' ? 'AK Solutions Retail' : qt.vendor) || 'AK Solutions Retail'}</span>
                    <span className="text-sm text-slate-600 font-semibold">{date}</span>
                  </div>
                </div>
              );
            }) : <div className="p-4 text-sm text-slate-500">No recent quotations.</div>}
          </div>
        </motion.div>

      </div>

      {/* View RFP Modal */}
      {selectedRfp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedRfp.title}</h2>
                <p className="text-sm text-slate-500 mt-1">RFP ID: {selectedRfp.rfpId}</p>
              </div>
              <button onClick={() => setSelectedRfp(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Expected Delivery Date</p>
                  <p className="text-slate-900 font-semibold">{new Date(selectedRfp.expectedDeliveryDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Priority</p>
                  <p className="text-slate-900 font-semibold">{selectedRfp.priority}</p>
                </div>
                {selectedRfp.remarks && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-slate-500 mb-1">Remarks</p>
                    <p className="text-slate-900 bg-slate-50 p-4 rounded-xl text-sm border border-slate-100">{selectedRfp.remarks}</p>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-4">Product Requirements</h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-sm font-semibold text-slate-700">Category</th>
                      <th className="px-4 py-3 text-sm font-semibold text-slate-700">Brand</th>
                      <th className="px-4 py-3 text-sm font-semibold text-slate-700">Model</th>
                      <th className="px-4 py-3 text-sm font-semibold text-slate-700">Configuration</th>
                      <th className="px-4 py-3 text-sm font-semibold text-slate-700 text-center">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedRfp.products?.map((p, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-slate-900">{p.category}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{p.brand}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{p.model}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 max-w-[200px] truncate" title={p.configuration}>{p.configuration}</td>
                        <td className="px-4 py-3 text-sm text-slate-900 text-center font-medium">{p.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => navigate('/channel/rfp', { state: { openRfp: selectedRfp } })} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors mr-3">
                Manage Details
              </button>
              <button onClick={() => setSelectedRfp(null)} className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
                  <p className="font-bold text-emerald-600">
                    ₹{(() => {
                      const fallbackAmount = selectedQuotation.amount || selectedQuotation.totalAmount || 0;
                      if (selectedQuotation.items && selectedQuotation.items.length > 0) {
                        return selectedQuotation.items.reduce((sum, item) => sum + (item.totalAmount || (item.unitPrice * (item.quantity || 1)) || 0), 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
                      }
                      return (fallbackAmount).toLocaleString('en-IN', { maximumFractionDigits: 2 });
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Valid Until</p>
                  <p className="text-slate-900 font-semibold">{new Date(selectedQuotation.validUntil || Date.now()).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Status</p>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                    {selectedQuotation.status}
                  </span>
                </div>
              </div>

              {selectedQuotation.items && selectedQuotation.items.length > 0 && (
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
                        {selectedQuotation.items.map((item, i) => {
                          const unitPrice = item.unitPrice || 0;
                          const qty = item.quantity || 1;
                          const total = unitPrice * qty;
                          const gstMultiplier = 1 + (companySettings?.globalGstPercentage ?? 18) / 100;
                          const base = total / gstMultiplier;
                          const gst = total - base;

                          return (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 text-sm text-slate-900">{item.name || item.productName || item.brand}</td>
                              <td className="px-4 py-3 text-sm text-slate-900 text-center font-medium">{qty}</td>
                              <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">₹{base?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || 0}</td>
                              <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">₹{gst.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                              <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => navigate('/channel/quotations', { state: { openQuotation: selectedQuotation } })} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors mr-3">
                Manage Details
              </button>
              <button onClick={() => setSelectedQuotation(null)} className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors">
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
