import React from 'react';
import { X, CheckCircle, CreditCard, Hash, Receipt, Calendar, DollarSign } from 'lucide-react';

/**
 * PaymentDetailModal
 * Shows payment receipt details when clicking the PAID badge on a registration row.
 *
 * Props:
 *   registration  — the full registration object from the table
 *   onClose       — callback to close the modal
 */
const PaymentDetailModal = ({ registration, onClose }) => {
  if (!registration) return null;

  const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const isPaid = registration.payment_status === 'paid';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 2000,
          animation: 'fadeIn 0.15s ease',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2001,
        width: '100%',
        maxWidth: '420px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '18px',
        boxShadow: '0 24px 48px rgba(0,0,0,0.18)',
        overflow: 'hidden',
        animation: 'slideUp 0.2s ease',
      }}>

        {/* Header */}
        <div style={{
          background: isPaid
            ? 'linear-gradient(135deg, #064e3b, #10b981)'
            : 'linear-gradient(135deg, #1e293b, #475569)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '10px',
              padding: '8px',
              display: 'flex',
            }}>
              <Receipt size={18} color="#fff" />
            </div>
            <div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '15px', fontWeight: 700 }}>
                Payment Receipt
              </h3>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
                {registration.student_name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Status Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '12px',
          background: isPaid ? 'rgba(16,185,129,0.08)' : 'rgba(100,116,139,0.08)',
          borderBottom: '1px solid var(--border-color)',
        }}>
          {isPaid
            ? <><CheckCircle size={16} color="#10b981" /><span style={{ color: '#10b981', fontWeight: 700, fontSize: '13px' }}>Payment Confirmed</span></>
            : <><CreditCard size={16} color="#64748b" /><span style={{ color: '#64748b', fontWeight: 700, fontSize: '13px' }}>Free Registration</span></>
          }
        </div>

        {/* Details */}
        <div style={{ padding: '20px 24px' }}>
          <Row
            icon={<Hash size={14} />}
            label="Payment ID"
            value={registration.payment_id || '—'}
            mono
            highlight={!!registration.payment_id}
          />
          <Row
            icon={<Receipt size={14} />}
            label="Order ID"
            value={registration.order_id || '—'}
            mono
          />
          <Row
            icon={<CreditCard size={14} />}
            label="Status"
            value={
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: isPaid ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)',
                color: isPaid ? '#10b981' : '#64748b',
                border: `1px solid ${isPaid ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.2)'}`,
                borderRadius: '50px',
                padding: '2px 10px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}>
                {isPaid ? <CheckCircle size={10} /> : <CreditCard size={10} />}
                {registration.payment_status}
              </span>
            }
          />
          <Row
            icon={<DollarSign size={14} />}
            label="Student Email"
            value={registration.student_email || '—'}
          />
          <Row
            icon={<Calendar size={14} />}
            label="Registered At"
            value={fmtDate(registration.registered_at)}
            last
          />
        </div>

        {/* Footer tip */}
        {isPaid && (
          <div style={{
            padding: '12px 24px 18px',
            borderTop: '1px solid var(--border-color)',
            textAlign: 'center',
          }}>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
              💡 Payment ID is the official receipt reference for this registration.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, -46%) } to { opacity: 1; transform: translate(-50%, -50%) } }
      `}</style>
    </>
  );
};

/** Helper row component */
const Row = ({ icon, label, value, mono = false, highlight = false, last = false }) => (
  <div style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    paddingBottom: last ? 0 : '14px',
    marginBottom: last ? 0 : '14px',
    borderBottom: last ? 'none' : '1px solid var(--border-color)',
  }}>
    <div style={{ color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }}>{icon}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
        {label}
      </div>
      <div style={{
        fontSize: '13px',
        fontFamily: mono ? 'monospace' : 'inherit',
        fontWeight: highlight ? 700 : 500,
        color: highlight ? 'var(--text-primary)' : 'var(--text-muted)',
        wordBreak: 'break-all',
      }}>
        {value}
      </div>
    </div>
  </div>
);

export default PaymentDetailModal;
