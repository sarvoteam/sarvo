import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import { FaGithub, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import logo from '../../assets/SarvoLogo.png';
import TransparentLogo from '../common/TransparentLogo';

const Footer = () => {
  const companyLinks = [
    { name: 'About Us',  to: '/about' },
    { name: 'Services',  to: '/services' },
    { name: 'Our Team',  to: '/team' },
    { name: 'Contact',   to: '/contact' },
  ];

  const supportLinks = [
    { name: 'Pricing',         to: '/pricing' },
    { name: 'Privacy Policy',  to: '#' },
    { name: 'Terms of Service',to: '#' },
  ];

  const linkStyle = {
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'var(--transition-smooth)',
    fontSize: '0.95rem'
  };

  return (
    <footer style={{ padding: '5rem 0 2rem', borderTop: '1px solid var(--glass-border)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>

          {/* Brand */}
          <div style={{ gridColumn: 'span 2' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.5rem', fontWeight: 900, marginBottom: '1.5rem', textDecoration: 'none' }}>
              <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Rocket size={20} />
              </div>
              <span className="gradient-text">SARVO</span>
            </Link>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '300px', lineHeight: 1.7, marginBottom: '2rem', fontSize: '0.95rem' }}>
              Crafting high-end digital solutions for the next generation of businesses.
            </p>
            <div style={{ display: 'flex', gap: '1.2rem' }}>
              {[
                { icon: <FaTwitter size={18} />,  href: '#' },
                { icon: <FaLinkedin size={18} />, href: '#' },
                { icon: <FaGithub size={18} />,   href: '#' },
                { icon: <FaInstagram size={18} />, href: '#' },
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
          <div>
            <h4 style={{ marginBottom: '1.5rem', fontWeight: 800, fontSize: '1rem' }}>Company</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none', padding: 0, margin: 0 }}>
              {companyLinks.map(l => (
                <li key={l.name}>
                  <Link to={l.to} style={linkStyle}
                    onMouseOver={e => e.currentTarget.style.color = 'white'}
                    onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ marginBottom: '1.5rem', fontWeight: 800, fontSize: '1rem' }}>Support</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none', padding: 0, margin: 0 }}>
              {supportLinks.map(l => (
                <li key={l.name}>
                  <Link to={l.to} style={linkStyle}
                    onMouseOver={e => e.currentTarget.style.color = 'white'}
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
          <p>© {new Date().getFullYear()} SARVO Tech. All rights reserved. Built with 💜 for the next generation.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
