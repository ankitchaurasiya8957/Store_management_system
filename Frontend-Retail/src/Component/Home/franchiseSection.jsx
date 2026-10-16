import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function FranchiseSection() {
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
      title: "Factory & Wholesale Pricing",
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    },
    {
      title: "Exclusive Territory Protection",
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    },
    {
      title: "Business Setup Assistance",
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    },
    {
      title: "Branding & Marketing Support",
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    },
    {
      title: "Inventory Planning",
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    },
    {
      title: "Training & Operational Guidance",
      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    }
  ];

  return (
    <section className="relative w-full py-24 bg-white overflow-hidden">

      {/* Background Decorators */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[var(--soft-bg)] to-transparent z-0 pointer-events-none"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--tech-blue)]/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className="max-w-[1300px] mx-auto px-6 md:px-12 relative z-10">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ================= LEFT COLUMN: CONTENT & CTA ================= */}
          <div className="flex flex-col" data-aos="fade-right">

            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-0.5 bg-[var(--premium-gold)]"></span>
              <span className="text-[13px] md:text-[14px] font-extrabold text-[var(--tech-blue)] uppercase tracking-[0.2em]">
                Franchise Opportunity
              </span>
            </div>

            <h2 className="text-4xl md:text-[3rem] font-extrabold text-[var(--text-dark)] leading-tight mb-6">
              Build Your Own <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--tech-blue)] to-[#0a294b]">
                IT Retail Business
              </span>
            </h2>

            <p className="text-gray-600 text-[16px] md:text-[17.5px] leading-relaxed font-medium mb-5">
              Become a AK Solutions Retail Franchise Partner and gain access to factory pricing, premium technology brands, marketing support, business guidance, and exclusive territory benefits.
            </p>

            <p className="text-gray-600 text-[16px] md:text-[17.5px] leading-relaxed font-medium mb-10">
              Whether you're an experienced retailer or a first-time entrepreneur, our franchise ecosystem is designed to help you build a highly profitable technology business.
            </p>

            {/* CTA Button */}
            <div>
              <Link
                to="/partnerpage?franchise"
                className="group relative inline-flex items-center justify-center gap-3 px-9 py-4 bg-[var(--tech-blue)] rounded-xl font-bold text-white text-[16px] overflow-hidden shadow-[0_8px_20px_rgba(13,56,99,0.25)] hover:shadow-[0_15px_30px_rgba(13,56,99,0.4)] hover:-translate-y-1 transition-all duration-300"
              >
                {/* Button Hover Sweep Effect */}
                <span className="absolute inset-0 w-full h-full -ml-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-sweep pointer-events-none"></span>

                Apply for Franchise

                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform group-hover:translate-x-1.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: BENEFITS GRID ================= */}
          <div className="relative w-full" data-aos="fade-left" data-aos-delay="200">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">

              {/* Top 6 Benefits mapped dynamically */}
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-[var(--soft-bg)]/60 border border-gray-100 hover:bg-white hover:shadow-[0_10px_30px_rgba(13,56,99,0.08)] hover:border-[var(--tech-blue)]/20 transition-all duration-300 ease-out cursor-default"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center text-[var(--tech-blue)] shadow-sm group-hover:bg-[var(--tech-blue)] group-hover:text-white transition-colors duration-300 border border-gray-100 group-hover:border-transparent">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      {benefit.icon}
                    </svg>
                  </div>
                  <div className="flex items-center h-full mt-1">
                    <h4 className="text-[15.5px] font-bold text-[var(--text-dark)] leading-snug group-hover:text-[var(--tech-blue)] transition-colors duration-300">
                      {benefit.title}
                    </h4>
                  </div>
                </div>
              ))}

              {/* 7th Benefit (Dedicated Relationship Manager) - Spans 2 columns to complete the grid beautifully */}
              <div className="group sm:col-span-2 flex items-center gap-5 p-6 rounded-2xl bg-gradient-to-r from-[var(--tech-blue)] to-[#0a294b] border border-transparent hover:shadow-[0_15px_30px_rgba(13,56,99,0.2)] transition-all duration-300 ease-out cursor-default transform hover:-translate-y-1">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-[var(--premium-gold)] border border-white/10 group-hover:scale-110 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-white/70 uppercase tracking-widest mb-1">VIP Support</p>
                  <h4 className="text-[17px] md:text-[18px] font-bold text-white leading-snug">
                    Dedicated Relationship Manager
                  </h4>
                </div>
                {/* Subtle highlight ring */}
                <div className="absolute right-0 top-0 w-32 h-32 bg-[var(--premium-gold)]/10 rounded-full blur-2xl pointer-events-none"></div>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Required Animation for button sweep effect (Keep this style tag here) */}
      <style>{`
        @keyframes sweep {
          0% { transform: translateX(-150%); }
          100% { transform: translateX(150%); }
        }
        .animate-sweep {
          animation: sweep 1.5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
