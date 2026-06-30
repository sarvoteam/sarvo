import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Award, Users, UserMinus, Plus, Search, Mail, Phone, BookOpen, GraduationCap, MapPin, X, CreditCard, CheckCircle } from 'lucide-react';
import { competitionApi } from '../apis/competitionApi';
import { paymentApi } from '../apis/paymentApi';
import { loadRazorpayScript } from '../utils/razorpayLoader';
import PaymentDetailModal from './PaymentDetailModal';

const CompetitionAdminDetailView = ({ competition, onBack }) => {
  const [registrations, setRegistrations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Enrollment modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Payment detail modal state
  const [selectedPayment, setSelectedPayment] = useState(null);
  
  // Registration form state
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
  // 'idle' | 'creating-order' | 'awaiting-payment' | 'verifying'
  const [paymentStep, setPaymentStep] = useState('idle');

  // Fetch registrations
  const loadData = async () => {
    setIsLoading(true);
    try {
      const regData = await competitionApi.getRegistrations(competition.id);
      setRegistrations(regData || []);
    } catch (err) {
      console.error('Failed to load registrations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [competition.id]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle Enrollment submit — payment-gated flow
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
        competitionId: competition.id,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear, 10) : null
      };

      if (feeInPaise === 0) {
        // ── Free Competition: direct registration ─────────────────────────────
        setPaymentStep('verifying');
        await paymentApi.registerFree(submissionData);
        resetAndClose();
        loadData();
      } else {
        // ── Paid Competition: Razorpay flow ───────────────────────────────────
        setPaymentStep('creating-order');
        await loadRazorpayScript();

        const order = await paymentApi.createOrder(
          competition.id,
          studentName,
          studentEmail
        );

        if (order.free) {
          // Fallback: backend says free despite local fee value
          setPaymentStep('verifying');
          await paymentApi.registerFree(submissionData);
          resetAndClose();
          loadData();
          return;
        }

        setPaymentStep('awaiting-payment');
        setIsSubmitting(false); // Let user interact with Razorpay modal

        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'Sarvo Campus',
          description: `Registration: ${competition.title}`,
          order_id: order.orderId,
          prefill: {
            name: studentName,
            email: studentEmail,
            contact: formData.studentPhone || '',
          },
          theme: { color: '#3b82f6' },
          modal: {
            ondismiss: () => {
              setPaymentStep('idle');
              setFormError('Payment was cancelled. Please try again to complete registration.');
            },
          },
          handler: async (razorpayResponse) => {
            // Payment success callback — verify on backend
            setIsSubmitting(true);
            setPaymentStep('verifying');
            try {
              await paymentApi.verifyAndRegister({
                ...submissionData,
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
              });
              resetAndClose();
              loadData();
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

  const resetAndClose = () => {
    setIsModalOpen(false);
    setPaymentStep('idle');
    setIsSubmitting(false);
    setFormData({
      studentName: '', studentEmail: '', studentPhone: '',
      dob: '', gender: '', collegeName: '',
      course: '', branch: '', graduationYear: '', city: '', state: ''
    });
    setFormError('');
  };

  // Handle Remove Student
  const handleRemove = async (registrationId, name) => {
    if (!window.confirm(`Are you sure you want to unenroll ${name} from this competition?`)) {
      return;
    }
    try {
      await competitionApi.deleteRegistration(registrationId);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to unenroll student.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter registrations
  const filteredRegs = registrations.filter(reg => {
    const query = searchQuery.toLowerCase();
    return (
      reg.student_name.toLowerCase().includes(query) ||
      reg.student_email.toLowerCase().includes(query) ||
      (reg.college_name && reg.college_name.toLowerCase().includes(query)) ||
      (reg.course && reg.course.toLowerCase().includes(query)) ||
      (reg.branch && reg.branch.toLowerCase().includes(query))
    );
  });

  return (
    <div style={{ padding: '30px', height: '100%', overflowY: 'auto' }}>
      {/* Back Header navigation */}
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '20px',
          padding: 0,
          transition: 'color 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <ArrowLeft size={16} /> Back to Competitions
      </button>

      {/* Main Grid: Details Left, Stats/Actions Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '30px' }}>
        {/* Left Side: Details Card */}
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: 'var(--card-shadow)'
        }}>
          <div style={{ display: 'flex', justifyContext: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>{competition.title}</h2>
            <span style={{
              display: 'inline-block',
              padding: '4px 10px',
              borderRadius: '100px',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              backgroundColor: competition.status === 'active' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              color: competition.status === 'active' ? '#10b981' : '#ef4444',
              border: competition.status === 'active' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              {competition.status === 'active' ? 'Active' : 'Completed'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} />
              <span>{formatDate(competition.start_date)} - {formatDate(competition.end_date)}</span>
            </div>
            {competition.prize_pool && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                {(() => {
                  try {
                    const parsed = JSON.parse(competition.prize_pool);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                      return parsed.map((p, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: 600 }}>
                          <Award size={15} />
                          <span>{p.rank}: {p.reward}</span>
                        </div>
                      ));
                    }
                  } catch (e) {}
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontWeight: 600 }}>
                      <Award size={15} />
                      <span>{competition.prize_pool}</span>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 8px 0', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Description</h4>
          <p style={{ margin: '0 0 20px 0', fontSize: '14px', lineHeight: 1.6 }}>{competition.description}</p>

          {competition.detailed_description && (
            <>
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 8px 0', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>About the Competition</h4>
              <p style={{ margin: '0 0 20px 0', fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{competition.detailed_description}</p>
            </>
          )}

          {competition.rules && (
            <>
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 8px 0', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Rules & Guidelines</h4>
              <p style={{ margin: '0 0 20px 0', fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{competition.rules}</p>
            </>
          )}

          {competition.eligibility && (
            <>
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 8px 0', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Eligibility Criteria</h4>
              <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{competition.eligibility}</p>
            </>
          )}
        </div>

        {/* Right Side: Quick Stats / Enroll Button */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Enrollment Count Card */}
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: 'var(--card-shadow)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: '#3b82f6',
              marginBottom: '12px'
            }}>
              <Users size={28} />
            </div>
            <h3 style={{ fontSize: '15px', color: 'var(--text-muted)', margin: '0 0 4px 0' }}>Enrolled Students</h3>
            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)' }}>{registrations.length}</div>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: 'var(--active-blue)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 20px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundImage: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
              fontSize: '14px',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus size={18} /> Register Student
          </button>
        </div>
      </div>

      {/* Registrations List Section */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: 'var(--card-shadow)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Registered Students List</h3>
          
          {/* Search registrant input */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
            <Search size={15} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--card-bg)',
                color: 'inherit',
                outline: 'none',
                fontSize: '13px'
              }}
            />
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading student records...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.01)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Student Name</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Contact Info</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Demographics</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Education</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Location</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Payment</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)' }}>Registered</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegs.length > 0 ? (
                  filteredRegs.map((reg) => (
                    <tr key={reg.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700 }}>{reg.student_name}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={12} style={{ color: 'var(--text-muted)' }} />
                            {reg.student_email}
                          </span>
                          {reg.student_phone && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                              <Phone size={12} />
                              {reg.student_phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {reg.dob && <span>DOB: {formatDate(reg.dob)}</span>}
                          {reg.gender && <span>Gender: {reg.gender}</span>}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 600 }}>{reg.college_name || '—'}</span>
                          {(reg.course || reg.branch) && (
                            <span style={{ fontSize: '12px' }}>
                              {reg.course || ''} {reg.branch ? `(${reg.branch})` : ''}
                            </span>
                          )}
                          {reg.graduation_year && (
                            <span style={{ fontSize: '11px', color: 'var(--active-blue)', fontWeight: 600 }}>
                              Class of {reg.graduation_year}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                        {(reg.city || reg.state) ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={13} />
                            <span>{[reg.city, reg.state].filter(Boolean).join(', ')}</span>
                          </div>
                        ) : '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          onClick={() => reg.payment_status === 'paid' && setSelectedPayment(reg)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: reg.payment_status === 'paid'
                              ? 'rgba(16, 185, 129, 0.1)'
                              : 'rgba(100, 116, 139, 0.1)',
                            color: reg.payment_status === 'paid' ? '#10b981' : '#64748b',
                            border: reg.payment_status === 'paid'
                              ? '1px solid rgba(16, 185, 129, 0.3)'
                              : '1px solid rgba(100, 116, 139, 0.2)',
                            cursor: reg.payment_status === 'paid' ? 'pointer' : 'default',
                            transition: 'transform 0.15s, box-shadow 0.15s',
                          }}
                          onMouseOver={(e) => { if (reg.payment_status === 'paid') { e.currentTarget.style.transform = 'scale(1.07)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(16,185,129,0.25)'; } }}
                          onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                          title={reg.payment_status === 'paid' ? 'Click to view payment details' : ''}
                        >
                          {reg.payment_status === 'paid'
                            ? <><CheckCircle size={11} /> Paid</>
                            : <><CreditCard size={11} /> Free</>
                          }
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{formatDate(reg.registered_at)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleRemove(reg.id, reg.student_name)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600,
                            fontSize: '12px',
                            transition: 'opacity 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
                          onMouseOut={(e) => e.currentTarget.style.opacity = 1}
                        >
                          <UserMinus size={14} /> Unenroll
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No students registered for this competition yet. Click "Register Student" to enroll one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enrollment Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '650px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            position: 'relative',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button
              onClick={() => {
                setIsModalOpen(false);
                setFormError('');
                setPaymentStep('idle');
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%'
              }}
            >
              <X size={18} />
            </button>

            <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Plus size={20} style={{ color: 'var(--active-blue)' }} />
              Register Student for Competition
            </h3>
            {/* Fee badge */}
            {parseInt(competition.registration_fee || 0, 10) > 0 ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--active-blue)',
                marginBottom: '16px'
              }}>
                <CreditCard size={13} />
                Registration Fee: ₹{Math.round(competition.registration_fee / 100)}
              </div>
            ) : (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#10b981',
                marginBottom: '16px'
              }}>
                <CheckCircle size={13} />
                Free Registration
              </div>
            )}

            {formError && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px',
                fontWeight: 500
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleEnroll}>
              {/* Form Fields Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '20px'
              }}>
                {/* Student Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--card-bg)',
                      color: 'inherit',
                      outline: 'none',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Student Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="studentEmail"
                    value={formData.studentEmail}
                    onChange={handleInputChange}
                    placeholder="name@example.com"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--card-bg)',
                      color: 'inherit',
                      outline: 'none',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Phone number */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="studentPhone"
                    value={formData.studentPhone}
                    onChange={handleInputChange}
                    placeholder="e.g. 9876543210"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--card-bg)',
                      color: 'inherit',
                      outline: 'none',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--card-bg)',
                      color: 'inherit',
                      outline: 'none',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--card-bg)',
                      color: 'inherit',
                      outline: 'none',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {/* College Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    College / University
                  </label>
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleInputChange}
                    placeholder="Enter college name"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--card-bg)',
                      color: 'inherit',
                      outline: 'none',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Course */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Course
                  </label>
                  <input
                    type="text"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    placeholder="e.g. B.Tech, MCA"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--card-bg)',
                      color: 'inherit',
                      outline: 'none',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Branch */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Branch
                  </label>
                  <input
                    type="text"
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    placeholder="e.g. Computer Science"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--card-bg)',
                      color: 'inherit',
                      outline: 'none',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Graduation Year */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleInputChange}
                    placeholder="e.g. 2026"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--card-bg)',
                      color: 'inherit',
                      outline: 'none',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* City */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="e.g. Pune"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--card-bg)',
                      color: 'inherit',
                      outline: 'none',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* State */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="e.g. Maharashtra"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--card-bg)',
                      color: 'inherit',
                      outline: 'none',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContext: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || paymentStep === 'awaiting-payment'}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--active-blue)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    fontWeight: 600,
                    cursor: (isSubmitting || paymentStep === 'awaiting-payment') ? 'not-allowed' : 'pointer',
                    backgroundImage: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    fontSize: '14px',
                    opacity: (isSubmitting || paymentStep === 'awaiting-payment') ? 0.7 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {paymentStep === 'creating-order' && 'Preparing Payment...'}
                  {paymentStep === 'awaiting-payment' && 'Complete Payment in Popup...'}
                  {paymentStep === 'verifying' && 'Verifying Payment...'}
                  {paymentStep === 'idle' && (
                    parseInt(competition.registration_fee || 0, 10) > 0
                      ? <><CreditCard size={15} /> Pay ₹{Math.round(competition.registration_fee / 100)} & Enroll</>
                      : 'Enroll Student'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Detail Modal — rendered outside enrollment modal to avoid z-index issues */}
      {selectedPayment && (
        <PaymentDetailModal
          registration={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
};

export default CompetitionAdminDetailView;
