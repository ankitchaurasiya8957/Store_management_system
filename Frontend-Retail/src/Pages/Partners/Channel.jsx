import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import ChannelHero from '../../assets/Channel-hero.jpg';
import ChannelContentImg from '../../assets/Channel-content.jpg';

import bulkImg from '../../assets/Bulk.jpg';
import marginsImg from '../../assets/Better-Profit.jpg';
import verifiedImg from '../../assets/Verified.jpg';
import supplyImg from '../../assets/pan.jpg';
import growthImg from '../../assets/Business-Growth.jpg';
import supportImg from '../../assets/Dedicated-Support.jpg';

export default function ChannelPartner() {
  // Initialize AOS animations
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
    });
  }, []);

  // 6 Benefits Data with highly professional SVG Icons
  const benefits = [
    {
      title: "Bulk Procurement",
      desc: "Purchase enterprise IT hardware in large quantities with competitive business pricing.",
      image: bulkImg
    },
    {
      title: "Better Profit Margins",
      desc: "Access special partner pricing that enables sustainable and scalable business growth.",
      image: marginsImg
    },
    {
      title: "Verified Products",
      desc: "Receive genuine hardware directly from trusted OEMs and authorized distribution channels.",
      image: verifiedImg
    },
    {
      title: "Pan India Supply",
      desc: "Reliable, insured logistics and timely deliveries across all regions in India.",
      image: supplyImg
    },
    {
      title: "Business Growth",
      desc: "Expand your customer base with a wide portfolio of premium enterprise technology products.",
      image: growthImg
    },
    {
      title: "Dedicated Support",
      desc: "Dedicated account managers to assist with procurement, quotations, and after-sales support.",
      image: supportImg
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[var(--soft-bg)] pb-10">

      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative w-full h-[250px] md:h-[300px] flex items-center justify-center overflow-hidden bg-slate-900">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60"
          style={{ backgroundImage: `url(${ChannelHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 to-slate-900/70"></div>
        </div>

        {/* Hero Content with AOS */}
        <div className="relative z-10 text-center px-6" data-aos="fade-up">
          <h1 className="text-5xl md:text-[4.5rem] font-black text-white mb-6 tracking-tight drop-shadow-md">
            Our Channel Partners
          </h1>
          <div className="w-24 h-1.5 bg-[#D4A22E] mx-auto rounded-full shadow-lg" data-aos="zoom-in" data-aos-delay="200"></div>
        </div>
      </section>

      {/* ================= 2. CONTENT & VALUE SECTION (UPDATED WITH IMAGE) ================= */}
      <div className="relative max-w-[1300px] mx-auto px-6 pt-20 lg:pt-28 pb-10 overflow-hidden">

        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--tech-blue)]/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start relative z-10">

          {/* Left Side: Bold Statement & Nayi Image */}
          <div className="lg:col-span-5 text-center lg:text-left flex flex-col" data-aos="fade-right">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-gray-100 mb-6 mx-auto lg:mx-0 w-max">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--tech-blue)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--tech-blue)]"></span>
              </span>
              <span className="text-[12px] font-bold text-[var(--tech-blue)] uppercase tracking-widest">
                The Channel Advantage
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-[2.75rem] font-extrabold text-[var(--text-dark)] leading-tight mb-6">
              Expanding the Ecosystem <br className="hidden lg:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--tech-blue)] to-[var(--premium-gold)]">Together</span>
            </h2>
            <div className="hidden lg:block w-16 h-1.5 bg-[var(--tech-blue)] rounded-full mb-10"></div>

            <div className="relative w-full rounded-2xl overflow-hidden shadow-[0_15px_40px_rgba(13,56,99,0.15)] group mt-4 lg:mt-0">
              <img
                src={ChannelContentImg}
                alt="Channel Partner Ecosystem"
                className="w-full h-[150px] md:h-[250px] object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a294b]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            </div>
          </div>

          {/* Right Side: Description */}
          <div className="lg:col-span-7 flex flex-col justify-center h-full" data-aos="fade-left" data-aos-delay="100">
            <p className="text-gray-600 text-[16.5px] md:text-[17.5px] leading-relaxed font-medium mb-6 text-justify">
              Channel Partners play a vital role in expanding the AK Solutions Retail ecosystem. They procure IT hardware in bulk through our procurement platform and distribute products to businesses, retailers, institutions, and end customers across different regions.
            </p>
            <p className="text-gray-600 text-[16.5px] md:text-[17.5px] leading-relaxed font-medium mb-6 text-justify">
              Our Channel Partner program is designed for organizations looking to grow their business with competitive pricing, genuine products, and reliable supply chain support.
            </p>

            {/* The 'Perfect Sentence' Highlight Box */}
            <div className="relative pl-6 border-l-4 border-[var(--premium-gold)] bg-white p-6 rounded-r-xl shadow-sm mt-6 lg:mt-16">
              <p className="text-[var(--tech-blue)] text-[16px] md:text-[17px] leading-relaxed font-bold italic">
                "Channel Partners purchase IT hardware in bulk from AK Solutions Retail and further distribute or resell these products to corporate clients, retailers, institutions, and regional markets while benefiting from competitive pricing and dedicated business support."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. BENEFITS GRID SECTION ================= */}
      <div className="relative max-w-[1300px] mx-auto px-6 pt-10 pb-24 z-10">

        <div className="text-center mb-16" data-aos="fade-up">
          <h3 className="text-3xl font-extrabold text-[var(--text-dark)]">
            Program <span className="text-[var(--premium-gold)]">Benefits</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">

          {benefits.map((benefit, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="group h-[320px] md:h-[360px] perspective-1000 w-full"
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a294b]/95 via-[#0a294b]/50 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-700"></div>
                <div className="absolute inset-0 bg-[var(--tech-blue)]/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                {/* Content Container (Bottom Aligned) */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end">

                  {/* Decorative Line that expands on hover */}
                  <div className="w-8 h-1 bg-[var(--premium-gold)] mb-4 rounded-full transform origin-left group-hover:scale-x-150 transition-transform duration-500"></div>

                  <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]">
                    <h4 className="text-[24px] font-extrabold text-white mb-3 tracking-tight leading-snug drop-shadow-md">
                      {benefit.title}
                    </h4>

                    {/* Description - Reveals on Hover */}
                    <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-700 ease-in-out">
                      <p className="text-[15.5px] text-gray-200 leading-relaxed font-medium pb-2">
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

    </div>
  );
}
