import React, { useState } from 'react';
import { User, Mail, Phone, Upload, Link2, CheckCircle2, X } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import { jobApi } from '../../../sarvo people/src/apis/jobApi';

const ApplicationForm = ({ job, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    coverLetter: '',
    linkedin: '',
    portfolio: ''
  });
  const [resume, setResume] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
      setError('');
    }
  };

  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!resume) {
      setError('Please upload your resume to complete the application.');
      return;
    }

    setIsSubmitting(true);

    try {
      const nameParts = formData.name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || 'Candidate';
      
      const resumeBase64 = await getBase64(resume);
      
      const payload = {
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phone,
        resumeUrl: '',
        resumeBase64,
        resumeName: resume.name,
        coverLetter: formData.coverLetter || '',
        linkedin: formData.linkedin || '',
        portfolio: formData.portfolio || ''
      };

      await jobApi.applyForJob(job.id, payload);
      
      setIsSubmitting(false);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit application. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="app-form-overlay">
        <div className="app-form-card" style={{ maxWidth: '480px' }}>
          <div className="success-container">
            <div className="success-icon-wrapper">
              <CheckCircle2 size={36} />
            </div>
            <h2>Application Received!</h2>
            <p>
              Thank you for applying for the <strong>{job.title}</strong> role. Our recruitment team will review your application and get back to you shortly.
            </p>
            <button type="button" onClick={onClose}>
              Back to Job Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-form-overlay">
      <div className="app-form-card">
        <div className="app-form-header">
          <h2>
            Apply for Position
            <span>{job.title} &middot; {job.department}</span>
          </h2>
          <button className="close-modal-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="app-form-content">
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              marginBottom: '1.25rem'
            }}>
              {error}
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name-input">Full Name <span>*</span></label>
              <div className="form-input-wrapper">
                <User size={16} />
                <input
                  id="name-input"
                  name="name"
                  type="text"
                  className="form-control"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email-input">Email Address <span>*</span></label>
              <div className="form-input-wrapper">
                <Mail size={16} />
                <input
                  id="email-input"
                  name="email"
                  type="email"
                  className="form-control"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone-input">Phone Number <span>*</span></label>
              <div className="form-input-wrapper">
                <Phone size={16} />
                <input
                  id="phone-input"
                  name="phone"
                  type="tel"
                  className="form-control"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="linkedin-input">LinkedIn Profile</label>
              <div className="form-input-wrapper">
                <FaLinkedin size={16} />
                <input
                  id="linkedin-input"
                  name="linkedin"
                  type="text"
                  className="form-control"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  onBlur={(e) => {
                    const val = e.target.value.trim();
                    if (val && !/^https?:\/\//i.test(val)) {
                      setFormData(prev => ({ ...prev, linkedin: `https://${val}` }));
                    }
                  }}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="portfolio-input">Portfolio / Website URL</label>
              <div className="form-input-wrapper">
                <Link2 size={16} />
                <input
                  id="portfolio-input"
                  name="portfolio"
                  type="text"
                  className="form-control"
                  placeholder="https://myportfolio.com"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                  onBlur={(e) => {
                    const val = e.target.value.trim();
                    if (val && !/^https?:\/\//i.test(val)) {
                      setFormData(prev => ({ ...prev, portfolio: `https://${val}` }));
                    }
                  }}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Resume / CV <span>*</span></label>
              <div className="file-upload-container">
                <input
                  type="file"
                  className="file-upload-input"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                <div className="file-upload-ui">
                  {resume ? (
                    <div className="file-selected-name">
                      <CheckCircle2 size={24} />
                      {resume.name} ({(resume.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  ) : (
                    <>
                      <Upload size={24} />
                      <span><strong>Click to upload</strong> or drag and drop</span>
                      <small>PDF, DOC, DOCX up to 5MB</small>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="cover-letter-input">Cover Letter / Note</label>
              <textarea
                id="cover-letter-input"
                name="coverLetter"
                className="form-control"
                placeholder="Tell us why you are a great fit for this role..."
                value={formData.coverLetter}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span style={{
                    width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%', display: 'inline-block',
                    animation: 'spin 1s linear infinite', marginRight: '6px'
                  }} />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ApplicationForm;
