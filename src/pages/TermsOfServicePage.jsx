import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Award, CreditCard, Scale, AlertTriangle, HelpCircle } from 'lucide-react';

const TermsOfServicePage = () => {
  const clauses = [
    {
      icon: <FileText size={24} />,
      title: "Acceptance of Terms",
      content: "By accessing, browsing, or utilizing the digital portals, platforms, and services offered by SARVO PRIME, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, you must cease use of our services immediately."
    },
    {
      icon: <Award size={24} />,
      title: "Event Participation & Registration",
      content: "Participation in our professional and academic events is subject to the eligibility criteria specified in individual event documentation. Registrants are required to submit accurate, current, and verified credentials. Duplicate submissions or entries using identical contact information may be subject to review or cancellation."
    },
    {
      icon: <CreditCard size={24} />,
      title: "Financial Terms & Refund Policy",
      content: "Participation fees must be processed in full via our authorized payment channels prior to admission confirmation. All transactions are final; registration fees are non-refundable and non-transferable except under circumstances where an event is permanently cancelled by SARVO PRIME."
    },
    {
      icon: <Scale size={24} />,
      title: "Proprietary Rights & Intellectual Property",
      content: "All proprietary materials, including source code, systems architecture, digital interfaces, trademarks, and content hosted on our platforms remain the exclusive intellectual property of SARVO PRIME. Unauthorized reproduction, distribution, or reverse engineering is strictly prohibited."
    },
    {
      icon: <AlertTriangle size={24} />,
      title: "Limitation of Liability",
      content: "SARVO PRIME provides its platforms on an 'as-is' basis without warranties of any kind. Under no circumstances shall SARVO PRIME be held liable for any direct, indirect, incidental, or consequential damages arising from network disruptions, third-party payment gateways, or event participation."
    },
    {
      icon: <HelpCircle size={24} />,
      title: "Account Governance & Termination",
      content: "We reserve the right to suspend, limit, or terminate user credentials and access to our administrative portals at our sole discretion, without prior notice, in instances of policy violations, security breaches, or behavior detrimental to portal operations."
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.3)', padding: '0.5rem 1.2rem', borderRadius: '100px', marginBottom: '1.5rem' }}>
            <Scale size={16} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-primary)' }}>Legal Agreement</span>
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '1rem', lineHeight: 1.1 }}>
            Terms of <span className="gradient-text">Service</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Last updated: June 30, 2026. Please read these terms carefully before accessing our portals or registering for any competitive events.
          </p>
        </motion.div>

        {/* Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {clauses.map((clause, idx) => (
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
                {clause.icon}
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800 }}>{clause.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
                {clause.content}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Legal Agreement Acceptance Footer */}
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
          <h4 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem' }}>Governing Law</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
            These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the courts located in Pune, Maharashtra.
          </p>
          <a href="mailto:sarvoteam@gmail.com" style={{
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
            Contact Legal Desk
          </a>
        </motion.div>
      </div>
    </main>
  );
};

export default TermsOfServicePage;
