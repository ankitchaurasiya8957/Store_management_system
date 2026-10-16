import React, { useState } from 'react';
import { Building2, Users, UserCheck, UploadCloud, Phone, FileText, ArrowRight, Trash2, ChevronDown, Target, ShieldCheck } from 'lucide-react';
import { fetchWithAuth } from '../../utils/api.js';

export default function PartnerForm({ showToast }) {
  const emptyDirector = { name: '', email: '', contact: '', incomeAmount: '', incomeUnit: 'Lakhs', aadhar: '', pan: '', address: '' };

  const [formData, setFormData] = useState({
    companyName: '', cinGst: '', companyPan: '', companyTan: '', registeredAddress: '', companyContact: '',
    authName: '', authContact: '', authEmail: '', documents: null
  });

  const [noOfDirOption, setNoOfDirOption] = useState('1');
  const [directors, setDirectors] = useState([{ ...emptyDirector }]);

  const [errors, setErrors] = useState({});
  const [dirErrors, setDirErrors] = useState([{}]);
  const [formStatus, setFormStatus] = useState({ loading: false, message: '', isError: false });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;
    if (name === 'companyContact' || name === 'authContact') finalValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    if (name === 'companyPan' || name === 'companyTan' || name === 'cinGst') finalValue = value.toUpperCase();
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

  const handleNoOfDirectorsChange = (e) => {
    const val = e.target.value;
    setNoOfDirOption(val);
    let targetCount = val === '2' ? 2 : val === '3+' ? 3 : 1;

    setDirectors(prev => {
      const newArr = [...prev];
      if (newArr.length > targetCount && val !== '3+') newArr.length = targetCount;
      while (newArr.length < targetCount) newArr.push({ ...emptyDirector });
      return newArr;
    });
    setDirErrors(prev => {
      const newErr = [...prev];
      if (newErr.length > targetCount && val !== '3+') newErr.length = targetCount;
      while (newErr.length < targetCount) newErr.push({});
      return newErr;
    });
  };

  const handleDirectorChange = (index, field, value) => {
    const updatedDirectors = [...directors];
    let finalValue = value;
    if (field === 'contact') finalValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    else if (field === 'incomeAmount') finalValue = value.replace(/[a-zA-Z]/g, '');
    else if (field === 'aadhar') finalValue = value.replace(/[^0-9]/g, '').slice(0, 16);
    else if (field === 'pan') finalValue = value.toUpperCase();

    updatedDirectors[index][field] = finalValue;
    setDirectors(updatedDirectors);

    const updatedErrors = [...dirErrors];
    updatedErrors[index] = { ...updatedErrors[index], [field]: null };
    setDirErrors(updatedErrors);
  };

  const handleAddDirector = () => {
    setDirectors(prev => [...prev, { ...emptyDirector }]);
    setDirErrors(prev => [...prev, {}]);
  };
  const handleRemoveDirector = (index) => {
    setDirectors(prev => prev.filter((_, i) => i !== index));
    setDirErrors(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    let newErrors = {};
    let newDirErrors = directors.map(() => ({}));
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (formData.companyContact.length !== 10) { newErrors.companyContact = "10 digits required"; isValid = false; }
    if (!panRegex.test(formData.companyPan)) { newErrors.companyPan = "Invalid PAN"; isValid = false; }
    if (!gstRegex.test(formData.cinGst)) { newErrors.cinGst = "Invalid GST"; isValid = false; }
    if (formData.authContact.length !== 10) { newErrors.authContact = "10 digits required"; isValid = false; }
    if (!emailRegex.test(formData.authEmail)) { newErrors.authEmail = "Invalid email"; isValid = false; }
    if (!formData.authContact) { newErrors.authContact = "Mobile is required"; isValid = false; }
    if (!formData.documents) { newErrors.documents = "Document is required"; isValid = false; }

    directors.forEach((dir, i) => {
      if (dir.contact.length !== 10) { newDirErrors[i].contact = "10 digits required"; isValid = false; }
      if (!emailRegex.test(dir.email)) { newDirErrors[i].email = "Invalid email"; isValid = false; }
      if (!panRegex.test(dir.pan)) { newDirErrors[i].pan = "Invalid PAN"; isValid = false; }
      if (dir.aadhar.length < 12) { newDirErrors[i].aadhar = "12-16 digits required"; isValid = false; }
    });

    setErrors(newErrors);
    setDirErrors(newDirErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("Fix the errors before submitting.", "error");
      return;
    }
    setFormStatus({ loading: true, message: '', isError: false });

    try {
      const data = new FormData();
      data.append('companyName', formData.companyName);
      data.append('cinGst', formData.cinGst);
      data.append('companyPan', formData.companyPan);
      data.append('companyTan', formData.companyTan);
      data.append('registeredAddress', formData.registeredAddress);
      data.append('companyContact', formData.companyContact);
      data.append('authName', formData.authName);
      data.append('authContact', formData.authContact);
      data.append('authEmail', formData.authEmail);

      if (formData.documents) {
        data.append('documents', formData.documents);
      }

      data.append('directors', JSON.stringify(directors));

      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL || ''}/api/channel/apply`, {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setFormStatus({ loading: false, message: 'Channel Partner application submitted successfully!', isError: false });
        showToast("Application submitted successfully!", "success");
        setFormData({
          companyName: '', cinGst: '', companyPan: '', companyTan: '', registeredAddress: '', companyContact: '',
          authName: '', authContact: '', authEmail: '', documents: null
        });
        setNoOfDirOption('1');
        setDirectors([{ name: '', email: '', contact: '', incomeAmount: '', incomeUnit: 'Lakhs', aadhar: '', pan: '', address: '' }]);
      } else {
        throw new Error(result.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error("Submission error:", error);
      setFormStatus({ loading: false, message: error.message || 'An error occurred while submitting the form.', isError: true });
      showToast("Submission failed. Please try again.", "error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {formStatus.message && (
        <div className={`p-5 rounded-2xl text-base font-medium border shadow-sm ${formStatus.isError ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
          <div className="flex items-center gap-3"><ShieldCheck className="w-6 h-6" /> {formStatus.message}</div>
        </div>
      )}

      {/* 1. GENERAL COMPANY DETAILS */}
      <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[#0d3863]"><Building2 className="w-7 h-7" /></div>
          <div>
            <h2 className="text-2xl font-bold text-[#0d3863]">Company Information</h2>
            <p className="text-gray-500 text-sm mt-1">Basic details about your registered entity</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Registered Company Name *</label>
            <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Company Name" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">CIN / GST Number *</label>
            <input type="text" name="cinGst" value={formData.cinGst} onChange={handleInputChange} placeholder="15 Digit GST" className={`w-full px-5 py-3.5 rounded-xl border ${errors.cinGst ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'} outline-none`} required />
            {errors.cinGst && <p className="text-red-500 text-xs mt-1">{errors.cinGst}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Company Contact Number *</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="tel" name="companyContact" value={formData.companyContact} onChange={handleInputChange} placeholder="Mobile No." className={`w-full pl-12 pr-5 py-3.5 rounded-xl border ${errors.companyContact ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'} outline-none`} required />
            </div>
            {errors.companyContact && <p className="text-red-500 text-xs mt-1">{errors.companyContact}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Company PAN Card *</label>
            <input type="text" name="companyPan" value={formData.companyPan} onChange={handleInputChange} placeholder="ABCDE1234F" className={`w-full px-5 py-3.5 rounded-xl border ${errors.companyPan ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'} outline-none`} required />
            {errors.companyPan && <p className="text-red-500 text-xs mt-1">{errors.companyPan}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">TAN Card *</label>
            <input type="text" name="companyTan" value={formData.companyTan} onChange={handleInputChange} placeholder="ABCD12345E" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 outline-none" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-gray-700 mb-2">Registered Address *</label>
            <textarea name="registeredAddress" value={formData.registeredAddress} onChange={handleInputChange} rows="2" placeholder="Full address" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 outline-none resize-none" required></textarea>
          </div>
        </div>
      </div>



      {/* 3. DIRECTOR DETAILS */}
      <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600"><Users className="w-7 h-7" /></div>
            <div>
              <h2 className="text-2xl font-bold text-[#0d3863]">Director Details</h2>
            </div>
          </div>
          <select value={noOfDirOption} onChange={handleNoOfDirectorsChange} className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 outline-none cursor-pointer">
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3+">3+</option>
          </select>
        </div>

        <div className="space-y-12">
          {directors.map((dir, index) => (
            <div key={index} className="relative">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> Director {index + 1}</h3>
                {noOfDirOption === '3+' && index >= 3 && (
                  <button type="button" onClick={() => handleRemoveDirector(index)} className="text-red-500 p-2"><Trash2 className="w-5 h-5" /></button>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-bold mb-2">Full Name *</label><input type="text" value={dir.name} onChange={(e) => handleDirectorChange(index, 'name', e.target.value)} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 outline-none" required /></div>
                <div><label className="block text-sm font-bold mb-2">Email *</label><input type="email" value={dir.email} onChange={(e) => handleDirectorChange(index, 'email', e.target.value)} className={`w-full px-5 py-3.5 rounded-xl border ${dirErrors[index]?.email ? 'border-red-400' : 'border-gray-200'} bg-gray-50 outline-none`} required />{dirErrors[index]?.email && <p className="text-red-500 text-xs">{dirErrors[index].email}</p>}</div>
                <div><label className="block text-sm font-bold mb-2">Contact *</label><input type="tel" value={dir.contact} onChange={(e) => handleDirectorChange(index, 'contact', e.target.value)} className={`w-full px-5 py-3.5 rounded-xl border ${dirErrors[index]?.contact ? 'border-red-400' : 'border-gray-200'} bg-gray-50 outline-none`} required />{dirErrors[index]?.contact && <p className="text-red-500 text-xs">{dirErrors[index].contact}</p>}</div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Monthly Income *</label>
                  <div className="flex gap-3">
                    <input type="text" value={dir.incomeAmount} onChange={(e) => handleDirectorChange(index, 'incomeAmount', e.target.value)} placeholder="5-6" className="w-2/3 px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 outline-none text-gray-700" required />
                    <select value={dir.incomeUnit} onChange={(e) => handleDirectorChange(index, 'incomeUnit', e.target.value)} className="w-1/3 px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 outline-none cursor-pointer">
                      <option value="Thousands">Thousand</option><option value="Lakhs">Lakh</option><option value="Crores">Cr</option>
                    </select>
                  </div>
                </div>

                <div><label className="block text-sm font-bold mb-2">Identification No. *</label><input type="text" value={dir.aadhar} onChange={(e) => handleDirectorChange(index, 'aadhar', e.target.value)} placeholder="Aadhar Number" className={`w-full px-5 py-3.5 rounded-xl border ${dirErrors[index]?.aadhar ? 'border-red-400' : 'border-gray-200'} bg-gray-50 outline-none`} required />{dirErrors[index]?.aadhar && <p className="text-red-500 text-xs">{dirErrors[index].aadhar}</p>}</div>
                <div><label className="block text-sm font-bold mb-2">PAN Card *</label><input type="text" value={dir.pan} onChange={(e) => handleDirectorChange(index, 'pan', e.target.value)} className={`w-full px-5 py-3.5 rounded-xl border ${dirErrors[index]?.pan ? 'border-red-400' : 'border-gray-200'} bg-gray-50 outline-none`} required />{dirErrors[index]?.pan && <p className="text-red-500 text-xs">{dirErrors[index].pan}</p>}</div>
                <div className="md:col-span-2"><label className="block text-sm font-bold mb-2">Address *</label><textarea value={dir.address} onChange={(e) => handleDirectorChange(index, 'address', e.target.value)} rows="2" className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 outline-none resize-none" required></textarea></div>
              </div>
            </div>
          ))}
        </div>
        {noOfDirOption === '3+' && (
          <div className="mt-8 flex justify-center"><button type="button" onClick={handleAddDirector} className="px-6 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100">Add Another Director</button></div>
        )}
      </div>

      {/* 4. AUTHORIZED PERSON DETAILS */}
      <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600"><UserCheck className="w-7 h-7" /></div>
          <div><h2 className="text-2xl font-bold text-[#0d3863]">Authorized Contact Person</h2></div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div><label className="block text-sm font-bold mb-2">Name *</label><input type="text" name="authName" value={formData.authName} onChange={handleInputChange} className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 outline-none" required /></div>
          <div><label className="block text-sm font-bold mb-2">Email *</label><input type="email" name="authEmail" value={formData.authEmail} onChange={handleInputChange} className={`w-full px-5 py-3.5 rounded-xl border ${errors.authEmail ? 'border-red-400' : 'border-gray-200'} bg-gray-50 outline-none`} required /></div>
          <div><label className="block text-sm font-bold mb-2">Mobile *</label><input type="tel" name="authContact" value={formData.authContact} onChange={handleInputChange} className={`w-full px-5 py-3.5 rounded-xl border ${errors.authContact ? 'border-red-400' : 'border-gray-200'} bg-gray-50 outline-none`} required /></div>
        </div>
      </div>

      {/* 5. DOCUMENT UPLOAD */}
      <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600"><FileText className="w-7 h-7" /></div>
          <div><h2 className="text-2xl font-bold text-[#0d3863]">Document Upload *</h2></div>
        </div>
        <div className="relative">
          <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleFileChange} accept=".zip,.pdf" required />
          <div className={`w-full border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center ${formData.documents ? 'border-[#0d3863] bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
            <UploadCloud className="w-12 h-12 mb-4 text-gray-400" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">{formData.documents ? formData.documents.name : 'Click to Upload (.pdf or .zip only, below 10 MB)'}</h3>
            {errors.documents && <p className="text-red-500 text-sm mt-2">{errors.documents}</p>}
          </div>
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="flex justify-end pt-4">
        <button type="submit" disabled={formStatus.loading} className="group relative px-12 py-5 bg-[#0d3863] text-white rounded-2xl font-bold text-lg hover:bg-[#154c82] transition-all disabled:opacity-70 flex items-center gap-3">
          {formStatus.loading ? 'Submitting...' : 'Submit Channel Application'} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </form>
  );
}
