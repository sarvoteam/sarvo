import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown, Monitor, Smartphone, Zap } from 'lucide-react';
import heroMockup from '../../assets/hero_mockup.png';
import ActionModal from '../modals/ActionModal';

const Hero = () => {
  const [modalState, setModalState] = useState({ isOpen: false, type: '' });

  const openModal = (type) => setModalState({ isOpen: true, type });
  const closeModal = () => setModalState({ isOpen: false, type: '' });

  return (
    <section className="hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: '100px 0' }}>
      <ActionModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
      />

      {/* Dynamic Background Elements */}
      <div className="blob" style={{ top: '-10%', left: '-5%', background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)', width: '800px', height: '800px' }}></div>
      <div className="blob" style={{ bottom: '0', right: '-10%', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%)', width: '600px', height: '600px' }}></div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '4rem', alignItems: 'center' }}>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.7rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '0.6rem 1.2rem', borderRadius: '100px', marginBottom: '2rem' }}
            >
              <Zap size={16} className="gradient-text" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>PREMIUM DIGITAL SOLUTIONS</span>
            </motion.div>

            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.05, marginBottom: '1.5rem', fontWeight: 800 }}>
              Engineering <span className="gradient-text">Excellence</span> in <br />
              Web & Mobile Apps
            </h1>

            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px', lineHeight: 1.7 }}>
              We build scalable, high-performance digital ecosystems that transform your business vision into a market-leading reality.
            </p>

            <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
              <button
                onClick={() => openModal('journey')}
                className="btn-primary"
                style={{ padding: '1.1rem 2.4rem' }}
              >
                Start Your Journey <ArrowRight size={20} />
              </button>
              <button
                onClick={() => openModal('work')}
                className="btn-secondary"
                style={{ padding: '1.1rem 2.2rem' }}
              >
                View Our Work
              </button>
            </div>

            {/* <div style={{ display: 'flex', gap: '1.5rem', opacity: 0.8, flexWrap: 'wrap' }}>
              <motion.div 
                whileHover={{ y: -5, opacity: 1, background: 'rgba(255,255,255,0.05)' }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1.5rem', borderRadius: '100px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', transition: 'var(--transition-smooth)' }}
              >
                <Monitor size={20} className="gradient-text" />
                <span style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Enterprise Web</span>
              </motion.div>
              <motion.div 
                whileHover={{ y: -5, opacity: 1, background: 'rgba(255,255,255,0.05)' }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1.5rem', borderRadius: '100px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', transition: 'var(--transition-smooth)' }}
              >
                <Smartphone size={20} className="gradient-text" />
                <span style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Native Mobile</span>
              </motion.div>
            </div> */}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            style={{ position: 'relative' }}
          >
            <div className="glass" style={{ padding: '0.5rem', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <img
                src={heroMockup}
                alt="SARVO Digital Mockup"
                style={{ width: '100%', height: 'auto', borderRadius: '28px', display: 'block', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}
              />
            </div>

            {/* Professional Floating Badge */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              style={{ position: 'absolute', bottom: '10%', left: '-5%', background: 'var(--bg-card)', padding: '1.2rem 2rem', borderRadius: '20px', border: '1px solid var(--glass-border)', boxShadow: 'var(--shadow-premium)', zIndex: 2 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <Zap size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>Fast-Track</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Delivery Model</div>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', opacity: 0.3, cursor: 'pointer' }}
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <ChevronDown size={32} />
      </motion.div>

      <style jsx>{`
        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 10% 10%, rgba(79, 70, 229, 0.05) 0%, transparent 30%),
            radial-gradient(circle at 90% 90%, rgba(14, 165, 233, 0.05) 0%, transparent 30%);
          pointer-events: none;
        }
      `}</style>
    </section>
  );
};

export default Hero;
