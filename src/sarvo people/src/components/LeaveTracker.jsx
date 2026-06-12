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
  X 
} from 'lucide-react';
import { leaveApi } from '../../../apis/leaveApi';

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

export default function LeaveTracker() {
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

  // Fetch leave types and holidays
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
      if (mapped.length > 0 && !selectedLeaveTypeId) {
        setSelectedLeaveTypeId(mapped[0].id);
      }
    } catch (err) {
      console.error('Leave balance fetch failed:', err);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

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

  return (
    <div className="leave-tracker-container">
      {/* 1. Header Control Bar */}
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

      {/* 2. Grid of Leave Cards */}
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

      {/* 3. Holidays Lists */}
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
        <div className="holiday-accordion-card" style={{ marginTop: '20px' }}>
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

      {/* 4. Apply Leave slide-in modal */}
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
