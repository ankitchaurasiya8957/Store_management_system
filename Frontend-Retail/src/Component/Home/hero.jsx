import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import HeroSec from '../../assets/Hero.mp4';
import RetailStore from '../../assets/retail-store.jpg';
import Hero4 from '../../assets/hero4.png';

export default function Hero() {
  const heroRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { type: 'video', src: HeroSec, overlayClass: 'bg-[#07162c]/50' },
    { type: 'image', src: RetailStore, overlayClass: 'bg-[#07162c]/50 backdrop-blur-xs' },
    { type: 'image', src: Hero4, overlayClass: 'bg-black/40 backdrop-blur-[1px]' }
  ];

  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleScrollDown = () => {
    if (heroRef.current) {
      window.scrollTo({
        top: heroRef.current.clientHeight,
        behavior: 'smooth'
      });
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section 
      ref={heroRef}
      className="relative w-full h-[100svh] lg:h-[80vh] min-h-[550px] flex items-center justify-center overflow-hidden"
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100 z-0' : 'opacity-0 -z-10'
          }`}
        >
          {slide.type === 'video' ? (
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src={slide.src}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
            />
          ) : (
            <img
              className="absolute inset-0 w-full h-full object-cover"
              src={slide.src}
              alt="Hero Slide"
            />
          )}
        </div>
      ))}

      {/* Manual Sliding Controls */}
      <button 
        onClick={prevSlide}
        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-2 text-white/50 hover:text-white transition-colors duration-300"
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button 
        onClick={nextSlide}
        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-2 text-white/50 hover:text-white transition-colors duration-300"
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-12 sm:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* ================= DARK OVERLAY ================= */}
    
      <div className={`absolute inset-0 z-0 transition-all duration-1000 ${slides[currentSlide].overlayClass}`}></div>

      {/* ================= CENTERED CONTENT ================= */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-5xl mx-auto w-full mt-[-2rem] sm:mt-[-3rem]">
        
        {/* 1. Top Subheading (Uppercase, Spaced out) */}
        <p className="text-white/90 tracking-[0.2em] md:tracking-[0.3em] font-semibold text-xs sm:text-sm md:text-base uppercase mb-3 md:mb-6" data-aos="fade-up">
          Trusted by Businesses Across India
        </p>

        {/* 2. Massive Main Heading */}
        <h1 className="text-white text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] xl:text-[7rem] font-extrabold tracking-tight mb-2 md:mb-4 leading-none drop-shadow-lg" data-aos="fade-up" data-aos-delay="100">
          Your Growth
        </h1>

        <p className="text-white text-xl sm:text-2xl md:text-4xl lg:text-[2rem] xl:text-[2.5rem] font-light mb-8 md:mb-12 drop-shadow-md" data-aos="fade-up" data-aos-delay="200">
          powered by our <span className="bg-gradient-to-r from-[#00D2FF] via-[#c084fc] to-[#FF007A] bg-clip-text text-transparent font-bold">IT Hardware</span> ecosystem
        </p>

        {/* 4. Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-5" data-aos="fade-up" data-aos-delay="300">
          
          {/* Primary CTA (AK Signature Gradient with Glow) */}
          <Link 
            to="/partnerpage"
            className="group bg-gradient-to-r from-[#00D2FF] via-[#7928CA] to-[#FF007A] text-white px-8 py-3.5 rounded-xl text-[13px] md:text-[14px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_10px_30px_rgba(0,210,255,0.3)] hover:shadow-[0_15px_40px_rgba(0,210,255,0.5)] hover:-translate-y-0.5 active:translate-y-0.5"
          >
           Become a Partner
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>

          {/* Secondary CTA (Glass Dark Outline with Cyan hover) */}
          <Link 
            to="/partnerpage?franchise"
            className="group bg-black/30 backdrop-blur-md border-2 border-white/40 hover:border-[#00D2FF] hover:bg-[#00D2FF]/10 hover:text-[#00D2FF] text-white px-8 py-3.5 rounded-xl text-[13px] md:text-[14px] font-bold uppercase tracking-wider flex items-center justify-center transition-all duration-300 shadow-lg"
          >
            Apply for Franchise
          </Link>

        </div>
      </div>

      {/* ================= SCROLL DOWN INDICATOR ================= */}
      <div 
        onClick={handleScrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-70 hover:opacity-100 hover:text-[#00D2FF] cursor-pointer transition-all duration-300" 
        data-aos="fade-in" 
        data-aos-delay="500"
      >
        <span className="text-white text-[11px] font-bold tracking-[0.2em] mb-2 uppercase">
          Scroll Down
        </span>
        <div className="w-8 h-8 rounded-full border border-white/40 hover:border-[#00D2FF] flex items-center justify-center transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white hover:text-[#00D2FF] animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

    </section>
  );
}
