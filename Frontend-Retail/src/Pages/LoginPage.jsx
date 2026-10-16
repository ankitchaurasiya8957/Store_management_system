import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './LoginPage.css';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo.png';
import { fetchWithAuth } from '../utils/api.js';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // ===== MOUSE-TRACKING 3D TILT =====
  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(60px) scale(1)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(60px) scale(1)';
  }, []);

  // ===== BUTTON RIPPLE =====
  const handleRipple = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'login-ripple';
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (!userId.trim() || !password.trim()) return;
  //   setIsSubmitting(true);
  //   setTimeout(() => {
  //     setIsSubmitting(false);
  //     alert('Login submitted successfully!');
  //     navigate('/');
  //   }, 1500);
  // };

  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim()) return;

    setIsSubmitting(true);

    try {
      // Connect to your Node.js backend
      const response = await fetchWithAuth(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, password }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!response.ok || !contentType.includes("application/json")) {
        const text = await response.text();
        alert(`Login API returned ${response.status}: ${text.slice(0, 200)}`);
        setIsSubmitting(false);
        return;
      }

      const data = await response.json();

      if (response.ok) {
        // Save user data to context
        login(data.user, data.token);

        // If user attempted to open a specific panel in a new tab, redirect back there
        const fromPath = location.state?.from?.pathname;
        if (fromPath && fromPath !== '/login') {
          navigate(fromPath);
          return;
        }

        // Route dynamically based on the role
        switch (data.user.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'account_manager':
            navigate('/admin/orders');
            break;
          case 'inventory_manager':
            navigate('/admin/catalog');
            break;
          case 'finance_manager':
            navigate('/admin/finance');
            break;
          case 'warehouse_manager':
            navigate('/warehouse');
            break;
          case 'franchise':
            navigate('/franchise');
            break;
          case 'employee':
            navigate('/employee');
            break;
          case 'channel':
            navigate('/channel');
            break;
          default:
            alert('Unknown user role.');
            navigate('/');
        }
      } else {
        alert(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Unable to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      {/* ===== ANIMATED BACKGROUND ===== */}
      <div className="login-bg">
        <div className="login-bg-blob" />
        <div className="login-bg-blob" />
        <div className="login-bg-blob" />
        <div className="login-bg-grid" />
      </div>

      {/* Floating page particles */}
      <div className="login-page-particles">
        <div className="login-page-particle" />
        <div className="login-page-particle" />
        <div className="login-page-particle" />
        <div className="login-page-particle" />
        <div className="login-page-particle" />
        <div className="login-page-particle" />
      </div>

      {/* ===== CARD ===== */}
      <div className="login-scene">
        <div
          className="login-card"
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* ===== HEADER BAND ===== */}
          <div className="login-header-band">
            {/* Floating orbs */}
            <div className="login-orbs">
              <div className="login-orb" />
              <div className="login-orb" />
              <div className="login-orb" />
            </div>

            {/* Back button */}
            <Link to="/" className="login-back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back
            </Link>

            {/* Logo & Brand */}
            <div className="login-logo-wrap">
              <div className="login-logo-container">
                <img src={logo} alt="AK Solutions Retail" />
              </div>
              <h2 className="login-brand-name">AK Solutions Retail</h2>
              <p className="login-brand-tagline">Login Portal</p>
            </div>
          </div>

          {/* ===== FORM BODY ===== */}
          <div className="login-form-body">
            {/* Divider */}
            <div className="login-divider login-stagger-1">
              <span />
              <p>Sign In to Your Account</p>
              <span />
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              {/* User ID */}
              <div className="login-input-group login-stagger-2">
                <label htmlFor="login-userid">
                  <span className="login-label-dot" />
                  User ID
                </label>
                <div className="login-input-wrap">
                  <svg
                    className="login-input-icon"
                    width="20" height="20" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    id="login-userid"
                    type="text"
                    placeholder="Enter your User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    autoComplete="username"
                  />
                  <div className="login-input-glow" />
                </div>
              </div>

              {/* Password */}
              <div className="login-input-group login-stagger-3">
                <label htmlFor="login-password">
                  <span className="login-label-dot" />
                  Password
                </label>
                <div className="login-input-wrap">
                  <svg
                    className="login-input-icon"
                    width="20" height="20" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="login-pw-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                  <div className="login-input-glow" />
                </div>
              </div>

              {/* Submit */}
              <div className="login-submit-wrap login-stagger-4">
                <button
                  type="submit"
                  className="login-submit"
                  disabled={isSubmitting}
                  onClick={handleRipple}
                >
                  {isSubmitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                      Signing In...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="login-footer login-stagger-5">
            <p>
              Need access? <Link to="/contact">Contact Admin</Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
