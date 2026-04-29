import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { servicesData } from "../../data/servicesData";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const Services = () => {
  const navigate = useNavigate();

  return (
    <section
      id="services"
      style={{
        padding: "10rem 0",
        background: "transparent",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative Blobs */}
      <div
        className="blob"
        style={{ top: "10%", right: "-10%", opacity: 0.3, background: "radial-gradient(circle, var(--accent-primary) 0%, transparent 70%)" }}
      ></div>
      <div
        className="blob"
        style={{
          bottom: "10%",
          left: "-10%",
          opacity: 0.2,
          background:
            "radial-gradient(circle, var(--accent-secondary) 0%, transparent 70%)",
        }}
      ></div>

      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "clamp(3rem, 8vw, 6rem)" }}>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              color: "var(--accent-primary)",
              fontWeight: "700",
              letterSpacing: "0.4em",
              paddingLeft: "0.4em",
              textTransform: "uppercase",
              fontSize: "0.75rem",
              display: "block",
              marginBottom: "1.2rem",
            }}
          >
            Capabilities
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="section-title"
            style={{ marginBottom: "1.5rem" }}
          >
            Future-Ready <span className="gradient-text">Solutions</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            style={{
              color: "var(--text-secondary)",
              maxWidth: "700px",
              margin: "0 auto",
              fontSize: "clamp(1rem, 3vw, 1.2rem)",
              lineHeight: "1.8",
            }}
          >
            We combine strategic design with technical excellence to build products that redefine industries.
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 350px), 1fr))",
            gap: "2rem",
          }}
        >
          {servicesData.map((service, index) => (
            <motion.div
              key={service.id}
              variants={cardVariants}
              whileHover={{
                y: -15,
                transition: { duration: 0.4, ease: [0.33, 1, 0.68, 1] },
              }}
              className="glass"
              onClick={() => navigate(`/services/${service.id}`)}
              style={{
                padding: "3.5rem 2.5rem",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                border: "1px solid var(--glass-border)",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                background: "var(--glass-bg)",
                transition: "border-color 0.3s ease",
              }}
            >
              {/* Hover Background Glow */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `radial-gradient(circle at 100% 100%, ${service.color}15 0%, transparent 60%)`,
                  pointerEvents: "none",
                }}
              />

              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "22px",
                  background: `${service.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: service.color,
                  marginBottom: "2.5rem",
                  border: `1px solid ${service.color}30`,
                  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                }}
              >
                {service.icon}
              </motion.div>

              <h3
                style={{
                  fontSize: "1.8rem",
                  marginBottom: "1.2rem",
                  fontWeight: "700",
                  letterSpacing: "-0.02em",
                }}
              >
                {service.title}
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "1.05rem",
                  lineHeight: 1.8,
                  marginBottom: "2.5rem",
                  flexGrow: 1,
                }}
              >
                {service.desc}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.8rem",
                  color: service.color,
                  fontWeight: "700",
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Learn More 
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight size={18} />
                </motion.span>
              </div>

              {/* Bottom accent line that expands on hover */}
              <motion.div
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  height: "4px",
                  background: `linear-gradient(to right, ${service.color}, var(--accent-secondary))`,
                  transition: { duration: 0.4 },
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;

