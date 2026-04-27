import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { label: "Active Clients", value: "250+" },
  { label: "Projects Completed", value: "1.2k" },
  { label: "Team Members", value: "45+" },
  { label: "Awards Won", value: "12" }
];

const Stats = () => {
  return (
    <section id="stats" style={{ padding: '6rem 0' }}>
      <div className="container">
        <div className="glass" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', padding: '4rem', textAlign: 'center', gap: '3rem' }}>
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }} className="gradient-text">{stat.value}</h3>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};



export default Stats;
