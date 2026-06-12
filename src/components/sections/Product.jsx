import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Zap, RefreshCw, BarChart, Layers, Settings, ArrowRight } from 'lucide-react';
import mockupImg from '../../assets/campusos.png';

const features = [
  {
    icon: <Zap size={24} />,
    title: "Lightning Fast Performance",
    description: "Built on modern architecture ensuring sub-second load times and seamless interactions across all your devices."
  },
  {
    icon: <Shield size={24} />,
    title: "Enterprise-Grade Security",
    description: "Your data is protected with military-grade encryption, regular audits, and compliance with global standards."
  },
  {
    icon: <RefreshCw size={24} />,
    title: "Real-time Synchronization",
    description: "Experience immediate updates across your entire organization without refreshing or waiting."
  },
  {
    icon: <BarChart size={24} />,
    title: "Advanced Analytics",
    description: "Gain actionable insights with our comprehensive dashboard, customizable reports, and predictive metrics."
  },
  {
    icon: <Layers size={24} />,
    title: "Seamless Integrations",
    description: "Connect instantly with your favorite tools. We support over 100+ native integrations right out of the box."
  },
  {
    icon: <Settings size={24} />,
    title: "Customizable Workflows",
    description: "Tailor the platform to match your exact processes with our intuitive drag-and-drop workflow builder."
  }
];

const Product = () => {
  return (
    <section id="product" className="product-section">
      <div className="blob product-blob-1"></div>
      <div className="blob product-blob-2"></div>
      
      <div className="container">
        {/* Product Hero Header */}
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="badge">
            <Layers size={16} />
            <span>CampusOS</span>
          </div>
          <h2 className="section-title">CampusOS by <span className="gradient-text">SARVO</span></h2>
          <p className="section-subtitle">
            A premium college timetable web application designed for students and faculty. 
            Manage classes, schedules, and academic workflows effortlessly in one centralized platform.
          </p>
          
          <div className="product-actions">
            <Link to="/contact" className="btn-primary" style={{ textDecoration: 'none' }}>
              Book a Demo <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>

        {/* Product Showcase Mockup */}
        <motion.div
          className="product-showcase"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="glass premium-glass showcase-container">
            <img 
              src={mockupImg} 
              alt="CampusOS Timetable Application" 
              className="showcase-img"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div style="padding: 4rem; text-align: center; color: var(--text-secondary);"><Layers size={48} style="margin-bottom: 1rem; opacity: 0.5;"/><br/>Interactive Platform Dashboard</div>';
              }}
            />
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card glass"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.08, transition: { duration: 0.5, delay: 0 } }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="feature-icon-wrapper">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .product-section {
          padding: 8rem 0;
          position: relative;
          overflow: hidden;
        }

        .product-blob-1 {
          top: 0;
          left: -10%;
          background: radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 60%);
        }
        
        .product-blob-2 {
          bottom: 20%;
          right: -10%;
          background: radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 60%);
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(14, 165, 233, 0.1);
          border: 1px solid rgba(14, 165, 233, 0.2);
          border-radius: 100px;
          color: var(--accent-secondary);
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .section-subtitle {
          color: var(--text-secondary);
          font-size: 1.125rem;
          max-width: 600px;
          margin: 0 auto;
          margin-top: -3rem;
          margin-bottom: 2.5rem;
          line-height: 1.7;
        }
        
        .section-header .section-title {
          margin-bottom: 4rem;
        }

        .product-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          align-items: center;
        }

        .product-showcase {
          margin: 0 auto 8rem auto;
          max-width: 950px;
          perspective: 1000px;
        }

        .showcase-container {
          padding: 1rem;
          border-radius: 24px;
          transform: rotateX(5deg);
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1);
          transition: var(--transition-smooth);
        }

        .showcase-container:hover {
          transform: rotateX(0deg) translateY(-10px);
          box-shadow: 0 50px 100px -20px rgba(79, 70, 229, 0.3), inset 0 1px 0 rgba(255,255,255,0.1);
        }

        .showcase-img {
          width: 100%;
          height: auto;
          border-radius: 16px;
          display: block;
          object-fit: cover;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          padding: 2.5rem;
          border-radius: 24px;
          transition: var(--transition-smooth);
          cursor: pointer;
        }

        .feature-card:hover {
          border-color: rgba(79, 70, 229, 0.3);
          background: rgba(255, 255, 255, 0.03);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3);
        }

        .feature-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(14, 165, 233, 0.1));
          color: var(--accent-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          transition: var(--transition-smooth);
          border: 1px solid rgba(14, 165, 233, 0.2);
        }

        .feature-card:hover .feature-icon-wrapper {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
          transform: scale(1.1) rotate(5deg);
        }

        .feature-title {
          font-size: 1.25rem;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .feature-description {
          color: var(--text-secondary);
          line-height: 1.6;
          font-size: 0.95rem;
        }

        @media (max-width: 768px) {
          .product-section {
            padding: 5rem 0;
          }
          
          .section-subtitle {
             margin-top: -1rem;
             margin-bottom: 2rem;
             font-size: 1rem;
          }

          .product-actions {
            flex-direction: column;
            width: 100%;
            gap: 1.5rem;
          }
          
          .product-actions a {
            width: 100%;
            justify-content: center;
          }
          
          .showcase-container {
            transform: none !important;
            padding: 0.5rem;
            margin-bottom: 4rem;
          }

          .product-showcase {
            margin-bottom: 4rem;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .feature-card {
            padding: 2rem;
          }
        }
      `}</style>
    </section>
  );
};

export default Product;
