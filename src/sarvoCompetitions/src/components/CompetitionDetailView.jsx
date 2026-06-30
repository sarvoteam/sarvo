import React, { useState } from 'react';
import { ArrowLeft, Calendar, Award, BookOpen, ShieldCheck, Check, CreditCard, Sparkles, User, Users, Mail, Phone, MapPin, GraduationCap, CheckCircle } from 'lucide-react';
import { paymentApi } from '../../../sarvo people/src/apis/paymentApi';
import { loadRazorpayScript } from '../../../sarvo people/src/utils/razorpayLoader';

const CompetitionDetailView = ({ competition, onBack }) => {
  const { id: competitionId, title, description, detailed_description, start_date, end_date, status, prize_pool, rules, eligibility } = competition;

  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    studentPhone: '',
    dob: '',
    gender: '',
    collegeName: '',
    course: '',
    branch: '',
    graduationYear: '',
    city: '',
    state: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState('idle'); // 'idle' | 'creating-order' | 'awaiting-payment' | 'verifying' | 'success'

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Convert newline-separated string to bulleted array
  const getListItems = (text) => {
    if (!text) return [];
    return text.split('\n').map(item => item.trim()).filter(item => item.length > 0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setFormError('');

    const { studentName, studentEmail } = formData;
    if (!studentName.trim() || !studentEmail.trim()) {
      setFormError('Name and Email are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const feeInPaise = parseInt(competition.registration_fee || 0, 10);
      const submissionData = {
        ...formData,
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim().toLowerCase(),
        competitionId,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear, 10) : null
      };

      if (feeInPaise === 0) {
        // Free Competition: direct registration
        setPaymentStep('verifying');
        await paymentApi.registerFree(submissionData);
        setPaymentStep('success');
        setIsSubmitting(false);
      } else {
        // Paid Competition: Razorpay flow
        setPaymentStep('creating-order');
        await loadRazorpayScript();

        const order = await paymentApi.createOrder(
          competitionId,
          studentName,
          studentEmail
        );

        if (order.free) {
          setPaymentStep('verifying');
          await paymentApi.registerFree(submissionData);
          setPaymentStep('success');
          setIsSubmitting(false);
          return;
        }

        setPaymentStep('awaiting-payment');
        setIsSubmitting(false); // Let user interact with Razorpay modal

        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Sarvo Campus',
          description: `Registration: ${title}`,
          order_id: order.orderId,
          prefill: {
            name: studentName,
            email: studentEmail,
            contact: formData.studentPhone || '',
          },
          theme: { color: '#f59e0b' },
          modal: {
            ondismiss: () => {
              setPaymentStep('idle');
              setFormError('Payment was cancelled. Please try again to complete registration.');
            },
          },
          handler: async (razorpayResponse) => {
            setIsSubmitting(true);
            setPaymentStep('verifying');
            try {
              await paymentApi.verifyAndRegister({
                ...submissionData,
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
              });
              setPaymentStep('success');
              setIsSubmitting(false);
            } catch (verifyErr) {
              setFormError(verifyErr.message || 'Payment verification failed. Contact support with your payment ID.');
              setPaymentStep('idle');
              setIsSubmitting(false);
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      setFormError(err.message || 'An error occurred. Please try again.');
      setPaymentStep('idle');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="comps-container">
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className="detail-nav">
        <button className="back-to-comps" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Competitions
        </button>
      </div>

      <article className="comp-detail">
        <div className="detail-header">
          <div className="detail-title-block">
            <h1>{title}</h1>
            <div className="detail-meta">
              <span className={`status-badge ${status}`}>
                {status === 'active' ? 'Active / Running' : 'Completed'}
              </span>
              <div className="detail-meta-dot" />
              <span>
                <Calendar size={14} style={{ marginRight: '4px' }} />
                Timeline: {formatDate(start_date)} - {formatDate(end_date)}
              </span>
              <div className="detail-meta-dot" />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary-luxury)' }}>
                <Users size={14} style={{ marginRight: '4px', color: '#38bdf8' }} />
                <strong>{competition.registration_count || 0} Registered</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Prize Cards Row (placed below title header) */}
        {prize_pool && (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'flex-start', width: '100%', marginBottom: '2.5rem' }}>
            {(() => {
              try {
                const parsed = JSON.parse(prize_pool);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  const cardThemes = [
                    { // Gold / 1st
                      tag: '#f59e0b',
                      bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.07), rgba(245, 158, 11, 0.02))',
                      badge: 'rgba(245, 158, 11, 0.09)',
                      border: 'rgba(245, 158, 11, 0.25)',
                      glow: 'rgba(245, 158, 11, 0.06)'
                    },
                    { // Silver / 2nd
                      tag: '#3b82f6',
                      bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.07), rgba(59, 130, 246, 0.02))',
                      badge: 'rgba(59, 130, 246, 0.09)',
                      border: 'rgba(59, 130, 246, 0.25)',
                      glow: 'rgba(59, 130, 246, 0.06)'
                    },
                    { // Bronze / 3rd
                      tag: '#ea580c',
                      bg: 'linear-gradient(135deg, rgba(234, 88, 12, 0.07), rgba(234, 88, 12, 0.02))',
                      badge: 'rgba(234, 88, 12, 0.09)',
                      border: 'rgba(234, 88, 12, 0.25)',
                      glow: 'rgba(234, 88, 12, 0.06)'
                    },
                    { // Purple / 4th+
                      tag: '#8b5cf6',
                      bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.07), rgba(139, 92, 246, 0.02))',
                      badge: 'rgba(139, 92, 246, 0.09)',
                      border: 'rgba(139, 92, 246, 0.25)',
                      glow: 'rgba(139, 92, 246, 0.06)'
                    }
                  ];

                  return parsed.map((p, idx) => {
                    const theme = cardThemes[idx] || cardThemes[3];
                    return (
                      <div key={idx} style={{
                        padding: '16px 20px',
                        background: theme.bg,
                        borderRadius: '16px',
                        border: `1px solid ${theme.border}`,
                        boxShadow: `0 8px 16px ${theme.glow}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        minWidth: '200px',
                        flex: '1 1 calc(25% - 16px)',
                        maxWidth: '280px',
                        alignItems: 'flex-start',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = `0 12px 24px ${theme.glow}`;
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = `0 8px 16px ${theme.glow}`;
                      }}
                      >
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          color: theme.tag,
                          background: theme.badge,
                          padding: '4px 10px',
                          borderRadius: '100px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          🏆 {p.rank}
                        </span>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          color: 'var(--text-main)',
                          lineHeight: 1.45
                        }}>
                          {p.reward}
                        </div>
                      </div>
                    );
                  });
                }
              } catch (e) {}
              return (
                <div className="detail-prize-card">
                  <span className="detail-prize-card-label">Prize Pool</span>
                  <span className="detail-prize-card-value">🏆 {prize_pool}</span>
                </div>
              );
            })()}
          </div>
        )}

        {/* About Section */}
        <section className="detail-section" style={{ marginTop: '2.5rem' }}>
          <h2><BookOpen size={20} /> About the Competition</h2>
          <p>{detailed_description || description}</p>
        </section>

        {/* Eligibility Section */}
        {eligibility && (
          <section className="detail-section">
            <h2><ShieldCheck size={20} /> Eligibility Criteria</h2>
            <ul className="detail-list">
              {getListItems(eligibility).map((item, idx) => (
                <li key={idx}>
                  <Check size={16} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Rules & Guidelines */}
        {rules && (
          <section className="detail-section">
            <h2><Award size={20} /> Rules & Guidelines</h2>
            <ul className="detail-list">
              {getListItems(rules).map((item, idx) => (
                <li key={idx}>
                  <Check size={16} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Student Registration Form Section */}
        {status === 'active' && (
          <section className="detail-section registration-section" style={{
            marginTop: '3.5rem',
            background: 'var(--card-bg-luxury)',
            border: '1px solid var(--glass-border-luxury)',
            borderRadius: '24px',
            padding: '2.5rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            position: 'relative'
          }}>
            <h2 style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--text-primary-luxury)',
              margin: '0 0 8px 0'
            }}>
              <Sparkles size={24} style={{ color: 'var(--comps-accent)' }} />
              Register for this Challenge
            </h2>
            <p style={{ color: 'var(--text-secondary-luxury)', fontSize: '0.95rem', margin: '0 0 2rem 0' }}>
              Fill in your details below to register. If you do not have an account, a student portal login account will be automatically created for you, and credentials will be sent to your email.
            </p>

            {/* Fee badge */}
            {parseInt(competition.registration_fee || 0, 10) > 0 ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                padding: '8px 16px',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#3b82f6',
                marginBottom: '2rem'
              }}>
                <CreditCard size={16} />
                Registration Fee: ₹{Math.round(competition.registration_fee / 100)}
              </div>
            ) : (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '12px',
                padding: '8px 16px',
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'var(--comps-success)',
                marginBottom: '2rem'
              }}>
                <CheckCircle size={16} />
                Free Registration
              </div>
            )}

            {formError && (
              <div style={{
                backgroundColor: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.25)',
                color: 'var(--comps-danger)',
                padding: '14px 18px',
                borderRadius: '12px',
                fontSize: '0.9rem',
                marginBottom: '2rem',
                fontWeight: 500
              }}>
                {formError}
              </div>
            )}

            {paymentStep === 'success' ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem 2rem',
                background: 'rgba(16, 185, 129, 0.04)',
                border: '1.5px dashed rgba(16, 185, 129, 0.4)',
                borderRadius: '20px'
              }}>
                <div style={{
                  display: 'inline-flex',
                  padding: '16px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: 'var(--comps-success)',
                  marginBottom: '1.5rem'
                }}>
                  <CheckCircle size={44} style={{ color: 'var(--comps-success)' }} />
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--text-primary-luxury)' }}>
                  Registration Successful!
                </h3>
                <p style={{ color: 'var(--text-secondary-luxury)', fontSize: '1rem', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto 1.5rem' }}>
                  Your seat for <strong>{title}</strong> has been secured. We have sent a confirmation email to <strong>{formData.studentEmail}</strong>.
                </p>
                <p style={{ color: 'var(--comps-accent)', fontSize: '0.95rem', fontWeight: 600, maxWidth: '520px', margin: '0 auto' }}>
                  Please check your inbox (and spam folder) for your welcome credentials and temporary password to log in to the SARVO Student Portal!
                </p>
              </div>
            ) : (
              <form onSubmit={handleEnroll}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                  marginBottom: '2.5rem'
                }}>
                  {/* Student Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary-luxury)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Full Name *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary-luxury)' }} />
                      <input
                        type="text"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                        disabled={isSubmitting}
                        style={{
                          width: '100%',
                          padding: '12px 14px 12px 42px',
                          borderRadius: '12px',
                          border: '1px solid var(--glass-border-luxury)',
                          background: 'var(--card-bg-luxury)',
                          color: 'var(--text-primary-luxury)',
                          outline: 'none',
                          fontSize: '0.95rem',
                          fontFamily: 'inherit',
                          transition: 'border-color 0.2s'
                        }}
                      />
                    </div>
                  </div>

                  {/* Student Email */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary-luxury)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Email Address *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary-luxury)' }} />
                      <input
                        type="email"
                        name="studentEmail"
                        value={formData.studentEmail}
                        onChange={handleInputChange}
                        placeholder="name@example.com"
                        required
                        disabled={isSubmitting}
                        style={{
                          width: '100%',
                          padding: '12px 14px 12px 42px',
                          borderRadius: '12px',
                          border: '1px solid var(--glass-border-luxury)',
                          background: 'var(--card-bg-luxury)',
                          color: 'var(--text-primary-luxury)',
                          outline: 'none',
                          fontSize: '0.95rem',
                          fontFamily: 'inherit',
                          transition: 'border-color 0.2s'
                        }}
                      />
                    </div>
                  </div>

                  {/* Phone number */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary-luxury)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Phone Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary-luxury)' }} />
                      <input
                        type="tel"
                        name="studentPhone"
                        value={formData.studentPhone}
                        onChange={handleInputChange}
                        placeholder="e.g. 9876543210"
                        disabled={isSubmitting}
                        style={{
                          width: '100%',
                          padding: '12px 14px 12px 42px',
                          borderRadius: '12px',
                          border: '1px solid var(--glass-border-luxury)',
                          background: 'var(--card-bg-luxury)',
                          color: 'var(--text-primary-luxury)',
                          outline: 'none',
                          fontSize: '0.95rem',
                          fontFamily: 'inherit',
                          transition: 'border-color 0.2s'
                        }}
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary-luxury)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        borderRadius: '12px',
                        border: '1px solid var(--glass-border-luxury)',
                        background: 'var(--card-bg-luxury)',
                        color: 'var(--text-primary-luxury)',
                        outline: 'none',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.2s'
                      }}
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary-luxury)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid var(--glass-border-luxury)',
                        background: 'var(--card-bg-luxury)',
                        color: 'var(--text-primary-luxury)',
                        outline: 'none',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.2s'
                      }}
                    >
                      <option value="" style={{ background: '#1e293b' }}>Select Gender</option>
                      <option value="Male" style={{ background: '#1e293b' }}>Male</option>
                      <option value="Female" style={{ background: '#1e293b' }}>Female</option>
                      <option value="Other" style={{ background: '#1e293b' }}>Other</option>
                      <option value="Prefer not to say" style={{ background: '#1e293b' }}>Prefer not to say</option>
                    </select>
                  </div>

                  {/* College Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary-luxury)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      College / University
                    </label>
                    <div style={{ position: 'relative' }}>
                      <GraduationCap size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary-luxury)' }} />
                      <input
                        type="text"
                        name="collegeName"
                        value={formData.collegeName}
                        onChange={handleInputChange}
                        placeholder="Enter college name"
                        disabled={isSubmitting}
                        style={{
                          width: '100%',
                          padding: '12px 14px 12px 42px',
                          borderRadius: '12px',
                          border: '1px solid var(--glass-border-luxury)',
                          background: 'var(--card-bg-luxury)',
                          color: 'var(--text-primary-luxury)',
                          outline: 'none',
                          fontSize: '0.95rem',
                          fontFamily: 'inherit',
                          transition: 'border-color 0.2s'
                        }}
                      />
                    </div>
                  </div>

                  {/* Course */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary-luxury)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Course / Degree
                    </label>
                    <input
                      type="text"
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      placeholder="e.g. B.Tech, MCA"
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid var(--glass-border-luxury)',
                        background: 'var(--card-bg-luxury)',
                        color: 'var(--text-primary-luxury)',
                        outline: 'none',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.2s'
                      }}
                    />
                  </div>

                  {/* Branch */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary-luxury)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Branch / Specialization
                    </label>
                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleInputChange}
                      placeholder="e.g. Computer Science"
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid var(--glass-border-luxury)',
                        background: 'var(--card-bg-luxury)',
                        color: 'var(--text-primary-luxury)',
                        outline: 'none',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.2s'
                      }}
                    />
                  </div>

                  {/* Graduation Year */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary-luxury)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Graduation Year
                    </label>
                    <input
                      type="number"
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleInputChange}
                      placeholder="e.g. 2026"
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid var(--glass-border-luxury)',
                        background: 'var(--card-bg-luxury)',
                        color: 'var(--text-primary-luxury)',
                        outline: 'none',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.2s'
                      }}
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary-luxury)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      City
                    </label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary-luxury)' }} />
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter your city"
                        disabled={isSubmitting}
                        style={{
                          width: '100%',
                          padding: '12px 14px 12px 42px',
                          borderRadius: '12px',
                          border: '1px solid var(--glass-border-luxury)',
                          background: 'var(--card-bg-luxury)',
                          color: 'var(--text-primary-luxury)',
                          outline: 'none',
                          fontSize: '0.95rem',
                          fontFamily: 'inherit',
                          transition: 'border-color 0.2s'
                        }}
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary-luxury)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Enter your state"
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid var(--glass-border-luxury)',
                        background: 'var(--card-bg-luxury)',
                        color: 'var(--text-primary-luxury)',
                        outline: 'none',
                        fontSize: '0.95rem',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.2s'
                      }}
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      background: isSubmitting ? '#475569' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '14px',
                      padding: '14px 40px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 8px 24px rgba(217, 119, 6, 0.2)'
                    }}
                    onMouseOver={(e) => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(217, 119, 6, 0.3)'; } }}
                    onMouseOut={(e) => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(217, 119, 6, 0.2)'; } }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="comps-loader" style={{
                          display: 'inline-block',
                          width: '16px',
                          height: '16px',
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTopColor: '#ffffff',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          marginRight: '6px'
                        }}></span>
                        {paymentStep === 'creating-order' && 'Creating Order...'}
                        {paymentStep === 'awaiting-payment' && 'Awaiting Payment...'}
                        {paymentStep === 'verifying' && 'Verifying Registration...'}
                        {!['creating-order', 'awaiting-payment', 'verifying'].includes(paymentStep) && 'Processing...'}
                      </>
                    ) : (
                      <>
                        {parseInt(competition.registration_fee || 0, 10) > 0 ? 'Proceed to Payment & Register' : 'Register Now'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </section>
        )}
      </article>
    </div>
  );
};

export default CompetitionDetailView;
