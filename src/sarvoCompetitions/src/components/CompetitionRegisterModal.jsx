import React, { useState } from 'react';
import { X, Sparkles, User, Mail, Phone, MapPin, GraduationCap, CheckCircle, CreditCard } from 'lucide-react';
import { paymentApi } from '../../../sarvo people/src/apis/paymentApi';
import { loadRazorpayScript } from '../../../sarvo people/src/utils/razorpayLoader';

const CompetitionRegisterModal = ({ competition, onClose }) => {
  const { id: competitionId, title, registration_fee } = competition;

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
      const feeInPaise = parseInt(registration_fee || 0, 10);
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
          studentEmail,
          formData.studentPhone
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

  // Premium Frosted White style objects
  const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--modal-text-secondary)',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px 10px 36px',
    borderRadius: '10px',
    border: '1px solid var(--modal-input-border)',
    background: 'var(--modal-input-bg)',
    color: 'var(--modal-text-primary)',
    outline: 'none',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s'
  };

  const inputNoIconStyle = {
    ...inputStyle,
    padding: '10px 12px'
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'var(--modal-overlay-bg)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      padding: '20px'
    }}>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <div className="modal-card" style={{
        background: 'var(--modal-bg)',
        border: '1px solid var(--modal-border)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '680px',
        padding: '30px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'var(--modal-input-bg)',
            border: '1px solid var(--modal-border)',
            color: 'var(--modal-text-secondary)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--modal-input-border)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--modal-input-bg)'}
        >
          <X size={18} />
        </button>

        <h2 style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '1.5rem',
          fontWeight: 800,
          color: 'var(--modal-text-primary)',
          margin: '0 0 6px 0',
          paddingRight: '40px'
        }}>
          <Sparkles size={22} style={{ color: 'var(--comps-accent, #fbbf24)' }} />
          Register: {title}
        </h2>
        <p style={{ color: 'var(--modal-text-secondary)', fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>
          Enter your information below to register. A student login account will be automatically created and emailed to you.
        </p>

        {/* Fee Badge */}
        {parseInt(registration_fee || 0, 10) > 0 ? (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '10px',
            padding: '6px 14px',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#2563eb',
            marginBottom: '1.5rem'
          }}>
            <CreditCard size={14} />
            Registration Fee: ₹{Math.round(registration_fee / 100)}
          </div>
        ) : (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '10px',
            padding: '6px 14px',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#059669',
            marginBottom: '1.5rem'
          }}>
            <CheckCircle size={14} />
            Free Registration
          </div>
        )}

        {formError && (
          <div style={{
            backgroundColor: 'rgba(220, 38, 38, 0.08)',
            border: '1px solid rgba(220, 38, 38, 0.2)',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '1.5rem',
            fontWeight: 500
          }}>
            {formError}
          </div>
        )}

        {paymentStep === 'success' ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem 1.5rem',
            background: 'rgba(16, 185, 129, 0.02)',
            border: '1px dashed rgba(16, 185, 129, 0.25)',
            borderRadius: '16px'
          }}>
            <div style={{
              display: 'inline-flex',
              padding: '12px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.08)',
              color: '#059669',
              marginBottom: '1rem'
            }}>
              <CheckCircle size={36} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--modal-text-primary)' }}>
              Registration Successful!
            </h3>
            <p style={{ color: 'var(--modal-text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, maxWidth: '480px', margin: '0 auto 1.25rem' }}>
              Your seat for <strong>{title}</strong> has been secured. We have sent a confirmation email to <strong>{formData.studentEmail}</strong>.
            </p>
            <p style={{ color: 'var(--comps-accent)', fontSize: '0.88rem', fontWeight: 600, maxWidth: '480px', margin: '0 auto 1.5rem' }}>
              Please check your inbox (and spam folder) for your welcome credentials and temporary password to log in to the SARVO Student Portal!
            </p>
            <button
              onClick={onClose}
              style={{
                background: 'var(--modal-input-bg)',
                color: 'var(--modal-text-primary)',
                border: '1px solid var(--modal-border)',
                borderRadius: '12px',
                padding: '10px 24px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'var(--modal-input-border)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'var(--modal-input-bg)'}
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleEnroll}>
            <div className="form-grid" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '2rem'
            }}>
              {/* Student Name */}
              <div>
                <label style={labelStyle}>
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                    disabled={isSubmitting}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Student Email */}
              <div>
                <label style={labelStyle}>
                  Email Address *
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="email"
                    name="studentEmail"
                    value={formData.studentEmail}
                    onChange={handleInputChange}
                    placeholder="name@example.com"
                    required
                    disabled={isSubmitting}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Phone number */}
              <div>
                <label style={labelStyle}>
                  Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="tel"
                    name="studentPhone"
                    value={formData.studentPhone}
                    onChange={handleInputChange}
                    placeholder="e.g. 9876543210"
                    disabled={isSubmitting}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label style={labelStyle}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  style={inputNoIconStyle}
                />
              </div>

              {/* Gender */}
              <div>
                <label style={labelStyle}>
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  style={inputNoIconStyle}
                >
                  <option value="" style={{ background: 'var(--modal-bg)', color: 'var(--modal-text-primary)' }}>Select Gender</option>
                  <option value="Male" style={{ background: 'var(--modal-bg)', color: 'var(--modal-text-primary)' }}>Male</option>
                  <option value="Female" style={{ background: 'var(--modal-bg)', color: 'var(--modal-text-primary)' }}>Female</option>
                  <option value="Other" style={{ background: 'var(--modal-bg)', color: 'var(--modal-text-primary)' }}>Other</option>
                  <option value="Prefer not to say" style={{ background: 'var(--modal-bg)', color: 'var(--modal-text-primary)' }}>Prefer not to say</option>
                </select>
              </div>

              {/* College Name */}
              <div>
                <label style={labelStyle}>
                  College / University
                </label>
                <div style={{ position: 'relative' }}>
                  <GraduationCap size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleInputChange}
                    placeholder="Enter college name"
                    disabled={isSubmitting}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Course */}
              <div>
                <label style={labelStyle}>
                  Course / Degree
                </label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  placeholder="e.g. B.Tech, MCA"
                  disabled={isSubmitting}
                  style={inputNoIconStyle}
                />
              </div>

              {/* Branch */}
              <div>
                <label style={labelStyle}>
                  Branch / Specialization
                </label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleInputChange}
                  placeholder="e.g. Computer Science"
                  disabled={isSubmitting}
                  style={inputNoIconStyle}
                />
              </div>

              {/* Graduation Year */}
              <div>
                <label style={labelStyle}>
                  Graduation Year
                </label>
                <input
                  type="number"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleInputChange}
                  placeholder="e.g. 2026"
                  disabled={isSubmitting}
                  style={inputNoIconStyle}
                />
              </div>

              {/* City */}
              <div>
                <label style={labelStyle}>
                  City
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                    disabled={isSubmitting}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* State */}
              <div>
                <label style={labelStyle}>
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Enter your state"
                  disabled={isSubmitting}
                  style={inputNoIconStyle}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 36px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 24px rgba(217, 119, 6, 0.2)',
                  fontFamily: 'inherit'
                }}
                onMouseOver={(e) => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(217, 119, 6, 0.3)'; } }}
                onMouseOut={(e) => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(217, 119, 6, 0.2)'; } }}
              >
                {isSubmitting ? (
                  <>
                    <span className="comps-loader" style={{
                      display: 'inline-block',
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#ffffff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      marginRight: '6px'
                    }}></span>
                    Processing...
                  </>
                ) : (
                  <>
                    {parseInt(registration_fee || 0, 10) > 0 ? 'Proceed to Payment' : 'Register Now'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CompetitionRegisterModal;
