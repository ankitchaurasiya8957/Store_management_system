import React, { useRef, useState } from 'react';
import { motion, useMotionValue, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, MapPin, Clock, Phone, Mail, Send, Zap, HeadphonesIcon,
  Map, ShieldCheck, Settings, HeartHandshake, ChevronDown,
  Briefcase, Store, MessageSquare, Loader2
} from 'lucide-react';

// --- IMAGE IMPORTS ---
import contactBannerImg from '../assets/contact-banner.jpg';
import fastResponseImg from '../assets/fastreponse.avif';
import expertConsultationImg from '../assets/expertconsulation.avif';
import nationwideServiceImg from '../assets/nationwideservice.avif';
import genuineProductImg from '../assets/genuineproduct.jpg';
import customizedSolutionsImg from '../assets/customisesolutions.jpg';
import longTermPartnershipImg from '../assets/longtermpartnership.avif';
import { fetchWithAuth } from '../utils/api.js';

// --- DATA ARRAYS ---
const whyContactUs = [
  { title: "Fast Response", icon: Zap, image: fastResponseImg },
  { title: "Expert Consultation", icon: HeadphonesIcon, image: expertConsultationImg },
  { title: "Nationwide Service", icon: Map, image: nationwideServiceImg },
  { title: "Genuine Products", icon: ShieldCheck, image: genuineProductImg },
  { title: "Customized Solutions", icon: Settings, image: customizedSolutionsImg },
  { title: "Long-Term Partnership", icon: HeartHandshake, image: longTermPartnershipImg }
];

const faqs = [
  { q: "Can I request a bulk quotation?", a: "Yes. Submit your requirements through our contact form or email our sales team.", hoverColor: "hover:bg-blue-50 hover:border-blue-200" },
  { q: "How can I become a franchise partner?", a: "Complete the franchise inquiry form or contact our franchise team.", hoverColor: "hover:bg-emerald-50 hover:border-emerald-200" },
  { q: "Do you provide nationwide delivery?", a: "Yes. We deliver across India.", hoverColor: "hover:bg-orange-50 hover:border-orange-200" },
  { q: "Are all products covered under warranty?", a: "Yes. All products come with applicable manufacturer warranty.", hoverColor: "hover:bg-purple-50 hover:border-purple-200" }
];

const bulkServices = [
  "Bulk Product Quotations", "Corporate Procurement", "Educational Institution Orders",
  "Government Procurement", "Enterprise Hardware Solutions", "Custom Order Assistance"
];

const franchiseSupport = [
  "Franchise Information", "Investment Guidance", "Territory Availability",
  "Business Setup Support", "Marketing Assistance", "Training & Operations"
];

const businessTypes = [
  "Corporate Buyer", "Franchise Inquiry", "Reseller",
  "Educational Institution", "System Integrator", "Other"
];

