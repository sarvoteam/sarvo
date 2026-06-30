import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import emailjs from '@emailjs/browser';

const ContactInfoCard = ({ icon: Icon, title, detail, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="contact-info-card glass"
  >
    <div className="icon-wrapper">
      <Icon size={24} />
    </div>
    <div className="info-content">
      <h4>{title}</h4>
      {Array.isArray(detail) ? (
        detail.map((item, idx) => (
          <p key={idx} style={{ margin: 0, lineHeight: 1.5 }}>{item}</p>
        ))
      ) : (
        <p style={{ whiteSpace: 'pre-line' }}>{detail}</p>
      )}
    </div>
  </motion.div>
);

const Contact = () => {
  const form = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  const sendEmail = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const timeInput = document.createElement('input');
    timeInput.type = 'hidden';
    timeInput.name = 'time';
    timeInput.value = new Date().toLocaleString();
    form.current.appendChild(timeInput);

    emailjs.sendForm(
      import.meta.env.VITE_EMAILJS_SERVICE_ID || 'dummy',
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'dummy',
      form.current,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'dummy'
    )
      .then((result) => {
        setStatus('success');
        form.current.reset();
      }, (error) => {
        setStatus('error');
      })
      .finally(() => {
        setIsSubmitting(false);
        form.current.removeChild(timeInput);
        setTimeout(() => setStatus(null), 5000);
      });
  };

  const inputStyle = (fieldName) => ({
    background: focusedField === fieldName ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
    border: `1px solid ${focusedField === fieldName ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
    borderRadius: '16px',
    padding: '0.75rem 1rem',
    color: 'var(--text-primary)',
    width: '100%',
    outline: 'none',
    fontSize: '1rem',
    transition: 'var(--transition-smooth)',
    boxShadow: focusedField === fieldName ? '0 0 0 4px rgba(79, 70, 229, 0.15)' : 'none'
  });

  return (
    <section id="contact" className="contact-section">
      <div className="blob contact-blob-1"></div>
      <div className="blob contact-blob-2"></div>
      
      <div className="container">
        <div className="contact-grid">
          <motion.div 
            className="contact-details"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="contact-header-left">
              <div className="badge">
                <MessageSquare size={16} />
                <span>Contact Us</span>
              </div>
              <h2 className="section-title">
                Let's Build Something <span className="gradient-text">Extraordinary</span>
              </h2>
              <p className="section-subtitle">
                Partner with us to transform your vision into reality. Our team is here to provide tailored solutions and expert guidance for your unique needs.
              </p>
            </div>
            
            <div className="contact-info-section">
              <h3 className="details-heading">Contact Information</h3>
              <p className="details-sub">Reach out to us directly through any of these channels.</p>
              
              <div className="info-cards-container">
                <ContactInfoCard 
                  icon={Mail} 
                  title="Official Email" 
                  detail={["sarvoprime@gmail.com", "sarvoteam@gmail.com"]} 
                  delay={0.3}
                />
               
                <ContactInfoCard 
                  icon={MapPin} 
                  title="Location" 
                  detail="Pune, Maharashtra, India" 
                  delay={0.4}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="contact-form-wrapper glass premium-glass"
          >
            <div className="form-header-inner">
              <h3 className="form-heading">Send us a message</h3>
              <p className="form-sub">Fill out the form and our team will get back to you within 24 hours.</p>
            </div>

            <form ref={form} onSubmit={sendEmail} className="contact-form">
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="John Doe" 
                  required 
                  style={inputStyle('name')}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
              
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  placeholder="john@company.com" 
                  required 
                  style={inputStyle('email')}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
              
              <div className="form-group">
                <label>Subject</label>
                <input 
                  type="text" 
                  name="title" 
                  placeholder="How can we help?" 
                  required 
                  style={inputStyle('title')}
                  onFocus={() => setFocusedField('title')}
                  onBlur={() => setFocusedField(null)}
                />
              </div>
              
              <div className="form-group">
                <label>Message</label>
                <textarea 
                  name="message" 
                  placeholder="Tell us a little about your project..." 
                  rows="3" 
                  required 
                  style={{...inputStyle('message'), resize: 'vertical'}}
                  onFocus={() => setFocusedField('message')}
                  onBlur={() => setFocusedField(null)}
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn-primary submit-btn" 
              >
                <span className="btn-text">{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
                {isSubmitting ? (
                  <div className="spinner"></div>
                ) : (
                  <Send size={18} className="send-icon" />
                )}
              </button>
            </form>

            <AnimatePresence>
              {status && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: '1.5rem' }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className={`status-message ${status}`}
                >
                  {status === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  <p>{status === 'success' ? 'Message sent successfully! We will be in touch soon.' : 'Something went wrong. Please try again.'}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
      <style>{`
        .contact-section {
          padding: 8rem 0;
          position: relative;
          overflow: hidden;
        }
        
        .contact-blob-1 {
          top: 10%;
          right: -10%;
          background: radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 60%);
        }
        
        .contact-blob-2 {
          bottom: -10%;
          left: -10%;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 60%);
        }

        .section-header {
          text-align: center;
          margin-bottom: 5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(79, 70, 229, 0.1);
          border: 1px solid rgba(79, 70, 229, 0.2);
          border-radius: 100px;
          color: var(--accent-primary);
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .section-subtitle {
          color: var(--text-secondary);
          font-size: 1.125rem;
          max-width: 600px;
          margin: 0 auto;
          margin-top: -3rem;
        }
        
        .section-header .section-title {
          margin-bottom: 4rem;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .contact-details {
          padding-right: 2rem;
        }

        .contact-header-left {
          text-align: left;
          margin-bottom: 3rem;
        }
        
        .contact-header-left .section-title {
          text-align: left;
          margin-top: 0;
          margin-bottom: 1.5rem;
          font-size: 3.5rem;
          line-height: 1.1;
        }
        
        .contact-header-left .section-subtitle {
          text-align: left;
          margin: 0;
          max-width: 100%;
        }

        .details-heading, .form-heading {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .details-sub, .form-sub {
          color: var(--text-secondary);
          font-size: 1.1rem;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        
        .form-header-inner {
          margin-bottom: 1.5rem;
        }

        .info-cards-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .contact-info-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          border-radius: 20px;
          transition: var(--transition-smooth);
          background: var(--stats-card-bg);
          cursor: pointer;
        }

        .contact-info-card:hover {
          transform: translateX(10px);
          background: var(--stats-card-hover-bg);
          border-color: rgba(79, 70, 229, 0.3);
          box-shadow: 0 10px 30px -10px rgba(79, 70, 229, 0.2);
        }

        .icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(14, 165, 233, 0.1));
          color: var(--accent-primary);
          border: 1px solid rgba(79, 70, 229, 0.2);
          transition: var(--transition-smooth);
        }

        .contact-info-card:hover .icon-wrapper {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
          transform: scale(1.05) rotate(5deg);
        }

        .info-content h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.2rem;
        }

        .info-content p {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .premium-glass {
          padding: 1.5rem 2rem;
          border-radius: 24px;
          background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
          box-shadow: 0 30px 60px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .form-group label {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-left: 0.5rem;
          transition: var(--transition-smooth);
        }

        .form-group:focus-within label {
          color: var(--accent-primary);
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: rgba(255,255,255,0.2);
        }

        .submit-btn {
          margin-top: 0.5rem;
          padding: 0.9rem;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.8rem;
          width: 100%;
          font-size: 1.1rem;
          position: relative;
          overflow: hidden;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: all 0.5s ease;
        }

        .submit-btn:hover::before {
          left: 100%;
        }

        .submit-btn:disabled {
          opacity: 0.8;
          cursor: not-allowed;
          transform: none;
        }

        .send-icon {
          transition: transform 0.3s ease;
        }

        .submit-btn:hover .send-icon {
          transform: translateX(4px) translateY(-4px);
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .status-message {
          padding: 1rem 1.2rem;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 1rem;
          font-weight: 500;
          font-size: 0.95rem;
          overflow: hidden;
        }

        .status-message.success {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          color: #4ade80;
        }

        .status-message.error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
        }

        @media (max-width: 992px) {
          .contact-section {
            padding: 5rem 0;
          }
          
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          
          .contact-details {
            padding-right: 0;
            text-align: center;
          }
          
          .contact-header-left,
          .contact-header-left .section-title,
          .contact-header-left .section-subtitle {
            text-align: center;
          }
          
          .info-cards-container {
            align-items: center;
          }
          
          .contact-info-card {
            width: 100%;
            max-width: 400px;
            text-align: left;
          }
        }

        @media (max-width: 768px) {
          .premium-glass {
            padding: 2rem 1.5rem;
          }
          
          .details-heading, .form-heading {
            font-size: 1.75rem;
          }
          
          .contact-header-left .section-title {
            font-size: clamp(2.2rem, 8vw, 3.5rem);
          }
        }
      `}</style>
    </section>
  );
};

export default Contact;

