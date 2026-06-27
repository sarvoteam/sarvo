import React, { useState, useEffect } from 'react';
import { Users, User, Calendar, BookOpen, Mail, Phone, Award, Shield, CheckCircle } from 'lucide-react';
import { cohortApi } from '../apis/cohortApi';

export default function StudentBatchDetails({ currentUser }) {
  const [cohort, setCohort] = useState(null);
  const [peers, setPeers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBatchData = async () => {
      try {
        setLoading(true);
        // 1. Get all students to find current user's cohort_id
        const allStudents = await cohortApi.getAllStudents();
        const me = allStudents.find(
          (s) => s.email.toLowerCase() === currentUser?.email?.toLowerCase()
        );

        if (!me || !me.cohort_id) {
          setError("You are not currently assigned to any active batch.");
          setLoading(false);
          return;
        }

        // 2. Fetch all cohorts to get cohort meta info
        const cohorts = await cohortApi.getCohorts();
        const myCohort = cohorts.find((c) => c.id === me.cohort_id);
        
        if (myCohort) {
          setCohort({
            id: myCohort.id,
            name: myCohort.name,
            mentorName: myCohort.mentor_name || 'Unassigned Mentor',
            mentorEmail: myCohort.mentor_email || 'mentor@sarvo.com',
            startDate: myCohort.start_date ? new Date(myCohort.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
            endDate: myCohort.end_date ? new Date(myCohort.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Continuous',
            progress: myCohort.progress || 0,
            description: myCohort.description || 'No description provided for this cohort.'
          });
        }

        // 3. Get peers in this cohort
        const cohortStudents = await cohortApi.getCohortStudents(me.cohort_id);
        setPeers(cohortStudents.filter(p => p.email.toLowerCase() !== currentUser?.email?.toLowerCase()));
      } catch (err) {
        console.error("Error loading student batch details:", err);
        setError("Failed to load batch details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchBatchData();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="animate-spin" style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid var(--border-color)', borderTopColor: 'var(--active-blue)', borderRadius: '50%' }}></div>
        <p style={{ marginTop: '12px', fontSize: '14px' }}>Loading Batch details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', maxWidth: '600px', margin: '40px auto', textAlign: 'center' }} className="auth-alert error">
        <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>Not Assigned</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* 1. Header Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(0, 123, 245, 0.15) 0%, rgba(0, 210, 255, 0.05) 100%)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '30px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ background: 'var(--active-blue)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
            CURRENT BATCH
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={13} /> Since {cohort?.startDate}
          </span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{cohort?.name}</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0, maxWidth: '800px' }}>
          {cohort?.description}
        </p>

        {/* Progress bar */}
        <div style={{ marginTop: '10px', maxWidth: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
            <span>Batch Progress</span>
            <span style={{ color: 'var(--active-blue)' }}>{cohort?.progress}% Completed</span>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', height: '8px', width: '100%', overflow: 'hidden' }}>
            <div style={{ 
              background: 'linear-gradient(90deg, var(--active-blue) 0%, #00d2ff 100%)', 
              width: `${cohort?.progress}%`, 
              height: '100%',
              borderRadius: '10px',
              transition: 'width 0.5s ease-out'
            }}></div>
          </div>
        </div>
      </div>

      {/* 2. Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
        {/* Left Column: Mentor Details */}
        <div style={{ 
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: 'var(--card-shadow)'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={16} color="var(--active-blue)" /> Batch Instructor & Mentor
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ 
              width: '54px', 
              height: '54px', 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, rgba(0, 123, 245, 0.2), rgba(0, 210, 255, 0.1))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--active-blue)',
              border: '1px solid rgba(0, 123, 245, 0.2)'
            }}>
              {cohort?.mentorName.charAt(0)}
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{cohort?.mentorName}</h4>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mentor</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', marginTop: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
              <Mail size={14} />
              <span style={{ color: 'var(--text-main)' }}>{cohort?.mentorEmail}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
              <Calendar size={14} />
              <span>Mentorship Duration: Full Program</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
              <CheckCircle size={14} color="#10b981" />
              <span style={{ color: '#10b981', fontWeight: 600 }}>Active Support</span>
            </div>
          </div>
        </div>

        {/* Right Column: Peer Students */}
        <div style={{ 
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: 'var(--card-shadow)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} color="var(--active-blue)" /> Cohort Peers ({peers.length + 1} enrolled)
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Self Row */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(0, 123, 245, 0.04)',
              border: '1px solid rgba(0, 123, 245, 0.15)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--active-blue)', color: 'white', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {currentUser?.first_name ? currentUser.first_name.charAt(0) : 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700 }}>{currentUser?.first_name} {currentUser?.last_name} <span style={{ background: 'var(--active-blue)', color: 'white', fontSize: '9px', padding: '1px 5px', borderRadius: '4px', marginLeft: '6px' }}>YOU</span></div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{currentUser?.email}</div>
                </div>
              </div>
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>Active</span>
            </div>

            {/* Other peers */}
            {peers.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No other students are assigned to this cohort yet.</p>
            ) : (
              peers.map((peer) => (
                <div key={peer.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(255, 255, 255, 0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.08)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {peer.first_name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{peer.first_name} {peer.last_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{peer.email}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>Active</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
