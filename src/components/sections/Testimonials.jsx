import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: "John Dorsey",
    role: "CEO at TechFlow",
    content: "SARVO transformed our legacy systems into a modern, high-performance platform. Their attention to detail is unmatched.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
  },
  {
    name: "Sarah Jenkins",
    role: "Marketing Director",
    content: "The design team at SARVO is world-class. They captured our brand essence perfectly and delivered a stunning website.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop"
  },
  {
    name: "Michael Chen",
    role: "Founder of StartUpX",
    content: "Fast, reliable, and incredibly talented. SARVO is the partner you need for scaling your digital presence.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" style={{ padding: '8rem 0', background: 'rgba(255,255,255,0.01)' }}>
      <div className="container">
        <h2 className="section-title">Client <span className="gradient-text">Feedback</span></h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass"
              style={{ padding: '3rem' }}
            >
              <Quote size={40} className="gradient-text" style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
              <p style={{ fontSize: '1.1rem', marginBottom: '2rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>"{t.content}"</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={t.image} alt={t.name} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                <div>
                  <h4 style={{ fontSize: '1.1rem' }}>{t.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
