import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useScroll } from 'framer-motion';
import {
  ArrowRight, ShieldCheck, Target, Users, TrendingUp, CheckCircle2,
  Globe, LineChart, Shield, Zap, Briefcase
} from 'lucide-react';

import shaatikaLogo from '../assets/shaatika-vastram.png';
import mainLogo from '../assets/logo.png';
import longTermImg from '../assets/Long-Term.jpg';
import businessExpansionImg from '../assets/Business Expansion.jpg';
import techInnovationImg from '../assets/Technology-Innovation.jpg';
import financialStabilityImg from '../assets/Financial-Stability.jpg';
import strategicLeadershipImg from '../assets/Strategic-Leadership.jpg';
import nationwideGrowthImg from '../assets/Nationwide-Growth.jpg';
import investorBannerImg from '../assets/investor-banner.png';
import investersVideo from '../assets/investers-video.mp4';

// --- DATA ARRAYS ---
const investors = [
  {
    name: "Shaatika Vastram",
    role: "Strategic Investor",
    desc: "A valued strategic investor committed to supporting innovation and long-term business development. With a vision focused on sustainable growth and operational excellence, they contribute to strengthening AK Solutions Retail's expansion and future-ready initiatives.",
    logo: shaatikaLogo,
    link: "https://www.shaatikavastram.in/" // 
  },
  {
    name: "AK Solutions Private Limited",
    role: "Enterprise Growth Partner",
    desc: "Plays a vital role in strengthening our business foundation through strategic guidance and long-term investment. Their commitment to innovation and business excellence enables us to continuously enhance technology, infrastructure, and customer experience.",
    logo: mainLogo,
    link: "https://AK Solutions.com/" //
  },
  {
    name: "AK Solutions Solutions Pvt. Ltd.",
    role: "Digital Transformation Partner",
    desc: "Brings deep expertise in digital transformation, enterprise technology, and business solutions. Their support enables us to build scalable digital platforms, optimize operations, and deliver seamless experiences for our ecosystem.",
    logo: mainLogo,
    link: "https://AK Solutions.com" // 
  },
  {
    name: "AK Solutions IT Private Limited",
    role: "Technology & Infrastructure Partner",
    desc: "Strengthens our technological capabilities by supporting innovation, IT infrastructure, and enterprise-grade digital solutions. Their expertise helps maintain a secure, scalable, and high-performance platform across India.",
    logo: mainLogo,
    link: "https://AK Solutionsit.com/" // 
  }
];

const investorMatters = [
  { title: "Long-Term Vision", img: longTermImg },
  { title: "Business Expansion", img: businessExpansionImg },
  { title: "Technology Innovation", img: techInnovationImg },
  { title: "Financial Stability", img: financialStabilityImg },
  { title: "Strategic Leadership", img: strategicLeadershipImg },
  { title: "Nationwide Growth", img: nationwideGrowthImg }
];

const investmentHighlights = [
  { title: "4 Strategic Investment Partners" },
  { title: "Long-Term Business Commitment" },
  { title: "Technology-Driven Growth Strategy" },
  { title: "Pan-India Expansion Vision" },
  { title: "Innovation-Focused Business Ecosystem" },
  { title: "Sustainable Enterprise Development" }
];

