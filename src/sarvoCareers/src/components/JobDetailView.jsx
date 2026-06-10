import React, { useEffect } from 'react';
import { ArrowLeft, MapPin, Briefcase, Calendar, CheckCircle, Award, ShieldAlert, Sparkles } from 'lucide-react';

const JobDetailView = ({ job, onBack, onApply }) => {
  // Scroll to top when loading details
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [job]);

  return (
    <div className="careers-container">
      <div className="job-detail">
        <div className="detail-nav">
          <button className="back-to-jobs" onClick={onBack}>
            <ArrowLeft size={16} /> Back to Job Openings
          </button>
        </div>

        <div className="detail-header">
          <div className="detail-title-block">
            <h1>{job.title}</h1>
            <div className="detail-meta">
              <span><Briefcase size={15} /> {job.department}</span>
              <span className="detail-meta-dot"></span>
              <span><MapPin size={15} /> {job.location}</span>
              <span className="detail-meta-dot"></span>
              <span><Calendar size={15} /> {job.type}</span>
            </div>
          </div>
          <div className="detail-actions">
            <button className="apply-now-btn" onClick={onApply}>
              Apply for this Job <Sparkles size={16} />
            </button>
          </div>
        </div>

        <div className="detail-section">
          <h2>About the Role</h2>
          <p>{job.description}</p>
        </div>

        <div className="detail-section">
          <h2>Responsibilities</h2>
          <ul className="detail-list">
            {job.responsibilities.map((resp, i) => (
              <li key={i}>
                <CheckCircle size={16} />
                <span>{resp}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="detail-section">
          <h2>Requirements & Qualifications</h2>
          <ul className="detail-list">
            {job.requirements.map((req, i) => (
              <li key={i}>
                <Award size={16} style={{ color: '#0ea5e9' }} />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="detail-section">
          <h2>Benefits & Perks</h2>
          <ul className="detail-list">
            {job.perks.map((perk, i) => (
              <li key={i}>
                <Sparkles size={16} style={{ color: '#a5b4fc' }} />
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
          <button className="apply-now-btn" onClick={onApply} style={{ padding: '1.1rem 3.5rem', fontSize: '1.05rem' }}>
            Apply for this Job
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailView;
