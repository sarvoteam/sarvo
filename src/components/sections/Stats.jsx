import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Award, Zap } from 'lucide-react';

const stats = [
  { label: "Happy Clients", value: "1", icon: <Users size={28} />, color: "#4f46e5", desc: "Trusted partnerships built" },
  { label: "Projects Delivered", value: "1", icon: <TrendingUp size={28} />, color: "#0ea5e9", desc: "On time & on budget" },
  { label: "Experts Team Members", value: "5", icon: <Zap size={28} />, color: "#8b5cf6", desc: "Passionate builders" },
  { label: "Client Satisfaction", value: "100%", icon: <Award size={28} />, color: "#06b6d4", desc: "Zero compromises on quality" },
];

const Stats = () => {
  return (
    <section id="stats" style={{ padding: 'clamp(4rem, 8vh, 7rem) 0', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(79,70,229,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="container">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 5vw, 4rem)' }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            By The Numbers
          </span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 900, marginTop: '1rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            Proven Results at <span className="gradient-text">Scale</span>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1.5rem' }}>
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              style={{
                padding: '2.5rem 2rem',
                borderRadius: '28px',
                background: 'var(--stats-card-bg)',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(10px)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                transition: 'var(--transition-smooth)',
                cursor: 'default'
              }}
            >
              {/* Subtle top accent bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${stat.color}, transparent)` }} />

              <div style={{
                width: '60px', height: '60px',
                borderRadius: '18px',
                background: `rgba(${stat.color === '#4f46e5' ? '79,70,229' : stat.color === '#0ea5e9' ? '14,165,233' : stat.color === '#8b5cf6' ? '139,92,246' : '6,182,212'}, 0.12)`,
                border: `1px solid rgba(${stat.color === '#4f46e5' ? '79,70,229' : stat.color === '#0ea5e9' ? '14,165,233' : stat.color === '#8b5cf6' ? '139,92,246' : '6,182,212'}, 0.25)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: stat.color,
                margin: '0 auto 1.5rem'
              }}>
                {stat.icon}
              </div>

              <h3 style={{ fontSize: 'clamp(2.5rem, 6vw, 3rem)', fontWeight: 900, marginBottom: '0.3rem', background: `linear-gradient(135deg, var(--text-primary), ${stat.color})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {stat.value}
              </h3>
              <p style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                {stat.label}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{stat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
