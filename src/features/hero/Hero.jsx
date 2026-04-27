import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';

const Hero = () => {
  return (
    <section className="hero" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ maxWidth: '800px' }}
        >
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ color: 'var(--accent-secondary)', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'block' }}
          >
            Empowering Your Digital Future
          </motion.span>
          
          <h1 style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', lineHeight: 1.1, marginBottom: '2rem' }}>
            We Build <span className="gradient-text">Exceptional</span> Digital Experiences
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px' }}>
            Transforming ideas into high-performance web applications with cutting-edge technology and premium design.
          </p>
          
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '4rem' }}>
            <button className="btn-primary">
              Get Started <ArrowRight size={20} />
            </button>
            <button className="btn-secondary">
              Our Process
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '2.5rem' }}
          >
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.5rem', fontWeight: 700 }}>Trusted by industry leaders</p>
            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', opacity: 0.5, filter: 'grayscale(100%)' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>TECHFLOW</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>NEXUS</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>VELOCITY</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>QUANTUM</span>
            </div>
          </motion.div>
        </motion.div>
      </div>


      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', opacity: 0.5 }}
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
          background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 50%);
          pointer-events: none;
        }
      `}</style>
    </section>
  );
};

export default Hero;
