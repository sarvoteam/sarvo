import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const plans = [
  {
    name: "Starter",
    price: "$999",
    features: ["Standard UI/UX Design", "5 Pages Website", "Basic SEO", "3 Months Support"],
    recommended: false
  },
  {
    name: "Professional",
    price: "$2,499",
    features: ["Premium UI/UX Design", "Unlimited Pages", "Advanced SEO", "Priority Support", "Custom Animations"],
    recommended: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Dedicated Team", "Full Scale Branding", "Custom Web Apps", "24/7 Premium Support", "SLA Guarantee"],
    recommended: false
  }
];

const Pricing = () => {
  return (
    <section id="pricing" style={{ padding: '8rem 0' }}>
      <div className="container">
        <h2 className="section-title">Service <span className="gradient-text">Plans</span></h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass"
              style={{ 
                padding: '4rem 3rem', 
                position: 'relative',
                border: plan.recommended ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                transform: plan.recommended ? 'scale(1.05)' : 'scale(1)',
                zIndex: plan.recommended ? 1 : 0
              }}
            >
              {plan.recommended && (
                <span style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--accent-primary)', color: 'white', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800 }}>RECOMMENDED</span>
              )}
              
              <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>{plan.name}</h3>
              <div style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '2rem' }} className="gradient-text">{plan.price}</div>
              
              <ul style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--text-secondary)' }}>
                    <Check size={18} className="gradient-text" /> {f}
                  </li>
                ))}
              </ul>
              
              <button className={plan.recommended ? "btn-primary" : "btn-secondary"} style={{ width: '100%' }}>
                Get Started
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
