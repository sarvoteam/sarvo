import React from 'react';
import { motion } from 'framer-motion';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const team = [
  {
    name: "Alex Rivers",
    role: "CEO & Founder",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    socials: { twitter: "#", linkedin: "#", github: "#" }
  },
  {
    name: "Sarah Chen",
    role: "Lead Designer",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    socials: { twitter: "#", linkedin: "#", github: "#" }
  },
  {
    name: "Marcus Thorne",
    role: "CTO",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
    socials: { twitter: "#", linkedin: "#", github: "#" }
  },
  {
    name: "Elena Rodriguez",
    role: "Product Manager",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
    socials: { twitter: "#", linkedin: "#", github: "#" }
  }
];

const Team = () => {
  return (
    <section id="team" style={{ padding: '8rem 0' }}>
      <div className="container">
        <h2 className="section-title">Meet Our <span className="gradient-text">Team</span></h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              style={{ textAlign: 'center' }}
            >
              <div className="glass" style={{ padding: '2.5rem', marginBottom: '1.5rem', borderRadius: '32px', overflow: 'hidden' }}>
                <div style={{ position: 'relative', marginBottom: '2rem', borderRadius: '24px', overflow: 'hidden' }}>
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    style={{ width: '100%', height: '300px', objectFit: 'cover', filter: 'grayscale(20%) brightness(90%)', transition: 'var(--transition-smooth)' }} 
                    className="team-img"
                  />
                </div>
                <h3 style={{ fontSize: '1.6rem', marginBottom: '0.6rem' }}>{member.name}</h3>
                <p style={{ color: 'var(--accent-primary)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{member.role}</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem' }}>
                  <a href={member.socials.twitter} className="social-icon"><FaTwitter size={20} /></a>
                  <a href={member.socials.linkedin} className="social-icon"><FaLinkedin size={20} /></a>
                  <a href={member.socials.github} className="social-icon"><FaGithub size={20} /></a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .team-img:hover {
          transform: scale(1.1);
          filter: grayscale(0%) brightness(100%);
        }
        .social-icon {
          color: var(--text-secondary);
          transition: var(--transition-smooth);
        }
        .social-icon:hover {
          color: var(--accent-primary);
          transform: translateY(-3px);
        }
      `}</style>

    </section>
  );
};

export default Team;