// --- INTERACTIVE FAQ COMPONENT ---
const FAQItem = ({ question, answer, hoverColor }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border border-gray-100 rounded-2xl bg-white shadow-sm overflow-hidden mb-4 transition-all duration-300 hover:shadow-md ${hoverColor}`}>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-6 text-left focus:outline-none">
        <span className={`text-lg font-bold ${isOpen ? 'text-[#0d3863]' : 'text-gray-700'} transition-colors`}>
          {question}
        </span>
        <ChevronDown className={`w-5 h-5 text-[#0d3863] transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
            <div className="px-6 pb-6 text-gray-500 font-medium border-t border-gray-50 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function ContactPage() {
  const containerRef = useRef(null);

  // Parallax Mouse Tracking for Hero
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const x = (clientX / window.innerWidth - 0.5) * 2;
    const y = (clientY / window.innerHeight - 0.5) * 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  // --- FORM STATE & SUBMISSION LOGIC ---
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    businessType: '',
    subject: '',
    message: ''
  });

  const [formStatus, setFormStatus] = useState({
    loading: false,
    message: '',
    isError: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ loading: true, message: '', isError: false });

    try {
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL || ''}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setFormStatus({
          loading: false,
          message: 'Thank you! Your message has been sent successfully.',
          isError: false
        });
        // Clear form after success
        setFormData({ fullName: '', companyName: '', email: '', phone: '', businessType: '', subject: '', message: '' });
      } else {
        setFormStatus({ loading: false, message: data.error || 'Failed to send message.', isError: true });
      }
    } catch (error) {
      setFormStatus({ loading: false, message: 'Server error. Please ensure the backend is running.', isError: true });
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen text-gray-600 font-sans bg-transparent overflow-hidden selection:bg-[#0d3863]/20 selection:text-[#0d3863]">

      <style>{`
        @keyframes scanUpOnce {
          0% { transform: translateY(200px); opacity: 0; }
          10% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-500px); opacity: 0; }
        }
        .group:hover .animate-scanner-once {
          animation: scanUpOnce 2.2s cubic-bezier(0.23, 1, 0.32, 1) 0.1s forwards;
        }
      `}</style>

      {/* --- TOP BANNER SECTION --- */}
      <section className="relative w-full h-[300px] flex items-center justify-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${contactBannerImg})` }}>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 to-slate-900/70"></div>
        </div>
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
            Contact Us
          </motion.h1>
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: "80px", opacity: 1 }} transition={{ delay: 0.4, duration: 0.8, ease: "anticipate" }} className="h-1.5 bg-[#0d3863] rounded-full my-8"></motion.div>
        </div>
      </section>

      {/* --- HERO SECTION --- */}
      <section onMouseMove={handleMouseMove} className="relative z-10 pt-16 pb-12 px-6 lg:px-12 w-full flex items-center justify-center text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0d3863]/10 text-[#0d3863] font-semibold text-sm mb-6 border border-[#0d3863]/20">
            <MessageSquare className="w-4 h-4" /> We're Here to Help
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-6">
            <span className="text-gray-500">Let's Connect and Build</span> <span className="text-[#0d3863]">Something Great Together</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} className="text-lg text-gray-500 leading-relaxed mx-auto max-w-2xl font-light">
            Whether you're looking for bulk IT hardware procurement, exploring franchise opportunities, or seeking product support, our team is ready to assist you. Reach out to us, and we'll help you find the right technology solutions tailored to your business needs.
          </motion.p>
        </div>
      </section>

      {/* --- CONTACT INFO & FORM SECTION --- */}
      <section id="contactform" className="relative z-10 py-16 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* LEFT: Contact Information Card (Fixed Selection Colors) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1 bg-[#0d3863] rounded-[2.5rem] p-8 lg:p-10 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between selection:bg-white selection:text-[#0d3863]"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-6">Contact Info</h3>
              <div className="space-y-6">

                {/* Registered Office */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1"><MapPin className="w-5 h-5 text-blue-300" /></div>
                  <div>
                    <p className="font-bold text-base mb-1 text-white">Registered Office</p>
                    <p className="text-blue-100/80 leading-relaxed font-light text-xs">AK Solutions Retail<br />SHI 8/27 A K-3 Gilat Bazaar<br />Bypass Shivpur Varanasi<br />Uttar Pradesh, India 221002</p>
                  </div>
                </div>

                {/* Subtle Divider */}
                <hr className="border-white/10 my-2" />

                {/* Corporate Office */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1"><MapPin className="w-5 h-5 text-blue-300" /></div>
                  <div>
                    <p className="font-bold text-base mb-1 text-white">Corporate Office</p>
                    <p className="text-blue-100/80 leading-relaxed font-light text-xs">A3-401, The Plaza at 106<br />Sector 106, Gurgaon<br />Haryana, India 122006</p>
                  </div>
                </div>

                {/* Subtle Divider */}
                <hr className="border-white/10 my-2" />

                {/* Business Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Clock className="w-5 h-5 text-blue-300" /></div>
                  <div>
                    <p className="font-bold text-base mb-1 text-white">Business Hours</p>
                    <p className="text-blue-100/80 font-light text-xs">Monday–Saturday:<br />09:30 AM – 06:30 PM</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Phone className="w-5 h-5 text-blue-300" /></div>
                  <div>
                    <p className="font-bold text-base mb-1 text-white">Phone</p>
                    <p className="text-blue-100/80 font-light text-xs">+91 9711888951</p>
                  </div>
                </div>

                {/* Support Email */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Mail className="w-5 h-5 text-blue-300" /></div>
                  <div>
                    <p className="font-bold text-base mb-1 text-white">Support</p>
                    <p className="text-blue-100/80 font-light text-xs break-all">support@AK Solutionsretail.com</p>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          {/* RIGHT: Contact Form */}
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-[#0d3863] mb-2">Send Us a Message</h3>
              <p className="text-gray-500 font-medium">We'd Love to Hear From You</p>
            </div>

            {formStatus.message && (
              <div className={`mb-6 p-4 rounded-xl text-sm font-medium border ${formStatus.isError ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                {formStatus.message}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name *</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="John Doe" className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0d3863]/20 focus:border-[#0d3863] outline-none transition-all text-gray-700" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Company Name</label>
                  <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="Your Organization" className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0d3863]/20 focus:border-[#0d3863] outline-none transition-all text-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com" className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0d3863]/20 focus:border-[#0d3863] outline-none transition-all text-gray-700" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 xxxxx xxxxx" className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0d3863]/20 focus:border-[#0d3863] outline-none transition-all text-gray-700" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Business Type *</label>
                <div className="relative">
                  <select name="businessType" value={formData.businessType} onChange={handleInputChange} className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0d3863]/20 focus:border-[#0d3863] outline-none transition-all text-gray-700 appearance-none cursor-pointer" required>
                    <option value="" disabled>Select your business type...</option>
                    {businessTypes.map((type, i) => (
                      <option key={i} value={type}>{type}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-5 h-5" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Subject *</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="How can we help you?" className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0d3863]/20 focus:border-[#0d3863] outline-none transition-all text-gray-700" required />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message *</label>
                <textarea rows="4" name="message" value={formData.message} onChange={handleInputChange} placeholder="Write your message here..." className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0d3863]/20 focus:border-[#0d3863] outline-none transition-all text-gray-700 resize-none" required></textarea>
              </div>

              <button type="submit" disabled={formStatus.loading} className="group w-full md:w-auto relative inline-flex items-center justify-center px-10 py-4 bg-[#0d3863] disabled:bg-[#0d3863]/70 text-white rounded-xl font-bold text-lg overflow-hidden transition-colors hover:bg-[#154c82] shadow-lg shadow-[#0d3863]/20 mt-4">
                <span className="relative flex items-center gap-2">
                  {formStatus.loading ? (
                    <>Sending... <Loader2 className="w-5 h-5 animate-spin" /></>
                  ) : (
                    <>Send Message <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                  )}
                </span>
              </button>
            </form>

          </motion.div>
        </div>
      </section>

      {/* --- BULK PURCHASE & FRANCHISE SUPPORT CARDS --- */}
      <section className="relative z-10 py-24 px-6 lg:px-12 bg-gray-50/50 border-y border-gray-200/50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12">

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="group relative bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden h-[450px] cursor-pointer isolation-isolate">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-y-10 group-hover:opacity-0 bg-white">
              <div className="w-24 h-24 rounded-[2rem] bg-gray-50 border border-gray-100 flex items-center justify-center text-[#0d3863] mb-8"><Briefcase strokeWidth={1.5} className="w-12 h-12" /></div>
              <h3 className="text-3xl font-bold text-[#0d3863] text-center mb-2">Bulk Purchase Enquiries</h3>
              <p className="text-gray-500 font-medium">Enterprise Procurement Made Easy</p>
            </div>
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-[2.5rem] p-10 flex flex-col justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden">
              <div className="absolute inset-0 pointer-events-none rounded-[2.5rem] overflow-hidden">
                <div className="absolute -bottom-10 left-0 w-full h-[150px] bg-gradient-to-t from-transparent via-[#0d3863]/5 to-[#0d3863]/15 border-t-2 border-[#0d3863]/30 opacity-0 animate-scanner-once"></div>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-[#0d3863] mb-6 border-b border-gray-100 pb-4">Services Include:</h3>
                <ul className="space-y-4">
                  {bulkServices.map((item, idx) => (
                    <li key={idx} className="flex items-center text-gray-600 font-medium md:text-lg">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0d3863] mr-4 shrink-0"></span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="group relative bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden h-[450px] cursor-pointer isolation-isolate">
            <div className="absolute inset-0 flex flex-col items-center justify-center p-10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-y-10 group-hover:opacity-0 bg-white">
              <div className="w-24 h-24 rounded-[2rem] bg-gray-50 border border-gray-100 flex items-center justify-center text-[#0d3863] mb-8"><Store strokeWidth={1.5} className="w-12 h-12" /></div>
              <h3 className="text-3xl font-bold text-[#0d3863] text-center mb-2">Franchise Support</h3>
              <p className="text-gray-500 font-medium">Become a AK Solutions Retail Partner</p>
            </div>
            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-[2.5rem] p-10 flex flex-col justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden">
              <div className="absolute inset-0 pointer-events-none rounded-[2.5rem] overflow-hidden">
                <div className="absolute -bottom-10 left-0 w-full h-[150px] bg-gradient-to-t from-transparent via-[#0d3863]/5 to-[#0d3863]/15 border-t-2 border-[#0d3863]/30 opacity-0 animate-scanner-once"></div>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-[#0d3863] mb-6 border-b border-gray-100 pb-4">We Help You With:</h3>
                <ul className="space-y-4">
                  {franchiseSupport.map((item, idx) => (
                    <li key={idx} className="flex items-center text-gray-600 font-medium md:text-lg">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0d3863] mr-4 shrink-0"></span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* --- WHY CONTACT AK Solutions RETAIL --- */}
      <section className="relative z-10 py-24 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-16">
            <span className="text-gray-600">Why Contact</span> <span className="text-[#0d3863]">AK Solutions Retail?</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-10">
            {whyContactUs.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group relative bg-slate-900 rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-[220px] cursor-pointer isolation-isolate">
                <div className="absolute inset-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-slate-900/30 transition-colors duration-500 group-hover:bg-slate-900/80"></div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-y-8 group-hover:opacity-0">
                  <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white mb-4"><item.icon className="w-8 h-8" /></div>
                  <h3 className="text-lg font-bold text-white drop-shadow-md">{item.title}</h3>
                </div>
                <div className="absolute inset-0 bg-[#0d3863] rounded-3xl p-6 flex flex-col items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white mb-4"><item.icon className="w-8 h-8" /></div>
                  <h3 className="text-lg font-bold text-white text-center">{item.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="relative z-10 py-24 px-6 lg:px-12 bg-gray-50/50 border-t border-gray-200/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              <span className="text-gray-600">Frequently Asked</span> <span className="text-[#0d3863]">Questions</span>
            </h2>
            <p className="text-gray-500 text-lg">Find quick answers to common inquiries.</p>
          </div>
          <div>
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <FAQItem question={faq.q} answer={faq.a} hoverColor={faq.hoverColor} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
