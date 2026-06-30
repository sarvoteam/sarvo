import React from "react";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

import AankshaImg from "../../../Photo/Aanksha.jpeg";
import OmImg from "../../../Photo/Om.jpeg";
import RohitImg from "../../../Photo/RohitImg.jpeg";
import SanikaImg from "../../../Photo/sanika.png";
import VaishnavImg from "../../../Photo/Vaishnav.jpeg";

const team = [
  {
    name: "Sanika",
    roles: ["CTO", "Co-Founder"],
    image: SanikaImg,
    socials: {
      twitter: "#",
      linkedin: "https://www.linkedin.com/in/sanika-bhosale-393781242/",
      github: "https://github.com/SanikaBhosale01",
    },
    color: "#ec4899",
  },
  {
    name: "Aanksha",
    roles: ["CMO", "Co-Founder"],
    image: AankshaImg,
    socials: {
      twitter: "#",
      linkedin: "https://www.linkedin.com/in/akanksha-pawashe/",
      github: "https://github.com/akanksha04codeit",
    },
    color: "#f59e0b",
  },
  {
    name: "Rohit",
    roles: ["COO", " CHRO", "Co-Founder"],
    image: RohitImg,
    socials: {
      twitter: "#",
      linkedin: "https://www.linkedin.com/in/rohit-ghanghav6633",
      github: "https://github.com/Rohit4589",
    },
    color: "var(--accent-secondary)",
  },
  {
    name: "Vaishnav",
    roles: ["CPO", "Co-Founder"],
    image: VaishnavImg,
    socials: {
      twitter: "#",
      linkedin: "https://www.linkedin.com/in/vaishnav-ghadge",
      github: "https://github.com/ItsVaishnav",
    },
    color: "var(--accent-primary)",
  },
  {
    name: "Om",
    roles: ["CBO", " CFO", "Co-Founder"],
    image: OmImg,
    socials: {
      twitter: "#",
      linkedin: "https://www.linkedin.com/in/omkolekar27/",
      github: "https://github.com/OmKolekar",
    },
    color: "#10b981",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const Team = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <section
      id="team"
      style={{ padding: "1.5rem 0 4rem", position: "relative", overflow: "hidden" }}
    >
      {/* Decorative Blobs */}
      <div
        className="blob"
        style={{ top: "20%", left: "-10%", opacity: 0.15 }}
      ></div>
      <div
        className="blob"
        style={{
          bottom: "10%",
          right: "-10%",
          opacity: 0.1,
          background:
            "radial-gradient(circle, var(--accent-secondary) 0%, transparent 70%)",
        }}
      ></div>

      <div className="container">
        {/* Full-bleed heading strip */}
        <div style={{
          margin: "0 calc(-50vw + 50%)",
          padding: "2rem calc(50vw - 50% + 2rem)",
          background: "linear-gradient(135deg, #26174d 0%, #3a2467 50%, #4f2f8b 100%)",
          borderTop: "1px solid rgba(255, 255, 255, 0.15)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(16px)",
          marginBottom: "3rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 10px 40px -10px rgba(79, 70, 229, 0.35), inset 0 0 20px rgba(255, 255, 255, 0.05)"
        }}>
          {/* Blurred circles for subtle glow */}
          <div style={{ position: 'absolute', top: '-30px', left: '25%', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(168, 85, 247, 0.35)', filter: 'blur(35px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-30px', right: '25%', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.25)', filter: 'blur(35px)', pointerEvents: 'none' }} />

          {/* Top Decorative Line */}
          <div style={{ 
            height: '1px', 
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.2) 80%, transparent)', 
            width: '60%', 
            margin: '0 auto 1.2rem' 
          }} />

          {/* Tagline */}
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 800, 
            textTransform: 'uppercase', 
            letterSpacing: '0.35em', 
            color: 'rgba(255,255,255,0.85)', 
            display: 'block', 
            marginBottom: '0.5rem',
            fontFamily: "'Outfit', 'Inter', sans-serif"
          }}>
            ✦ OUR LEADERSHIP ✦
          </span>

          {/* Cursive Subtitle */}
          <p style={{
            fontFamily: "'Caveat', cursive",
            fontSize: '2.5rem',
            color: 'rgba(255, 255, 255, 0.95)',
            letterSpacing: '0.02em',
            margin: '0.5rem 0 1.2rem',
            fontWeight: 700,
            lineHeight: 1.4,
            textShadow: "0 0 15px rgba(255,255,255,0.4), 0 0 30px rgba(168,85,247,0.3)"
          }}>
            Meet the Visionaries Behind SARVO PRIME
          </p>

          {/* Bottom Decorative Line */}
          <div style={{ 
            height: '1px', 
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2) 20%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.2) 80%, transparent)', 
            width: '60%', 
            margin: '0 auto' 
          }} />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="team-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "1rem",
            maxWidth: "100%",
            margin: "0 auto",
          }}
        >
          {team.map((member, index) => {
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -15 }}
                style={{
                  width: "100%",
                }}
              >
                <div
                  className="glass"
                  style={{
                    padding: "1.8rem",
                    borderRadius: "28px",
                    overflow: "hidden",
                    position: "relative",
                    transition: "border-color 0.3s ease",
                    border: "1px solid var(--glass-border)",
                    height: "100%",
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {/* Glow Effect on Hover */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `radial-gradient(circle at 50% 0%, ${member.color}20 0%, transparent 70%)`,
                      pointerEvents: "none",
                    }}
                  />

                  <div
                    style={{
                      position: "relative",
                      marginBottom: "2rem",
                      borderRadius: "24px",
                      overflow: "hidden",
                      aspectRatio: "3/4",
                    }}
                  >
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      src={member.image}
                      alt={member.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />

                    {/* Image Overlay */}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 100%)`,
                        pointerEvents: "none",
                      }}
                    />
                  </div>

                  {/* Name with full-bleed bg strip (Blue/Indigo Shade) */}
                  <div style={{
                    margin: "0.5rem -1.8rem",
                    padding: "0.6rem 1.8rem",
                    background: isDark
                      ? "linear-gradient(90deg, rgba(30, 58, 138, 0.35) 0%, rgba(30, 58, 138, 0.1) 100%)"
                      : "linear-gradient(90deg, rgba(30, 58, 138, 0.08) 0%, rgba(30, 58, 138, 0.02) 100%)",
                    borderLeft: isDark ? "3px solid #6366f1" : "3px solid #1e3a8a",
                    marginBottom: "0.75rem",
                  }}>
                    <h3
                      style={{
                        fontSize: "1.25rem",
                        margin: 0,
                        fontWeight: 700,
                        letterSpacing: "0.04em",
                        fontFamily: "Georgia, 'Times New Roman', serif",
                        lineHeight: 1.2,
                        textAlign: "center",
                        color: isDark ? "#c7d2fe" : "#1e3a8a",
                      }}
                    >
                      {member.name}
                    </h3>
                  </div>

                  {/* Role labels container (Purple/Violet Shade) */}
                  <div style={{
                    margin: "0.5rem -1.8rem",
                    padding: "0.6rem 1.8rem",
                    background: isDark
                      ? "linear-gradient(90deg, rgba(88, 28, 135, 0.35) 0%, rgba(88, 28, 135, 0.1) 100%)"
                      : "linear-gradient(90deg, rgba(120, 53, 191, 0.08) 0%, rgba(120, 53, 191, 0.02) 100%)",
                    borderLeft: isDark ? "3px solid #a855f7" : "3px solid #6b21a8",
                    textAlign: "center",
                    marginBottom: "0.75rem",
                    minHeight: "3rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}>
                    {/* Title roles — bold strong, comma-separated */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0", flexWrap: "nowrap" }}>
                      {member.roles.slice(0, -1).map((r, i) => (
                        <span key={i} style={{
                          color: isDark ? "#e9d5ff" : "#581c87",
                          fontWeight: 800,
                          fontSize: "0.78rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.12em",
                          fontFamily: "'Outfit', 'Inter', sans-serif",
                          whiteSpace: "nowrap",
                        }}>
                          {r}{i < member.roles.length - 2 ? ", " : ""}
                        </span>
                      ))}
                    </div>
                    {/* Co-Founder — strong, theme-aware */}
                    <span style={{
                      color: isDark ? "#c084fc" : "#7e22ce",
                      fontWeight: 700,
                      fontSize: "0.64rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.18em",
                      fontFamily: "'Inter', sans-serif",
                      whiteSpace: "nowrap",
                    }}>
                      {member.roles[member.roles.length - 1]}
                    </span>
                  </div>

                  {/* Thin separator above socials */}
                  <div style={{ height: "1px", background: "var(--glass-border)", marginBottom: "1.2rem" }} />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "1.5rem",
                      marginTop: 'auto'
                    }}
                  >
                    {[
                      {
                        icon: <FaTwitter />,
                        link: member.socials.twitter,
                        delay: 0.1,
                      },
                      {
                        icon: <FaLinkedin />,
                        link: member.socials.linkedin,
                        delay: 0.2,
                      },
                      {
                        icon: <FaGithub />,
                        link: member.socials.github,
                        delay: 0.3,
                      },
                    ].map((social, i) => (
                      <motion.a
                        key={i}
                        whileHover={{ scale: 1.2, color: member.color, y: -5 }}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + social.delay }}
                        href={social.link}
                        style={{
                          color: "var(--text-secondary)",
                          fontSize: "1.3rem",
                          transition: "color 0.3s ease",
                        }}
                      >
                        {social.icon}
                      </motion.a>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #team {
            padding: 5rem 0 !important;
          }
          .team-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Team;
