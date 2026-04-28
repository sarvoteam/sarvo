import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ArrowRight, Monitor, Smartphone, Layers, Send } from 'lucide-react';
import campusos from '../../assets/campusos.png';
import project2 from '../../assets/project2.png';

const ActionModal = ({ isOpen, onClose, type }) => {
  const [submitted, setSubmitted] = useState(false);
  
  if (!isOpen) return null;

  const handleAction = () => {
    setSubmitted(true);
    // In a real app, this would trigger an API call
  };

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          background: 'rgba(2, 4, 10, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)'
        }}
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: 'spring', damping: 28, stiffness: 250 }}
          style={{
            width: '100%',
            maxWidth: type === 'work' ? '1200px' : '800px',
            maxHeight: '90vh',
            overflow: 'hidden',
            position: 'relative',
            background: 'var(--bg-card)',
            borderRadius: '32px',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.6)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button 
            onClick={handleClose}
            style={{ 
              position: 'absolute', 
              top: '1.5rem', 
              right: '1.5rem', 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid var(--glass-border)', 
              color: 'white', 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              cursor: 'pointer',
              zIndex: 10,
              transition: 'var(--transition-smooth)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--accent-primary)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <X size={20} />
          </button>

          <div 
            style={{ 
              padding: 'clamp(2rem, 5vw, 4rem) clamp(1.5rem, 4vw, 3rem)', 
              overflowY: 'auto', 
              maxHeight: '88vh' 
            }} 
            className="custom-scrollbar"
          >
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '4rem 0' }}
              >
                <div style={{ 
                  width: '100px', 
                  height: '100px', 
                  background: 'rgba(79, 70, 229, 0.1)', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 2.5rem',
                  border: '2px solid var(--accent-primary)'
                }}>
                  <Send className="gradient-text" size={40} />
                </div>
                <h2 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1.5rem' }} className="gradient-text">Inquiry Received!</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '3rem', maxWidth: '500px', margin: '0 auto 3rem' }}>
                  Our technical strategy team has been notified. We will reach out within 24 hours to schedule your deep-dive session.
                </p>
                <button onClick={handleClose} className="btn-primary" style={{ padding: '1.2rem 3.5rem', borderRadius: '15px' }}>Back to Home</button>
              </motion.div>
            ) : type === 'journey' ? (
              <div style={{ textAlign: 'center' }}>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <h2 style={{ fontSize: 'clamp(2.2rem, 6vw, 3.5rem)', marginBottom: '1rem', fontWeight: 900, letterSpacing: '-0.03em' }} className="gradient-text">Start Your Project</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1rem, 2vw, 1.2rem)', marginBottom: '3.5rem', maxWidth: '600px', margin: '0 auto 3.5rem' }}>
                    Select the path that best describes your vision.
                  </p>
                </motion.div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
                  {[
                    { 
                      icon: <Monitor size={36} />, 
                      title: "CampusOS Core", 
                      desc: "The ultimate campus management ecosystem. Scalable, secure, and fully automated.",
                      tag: "Recommended",
                      color: "#4f46e5"
                    },
                    { 
                      icon: <Smartphone size={36} />, 
                      title: "Mobile Innovation", 
                      desc: "Native-grade iOS & Android applications with seamless UI/UX and offline capabilities.",
                      color: "#0ea5e9"
                    },
                    { 
                      icon: <Layers size={36} />, 
                      title: "Enterprise SaaS", 
                      desc: "High-performance cloud platforms and internal tools designed for modern scale.",
                      color: "#8b5cf6"
                    }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      onClick={handleAction}
                      whileHover={{ y: -12, scale: 1.02 }}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * idx, duration: 0.6 }}
                      style={{ 
                        padding: '3rem 2rem', 
                        borderRadius: '32px', 
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))', 
                        border: '1px solid var(--glass-border)', 
                        textAlign: 'center',
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      {item.tag && (
                        <div style={{ position: 'absolute', top: '1.2rem', right: '-2.5rem', background: 'var(--accent-primary)', color: 'white', padding: '0.3rem 3rem', fontSize: '0.7rem', fontWeight: 800, transform: 'rotate(45deg)' }}>
                          {item.tag}
                        </div>
                      )}
                      
                      <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '20px', 
                        background: `rgba(${idx === 0 ? '79, 70, 229' : idx === 1 ? '14, 165, 233' : '139, 92, 246'}, 0.1)`, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: item.color,
                        margin: '0 auto 2rem',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        {item.icon}
                      </div>

                      <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', fontWeight: 800 }}>{item.title}</h3>
                      <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2.5rem' }}>{item.desc}</p>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', fontWeight: 700, color: item.color, opacity: 0.8 }}>
                        Get Started <ArrowRight size={18} />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div style={{ marginTop: '5rem' }}>
                  <motion.button 
                    onClick={handleAction}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary" 
                    style={{ 
                      borderRadius: '100px',
                      background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                      fontSize: '1.1rem',
                      fontWeight: 700
                    }}
                  >
                    Schedule a Consultation
                  </motion.button>
                </div>
              </div>
            ) : (
              <div>
                {/* Header */}
                <div style={{ marginBottom: '3.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: '1rem' }}>Our Work</span>
                  <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                    Built to <span className="gradient-text">Impress</span>,<br/>Engineered to <span className="gradient-text">Scale</span>
                  </h2>
                </div>

                {/* Project 1 — CampusOS Web */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2.5rem',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, rgba(79,70,229,0.06), rgba(14,165,233,0.03))',
                    border: '1px solid rgba(79,70,229,0.2)',
                    borderRadius: '32px',
                    overflow: 'hidden',
                    marginBottom: '2.5rem'
                  }}
                >
                  <div style={{ padding: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: '0 0 12px var(--accent-primary)' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Enterprise Ecosystem</span>
                    </div>
                    <h3 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, marginBottom: '1.2rem', letterSpacing: '-0.02em' }}>CampusOS <span className="gradient-text">Web</span></h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '2rem' }}>
                      A complete campus management ecosystem featuring automated leave workflows, scholarship portals, faculty dashboards, and role-based access control.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem', marginBottom: '2.5rem' }}>
                      {['React', 'Node.js', 'PostgreSQL', 'REST API'].map(tag => (
                        <span key={tag} style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.4rem 1rem', borderRadius: '100px', background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.25)', color: 'var(--accent-primary)', letterSpacing: '0.05em' }}>{tag}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, color: 'var(--accent-primary)', fontSize: '0.95rem' }}>
                      <Check size={18} /> Live & Deployed
                    </div>
                  </div>
                  <div style={{ height: '420px', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={campusos}
                      alt="CampusOS Web"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', transition: 'transform 0.6s ease' }}
                      onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                      onMouseOut={e => e.target.style.transform = 'scale(1)'}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(79,70,229,0.15), transparent)' }} />
                  </div>
                </motion.div>

                {/* Project 2 — CampusOS Mobile */}
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2.5rem',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, rgba(14,165,233,0.06), rgba(139,92,246,0.03))',
                    border: '1px solid rgba(14,165,233,0.2)',
                    borderRadius: '32px',
                    overflow: 'hidden',
                    marginBottom: '3rem',
                    direction: 'rtl'
                  }}
                >
                  <div style={{ padding: '3rem', direction: 'ltr' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0ea5e9', boxShadow: '0 0 12px #0ea5e9' }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Native Application</span>
                    </div>
                    <h3 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, marginBottom: '1.2rem', letterSpacing: '-0.02em' }}>CampusOS <span style={{ background: 'linear-gradient(135deg, #0ea5e9, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mobile</span></h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '2rem' }}>
                      A fluid, native-grade mobile experience delivering instant push notifications, digital ID cards, and leave management at students' fingertips.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem', marginBottom: '2.5rem' }}>
                      {['React Native', 'Expo', 'Firebase', 'Push Notifications'].map(tag => (
                        <span key={tag} style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.4rem 1rem', borderRadius: '100px', background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.25)', color: '#0ea5e9', letterSpacing: '0.05em' }}>{tag}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, color: '#0ea5e9', fontSize: '0.95rem' }}>
                      <Check size={18} /> iOS & Android Ready
                    </div>
                  </div>
                  <div style={{ height: '420px', overflow: 'hidden', position: 'relative', direction: 'ltr', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                      src={project2}
                      alt="CampusOS Mobile"
                      style={{ width: 'auto', height: '100%', maxWidth: '100%', objectFit: 'contain', transition: 'transform 0.6s ease' }}
                      onMouseOver={e => e.target.style.transform = 'scale(1.05)'}
                      onMouseOut={e => e.target.style.transform = 'scale(1)'}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(14,165,233,0.15), transparent)' }} />
                  </div>
                </motion.div>

                {/* CTA */}
                <div style={{ textAlign: 'center' }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-primary"
                    style={{ padding: '1.2rem 3.5rem', borderRadius: '100px', fontSize: '1.05rem', fontWeight: 700 }}
                    onClick={handleAction}
                  >
                    Start a Project Like This
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ActionModal;
