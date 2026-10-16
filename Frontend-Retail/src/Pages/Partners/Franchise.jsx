import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import FranchiseHero from '../../assets/Franchise.jpg';

import img1 from '../../assets/Business-Setup.jpg';
import img2 from '../../assets/Factory-Pricing.jpg';
import img3 from '../../assets/Exclusive-Territory.jpg';
import img4 from '../../assets/Inventory-Planning.jpg';
import img5 from '../../assets/Marketing-Support.jpg';
import img6 from '../../assets/Technical-Training.jpg';
import img7 from '../../assets/Dedicated-Manager.jpg';
import img8 from '../../assets/Continuous-Support.jpg';

export default function FranchisePartner() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
    });
  }, []);

  const benefits = [
    {
      title: "Business Setup Assistance",
      desc: "End-to-end guidance from store layout design to IT infrastructure deployment.",
      image: img1
    },
    {
      title: "Factory Pricing",
      desc: "Direct access to OEM-level margins ensuring highly competitive retail pricing.",
      image: img2
    },
    {
      title: "Exclusive Territory",
      desc: "Protected geographical rights to ensure zero internal conflict and max footfall.",
      image: img3
    },
    {
      title: "Inventory Planning",
      desc: "Data-driven stock management for optimized capital rotation and zero dead stock.",
      image: img4
    },
    {
      title: "Marketing Support",
      desc: "Backed by national digital campaigns, local promo collateral, and branding kits.",
      image: img5
    },
    {
      title: "Technical Training",
      desc: "Comprehensive staff enablement on product specs, sales pitching, and support.",
      image: img6
    },
    {
      title: "Dedicated Manager",
      desc: "Your personal business expert for seamless daily operations and strategic growth.",
      image: img7
    },
    {
      title: "Continuous Support",
      desc: "24/7 operational assistance, IT backend support, and continuous strategy reviews.",
      image: img8
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[var(--soft-bg)] pb-0">

      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative w-full h-[250px] md:h-[300px] flex items-center justify-center overflow-hidden bg-slate-900">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50"

          style={{ backgroundImage: `url(${FranchiseHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 to-slate-900/80"></div>
        </div>

        {/* Hero Content with AOS */}
        <div className="relative z-10 text-center px-6" data-aos="fade-up">
          <h1 className="text-4xl md:text-[4rem] font-black text-white mb-6 tracking-tight drop-shadow-md">
            Franchise Partners
          </h1>
          <div className="w-24 h-1.5 bg-[#D4A22E] mx-auto rounded-full shadow-lg" data-aos="zoom-in" data-aos-delay="200"></div>
        </div>
      </section>

      {/* ================= 2. CONTENT & VALUE SECTION ================= */}
      <div className="relative max-w-[1300px] mx-auto px-6 pt-20 lg:pt-28 pb-10 overflow-hidden">

        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[var(--premium-gold)]/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">

          {/* Left Side: Bold Statement & CTA */}
          <div className="lg:col-span-5 text-center lg:text-left flex flex-col" data-aos="fade-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-gray-100 mb-6 w-max mx-auto lg:mx-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--tech-blue)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--tech-blue)]"></span>
              </span>
              <span className="text-[12px] font-bold text-[var(--tech-blue)] uppercase tracking-widest">
                The Blueprint to Success
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold text-[var(--text-dark)] leading-[1.15] mb-6">
              Become a AK Solutions Retail <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--tech-blue)] to-[#0a294b]">
                Franchise Partner
              </span>
            </h2>
            <div className="hidden lg:block w-16 h-1.5 bg-[var(--tech-blue)] rounded-full mb-8"></div>

            {/* Desktop CTA Button hidden on mobile to show in text block below */}
            <div className="hidden lg:block">
              <div className="inline-block group">
                <Link
                  to="/partnerpage?franchise"
                  className="relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-[var(--tech-blue)] rounded-xl font-bold text-white text-[15px] overflow-hidden shadow-[0_8px_20px_rgba(13,56,99,0.25)] group-hover:shadow-[0_15px_30px_rgba(13,56,99,0.4)] group-hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="absolute inset-0 w-full h-full -ml-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-sweep pointer-events-none"></span>
                  Become a Franchise Partner
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side: Description */}
          <div className="lg:col-span-7 flex flex-col justify-center" data-aos="fade-left" data-aos-delay="100">
            <p className="text-gray-600 text-[16.5px] md:text-[18px] leading-relaxed font-medium mb-6 text-justify">
              Our Franchise Program is designed for entrepreneurs and business owners who want to establish a successful IT hardware business with the robust support of an established brand.
            </p>

            <div className="relative pl-6 border-l-4 border-[var(--premium-gold)] bg-white p-6 rounded-r-xl shadow-sm">
              <p className="text-gray-600 text-[16px] md:text-[17px] leading-relaxed font-medium">
                As a AK Solutions Retail Franchise Partner, you'll gain exclusive access to premium technology brands, factory pricing, extensive business guidance, powerful marketing support, and an exclusive territory to grow your business confidently.
              </p>
            </div>

            {/* Mobile CTA Button */}
            <div className="mt-8 lg:hidden flex justify-center">
              <Link
                to="/partnerpage?franchise"
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--tech-blue)] rounded-xl font-bold text-white text-[15px] shadow-lg w-full"
              >
                Become a Franchise Partner
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. 8-CARD BENEFITS GRID ================= */}
      <div className="relative max-w-[1300px] mx-auto px-6 pt-10 pb-20 z-10">

        <div className="text-center mb-16" data-aos="fade-up">
          <h3 className="text-3xl font-extrabold text-[var(--text-dark)]">
            Exclusive Franchise <span className="text-[var(--premium-gold)]">Benefits</span>
          </h3>
        </div>

        {/* 4-Column Grid for perfect symmetry of 8 items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {benefits.map((benefit, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 50}
              className="group h-[320px] md:h-[380px] perspective-1000 w-full"
            >
              <div
                className="relative w-full h-full rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-[0_20px_50px_rgba(10,41,75,0.3)] transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] transform-gpu hover:-translate-y-2"
              >

                {/* Background Image */}
                <img
                  src={benefit.image}
                  alt={benefit.title}
                  className="absolute inset-0 w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                />

                {/* Deep Gradient Overlays for Text Readability & Aura */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a294b]/95 via-[#0a294b]/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-700"></div>
                <div className="absolute inset-0 bg-[var(--tech-blue)]/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                {/* Content Container (Bottom Aligned) */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">

                  {/* Decorative Line that expands on hover */}
                  <div className="w-8 h-1 bg-[var(--premium-gold)] mb-4 rounded-full transform origin-left group-hover:scale-x-150 transition-transform duration-500"></div>

                  <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                    <h4 className="text-[20px] font-extrabold text-white mb-2 tracking-tight leading-snug drop-shadow-md">
                      {benefit.title}
                    </h4>

                    {/* Description - Reveals on Hover */}
                    <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-700 ease-in-out">
                      <p className="text-[14px] text-gray-200 leading-relaxed font-medium pb-1">
                        {benefit.desc}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Ambient Sweep Shine */}
                <div className="absolute top-0 -left-[100%] h-full w-[150%] z-20 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[200%] transition-all duration-1000 ease-in-out pointer-events-none"></div>

              </div>
            </div>
          ))}

        </div>
      </div>


      {/* Required Animation Style */}
      <style>{`
        @keyframes sweep {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(150%); }
        }
        .animate-sweep {
          animation: sweep 2s ease-in-out infinite;
        }
      `}</style>

    </div>
  );
}
