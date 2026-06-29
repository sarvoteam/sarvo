import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Rocket, Sun, Moon, Users, Briefcase, ChevronRight, MoreVertical, Trophy } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../assets/SarvoLogo.png';
import TransparentLogo from '../common/TransparentLogo';
import sarvoLogo from '../../assets/sarvo.jpg';



const navLinks = [
  { name: 'Home',     path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'About',    path: '/about' },
  { name: 'Team',     path: '/team' },
  { name: 'Contact',  path: '/contact' },
  { name: 'Product',  path: '/product' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const moreMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMoreMenuOpen(false);
  }, [location]);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: 'clamp(1.4rem, 4vw, 1.8rem)', fontWeight: 900, letterSpacing: '-0.03em', textDecoration: 'none' }}>
          <div style={{ 
            width: 'clamp(32px, 8vw, 40px)', 
            height: 'clamp(32px, 8vw, 40px)', 
            borderRadius: '50%', 
            overflow: 'hidden', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            boxShadow: '0 8px 16px rgba(79, 70, 229, 0.3)' 
          }}>
            <img 
              src={sarvoLogo} 
              alt="Sarvo Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '3px' }}>
            <span style={{
              fontWeight: 900,
              letterSpacing: '0.06em',
              color: '#1d4ed8'
            }}>SARVO</span>
            <span className="gradient-text">ᵖʳⁱᵐᵉ</span>
          </span>
        </Link>


        {/* Desktop Menu */}
        <ul className="desktop-menu" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: isScrolled ? 'transparent' : 'rgba(255,255,255,0.03)', padding: isScrolled ? '0' : '0.5rem 1rem', borderRadius: '100px', border: isScrolled ? 'none' : '1px solid var(--glass-border)', backdropFilter: 'blur(10px)', listStyle: 'none', margin: 0 }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.name}>
                <Link
                  to={link.path}
                  style={{
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                    opacity: isActive ? 1 : 0.7,
                    background: isActive ? 'rgba(79,70,229,0.08)' : 'transparent',
                    transition: 'var(--transition-smooth)',
                    display: 'block'
                  }}
                  onMouseOver={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseOut={e => { if (!isActive) { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.background = 'transparent'; } }}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}

          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginLeft: '0.5rem' }}>
            <button
              onClick={toggleTheme}
              style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', opacity: 0.7, transition: 'var(--transition-smooth)', padding: '0.4rem' }}
              onMouseOver={e => { e.currentTarget.style.opacity = 1; }}
              onMouseOut={e => { e.currentTarget.style.opacity = '0.7'; }}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/contact">
              <button className="btn-primary" style={{ padding: '0.6rem 1.5rem', borderRadius: '12px', fontSize: '0.85rem' }}>
                Get Started
              </button>
            </Link>

            {/* Three-line More Menu */}
            <div ref={moreMenuRef} style={{ position: 'relative' }}>
              <button
                id="more-menu-toggle"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                style={{
                  background: isMoreMenuOpen ? 'rgba(79,70,229,0.12)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isMoreMenuOpen ? 'rgba(79,70,229,0.3)' : 'var(--glass-border)'}`,
                  color: isMoreMenuOpen ? 'var(--accent-primary)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  width: '36px',
                  height: '36px'
                }}
                onMouseOver={e => {
                  if (!isMoreMenuOpen) {
                    e.currentTarget.style.background = 'rgba(79,70,229,0.08)';
                    e.currentTarget.style.borderColor = 'rgba(79,70,229,0.2)';
                    e.currentTarget.style.color = 'var(--accent-primary)';
                  }
                }}
                onMouseOut={e => {
                  if (!isMoreMenuOpen) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
              >
                <Menu size={18} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isMoreMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      right: 0,
                      minWidth: '220px',
                      background: 'var(--bg-card, #1a1a2e)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '16px',
                      padding: '0.5rem',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)',
                      backdropFilter: 'blur(20px)',
                      zIndex: 1000,
                      overflow: 'hidden'
                    }}
                  >
                    {/* Dropdown Header */}
                    <div style={{
                      padding: '0.6rem 0.8rem 0.4rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--text-secondary, #8b8fa3)',
                      opacity: 0.6
                    }}>
                      Applications
                    </div>

                    {/* Sarvo People Option */}
                    <Link
                      to="/sarvo-people"
                      id="sarvo-people-link"
                      style={{ textDecoration: 'none' }}
                      onClick={() => setIsMoreMenuOpen(false)}
                    >
                      <motion.div
                        whileHover={{ x: 2 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.7rem 0.8rem',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          color: location.pathname === '/sarvo-people' ? 'var(--accent-primary)' : 'var(--text-primary)',
                          background: location.pathname === '/sarvo-people' ? 'rgba(79,70,229,0.1)' : 'transparent',
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.background = 'rgba(79,70,229,0.08)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.background = location.pathname === '/sarvo-people' ? 'rgba(79,70,229,0.1)' : 'transparent';
                        }}
                      >
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          flexShrink: 0,
                          boxShadow: '0 4px 12px rgba(79,70,229,0.3)'
                        }}>
                          <Users size={16} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', lineHeight: 1.2 }}>
                            Sarvo People
                          </div>
                          <div style={{ fontSize: '0.72rem', opacity: 0.5, marginTop: '2px' }}>
                            HR & Team Management
                          </div>
                        </div>
                        <ChevronRight size={14} style={{ opacity: 0.4 }} />
                      </motion.div>
                    </Link>

                    {/* Sarvo Careers Option */}
                    <Link
                      to="/sarvo-careers"
                      id="sarvo-careers-link"
                      style={{ textDecoration: 'none' }}
                      onClick={() => setIsMoreMenuOpen(false)}
                    >
                      <motion.div
                        whileHover={{ x: 2 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.7rem 0.8rem',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          color: location.pathname === '/sarvo-careers' ? 'var(--accent-primary)' : 'var(--text-primary)',
                          background: location.pathname === '/sarvo-careers' ? 'rgba(79,70,229,0.1)' : 'transparent',
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.background = 'rgba(79,70,229,0.08)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.background = location.pathname === '/sarvo-careers' ? 'rgba(79,70,229,0.1)' : 'transparent';
                        }}
                      >
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          flexShrink: 0,
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}>
                          <Briefcase size={16} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', lineHeight: 1.2 }}>
                            Sarvo Careers
                          </div>
                          <div style={{ fontSize: '0.72rem', opacity: 0.5, marginTop: '2px' }}>
                            Explore Career Opportunities
                          </div>
                        </div>
                        <ChevronRight size={14} style={{ opacity: 0.4 }} />
                      </motion.div>
                    </Link>

                    {/* Sarvo Competition Option */}
                    <Link
                      to="/sarvo-competitions"
                      id="sarvo-competitions-link"
                      style={{ textDecoration: 'none' }}
                      onClick={() => setIsMoreMenuOpen(false)}
                    >
                      <motion.div
                        whileHover={{ x: 2 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.7rem 0.8rem',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          color: location.pathname === '/sarvo-competitions' ? 'var(--accent-primary)' : 'var(--text-primary)',
                          background: location.pathname === '/sarvo-competitions' ? 'rgba(79,70,229,0.1)' : 'transparent',
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.background = 'rgba(79,70,229,0.08)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.background = location.pathname === '/sarvo-competitions' ? 'rgba(79,70,229,0.1)' : 'transparent';
                        }}
                      >
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          flexShrink: 0,
                          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                        }}>
                          <Trophy size={16} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', lineHeight: 1.2 }}>
                            Sarvo Competition
                          </div>
                          <div style={{ fontSize: '0.72rem', opacity: 0.5, marginTop: '2px' }}>
                            Participate & Win Prizes
                          </div>
                        </div>
                        <ChevronRight size={14} style={{ opacity: 0.4 }} />
                      </motion.div>
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </ul>

        {/* Mobile Toggle & Theme Button */}
        <div style={{ display: 'none', alignItems: 'center', gap: '1rem' }} className="mobile-actions">
           <button
              onClick={toggleTheme}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.6rem', borderRadius: '12px' }}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          <button
            className="mobile-toggle"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.6rem', borderRadius: '12px' }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0, right: 0,
              background: 'var(--bg-card)',
              borderBottom: '1px solid var(--glass-border)',
              backdropFilter: 'blur(20px)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              zIndex: 999,
              overflow: 'hidden'
            }}
          >
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  style={{
                    padding: '0.9rem 1.2rem',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '1rem',
                    textDecoration: 'none',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                    background: isActive ? 'rgba(79,70,229,0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(79,70,229,0.2)' : '1px solid transparent',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Sarvo People in mobile menu */}
            <Link
              to="/sarvo-people"
              style={{
                padding: '0.9rem 1.2rem',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'none',
                color: location.pathname === '/sarvo-people' ? 'var(--accent-primary)' : 'var(--text-primary)',
                background: location.pathname === '/sarvo-people' ? 'rgba(79,70,229,0.08)' : 'transparent',
                border: location.pathname === '/sarvo-people' ? '1px solid rgba(79,70,229,0.2)' : '1px solid transparent',
                transition: 'var(--transition-smooth)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}
            >
              <Users size={18} />
              Sarvo People
            </Link>

            {/* Sarvo Careers in mobile menu */}
            <Link
              to="/sarvo-careers"
              style={{
                padding: '0.9rem 1.2rem',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'none',
                color: location.pathname === '/sarvo-careers' ? 'var(--accent-primary)' : 'var(--text-primary)',
                background: location.pathname === '/sarvo-careers' ? 'rgba(79,70,229,0.08)' : 'transparent',
                border: location.pathname === '/sarvo-careers' ? '1px solid rgba(79,70,229,0.2)' : '1px solid transparent',
                transition: 'var(--transition-smooth)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}
            >
              <Briefcase size={18} />
              Sarvo Careers
            </Link>

            {/* Sarvo Competitions in mobile menu */}
            <Link
              to="/sarvo-competitions"
              style={{
                padding: '0.9rem 1.2rem',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'none',
                color: location.pathname === '/sarvo-competitions' ? 'var(--accent-primary)' : 'var(--text-primary)',
                background: location.pathname === '/sarvo-competitions' ? 'rgba(79,70,229,0.08)' : 'transparent',
                border: location.pathname === '/sarvo-competitions' ? '1px solid rgba(79,70,229,0.2)' : '1px solid transparent',
                transition: 'var(--transition-smooth)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem'
              }}
            >
              <Trophy size={18} />
              Sarvo Competitions
            </Link>

            <Link to="/contact" style={{ marginTop: '0.5rem' }}>
              <button className="btn-primary" style={{ width: '100%', padding: '1rem', borderRadius: '12px', fontSize: '1rem' }}>
                Get Started
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 992px) {
          .desktop-menu { display: none !important; }
          .mobile-actions { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
