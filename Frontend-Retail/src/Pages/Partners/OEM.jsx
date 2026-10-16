import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS CSS

import OEMHero from '../../assets/OEM.jpg';
import HPLogo from '../../assets/hp.png';
import DellLogo from '../../assets/dell.png';
import LenovoLogo from '../../assets/lenovo.png';
import AppleLogo from '../../assets/apple.png';
import AsusLogo from '../../assets/asus.png';
import AcerLogo from '../../assets/acer.png';
import SamsungLogo from '../../assets/samsung.png';
import EpsonLogo from '../../assets/Epson.png';
import LogitechLogo from '../../assets/logitech.png';
import IntelLogo from '../../assets/intel.png';
import MsiLogo from '../../assets/msi.png';

export default function OemPartner() {
  const oemBrands = [
    { name: 'HP', logoSrc: HPLogo },
    { name: 'Dell', logoSrc: DellLogo },
    { name: 'Lenovo', logoSrc: LenovoLogo },
    { name: 'Apple', logoSrc: AppleLogo },
    { name: 'ASUS', logoSrc: AsusLogo },
    { name: 'Acer', logoSrc: AcerLogo },
    { name: 'Samsung', logoSrc: SamsungLogo },
    { name: 'Logitech', logoSrc: LogitechLogo },
    { name: 'Intel', logoSrc: IntelLogo },
    { name: 'MSI', logoSrc: MsiLogo },
    { name: 'Epson', logoSrc: EpsonLogo }
  ];

  const partnerDetails = [
    {
      name: 'HP',
      logoSrc: HPLogo,
      tagline: 'Enterprise Computing Excellence',
      desc: 'HP is a global leader in business computing, offering high-performance laptops, desktops, workstations, printers, and enterprise IT solutions.'
    },
    {
      name: 'Dell',
      logoSrc: DellLogo,
      tagline: 'Powering Modern Businesses',
      desc: 'Dell provides innovative computing infrastructure trusted by enterprises worldwide.'
    },
    {
      name: 'Lenovo',
      logoSrc: LenovoLogo,
      tagline: 'Smarter Technology for Every Business',
      desc: 'Lenovo delivers innovative computing devices, ThinkPad business laptops, desktops, workstations, and data center solutions.'
    },
    {
      name: 'Apple',
      logoSrc: AppleLogo,
      tagline: 'Premium Performance & Innovation',
      desc: "Apple's ecosystem combines exceptional performance, seamless user experience, and industry-leading security."
    },
    {
      name: 'ASUS',
      logoSrc: AsusLogo,
      tagline: 'Innovation That Inspires',
      desc: 'ASUS develops award-winning laptops, desktops, motherboards, gaming devices, and business solutions.'
    },
    {
      name: 'Acer',
      logoSrc: AcerLogo,
      tagline: 'Reliable Computing Solutions',
      desc: 'Acer delivers dependable computing products designed for education, business, and enterprise environments.'
    },
    {
      name: 'Samsung',
      logoSrc: SamsungLogo,
      tagline: 'Advanced Technology Solutions',
      desc: 'Samsung offers monitors, SSDs, storage solutions, displays, and enterprise electronics.'
    },
    {
      name: 'Logitech',
      logoSrc: LogitechLogo,
      tagline: 'Productivity Without Limits',
      desc: 'Logitech designs premium peripherals and collaboration devices.'
    },
    {
      name: 'Intel',
      logoSrc: IntelLogo,
      tagline: 'The Power Behind Modern Computing',
      desc: 'Intel processors deliver exceptional processing performance and enterprise-grade reliability.'
    },
    {
      name: 'MSI',
      logoSrc: MsiLogo,
      tagline: 'High-Performance Computing',
      desc: 'MSI is recognized for premium workstations, gaming systems, and business laptops.'
    },
    {
      name: 'Epson',
      logoSrc: EpsonLogo,
      tagline: 'Professional Printing Solutions',
      desc: 'Epson provides advanced printing, scanning, and imaging solutions.'
    }
  ];

  // Initialize AOS animations
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
    });
  }, []);

  return (
    <div className="w-full min-h-screen bg-white">

      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative w-full h-[250px] md:h-[300px] flex items-center justify-center overflow-hidden bg-slate-900">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${OEMHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 to-slate-900/50"></div>
        </div>

        {/* Hero Content with AOS */}
        <div className="relative z-10 text-center px-6" data-aos="fade-up">
          <h1 className="text-5xl md:text-[4.5rem] font-black text-white mb-6 tracking-tight drop-shadow-md">
            OEM Partners
          </h1>
          <div className="w-20 h-1.5 bg-[#D4A22E] mx-auto rounded-full shadow-lg" data-aos="zoom-in" data-aos-delay="200"></div>
        </div>
      </section>

      {/* ================= 2. CONTENT & VALUE SECTION ================= */}
      <div className="relative max-w-[1300px] mx-auto px-6 pt-20 lg:pt-28 pb-10 overflow-hidden">

        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[var(--tech-blue)]/5 rounded-[100%] blur-[80px] pointer-events-none z-0"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">

          {/* Left Side: Bold Statement */}
          <div className="lg:col-span-5 text-center lg:text-left" data-aos="fade-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--soft-bg)] border border-gray-200 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--premium-gold)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--premium-gold)]"></span>
              </span>
              <span className="text-[12px] font-bold text-[var(--tech-blue)] uppercase tracking-widest">The OEM Advantage</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold text-[var(--text-dark)] leading-tight mb-6">
              Authentic Hardware for <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--tech-blue)] to-[#0a294b]">Modern Enterprises</span>
            </h2>
            <div className="hidden lg:block w-16 h-1.5 bg-[var(--premium-gold)] rounded-full"></div>
          </div>

          {/* Right Side: Description */}
          <div className="lg:col-span-7 flex flex-col justify-center" data-aos="fade-left" data-aos-delay="100">
            <p className="text-gray-600 text-[16.5px] md:text-[18px] leading-relaxed font-medium mb-6">
              AK Solutions Retail partners with globally recognized Original Equipment Manufacturers (OEMs) to deliver genuine enterprise IT hardware backed by official manufacturer warranties, cutting-edge innovation, and world-class reliability.
            </p>
            <div className="relative pl-6 border-l-4 border-[var(--premium-gold)] bg-gray-50/50 p-4 rounded-r-xl">
              <p className="text-gray-500 text-[15.5px] md:text-[16.5px] leading-relaxed">
                Our OEM partnerships ensure that every customer receives authentic products, the latest technology, and trusted after-sales support directly from the source.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Trust Badges / Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mt-16 relative z-10">

          {/* Badge 1 */}
          <div data-aos="fade-up" data-aos-delay="0" className="group flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-[var(--tech-blue)]/30 hover:shadow-[0_10px_30px_rgba(13,56,99,0.08)] transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-[var(--soft-bg)] text-[var(--tech-blue)] group-hover:bg-[var(--tech-blue)] group-hover:text-white transition-colors duration-300 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-[var(--text-dark)] text-[15.5px] group-hover:text-[var(--tech-blue)] transition-colors">100% Genuine</h4>
              <p className="text-[13px] text-gray-500 font-medium mt-0.5">Direct from manufacturers</p>
            </div>
          </div>

          {/* Badge 2 */}
          <div data-aos="fade-up" data-aos-delay="100" className="group flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-[var(--tech-blue)]/30 hover:shadow-[0_10px_30px_rgba(13,56,99,0.08)] transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-[var(--soft-bg)] text-[var(--tech-blue)] group-hover:bg-[var(--tech-blue)] group-hover:text-white transition-colors duration-300 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-[var(--text-dark)] text-[15.5px] group-hover:text-[var(--tech-blue)] transition-colors">Official Warranty</h4>
              <p className="text-[13px] text-gray-500 font-medium mt-0.5">Full after-sales support</p>
            </div>
          </div>

          {/* Badge 3 */}
          <div data-aos="fade-up" data-aos-delay="200" className="group flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-[var(--tech-blue)]/30 hover:shadow-[0_10px_30px_rgba(13,56,99,0.08)] transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-[var(--soft-bg)] text-[var(--tech-blue)] group-hover:bg-[var(--tech-blue)] group-hover:text-white transition-colors duration-300 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-[var(--text-dark)] text-[15.5px] group-hover:text-[var(--tech-blue)] transition-colors">Global Brands</h4>
              <p className="text-[13px] text-gray-500 font-medium mt-0.5">Top-tier enterprise tech</p>
            </div>
          </div>

        </div>
      </div>

      {/* ================= 3. 3D CAROUSEL SECTION ================= */}
      <section className="relative w-full pt-8 pb-20 bg-[var(--soft-bg)] overflow-hidden">

        {/* --- In-built CSS for 3D Carousel Animation --- */}
        <style>{`
          @keyframes rotate-carousel {
            0% { transform: rotateY(0deg); }
            100% { transform: rotateY(-360deg); }
          }
          .carousel-3d-wrapper {
            perspective: 1600px;
            transform: rotateX(-4deg); 
            transform-style: preserve-3d;
          }
          .carousel-track {
            transform-style: preserve-3d;
            animation: rotate-carousel 40s linear infinite;
          }
          .carousel-track:hover {
            animation-play-state: paused;
          }
          .carousel-card {
            backface-visibility: hidden;
          }
        `}</style>

        {/* BACKGROUND DECORATION */}
        <div className="absolute inset-0 z-0 opacity-50"
          style={{ backgroundImage: 'radial-gradient(circle at center, #cbd5e1 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-white rounded-full mix-blend-overlay filter blur-[100px] opacity-80 pointer-events-none z-0"></div>

        {/* 3D CAROUSEL CONTAINER with AOS fade-up */}
        <div data-aos="fade-up" data-aos-delay="100" className="relative w-full h-[320px] md:h-[450px] flex justify-center items-center transform scale-[0.6] sm:scale-75 md:scale-100 z-10">

          <div className="relative w-[240px] h-[300px] carousel-3d-wrapper">
            <div className="absolute inset-0 carousel-track">

              {oemBrands.map((brand, index) => {
                const angle = (360 / oemBrands.length) * index;

                return (
                  <div
                    key={index}
                    className="carousel-card absolute inset-0"
                    style={{
                      transform: `rotateY(${angle}deg) translateZ(500px)`
                    }}
                  >
                    <div className="group w-full h-full cursor-pointer">
                      <div className="w-full h-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(13,56,99,0.08)] border border-white/60 flex flex-col items-center justify-center p-8 overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(221,167,60,0.15)] group-hover:border-[var(--premium-gold)]/40 group-hover:-translate-y-2 relative">

                        {/* Subtle Inner Glow on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--premium-gold)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* FULL COLOR LOGO */}
                        <img
                          src={brand.logoSrc}
                          alt={brand.name}
                          className="w-full h-full object-contain relative z-10 p-2 drop-shadow-sm transition-all duration-500 ease-out group-hover:scale-110 group-hover:drop-shadow-2xl"
                        />

                        {/* Glowing Bottom Line Effect */}
                        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-200/50 group-hover:bg-[var(--premium-gold)] transition-colors duration-500 shadow-[0_-2px_15px_rgba(221,167,60,0.6)] opacity-0 group-hover:opacity-100"></div>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>

            {/* Virtual Floor Reflection */}
            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[700px] h-[100px] bg-[var(--tech-blue)]/5 rounded-[100%] blur-2xl transform rotateX(60deg) pointer-events-none"></div>

          </div>
        </div>

      </section>

      {/* ================= 4. DETAILED PARTNERS SECTION ================= */}
      <section className="relative w-full py-24 bg-white overflow-hidden z-10">

        {/* Subtle Background Glow */}
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[var(--tech-blue)]/5 rounded-full blur-[120px] pointer-events-none z-0"></div>

        <div className="max-w-[1300px] mx-auto px-6 relative z-10">

          {/* Header */}
          <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20" data-aos="fade-up">
            <h2 className="text-4xl md:text-[2.75rem] font-extrabold text-[var(--text-dark)] leading-tight mb-4">
              Our Technology Partners
            </h2>
            <h3 className="text-[18px] md:text-[20px] text-transparent bg-clip-text bg-gradient-to-r from-[var(--tech-blue)] to-[var(--premium-gold)] font-extrabold mb-6 tracking-wide">
              Global Brands. Genuine Products. Trusted Solutions.
            </h3>
            <p className="text-gray-600 text-[16px] md:text-[17px] leading-relaxed font-medium">
              Our extensive partner network enables us to provide businesses with a comprehensive portfolio of IT hardware, peripherals, networking equipment, and enterprise solutions. Through our authorized distribution ecosystem, we ensure authentic products, competitive pricing, and manufacturer-backed warranties.
            </p>
          </div>

          {/* Partners Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {partnerDetails.map((partner, index) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={(index % 3) * 100}
                className="group h-full perspective-1000"
              >
                <div className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] group-hover:shadow-[0_20px_40px_-10px_rgba(13,56,99,0.12)] transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:-translate-y-2 overflow-hidden flex flex-col h-full transform-gpu">

                  {/* Subtle Inner Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--tech-blue)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"></div>

                  {/* Glass Shine */}
                  <div className="absolute top-0 -left-[100%] h-full w-[150%] z-20 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:left-[200%] transition-all duration-1000 ease-in-out pointer-events-none"></div>

                  {/* Logo Container */}
                  <div className="h-16 mb-8 flex items-center justify-start relative z-10">
                    {partner.logoSrc ? (
                      <img
                        src={partner.logoSrc}
                        alt={partner.name}
                        className="h-full max-w-[140px] object-contain filter grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 mix-blend-multiply origin-left group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-3xl font-black text-gray-300 group-hover:text-[var(--tech-blue)] transition-colors duration-500 tracking-tight">
                        {partner.name}
                      </span>
                    )}
                  </div>

                  {/* Text Content */}
                  <div className="relative z-10 flex-grow flex flex-col">
                    <h4 className="text-[19px] font-extrabold text-[#0a294b] mb-3 leading-snug group-hover:text-[var(--tech-blue)] transition-colors duration-500">
                      {partner.tagline}
                    </h4>
                    <p className="text-[15px] text-gray-500 leading-relaxed font-medium group-hover:text-gray-700 transition-colors duration-500">
                      {partner.desc}
                    </p>
                  </div>

                  {/* Animated Bottom Line */}
                  <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-[var(--tech-blue)] to-[var(--premium-gold)] transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"></div>

                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
