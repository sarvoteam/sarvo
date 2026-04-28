import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { servicesData } from "../data/servicesData";

const ServiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const service = servicesData.find((s) => s.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!service) {
    return (
      <div
        className="container"
        style={{ paddingTop: "150px", textAlign: "center" }}
      >
        <h2>Service not found</h2>
        <Link
          to="/services"
          className="btn-primary"
          style={{ marginTop: "2rem" }}
        >
          Back to Services
        </Link>
      </div>
    );
  }

  return (
    <main style={{ paddingTop: "120px", minHeight: "100vh" }}>
      <div className="container">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/services")}
          style={{
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            marginBottom: "3rem",
            fontSize: "1rem",
            fontWeight: "600",
          }}
        >
          <ArrowLeft size={20} /> Back to Services
        </motion.button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "5rem",
            alignItems: "center",
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "24px",
                background: `${service.color}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: service.color,
                marginBottom: "2rem",
                border: `1px solid ${service.color}40`,
              }}
            >
              {service.icon}
            </motion.div>

            <h1
              style={{
                fontSize: "4rem",
                marginBottom: "1.5rem",
                lineHeight: "1.1",
              }}
            >
              {service.title.split(" ")[0]} <br />
              <span className="gradient-text">
                {service.title.split(" ").slice(1).join(" ")}
              </span>
            </h1>

            <p
              style={{
                fontSize: "1.25rem",
                color: "var(--text-secondary)",
                lineHeight: "1.8",
                marginBottom: "2.5rem",
              }}
            >
              {service.longDesc}
            </p>

            <div
              style={{ display: "grid", gap: "1.2rem", marginBottom: "3rem" }}
            >
              {service.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  style={{ display: "flex", alignItems: "center", gap: "1rem" }}
                >
                  <CheckCircle2 size={22} style={{ color: service.color }} />
                  <span style={{ fontSize: "1.1rem", fontWeight: "500" }}>
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>

            <button className="btn-primary">
              Get Started with {service.title.split(" ")[0]}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="glass"
            style={{
              height: '500px',
              width: '100%',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `radial-gradient(circle at center, ${service.color}10 0%, transparent 70%)`
            }}
          >
            <motion.img
              src={service.image}
              alt={service.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.8,
                mixBlendMode: 'lighten'
              }}
            />
            
            {/* Overlay Gradient for depth */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: `linear-gradient(to bottom, transparent 60%, var(--bg-dark) 100%), 
                           radial-gradient(circle at center, transparent 30%, var(--bg-dark) 100%)`,
              pointerEvents: 'none'
            }} />

            {/* Abstract Decorative Elements */}
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              style={{
                position: 'absolute',
                width: '180%',
                height: '180%',
                border: `1px dashed ${service.color}15`,
                borderRadius: '45%',
                zIndex: 1,
                pointerEvents: 'none'
              }}
            />
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default ServiceDetailPage;
