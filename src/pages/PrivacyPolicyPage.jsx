import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Database, Lock, Globe, Server } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const sections = [
    {
      icon: <Eye size={24} />,
      title: "Data Acquisition & Collection",
      content: "We acquire data provided directly by users during registration, subscription, or inquiry workflows. This includes, but is not limited to, full names, institutional affiliations, contact details, and payment verification references."
    },
    {
      icon: <Database size={24} />,
      title: "Data Utilization & Processing",
      content: "Acquired details are processed exclusively to manage event registrations, facilitate transaction reconciliations, dispatch official administrative notifications (such as login credentials and schedules), and optimize user experience across our digital suite."
    },
    {
      icon: <Lock size={24} />,
      title: "Transaction Security & Protocol",
      content: "All financial transactions are conducted securely through Razorpay. We do not store card details, UPI credentials, or online banking passwords on our servers. All transaction data is processed in compliance with industry-standard PCI-DSS protocols."
    },
    {
      icon: <Server size={24} />,
      title: "Information Retention & Safeguards",
      content: "Personal records are retained only for the duration required to deliver services, comply with regulatory requirements, and resolve operational disputes. All data is housed within secure, encrypted database environments."
    },
    {
      icon: <Shield size={24} />,
      title: "User Rights & Data Governance",
      content: "Users possess the right to request access, correction, or deletion of their personal information. To initiate a query regarding your records, please contact our privacy compliance desk at sarvoprime@gmail.com."
    },
    {
      icon: <Globe size={24} />,
      title: "Telemetry & Cookie Policy",
      content: "We utilize session cookies and local cache storage to secure user authentication and analyze general traffic analytics. Users may adjust their browser preferences to disable telemetry cookies, though this may restrict portal features."
    }
  ];

  return (
    <main style={{ paddingBottom: '80px' }}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', top: '10%', left: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: -1 }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: -1 }} />

      <div className="container" style={{ marginTop: '4rem' }}>
        {/* Header Block */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.5rem 1.2rem', borderRadius: '100px', marginBottom: '1.5rem' }}>
            <Shield size={16} color="#10b981" />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#10b981' }}>Compliance & Safety</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '1rem', lineHeight: 1.1 }}>
            Privacy <span className="gradient-text">Policy</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Last updated: June 30, 2026. This policy outlines how SARVO PRIME collects, uses, and safeguards your personal information when using our platforms.
          </p>
        </motion.div>

        {/* Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="glass"
              style={{
                padding: '2.5rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.2rem',
                background: 'var(--stats-card-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '24px',
                transition: 'transform 0.3s ease'
              }}
              whileHover={{ y: -8, borderColor: 'rgba(79,70,229,0.3)' }}
            >
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(14, 165, 233, 0.1))',
                border: '1px solid rgba(79, 70, 229, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)'
              }}>
                {section.icon}
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{section.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Contact info footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            marginTop: '4rem',
            textAlign: 'center',
            padding: '2.5rem',
            borderRadius: '24px',
            background: 'var(--stats-card-bg)',
            border: '1px solid var(--glass-border)'
          }}
        >
          <h4 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem' }}>Questions or concerns?</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            If you have questions regarding this policy or our data practices, write to us directly.
          </p>
          <a href="mailto:sarvoprime@gmail.com" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'white',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            padding: '0.8rem 1.8rem',
            borderRadius: '100px',
            fontWeight: 700,
            textDecoration: 'none'
          }}>
            Contact Privacy Support
          </a>
        </motion.div>
      </div>
    </main>
  );
};

export default PrivacyPolicyPage;
