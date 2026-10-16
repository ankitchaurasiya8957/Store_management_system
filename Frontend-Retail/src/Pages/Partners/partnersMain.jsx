import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import PartnerEcosystemHero from '../../assets/Partners.jpg';
import OemImg from '../../assets/OEM.jpg';
import ChannelImg from '../../assets/Channel-hero.jpg';
import FranchiseImg from '../../assets/Franchise.jpg';

const AnimatedCounter = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);
  const counterRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  React.useEffect(() => {
    if (!isVisible) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOutQuad = progress * (2 - progress);
      setCount(Math.floor(easeOutQuad * end));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    window.requestAnimationFrame(step);
  }, [isVisible, end, duration]);

  return (
    <span ref={counterRef}>
      {count}
      {suffix}
    </span>
  );
};

export default function PartnersMain() {
  // Initialize AOS animations
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
    });
  }, []);

  const partnerCategories = [
    {
      id: "oem",
      title: "OEM Partner",
      subtitle: "Manufacturers",
      desc: "Direct alliances with global manufacturers to deliver genuine enterprise IT hardware with official warranties.",
      link: "/partner/oem",
      img: OemImg
    },
    {
      id: "channel",
      title: "Channel Partner",
      subtitle: "Resellers",
      desc: "Procure IT hardware in bulk and distribute products to regional markets with competitive business pricing.",
      link: "/partner/channel",
      img: ChannelImg
    },
    {
      id: "franchise",
      title: "Franchise Partner",
      subtitle: "Retail Storefronts",
      desc: "Establish a highly profitable IT retail storefront with factory pricing, marketing support, and exclusive territories.",
      link: "/partner/franchise",
      img: FranchiseImg
    }
  ];

  return (
    <div className="w-full min-h-screen bg-[var(--soft-bg)] pb-20">

      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative w-full h-[350px] md:h-[310px] flex items-center justify-center overflow-hidden bg-slate-900">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60"

          style={{ backgroundImage: `url(${PartnerEcosystemHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 to-slate-900/80"></div>
        </div>

        {/* Hero Content with AOS */}
        <div className="relative z-10 text-center px-6" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6">
            <span className="text-[12px] font-bold text-[var(--premium-gold)] uppercase tracking-widest">
              Join Our Network
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-[4.5rem] font-black text-white mb-6 tracking-tight drop-shadow-md leading-tight">
            Partner <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--premium-gold)] to-yellow-300">Ecosystem</span>
          </h1>
          <p className="text-gray-300 text-[16px] md:text-[20px] font-medium max-w-2xl mx-auto">
            Collaborate, Grow, and Succeed with AK Solutions Retail
          </p>
        </div>
      </section>

      {/* ================= 2. CONTENT SECTION ================= */}
      <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-12 text-center z-10" data-aos="fade-up" data-aos-delay="100">

        <h2 className="text-3xl md:text-4xl font-extrabold text-[var(--text-dark)] leading-tight mb-6">
          Choose Your Path to <span className="text-[var(--tech-blue)]">Growth</span>
        </h2>

        <p className="text-gray-600 text-[16.5px] md:text-[18px] leading-relaxed font-medium mb-6">
          At AK Solutions Retail, we believe in building strong, mutually beneficial relationships. Whether you manufacture world-class hardware, distribute to regional markets, or want to build your own retail business, we have a tailored partnership model for you.
        </p>

        <div className="w-24 h-1 bg-[var(--premium-gold)] mx-auto rounded-full mt-8"></div>
      </div>

      {/* ================= 3. PARTNERSHIP CARDS GRID ================= */}
      <div className="relative max-w-[1300px] mx-auto px-6 pt-8 pb-10 z-10">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">

          {partnerCategories.map((partner, index) => (
            <div
              key={partner.id}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="group h-full cursor-pointer block"
            >
              <Link
                to={partner.link}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 group-hover:shadow-2xl group-hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col h-full"
              >
                {/* Card Image Container */}
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={partner.img}
                    alt={partner.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                  />

                  {/* Standard dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>

                  {/* CENTER-OUT SHUTTER EFFECT */}
                  <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-500 ease-in-out pointer-events-none"></div>
                </div>

                {/* Card Content Area */}
                <div className="p-8 relative z-10 bg-white flex flex-col h-full">
                  <h3 className="text-2xl font-bold text-[var(--premium-gold)] mb-2 tracking-tight group-hover:text-[var(--tech-blue)] transition-colors duration-300">
                    {partner.title}
                  </h3>
                  <p className="text-[var(--tech-blue)] font-semibold text-[15px] italic mb-4">
                    {partner.subtitle}
                  </p>
                  <p className="text-gray-600 leading-relaxed text-[15px]">
                    {partner.desc}
                  </p>
                </div>
              </Link>
            </div>
          ))}

        </div>
      </div>

      {/* ================= 4. WHY PARTNERSHIPS MATTER & STATISTICS (LIGHT AURA) ================= */}
      <section className="relative w-full py-28 bg-[var(--soft-bg)] overflow-hidden border-t border-gray-100">
        {/* Soft Aura Glows */}
        <div className="absolute top-[0%] left-[-10%] w-[600px] h-[600px] bg-[var(--tech-blue)]/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[0%] right-[-10%] w-[600px] h-[600px] bg-[var(--premium-gold)]/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-[1300px] mx-auto px-6 relative z-10">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

            {/* Left: Why Our Partnerships Matter */}
            <div className="lg:col-span-7" data-aos="fade-right">
              <h2 className="text-3xl md:text-[2.5rem] font-black text-[#0a294b] mb-10 leading-tight tracking-tight">
                Why Our Partnerships <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--tech-blue)] to-[var(--premium-gold)] drop-shadow-[0_4px_10px_rgba(221,167,60,0.2)]">
                  Truly Matter
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  "Authentic Products",
                  "Latest Technology",
                  "Competitive Business Pricing",
                  "End-to-End Support",
                  "Nationwide Availability",
                  "Enterprise-Ready Solutions"
                ].map((item, idx) => (
                  <div key={idx} className="group relative p-[1px] rounded-2xl bg-gradient-to-br from-gray-100 to-transparent hover:from-[var(--tech-blue)] hover:to-[var(--premium-gold)] transition-all duration-500 shadow-sm hover:shadow-[0_10px_30px_rgba(13,56,99,0.15)] hover:-translate-y-1">
                    <div className="flex items-center gap-4 p-5 bg-white rounded-2xl h-full">
                      <div className="w-10 h-10 rounded-full bg-blue-50/50 border border-gray-100 flex items-center justify-center text-[var(--premium-gold)] group-hover:bg-[var(--tech-blue)] group-hover:text-white group-hover:border-transparent transition-all duration-500 shadow-[0_4px_10px_rgba(0,0,0,0.03)] flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="font-bold text-[#0a294b] group-hover:text-[var(--tech-blue)] text-[15.5px] transition-colors duration-500 tracking-wide">{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Partner Network Statistics */}
            <div className="lg:col-span-5 relative" data-aos="fade-left">
              <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-transparent rounded-[2rem] transform rotate-3 blur-sm opacity-50"></div>

              <div className="relative p-10 bg-white border border-gray-100 rounded-[2rem] shadow-[0_20px_50px_rgba(13,56,99,0.08)] overflow-hidden">
                {/* Glass Shine effect */}
                <div className="absolute top-0 -left-[100%] h-full w-[150%] z-0 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/80 to-transparent animate-sweep pointer-events-none"></div>

                <h2 className="text-2xl font-black text-[#0a294b] mb-10 relative z-10 tracking-wide">
                  Network <span className="text-[var(--premium-gold)]">Scale</span>
                </h2>

                <div className="flex flex-col gap-8 relative z-10">
                  <div className="flex items-center gap-6 group">
                    <h3 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#0a294b] to-[var(--tech-blue)] drop-shadow-[0_4px_10px_rgba(13,56,99,0.15)]">
                      <AnimatedCounter end={11} suffix="+" />
                    </h3>
                    <p className="text-[15px] font-bold text-gray-500 group-hover:text-[var(--tech-blue)] transition-colors duration-300 uppercase tracking-widest">Global Tech<br />Partners</p>
                  </div>

                  <div className="w-full h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent"></div>

                  <div className="flex items-center gap-6 group">
                    <h3 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[var(--premium-gold)] to-yellow-600 drop-shadow-[0_4px_10px_rgba(221,167,60,0.2)]">
                      <AnimatedCounter end={100} suffix="%" />
                    </h3>
                    <p className="text-[15px] font-bold text-gray-500 group-hover:text-[var(--premium-gold)] transition-colors duration-300 uppercase tracking-widest">Genuine<br />Products</p>
                  </div>
                </div>

                <div className="mt-12 space-y-4 relative z-10">
                  {[
                    "Pan-India Supply Network",
                    "Enterprise-Grade Solutions",
                    "Manufacturer Warranty"
                  ].map((stat, idx) => (
                    <div key={idx} className="flex items-center gap-4 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--tech-blue)] group-hover:scale-150 group-hover:shadow-[0_0_10px_rgba(13,56,99,0.4)] transition-all duration-300"></div>
                      <span className="font-semibold text-gray-600 group-hover:text-[var(--tech-blue)] text-[14.5px] transition-colors tracking-wide">{stat}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= 5. INDUSTRIES WE SERVE (LIGHT MARQUEE) ================= */}
      <section className="relative w-full py-24 bg-gray-50/50 overflow-hidden text-[#0a294b] border-t border-gray-100">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[200px] bg-[var(--premium-gold)]/5 rounded-[100%] blur-[120px] pointer-events-none"></div>

        <div className="max-w-[1300px] mx-auto px-6 relative z-10 text-center mb-16">
          <div data-aos="fade-up">
            <h2 className="text-sm font-bold tracking-[0.3em] text-[var(--tech-blue)] uppercase mb-4">Empowering</h2>
            <h3 className="text-4xl md:text-5xl font-black mb-6 drop-shadow-sm">Industries We Serve</h3>
            <div className="w-16 h-1 bg-gradient-to-r from-[var(--tech-blue)] to-[var(--premium-gold)] mx-auto rounded-full"></div>
          </div>
        </div>

        {/* CSS Marquee animation */}
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 40s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
          @keyframes sweep {
            0% { transform: translateX(-150%) skewX(-12deg); }
            100% { transform: translateX(200%) skewX(-12deg); }
          }
          .animate-sweep {
            animation: sweep 3s ease-in-out infinite;
          }
        `}</style>

        <div className="relative w-full overflow-hidden flex z-10">

          {/* Gradient Masks for smooth fading edges */}
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-gray-50/50 to-transparent z-20 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-gray-50/50 to-transparent z-20 pointer-events-none"></div>

          <div className="flex animate-marquee whitespace-nowrap items-center py-4 w-max">
            {/* Array duplicated to create seamless infinite loop */}
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-6 px-3">
                {[
                  "Corporate Enterprises",
                  "Educational Institutions",
                  "Healthcare",
                  "Banking & Finance",
                  "Manufacturing",
                  "Retail Businesses",
                  "Startups & SMEs",
                  "IT & Software",
                  "System Integrators"
                ].map((industry, idx) => (
                  <div
                    key={idx}
                    className="group relative px-8 py-5 bg-white border border-gray-200 hover:border-[var(--tech-blue)]/50 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-500 cursor-pointer overflow-hidden hover:shadow-[0_15px_30px_rgba(13,56,99,0.1)] hover:-translate-y-1"
                  >
                    {/* Inner glowing hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--tech-blue)]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                    <span className="relative z-10 font-bold text-[17px] text-gray-600 group-hover:text-[var(--tech-blue)] tracking-wide transition-colors">{industry}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
