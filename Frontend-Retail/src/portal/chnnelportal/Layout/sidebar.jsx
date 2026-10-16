import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  FileBadge,
  ShoppingCart,
  Truck,
  PieChart,
  Headset,
  UserCircle,
  LogOut,
  Receipt,
  X
} from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import logo from '../../../assets/logo.png';

const SidebarLink = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/channel' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
        ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-sm'
        : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-500'
        }`}
    >
      <Icon size={20} />
      {children}
    </Link>
  );
};

export default function Sidebar({ isOpen, setIsOpen }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className={`fixed md:relative inset-y-0 left-0 z-50 w-72 md:w-80 bg-white md:rounded-2xl flex flex-col shadow-2xl md:shadow-sm overflow-hidden shrink-0 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      {/* Logo Area */}
      <div className="h-20 md:h-28 flex items-center px-4 md:px-6 border-b border-slate-100 justify-between">
        <Link to="/" className="flex items-center min-w-0">
          <img src={logo} alt="AK Solutions" className="h-12 md:h-24 w-auto -ml-2 md:-ml-4 object-contain shrink-0" />
          <span className="text-base md:text-lg font-black ml-2 text-[var(--premium-gold)] tracking-tight uppercase whitespace-nowrap truncate">
            AK Solutions Retail
          </span>
        </Link>
        <button className="md:hidden text-slate-400 hover:text-slate-600 p-2 shrink-0 ml-1" onClick={() => setIsOpen(false)}>
          <X size={24} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <SidebarLink to="/channel" icon={LayoutDashboard}>Dashboard</SidebarLink>
        <SidebarLink to="/channel/rfp" icon={FileText}>RFP Management</SidebarLink>
        <SidebarLink to="/channel/quotations" icon={FileBadge}>Quotations</SidebarLink>
        <SidebarLink to="/channel/orders" icon={ShoppingCart}>Orders</SidebarLink>
        <SidebarLink to="/channel/tracking" icon={Truck}>Delivery Tracking</SidebarLink>
        <SidebarLink to="/channel/invoices" icon={Receipt}>Invoices</SidebarLink>
        <SidebarLink to="/channel/reports" icon={PieChart}>Reports</SidebarLink>

        <div className="pt-4 mt-auto border-t border-slate-100 mx-2">
          <SidebarLink to="/channel/support" icon={Headset}>Support</SidebarLink>
          <SidebarLink to="/channel/profile" icon={UserCircle}>Profile</SidebarLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 mt-1 text-sm font-medium transition-all duration-200 text-red-600 hover:bg-red-50 rounded-xl"
          >
            <LogOut className="w-5 h-5 text-red-500" />
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
}
