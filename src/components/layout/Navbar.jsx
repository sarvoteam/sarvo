import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Rocket, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../assets/SarvoLogo.png';
import TransparentLogo from '../common/TransparentLogo';



const navLinks = [
  { name: 'Home',     path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'About',    path: '/about' },
  { name: 'Team',     path: '/team' },
  { name: 'Pricing',  path: '/pricing' },
  { name: 'Contact',  path: '/contact' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.8rem', fontWeight: 900, letterSpacing: '-0.03em', textDecoration: 'none' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(79, 70, 229, 0.3)' }}>
            <Rocket size={22} />
          </div>
          <span className="gradient-text">SARVO</span>
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
          </div>
        </ul>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          style={{ display: 'none', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.6rem', borderRadius: '12px' }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0, right: 0,
              background: 'var(--bg-card)',
              border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(20px)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              zIndex: 999
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
          .mobile-toggle { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
