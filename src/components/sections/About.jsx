import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Shield, Users } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: <Target size={32} />,
      title: "Precision Engineering",
      desc: "We don't just build software; we architect scalable digital ecosystems with surgical precision and deep technical expertise.",
      color: "#4f46e5"
    },
    {
      icon: <Zap size={32} />,
      title: "Rapid Innovation",
      desc: "Staying ahead of the curve by integrating cutting-edge tech stacks into every solution we deliver.",
      color: "#0ea5e9"
    },
    {
      icon: <Shield size={32} />,
      title: "Built-in Security",
      desc: "Enterprise-grade security is not an afterthought—it's woven into the very fabric of our architecture from day one.",
      color: "#8b5cf6"
    },
    {
      icon: <Users size={32} />,
      title: "Client-Centric",
      desc: "Your vision is our blueprint. We collaborate closely to ensure every pixel and line of code aligns with your goals.",
      color: "#06b6d4"
    }
  ];

  return (
    <section id="about" style={{ padding: 'clamp(5rem, 10vh, 10rem) 0', position: 'relative', overflow: 'hidden' }}>
      {/* Dynamic Background Elements */}
      <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(79, 70, 229, 0.08) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      
      <div className="container">
        <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 'clamp(3rem, 6vw, 6rem)', alignItems: 'flex-start' }}>
          
          {/* Left Column: Story & Mission */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="about-left"
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.8rem', padding: '0.6rem 1.5rem', borderRadius: '100px', background: 'rgba(79,70,229,0.05)', border: '1px solid rgba(79,70,229,0.2)', marginBottom: '2rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: '0 0 10px var(--accent-primary)' }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                The SARVO Philosophy
              </span>
            </div>

            <h2 style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)', lineHeight: 1.1, fontWeight: 900, marginBottom: '2rem', letterSpacing: '-0.03em' }}>
              Engineering the <span className="gradient-text">Future</span> of Digital Excellence
            </h2>
            
            <p style={{ fontSize: 'clamp(1rem, 3vw, 1.25rem)', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: '550px' }}>
              At SARVO Tech, we bridge the gap between complex business challenges and elegant technological solutions. We are a specialized team of builders, designers, and engineers dedicated to crafting high-performance software that scales with your ambition.
            </p>

            {/* Micro Stats */}
            <div style={{ display: 'flex', gap: 'clamp(2rem, 5vw, 4rem)', borderTop: '1px solid var(--glass-border)', paddingTop: '2.5rem', marginTop: '1rem' }} className="about-stats">
              <div>
                <h4 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: 900, marginBottom: '0.5rem', background: 'linear-gradient(135deg, #fff, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>99%</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Client Success</p>
              </div>
              <div>
                <h4 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', fontWeight: 900, marginBottom: '0.5rem', background: 'linear-gradient(135deg, #fff, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>24/7</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>Expert Support</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Values Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                whileHover={{ y: -10, scale: 1.02 }}
                style={{
                  padding: '2rem',
                  borderRadius: '24px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--glass-border)',
                  backdropFilter: 'blur(10px)',
                  transition: 'var(--transition-smooth)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'default',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }}
              >
                {/* Top glow line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${value.color}, transparent)` }} />
                
                <div style={{ 
                  width: '56px', height: '56px', 
                  borderRadius: '16px', 
                  background: `rgba(${value.color === '#4f46e5' ? '79,70,229' : value.color === '#0ea5e9' ? '14,165,233' : value.color === '#8b5cf6' ? '139,92,246' : '6,182,212'}, 0.1)`, 
                  border: `1px solid rgba(${value.color === '#4f46e5' ? '79,70,229' : value.color === '#0ea5e9' ? '14,165,233' : value.color === '#8b5cf6' ? '139,92,246' : '6,182,212'}, 0.25)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  color: value.color, 
                  marginBottom: '1.5rem' 
                }}>
                  {value.icon}
                </div>
                
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.8rem', fontWeight: 800 }}>{value.title}</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, flexGrow: 1 }}>{value.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>

      <style>{`
        @media (min-width: 992px) {
          .about-left {
            position: sticky;
            top: 120px;
          }
        }
        @media (max-width: 768px) {
          .about-grid {
            grid-template-columns: 1fr !important;
            gap: 3rem !important;
          }
          .about-left {
            text-align: center;
          }
          .about-left p {
            margin-left: auto;
            margin-right: auto;
          }
          .about-stats {
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
};

export default About;
