import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  Clock, 
  Waves, 
  Baby, 
  Stethoscope, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  List, 
  CalendarDays, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  X,
  Info,
  Check,
  AlertCircle
} from 'lucide-react';
import { leaveApi } from '../apis/leaveApi';

const DEFAULT_HOLIDAYS = [
  { id: 1, date: '2026-08-15', name: 'Independence Day', is_past: false },
  { id: 2, date: '2026-09-14', name: 'Ganesh Chaturthi', is_past: false },
  { id: 3, date: '2026-10-02', name: 'Gandhi Jayanti', is_past: false },
  { id: 4, date: '2026-10-20', name: 'Dussehra', is_past: false },
  { id: 5, date: '2026-11-10', name: 'Diwali (Laxmipujan)', is_past: false },
  { id: 6, date: '2026-12-25', name: 'Christmas', is_past: false },
  { id: 7, date: '2026-05-28', name: 'Bakri Eid', is_past: true },
  { id: 8, date: '2026-05-01', name: 'Maharashtra Day', is_past: true }
];

const THEME_MAP = {
  'Casual Leave': { icon_type: 'sun', color_theme: 'blue' },
  'Compensatory Off': { icon_type: 'co', color_theme: 'green' },
  'Earned Leave': { icon_type: 'clock', color_theme: 'green-light' },
  'Leave Without Pay': { icon_type: 'lwop', color_theme: 'red' },
  'Paternity Leave': { icon_type: 'baby', color_theme: 'orange' },
  'Sick Leave': { icon_type: 'cross', color_theme: 'purple' }
};

