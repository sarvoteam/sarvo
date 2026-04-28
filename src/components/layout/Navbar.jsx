import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../assets/SarvoLogo.png';
import TransparentLogo from '../common/TransparentLogo';



const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Services', href: '#services' },
    { name: 'About', href: '#about' },
    { name: 'Stats', href: '#stats' },
    { name: 'Team', href: '#team' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-4 glass m-4 mt-6' : 'py-8'}`}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: "50px" }}>
        <a href="#" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.8rem', fontWeight: 800 }}>
          <TransparentLogo src={logo} alt="SARVO" style={{ height: '45px', width: 'auto' }} />
          <span className="gradient-text">SARVO</span>
        </a>


        {/* Desktop Menu */}
        <ul className="desktop-menu" style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
          {navLinks.map((link) => (
            <li key={link.name}>
              <a href={link.href} className="nav-link" style={{ fontWeight: 600, opacity: 0.8, fontSize: '0.95rem' }}>
                {link.name}
              </a>
            </li>
          ))}
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: '1rem' }}>
            <button 
              onClick={toggleTheme}
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '0.6rem', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="btn-primary" style={{ padding: '0.7rem 1.8rem', borderRadius: '14px' }}>Get Started</button>
          </div>
        </ul>




        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          style={{ display: 'none', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <style jsx>{`
        .nav-link:hover {
          opacity: 1 !important;
          color: var(--accent-secondary);
        }
        
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
