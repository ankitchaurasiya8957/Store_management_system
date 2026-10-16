import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobilePartnersOpen, setIsMobilePartnersOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    {
      name: 'Partners',
      path: '/partners',
      subLinks: [
        {
          name: 'OEM Partner',
          path: '/partner/oem',
          desc: 'Direct manufacturing alliances',
          icon: <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        },
        {
          name: 'Channel Partner',
          path: '/partner/channel',
          desc: 'B2B distribution networks',
          icon: <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        },
        {
          name: 'Franchise Partner',
          path: '/partner/franchise',
          desc: 'Retail storefront opportunities',
          icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        },
      ]
    },
    { name: 'Investors', path: '/investors' },
    { name: 'Contact Us', path: '/contact' },
  ];



  return (
    <header className="sticky top-0 z-50 bg-[#07090e]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.6)] px-4 lg:px-10 py-3 w-full overflow-x-clip">
      <div className="flex justify-between items-center w-full relative">

        {/* 1. Logo Section */}
        <div className="flex-shrink-0 z-20">
          <a href="/" className="flex items-center gap-2 lg:gap-3">
            <img src={logo} alt="AK Solutions Retail" className="h-10 lg:h-14 xl:h-16 w-auto object-contain drop-shadow-[0_2px_12px_rgba(0,210,255,0.3)]" />
            <span className="font-extrabold text-lg lg:text-xl xl:text-[23px] tracking-wide whitespace-nowrap bg-gradient-to-r from-[#00D2FF] via-[#c084fc] to-[#FF007A] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(0,210,255,0.25)]">
              AK Solutions Retail
            </span>
          </a>
        </div>

        {/* 2. Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-4 lg:gap-5 xl:gap-8 ml-6 lg:ml-8 xl:ml-20">
          {navLinks.map((link) => (
            link.subLinks ? (
              // === DROPDOWN PARENT ===
              <div key={link.name} className="relative group">
                <Link
                  to={link.path}
                  className="relative flex items-center gap-1 font-medium text-[14px] lg:text-[15px] xl:text-[16px] py-4 text-slate-200 hover:text-[#00D2FF] transition-colors duration-300 whitespace-nowrap"
                >
                  {link.name}
                  {/* Chevron Icon that rotates on hover */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transform group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                  <span className="absolute left-0 bottom-3 w-0 h-[2px] bg-gradient-to-r from-[#00D2FF] to-[#FF007A] transition-all duration-300 group-hover:w-full"></span>
                </Link>

                {/* === DROPDOWN MENU === */}
                <div className="absolute top-full left-0 w-[300px] pt-1 opacity-0 invisible translate-y-4 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-300 ease-out z-50">
                  <div className="bg-[#0C101A]/95 border border-white/10 rounded-2xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,210,255,0.08)] backdrop-blur-2xl relative">

                    {/* Top small arrow pointer */}
                    <div className="absolute -top-1.5 left-8 w-3 h-3 bg-[#0C101A] border-t border-l border-white/10 rotate-45"></div>

                    <div className="flex flex-col gap-1 relative z-10">
                      {link.subLinks.map((sub, idx) => (
                        <Link
                          key={idx}
                          to={sub.path}
                          className="group/item flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.05] transition-colors duration-300"
                        >
                          {/* Icon Container */}
                          <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-gradient-to-br from-cyan-500/10 to-purple-500/10 flex items-center justify-center text-[#00D2FF] border border-cyan-500/20 group-hover/item:border-cyan-500/40 group-hover/item:shadow-[0_0_15px_rgba(0,210,255,0.2)] transition-all duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              {sub.icon}
                              {/* If channel partner, draw second shape for Users icon */}
                              {sub.name === 'Channel Partner' && <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a3 3 0 11-6 0 3 3 0 016 0z" />}
                            </svg>
                          </div>

                          {/* Text Container */}
                          <div>
                            <h4 className="text-[14.5px] font-bold text-white group-hover/item:text-[#00D2FF] transition-colors duration-300 mb-0.5">
                              {sub.name}
                            </h4>
                            <p className="text-[12px] text-slate-400 font-medium">
                              {sub.desc}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // === NORMAL LINKS ===
              <Link
                key={link.name}
                to={link.path}
                className="relative font-medium text-[14px] lg:text-[15px] xl:text-[16px] py-4 text-slate-200 hover:text-[#00D2FF] transition-colors duration-300 group whitespace-nowrap"
              >
                {link.name}
                <span className="absolute left-0 bottom-3 w-0 h-[2px] bg-gradient-to-r from-[#00D2FF] to-[#FF007A] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            )
          ))}
        </nav>

        {/* 3. Action Section */}
        <div className="flex items-center gap-3 lg:gap-6 z-20">

          <div className="relative flex items-center justify-end h-10 w-auto">

            {/* === DEFAULT ACTIONS === */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 xl:gap-6 transition-all duration-400 ease-in-out">

              {/* Mobile Phone Icon (visible only when full number is hidden) */}
              <a
                href="tel:+919711888951"
                className="lg:hidden p-1.5 sm:p-2 rounded-full hover:bg-white/5 text-slate-200 hover:text-[#00D2FF] transition-colors duration-300"
                title="Call AK Solutions"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </a>

              {/* Mobile Login Button */}
              <Link
                to="/login"
                className="lg:hidden bg-gradient-to-r from-[#00D2FF] to-[#FF007A] text-white px-3 sm:px-4 py-1.5 rounded-lg text-[13px] font-bold shadow-md shadow-cyan-500/20 whitespace-nowrap"
              >
                Login
              </Link>

              {/* Contact & Login Section */}
              <div className="hidden lg:flex flex-col -mt-8 items-end gap-0.5">
                <div className="flex items-center gap-1 font-semibold text-[13px] xl:text-[14px] whitespace-nowrap text-slate-300">
                  <span className="text-base xl:text-lg">📞</span>
                  <a href="tel:+919711888951" className="hover:text-[#00D2FF] transition-colors">+91 9711888951</a>
                </div>

                <Link
                  to="/login"
                  className="bg-gradient-to-r from-[#00D2FF] via-[#7928CA] to-[#FF007A] text-white px-5 lg:px-7 py-2 rounded-xl font-bold text-[13px] lg:text-[14px] transition-all duration-300 active:scale-95 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-[1.03] whitespace-nowrap"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Hamburger Menu Icon */}
          <button
            className="lg:hidden p-1 ml-1 text-slate-200 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
            </svg>
          </button>
        </div>
      </div>

      {/* === MOBILE MENU DROPDOWN === */}
      <div className={`lg:hidden transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[500px] mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
        <nav className="flex flex-col gap-3 bg-[#0C101A] border border-white/10 rounded-2xl p-4 shadow-2xl">
          {navLinks.map((link) => (
            link.subLinks ? (
              <div key={link.name} className="flex flex-col border-b border-white/10 pb-2">
                <div
                  className="flex items-center justify-between font-medium text-[16px] text-slate-200 hover:text-[#00D2FF] cursor-pointer"
                  onClick={() => setIsMobilePartnersOpen(!isMobilePartnersOpen)}
                >
                  {link.name}
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transform transition-transform duration-300 ${isMobilePartnersOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Mobile Sub-links (Accordion style) */}
                <div className={`flex flex-col gap-2 pl-4 overflow-hidden transition-all duration-300 ${isMobilePartnersOpen ? 'max-h-40 mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
                  {link.subLinks.map((sub, idx) => (
                    <Link
                      key={idx}
                      to={sub.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-[14.5px] font-medium text-slate-400 hover:text-[#00D2FF] flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00D2FF]"></span>
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-medium text-[16px] text-slate-200 hover:text-[#00D2FF] border-b border-white/10 pb-2"
              >
                {link.name}
              </Link>
            )
          ))}

          <div className="flex flex-col gap-3 mt-3">
            <a href="tel:+919711888951" className="font-semibold text-sm text-slate-300 hover:text-[#00D2FF] transition-colors">📞 +91 9711888951</a>
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="bg-gradient-to-r from-[#00D2FF] via-[#7928CA] to-[#FF007A] text-white px-4 py-2.5 rounded-xl font-bold text-center w-full lg:hidden shadow-lg shadow-cyan-500/20"
            >
              Login
            </Link>
          </div>
        </nav>
      </div>

    </header>
  );
}
