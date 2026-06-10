import React from 'react';
import { MapPin, Briefcase, Calendar, ArrowRight } from 'lucide-react';

const JobCard = ({ job, onView }) => {
  // Determine CSS class based on department
  const getDeptClass = (dept) => {
    if (!dept) return '';
    return dept.toLowerCase();
  };

  return (
    <div className="job-card">
      <div className={`job-card-top ${getDeptClass(job.department)}`}>
        <span className="department-badge">{job.department}</span>
        <span className="posted-date">{job.postedDate}</span>
      </div>

      <h3>{job.title}</h3>

      <div className="job-location">
        <MapPin size={14} />
        <span>{job.location}</span>
      </div>

      <div className="job-tags">
        <span className="job-tag">{job.type}</span>
        <span className="job-tag">{job.experience}</span>
      </div>

      <div className="job-salary">
        <span>{job.salary}</span>
      </div>

      <button className="view-btn" onClick={onView}>
        View Details <ArrowRight size={16} />
      </button>
    </div>
  );
};

export default JobCard;
