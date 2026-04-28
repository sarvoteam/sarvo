import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Shield, Users } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: <Target className="gradient-text" size={32} />,
      title: "Precision Engineering",
      desc: "We don't just build software; we architect scalable digital ecosystems with surgical precision."
    },
    {
      icon: <Zap className="gradient-text" size={32} />,
      title: "Rapid Innovation",
      desc: "Staying ahead of the curve by integrating cutting-edge tech stacks into every solution we deliver."
    },
    {
      icon: <Shield className="gradient-text" size={32} />,
      title: "Built-in Security",
      desc: "Enterprise-grade security is not an afterthought—it's woven into the fabric of our architecture."
    },
    {
      icon: <Users className="gradient-text" size={32} />,
      title: "Client-Centric",
      desc: "Your vision is our blueprint. We collaborate closely to ensure every pixel aligns with your goals."
    }
  ];

  return (
    <section id="about" style={{ padding: '10rem 0', position: 'relative', overflow: 'hidden' }}>
      {/* Abstract Background Elements */}
      <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(79, 70, 229, 0.1) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '6rem', alignItems: 'center' }}>
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1.5rem', display: 'block' }}>
              The SARVO Philosophy
            </span>
            <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', lineHeight: 1.1, fontWeight: 900, marginBottom: '2.5rem', letterSpacing: '-0.03em' }}>
              Engineering the <span className="gradient-text">Future</span> of Digital Excellence
            </h2>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '3rem' }}>
              At SARVO Tech, we bridge the gap between complex business challenges and elegant technological solutions. Our mission is to empower organizations through high-performance software that scales with their ambition.
            </p>
            
            <div style={{ display: 'flex', gap: '3rem', borderTop: '1px solid var(--glass-border)', paddingTop: '3rem' }}>
              <div>
                <h4 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }} className="gradient-text">99%</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Client Success</p>
              </div>
              <div>
                <h4 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }} className="gradient-text">24/7</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Expert Support</p>
              </div>
            </div>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {values.map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                style={{
                  padding: '2.5rem',
                  borderRadius: '32px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--glass-border)',
                  backdropFilter: 'blur(10px)',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <div style={{ marginBottom: '1.5rem' }}>{value.icon}</div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', fontWeight: 800 }}>{value.title}</h3>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{value.desc}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
