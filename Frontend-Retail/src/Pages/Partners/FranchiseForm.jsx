import React, { useState } from 'react';
import { User, Briefcase, Building2, Landmark, UploadCloud, FileText, ArrowRight, Phone, CreditCard, MapPin, Calendar, MessageSquare, ShieldCheck, ChevronDown } from 'lucide-react';
import { fetchWithAuth } from '../../utils/api.js';

// Reusable input field component moved outside to prevent remounting/losing focus
const InputField = ({ label, name, type = 'text', placeholder, icon: Icon, required = true, colSpan = false, formData, handleInputChange, errors }) => (
  <div className={colSpan ? 'md:col-span-2' : ''}>
    <label className="block text-sm font-bold text-gray-700 mb-2">{label} {required && '*'}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />}
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-12' : 'px-5'} pr-5 py-3.5 rounded-xl border ${errors[name] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:bg-white outline-none transition-colors duration-200`}
        required={required}
      />
    </div>
    {errors[name] && <p className="text-red-500 text-xs mt-1.5">{errors[name]}</p>}
  </div>
);

export default function FranchiseForm({ showToast }) {

  const [formData, setFormData] = useState({
    // Personal Details
    name: '', dob: '', contactNumber: '', panCard: '', aadharCard: '', permanentAddress: '',
    // Occupation Details
    occupation: '', companyName: '', designation: '', experience: '',

    // Message
    message: '',
    // Bank Details
    accountNumber: '', ifscCode: '', bankAddress: '', bankName: '',
    // File Upload
    documents: null
  });

  const [errors, setErrors] = useState({});
  const [formStatus, setFormStatus] = useState({ loading: false, message: '', isError: false });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'contactNumber') finalValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    if (name === 'aadharCard') finalValue = value.replace(/[^0-9]/g, '').slice(0, 12);
    if (name === 'accountNumber') finalValue = value.replace(/[^0-9]/g, '').slice(0, 18);
    if (name === 'panCard' || name === 'ifscCode') finalValue = value.toUpperCase();
    if (name === 'areaOfSpace') finalValue = value.replace(/[^0-9]/g, '');

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext !== 'pdf' && ext !== 'zip') {
        setErrors(prev => ({ ...prev, documents: "Only PDF or ZIP files are allowed" }));
        setFormData(prev => ({ ...prev, documents: null }));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, documents: "File must be below 10 MB" }));
        setFormData(prev => ({ ...prev, documents: null }));
        return;
      }
    }
    setErrors(prev => ({ ...prev, documents: null }));
    setFormData(prev => ({ ...prev, documents: file }));
  };

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;

    // Personal Details
    if (!formData.name.trim()) { newErrors.name = "Name is required"; isValid = false; }
    if (!formData.dob) { newErrors.dob = "Date of birth is required"; isValid = false; }
    if (formData.contactNumber.length !== 10) { newErrors.contactNumber = "10 digits required"; isValid = false; }
    if (!panRegex.test(formData.panCard)) { newErrors.panCard = "Invalid PAN (e.g. ABCDE1234F)"; isValid = false; }
    if (formData.aadharCard.length !== 12) { newErrors.aadharCard = "12 digits required"; isValid = false; }
    if (!formData.permanentAddress.trim()) { newErrors.permanentAddress = "Address is required"; isValid = false; }

    // Occupation
    if (!formData.occupation.trim()) { newErrors.occupation = "Occupation is required"; isValid = false; }



    // Bank Details
    if (!formData.accountNumber || formData.accountNumber.length < 9) { newErrors.accountNumber = "Valid account number required"; isValid = false; }
    if (!ifscRegex.test(formData.ifscCode)) { newErrors.ifscCode = "Invalid IFSC (e.g. SBIN0001234)"; isValid = false; }
    if (!formData.bankName.trim()) { newErrors.bankName = "Bank name is required"; isValid = false; }
    if (!formData.bankAddress.trim()) { newErrors.bankAddress = "Bank address is required"; isValid = false; }

    // File
    if (!formData.documents) { newErrors.documents = "Upload required"; isValid = false; }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("Please fix the errors before submitting.", "error");
      return;
    }
    setFormStatus({ loading: true, message: '', isError: false });

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('dob', formData.dob);
      data.append('contactNumber', formData.contactNumber);
      data.append('panCard', formData.panCard);
      data.append('aadharCard', formData.aadharCard);
      data.append('permanentAddress', formData.permanentAddress);

      data.append('occupation', formData.occupation);
      data.append('companyName', formData.companyName);
      data.append('designation', formData.designation);
      data.append('experience', formData.experience);

      data.append('message', formData.message);

      data.append('accountNumber', formData.accountNumber);
      data.append('ifscCode', formData.ifscCode);
      data.append('bankAddress', formData.bankAddress);
      data.append('bankName', formData.bankName);

      if (formData.documents) {
        data.append('documents', formData.documents);
      }

      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL || ''}/api/franchise/apply`, {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setFormStatus({ loading: false, message: 'Application submitted successfully! Our team will contact you soon.', isError: false });
        showToast("Application submitted successfully!", "success");
        setFormData({
          name: '', dob: '', contactNumber: '', panCard: '', aadharCard: '', permanentAddress: '',
          occupation: '', companyName: '', designation: '', experience: '',
          message: '',
          accountNumber: '', ifscCode: '', bankAddress: '', bankName: '',
          documents: null
        });
      } else {
        throw new Error(result.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error("Submission error:", error);
      setFormStatus({ loading: false, message: error.message || 'An error occurred while submitting the form.', isError: true });
      showToast("Submission failed. Please try again.", "error");
    }
  };

  // Reusable input field component for cleaner code removed from here to prevent re-mounting

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {formStatus.message && (
        <div className={`p-5 rounded-2xl text-base font-medium border shadow-sm ${formStatus.isError ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
          <div className="flex items-center gap-3"><ShieldCheck className="w-6 h-6" /> {formStatus.message}</div>
        </div>
      )}

      {/* ================= 1. PERSONAL DETAILS ================= */}
      <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#0d3863]">
            <User className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0d3863]">Personal Details</h2>
            <p className="text-gray-500 text-sm mt-1">Your basic personal information</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <InputField formData={formData} handleInputChange={handleInputChange} errors={errors} label="Full Name" name="name" placeholder="Enter your full name" icon={User} />
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth *</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className={`w-full pl-12 pr-5 py-3.5 rounded-xl border ${errors.dob ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:bg-white outline-none transition-colors duration-200`}
                required
              />
            </div>
            {errors.dob && <p className="text-red-500 text-xs mt-1.5">{errors.dob}</p>}
          </div>
          <InputField formData={formData} handleInputChange={handleInputChange} errors={errors} label="Contact Number" name="contactNumber" type="tel" placeholder="10 digit mobile number" icon={Phone} />
          <InputField formData={formData} handleInputChange={handleInputChange} errors={errors} label="PAN Card" name="panCard" placeholder="ABCDE1234F" icon={CreditCard} />
          <InputField formData={formData} handleInputChange={handleInputChange} errors={errors} label="Aadhar Card" name="aadharCard" placeholder="12 digit Aadhar number" icon={CreditCard} />
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Permanent Address *</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <textarea
                name="permanentAddress"
                value={formData.permanentAddress}
                onChange={handleInputChange}
                rows="2"
                placeholder="Enter your full permanent address"
                className={`w-full pl-12 pr-5 py-3.5 rounded-xl border ${errors.permanentAddress ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:bg-white outline-none resize-none transition-colors duration-200`}
                required
              ></textarea>
            </div>
            {errors.permanentAddress && <p className="text-red-500 text-xs mt-1.5">{errors.permanentAddress}</p>}
          </div>
        </div>
      </div>

      {/* ================= 2. OCCUPATION DETAILS ================= */}
      <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0d3863]">Occupation Details</h2>
            <p className="text-gray-500 text-sm mt-1">Your current professional information</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <InputField formData={formData} handleInputChange={handleInputChange} errors={errors} label="Current Occupation" name="occupation" placeholder="e.g. Business Owner, Service, Self Employed" icon={Briefcase} />
          <InputField formData={formData} handleInputChange={handleInputChange} errors={errors} label="Company / Business Name" name="companyName" placeholder="Your company or business name" icon={Building2} required={false} />
          <InputField formData={formData} handleInputChange={handleInputChange} errors={errors} label="Designation / Role" name="designation" placeholder="e.g. Director, Manager, Proprietor" required={false} />
          <InputField formData={formData} handleInputChange={handleInputChange} errors={errors} label="Years of Experience" name="experience" placeholder="e.g. 5 years" required={false} />
        </div>
      </div>



      {/* ================= 4. MESSAGE ================= */}
      <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0d3863]">Message</h2>
            <p className="text-gray-500 text-sm mt-1">Any additional information you'd like to share</p>
          </div>
        </div>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          rows="4"
          placeholder="Write your message here... (e.g. why you want to partner, your vision, relevant background)"
          className="w-full px-5 py-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none resize-none transition-colors duration-200 text-base"
        ></textarea>
      </div>

      {/* ================= 5. BANK DETAILS ================= */}
      <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Landmark className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0d3863]">Bank Details</h2>
            <p className="text-gray-500 text-sm mt-1">Your banking information for verification</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <InputField formData={formData} handleInputChange={handleInputChange} errors={errors} label="Bank Name" name="bankName" placeholder="e.g. State Bank of India" icon={Landmark} />
          <InputField formData={formData} handleInputChange={handleInputChange} errors={errors} label="Account Number" name="accountNumber" placeholder="Enter account number" icon={CreditCard} />
          <InputField formData={formData} handleInputChange={handleInputChange} errors={errors} label="IFSC Code" name="ifscCode" placeholder="e.g. SBIN0001234" />
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Bank Branch Address *</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <textarea
                name="bankAddress"
                value={formData.bankAddress}
                onChange={handleInputChange}
                rows="2"
                placeholder="Full bank branch address"
                className={`w-full pl-12 pr-5 py-3.5 rounded-xl border ${errors.bankAddress ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:bg-white outline-none resize-none transition-colors duration-200`}
                required
              ></textarea>
            </div>
            {errors.bankAddress && <p className="text-red-500 text-xs mt-1.5">{errors.bankAddress}</p>}
          </div>
        </div>
      </div>

      {/* ================= 6. DOCUMENT UPLOAD ================= */}
      <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#0d3863]">Document Upload *</h2>
            <p className="text-gray-500 text-sm mt-1">Upload supporting documents (PDF or ZIP, below 10 MB)</p>
          </div>
        </div>
        <div className="relative">
          <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileChange} accept=".zip,.pdf" required />
          <div className={`w-full border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-colors duration-300 ${formData.documents ? 'border-[#0d3863] bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'}`}>
            <UploadCloud className={`w-12 h-12 mb-4 ${formData.documents ? 'text-[#0d3863]' : 'text-gray-400'}`} />
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {formData.documents ? formData.documents.name : 'Click to Upload'}
            </h3>
            <p className="text-sm text-gray-500">.pdf or .zip files only</p>
            {errors.documents && <p className="text-red-500 text-sm mt-2">{errors.documents}</p>}
          </div>
        </div>
      </div>

      {/* ================= SUBMIT BUTTON ================= */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={formStatus.loading}
          className="group relative px-12 py-5 bg-[#0d3863] text-white rounded-2xl font-bold text-lg hover:bg-[#154c82] transition-all disabled:opacity-70 flex items-center gap-3 shadow-[0_8px_25px_rgba(13,56,99,0.3)] hover:shadow-[0_12px_35px_rgba(13,56,99,0.4)]"
        >
          {formStatus.loading ? 'Submitting...' : 'Submit Franchise Application'}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </form>
  );
}
