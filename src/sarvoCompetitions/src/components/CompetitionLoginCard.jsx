import React, { useState } from 'react';
import { Mail, Lock, LogIn, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const CompetitionLoginCard = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Email and password are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiBase}/employees/students/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        // Save session details to replicate AuthSection.jsx login flow
        sessionStorage.setItem('sarvo_token', data.token);
        localStorage.setItem('sarvo_current_user', JSON.stringify(data.user));
        sessionStorage.setItem('sarvo_people_auth', 'true');

        // Redirect to logged-in test workspace
        setTimeout(() => {
          navigate('/competition-test');
        }, 500);
      } else {
        const errData = await res.json();
        setErrorMsg(errData.error || 'Invalid credentials. Check your email for password.');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('Server connection failed. Try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="comp-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #0f0c29 100%)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        border: isHovered ? '1px solid rgba(168, 85, 247, 0.55)' : '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: isHovered 
          ? '0 20px 48px rgba(109, 40, 217, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.08)' 
          : '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 1px rgba(255, 255, 255, 0.04)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        minHeight: '380px'
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -6 }}
    >
      {/* Card Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', zIndex: 2 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h3 style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color: '#ffffff',
            margin: 0,
            letterSpacing: '-0.025em',
            fontFamily: "'Outfit', sans-serif"
          }}>
            Student Portal
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
            Sign in to track your challenge entries
          </span>
        </div>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'rgba(168, 85, 247, 0.15)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          color: '#c084fc',
          fontSize: '10px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          padding: '4px 10px',
          borderRadius: '100px'
        }}>
          PORTAL
        </span>
      </div>

      <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.05)', zIndex: 2 }} />

      {/* Error Message */}
      {errorMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(244, 63, 94, 0.1)',
          border: '1px solid rgba(244, 63, 94, 0.2)',
          color: '#fb7185',
          borderRadius: '12px',
          padding: '10px 14px',
          fontSize: '0.82rem',
          fontWeight: 500,
          zIndex: 2
        }}>
          <ShieldAlert size={14} style={{ flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Inline Login Form */}
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px', zIndex: 2, flex: 1 }}>
        {/* Email Field */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Student Email
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. vaishnav@sarvo.com"
              required
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255, 255, 255, 0.02)',
                color: '#ffffff',
                outline: 'none',
                fontSize: '0.88rem',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s'
              }}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255, 255, 255, 0.02)',
                color: '#ffffff',
                outline: 'none',
                fontSize: '0.88rem',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s'
              }}
            />
          </div>
        </div>

        {/* Submit Action Block */}
        <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              background: isSubmitting ? '#475569' : 'linear-gradient(135deg, #a855f7, #6d28d9)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '12px',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(109, 40, 217, 0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              fontFamily: 'inherit'
            }}
            onMouseOver={(e) => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(109, 40, 217, 0.35)'; } }}
            onMouseOut={(e) => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(109, 40, 217, 0.2)'; } }}
          >
            {isSubmitting ? (
              'Authenticating...'
            ) : (
              <>
                <span>Sign In to Space</span>
                <LogIn size={14} />
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CompetitionLoginCard;
