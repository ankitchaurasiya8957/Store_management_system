import React, { useState, useContext } from 'react';
import { useFranchise } from '../context/FranchiseContext';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Trash2, ShoppingCart, XCircle, Printer, Receipt } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { printInvoice } from '../../../../utils/printUtils';
import { AuthContext } from '../../../../context/AuthContext';
import { numberToWords } from '../../../../utils/numberToWords';

export default function Procurement() {
  const { techhansaCatalog, b2bInvoices, approveB2BInvoice, orders, submitOrderRequest, metrics, storeProfileData, companySettings } = useFranchise();
  const { user } = useContext(AuthContext) || { user: null };
  const [activeTab, setActiveTab] = useState('catalog');
  const navigate = useNavigate();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [trackingInvoice, setTrackingInvoice] = useState(null);

  const resolvedCompanySettings = companySettings || {
    companyName: 'AK Solutions RETAIL PVT LTD',
    registeredAddress: 'REGD. OFF-SHI 8/27A-K-3 GILAT BAZAR BYPASS\nSHIVPURKOT, VARANASI, UP-221002',
    gstin: 'N/A',
    stateName: 'N/A',
    contactNumber: '+91-7007650206 , 9711888951',
    email: 'finance@AK Solutions.com'
  };

  const initialFormState = {
    catalogItemId: '',
    hardwareType: '',
    category: '',
    brand: '',
    model: '',
    productName: '',
    quantity: 1,
    specs: {},
    comments: '',
    price: 0,
    amount: 0
  };
  const [formData, setFormData] = useState(initialFormState);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');

  // handleDownloadPDF removed as we now show a modal instead

  const categories = [...new Set(techhansaCatalog.map(item => (item.category?.trim() || item.name?.trim())).filter(Boolean))];
  const brands = [...new Set(techhansaCatalog.filter(item => !selectedCategory || (item.category?.trim() || item.name?.trim()) === selectedCategory).map(item => item.brand?.trim()).filter(Boolean))];
  const models = [...new Set(techhansaCatalog.filter(item =>
    (!selectedCategory || (item.category?.trim() || item.name?.trim()) === selectedCategory) &&
    (!selectedBrand || item.brand?.trim() === selectedBrand)
  ).map(item => item.model?.trim()).filter(Boolean))];

  const specifications = techhansaCatalog.filter(item =>
    (!selectedCategory || (item.category?.trim() || item.name?.trim()) === selectedCategory) &&
    (!selectedBrand || item.brand?.trim() === selectedBrand) &&
    (!selectedModel || item.model?.trim() === selectedModel)
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'quantity') {
        updated.amount = updated.price * Number(value);
      }
      return updated;
    });
  };

  const handleSpecChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      specs: { ...prev.specs, [name]: value }
    }));
  };

  const handleHardwareTypeChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      hardwareType: value,
      specs: {} // Reset specs when hardware type changes
    }));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!formData.catalogItemId || !formData.quantity) {
      toast.error("Please select a product and quantity");
      return;
    }
    setOrderItems(prev => [...prev, { ...formData, id: Date.now() }]);
    setFormData(initialFormState);
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedModel('');
    toast.success("Item added to order list");
  };

  const handleRemoveItem = (id) => {
    setOrderItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmitOrder = async () => {
    if (orderItems.length === 0) {
      toast.error("Order list is empty. Add items first.");
      return;
    }

    // Add to submitted orders via context
    const result = await submitOrderRequest(orderItems);

    if (result.success) {
      toast.success("Order request sent to AK Solutions Admin for verification.");
      setIsModalOpen(false);
      setOrderItems([]);
      setFormData(initialFormState);
      setSelectedCategory('');
      setSelectedBrand('');
      setSelectedModel('');
    } else {
      toast.error(result.message || "Failed to submit order request. Please try again.");
    }
  };

  const renderDynamicSpecs = () => {
    return null;
  }

  return (
    <div className="space-y-6 relative">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">B2B Procurement</h1>
        <p className="text-slate-500">Order new stock from AK Solutions or approve pending invoices.</p>
      </div>

      <div className="flex border-b border-slate-200">
        <button
          className={`py-3 px-6 font-semibold text-sm ${activeTab === 'catalog' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}
          onClick={() => setActiveTab('catalog')}
        >
          Order Requests
        </button>
        <button
          className={`py-3 px-6 font-semibold text-sm ${activeTab === 'approvals' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}
          onClick={() => setActiveTab('approvals')}
        >
          Pending Approvals
        </button>
        <button
          className={`py-3 px-6 font-semibold text-sm ${activeTab === 'quotations' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}
          onClick={() => setActiveTab('quotations')}
        >
          Quotations
        </button>
        <button
          className={`py-3 px-6 font-semibold text-sm ${activeTab === 'invoices' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500'}`}
          onClick={() => setActiveTab('invoices')}
        >
          Invoices
        </button>
      </div>

      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Your Recent Requests</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" />
              New Order Request
            </button>
          </div>

          {orders && orders.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {[...orders].sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)).map(order => (
                <div key={order._id || order.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-500 font-medium">Request ID</p>
                      <p className="font-bold text-slate-800">{order.requestId || order._id?.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 font-medium">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${order.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' :
                          order.status === 'DISPATCHED' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' :
                              order.status === 'APPROVED' ? 'bg-amber-100 text-amber-700' :
                                'bg-slate-100 text-slate-700'
                        }`}>
                        {order.status || 'PENDING'}
                      </span>
                    </div>
                  </div>
                  <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white text-slate-400 text-xs uppercase border-b border-slate-100">
                          <th className="px-6 py-3 font-semibold">Category</th>
                          <th className="px-6 py-3 font-semibold">Brand</th>
                          <th className="px-6 py-3 font-semibold">Specs</th>
                          <th className="px-6 py-3 font-semibold text-center">Qty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {order.items && order.items.length > 0 ? order.items.map((item, idx) => {
                          return (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-slate-800">
                                {item.category || (item.hardwareType === 'Others' ? item.otherType : item.hardwareType)}
                              </td>
                              <td className="px-6 py-4 text-slate-600 font-medium">{item.brand || '-'}</td>
                              <td className="px-6 py-4 text-sm text-slate-500">
                                {typeof item.specs === 'string' && item.specs ? (
                                  <span className="block">{item.specs}</span>
                                ) : (item.specs && typeof item.specs === 'object' && Object.keys(item.specs).length > 0) ? (
                                  Object.entries(item.specs).map(([key, val]) => (
                                    val ? <span key={key} className="block"><span className="font-medium text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span> {val}</span> : null
                                  ))
                                ) : (typeof item.configuration === 'string' && item.configuration) ? (
                                  <span className="block">{item.configuration}</span>
                                ) : (item.configuration && typeof item.configuration === 'object' && Object.keys(item.configuration).length > 0) ? (
                                  <span className="block">{JSON.stringify(item.configuration)}</span>
                                ) : (
                                  <span className="text-slate-400 italic">None</span>
                                )}
                                {item.comments && <span className="block mt-1 italic">"{item.comments}"</span>}
                              </td>
                              <td className="px-6 py-4 text-center font-bold text-indigo-600">{item.quantity}</td>
                            </tr>
                          );
                        }) : (
                          <tr>
                            <td colSpan="4" className="px-6 py-4 text-center text-slate-500 italic">
                              Legacy order items not structured for detailed view.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8 text-indigo-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">No active requests</h3>
              <p className="text-slate-500 max-w-md mx-auto mb-6">You haven't submitted any B2B hardware requests yet. Click the button above to create your first order.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2.5 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors"
              >
                Create New Request
              </button>
            </div>
          )}
        </div>
      )}

      {(activeTab === 'approvals' || activeTab === 'quotations' || activeTab === 'invoices') && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase">
                <th className="px-4 py-3 text-left">Request ID</th>
                <th className="px-4 py-3 text-left">Document ID</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Invoice</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {b2bInvoices.filter(inv => {
                if (activeTab === 'approvals') return inv.status === 'Pending';
                if (activeTab === 'quotations') return inv.status !== 'Pending' && inv.type === 'Quotation';
                if (activeTab === 'invoices') return inv.status !== 'Pending' && inv.type === 'Invoice';
                return false;
              }).map(inv => {
                const getInvoiceAmount = () => {
                  let itemsList = (inv.items && inv.items.length > 0) ? inv.items : [];
                  if (itemsList.length === 0 && inv.requestId && orders && orders.length > 0) {
                    const relatedOrder = orders.find(o => o.requestId === inv.requestId);
                    if (relatedOrder && relatedOrder.items && relatedOrder.items.length > 0) {
                      itemsList = relatedOrder.items;
                    }
                  }

                  const gstMultiplier = 1 + (companySettings?.globalGstPercentage ?? 18) / 100;

                  if (itemsList.length > 0) {
                    const sum = itemsList.reduce((acc, curr) => acc + ((curr.rate || curr.unitPrice || curr.price || 0) * (curr.quantity || 1) * gstMultiplier), 0);
                    if (sum > 0) return sum;
                  }
                  return (inv.amount || 0) * gstMultiplier;
                };

                return (
                  <tr key={inv._id || inv.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-600">{inv.requestId || 'N/A'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{inv.documentNo || inv.invoiceNo || inv.id}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <span className={`px-2 py-1 rounded-full text-[10px] uppercase ${inv.type === 'Quotation' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {inv.type || 'Invoice'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{inv.date || new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right font-medium text-rose-600">₹{getInvoiceAmount().toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setSelectedInvoice(inv)} className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-sm font-medium w-full transition-colors mx-auto">
                        <Receipt className="w-4 h-4" /> View
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {inv.status === 'Pending' && (
                        <button
                          onClick={() => navigate('/franchise/checkout', { state: { invoice: inv, finalAmount: getInvoiceAmount() } })}
                          className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100"
                        >
                          Proceed to Checkout
                        </button>
                      )}
                      {inv.status === 'Paid' && (
                        <button
                          onClick={() => {
                            const relOrder = orders?.find(o => o.requestId === inv.requestId);
                            setTrackingInvoice(relOrder || { requestId: inv.requestId, notDispatched: true });
                          }}
                          className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-sm font-medium w-full transition-colors mx-auto"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18" /><path d="M14 9h4" /><path d="M14 15h4" /></svg>
                          Track
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {b2bInvoices.filter(inv => {
                if (activeTab === 'approvals') return inv.status === 'Pending';
                if (activeTab === 'quotations') return inv.status !== 'Pending' && inv.type === 'Quotation';
                if (activeTab === 'invoices') return inv.status !== 'Pending' && inv.type === 'Invoice';
                return false;
              }).length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-4 py-6 text-center text-slate-500 italic">
                      No {activeTab === 'approvals' ? 'pending approvals' : activeTab === 'quotations' ? 'quotations' : 'invoices'} found.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tracking Modal */}
      {trackingInvoice && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-indigo-50 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Delivery Tracking</h2>
                <p className="text-sm text-slate-500 mt-1">Request ID: {trackingInvoice.requestId}</p>
              </div>
              <button onClick={() => setTrackingInvoice(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-indigo-100 rounded-full transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {trackingInvoice.trackingId || trackingInvoice.trackingInfo?.courier ? (
                <>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Courier Partner</h3>
                    <p className="font-bold text-slate-800 text-lg">{trackingInvoice.trackingInfo?.courier || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Tracking ID</h3>
                    <p className="font-bold text-slate-800 text-lg font-mono">{trackingInvoice.trackingId || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Expected Delivery</h3>
                    <p className="font-bold text-slate-800 text-lg">
                      {trackingInvoice.expectedDelivery
                        ? new Date(trackingInvoice.expectedDelivery).toLocaleDateString('en-GB')
                        : 'N/A'}
                    </p>
                  </div>
                  {trackingInvoice.items?.some(item => item.assignedSerials && item.assignedSerials.length > 0) && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4 md:col-span-full">
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Dispatched Serial Numbers</h3>
                      <div className="space-y-3">
                        {trackingInvoice.items.map((item, idx) => {
                          if (!item.assignedSerials || item.assignedSerials.length === 0) return null;
                          return (
                            <div key={idx}>
                              <p className="text-sm font-bold text-slate-700 mb-1">{item.model || item.hardwareType || item.category || 'Product'}</p>
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

      {/* Request Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[50] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[85vh] flex overflow-hidden">

            {/* Left Column: Form to add items */}
            <div className="w-3/5 border-r border-slate-100 flex flex-col h-full bg-white min-h-0">
              <div className="flex justify-between items-center p-6 border-b border-slate-100 flex-shrink-0">
                <h3 className="text-xl font-bold text-slate-800">Add Item to Order</h3>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <form id="add-item-form" onSubmit={handleAddItem} className="space-y-5">

                  {/* Catalog Selection & Quantity */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">Category</label>
                      <select
                        value={selectedCategory}
                        onChange={e => {
                          setSelectedCategory(e.target.value);
                          setSelectedBrand('');
                          setSelectedModel('');
                          setFormData(prev => ({ ...prev, catalogItemId: '', specs: {}, hardwareType: '', brand: '', price: 0 }));
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                      >
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">Brand</label>
                      <select
                        value={selectedBrand}
                        onChange={e => {
                          setSelectedBrand(e.target.value);
                          setSelectedModel('');
                          setFormData(prev => ({ ...prev, catalogItemId: '', specs: {}, hardwareType: '', brand: '', price: 0 }));
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                      >
                        <option value="">All Brands</option>
                        {brands.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">Model</label>
                      <select
                        value={selectedModel}
                        onChange={e => {
                          setSelectedModel(e.target.value);
                          setFormData(prev => ({ ...prev, catalogItemId: '', specs: {}, hardwareType: '', brand: '', price: 0 }));
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                      >
                        <option value="">All Models</option>
                        {models.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-slate-700">Specification (Finalize)</label>
                      <select
                        value={formData.catalogItemId}
                        onChange={e => {
                          const item = techhansaCatalog.find(i => i._id === e.target.value);
                      if (item) {
                            const itemPrice = item.b2bPrice || item.price || item.sellingPrice || 0;
                            setFormData(prev => ({
                        ...prev,
                        catalogItemId: item._id,
                      hardwareType: item.name?.trim(),
                      brand: item.brand?.trim() || 'N/A',
                      specs: {Category: item.category?.trim(), Model: item.model?.trim(), Specs: item.specs },
                      price: item.sellingPrice || 0,
                      amount: (item.sellingPrice || 0) * formData.quantity
                            }));
                          } else {
                        setFormData(prev => ({ ...prev, catalogItemId: '', price: 0, amount: 0, specs: {} }));
                          }
                        }}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                      >
                      <option value="">Select Specific Variant</option>
                      {specifications.map(item => {
                        const itemPrice = item.b2bPrice || item.price || item.sellingPrice || 0;

                        let specStr = item.model || 'Variant';
                        if (typeof item.specs === 'string' && item.specs) {
                          specStr = item.specs;
                        } else if (typeof item.specifications === 'string' && item.specifications) {
                          specStr = item.specifications;
                        } else if (item.specs && typeof item.specs === 'object' && Object.keys(item.specs).length > 0) {
                          specStr = Object.values(item.specs).filter(Boolean).join(', ') || item.model;
                        } else if (item.specifications && typeof item.specifications === 'object' && Object.keys(item.specifications).length > 0) {
                          specStr = Object.values(item.specifications).filter(Boolean).join(', ') || item.model;
                        } else if (typeof item.configuration === 'string' && item.configuration) {
                          specStr = item.configuration;
                        }

                        return (
                          <option key={item._id} value={item._id}>
                            {specStr} - Rs. {itemPrice.toLocaleString('en-IN')}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      value={formData.quantity}
                      onChange={e => {
                        const qty = parseInt(e.target.value) || 1;
                        setFormData(prev => ({ ...prev, quantity: qty, amount: prev.price * qty }));
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                      required
                    />
                  </div>
              </div>

              {/* Pricing Info */}
              <div className="p-4 bg-indigo-50 rounded-xl flex items-center justify-between border border-indigo-100">
                <div>
                  <p className="text-sm font-medium text-indigo-900">Unit Price: <span className="font-bold">Rs. {(formData.price || 0).toLocaleString('en-IN')}</span></p>
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-900">Item Total: <span className="font-bold text-lg text-indigo-700">Rs. {(formData.amount || 0).toLocaleString('en-IN')}</span></p>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Additional Comments / Remarks</label>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                  rows="2"
                />
              </div>
            </form>
          </div>
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex-shrink-0 flex justify-between items-center">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-item-form"
              className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add to Order
            </button>
          </div>
        </div>

            {/* Right Column: Order Summary & Submission */}
      <div className="w-2/5 flex flex-col h-full bg-slate-50 min-h-0">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 flex-shrink-0">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-indigo-600" />
            Order Summary
          </h3>
          <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 bg-white rounded-full shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {orderItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingCart className="w-12 h-12 mb-3 text-slate-300" />
              <p className="font-medium">No items added yet</p>
              <p className="text-sm text-center mt-1">Fill the form and add items to your order list.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orderItems.map((item, index) => (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800">
                      {item.hardwareType === 'Others' ? item.otherType : item.hardwareType}
                    </h4>
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-lg">
                      Qty: {item.quantity}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">
                    <span className="font-semibold text-slate-700">Brand:</span> {item.brand}
                  </p>

                  {/* Display Specs summary */}
                  {(typeof item.specs === 'string' && item.specs) ? (
                    <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg mt-2 mb-1">
                      {item.specs}
                    </div>
                  ) : (item.specs && typeof item.specs === 'object' && Object.keys(item.specs).length > 0) ? (
                    <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg mt-2 mb-1">
                      {Object.entries(item.specs).map(([key, val]) => (
                        val ? <div key={key}><span className="capitalize font-medium">{key.replace(/([A-Z])/g, ' $1').trim()}:</span> {val}</div> : null
                      ))}
                    </div>
                  ) : null}

                  {item.comments && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 italic">
                      "{item.comments}"
                    </p>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                    <p className="text-xs text-slate-500">Unit: ₹{item.price?.toLocaleString() || 0}</p>
                    <p className="text-sm font-bold text-slate-800">
                      Total: ₹{item.amount?.toLocaleString() || (item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="absolute -top-2 -right-2 bg-rose-100 text-rose-600 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-200"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex-shrink-0">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold text-slate-600">Total Items:</span>
            <span className="text-lg font-bold text-slate-800">{orderItems.reduce((acc, item) => acc + Number(item.quantity), 0)}</span>
          </div>
          <button
            onClick={handleSubmitOrder}
            disabled={orderItems.length === 0}
            className={`w-full py-3.5 rounded-xl font-bold shadow-sm transition-colors text-white ${orderItems.length > 0
              ? 'bg-indigo-600 hover:bg-indigo-700'
              : 'bg-slate-300 cursor-not-allowed'
              }`}
          >
            Submit Order Request
          </button>
        </div>
      </div>

    </div>
        </div >
      )
}

{/* View Invoice Modal */ }
{
  selectedInvoice && (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-7xl h-[125vh] max-h-[125vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Invoice Details</h2>
            <p className="text-sm text-slate-500 mt-1">{selectedInvoice.invoiceNo || selectedInvoice.invoiceId || 'N/A'}</p>
          </div>
          <button onClick={() => setSelectedInvoice(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="flex flex-col md:flex-row border border-slate-700 mb-6">
            <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-slate-700">
              <div className="p-4 border-b border-slate-700">
                <h3 className="font-bold text-slate-900 uppercase">{resolvedCompanySettings.companyName}</h3>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{resolvedCompanySettings.registeredAddress}</p>
                <div className="mt-2 text-sm text-slate-700 space-y-0.5">
                  <p><strong>GSTIN/UIN:</strong> {resolvedCompanySettings.gstin}</p>
                  <p><strong>State Name:</strong> {resolvedCompanySettings.stateName}</p>
                  <p><strong>Contact:</strong> {resolvedCompanySettings.contactNumber}</p>
                  <p><strong>E-Mail:</strong> {resolvedCompanySettings.email}</p>
                </div>
              </div>
              <div className="p-4 flex-1">
                <h4 className="text-sm text-slate-500 mb-1">Buyer (Bill to)</h4>
                <p className="font-bold text-slate-900 uppercase">{storeProfileData?.storeName || storeProfileData?.companyName || storeProfileData?.franchiseName || user?.companyName || user?.name || 'AK Solutions Franchise'}</p>
                <p className="text-sm text-slate-700">{storeProfileData?.address || storeProfileData?.location || user?.address || 'Franchise Address'}</p>
                <p className="text-sm text-slate-700 mt-1"><strong>Phone:</strong> {storeProfileData?.contact || storeProfileData?.phone || storeProfileData?.contactNumber || user?.phone || 'N/A'}</p>
                <p className="text-sm text-slate-700"><strong>Email:</strong> {storeProfileData?.email || user?.email || 'N/A'}</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex border-b border-slate-700">
                <div className="flex-1 p-4 border-r border-slate-700">
                  <p className="text-sm text-slate-500">Invoice No.</p>
                  <p className="font-bold text-slate-900">{selectedInvoice.documentNo || selectedInvoice.invoiceNo || selectedInvoice.invoiceNumber || selectedInvoice.invoiceId || selectedInvoice.id || selectedInvoice._id || 'N/A'}</p>
                </div>
                <div className="flex-1 p-4">
                  <p className="text-sm text-slate-500">Dated</p>
                  <p className="font-bold text-slate-900">{selectedInvoice.date || new Date(selectedInvoice.createdAt || Date.now()).toLocaleDateString('en-GB')}</p>
                </div>
              </div>
              <div className="flex border-b border-slate-700">
                <div className="flex-1 p-4 border-r border-slate-700">
                  <p className="text-sm text-slate-500">Related Order</p>
                  <p className="font-bold text-slate-900">{selectedInvoice.requestId || selectedInvoice.orderId || selectedInvoice.orderRequestId || selectedInvoice.orderReference?.orderId || selectedInvoice.orderReference?.orderNumber || (typeof selectedInvoice.orderReference === 'string' ? selectedInvoice.orderReference : 'N/A')}</p>
                </div>
                <div className="flex-1 p-4">
                  <p className="text-sm text-slate-500">Mode/Terms of Payment</p>
                  <p className="font-bold text-slate-900">{selectedInvoice.paymentStatus || selectedInvoice.status || 'Paid'}</p>
                </div>
              </div>
              <div className="flex-1 p-4 border-b border-slate-700 flex flex-col justify-center">
                <p className="text-sm text-slate-500">Country</p>
                <p className="font-bold text-slate-900">India</p>
              </div>
              <div className="flex-1 p-4 flex flex-col justify-center">
                <p className="text-sm text-slate-500">Terms of Delivery</p>
                <p className="font-bold text-slate-900">As per standard terms</p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-4">Invoice Items</h3>
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
                {(() => {
                  let itemsList = [];
                  if (selectedInvoice.items && selectedInvoice.items.length > 0) {
                    itemsList = selectedInvoice.items;
                  } else if (selectedInvoice.requestId && orders && orders.length > 0) {
                    const relatedOrder = orders.find(o => o.requestId === selectedInvoice.requestId);
                    if (relatedOrder && relatedOrder.items && relatedOrder.items.length > 0) {
                      itemsList = relatedOrder.items;
                    }
                  }

                  if (itemsList.length === 0) {
                    itemsList = [{ productName: 'Procurement Services / Goods', quantity: 1, unitPrice: selectedInvoice.amount }];
                  }

                  const totalQtyAcrossAllItems = itemsList.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
                  const assumedRate = totalQtyAcrossAllItems > 0 ? selectedInvoice.amount / totalQtyAcrossAllItems : 0;

                  return itemsList.map((item, i) => {
                    const baseRate = item.rate || item.unitPrice || item.price || assumedRate;
                    const qty = item.quantity || 1;
                    const gstRate = companySettings?.globalGstPercentage ?? 18;
                    const baseAmt = baseRate * qty;
                    const gstAmt = baseAmt * (gstRate / 100);
                    const totalAmt = baseAmt + gstAmt;
                    const inclusiveRate = baseRate;

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
                      return '-';
                    })();

                    return (
                      <tr key={i} className="hover:bg-slate-50 transition-colors bg-white">
                        <td className="px-4 py-3 text-sm text-slate-900 text-center">{i + 1}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{item.hardwareType || item.productName || item.category || 'Item'}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{item.brand || '-'}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{item.model || item.hardwareType || item.productName || '-'}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 whitespace-pre-wrap break-words min-w-[200px]">{configStr}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{selectedInvoice.date || new Date(selectedInvoice.createdAt || Date.now()).toLocaleDateString('en-GB')}</td>
                        <td className="px-4 py-3 text-sm text-slate-900 text-center font-medium">{qty}</td>
                        <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">{inclusiveRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">{gstAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="px-4 py-3 text-sm text-slate-900 text-right font-bold text-emerald-600">{totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td colSpan="6" className="px-4 py-3 text-sm font-bold text-right text-slate-900 uppercase">Total</td>
                  <td className="px-4 py-3 text-sm font-bold text-center text-slate-900">
                    {(() => {
                      let itemsList = (selectedInvoice.items && selectedInvoice.items.length > 0) ? selectedInvoice.items : null;
                      if (!itemsList && selectedInvoice.requestId && orders) {
                        const relatedOrder = orders.find(o => o.requestId === selectedInvoice.requestId);
                        if (relatedOrder && relatedOrder.items) itemsList = relatedOrder.items;
                      }
                      itemsList = itemsList || [{ quantity: 1 }];
                      return itemsList.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
                    })()}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-right text-slate-900">-</td>
                  <td className="px-4 py-3 text-sm font-bold text-right text-slate-900">
                    {(() => {
                      let itemsList = (selectedInvoice.items && selectedInvoice.items.length > 0) ? selectedInvoice.items : null;
                      if (!itemsList && selectedInvoice.requestId && orders) {
                        const relatedOrder = orders.find(o => o.requestId === selectedInvoice.requestId);
                        if (relatedOrder && relatedOrder.items) itemsList = relatedOrder.items;
                      }
                      itemsList = itemsList || [{ quantity: 1 }];
                      const totalQty = itemsList.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
                      const assumedRate = totalQty > 0 ? selectedInvoice.amount / totalQty : 0;
                      const totalGst = itemsList.reduce((acc, curr) => {
                        const rate = curr.rate || curr.unitPrice || curr.price || assumedRate;
                        const qty = curr.quantity || 1;
                        const gstRate = companySettings?.globalGstPercentage ?? 18;
                        return acc + (rate * qty * (gstRate / 100));
                      }, 0);
                      return totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2 });
                    })()}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-right text-emerald-600">
                    {(() => {
                      let itemsList = (selectedInvoice.items && selectedInvoice.items.length > 0) ? selectedInvoice.items : null;
                      if (!itemsList && selectedInvoice.requestId && orders) {
                        const relatedOrder = orders.find(o => o.requestId === selectedInvoice.requestId);
                        if (relatedOrder && relatedOrder.items) itemsList = relatedOrder.items;
                      }
                      itemsList = itemsList || [{ quantity: 1 }];
                      const totalQty = itemsList.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
                      const assumedRate = totalQty > 0 ? selectedInvoice.amount / totalQty : 0;
                      const finalAmt = itemsList.reduce((acc, curr) => {
                        const rate = curr.rate || curr.unitPrice || curr.price || assumedRate;
                        const qty = curr.quantity || 1;
                        const gstRate = companySettings?.globalGstPercentage ?? 18;
                        const taxable = rate * qty;
                        return acc + taxable + (taxable * (gstRate / 100));
                      }, 0);
                      return finalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 });
                    })()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Financial Balances */}
          <div className="p-4 border-b border-slate-700 flex justify-between bg-white border border-slate-200 border-b-0 rounded-t-xl">
            <div className="text-sm flex items-center gap-2">
              <span className="text-slate-500">Received Amount:</span>
              <span className="font-bold text-emerald-600"> {(() => {
                const getModalTotal = () => {
                  let itemsList = (selectedInvoice.items && selectedInvoice.items.length > 0) ? selectedInvoice.items : null;
                  if (!itemsList && selectedInvoice.requestId && orders) {
                    const relatedOrder = orders.find(o => o.requestId === selectedInvoice.requestId);
                    if (relatedOrder && relatedOrder.items) itemsList = relatedOrder.items;
                  }
                  itemsList = itemsList || [{ quantity: 1 }];
                  const totalQty = itemsList.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
                  const assumedRate = totalQty > 0 ? selectedInvoice.amount / totalQty : 0;
                  return itemsList.reduce((acc, curr) => {
                    const rate = curr.rate || curr.unitPrice || curr.price || assumedRate;
                    const qty = curr.quantity || 1;
                    const gstRate = companySettings?.globalGstPercentage ?? 18;
                    return acc + (rate * qty) * (1 + (gstRate / 100));
                  }, 0);
                };
                const modalTotal = getModalTotal();
                const received = (selectedInvoice.paymentStatus === 'Paid' || selectedInvoice.status === 'Paid') ? modalTotal : 0;
                return received.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              })()}</span>
            </div>
            <div className="text-sm flex items-center gap-2">
              <span className="text-slate-500">Balance Amount:</span>
              <span className="font-bold text-amber-600"> {(() => {
                const getModalTotal = () => {
                  let itemsList = (selectedInvoice.items && selectedInvoice.items.length > 0) ? selectedInvoice.items : null;
                  if (!itemsList && selectedInvoice.requestId && orders) {
                    const relatedOrder = orders.find(o => o.requestId === selectedInvoice.requestId);
                    if (relatedOrder && relatedOrder.items) itemsList = relatedOrder.items;
                  }
                  itemsList = itemsList || [{ quantity: 1 }];
                  const totalQty = itemsList.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
                  const assumedRate = totalQty > 0 ? selectedInvoice.amount / totalQty : 0;
                  return itemsList.reduce((acc, curr) => {
                    const rate = curr.rate || curr.unitPrice || curr.price || assumedRate;
                    const qty = curr.quantity || 1;
                    const gstRate = companySettings?.globalGstPercentage ?? 18;
                    return acc + (rate * qty) * (1 + (gstRate / 100));
                  }, 0);
                };
                const modalTotal = getModalTotal();
                const received = (selectedInvoice.paymentStatus === 'Paid' || selectedInvoice.status === 'Paid') ? modalTotal : 0;
                const balance = Math.max(0, modalTotal - received);
                return balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              })()}</span>
            </div>
          </div>

          {/* Bottom Section: Declaration & Bank Details */}
          <div className="flex flex-col md:flex-row border border-slate-700 mb-6 rounded-b-xl overflow-hidden">
            {/* Left: Declaration */}
            <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-slate-700 flex flex-col bg-white">
              <div className="mb-4 text-sm">
                <p className="underline font-medium mb-1">Declaration</p>
                <p className="text-slate-700">We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
              </div>
            </div>

            {/* Right: Bank Details & Signatory */}
            <div className="flex-1 flex flex-col bg-white">
              <div className="p-4 border-b border-slate-700 text-sm">
                <p className="underline font-medium mb-1">Company's Bank Details</p>
                <div className="grid grid-cols-[120px_1fr] gap-x-2 gap-y-0.5">
                  <span className="text-slate-600">A/c Holder's Name</span>
                  <span className="font-bold text-slate-900">: {resolvedCompanySettings.bankDetails?.accountHolderName || 'N/A'}</span>
                  <span className="text-slate-600">Bank Name</span>
                  <span className="font-bold text-slate-900">: {resolvedCompanySettings.bankDetails?.bankName || 'N/A'}</span>
                  <span className="text-slate-600">A/c No.</span>
                  <span className="font-bold text-slate-900">: {resolvedCompanySettings.bankDetails?.accountNo || 'N/A'}</span>
                  <span className="text-slate-600">Branch & IFS Code</span>
                  <span className="font-bold text-slate-900">: {resolvedCompanySettings.bankDetails?.branchName ? `${resolvedCompanySettings.bankDetails.branchName}, ` : ''}{resolvedCompanySettings.bankDetails?.ifscCode || 'N/A'}</span>
                </div>
              </div>

              {/* Signatory */}
              <div className="p-4 flex-1 flex flex-col justify-between min-h-[120px] text-right text-sm">
                <p className="font-bold text-slate-900">for {resolvedCompanySettings.companyName}</p>
                <div className="mt-auto">
                  <p className="text-slate-500 whitespace-pre-wrap leading-tight">Verified by & Authorised Signatory<br />Company Secretary</p>
                </div>
              </div>
            </div>
          </div>

          {/* Amount in words */}
          <div className="mb-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
            <p className="text-sm font-semibold text-blue-900 mb-1">Total Amount (in words)</p>
            <p className="text-sm text-blue-800 font-medium">INR {(() => {
              const getModalTotal = () => {
                let itemsList = (selectedInvoice.items && selectedInvoice.items.length > 0) ? selectedInvoice.items : null;
                if (!itemsList && selectedInvoice.requestId && orders) {
                  const relatedOrder = orders.find(o => o.requestId === selectedInvoice.requestId);
                  if (relatedOrder && relatedOrder.items) itemsList = relatedOrder.items;
                }
                itemsList = itemsList || [{ quantity: 1 }];
                const totalQty = itemsList.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
                const assumedRate = totalQty > 0 ? selectedInvoice.amount / totalQty : 0;
                return itemsList.reduce((acc, curr) => {
                  const rate = curr.rate || curr.unitPrice || curr.price || assumedRate;
                  const qty = curr.quantity || 1;
                  const gstRate = companySettings?.globalGstPercentage ?? 18;
                  return acc + (rate * qty) * (1 + (gstRate / 100));
                }, 0);
              };
              return numberToWords(Math.round(getModalTotal()));
            })()} Only</p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={() => setSelectedInvoice(null)} className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors">
            Close
          </button>
          <button onClick={() => printInvoice({ invoice: selectedInvoice, companySettings: resolvedCompanySettings, user: storeProfileData || user })} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm">
            <Printer className="w-4 h-4" /> Print PDF
          </button>
        </div>
      </motion.div>
    </div>
  )
}
    </div >
  );
}
