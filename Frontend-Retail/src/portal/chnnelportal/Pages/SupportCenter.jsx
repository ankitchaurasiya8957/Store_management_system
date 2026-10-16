import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, PhoneCall, Mail, Send, Loader2 } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';
import { fetchWithAuth } from '../../../utils/api.js';

export default function SupportCenter() {
  const { user } = useContext(AuthContext) || { user: null };
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: user?.name || 'Channel Partner',
          companyName: user?.companyName || 'Channel Partner',
          email: user?.email || 'partner@AK Solutions.com',
          phone: user?.phone || 'N/A',
          businessType: 'Channel Partner Support',
          subject: subject,
          emailSubject: `The message is from channel partner portal ${user?.name || 'Unknown'}`,
          message: `The message is from Our Channel partner ${user?.name || 'Unknown'}.\n\n${message}`,
        }),
      });

      if (response.ok) {
        alert('Support ticket submitted successfully!');
        setSubject('');
        setMessage('');
      } else {
        const errorData = await response.json();
        alert(`Failed to submit: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      alert('Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Support Center</h1>
        <p className="text-gray-500 text-sm mt-1">Get help with your procurement portal and orders.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Create a Support Ticket</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Issue with Order #12345"
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea
                  rows="5"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  required
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                ></textarea>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Call Us</h3>
            <p className="text-sm text-slate-600 mb-3">Available Mon-Fri, 9am - 6pm.</p>
            <a href="tel:+919876543210" className="text-blue-600 font-semibold hover:underline">+91 98765 43210</a>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Email Us</h3>
            <p className="text-sm text-slate-600 mb-3">We'll respond within 24 hours.</p>
            <a href="mailto:support@techhansha.com" className="text-emerald-700 font-semibold hover:underline">support@techhansha.com</a>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Live Chat</h3>
            <p className="text-sm text-slate-600 mb-3">Chat with our support team instantly.</p>
            <button className="text-slate-700 font-semibold hover:underline">Start Chat</button>
          </div>
        </div>
      </div>
    </div>
  );
}
