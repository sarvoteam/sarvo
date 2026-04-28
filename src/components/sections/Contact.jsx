import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  return (
    <section id="contact" style={{ padding: '8rem 0', background: 'rgba(255,255,255,0.01)' }}>
      <div className="container">
        <h2 className="section-title">Get In <span className="gradient-text">Touch</span></h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem' }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Ready to start your project?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>
              We're here to help you bring your vision to life. Contact us for a free consultation.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div className="glass" style={{ padding: '1rem', color: 'var(--accent-primary)' }}>
                  <Mail />
                </div>
                <div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Email Us</p>
                  <p style={{ fontWeight: 600 }}>hello@sarvo.com</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div className="glass" style={{ padding: '1rem', color: 'var(--accent-primary)' }}>
                  <Phone />
                </div>
                <div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Call Us</p>
                  <p style={{ fontWeight: 600 }}>+1 (555) 000-0000</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div className="glass" style={{ padding: '1rem', color: 'var(--accent-primary)' }}>
                  <MapPin />
                </div>
                <div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Our Office</p>
                  <p style={{ fontWeight: 600 }}>123 Innovation Drive, Tech City</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="glass"
            style={{ padding: '3rem' }}
          >
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="form-row" style={{ display: 'flex', gap: '1.5rem' }}>
                <input type="text" placeholder="First Name" style={inputStyle} />
                <input type="text" placeholder="Last Name" style={inputStyle} />
              </div>
              <input type="email" placeholder="Email Address" style={inputStyle} />
              <select style={inputStyle}>
                <option value="">Interested in...</option>
                <option value="web">Web Development</option>
                <option value="design">UI/UX Design</option>
                <option value="strategy">Digital Strategy</option>
              </select>
              <textarea placeholder="Tell us about your project" rows="5" style={inputStyle}></textarea>
              <button className="btn-primary" style={{ padding: '1.2rem 3rem', borderRadius: '16px', fontSize: '1.1rem' }}>
                Send Inquiry <Send size={20} />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          .form-row { flex-direction: column; }
        }
      `}</style>

    </section>
  );
};

const inputStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid var(--glass-border)',
  borderRadius: '12px',
  padding: '1rem',
  color: 'white',
  width: '100%',
  outline: 'none',
  fontSize: '1rem',
  transition: 'var(--transition-smooth)'
};

export default Contact;
