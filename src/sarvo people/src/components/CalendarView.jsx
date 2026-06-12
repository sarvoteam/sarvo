import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5, 1)); // June 2026
  const [attendance, setAttendance] = useState([]);
  const [isBackendLive, setIsBackendLive] = useState(true);

  // Fetch attendance data to render attendance in calendar
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const res = await fetch(`${apiBase}/attendance/week`);
        if (res.ok) {
          const data = await res.json();
          setAttendance(data);
        }
        setIsBackendLive(true);
      } catch (err) {
        setIsBackendLive(false);
        // Fallback to local storage if API is down
        const localAtt = localStorage.getItem('sarvo_attendance');
        if (localAtt) {
          setAttendance(JSON.parse(localAtt));
        }
      }
    };
    fetchAttendance();
  }, []);

  // Format month and year header
  const monthName = currentMonth.toLocaleString('en-US', { month: 'short' });
  const yearNum = currentMonth.getFullYear();

  // Days list for June 2026 (Mon 1 to Tue 30)
  const totalDays = 30;
  const daysArray = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Determine status for a given day in June 2026
  const getDayStatus = (dayNum) => {
    // Mon 1 to Fri 5: Absent
    if (dayNum >= 1 && dayNum <= 5) return 'Absent';
    // Mon 8: Absent
    if (dayNum === 8) return 'Absent';
    
    // Check if this matches today's attendance state from backend / local storage
    if (dayNum === 9) { // Today is June 9th 2026 in our mock
      const todayLog = attendance.find(log => log.isToday);
      if (todayLog) {
        if (todayLog.status === 'Checked-in' || todayLog.status === 'Present') {
          return 'Present';
        }
        return todayLog.status;
      }
    }
    
    return '';
  };

  const isWeekend = (dayNum) => {
    // June 1st is Monday, so dayNum 6 (Saturday), 7 (Sunday), 13, 14, 20, 21, 27, 28 are weekends
    const dayOfWeek = (dayNum - 1) % 7;
    return dayOfWeek === 5 || dayOfWeek === 6;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div className="calendar-view-container">
      {/* Calendar Control Header Bar */}
      <div className="calendar-header-bar">
        <div className="calendar-nav-left">
          <div className="calendar-btn-group">
            <button className="calendar-icon-btn">
              <Calendar size={15} />
            </button>
            <button className="calendar-arrow-btn" onClick={handlePrevMonth}>
              <ChevronLeft size={16} />
            </button>
            <div className="calendar-month-display">
              {monthName} {yearNum}
            </div>
            <button className="calendar-arrow-btn" onClick={handleNextMonth}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Month Grid */}
      <div className="calendar-grid-card">
        {/* Days of Week Header */}
        <div className="calendar-week-header">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="calendar-week-day-label">
              {day}
            </div>
          ))}
        </div>

        {/* Days Cells Grid */}
        <div className="calendar-days-grid">
          {daysArray.map((dayNum) => {
            const status = getDayStatus(dayNum);
            const weekend = isWeekend(dayNum);
            const isToday = dayNum === 9; // Today is June 9th in our Sarvo app mock timeline

            return (
              <div 
                key={dayNum} 
                className={`calendar-day-cell ${weekend ? 'weekend-cell' : ''}`}
              >
                <div className="day-number-row">
                  <span className={`day-number-val ${isToday ? 'today-active-circle' : ''}`}>
                    {dayNum}
                  </span>
                </div>
                <div className="day-content-row">
                  {status === 'Absent' && (
                    <div className="calendar-absent-pill">
                      Absent
                    </div>
                  )}
                  {status === 'Present' && (
                    <div className="calendar-present-pill">
                      Present
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Pad trailing cells for a clean grid finish (June 2026 has 30 days starting on Mon, ending on Tue. So 5 rows * 7 = 35 cells. Pad 5 empty cells) */}
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={`empty-${idx}`} className="calendar-day-cell empty-cell"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
