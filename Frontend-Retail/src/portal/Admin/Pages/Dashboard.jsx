import React, { useState, useEffect, useContext } from 'react';
import axios from '../../../api/axios';
import { Users, Wallet, Package, TrendingUp, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, 
  BarChart, Bar, Legend 
} from 'recharts';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCreditDistributed: 0,
    totalUsedCredit: 0,
    totalInventoryItems: 0,
    totalInventoryValue: 0,
    totalRevenue: 0
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRevenueRange, setActiveRevenueRange] = useState('7 Days');

  useEffect(() => {
    // If not admin, skip fetching
    if (user?.role === 'account_manager' || user?.role === 'inventory_manager' || user?.role === 'finance_manager') {
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          axios.get(`/api/admin/dashboard`),
          axios.get(`/api/admin/dashboard/chart?timeRange=${encodeURIComponent(activeRevenueRange)}`)
        ]);
        setStats(statsRes.data);
        setChartData(chartRes.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [activeRevenueRange, user?.role]);

  if (user?.role === 'account_manager') {
    return <Navigate to="/admin/orders" replace />;
  }
  if (user?.role === 'inventory_manager') {
    return <Navigate to="/admin/catalog" replace />;
  }
  if (user?.role === 'finance_manager') {
    return <Navigate to="/admin/finance" replace />;
  }

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'];

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, subText: "Active Franchise & B2B", icon: <Users size={22} />, color: "text-[#00D2FF]", bgBox: "bg-[#0C101A] border-white/5 shadow-xl shadow-cyan-500/5", iconBg: "bg-cyan-500/10 border border-cyan-500/25", stroke: "#00D2FF", fill: "#00D2FF", id: "colorAdminCyan", data: stats.userSparkline || [] },
    { title: "Distributed Credit", value: `₹${(stats.totalCreditDistributed || 0).toLocaleString()}`, subText: "Overall credit line", icon: <Wallet size={22} />, color: "text-emerald-400", bgBox: "bg-[#0C101A] border-white/5 shadow-xl shadow-emerald-500/5", iconBg: "bg-emerald-500/10 border border-emerald-500/25", stroke: "#10b981", fill: "#10b981", id: "colorAdminEmerald", data: stats.distributedCreditSparkline || [] },
    { title: "Used Credit", value: `₹${(stats.totalUsedCredit || 0).toLocaleString()}`, subText: "Outstanding B2B", icon: <Activity size={22} />, color: "text-[#FF5E00]", bgBox: "bg-[#0C101A] border-white/5 shadow-xl shadow-orange-500/5", iconBg: "bg-orange-500/10 border border-orange-500/25", stroke: "#FF5E00", fill: "#FF5E00", id: "colorAdminOrange", data: stats.usedCreditSparkline || [] },
    { title: "Total Revenue", value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, subText: "Gross platform sales", icon: <TrendingUp size={22} />, color: "text-[#FF007A]", bgBox: "bg-[#0C101A] border-white/5 shadow-xl shadow-pink-500/5", iconBg: "bg-pink-500/10 border border-pink-500/25", stroke: "#FF007A", fill: "#FF007A", id: "colorAdminPink", data: stats.revenueSparkline || [] },
    { title: "Net Profit", value: `₹${(stats.netProfit || 0).toLocaleString()}`, subText: "After COGS margins", icon: <Activity size={22} />, color: "text-purple-400", bgBox: "bg-[#0C101A] border-white/5 shadow-xl shadow-purple-500/5", iconBg: "bg-purple-500/10 border border-purple-500/25", stroke: "#7928CA", fill: "#7928CA", id: "colorAdminPurple", data: stats.revenueSparkline || [] },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-cyan-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-4 md:pb-8">
      
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          Global Overview
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">Real-time</span>
        </h1>
        <p className="text-slate-400 mt-1 font-medium">Aggregated operational metrics across Franchise and B2B channels.</p>
      </div>

      {/* Hero Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className={`rounded-3xl p-6 border ${stat.bgBox} relative flex flex-col justify-between overflow-hidden group hover:border-white/10 hover:-translate-y-1 transition-all duration-300`}
          >
            <div className="flex justify-between items-start mb-1 relative z-10">
              <div>
                <p className="font-semibold text-slate-400 text-xs tracking-wide uppercase">{stat.title}</p>
                <h3 className="text-2xl font-black text-white mt-1">{stat.value}</h3>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.iconBg} ${stat.color} shadow-lg shadow-black/20`}>
                {stat.icon}
              </div>
            </div>
            
            {/* Tiny Area Chart */}
            <div className="h-12 w-full mt-2 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stat.data}>
                  <defs>
                    <linearGradient id={stat.id} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={stat.stroke} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={stat.stroke} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke={stat.stroke} strokeWidth={2.5} fillOpacity={1} fill={`url(#${stat.id})`} isAnimationActive={true} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-1 relative z-10">
               <p className="text-slate-400 text-[11px] font-semibold">{stat.subText}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Sales Trend Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-[#0C101A] rounded-3xl p-6 shadow-xl border border-white/5 flex flex-col"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Consolidated Financial Reporting</h2>
              <p className="text-slate-400 text-sm">Revenue segmentation across quarters</p>
            </div>
            <select
              value={activeRevenueRange}
              onChange={(e) => setActiveRevenueRange(e.target.value)}
              className="bg-[#05070D] border border-white/10 text-slate-200 text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-[#00D2FF] focus:ring-1 focus:ring-[#00D2FF] cursor-pointer font-medium"
            >
              <option value="7 Days">Last 7 Days</option>
              <option value="30 Days">Last 30 Days</option>
              <option value="90 Days">Last 90 Days</option>
              <option value="1 Year">Last 1 Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} tickFormatter={(value) => `₹${value}k`} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.03)'}}
                  contentStyle={{ backgroundColor: '#0C101A', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)', padding: '12px', color: '#ffffff' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                <Bar dataKey="Franchise" name="Franchise Network" fill="#00D2FF" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="B2B" name="B2B Channels" fill="#FF007A" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Global Inventory Details */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[#0C101A] rounded-3xl p-6 shadow-xl border border-white/5 flex flex-col"
        >
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Global Inventory</h2>
            <p className="text-slate-400 text-sm">Centralized Catalog Value</p>
          </div>
          <div className="w-full flex-1 flex flex-col items-center justify-center p-8 bg-[#05070D] rounded-2xl border border-white/5 text-center">
            <Package size={48} className="text-[#00D2FF] mb-4 drop-shadow-[0_0_15px_rgba(0,210,255,0.4)]" />
            <span className="text-4xl font-black bg-gradient-to-r from-[#00D2FF] via-[#c084fc] to-[#FF007A] bg-clip-text text-transparent tracking-tight">
              ₹{(stats.totalInventoryValue || 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-2">Total Value</span>
            
            <div className="mt-8 pt-6 border-t border-white/5 w-full flex justify-between px-4">
               <div className="text-center">
                 <p className="text-xl font-bold text-white">{stats.totalInventoryItems}</p>
                 <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wide">Unique Items</p>
               </div>
               <div className="text-center">
                 <p className="text-xl font-bold text-emerald-400">100%</p>
                 <p className="text-[11px] text-emerald-400/80 uppercase font-bold tracking-wide">Stock Health</p>
               </div>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
