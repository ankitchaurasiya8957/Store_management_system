import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../../../../api/axios';
import { AuthContext } from '../../../../context/AuthContext';

export const FranchiseContext = createContext();

export function FranchiseProvider({ children }) {
  const { user } = useContext(AuthContext);
  const storeId = user?.storeId;

  const [inventory, setInventory] = useState([]);
  const [salesHistory, setSalesHistory] = useState([]);
  const [metrics, setMetrics] = useState({ todaysSales: 0, monthlySales: 0, walletBalance: 0, completedOrders: 0, pendingOrders: 0 });
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [storeProfileData, setStoreProfileData] = useState(null);
  const [globalCart, setGlobalCart] = useState([]);

  const [techhansaCatalog, setTechhansaCatalog] = useState([]);
  const [b2bInvoices, setB2bInvoices] = useState([]);
  const [walletTransactions, setWalletTransactions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [companySettings, setCompanySettings] = useState(null);

  const refreshData = async () => {
    if (!storeId) return;
    try {
      const results = await Promise.allSettled([
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/franchise/${storeId}/profile`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/${storeId}`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/franchise/${storeId}/wallet`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/franchise/${storeId}/b2b-invoices`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/franchise/${storeId}/employees`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/franchise/catalog/all`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/franchise/${storeId}/requests`),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/sales/store/${storeId}`), // Fetch Store Sales
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/settings/company`) // Fetch Company Settings
      ]);

      const [
        profileRes,
        inventoryRes,
        walletRes,
        invoicesRes,
        employeesRes,
        catalogRes,
        requestsRes,
        salesRes,
        settingsRes
      ] = results;

      let dynTodaysSales = 0;
      let dynMonthlySales = 0;
      let dynCompletedOrders = 0;
      let dynPendingOrders = 0;

      if (salesRes.status === 'fulfilled' && salesRes.value.data.success) {
        const sales = salesRes.value.data.data;
        setInvoices(sales);
        const now = new Date();
        const todayStr = now.toLocaleDateString();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();

        sales.forEach(inv => {
          const d = new Date(inv.createdAt);
          if (d.toLocaleDateString() === todayStr) {
            dynTodaysSales += inv.amount;
          }
          if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
            dynMonthlySales += inv.amount;
          }
        });
      }

      if (requestsRes.status === 'fulfilled' && requestsRes.value.data.success) {
        const requests = requestsRes.value.data.data;
        setOrders(requests);
        dynCompletedOrders = requests.filter(r => r.status === 'DELIVERED').length;
        dynPendingOrders = requests.filter(r => ['PENDING', 'VERIFIED', 'APPROVED', 'DISPATCHED'].includes(r.status)).length;
      }

      if (profileRes.status === 'fulfilled' && profileRes.value.data.success) {
        setStoreProfileData(profileRes.value.data.data);
        setMetrics({
          todaysSales: dynTodaysSales,
          monthlySales: dynMonthlySales,
          walletBalance: profileRes.value.data.data.walletBalance || 0,
          totalCredit: profileRes.value.data.data.totalCredit || 0,
          usedCredit: profileRes.value.data.data.usedCredit || 0,
          completedOrders: dynCompletedOrders,
          pendingOrders: dynPendingOrders,
        });
      }
      if (inventoryRes.status === 'fulfilled' && inventoryRes.value.data.success) setInventory(inventoryRes.value.data.data);
      if (walletRes.status === 'fulfilled' && walletRes.value.data.success) setWalletTransactions(walletRes.value.data.data);
      if (invoicesRes.status === 'fulfilled' && invoicesRes.value.data.success) setB2bInvoices(invoicesRes.value.data.data);
      if (employeesRes.status === 'fulfilled' && employeesRes.value.data.success) setEmployees(employeesRes.value.data.data);
      if (catalogRes.status === 'fulfilled' && catalogRes.value.data.success) setTechhansaCatalog(catalogRes.value.data.data);
      if (settingsRes.status === 'fulfilled' && settingsRes.value.data) setCompanySettings(settingsRes.value.data);

    } catch (error) {
      console.error("Failed to fetch franchise data", error);
    }
  };

  useEffect(() => {
    refreshData();
  }, [storeId]);

  const addToGlobalCart = (item) => {
    setGlobalCart(prev => {
      const itemId = item._id || item.id;
      const existing = prev.find(i => (i._id || i.id) === itemId);
      if (existing) {
        if (existing.quantity >= item.availableStock) return prev;
        return prev.map(i => (i._id || i.id) === itemId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateGlobalCartQuantity = (id, delta) => {
    setGlobalCart(prev => prev.map(item => {
      const itemId = item._id || item.id;
      if (itemId === id) {
        const newQty = item.quantity + delta;
        const inventoryItem = inventory.find(i => (i._id || i.id) === id);
        if (inventoryItem && newQty > inventoryItem.availableStock) return item;
        if (newQty < 1) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeGlobalCartItem = (id) => {
    setGlobalCart(prev => prev.filter(item => (item._id || item.id) !== id));
  };

  const clearGlobalCart = () => {
    setGlobalCart([]);
  };

  const updateStoreProfile = async (newProfile) => {
    try {
      // Optimistic UI update
      setStoreProfileData(newProfile);

      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/franchise/${storeId}/profile`, newProfile);
      if (res.data.success) {
        setStoreProfileData(res.data.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to update store profile", error);
      // Revert on error by refreshing
      refreshData();
      return false;
    }
  };

  const approveB2BInvoice = async (invoiceId, paymentDetails = {}) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/franchise/${storeId}/b2b-invoices/${invoiceId}/approve`, paymentDetails);
      if (res.data.success) {
        await refreshData();
        return true;
      }
    } catch (error) {
      console.error("Failed to approve invoice", error);
      throw error;
    }
  };

  const requestNewStock = (items, totalAmount) => {
    const newOrder = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      date: new Date().toLocaleDateString('en-CA'),
      items: items,
      total: totalAmount,
      status: 'Pending',
      expectedDelivery: 'TBD'
    };
    setOrders([newOrder, ...orders]);
  };

  const submitOrderRequest = async (orderItems) => {
    try {
      const payload = {
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        items: orderItems,
        totalAmount: orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
      };
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/franchise/${storeId}/requests`, payload);
      if (res.data.success) {
        setOrders(prev => [res.data.data, ...prev]);
        return { success: true };
      }
      return { success: false, message: 'Unknown error' };
    } catch (error) {
      console.error("Failed to submit order request", error);
      return { success: false, message: error.response?.data?.message || 'Failed to submit order request' };
    }
  };

  const processSale = async (cartItems, customerDetails, totalAmount) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/sales/checkout`, {
        cart: cartItems,
        customer: customerDetails,
        employeeId: storeId,
        storeId: storeId
      });

      if (response.data.success) {
        // Refresh inventory after successful sale
        await refreshData();
        return response.data.invoice;
      } else {
        console.error("Sale failed:", response.data.message);
        return null;
      }
    } catch (error) {
      console.error("Error processing sale:", error);
      return null;
    }
  };
  const addInventoryItem = async (newItem) => {
    try {
      const payload = { ...newItem, storeId: storeId };
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/${storeId}`, payload);
      if (res.data.success) {
        setInventory(prev => [res.data.data, ...prev]);
        return true;
      }
    } catch (error) {
      console.error("Failed to add inventory item", error);
      return false;
    }
  };

  const updateInventoryItem = async (id, updatedFields) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/inventory/${storeId}/${id}`, updatedFields);
      if (res.data.success) {
        // Use the server response to update state so we have the true data
        setInventory(prev => prev.map(item => (item._id === id || item.id === id) ? res.data.data : item));
        return true;
      }
    } catch (error) {
      console.error("Failed to update inventory item", error);
      return false;
    }
  };

  const addEmployee = async (employeeData) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/franchise/${storeId}/employees`, employeeData);
      if (res.data.success) {
        setEmployees(prev => [res.data.data, ...prev]);
        return { success: true };
      }
      return { success: false, message: 'Failed to add employee' };
    } catch (error) {
      console.error("Failed to add employee", error);
      return { success: false, message: error.response?.data?.message || 'Server error' };
    }
  };

  const updateEmployee = async (id, employeeData) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/franchise/${storeId}/employees/${id}`, employeeData);
      if (res.data.success) {
        setEmployees(prev => prev.map(emp => (emp._id === id || emp.userId === id || emp.id === id) ? res.data.data : emp));
        return { success: true };
      }
      return { success: false, message: 'Failed to update employee' };
    } catch (error) {
      console.error("Failed to update employee", error);
      return { success: false, message: error.response?.data?.message || 'Server error' };
    }
  };

  const toggleEmployeeStatus = async (id) => {
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/franchise/${storeId}/employees/${id}/status`);
      if (res.data.success) {
        setEmployees(prev => prev.map(emp => (emp._id === id || emp.id === id) ? { ...emp, status: res.data.data.status } : emp));
        return true;
      }
    } catch (error) {
      console.error("Failed to toggle employee status", error);
      return false;
    }
  };

  return (
    <FranchiseContext.Provider value={{
      inventory,
      salesHistory,
      metrics,
      setMetrics,
      orders,
      invoices,
      storeProfileData,
      globalCart,
      techhansaCatalog,
      b2bInvoices,
      setB2bInvoices,
      companySettings,
      walletTransactions,
      setWalletTransactions,
      employees,
      setEmployees,
      processSale,
      updateStoreProfile,
      requestNewStock,
      addToGlobalCart,
      updateGlobalCartQuantity,
      removeGlobalCartItem,
      clearGlobalCart,
      submitOrderRequest,
      refreshData,
      approveB2BInvoice,
      addInventoryItem,
      updateInventoryItem,
      addEmployee,
      updateEmployee,
      toggleEmployeeStatus
    }}>
      {children}
    </FranchiseContext.Provider>
  );
}

export const useFranchise = () => useContext(FranchiseContext);
