import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, XCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';

const Contact = () => {
  const form = useRef();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null

  const sendEmail = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    // Add current time to the form before sending
    const timeInput = document.createElement('input');
    timeInput.type = 'hidden';
    timeInput.name = 'time';
    timeInput.value = new Date().toLocaleString();
    form.current.appendChild(timeInput);

    emailjs.sendForm(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      form.current,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    )
      .then((result) => {
        console.log(result.text);
        setStatus('success');
        form.current.reset();
      }, (error) => {
        console.log(error.text);
        setStatus('error');
      })
      .finally(() => {
        setIsSubmitting(false);
        form.current.removeChild(timeInput);
        setTimeout(() => setStatus(null), 5000);
      });
  };

  return (
    <section id="contact" style={{ padding: '8rem 0', background: 'rgba(255,255,255,0.01)', position: 'relative' }}>
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
            <form ref={form} onSubmit={sendEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <input type="text" name="name" placeholder="Your Full Name" required style={inputStyle} />
              <input type="email" name="email" placeholder="Email Address" required style={inputStyle} />
              <input type="text" name="title" placeholder="Subject" required style={inputStyle} />
              <textarea name="message" placeholder="Tell us about your project" rows="5" required style={inputStyle}></textarea>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn-primary" 
                style={{ 
                  padding: '1.2rem 3rem', 
                  borderRadius: '16px', 
                  fontSize: '1.1rem',
                  opacity: isSubmitting ? 0.7 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? 'Sending...' : 'Send Inquiry'} <Send size={20} />
              </button>
            </form>

            <AnimatePresence>
              {status && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    background: status === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${status === 'success' ? '#22c55e' : '#ef4444'}`,
                    color: status === 'success' ? '#4ade80' : '#f87171'
                  }}
                >
                  {status === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  <p>{status === 'success' ? 'Message sent successfully!' : 'Something went wrong. Please try again.'}</p>
                </motion.div>
              )}
            </AnimatePresence>
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