export default function LeaveTracker({ subNavItem = 'Leave Summary', user }) {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [holidays, setHolidays] = useState(DEFAULT_HOLIDAYS);
  
  // Section collapse states
  const [upcomingOpen, setUpcomingOpen] = useState(true);
  const [pastOpen, setPastOpen] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Applied leaves & approvals states
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [remarksMap, setRemarksMap] = useState({});
  const [approvingIds, setApprovingIds] = useState({});

  const isPrivileged = user?.role === 'Admin' || user?.role === 'HR';

  // Fetch leave types, holidays, and applications
  const fetchLeaveData = async () => {
    try {
      const balances = await leaveApi.getBalances();
      
      const mapped = balances.map(b => {
        const theme = THEME_MAP[b.leave_type_name] || { icon_type: 'sun', color_theme: 'blue' };
        return {
          id: b.leave_type_id, // Map this as id for select input
          leave_balance_id: b.id,
          name: b.leave_type_name,
          available: Number(b.allocated_days) - Number(b.used_days),
          booked: Number(b.used_days),
          icon_type: theme.icon_type,
          color_theme: theme.color_theme
        };
      });

      setLeaveTypes(mapped);
      
      // Fix select dropdown initial value bug:
      const allowed = mapped.filter(t => t.name !== 'Leave Without Pay' && t.name !== 'Compensatory Off');
      if (allowed.length > 0 && !selectedLeaveTypeId) {
        setSelectedLeaveTypeId(allowed[0].id);
      }
    } catch (err) {
      console.error('Leave balance fetch failed:', err);
    }

    try {
      setLoadingApps(true);
      // Under 'Leave Summary' we always fetch own history. 
      // Under 'Leave Requests', privileged roles fetch all requests, non-privileged fetch their own.
      const targetEmpId = (subNavItem === 'Leave Summary') ? user?.id : (isPrivileged ? null : user?.id);
      const apps = await leaveApi.listApplications(targetEmpId);
      setApplications(apps);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLeaveData();
    }
  }, [subNavItem, user]);

  // Format date readable for holiday lists
  const formatHolidayDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
    
    // For standard display "15 08 2026, Saturday" or "14-09-2026, Monday"
    if (d.getMonth() === 7) { // August 15 matching screenshot
      return `${day} ${month} ${year}, ${weekday}`;
    }
    return `${day}-${month}-${year}, ${weekday}`;
  };

  // Submit Leave Application
  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !selectedLeaveTypeId) return;

    try {
      await leaveApi.applyLeave({
        leaveTypeId: selectedLeaveTypeId,
        startDate,
        endDate,
        reason
      });
      fetchLeaveData();
      closeModal();
    } catch (err) {
      alert(err.message || 'Leave application failed');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  // Handle status update (Approve / Reject)
  const handleStatusUpdate = async (applicationId, status) => {
    const remarks = remarksMap[applicationId] || '';
    try {
      setApprovingIds(prev => ({ ...prev, [applicationId]: true }));
      await leaveApi.updateStatus(applicationId, status, remarks);
      await fetchLeaveData();
      
      setRemarksMap(prev => {
        const copy = { ...prev };
        delete copy[applicationId];
        return copy;
      });
    } catch (err) {
      alert(err.message || `Failed to update status to ${status}`);
    } finally {
      setApprovingIds(prev => ({ ...prev, [applicationId]: false }));
    }
  };

  // Render Leave category custom icons
  const renderLeaveIcon = (type) => {
    switch (type) {
      case 'sun':
        return <Sun size={20} className="icon-blue" />;
      case 'co':
        return <span className="icon-co-txt">CO</span>;
      case 'clock':
        return <Clock size={20} className="icon-green" />;
      case 'lwop':
        return <Waves size={20} className="icon-red" />;
      case 'baby':
        return <Baby size={20} className="icon-orange" />;
      case 'cross':
        return <Stethoscope size={20} className="icon-purple" />;
      default:
        return <Sun size={20} />;
    }
  };

  // Filter lists into upcoming and past
  const upcomingHolidays = holidays.filter(h => !h.is_past);
  const pastHolidays = holidays.filter(h => h.is_past);

  // Sum total booked leaves
  const totalBooked = leaveTypes.reduce((acc, t) => acc + t.booked, 0);

  // Divide applications into pending and history
  const pendingApps = applications.filter(app => app.status === 'pending');
  const historyApps = applications.filter(app => app.status !== 'pending');

  return (
    <div className="leave-tracker-container">
      
      {/* ==================== VIEW 1: LEAVE SUMMARY ==================== */}
      {subNavItem === 'Leave Summary' && (
        <>
          {/* Header Control Bar */}
          <div className="leave-header-bar">
            <div className="leave-booked-stat">
              Leave booked this year : <strong>{totalBooked}</strong> | Absent : <strong>0</strong>
            </div>

            {/* Date Selector */}
            <div className="leave-date-picker">
              <button className="date-arrow-btn"><ChevronLeft size={16} /></button>
              <div className="date-range-display">
                <Calendar size={14} style={{ marginRight: '6px' }} />
                <span>01-01-2026 - 31-12-2026</span>
              </div>
              <button className="date-arrow-btn"><ChevronRight size={16} /></button>
            </div>

            {/* Action controls */}
            <div className="leave-actions-right">
              <div className="toggle-view-buttons">
                <button className="view-btn active"><List size={16} /></button>
                <button className="view-btn"><CalendarDays size={16} /></button>
              </div>
              
              <button className="btn-apply-leave" onClick={() => setIsModalOpen(true)}>
                <Plus size={16} style={{ marginRight: '4px' }} />
                Apply Leave
              </button>
              
              <button className="dots-more-btn">···</button>
            </div>
          </div>

          {/* Grid of Leave Cards */}
          <div className="leave-cards-grid">
            {leaveTypes.map((type) => (
              <div key={type.id} className="leave-card">
                <div className="leave-card-header">
                  <span className="leave-card-title">{type.name}</span>
                  <div className={`leave-icon-box bg-${type.color_theme}`}>
                    {renderLeaveIcon(type.icon_type)}
                  </div>
                </div>
                <div className="leave-card-details">
                  <div className="detail-row">
                    <span className="detail-label">Available</span>
                    <span className={`detail-val ${type.available > 0 ? 'highlight-green' : ''}`}>
                      {type.name === 'Leave Without Pay' ? '-' : type.available}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Booked</span>
                    <span className="detail-val">{type.booked}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* User's Own Leave History Section */}
          <div className="leave-history-section" style={{ marginBottom: '24px' }}>
            <h4 className="leave-history-title">My Applied Leaves</h4>
            {loadingApps ? (
              <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
                Loading your leave applications...
              </div>
            ) : applications.length === 0 ? (
              <div style={{ padding: '20px', border: '1px dashed #cbd5e1', borderRadius: '6px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
                You have not applied for any leaves yet.
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="leave-table">
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Duration</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Approval Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => {
                      const duration = Math.ceil((new Date(app.end_date) - new Date(app.start_date)) / (1000 * 60 * 60 * 24)) + 1;
                      return (
                        <tr key={app.id}>
                          <td style={{ fontWeight: 600 }}>{app.leave_type_name}</td>
                          <td>{new Date(app.start_date).toLocaleDateString()}</td>
                          <td>{new Date(app.end_date).toLocaleDateString()}</td>
                          <td>{duration} {duration === 1 ? 'day' : 'days'}</td>
                          <td>{app.reason || '-'}</td>
                          <td>
                            <span className={`status-badge ${app.status}`}>
                              {app.status}
                            </span>
                          </td>
                          <td>
                            {app.approval_remarks ? (
                              <span style={{ fontSize: '12px', color: '#4b5563', fontStyle: 'italic' }}>
                                "{app.approval_remarks}"
                                {app.approved_by_first_name && ` — ${app.approved_by_first_name}`}
                              </span>
                            ) : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Holidays Accordions */}
          <div className="holidays-sections-wrapper">
            
            {/* Upcoming Holidays section */}
            <div className="holiday-accordion-card">
              <div 
                className="accordion-header" 
                onClick={() => setUpcomingOpen(!upcomingOpen)}
              >
                <span className="accordion-title">Upcoming Leaves & Holidays</span>
                {upcomingOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              
              {upcomingOpen && (
                <div className="accordion-body">
                  {upcomingHolidays.map((holiday) => (
                    <div key={holiday.id} className="holiday-list-row">
                      <span className="holiday-row-date">{formatHolidayDate(holiday.date)}</span>
                      <div className="holiday-row-name">
                        <Calendar size={14} style={{ marginRight: '8px', color: '#6b7280' }} />
                        <span>{holiday.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past Holidays section */}
            <div className="holiday-accordion-card">
              <div 
                className="accordion-header" 
                onClick={() => setPastOpen(!pastOpen)}
              >
                <span className="accordion-title">Past Leaves & Holidays</span>
                {pastOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              
              {pastOpen && (
                <div className="accordion-body">
                  {pastHolidays.map((holiday) => (
                    <div key={holiday.id} className="holiday-list-row">
                      <span className="holiday-row-date">{formatHolidayDate(holiday.date)}</span>
                      <div className="holiday-row-name">
                        <Calendar size={14} style={{ marginRight: '8px', color: '#9ca3af' }} />
                        <span>{holiday.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </>
      )}

      {/* ==================== VIEW 2: LEAVE REQUESTS ==================== */}
      {(subNavItem === 'Leave Requests' || subNavItem === 'My Requests') && (
        <>
          {isPrivileged ? (
            /* Privileged View: Approve/Reject requests from interns */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Pending Approvals */}
              <div className="leave-history-section">
                <h4 className="leave-history-title">Awaiting Approval ({pendingApps.length})</h4>
                {loadingApps ? (
                  <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
                    Loading leave requests...
                  </div>
                ) : pendingApps.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', fontSize: '13.5px', color: '#64748b' }}>
                    <Check size={28} style={{ color: '#10b981', margin: '0 auto 12px auto' }} />
                    No pending leave requests. You are all caught up!
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="leave-table">
                      <thead>
                        <tr>
                          <th>Intern / Employee</th>
                          <th>Leave Type</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Duration</th>
                          <th>Reason</th>
                          <th>Approval/Rejection Remarks</th>
                          <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingApps.map((app) => {
                          const duration = Math.ceil((new Date(app.end_date) - new Date(app.start_date)) / (1000 * 60 * 60 * 24)) + 1;
                          const isUpdating = approvingIds[app.id];
                          return (
                            <tr key={app.id}>
                              <td>
                                <strong style={{ color: '#111827' }}>{app.first_name} {app.last_name}</strong>
                                <div style={{ fontSize: '11px', color: '#6b7280' }}>{app.email}</div>
                              </td>
                              <td style={{ fontWeight: 600 }}>{app.leave_type_name}</td>
                              <td>{new Date(app.start_date).toLocaleDateString()}</td>
                              <td>{new Date(app.end_date).toLocaleDateString()}</td>
                              <td>{duration} {duration === 1 ? 'day' : 'days'}</td>
                              <td>{app.reason || '-'}</td>
                              <td>
                                <input 
                                  type="text"
                                  placeholder="Add comments..."
                                  className="remarks-input"
                                  value={remarksMap[app.id] || ''}
                                  onChange={(e) => setRemarksMap(prev => ({ ...prev, [app.id]: e.target.value }))}
                                  disabled={isUpdating}
                                />
                              </td>
                              <td>
                                <div className="action-btn-group" style={{ justifyContent: 'center' }}>
                                  <button 
                                    className="btn-approve" 
                                    onClick={() => handleStatusUpdate(app.id, 'approved')}
                                    disabled={isUpdating}
                                  >
                                    {isUpdating ? '...' : 'Approve'}
                                  </button>
                                  <button 
                                    className="btn-reject" 
                                    onClick={() => handleStatusUpdate(app.id, 'rejected')}
                                    disabled={isUpdating}
                                  >
                                    {isUpdating ? '...' : 'Reject'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Past History */}
              <div className="leave-history-section">
                <h4 className="leave-history-title">Request Logs & Archive</h4>
                {loadingApps ? (
                  <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
                    Loading log records...
                  </div>
                ) : historyApps.length === 0 ? (
                  <div style={{ padding: '20px', border: '1px dashed #cbd5e1', borderRadius: '6px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
                    No completed requests found in history.
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="leave-table">
                      <thead>
                        <tr>
                          <th>Intern / Employee</th>
                          <th>Leave Type</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Duration</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th>Approver / Comment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyApps.map((app) => {
                          const duration = Math.ceil((new Date(app.end_date) - new Date(app.start_date)) / (1000 * 60 * 60 * 24)) + 1;
                          return (
                            <tr key={app.id}>
                              <td>
                                <strong style={{ color: '#111827' }}>{app.first_name} {app.last_name}</strong>
                                <div style={{ fontSize: '11px', color: '#6b7280' }}>{app.email}</div>
                              </td>
                              <td style={{ fontWeight: 600 }}>{app.leave_type_name}</td>
                              <td>{new Date(app.start_date).toLocaleDateString()}</td>
                              <td>{new Date(app.end_date).toLocaleDateString()}</td>
                              <td>{duration} {duration === 1 ? 'day' : 'days'}</td>
                              <td>{app.reason || '-'}</td>
                              <td>
                                <span className={`status-badge ${app.status}`}>
                                  {app.status}
                                </span>
                              </td>
                              <td>
                                <div>
                                  {app.status === 'approved' ? 'Approved' : 'Rejected'} by{' '}
                                  <strong>{app.approved_by_first_name || 'Admin'}</strong>
                                </div>
                                {app.approval_remarks && (
                                  <span style={{ fontSize: '11.5px', color: '#6b7280', fontStyle: 'italic' }}>
                                    "{app.approval_remarks}"
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* Intern View: Track status of own applied leaves */
            <div className="leave-history-section">
              <h4 className="leave-history-title">My Leave History & Status</h4>
              {loadingApps ? (
                <div style={{ padding: '20px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
                  Loading your leave applications...
                </div>
              ) : applications.length === 0 ? (
                <div style={{ padding: '40px', border: '1px dashed #cbd5e1', borderRadius: '6px', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
                  No leave requests found. Click "Leave Summary" and apply if you need to take time off.
                </div>
              ) : (
                <div className="table-wrapper">
                  <table className="leave-table">
                    <thead>
                      <tr>
                        <th>Leave Type</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Duration</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Approver Feedback</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => {
                        const duration = Math.ceil((new Date(app.end_date) - new Date(app.start_date)) / (1000 * 60 * 60 * 24)) + 1;
                        return (
                          <tr key={app.id}>
                            <td style={{ fontWeight: 600 }}>{app.leave_type_name}</td>
                            <td>{new Date(app.start_date).toLocaleDateString()}</td>
                            <td>{new Date(app.end_date).toLocaleDateString()}</td>
                            <td>{duration} {duration === 1 ? 'day' : 'days'}</td>
                            <td>{app.reason || '-'}</td>
                            <td>
                              <span className={`status-badge ${app.status}`}>
                                {app.status}
                              </span>
                            </td>
                            <td>
                              {app.approval_remarks ? (
                                <div style={{ fontSize: '12px', color: '#4b5563', fontStyle: 'italic' }}>
                                  "{app.approval_remarks}"
                                  {app.approved_by_first_name && ` — Approved by ${app.approved_by_first_name}`}
                                </div>
                              ) : (
                                <span style={{ fontSize: '11px', color: '#9ca3af' }}>Awaiting review</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ==================== VIEW 3: COMPENSATORY REQUEST ==================== */}
      {subNavItem === 'Compensatory Request' && (
        <div className="compensatory-card">
          <h3>Compensatory Off (CO) Request</h3>
          <p>
            Compensatory Off credits are handled automatically by the Sarvo Attendance System. 
            When you complete full check-ins on weekends or company holidays, your CO balance increases.
          </p>
          <div className="info-alert-box">
            <Info size={20} style={{ flexShrink: 0, color: '#2563eb' }} />
            <div>
              <strong>Weekend Work Verification:</strong>
              <div style={{ marginTop: '4px', lineHeight: '1.5', color: '#1e3a8a' }}>
                If you have worked on a weekend and do not see your Compensatory Off balance credited, 
                please go to the <strong>Attendance</strong> section to check your logs or contact your cohort mentor / HR coordinator.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== APPLY LEAVE SLIDE-IN MODAL ==================== */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-card">
            <div className="modal-header">
              <h3>Apply Leave</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmitLeave} className="modal-form">
              {/* Leave Type */}
              <div className="form-group">
                <label>Leave Type *</label>
                <select 
                  value={selectedLeaveTypeId} 
                  onChange={(e) => setSelectedLeaveTypeId(e.target.value)}
                  required
                >
                  {leaveTypes.filter(t => t.name !== 'Leave Without Pay' && t.name !== 'Compensatory Off').map(t => (
                    <option key={t.id} value={t.id}>{t.name} (Available: {t.available})</option>
                  ))}
                </select>
              </div>

              {/* Date pickers */}
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                    min={startDate}
                    required 
                  />
                </div>
              </div>

              {/* Reason */}
              <div className="form-group">
                <label>Reason for Leave</label>
                <textarea 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe your reason here..."
                  rows={4}
                />
              </div>

              {/* Form buttons */}
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-submit">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
