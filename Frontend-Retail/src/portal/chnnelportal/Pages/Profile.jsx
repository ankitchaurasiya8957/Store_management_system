import React, { useContext, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Building, MapPin, Mail, Phone, Edit2, Camera, Save, X } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';

export default function Profile() {
  const { user, updateUser } = useContext(AuthContext) || { user: null };
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || null);

  const [formData, setFormData] = useState({
    name: user?.name || 'John Doe',
    email: user?.email || 'admin@partner.com',
    companyName: user?.companyName || 'AK Solutions Retail Pvt Ltd',
    phone: user?.phone || '+91 98765 43210',
    address: user?.address || '123 Business Avenue, Tech Park, Bangalore 560001'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || 'John Doe',
        email: user.email || 'admin@partner.com',
        companyName: user.companyName || 'AK Solutions Retail Pvt Ltd',
        phone: user.phone || '+91 98765 43210',
        address: user.address || '123 Business Avenue, Tech Park, Bangalore 560001'
      });
      setProfilePhoto(user.profilePhoto || null);
    }
  }, [user]);

  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfilePhoto(base64String);
        if (updateUser && user) {
          updateUser({ ...user, profilePhoto: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (updateUser && user) {
      updateUser({ ...user, ...formData, profilePhoto });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Revert form data
    setFormData({
      name: user?.name || 'John Doe',
      email: user?.email || 'admin@partner.com',
      companyName: user?.companyName || 'AK Solutions Retail Pvt Ltd',
      phone: user?.phone || '+91 98765 43210',
      address: user?.address || '123 Business Avenue, Tech Park, Bangalore 560001'
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Profile Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your account and company details.</p>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-3">
            <button onClick={handleCancel} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors">
              <X className="w-4 h-4" /> Cancel
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm">
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
            <Edit2 className="w-4 h-4" /> Edit Profile
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center">
            <div className="relative group mb-4">
              <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-sm transition-colors"
                title="Change Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="text-center font-bold text-slate-900 border-b border-slate-300 focus:border-blue-500 focus:outline-none bg-transparent w-full mb-2 pb-1"
                placeholder="Full Name"
              />
            ) : (
              <h2 className="text-xl font-bold text-slate-900">{formData.name}</h2>
            )}

            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="text-center text-sm text-slate-500 border-b border-slate-300 focus:border-blue-500 focus:outline-none bg-transparent w-full mb-4 pb-1"
                placeholder="Email Address"
              />
            ) : (
              <p className="text-sm text-slate-500 mb-4">{formData.email}</p>
            )}

            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
              Verified Partner
            </span>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Company Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div className="w-full">
                  <p className="text-sm font-medium text-slate-700 mb-1">Company Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-slate-900">{formData.companyName}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div className="w-full">
                  <p className="text-sm font-medium text-slate-700 mb-1">Registered Address</p>
                  {isEditing ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                    />
                  ) : (
                    <p className="text-slate-900">{formData.address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Contact Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div className="w-full">
                  <p className="text-sm font-medium text-slate-700 mb-1">Primary Email</p>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-slate-900">{formData.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div className="w-full">
                  <p className="text-sm font-medium text-slate-700 mb-1">Phone Number</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-slate-900">{formData.phone}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
