import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import logo from "../../assets/logo.png";

/* ---------- Inline icons (zero extra dependency) ---------- */
const PhoneIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const ArrowUpIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);
const ArrowRightIcon = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...p}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </svg>
);

/* ---------- Circuit-trace background ---------- */
const CircuitPattern = ({ id, color, opacity }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
    <defs>
      <pattern id={id} width="140" height="140" patternUnits="userSpaceOnUse">
        <path d="M0 26 H48 V72 H104 V140" stroke={color} strokeWidth="1.4" fill="none" opacity={opacity} />
        <path d="M140 100 H90 V42 H26 V0" stroke={color} strokeWidth="1.4" fill="none" opacity={opacity} />
        <path d="M0 116 H24" stroke={color} strokeWidth="1.4" fill="none" opacity={opacity} />
        <circle cx="48" cy="26" r="2.6" fill={color} opacity={opacity * 1.8} />
        <circle cx="104" cy="72" r="2.6" fill={color} opacity={opacity * 1.8} />
        <circle cx="90" cy="100" r="2.6" fill={color} opacity={opacity * 1.8} />
        <circle cx="26" cy="42" r="2.6" fill={color} opacity={opacity * 1.8} />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill={`url(#${id})`} />
  </svg>
);

/* ---------- Data ---------- */
const shopLinks = [
  { name: "Bulk Catalog", path: "/#bulkcatalog" },
  { name: "Brands We Deal In", path: "/#brands" },
  { name: "Why Buy in Bulk", path: "/about#BuyBulk" },

];
const companyLinks = [
  { name: "Home", path: "/" },
  { name: "About Us", path: "/about" },
  { name: "Partners", path: "/partners" },
  { name: "Investors", path: "/investors" },
  { name: "Contact Us", path: "/contact" }
];

const franchiseLinks = [
  { name: "Apply for Franchise", path: "/partnerpage?franchise" },
  { name: "Franchise / Partner Login", path: "/login" },
  { name: "Store Setup Support", path: "/contact#contactform" },

];

