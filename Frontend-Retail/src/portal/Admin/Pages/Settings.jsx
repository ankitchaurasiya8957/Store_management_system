import React, { useState, useContext, useEffect } from 'react';
import axios from '../../../api/axios';
import { motion } from 'framer-motion';
import { User, Lock, Shield, Save, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../../context/AuthContext';

export default function Settings() {
  const { user, login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  });
  const [securityData, setSecurityData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [companySettings, setCompanySettings] = useState({
    companyName: '',
    registeredAddress: '',
    gstin: '',
    stateName: '',
    contactNumber: '',
    email: '',
    globalGstPercentage: 18,
    declaration: '',
    authorizedSignatoryText: '',
    bankDetails: {
      accountHolderName: '',
      bankName: '',
      branchName: '',
      accountNo: '',
      ifscCode: ''
    }
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        const res = await axios.get('/api/settings/company');
        setCompanySettings({
          companyName: res.data.companyName || '',
          registeredAddress: res.data.registeredAddress || '',
          gstin: res.data.gstin || '',
          stateName: res.data.stateName || '',
          contactNumber: res.data.contactNumber || '',
          email: res.data.email || '',
          declaration: res.data.declaration || '',
          authorizedSignatoryText: res.data.authorizedSignatoryText || '',
          globalGstPercentage: res.data.globalGstPercentage ?? 18,
          bankDetails: res.data.bankDetails || {
            accountHolderName: '',
            bankName: '',
            branchName: '',
            accountNo: '',
            ifscCode: ''
          }
        });
      } catch (error) {
        console.error('Failed to fetch company settings', error);
      }
    };
    fetchCompanySettings();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`/api/admin/entities/${user.userId}`, {
        name: profileData.name,
        email: profileData.email,
        role: user.role
      });
      toast.success('Profile updated successfully!');

      // Update local auth context
      login({ ...user, name: profileData.name, email: profileData.email }, sessionStorage.getItem('token'));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (securityData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await axios.put(`/api/admin/entities/${user.userId}`, {
        password: securityData.newPassword,
        role: user.role
      });
      toast.success('Password updated successfully!');
      setSecurityData({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySettingsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put('/api/settings/company', companySettings);
      toast.success('Company settings updated successfully!');
    } catch (error) {
      toast.error('Failed to update company settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
          <Shield size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Account Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your admin profile and security credentials</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <User size={18} className="text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-800">Profile Information</h2>
          </div>
          <form onSubmit={handleProfileSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">User ID</label>
              <input
                type="text"
                value={user?.userId || ''}
                disabled
                className="w-full p-2.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">Your unique system ID cannot be changed.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                placeholder="Super Admin"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="admin@AK Solutions.com"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center w-full gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70"
              >
                <Save size={18} />
                Save Profile
              </button>
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <Lock size={18} className="text-indigo-500" />
            <h2 className="text-lg font-bold text-slate-800">Security</h2>
          </div>
          <form onSubmit={handleSecuritySubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
              <input
                type="password"
                required
                value={securityData.newPassword}
                onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={securityData.confirmPassword}
                onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center w-full gap-2 px-4 py-2.5 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-70"
              >
                <Key size={18} />
                Update Password
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Shield size={18} className="text-indigo-500" />
          <h2 className="text-lg font-bold text-slate-800">Company Settings (Global)</h2>
        </div>
        <form onSubmit={handleCompanySettingsSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={companySettings.companyName}
                onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">GSTIN/UIN</label>
              <input
                type="text"
                value={companySettings.gstin}
                onChange={(e) => setCompanySettings({ ...companySettings, gstin: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State Name</label>
              <input
                type="text"
                value={companySettings.stateName}
                onChange={(e) => setCompanySettings({ ...companySettings, stateName: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
              <input
                type="text"
                value={companySettings.contactNumber}
                onChange={(e) => setCompanySettings({ ...companySettings, contactNumber: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="text"
                value={companySettings.email}
                onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Global GST % (Purchasing)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={companySettings.globalGstPercentage ?? 18}
                onChange={(e) => setCompanySettings({ ...companySettings, globalGstPercentage: Number(e.target.value) })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Registered Address</label>
              <textarea
                rows={2}
                value={companySettings.registeredAddress}
                onChange={(e) => setCompanySettings({ ...companySettings, registeredAddress: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Declaration (Invoice)</label>
              <textarea
                rows={2}
                value={companySettings.declaration}
                onChange={(e) => setCompanySettings({ ...companySettings, declaration: e.target.value })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70"
            >
              <Save size={18} />
              Save Company Settings
            </button>
          </div>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-6"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Shield size={18} className="text-indigo-500" />
          <h2 className="text-lg font-bold text-slate-800">Bank Details</h2>
        </div>
        <form onSubmit={handleCompanySettingsSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Holder Name</label>
              <input
                type="text"
                value={companySettings.bankDetails.accountHolderName}
                onChange={(e) => setCompanySettings({ ...companySettings, bankDetails: { ...companySettings.bankDetails, accountHolderName: e.target.value } })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={companySettings.bankDetails.bankName}
                onChange={(e) => setCompanySettings({ ...companySettings, bankDetails: { ...companySettings.bankDetails, bankName: e.target.value } })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Branch Name</label>
              <input
                type="text"
                value={companySettings.bankDetails.branchName}
                onChange={(e) => setCompanySettings({ ...companySettings, bankDetails: { ...companySettings.bankDetails, branchName: e.target.value } })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={companySettings.bankDetails.ifscCode}
                onChange={(e) => setCompanySettings({ ...companySettings, bankDetails: { ...companySettings.bankDetails, ifscCode: e.target.value } })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account Number</label>
              <input
                type="text"
                value={companySettings.bankDetails.accountNo}
                onChange={(e) => setCompanySettings({ ...companySettings, bankDetails: { ...companySettings.bankDetails, accountNo: e.target.value } })}
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70"
            >
              <Save size={18} />
              Save Bank Details
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
