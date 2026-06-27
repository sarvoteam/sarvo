import React, { useState, useEffect } from 'react';
import { Search, Mail, Phone, BookOpen, GraduationCap, Award, Edit2, Link } from 'lucide-react';
import { cohortApi } from '../apis/cohortApi';
import CompleteProfileModal from './CompleteProfileModal';

function CircularProgress({ percentage }) {
  const radius = 16;
  const stroke = 3.5;
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let strokeColor = '#ef4444'; // Red
  let bgColor = 'rgba(239, 68, 68, 0.1)';
  if (percentage >= 80) {
    strokeColor = '#10b981'; // Green
    bgColor = 'rgba(16, 185, 129, 0.1)';
  } else if (percentage >= 50) {
    strokeColor = '#f59e0b'; // Amber
    bgColor = 'rgba(245, 158, 11, 0.1)';
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <svg
        height={radius * 2}
        width={radius * 2}
        style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
      >
        <circle
          stroke="var(--border-color)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={strokeColor}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.35s' }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          strokeLinecap="round"
        />
      </svg>
      <span style={{ 
        fontSize: '11px', 
        fontWeight: 800, 
        color: strokeColor,
        background: bgColor,
        padding: '2px 6px',
        borderRadius: '10px'
      }}>
        {percentage}%
      </span>
    </div>
  );
}

export default function StudentsSection({ currentUser }) {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const isAdmin = currentUser?.role === 'Admin';
  const isMentor = currentUser?.role === 'Mentor';

  const getFullName = (user) => {
    if (!user) return '';
    if (user.first_name) {
      return `${user.first_name} ${user.last_name || ''}`.trim();
    }
    return user.name || '';
  };

  const calculateCompletion = (student) => {
    const fields = [
      student.first_name,
      student.last_name,
      student.email,
      student.phone,
      student.date_of_birth,
      student.gender,
      student.address,
      student.linkedin_profile,
      student.qualification,
      student.skills,
      student.college_name,
      student.college_graduation_year,
      student.college_cgpa,
      student.placement_status
    ];

    if (student.placement_status === 'Placed') {
      fields.push(
        student.placement_company_name,
        student.placement_company_address,
        student.placement_role,
        student.placement_package
      );
    }

    const filledCount = fields.filter(val => val !== null && val !== undefined && String(val).trim() !== '').length;
    return Math.round((filledCount / fields.length) * 100);
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await cohortApi.getAllStudents();
      if (isMentor) {
        const cohorts = await cohortApi.getCohorts();
        const mentorName = getFullName(currentUser).toLowerCase();
        const mentorEmail = (currentUser?.email || '').toLowerCase();
        const myBatchIds = cohorts
          .filter(b => 
            (b.mentor_email && b.mentor_email.toLowerCase() === mentorEmail) ||
            (b.mentor_name && b.mentor_name.toLowerCase() === mentorName)
          )
          .map(b => b.id);
        
        setStudents((data || []).filter(s => myBatchIds.includes(s.cohort_id)));
      } else {
        setStudents(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = students.filter(student => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    const email = (student.email || '').toLowerCase();
    const cohort = (student.cohort_name || '').toLowerCase();
    const skills = (student.skills || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    return fullName.includes(query) || email.includes(query) || cohort.includes(query) || skills.includes(query);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top action/search bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: '20px', 
        flexWrap: 'wrap' 
      }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>Student Directory</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Manage student registrations, profile completions, and details.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '300px' }}>
          <Search 
            size={16} 
            style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--text-muted)' 
            }} 
          />
          <input
            type="text"
            placeholder="Search name, email, batch, skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              fontSize: '12.5px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--card-bg)',
              color: 'var(--text-main)',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Roster Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            Loading student directory...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            {searchQuery ? 'No students match your search query.' : 'No students registered yet.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--primary-bg)' }}>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completion</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Name</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Contact</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Batch / Cohort</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Placement</th>
                  <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Qualification & Skills</th>
                  {isAdmin && <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'center' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => {
                  const pct = calculateCompletion(student);
                  return (
                    <tr 
                      key={student.id} 
                      style={{ 
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.2s'
                      }}
                      className="table-row-hover"
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <CircularProgress percentage={pct} />
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                              {student.first_name} {student.last_name}
                            </strong>
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '9px',
                              fontWeight: 700,
                              background: (student.status || 'active') === 'active' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                              color: (student.status || 'active') === 'active' ? '#10b981' : '#ef4444',
                              textTransform: 'uppercase'
                            }}>
                              {student.status || 'active'}
                            </span>
                          </div>
                          {student.linkedin_profile && (
                            <a 
                              href={student.linkedin_profile} 
                              target="_blank" 
                              rel="noreferrer" 
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '3px', 
                                fontSize: '10px', 
                                color: 'var(--active-blue)', 
                                marginTop: '4px',
                                textDecoration: 'none'
                              }}
                            >
                              <Link size={10} /> LinkedIn Profile
                            </a>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontSize: '12px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={12} style={{ color: 'var(--text-muted)' }} /> {student.email}
                          </span>
                          {student.phone && (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={12} /> {student.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ 
                          fontSize: '12px', 
                          color: 'var(--text-main)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <BookOpen size={12} style={{ color: 'var(--active-blue)' }} />
                          {student.cohort_name || 'Unassigned'}
                        </span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: student.placement_status === 'Placed' ? '#10b981' : student.placement_status === 'In Process' ? '#f59e0b' : 'var(--text-muted)',
                            background: student.placement_status === 'Placed' ? 'rgba(16, 185, 129, 0.1)' : student.placement_status === 'In Process' ? 'rgba(245, 158, 11, 0.1)' : 'var(--primary-bg)',
                            padding: '3px 8px',
                            borderRadius: '10px',
                            border: `1px solid ${student.placement_status === 'Placed' ? 'rgba(16, 185, 129, 0.3)' : student.placement_status === 'In Process' ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-color)'}`,
                            display: 'inline-block',
                            width: 'fit-content',
                            textTransform: 'uppercase'
                          }}>
                            {student.placement_status || 'Unplaced'}
                          </span>
                          {student.placement_status === 'Placed' && student.placement_company_name && (
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                              at {student.placement_company_name} {student.placement_package && `(${student.placement_package})`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {student.qualification ? (
                            <span style={{ fontSize: '12px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <GraduationCap size={13} style={{ color: 'var(--text-muted)' }} /> {student.qualification}
                            </span>
                          ) : (
                            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No qualification added</span>
                          )}
                          {student.skills ? (
                            <span style={{ fontSize: '11px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                              <Award size={13} style={{ color: '#10b981' }} />
                              {student.skills.split(',').map((skill, i) => (
                                <span 
                                  key={i} 
                                  style={{ 
                                    background: 'var(--primary-bg)', 
                                    padding: '2px 6px', 
                                    borderRadius: '4px',
                                    border: '1px solid var(--border-color)'
                                  }}
                                >
                                  {skill.trim()}
                                </span>
                              ))}
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No skills cataloged</span>
                          )}
                        </div>
                      </td>
                      {isAdmin && (
                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <button
                            onClick={() => setSelectedStudent(student)}
                            style={{
                              padding: '6px 12px',
                              background: 'var(--btn-green-hover)',
                              color: 'var(--btn-green)',
                              border: '1px solid var(--btn-green)',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              transition: 'all 0.2s'
                            }}
                            className="btn-complete-profile"
                          >
                            <Edit2 size={11} /> Complete Profile
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {selectedStudent && (
        <CompleteProfileModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onUpdateSuccess={loadStudents}
        />
      )}

    </div>
  );
}
