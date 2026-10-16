import React, { useState, useEffect } from 'react';
import axios from '../../../api/axios';
import { motion } from 'framer-motion';
import { Search, ShoppingCart, Eye, Package, Calendar, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../../context/AuthContext';
import { useContext } from 'react';

export default function AllOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [companySettings, setCompanySettings] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: '', orderId: null, newStatus: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const { user } = useContext(AuthContext) || { user: null };

  useEffect(() => {
    fetchOrders();
    fetchCatalog();
    fetchCompanySettings();
  }, []);

  const fetchCompanySettings = async () => {
    try {
      const res = await axios.get('/api/settings/company');
      setCompanySettings(res.data);
    } catch (err) {
      console.error('Failed to fetch company settings', err);
    }
  };

  const fetchCatalog = async () => {
    try {
      const res = await axios.get('/api/admin/catalog?limit=1000');
      setCatalog(res.data.products || res.data || []);
    } catch (error) {
      console.error('Failed to fetch catalog:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Failed to fetch global orders:', error);
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId, orderType) => {
    try {
      fetchCatalog(); // Ensure catalog is fresh for stock warnings
      
      if (orderType === 'Franchise Procurement') {
        const res = await axios.get(`/api/admin/procurement-requests/${orderId}`);
        setSelectedOrder({ ...res.data, orderType });
      } else {
        const res = await axios.get(`/api/admin/orders/${orderId}`);
        setSelectedOrder({ ...res.data, orderType });
      }
      setIsModalOpen(true);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      toast.error('Failed to load order details');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (newStatus === 'Declined') {
      setConfirmDialog({ isOpen: true, type: 'decline', orderId, newStatus });
      return;
    }
    await processUpdateStatus(orderId, newStatus);
  };
  
  const processUpdateStatus = async (orderId, newStatus) => {
    setIsProcessing(true);
    try {
      const targetOrder = orders.find(o => o._id === orderId);
      if (targetOrder && targetOrder.orderType === 'Franchise Procurement') {
        if (newStatus === 'Declined') {
          // Franchise orders decline endpoint or update status
          await axios.patch(`/api/admin/procurement-requests/${orderId}/status`, { status: 'DECLINED' });
        }
      } else {
        await axios.patch(`/api/admin/orders/${orderId}/status`, { status: newStatus });
      }
      toast.success(`Order ${newStatus.toLowerCase()} successfully`);

      // Update local state handling different string cases
      const mappedStatus = (targetOrder && targetOrder.orderType === 'Franchise Procurement' && newStatus === 'Declined') ? 'Declined' : newStatus;

      setOrders(orders.map(o => o._id === orderId ? { ...o, status: mappedStatus } : o));
    } catch (error) {
      console.error('Failed to update order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApproveProcurement = async (orderId) => {
    setConfirmDialog({ isOpen: true, type: 'approve', orderId });
  };
  
  const processApproveProcurement = async (orderId) => {
    setIsProcessing(true);
    const finalAmount = getOrderAmount(selectedOrder);
    try {
      if (selectedOrder.orderType === 'Enterprise') {
        // Assume channel partner order: we patch status to 'Quotation Sent' (not directly implemented here but admin.js handles RFP approve elsewhere; wait, for standard orders without RFP? Let's just patch status)
        await axios.patch(`/api/admin/orders/${orderId}/status`, { status: 'Quotation Sent', amount: finalAmount });
        toast.success('Quotation sent successfully');
      } else {
        await axios.post(`/api/admin/procurement-requests/${orderId}/approve`, { totalAmount: finalAmount });
        toast.success('Quotation generated and sent to partner');
      }
      setIsModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Failed to send quotation:', error);
      toast.error(error.response?.data?.message || 'Failed to send quotation');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendToInventory = async (orderId) => {
    try {
      const targetOrder = orders.find(o => o._id === orderId);
      if (targetOrder && targetOrder.orderType === 'Franchise Procurement') {
          await axios.patch(`/api/admin/procurement-requests/${orderId}/status`, { status: 'Processing' });
      } else {
          await axios.patch(`/api/admin/orders/${orderId}/status`, { status: 'Processing' });
      }
      toast.success('Order sent to Inventory Manager successfully');
      fetchOrders();
    } catch (error) {
      console.error('Failed to send order to inventory manager:', error);
      toast.error(error.response?.data?.message || 'Failed to process order');
    }
  };

  const handleConfirmPayment = async (orderId) => {
    try {
      if (selectedOrder && selectedOrder.orderType === 'Enterprise') {
        await axios.patch(`/api/admin/orders/${orderId}/status`, { status: 'Paid' });
      } else {
        await axios.post(`/api/admin/procurement-requests/${orderId}/confirm-payment`);
      }
      toast.success('Payment confirmed successfully!');
      setIsModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      toast.error(error.response?.data?.message || 'Failed to confirm payment');
    }
  };

  const getDisplayStatus = (status, paymentStatus) => {
    if (paymentStatus === 'Rejected' || (status === 'Declined' && paymentStatus === 'Pending Verification')) return 'Payment Declined';
    if (status === 'Declined') return 'Declined';
    if (status === 'Paid') return 'Paid';
    if (status === 'Payment Verification' || paymentStatus === 'Pending Verification') return 'Verification Pending';
    if (status === 'Pending' || status === 'PENDING') return 'New Order';
    return status;
  };

  const getStatusColor = (status, paymentStatus) => {
    if (paymentStatus === 'Rejected' || (status === 'Declined' && paymentStatus === 'Pending Verification')) {
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
    }
    if (status === 'Paid') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
    if (status === 'Payment Verification' || paymentStatus === 'Pending Verification') {
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
    }

    switch (status) {
      case 'Pending':
      case 'PENDING': return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 'Quotation Sent': return 'bg-purple-500/10 text-purple-300 border border-purple-500/30';
      case 'Confirmed': return 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30';
      case 'Processing': return 'bg-blue-500/10 text-blue-400 border border-blue-500/30';
      case 'Dispatched': return 'bg-violet-500/10 text-violet-300 border border-violet-500/30';
      case 'Delivered': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
      case 'Declined': return 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || order.userId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || order.userRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getOrderAmount = (o) => {
    let items = [];
    const gstMultiplier = 1 + (companySettings?.globalGstPercentage ?? 18) / 100;
    if (o.orderType === 'Franchise Procurement' && o.items) {
      items = o.items;
    } else if (o.quotationReference?.rfpReference?.products) {
      items = o.quotationReference.rfpReference.products;
    }
    if (items.length > 0) {
      return items.reduce((sum, item) => sum + ((item.unitPrice || item.price || item.rate || 0) * (item.quantity || 1) * gstMultiplier), 0);
    }
    return (o.totalAmount || 0) * gstMultiplier;
  };

  const getCatalogMatch = (item) => {
    if (!item || !catalog || catalog.length === 0) return null;
    return catalog.find(c => {
      // 1. Franchise order match (hardwareType)
      if (item.hardwareType && c.name?.trim().toLowerCase() === item.hardwareType.trim().toLowerCase()) return true;
      
      // 2. Franchise order match via specs.model
      if (item.specs && typeof item.specs === 'object') {
        const model = item.specs.model || item.specs.Model;
        if (model && c.model?.trim().toLowerCase() === model.trim().toLowerCase()) return true;
      }

      // 3. Channel RFP match (model or name)
      if (item.model && c.model?.trim().toLowerCase() === item.model.trim().toLowerCase()) return true;
      if (item.name && c.name?.trim().toLowerCase() === item.name.trim().toLowerCase()) return true;

      return false;
    });
  };

  const hasStockWarning = selectedOrder ? (
    selectedOrder.orderType === 'Franchise Procurement' 
      ? (selectedOrder.items || []).some(item => {
          const match = getCatalogMatch(item);
          return match ? Number(item.quantity) > Number(match.availableStock) : false;
        })
      : (selectedOrder.quotationReference?.rfpReference?.products || []).some(item => {
          const match = getCatalogMatch(item);
          return match ? Number(item.quantity) > Number(match.availableStock) : false;
        })
  ) : false;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0C101A] p-6 rounded-2xl shadow-xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 text-[#00D2FF] border border-cyan-500/30 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <ShoppingCart size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Global Orders
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">Live</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Monitor and manage network-wide partner orders</p>
          </div>
        </div>
      </div>

      <div className="bg-[#0C101A] p-4 rounded-xl shadow-lg border border-white/5 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by Order ID or Partner ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#05070D] border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#00D2FF] focus:ring-1 focus:ring-[#00D2FF] transition-all text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-[#00D2FF] focus:ring-1 focus:ring-[#00D2FF] text-slate-200 bg-[#05070D] text-sm"
        >
          <option value="All">All Partners</option>
          <option value="franchise">Franchise Partners</option>
          <option value="channel">Channel Partners</option>
        </select>
      </div>

      <div className="bg-[#0C101A] rounded-2xl shadow-xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#101626] border-b border-white/5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Order Details</th>
                <th className="p-4">Partner</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-cyan-500 border-t-transparent mx-auto"></div>
                    <p className="mt-2 text-sm text-slate-400">Loading orders...</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400">
                    <Package className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, idx) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#00D2FF]">
                          <Package size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{order.orderNumber}</p>
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                            <Calendar size={12} />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 text-slate-200 border border-white/10">
                          {order.userId || 'Unknown'}
                        </span>
                        {order.userRole && (
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${order.userRole === 'franchise' ? 'text-[#00D2FF]' : 'text-[#FF007A]'}`}>
                            {order.userRole}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-white text-sm">
                      ₹{getOrderAmount(order).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-200">{order.paymentMethod || 'N/A'}</span>
                        <span className="text-xs text-slate-400">{order.paymentStatus === 'Paid' ? 'Verified' : order.paymentStatus}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status, order.paymentStatus)}`}>
                        {getDisplayStatus(order.status, order.paymentStatus)}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {getDisplayStatus(order.status, order.paymentStatus) === 'New Order' && (
                          <>
                            <button
                              onClick={() => handleViewOrder(order._id, order.orderType)}
                              className="p-2 text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-lg transition-colors inline-flex"
                              title="Send Quotation"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order._id, 'Declined')}
                              className="p-2 text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg transition-colors inline-flex"
                              title="Decline Order"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleViewOrder(order._id, order.orderType)}
                          className="p-2 text-[#00D2FF] hover:bg-cyan-500/10 border border-cyan-500/20 rounded-lg transition-colors inline-flex"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>

                        {order.status === 'Paid' && (order.orderType === 'Enterprise' || order.orderType === 'Franchise Procurement') && (user?.role === 'account_manager' || user?.role === 'finance_manager' || user?.role === 'admin') && (
                          <button
                            onClick={() => handleSendToInventory(order._id)}
                            className="p-2 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-lg hover:bg-purple-500/20 transition-colors"
                            title="Send to Inventory Manager"
                          >
                            <Package size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0C101A] border border-white/10 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#101626]/80">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 text-[#00D2FF] border border-cyan-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/10">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {getDisplayStatus(selectedOrder.status, selectedOrder.paymentStatus) === 'Verification Pending'
                      ? 'Payment Verification Pending'
                      : getDisplayStatus(selectedOrder.status, selectedOrder.paymentStatus) === 'New Order'
                        ? 'Send Quotation'
                        : 'Order Details'}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {getDisplayStatus(selectedOrder.status, selectedOrder.paymentStatus) === 'Verification Pending'
                      ? 'This order is currently awaiting payment verification by the Finance Department.'
                      : getDisplayStatus(selectedOrder.status, selectedOrder.paymentStatus) === 'New Order'
                        ? 'Review the order and confirm the final quotation amount.'
                        : 'View the complete details of this order.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors border border-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Status and Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#05070D] p-5 rounded-2xl border border-white/5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Status & Delivery</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm font-medium">Order Status</span>
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getStatusColor(selectedOrder.status, selectedOrder.paymentStatus)}`}>
                        {getDisplayStatus(selectedOrder.status, selectedOrder.paymentStatus)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm font-medium">Expected Delivery</span>
                      <span className="text-slate-200 text-sm font-bold">{selectedOrder.expectedDelivery ? new Date(selectedOrder.expectedDelivery).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#05070D] p-5 rounded-2xl border border-white/5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Payment Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm font-medium">Payment Status</span>
                      <span className="text-slate-200 text-sm font-bold">{selectedOrder.paymentStatus === 'Paid' ? 'Verified' : selectedOrder.paymentStatus}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm font-medium">Payment Method</span>
                      <span className="text-slate-200 text-sm font-bold">{selectedOrder.paymentMethod || 'N/A'}</span>
                    </div>
                    {selectedOrder.utr && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm font-medium">UTR No</span>
                        <span className="text-slate-200 text-sm font-bold">{selectedOrder.utr}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items List */}
              {selectedOrder.orderType === 'Franchise Procurement' ? (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Requested Items</h3>
                  <div className="bg-[#05070D] border border-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#101626] border-b border-white/5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          <th className="px-4 py-3">Hardware Type</th>
                          <th className="px-4 py-3">Brand & Specs</th>
                          <th className="px-4 py-3 text-right">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {selectedOrder.items?.map((item, index) => {
                          const catalogMatch = getCatalogMatch(item);
                          const isWarning = catalogMatch && Number(item.quantity) > Number(catalogMatch.availableStock);
                          const isOutOfStock = catalogMatch && Number(catalogMatch.availableStock) <= 0;

                          return (
                          <tr key={index} className="hover:bg-white/[0.02]">
                            <td className="px-4 py-3 font-semibold text-white text-sm">
                              {item.hardwareType === 'Other' ? item.otherType : item.hardwareType}
                            </td>
                            <td className="px-4 py-3">
                              <p className="text-sm font-semibold text-slate-200">{item.brand}</p>
                              {typeof item.specs === 'string' && item.specs ? (
                                <p className="text-xs text-slate-400 line-clamp-2">
                                  {item.specs}
                                </p>
                              ) : item.specs && typeof item.specs === 'object' && Object.keys(item.specs).length > 0 ? (
                                <p className="text-xs text-slate-400 line-clamp-2">
                                  {Object.entries(item.specs).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                </p>
                              ) : null}
                              {item.comments && (
                                <p className="text-xs text-amber-400 mt-1 line-clamp-1 italic">"{item.comments}"</p>
                              )}
                              {catalogMatch && isWarning && (
                                <p className="text-xs text-rose-400 mt-1 font-semibold flex items-center gap-1">
                                  ⚠️ {isOutOfStock ? 'Out of stock' : `Only ${catalogMatch.availableStock} in stock`}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-white text-right">{item.quantity}</td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : selectedOrder.quotationReference?.rfpReference?.products && (
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Ordered Items</h3>
                  <div className="bg-[#05070D] border border-white/5 rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#101626] border-b border-white/5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          <th className="px-4 py-3">Item</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3 text-right">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {selectedOrder.quotationReference.rfpReference.products.map((item, index) => {
                          const catalogMatch = getCatalogMatch(item);
                          const isWarning = catalogMatch && item.quantity > catalogMatch.availableStock;
                          const isOutOfStock = catalogMatch && catalogMatch.availableStock <= 0;

                          return (
                          <tr key={index} className="hover:bg-white/[0.02]">
                            <td className="px-4 py-3">
                              <p className="font-semibold text-white text-sm">{item.brand} {item.model}</p>
                              <p className="text-xs text-slate-400 line-clamp-1">{item.configuration}</p>
                              {catalogMatch && isWarning && (
                                <p className="text-xs text-rose-400 mt-1 font-semibold flex items-center gap-1">
                                  ⚠️ {isOutOfStock ? 'Out of stock' : `Only ${catalogMatch.availableStock} in stock`}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-400">{item.category}</td>
                            <td className="px-4 py-3 text-sm font-bold text-white text-right">{item.quantity} {item.unit}</td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Total Amount Footer */}
              <div className="bg-gradient-to-r from-cyan-950/40 via-purple-950/40 to-pink-950/40 border border-cyan-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[#00D2FF] font-bold uppercase tracking-wider text-xs mb-1">Total Amount</span>
                  <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00D2FF] via-[#7928CA] to-[#FF007A]">
                    ₹{getOrderAmount(selectedOrder).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
                {getDisplayStatus(selectedOrder.status, selectedOrder.paymentStatus) === 'New Order' ? (
                  <div className="flex flex-col items-end">
                    {!hasStockWarning && catalog.length === 0 && (
                      <p className="text-amber-400 text-xs mb-2">Loading catalog...</p>
                    )}
                    <button
                      onClick={() => handleApproveProcurement(selectedOrder._id)}
                      disabled={hasStockWarning || catalog.length === 0}
                      className={`px-6 py-2.5 font-bold rounded-xl transition-all whitespace-nowrap ${hasStockWarning || catalog.length === 0 ? 'bg-white/10 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-[#00D2FF] via-[#7928CA] to-[#FF007A] text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98]'}`}
                    >
                      {catalog.length > 0 ? (
                        (() => {
                           const items = selectedOrder.orderType === 'Franchise Procurement' 
                               ? selectedOrder.items 
                               : selectedOrder.quotationReference?.rfpReference?.products;
                           const item = items?.[0];
                           const match = getCatalogMatch(item);
                           const itemName = item?.hardwareType || item?.model || item?.name || 'Item';
                           if (!match) return `Confirm (No Match: ${itemName})`;
                           return `Confirm (Qty: ${item?.quantity}, Stock: ${match.availableStock})`;
                        })()
                      ) : 'Confirm & Send Quotation'}
                    </button>
                    {hasStockWarning && (
                      <p className="text-rose-400 text-xs mt-2 max-w-xs text-right font-bold">Cannot send quotation. One or more requested items exceed available inventory.</p>
                    )}
                  </div>
                ) : selectedOrder.status === 'Paid' && (selectedOrder.orderType === 'Enterprise' || selectedOrder.orderType === 'Franchise Procurement') && (user?.role === 'account_manager' || user?.role === 'finance_manager' || user?.role === 'admin') ? (
                  <button
                    onClick={() => handleSendToInventory(selectedOrder._id)}
                    className="px-6 py-2.5 bg-gradient-to-r from-[#00D2FF] to-[#7928CA] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all whitespace-nowrap"
                  >
                    Send to Inventory Manager
                  </button>
                ) : null}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0C101A] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmDialog.type === 'approve' ? 'bg-cyan-500/10 text-[#00D2FF] border border-cyan-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
              {confirmDialog.type === 'approve' ? <Check size={32} /> : <X size={32} />}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Are you sure?</h3>
            <p className="text-slate-400 mb-6 text-sm">
              {confirmDialog.type === 'approve' 
                ? 'Are you sure you want to confirm and send a quotation for this order?' 
                : 'Are you sure you want to decline this order? This action cannot be undone.'}
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setConfirmDialog({ isOpen: false, type: '', orderId: null, newStatus: '' })}
                className="px-5 py-2.5 bg-white/5 border border-white/10 text-slate-300 font-bold rounded-xl hover:bg-white/10 transition-colors text-sm"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (confirmDialog.type === 'decline') {
                    await processUpdateStatus(confirmDialog.orderId, confirmDialog.newStatus);
                  } else if (confirmDialog.type === 'approve') {
                    await processApproveProcurement(confirmDialog.orderId);
                  }
                  setConfirmDialog({ isOpen: false, type: '', orderId: null, newStatus: '' });
                }}
                className={`px-5 py-2.5 text-white font-bold rounded-xl transition-all text-sm ${
                  confirmDialog.type === 'approve' 
                    ? 'bg-gradient-to-r from-[#00D2FF] to-[#7928CA] shadow-lg shadow-cyan-500/20' 
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Yes, ${confirmDialog.type === 'approve' ? 'Confirm' : 'Decline'}`}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
