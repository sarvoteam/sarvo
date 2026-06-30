import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Code2, Smartphone, Cloud, Check } from 'lucide-react';
import Hero from '../components/sections/Hero';
import Stats from '../components/sections/Stats';
import Testimonials from '../components/sections/Testimonials';
import campusos from '../assets/campusos.png';
import project2 from '../assets/project2.png';

// ── Featured Work Preview ─────────────────────────────────────
const FeaturedWork = () => (
  <section style={{ padding: '8rem 0', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: '10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '1.5rem' }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: '1rem' }}>Our Work</span>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Flagship <span className="gradient-text">Projects</span>
          </h2>
        </div>
        <Link to="/services" style={{ textDecoration: 'none' }}>
          <motion.button
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.97 }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', padding: '0.8rem 1.8rem', borderRadius: '100px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'var(--transition-smooth)' }}
          >
            View All Work <ArrowRight size={16} />
          </motion.button>
        </Link>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
        {[
          {
            img: campusos,
            title: 'CampusOS Web',
            category: 'Enterprise Ecosystem',
            tags: ['React', 'Node.js', 'PostgreSQL'],
            color: '#4f46e5',
            objectPos: 'top',
            contain: true
          },
          {
            img: project2,
            title: 'CampusOS Mobile',
            category: 'Native Application',
            tags: ['React Native', 'Expo', 'Firebase'],
            color: '#0ea5e9',
            objectPos: 'center',
            contain: true
          }
        ].map((project, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.15, duration: 0.6 }}
            whileHover={{ y: -12 }}
            style={{
              borderRadius: '24px',
              overflow: 'hidden',
              border: '1px solid var(--glass-border)',
              background: 'var(--stats-card-bg)',
              transition: 'var(--transition-smooth)'
            }}
          >
            {/* Image */}
            <div style={{ height: '280px', overflow: 'hidden', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <img
                src={project.img}
                alt={project.title}
                style={{ width: project.contain ? 'auto' : '100%', height: '100%', objectFit: project.contain ? 'contain' : 'cover', objectPosition: project.objectPos, transition: 'transform 0.6s ease' }}
                onMouseOver={e => e.target.style.transform = 'scale(1.06)'}
                onMouseOut={e => e.target.style.transform = 'scale(1)'}
              />
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(transparent 60%, rgba(0,0,0,0.6))` }} />
              <div style={{ position: 'absolute', top: '1.2rem', left: '1.2rem', background: project.color, color: 'white', fontSize: '0.7rem', fontWeight: 800, padding: '0.3rem 1rem', borderRadius: '100px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {project.category}
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>{project.title}</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {project.tags.map(tag => (
                  <span key={tag} style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.3rem 0.8rem', borderRadius: '100px', background: `rgba(${project.color === '#4f46e5' ? '79,70,229' : '14,165,233'}, 0.1)`, border: `1px solid rgba(${project.color === '#4f46e5' ? '79,70,229' : '14,165,233'}, 0.2)`, color: project.color }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ── Services Teaser ───────────────────────────────────────────
const ServiceTeaser = () => {
  const services = [
    { icon: <Code2 size={28} />, title: 'Web Development', desc: 'Scalable, high-performance web apps built with modern frameworks.', color: '#4f46e5' },
    { icon: <Smartphone size={28} />, title: 'Mobile Apps', desc: 'Native-grade iOS & Android applications with stunning UX.', color: '#0ea5e9' },
    { icon: <Cloud size={28} />, title: 'Cloud & SaaS', desc: 'Resilient cloud architectures and enterprise digital transformation.', color: '#8b5cf6' },
  ];

  return (
    <section style={{ padding: '7rem 0', background: 'rgba(255,255,255,0.01)' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: '1rem' }}>What We Do</span>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 900, letterSpacing: '-0.02em' }}>
            End-to-End <span className="gradient-text">Digital Expertise</span>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          {services.map((s, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              whileHover={{ y: -10 }}
              style={{ padding: '2.5rem', borderRadius: '24px', background: 'var(--stats-card-bg)', border: '1px solid var(--glass-border)', transition: 'var(--transition-smooth)' }}
            >
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: `rgba(${s.color === '#4f46e5' ? '79,70,229' : s.color === '#0ea5e9' ? '14,165,233' : '139,92,246'}, 0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, marginBottom: '1.5rem' }}>
                {s.icon}
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.8rem' }}>{s.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>{s.desc}</p>
            </motion.div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/services" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary"
              style={{ padding: '1.1rem 2.8rem', borderRadius: '100px', fontSize: '1rem', fontWeight: 700 }}
            >
              Explore All Services <ArrowRight size={18} style={{ display: 'inline', marginLeft: '0.4rem' }} />
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
};

// ── CTA Banner ────────────────────────────────────────────────
const CTABanner = () => (
  <section style={{ padding: '7rem 0' }}>
    <div className="container">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        style={{
          padding: 'clamp(3rem, 6vw, 5rem)',
          borderRadius: '40px',
          background: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(14,165,233,0.08))',
          border: '1px solid rgba(79,70,229,0.25)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-30%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: '1.5rem' }}>
            Ready to Build?
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '1.5rem', lineHeight: 1.1 }}>
            Let's Engineer Your <span className="gradient-text">Next Big Thing</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '550px', margin: '0 auto 3rem', lineHeight: 1.7 }}>
            From concept to deployment — we handle the full engineering lifecycle so you can focus on growing your business.
          </p>

          <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <Link to="/contact" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary"
                style={{ padding: '1.2rem 3rem', borderRadius: '100px', fontSize: '1.05rem', fontWeight: 700 }}
              >
                Start a Project <ArrowRight size={18} style={{ display: 'inline', marginLeft: '0.4rem' }} />
              </motion.button>
            </Link>
            <Link to="/about" style={{ textDecoration: 'none' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="btn-secondary"
                style={{ padding: '1.2rem 3rem', borderRadius: '100px', fontSize: '1.05rem', fontWeight: 700 }}
              >
                Learn About Us
              </motion.button>
            </Link>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
            {['No lock-in contracts', '48h response time', 'Dedicated team'].map(point => (
              <div key={point} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <Check size={16} style={{ color: 'var(--accent-primary)' }} /> {point}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

// ── Home Page Assembly ────────────────────────────────────────
const Home = () => {
  return (
    <main>
      <Hero />
      <Stats />
      <ServiceTeaser />
      <FeaturedWork />
      <Testimonials />
      <CTABanner />
    </main>
  );
};

export default Home;
