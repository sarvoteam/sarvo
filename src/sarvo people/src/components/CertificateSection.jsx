import React, { useState } from 'react';
import { Award, ShieldCheck, Download, Search, CheckCircle, AlertCircle, RefreshCw, QrCode } from 'lucide-react';

const STATIC_CERTIFICATES = {
  'CERT-SARVO-2026-001': {
    id: 'CERT-SARVO-2026-001',
    name: 'Aditya Patil',
    role: 'Full-Stack MERN Intern',
    batch: 'Spring Core Dev 2026',
    completionDate: 'June 08, 2026',
    grade: 'A+ (Excellent)',
    verificationStatus: 'Verified & Active'
  },
  'CERT-SARVO-2026-002': {
    id: 'CERT-SARVO-2026-002',
    name: 'Chetan Ghanghav',
    role: 'UI/UX Design Intern',
    batch: 'Design System Bootcamp',
    completionDate: 'June 02, 2026',
    grade: 'A (Very Good)',
    verificationStatus: 'Verified & Active'
  }
};

export default function CertificateSection({ currentUser }) {
  const [activeSubTab, setActiveSubTab] = useState('download'); // download, verify
  const [certIdQuery, setCertIdQuery] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const isEligibleForCert = currentUser?.role === 'Intern' && currentUser?.attendance_pct >= 85;

  const handleVerify = (e) => {
    e.preventDefault();
    if (!certIdQuery) return;

    setVerifying(true);
    setVerificationResult(null);

    setTimeout(() => {
      const match = STATIC_CERTIFICATES[certIdQuery.trim().toUpperCase()];
      if (match) {
        setVerificationResult(match);
      } else {
        setVerificationResult({ error: 'No certificate found matching ID: ' + certIdQuery });
      }
      setVerifying(false);
    }, 800);
  };

  const handleDownloadCert = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert('Your PDF Certificate ("' + currentUser.name + '_Internship_Certificate.pdf") has been compiled and downloaded!');
    }, 1500);
  };

  return (
    <div className="certificates-container" style={{ padding: '24px', textAlign: 'left' }}>
      
      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveSubTab('download')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: activeSubTab === 'download' ? 'var(--active-blue)' : 'none',
            color: activeSubTab === 'download' ? 'white' : 'var(--text-muted)',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          My Certificate
        </button>
        <button
          onClick={() => setActiveSubTab('verify')}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: activeSubTab === 'verify' ? 'var(--active-blue)' : 'none',
            color: activeSubTab === 'verify' ? 'white' : 'var(--text-muted)',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Credential Verification
        </button>
      </div>

      {/* SUBTAB: MY CERTIFICATE */}
      {activeSubTab === 'download' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          
          {/* Certificate unlock stats */}
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--sidebar-bg)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Award size={18} className="icon-blue" />
              Certificate Status
            </h3>

            {currentUser?.role === 'Intern' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Attendance Rate</span>
                  <span style={{ fontWeight: 600, color: currentUser.attendance_pct >= 85 ? '#10b981' : '#ef4444' }}>
                    {currentUser.attendance_pct}%
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Projects Submitted</span>
                  <span style={{ fontWeight: 600, color: '#10b981' }}>2 / 2 Completed</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Required Criteria</span>
                  <span style={{ fontWeight: 600, color: '#10b981' }}>Met (Attendance {`>=`} 85%)</span>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '10px' }}>
                  {isEligibleForCert ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '12.5px', fontWeight: 700, marginBottom: '12px' }}>
                        <CheckCircle size={15} /> Certificate Unlocked!
                      </div>
                      <button
                        onClick={handleDownloadCert}
                        disabled={downloading}
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: 'var(--active-blue)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        {downloading ? (
                          <RefreshCw size={14} className="anim-spin" />
                        ) : (
                          <Download size={14} />
                        )}
                        {downloading ? 'Compiling PDF...' : 'Download Certificate PDF'}
                      </button>
                    </div>
                  ) : (
                    <div style={{ padding: '10px', background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.1)', borderRadius: '8px', fontSize: '11.5px', color: '#ef4444' }}>
                      <AlertCircle size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      Certificate locked. Minimum 85% attendance is required to graduate.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                You are currently logged in as a <strong>{currentUser?.role}</strong>. Only Intern profiles can track graduation and generate certificates.
              </div>
            )}
          </div>

          {/* Certificate Visual Mock Preview */}
          <div className="card" style={{ padding: '30px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
            
            {/* Elegant Background Certificate Border */}
            <div style={{
              border: '6px double var(--border-color)',
              padding: '24px',
              textAlign: 'center',
              borderRadius: '8px',
              height: '100%'
            }}>
              <Award size={36} style={{ color: '#f59e0b', margin: '0 auto 12px' }} />
              
              <h1 style={{
                fontFamily: 'Georgia, serif',
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--text-main)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '10px'
              }}>
                Certificate of Completion
              </h1>
              
              <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '12px' }}>
                This is proudly presented to
              </p>

              <h2 style={{
                fontSize: '22px',
                fontWeight: 800,
                color: 'var(--text-main)',
                borderBottom: '2px solid var(--border-color)',
                display: 'inline-block',
                paddingBottom: '4px',
                marginBottom: '12px',
                fontFamily: 'inherit'
              }}>
                {currentUser?.role === 'Intern' ? currentUser.name : 'Aditya Patil'}
              </h2>

              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '440px', margin: '0 auto 16px' }}>
                for successfully completing their professional internship as a <strong>{currentUser?.role === 'Intern' ? currentUser.role + ' ' + currentUser.department : 'Full-Stack MERN Intern'}</strong> at Sarvo Technologies. The performance was graded as <strong>A+ (Excellent)</strong>.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px', alignItems: 'center' }}>
                
                {/* Signatures */}
                <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif', color: 'var(--text-main)', fontSize: '13px', fontWeight: 600 }}>Rohit Ghanghav</div>
                    <div style={{ width: '90px', borderTop: '1px solid var(--text-muted)', margin: '4px auto 2px' }}></div>
                    <span>Internship Mentor</span>
                  </div>
                  <div>
                    <div style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif', color: 'var(--text-main)', fontSize: '13px', fontWeight: 600 }}>Sarvo Admin</div>
                    <div style={{ width: '90px', borderTop: '1px solid var(--text-muted)', margin: '4px auto 2px' }}></div>
                    <span>Authorized Registrar</span>
                  </div>
                </div>

                {/* QR Code and Credential ID */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{ padding: '4px', background: 'white', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                    <QrCode size={40} color="#0f172a" />
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    ID: CERT-SARVO-2026-001
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* SUBTAB: CREDENTIAL VERIFICATION LOOKUP */}
      {activeSubTab === 'verify' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Lookup input */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--sidebar-bg)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <ShieldCheck size={18} className="icon-blue" />
              Online Certificate Verification
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: '1.4' }}>
              Verify the validity and details of certificates issued by Sarvo Technologies. Enter the unique Certificate ID.
            </p>

            <form onSubmit={handleVerify}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Certificate ID *</label>
                <div className="admin-search-input-box" style={{ width: '100%', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--primary-bg)', height: '40px', marginTop: '6px' }}>
                  <Search size={16} className="admin-search-icon" />
                  <input
                    type="text"
                    value={certIdQuery}
                    onChange={(e) => setCertIdQuery(e.target.value)}
                    placeholder="e.g. CERT-SARVO-2026-001"
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      outline: 'none',
                      color: 'var(--text-main)',
                      fontSize: '12.5px',
                      paddingLeft: '32px'
                    }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={verifying}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: 'var(--active-blue)',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {verifying ? (
                  <RefreshCw size={14} className="anim-spin" />
                ) : (
                  <ShieldCheck size={14} />
                )}
                {verifying ? 'Querying records...' : 'Verify Credential'}
              </button>
            </form>

            <div style={{ marginTop: '20px', padding: '12px', background: 'var(--primary-bg)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <strong>Demo verification IDs:</strong>
              <div style={{ marginTop: '4px' }}>• <span style={{ color: 'var(--active-blue)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setCertIdQuery('CERT-SARVO-2026-001')}>CERT-SARVO-2026-001</span> (Aditya Patil)</div>
              <div>• <span style={{ color: 'var(--active-blue)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setCertIdQuery('CERT-SARVO-2026-002')}>CERT-SARVO-2026-002</span> (Chetan Ghanghav)</div>
            </div>
          </div>

          {/* Verification Lookup Result */}
          <div>
            {verificationResult ? (
              <div className="card animate-fade-in" style={{ padding: '24px' }}>
                {verificationResult.error ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#ef4444' }}>
                    <AlertCircle size={32} style={{ margin: '0 auto 8px' }} />
                    <h4 style={{ fontSize: '14px', fontWeight: 700 }}>Verification Failed</h4>
                    <p style={{ fontSize: '12px', marginTop: '4px', color: 'var(--text-muted)' }}>{verificationResult.error}</p>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px', color: '#10b981' }}>
                      <CheckCircle size={20} />
                      <strong style={{ fontSize: '14px' }}>Credential Authenticated</strong>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Intern Name:</span>
                        <strong style={{ color: 'var(--text-main)' }}>{verificationResult.name}</strong>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Role Completed:</span>
                        <strong style={{ color: 'var(--text-main)' }}>{verificationResult.role}</strong>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Internship Batch:</span>
                        <strong style={{ color: 'var(--text-main)' }}>{verificationResult.batch}</strong>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Graduation Date:</span>
                        <strong style={{ color: 'var(--text-main)' }}>{verificationResult.completionDate}</strong>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Grade Standard:</span>
                        <strong style={{ color: '#10b981' }}>{verificationResult.grade}</strong>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Registry Status:</span>
                        <strong style={{ color: '#10b981' }}>{verificationResult.verificationStatus}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card" style={{ padding: '40px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', minHeight: '300px' }}>
                <ShieldCheck size={36} style={{ color: 'var(--border-color)', marginBottom: '12px', opacity: 0.6 }} />
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>Awaiting Verification Query</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'center' }}>Enter a Certificate ID to retrieve verified completion metrics from our records registry.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