/* ================= EXACT LINK COLUMN MATCHING YOUR OLD FOOTER.JSX ================= */
const LinkColumn = ({ title, links, customMargin = "ml-10" }) => (
  <div>
    <h3 className={`text-[16px] font-bold text-white mb-5 tracking-wide ${customMargin}`}>
      {title}
    </h3>
    <ul className={`space-y-3 ${customMargin}`}>
      {links.map((item, index) => (
        <li key={index} className="flex items-start group">
          <span className="text-[#00D2FF] mr-2 text-[10px] mt-1.5 group-hover:text-[#FF007A] transition-colors">●</span>
          <Link to={item.path} className="text-[14px] text-slate-400 group-hover:text-[#00D2FF] transition-colors duration-200">
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

export default function Footer() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="w-full flex flex-col relative overflow-hidden bg-[#05070D]" style={{ fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @keyframes AK-pulse-move {
          0% { left: -2%; opacity: 0; }
          12% { opacity: 1; }
          88% { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
      `}</style>

      {/* ================= TOP CTA BANNER ================= */}
      <div
        className="relative py-8 md:py-10 overflow-hidden bg-gradient-to-r from-[#07090e] via-[#0C101A] to-[#101626] border-t border-white/[0.08]"
      >
        <CircuitPattern id="circuit-banner" color="#00D2FF" opacity={0.06} />
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(0, 210, 255, 0.15)" }} />
        <div className="absolute -bottom-24 left-1/3 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(255, 0, 122, 0.12)" }} />

        {/* Strict padding added here to match old layout edge-to-edge */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-6 z-10">
          <div>
            <p className="text-[#00D2FF] text-xs font-bold tracking-[0.25em] uppercase mb-1">
              Pan-India IT hardware network
            </p>
            <h2 className="text-white text-2xl md:text-4xl font-extrabold leading-tight drop-shadow-[0_2px_15px_rgba(0,210,255,0.2)]">
              Your Growth. <span className="bg-gradient-to-r from-[#00D2FF] via-[#c084fc] to-[#FF007A] bg-clip-text text-transparent">Our Hardware.</span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/partnerpage?franchise"
              className="group relative px-8 py-3.5 rounded-xl font-bold text-white
                         bg-gradient-to-r from-[#00D2FF] via-[#7928CA] to-[#FF007A]
                         shadow-[0_10px_30px_rgba(0,210,255,0.3)]
                         hover:shadow-[0_15px_40px_rgba(0,210,255,0.5)]
                         transition-all duration-200 ease-out
                         hover:-translate-y-0.5 active:translate-y-0.5
                         flex items-center gap-2"
            >
              Apply for Franchise
              <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* glowing pulse seam */}
      <div className="relative h-[2px] w-full overflow-hidden bg-gradient-to-r from-transparent via-[#00D2FF] to-transparent">
        <span
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
          style={{
            background: "linear-gradient(135deg, #00D2FF, #FF007A)",
            boxShadow: "0 0 12px 3px rgba(0, 210, 255, 0.9)",
            animation: "AK-pulse-move 4.5s linear infinite",
          }}
        />
      </div>

      {/* ================= MAIN FOOTER ================= */}
      <div className="relative pt-12 pb-8 border-t border-white/[0.05] bg-[#05070D]">
        <CircuitPattern id="circuit-body" color="#00D2FF" opacity={0.03} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

            <div className="flex flex-col pr-4">
              <a href="/" className="flex items-center mb-4 cursor-pointer">
                <div className="w-20 h-20 bg-transparent rounded-full flex items-center justify-center overflow-hidden">
                  <img
                    src={logo}
                    alt="Company Logo"
                    className="w-full h-full object-contain drop-shadow-[0_2px_12px_rgba(0,210,255,0.3)]"
                  />
                </div>
              </a>
              <span className="text-[22px] font-extrabold tracking-tight mb-3 leading-none bg-gradient-to-r from-[#00D2FF] via-[#c084fc] to-[#FF007A] bg-clip-text text-transparent">
                AK Solutions Retail
              </span>
              <p className="text-[13px] text-slate-400 leading-relaxed mb-6">
                IT hardware bulk supply and franchise network for corporates, institutions and resellers across India.
              </p>
              <div className="flex items-center gap-2 text-slate-300 hover:text-[#00D2FF] transition-colors cursor-pointer w-fit mb-4">
                <PhoneIcon className="w-4 h-4 text-[#00D2FF]" />
                <a href="tel:+919711888951" className="text-[14px] font-medium">+91 9711888951</a>
              </div>
            </div>

            {/* COLUMN 2, 3, 4: Link Columns using exact old spacing */}
            <LinkColumn title="Shop" links={shopLinks} customMargin="ml-0 lg:ml-10" />
            <LinkColumn title="Company" links={companyLinks} customMargin="ml-0 lg:ml-10" />
            <LinkColumn title="Franchise" links={franchiseLinks} customMargin="ml-0 lg:ml-8" />

          </div>
        </div>
      </div>

      {/* ================= BOTTOM BAR ================= */}
      <div className="bg-[#07090e] py-4 border-t border-white/[0.06] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-[13px] text-slate-400">
          <p className="font-medium">© {new Date().getFullYear()} AK Solutions Retail. All rights reserved.</p>

          <div className="flex items-center space-x-6 mt-3 md:mt-0">
            <div className="flex space-x-4 border-r border-white/10 pr-6">
              <a href="https://www.linkedin.com/company/AK Solutions-solutions/" target="_blank" rel="noopener noreferrer" className="font-medium transition-colors text-slate-400 hover:text-[#00D2FF]">LinkedIn</a>
            </div>
            <div className="flex space-x-4">
              <Link to="/policies" className="font-medium transition-colors text-slate-400 hover:text-[#00D2FF]">Legal & Policies</Link>
            </div>
          </div>
        </div>

        {/* Back to Top Button */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="absolute right-6 -top-5 w-10 h-10 bg-[#0C101A] border border-white/10 text-slate-300 hover:text-[#00D2FF] hover:border-cyan-500/40 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 group hover:shadow-[0_0_15px_rgba(0,210,255,0.3)]"
          aria-label="Back to top"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
    </footer>
  );
}
