import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import logo from '../../assets/SarvoLogo.png';
import TransparentLogo from '../common/TransparentLogo';
import sarvoLogo from '../../assets/sarvo.jpg';

const Footer = () => {
  const companyLinks = [
    { name: 'About Us',  to: '/about' },
    { name: 'Services',  to: '/services' },
    { name: 'Our Team',  to: '/team' },
    { name: 'Careers',   to: '/sarvo-careers' },
    { name: 'Contact',   to: '/contact' },
  ];

  const supportLinks = [
    { name: 'Product', to: '/product' },
    { name: 'Privacy Policy', to: '/privacy' },
    { name: 'Terms of Service', to: '/terms' },
  ];

  const linkStyle = {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'var(--transition-smooth)',
    fontSize: '0.95rem'
  };

  return (
    <footer style={{ background: 'var(--footer-bg)', position: 'relative', padding: 'clamp(3rem, 8vh, 5rem) 0 2rem', borderTop: '1px solid var(--glass-border)' }}>
      <div className="container">
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>

          {/* Brand */}
          <div className="footer-brand" style={{ gridColumn: 'span 2' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.5rem', fontWeight: 900, marginBottom: '1.5rem', textDecoration: 'none' }}>
              <img 
                src={sarvoLogo} 
                alt="Sarvo Logo" 
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }} 
              />
              <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '3px' }}>
                <span style={{
                  fontWeight: 900,
                  letterSpacing: '0.06em',
                  color: '#1d4ed8'
                }}>SARVO</span>
                <span className="gradient-text">ᵖʳⁱᵐᵉ</span>
              </span>
            </Link>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '300px', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.95rem' }}>
              Crafting high-end digital solutions for the next generation of businesses.
            </p>
            <div style={{ display: 'flex', gap: '1.2rem' }}>
              {[
                { icon: <FaTwitter size={18} />, href: '#' },
                { icon: <FaLinkedin size={18} />, href: 'https://www.linkedin.com/company/sarvoprime/' },
                { icon: <FaGithub size={18} />, href: 'https://github.com/sarvoteam' },
                { icon: <FaInstagram size={18} />, href: 'https://www.instagram.com/sarvo_prime' },
              ].map((s, i) => (
                <a key={i} href={s.href}
                  style={{ color: 'var(--text-secondary)', transition: 'var(--transition-smooth)', display: 'flex' }}
                  onMouseOver={e => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseOut={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.transform = 'none'; }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div className="footer-links">
            <h4 style={{ marginBottom: '1.5rem', fontWeight: 800, fontSize: '1rem' }}>Company</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none', padding: 0, margin: 0 }}>
              {companyLinks.map(l => (
                <li key={l.name}>
                  <Link to={l.to} style={linkStyle}
                    onMouseOver={e => e.currentTarget.style.color = 'var(--accent-primary)'}
                    onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="footer-links">
            <h4 style={{ marginBottom: '1.5rem', fontWeight: 800, fontSize: '1rem' }}>Support</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none', padding: 0, margin: 0 }}>
              {supportLinks.map(l => (
                <li key={l.name}>
                  <Link to={l.to} style={linkStyle}
                    onMouseOver={e => e.currentTarget.style.color = 'var(--accent-primary)'}
                    onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <p>© {new Date().getFullYear()} SARVO ᵖʳⁱᵐᵉ. All rights reserved.</p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
            text-align: center;
          }
          .footer-brand {
            grid-column: span 1 !important;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .footer-brand p {
            max-width: 100% !important;
          }
          .footer-links ul {
            align-items: center;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
