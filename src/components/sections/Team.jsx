import React from "react";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

import AankshaImg from "../../../Photo/Aanksha.jpeg";
import OmImg from "../../../Photo/Om.jpeg";
import RohitImg from "../../../Photo/Rohit.jpeg";
import SanikaImg from "../../../Photo/sanika.png";
import VaishnavImg from "../../../Photo/Vaishnav.jpeg";

const team = [
  {
    name: "Vaishnav",
    role: "CEO & Co-Founder",
    subRole: "Developer",
    image: VaishnavImg,
    socials: {
      twitter: "#",
      linkedin: "https://www.linkedin.com/in/vaishnav-ghadge/",
      github: "https://github.com/ItsVaishnav",
    },
    color: "var(--accent-primary)",
  },
  {
    name: "Rohit",
    role: "CEO & Co-Founder",
    subRole: "Developer",
    image: RohitImg,
    socials: {
      twitter: "#",
      linkedin: "#",
      github: "https://github.com/Rohit4589",
    },
    color: "var(--accent-secondary)",
  },
  {
    name: "Sanika",
    role: "CEO & Co-Founder",
    subRole: "Developer",
    image: SanikaImg,
    socials: {
      twitter: "#",
      linkedin: "https://www.linkedin.com/in/sanika-bhosale-393781242/",
      github: "https://github.com/SanikaBhosale01",
    },
    color: "#ec4899",
  },
  {
    name: "Om",
    role: "CEO & Co-Founder",
    subRole: "Developer",
    image: OmImg,
    socials: {
      twitter: "#",
      linkedin: "https://www.linkedin.com/in/omkolekar27/",
      github: "https://github.com/OmKolekar",
    },
    color: "#10b981",
  },
  {
    name: "Aanksha",
    role: "CEO & Co-Founder",
    subRole: "Developer",
    image: AankshaImg,
    socials: {
      twitter: "#",
      linkedin: "https://www.linkedin.com/in/akanksha-pawashe/",
      github: "https://github.com/akanksha04codeit",
    },
    color: "#f59e0b",
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
  return (
    <section
      id="team"
      style={{ padding: "10rem 0", position: "relative", overflow: "hidden" }}
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
        <div style={{ textAlign: "center", marginBottom: "6rem" }}>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              color: "var(--accent-primary)",
              fontWeight: "700",
              letterSpacing: "0.4em",
              textTransform: "uppercase",
              fontSize: "0.75rem",
              display: "block",
              marginBottom: "1.2rem",
            }}
          >
            Visionaries
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-title"
          >
            Meet Our <span className="gradient-text">Leadership</span>
          </motion.h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: "3.5rem",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {team.map((member, index) => {
            // Determine grid placement
            let gridColumn = "span 2";
            if (index === 3) gridColumn = "2 / 4";
            if (index === 4) gridColumn = "4 / 6";

            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -15 }}
                style={{ 
                  gridColumn: gridColumn,
                  width: "100%", 
                  maxWidth: "380px",
                  justifySelf: "center"
                }}
              >
                <div
                  className="glass"
                  style={{
                    padding: "2.5rem",
                    borderRadius: "32px",
                    overflow: "hidden",
                    position: "relative",
                    transition: "border-color 0.3s ease",
                    border: "1px solid var(--glass-border)",
                    height: "100%"
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
                      aspectRatio: "1/1",
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

                  <h3
                    className="gradient-text"
                    style={{
                      fontSize: "2.2rem",
                      marginBottom: "0.4rem",
                      fontWeight: "800",
                      letterSpacing: "-0.03em",
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {member.name}
                  </h3>

                  <p
                    style={{
                      color: member.color,
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      marginBottom: "0.3rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                    }}
                  >
                    {member.role}
                  </p>

                  <p
                    style={{
                      color: "var(--text-secondary)",
                      fontWeight: 500,
                      fontSize: "0.85rem",
                      marginBottom: "2rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.2em",
                      opacity: 0.8,
                    }}
                  >
                    {member.subRole}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "1.5rem",
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
    </section>
  );
};

export default Team;
