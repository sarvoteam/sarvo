import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const testimonials = [
  {
    name: "CampusOS Client",
    role: "Institution Administrator",
    content: "SARVO built our entire campus management platform from scratch — leave workflows, faculty dashboards, scholarship portals. The team's dedication and execution quality were outstanding for a first project.",
    rating: 5,
    company: "Early Access Partner",
    accent: "#4f46e5"
  },
  {
    name: "Mobile App Client",
    role: "Product Owner",
    content: "The CampusOS Mobile app SARVO delivered exceeded our expectations. Clean UI, solid performance, and a team that genuinely cared about getting every detail right.",
    rating: 5,
    company: "Early Access Partner",
    accent: "#0ea5e9"
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" style={{ padding: 'clamp(4rem, 8vh, 8rem) 0', position: 'relative', overflow: 'hidden' }}>
      {/* Background */}
      <div style={{ position: 'absolute', bottom: '0', right: '0', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: 'clamp(3rem, 8vw, 5rem)' }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.2em', display: 'block', marginBottom: '1rem' }}>
            Client Stories
          </span>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            What Our <span className="gradient-text">Clients Say</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '1.5rem', fontSize: '1.05rem', maxWidth: '500px', margin: '1.5rem auto 0' }}>
            We're an early-stage team — every client relationship is personal, and we pour everything into every project.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '2rem', marginBottom: '4rem' }}>
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -12 }}
              style={{
                padding: 'clamp(1.5rem, 4vw, 2.8rem)',
                borderRadius: '28px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'hidden',
                transition: 'var(--transition-smooth)'
              }}
            >
              {/* Accent line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${t.accent}, transparent)` }} />

              {/* Quote icon */}
              <Quote size={36} style={{ color: t.accent, opacity: 0.3, marginBottom: '1.5rem' }} />

              {/* Stars */}
              <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '1.5rem' }}>
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={16} fill={t.accent} stroke="none" />
                ))}
              </div>

              {/* Content */}
              <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '2.5rem', flex: 1, fontStyle: 'italic' }}>
                "{t.content}"
              </p>

              {/* Author */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.8rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: `rgba(${t.accent === '#4f46e5' ? '79,70,229' : '14,165,233'}, 0.15)`, border: `2px solid ${t.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.accent, flexShrink: 0 }}>
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.2rem' }}>{t.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: t.accent, fontWeight: 700 }}>{t.role}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Invite CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            textAlign: 'center',
            padding: 'clamp(2rem, 5vw, 3rem)',
            borderRadius: '28px',
            background: 'rgba(79,70,229,0.04)',
            border: '1px solid rgba(79,70,229,0.15)'
          }}
        >
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            🚀 <strong style={{ color: 'var(--text-primary)' }}>We're actively taking on new clients.</strong> Be one of the first to build with us.
          </p>
          <Link to="/contact" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary"
              style={{ padding: '1rem 2.5rem', borderRadius: '100px', fontWeight: 700 }}
            >
              Work With Us
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
