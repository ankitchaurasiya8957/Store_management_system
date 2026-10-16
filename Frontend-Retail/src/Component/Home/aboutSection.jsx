import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import AboutImg from '../../assets/AboutImg.jpg';

export default function AboutSection() {
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
    });
  }, []);
  return (

    <section className="relative w-full py-12 lg:py-16 bg-[var(--soft-bg)] overflow-hidden">

      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#e2e6eb] to-transparent z-0"></div>
      <div className="absolute -left-20 top-10 w-48 h-48 bg-[var(--tech-blue)] opacity-5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* ================= LEFT COLUMN: TEXT CONTENT ================= */}
          <div className="flex flex-col" data-aos="fade-right">

            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-0.5 bg-[var(--premium-gold)]"></span>
              <span className="text-[12px] md:text-[13px] font-bold text-[var(--tech-blue)] uppercase tracking-widest">
                About AK Solutions Retail
              </span>
            </div>


            <h2 className="text-3xl lg:text-[2.2rem] font-extrabold text-[var(--text-dark)] leading-tight mb-4">
              Building India's Trusted <br />
              <span className="text-[var(--tech-blue)]">IT Hardware Supply Network</span>
            </h2>


            <p className="text-gray-600 text-[14px] md:text-[15px] leading-relaxed mb-4 font-medium">
              AK Solutions Retail is a technology-driven B2B hardware distribution platform built to simplify how businesses purchase and manage IT infrastructure. We connect corporates, educational institutions, system integrators, and retailers with genuine hardware from leading global brands.
            </p>

            <p className="text-gray-600 text-[14px] md:text-[15px] leading-relaxed mb-5">
              Alongside enterprise procurement, we empower entrepreneurs through our franchise ecosystem—providing access to factory pricing, dedicated business support, and exclusive territory opportunities.
            </p>


            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] mb-6" data-aos="fade-up" data-aos-delay="100">
              <h4 className="text-[14px] font-bold text-[var(--tech-blue)] uppercase tracking-wider mb-3">Our Mission</h4>
              <ul className="space-y-2">
                {[
                  "Deliver authentic and genuine products",
                  "Ensure transparent and factory-level pricing",
                  "Provide dependable service that businesses can trust"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[var(--premium-gold)]/20 flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-[var(--premium-gold)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span className="text-[13.5px] text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 font-bold text-[14px] text-[var(--tech-blue)] hover:text-[var(--techgolden-hover)] transition-colors duration-300 group"
              >
                Discover Our Journey
                <svg className="w-4 h-4 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: COMPACT IMAGE WITH HOVER ================= */}

          <div className="relative w-full h-[300px] lg:h-[300px] mt-6 lg:mt-0" data-aos="fade-left" data-aos-delay="200">

            <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(13,56,99,0.12)] z-10 group cursor-pointer border-[3px] border-white">

              <img
                src={AboutImg}
                alt="IT Hardware Supply"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[var(--tech-blue)]/80 via-transparent to-transparent opacity-80"></div>

              {/* Glassy Shine Effect */}
              <div className="absolute top-0 -left-[150%] z-20 w-1/2 h-full block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-1000 ease-in-out group-hover:left-[150%] pointer-events-none"></div>



            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
