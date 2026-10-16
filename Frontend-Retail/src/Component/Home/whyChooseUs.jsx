import React from 'react';
import genuineImg from '../../assets/genuine.jpg';
import bulkImg from '../../assets/Bulking.jpg';
import deliveryImg from '../../assets/Pan-India.jpg';
import supportImg from '../../assets/Dedicated-Account.jpg';
import inventoryImg from '../../assets/Large-Inventory.jpg';
import trustedImg from '../../assets/Trusted-Partner.jpg';

export default function WhyChooseUs() {
  const features = [
    {
      id: 1,
      title: "100% Genuine Products",
      desc: "Every product is sourced directly from authorized manufacturers and distributors with official warranty support.",
      image: genuineImg
    },
    {
      id: 2,
      title: "Competitive Bulk Pricing",
      desc: "Special pricing designed specifically for businesses, institutions, resellers, and corporate procurement teams.",
      image: bulkImg
    },
    {
      id: 3,
      title: "Pan-India Delivery",
      desc: "Fast, secure, and insured logistics ensuring timely delivery across India, straight to your facility.",
      image: deliveryImg
    },
    {
      id: 4,
      title: "Dedicated Account Managers",
      desc: "Get personalized assistance from procurement consultation to reliable after-sales support.",
      image: supportImg
    },
    {
      id: 5,
      title: "Large Inventory",
      desc: "Access thousands of ready-to-dispatch IT products with consistent stock availability for large orders.",
      image: inventoryImg
    },
    {
      id: 6,
      title: "Trusted Business Partner",
      desc: "Helping organizations build reliable IT infrastructure with quality products and transparent service.",
      image: trustedImg
    }
  ];

  return (
    <section className="relative w-full py-24 bg-gradient-to-b from-white to-[var(--soft-bg)] overflow-hidden">

      {/* --- Background Decorations --- */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[var(--tech-blue)]/5 to-transparent z-0 pointer-events-none"></div>
      <div className="absolute -left-32 bottom-0 w-96 h-96 bg-[var(--premium-gold)]/5 rounded-full blur-[100px] z-0 pointer-events-none"></div>

      <div className="max-w-[1300px] mx-auto px-6 md:px-12 relative z-10">

        {/* ================= HEADER SECTION ================= */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-0.5 bg-[var(--premium-gold)]"></span>
            <span className="text-[12.5px] md:text-[14px] font-extrabold text-[var(--tech-blue)] uppercase tracking-[0.2em]">
              Our Advantage
            </span>
            <span className="w-8 h-0.5 bg-[var(--premium-gold)]"></span>
          </div>

          <h2 className="text-4xl md:text-[2.75rem] font-extrabold text-[var(--text-dark)] leading-tight mb-6">
            Why Businesses Choose <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--tech-blue)] to-[#0a294b]">AK Solutions Retail</span>
          </h2>
        </div>

        {/* ================= FEATURES GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-10">

          {features.map((feature) => (
            <div key={feature.id} className="group h-full perspective-1000">
              <div
                className="relative bg-white rounded-[24px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_30px_60px_-15px_rgba(10,41,75,0.2)] transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-3 hover:scale-[1.01] overflow-hidden flex flex-col h-full transform-gpu"
              >

                {/* --- Ambient Glow Effect on Hover --- */}
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--tech-blue)]/5 via-transparent to-[var(--premium-gold)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10"></div>

                {/* --- Sweep Shine Effect --- */}
                <div className="absolute top-0 -left-[100%] h-full w-[150%] z-20 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:left-[200%] transition-all duration-1000 ease-in-out pointer-events-none"></div>

                {/* Full Width Image Container */}
                <div className="relative w-full h-52 md:h-64 flex-shrink-0 overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                  />
                  {/* Image Overlays for Depth */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-gray-900/10 to-transparent pointer-events-none mix-blend-multiply opacity-80 group-hover:opacity-100 transition-opacity duration-700"></div>
                  <div className="absolute inset-0 shadow-[inset_0_-20px_30px_rgba(0,0,0,0.15)] pointer-events-none"></div>
                </div>

                {/* Content Section */}
                <div className="relative z-10 flex-grow p-8 md:p-10 bg-white flex flex-col transition-transform duration-700 ease-out group-hover:bg-gradient-to-b group-hover:from-white group-hover:to-gray-50/50">
                  {/* Decorative Accent Line */}
                  <div className="w-12 h-1 bg-gradient-to-r from-[var(--tech-blue)] to-[var(--premium-gold)] rounded-full mb-6 transform origin-left group-hover:scale-x-150 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"></div>

                  <h3 className="text-[22px] font-extrabold text-[#0a294b] mb-4 tracking-tight group-hover:text-[var(--tech-blue)] transition-colors duration-500 leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-[16px] text-gray-500 leading-relaxed font-medium group-hover:text-gray-700 transition-colors duration-500">
                    {feature.desc}
                  </p>
                </div>

                {/* Ambient Glow at the bottom */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-[var(--tech-blue)]/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-0"></div>

              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}
