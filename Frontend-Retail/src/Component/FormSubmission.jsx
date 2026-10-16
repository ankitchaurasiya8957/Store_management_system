import React, { useState } from 'react';
import { fetchWithAuth } from '../utils/api.js';

export default function FormSubmission() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [documents, setDocuments] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    // Convert FileList to an array and store it in state
    if (e.target.files) {
      setDocuments(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });

    try {
      // 1. Create a native FormData object
      const payload = new FormData();

      // 2. Append text fields
      payload.append('name', formData.name);
      payload.append('email', formData.email);
      payload.append('message', formData.message);

      // 3. Append multiple files under the same key ('documents')
      documents.forEach((file) => {
        payload.append('documents', file);
      });

      // 4. Send via Fetch (DO NOT set Content-Type header manually!)
      // Ensure the endpoint matches your backend route
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL || ''}/api/submissions`, {
        method: 'POST',
        body: payload,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit form');
      }

      setStatus({ loading: false, error: null, success: 'Form submitted successfully!' });

      // Reset form
      setFormData({ name: '', email: '', message: '' });
      setDocuments([]);

      // Reset file input element visually
      e.target.reset();

    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus({ loading: false, error: error.message, success: null });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Contact Us</h2>

      {status.error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          {status.error}
        </div>
      )}

      {status.success && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
          {status.success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleTextChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleTextChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleTextChange}
            required
            rows="4"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            placeholder="How can we help you?"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Attachments</label>
          <input
            type="file"
            name="documents"
            multiple // Allows selecting multiple files
            onChange={handleFileChange}
            className="w-full px-4 py-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">You can select multiple files.</p>
        </div>

        <button
          type="submit"
          disabled={status.loading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors disabled:opacity-50"
        >
          {status.loading ? 'Submitting...' : 'Submit Form'}
        </button>
      </form>
    </div>
  );
}
