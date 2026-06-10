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

// Default static fallbacks for mock mode
const DEFAULT_LEAVE_TYPES = [
  { id: 1, name: 'Casual Leave', available: 4, booked: 0, icon_type: 'sun', color_theme: 'blue' },
  { id: 2, name: 'Compensatory Off', available: 0, booked: 0, icon_type: 'co', color_theme: 'green' },
  { id: 3, name: 'Earned Leave', available: 12, booked: 0, icon_type: 'clock', color_theme: 'green-light' },
  { id: 4, name: 'Leave Without Pay', available: 0, booked: 0, icon_type: 'lwop', color_theme: 'red' },
  { id: 5, name: 'Paternity Leave', available: 0, booked: 0, icon_type: 'baby', color_theme: 'orange' },
  { id: 6, name: 'Sick Leave', available: 12, booked: 0, icon_type: 'cross', color_theme: 'purple' }
];

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

export default function LeaveTracker() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [holidays, setHolidays] = useState([]);
  
  // Section collapse states
  const [upcomingOpen, setUpcomingOpen] = useState(true);
  const [pastOpen, setPastOpen] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveTypeInput, setLeaveTypeInput] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  
  const [isBackendLive, setIsBackendLive] = useState(true);

  // Fetch leave types and holidays
  const fetchLeaveData = async () => {
    try {
      const typesRes = await fetch('http://localhost:5000/api/leaves/types');
      if (!typesRes.ok) throw new Error();
      const typesData = await typesRes.json();
      setLeaveTypes(typesData);

      const holRes = await fetch('http://localhost:5000/api/leaves/holidays');
      const holData = await holRes.json();
      setHolidays(holData);
      
      setIsBackendLive(true);
    } catch (err) {
      console.warn('Backend server not connected. Falling back to local storage in front-end mock.');
      setIsBackendLive(false);
      
      const localLeaves = localStorage.getItem('zoho_leaves');
      const localHolidays = localStorage.getItem('zoho_holidays');

      if (localLeaves) {
        setLeaveTypes(JSON.parse(localLeaves));
      } else {
        setLeaveTypes(DEFAULT_LEAVE_TYPES);
        localStorage.setItem('zoho_leaves', JSON.stringify(DEFAULT_LEAVE_TYPES));
      }

      if (localHolidays) {
        setHolidays(JSON.parse(localHolidays));
      } else {
        setHolidays(DEFAULT_HOLIDAYS);
        localStorage.setItem('zoho_holidays', JSON.stringify(DEFAULT_HOLIDAYS));
      }
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
    if (!startDate || !endDate) return;

    if (isBackendLive) {
      try {
        const res = await fetch('http://localhost:5000/api/leaves/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leaveTypeName: leaveTypeInput,
            startDate,
            endDate,
            reason
          })
        });
        if (res.ok) {
          fetchLeaveData();
          closeModal();
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      // Mock submit
      const diffTime = Math.abs(new Date(endDate) - new Date(startDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const updatedLeaves = leaveTypes.map(t => {
        if (t.name === leaveTypeInput) {
          return {
            ...t,
            available: Math.max(0, t.available - diffDays),
            booked: t.booked + diffDays
          };
        }
        return t;
      });

      setLeaveTypes(updatedLeaves);
      localStorage.setItem('zoho_leaves', JSON.stringify(updatedLeaves));
      closeModal();
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
                  value={leaveTypeInput} 
                  onChange={(e) => setLeaveTypeInput(e.target.value)}
                  required
                >
                  {leaveTypes.filter(t => t.name !== 'Leave Without Pay' && t.name !== 'Compensatory Off').map(t => (
                    <option key={t.id} value={t.name}>{t.name} (Available: {t.available})</option>
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
