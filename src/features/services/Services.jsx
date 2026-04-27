import React from 'react';
import { motion } from 'framer-motion';
import { Code, Palette, Cpu, Globe, BarChart, Shield } from 'lucide-react';

const services = [
  {
    icon: <Globe size={32} />,
    title: "Web Development",
    desc: "Custom high-performance websites built with React and modern tech stacks."
  },
  {
    icon: <Palette size={32} />,
    title: "UI/UX Design",
    desc: "Premium interfaces designed to provide seamless user experiences."
  },
  {
    icon: <Cpu size={32} />,
    title: "Digital Strategy",
    desc: "Data-driven strategies to help your brand grow in the digital landscape."
  },
  {
    icon: <Code size={32} />,
    title: "Mobile Solutions",
    desc: "Native and cross-platform mobile apps for iOS and Android."
  },
  {
    icon: <BarChart size={32} />,
    title: "SEO Optimization",
    desc: "Boosting your search rankings and visibility with proven SEO techniques."
  },
  {
    icon: <Shield size={32} />,
    title: "Cyber Security",
    desc: "Ensuring your digital assets are protected with robust security protocols."
  }
];

const Services = () => {
  return (
    <section id="services" style={{ padding: '8rem 0', background: 'rgba(255,255,255,0.01)' }}>
      <div className="container">
        <h2 className="section-title">Our <span className="gradient-text">Expertise</span></h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2.5rem' }}>
          {services.map((service, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -12, scale: 1.02 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass"
              style={{ padding: '3.5rem 2.5rem', transition: 'var(--transition-smooth)' }}
            >
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '16px', 
                background: 'rgba(99, 102, 241, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--accent-primary)', 
                marginBottom: '2rem' 
              }}>
                {service.icon}
              </div>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '1.2rem' }}>{service.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7 }}>{service.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Services;