// --- MAIN PAGE COMPONENT ---
export default function InvestorsPage() {
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

  return (
    <div ref={containerRef} className="relative min-h-screen text-gray-600 font-sans bg-transparent overflow-hidden selection:bg-[#0d3863]/20 selection:text-[#0d3863]">

      {/* --- TOP BANNER SECTION --- */}
      <section className="relative w-full h-[300px] flex items-center justify-center overflow-hidden bg-slate-900">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${investorBannerImg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 to-slate-900/70"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-6xl font-extrabold text-white tracking-tight"
          >
            Investors
          </motion.h1>

          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "80px", opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: "anticipate" }}
            className="h-1.5 bg-[#0d3863] rounded-full my-8"
          ></motion.div>
        </div>
      </section>

      {/* --- HERO SECTION --- */}
      <section
        onMouseMove={handleMouseMove}
        className="relative z-10 pt-16 pb-12 px-6 lg:px-12 w-full flex items-center"
      >
        <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0d3863]/10 text-[#0d3863] font-semibold text-sm mb-6 border border-[#0d3863]/20"
            >
              <Briefcase className="w-4 h-4" />
              Strategic Investors & Business Partners
            </motion.div>

            {/* Dual Color Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-2xl md:text-3xl font-extrabold tracking-tight leading-[1.1] mb-6"
            >
              <span className="text-gray-500">Backed by Vision.</span> <span className="text-[#0d3863]">Driven by Innovation.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-base text-gray-500 max-w-xl leading-relaxed mb-6"
            >
              AK Solutions Retail is supported by a strong network of strategic investors and technology-focused organizations that share our vision of transforming India's IT hardware distribution ecosystem.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-base text-gray-500 max-w-xl leading-relaxed "
            >
              Their continued trust, expertise, and long-term commitment empower us to expand our reach, strengthen our infrastructure, and deliver exceptional value to businesses across the country.
            </motion.p>
          </div>

          {/* 3D CINEMATIC VIDEO CONTAINER */}
          <div
            className="relative w-full h-full flex justify-center lg:justify-end"
            style={{ perspective: "1300px" }} // Added perspective to create 3D depth
          >
            <motion.div
              // rotateY: -35deg pushes the right side back and left side forward
              initial={{ opacity: 0, rotateY: -30, rotateX: 3, scale: 0.9 }}
              animate={{ opacity: 1, rotateY: -30, rotateX: 3, scale: 0.9 }}
              whileHover={{ rotateY: -20, rotateX: 2, scale: 0.95 }}
              transition={{ duration: 0.8, ease: "easeIn" }}
              className="relative w-full max-w-md lg:max-w-full rounded-[2.5rem] overflow-hidden border border-white/20 group"
              style={{
                transformStyle: "preserve-3d"
                // Dynamic 3D shadow matching the angle
              }}
            >

              {/* VIDEO TAG */}
              <video
                src={investersVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto md:h-[350px] object-cover"
              />

              {/* Cinematic Lighting Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0d3863]/40 via-transparent to-white/20 pointer-events-none mix-blend-overlay"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- OUR INVESTMENT ECOSYSTEM --- */}
      <section className="relative z-10 py-24 px-6 lg:px-12 bg-gray-50/50 border-y border-gray-200/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            <span className="text-gray-500">Building the Future</span> <span className="text-[#0d3863]">Together</span>
          </h2>
          <p className="text-gray-500 text-base leading-relaxed mb-6">
            At AK Solutions Retail, we believe sustainable growth is built through strong partnerships. Our investors contribute more than capital—they bring industry knowledge, strategic direction, operational excellence, and a shared commitment to innovation.
          </p>
          <p className="text-gray-500 text-base leading-relaxed">
            Together, we are creating a future-ready platform that connects businesses with world-class IT hardware solutions while expanding opportunities through our nationwide franchise network.
          </p>
        </div>
      </section>


      {/* --- INVESTOR PROFILES (FIXED TOP LINE BORDER RADIUS & MADE LINKABLE) --- */}
      <section className="relative z-10 py-32 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            <span className="text-gray-500">Our Strategic</span> <span className="text-[#0d3863]">Investors</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {investors.map((investor, i) => (
            <motion.a
              href={investor.link}
              target="_blank"
              rel="noopener noreferrer"
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              // Added 'block' and 'cursor-pointer' since it's now an anchor tag
              className="block cursor-pointer group relative bg-white p-8 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden isolation-isolate"
            >
              {/* Top Animated Line */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gray-300 to-[#0d3863] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

              {/* Logo Container */}
              <div className="w-24 h-24 mb-8 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center overflow-hidden p-2 group-hover:border-[#0d3863]/20 transition-all shadow-inner">
                <img
                  src={investor.logo}
                  alt={`${investor.name} Logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback if logo is missing
                    e.target.src = "https://via.placeholder.com/150?text=LOGO";
                  }}
                />
              </div>

              <h3 className="text-2xl font-bold text-[#0d3863] mb-2">{investor.name}</h3>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">{investor.role}</p>
              <p className="text-gray-600 leading-relaxed font-medium">
                {investor.desc}
              </p>
            </motion.a>
          ))}
        </div>
      </section>



      <section className="relative z-10 py-2 px-2 lg:px-2 h-100 bg-slate-50 overflow-hidden">

        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(0,0,0,1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        <div className="relative max-w-4xl mx-auto text-center">

          <h2 className="text-sm font-bold tracking-widest text-[#0d3863] uppercase mb-4">
            Shared Vision
          </h2>

          <h3 className="text-3xl md:text-5xl font-extrabold text-[#0d3863] mb-8 leading-tight">
            Empowering Businesses Through Technology
          </h3>


          <p className="text-gray-600 text-base md:text-xl leading-relaxed mb-6">
            Our investors share a common vision of building a trusted IT hardware ecosystem that delivers genuine products, transparent business practices, and innovative technology solutions for organizations of every size.
          </p>
          <p className="text-gray-600 text-base md:text-xl leading-relaxed">
            Together, we are committed to enabling businesses, entrepreneurs, and franchise partners with the tools, resources, and technology they need to succeed in an increasingly digital world.
          </p>
        </div>
      </section>

      {/* --- WHY OUR INVESTORS MATTER & HIGHLIGHTS (SPLIT SECTION) --- */}

      <section className="relative z-10 py-32 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24">


          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-10">
              <span className="text-gray-500">Why Our Investors</span> <span className="text-[#0d3863]">Matter</span>
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {investorMatters.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_30px_rgba(13,56,99,0.1)] hover:-translate-y-1 group transition-all duration-300"
                >
                  <div className="h-36 w-full overflow-hidden relative">
                    <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                    {/* Soft Inner Sweep Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                  </div>
                  <div className="p-5 bg-white relative z-10">
                    <span className="font-bold text-[#0a294b] group-hover:text-[var(--tech-blue)] tracking-wide transition-colors">{item.title}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>


          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-10">
              <span className="text-gray-500">Investment</span> <span className="text-[#0d3863]">Highlights</span>
            </h2>
            <div className="flex flex-col gap-4">
              {investmentHighlights.map((highlight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-[#0d3863]/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-[#0d3863]" />
                  </div>
                  <span className="text-gray-700 font-medium text-base">{highlight.title}</span>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
