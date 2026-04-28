import React from 'react';
import { FaGithub, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import logo from '../../assets/SarvoLogo.png';
import TransparentLogo from '../common/TransparentLogo';

const Footer = () => {
  return (
    <footer style={{ padding: '5rem 0 2rem', borderTop: '1px solid var(--glass-border)' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
          <div style={{ gridColumn: 'span 2' }}>
            <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              <TransparentLogo src={logo} alt="SARVO" style={{ height: '35px', width: 'auto' }} />
              <span className="gradient-text">SARVO</span>
            </a>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '300px', marginBottom: '2rem' }}>
              Crafting high-end digital solutions for the next generation of businesses.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a href="#" className="social-link"><FaTwitter size={20} /></a>
              <a href="https://www.linkedin.com/in/sarvo-team-490718405/" className="social-link"><FaLinkedin size={20} /></a>
              <a href="#" className="social-link"><FaGithub size={20} /></a>
              <a href="https://www.instagram.com/sarvo.in?igsh=MWRneXJvZWY3ZWNkNg==" className="social-link"><FaInstagram size={20} /></a>
            </div>
          </div>

          <div>
            <h4 style={{ marginBottom: '1.5rem' }}>Company</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Services</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ marginBottom: '1.5rem' }}>Support</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div style={{ pt: '2rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <p>© {new Date().getFullYear()} SARVO Digital. All rights reserved.</p>
        </div>
      </div>

      <style jsx>{`
        .social-link {
          color: var(--text-secondary);
          transition: var(--transition-smooth);
        }
        .social-link:hover {
          color: var(--accent-primary);
          transform: translateY(-3px);
        }
        li a:hover {
          color: white;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
