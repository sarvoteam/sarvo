import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { Sun, Moon, ArrowLeft, Briefcase, Mail, Phone, ExternalLink } from 'lucide-react';
import '../styles/careers.css';

import CareersHero from '../components/CareersHero';
import JobFilters from '../components/JobFilters';
import JobCard from '../components/JobCard';
import JobDetailView from '../components/JobDetailView';
import ApplicationForm from '../components/ApplicationForm';
import WhyJoinSarvo from '../components/WhyJoinSarvo';
import { jobListings } from '../components/JobListings';

const SarvoCareersPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [selectedJob, setSelectedJob] = useState(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    department: 'All',
    type: 'All',
    location: 'All',
  });

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedJob, showApplyForm]);

  // Filter job listings based on department, type, location and search query
  const filteredJobs = jobListings.filter((job) => {
    const matchesDept = filters.department === 'All' || job.department === filters.department;
    const matchesType = filters.type === 'All' || job.type === filters.type;
    const matchesLoc = filters.location === 'All' || job.location.includes(filters.location);
    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requirements.some(req => req.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesDept && matchesType && matchesLoc && matchesSearch;
  });

  return (
    <div className="sarvo-careers-wrapper">
      {/* Careers Portal Header */}
      <header className="careers-header careers-container">
        <button 
          className="careers-back-btn" 
          onClick={() => window.location.href = '/'}
          aria-label="Back to Main Site"
        >
          <ArrowLeft size={16} /> Back to Main Site
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <button
            onClick={toggleTheme}
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              padding: '0.65rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition-smooth)'
            }}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      {!selectedJob && !showApplyForm ? (
        <>
          <CareersHero searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          
          <JobFilters filters={filters} setFilters={setFilters} />
          
          <main className="careers-container">
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>
              Current Job Openings
            </h2>
            <div className="jobs-grid">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onView={() => setSelectedJob(job)}
                  />
                ))
              ) : (
                <div className="no-jobs-found">
                  <h3>No Positions Found</h3>
                  <p>We couldn't find any job openings matching your search criteria. Try adjusting your filters.</p>
                </div>
              )}
            </div>
          </main>

          <WhyJoinSarvo />
        </>
      ) : selectedJob && !showApplyForm ? (
        <JobDetailView
          job={selectedJob}
          onBack={() => setSelectedJob(null)}
          onApply={() => setShowApplyForm(true)}
        />
      ) : (
        <ApplicationForm
          job={selectedJob}
          onClose={() => {
            setShowApplyForm(false);
            setSelectedJob(null);
          }}
        />
      )}

      {/* Careers Portal Footer */}
      <footer className="careers-container" style={{
        marginTop: '6rem',
        paddingTop: '2.5rem',
        borderTop: '1px solid var(--glass-border)',
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem'
      }}>
        <p style={{ marginBottom: '0.5rem' }}>&copy; {new Date().getFullYear()} SARVO Tech Careers. All rights reserved.</p>
        <p style={{ opacity: 0.7 }}>Building high-performance teams for the future of digital software.</p>
      </footer>
    </div>
  );
};

export default SarvoCareersPage;
