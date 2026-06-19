import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  List, 
  CalendarDays, 
  Play, 
  Pause,
  Clock, 
  Trash2 
} from 'lucide-react';
import { projectApi } from '../apis/projectApi';

export default function TimeTracker() {
  const [activeSubTab, setActiveSubTab] = useState('Time Logs');
  const [logs, setLogs] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  
  // Timer States
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0); // in seconds
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [description, setDescription] = useState('');
  const [isBillable, setIsBillable] = useState('Billable');

  const fetchTrackerData = async () => {
    try {
      // 1. Fetch Projects
      const projs = await projectApi.getProjects();
      setProjectsList(projs);

      // 2. Fetch Tasks
      const tasks = await projectApi.getTasks();
      setTasksList(tasks);

      // 3. Fetch Time Logs
      const timeLogs = await projectApi.getTimeLogs();
      const mappedLogs = timeLogs.map(tl => ({
        id: tl.id,
        project: tl.project_name,
        job: tl.task_name,
        description: tl.description,
        billable: 'Billable', // Default
        duration: tl.duration_minutes * 60, // Convert minutes back to seconds for frontend formatting
        date: new Date(tl.log_date).toLocaleDateString()
      }));
      setLogs(mappedLogs);
    } catch (err) {
      console.error('Failed to load tracker data:', err);
    }
  };

  // Load backend data on startup
  useEffect(() => {
    fetchTrackerData();
  }, []);

  // Timer Tick
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const formatTimerText = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const handleStartStop = async () => {
    if (isRunning) {
      // Save current log
      if (timeElapsed > 0 && selectedTaskId) {
        try {
          const durationMins = Math.max(1, Math.round(timeElapsed / 60));
          const todayStr = new Date().toISOString().split('T')[0];
          
          await projectApi.logTime({
            taskId: selectedTaskId,
            logDate: todayStr,
            durationMinutes: durationMins,
            description: description || 'Working on tasks'
          });

          fetchTrackerData();
        } catch (err) {
          alert(err.message || 'Logging time failed');
        }
      } else if (!selectedTaskId) {
        alert('Please select a task to log time against');
      }
      // Reset
      setIsRunning(false);
      setTimeElapsed(0);
      setDescription('');
    } else {
      setIsRunning(true);
    }
  };

  const handleDeleteLog = (id) => {
    // Delete log locally or ignore since it's a read-only historical list
    setLogs(prev => prev.filter(log => log.id !== id));
  };

  // Calculate totals
  const totalSeconds = logs.reduce((acc, log) => acc + log.duration, 0) + (isRunning ? timeElapsed : 0);
  const totalHoursFormatted = (totalSeconds / 3600).toFixed(2);
  
  const billableSeconds = logs.filter(log => log.billable === 'Billable').reduce((acc, log) => acc + log.duration, 0) + (isRunning && isBillable === 'Billable' ? timeElapsed : 0);
  const billableHoursFormatted = (billableSeconds / 3600).toFixed(2);

  const nonSubmittedSeconds = totalSeconds; // All logged time starts as non-submitted
  const nonSubmittedHoursFormatted = (nonSubmittedSeconds / 3600).toFixed(2);

  return (
    <div className="timetracker-container">
      {/* 1. Header Control Bar */}
      <div className="tracker-header-bar">
        <div className="tracker-header-left">
          <button className="btn-log-time">Log Time</button>
        </div>

        <div className="tracker-date-picker">
          <button className="date-arrow-btn"><ChevronLeft size={16} /></button>
          <div className="date-range-display">
            <Calendar size={14} style={{ marginRight: '6px' }} />
            <span>08-06-2026 - 14-06-2026</span>
          </div>
          <button className="date-arrow-btn"><ChevronRight size={16} /></button>
        </div>

        <div className="tracker-actions-right">
          <div className="toggle-view-buttons">
            <button className="view-btn active"><List size={16} /></button>
            <button className="view-btn"><CalendarDays size={16} /></button>
          </div>
          <button className="dots-more-btn">···</button>
        </div>
      </div>

      {/* 2. Log Input Form Card */}
      <div className="tracker-form-card">
        <div className="tracker-inputs-row">
          <select 
            value={selectedProjectId} 
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSelectedTaskId(''); // Reset task
            }}
            className="tracker-select"
          >
            <option value="">Select Project</option>
            {projectsList.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select 
            value={selectedTaskId} 
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="tracker-select"
          >
            <option value="">Select Job/Task</option>
            {tasksList
              .filter(t => !selectedProjectId || Number(t.project_id) === Number(selectedProjectId))
              .map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))
            }
          </select>

          <input 
            type="text" 
            placeholder="What are you working on?" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="tracker-desc-input"
          />

          <select 
            value={isBillable} 
            onChange={(e) => setIsBillable(e.target.value)}
            className="tracker-select billable-select"
          >
            <option value="Billable">Billable</option>
            <option value="Non-Billable">Non-Billable</option>
          </select>

          {/* Interactive Timer button */}
          <div className="timer-widget-group">
            <div className={`timer-display-box ${isRunning ? 'running' : ''}`}>
              {formatTimerText(timeElapsed)}
            </div>
            <button 
              onClick={handleStartStop} 
              className={`btn-timer-trigger ${isRunning ? 'running' : ''}`}
            >
              {isRunning ? <Pause size={14} fill="white" /> : <Play size={14} fill="white" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main logs list / Empty state */}
      <div className="tracker-content-card">
        {logs.length === 0 && !isRunning ? (
          <div className="empty-state-container">
            {/* Robot illustration SVG */}
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="empty-illustration">
              <rect x="50" y="60" width="100" height="90" rx="12" fill="#EBF3FF" stroke="#3B82F6" strokeWidth="4" />
              <rect x="75" y="30" width="50" height="30" rx="8" fill="#D2E4FF" stroke="#3B82F6" strokeWidth="4" />
              <circle cx="90" cy="45" r="4" fill="#3B82F6" />
              <circle cx="110" cy="45" r="4" fill="#3B82F6" />
              <path d="M92 52H108" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
              <line x1="100" y1="18" x2="100" y2="30" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
              <circle cx="100" cy="15" r="5" fill="#EF4444" />
              <path d="M70 100H130" stroke="#93C5FD" strokeWidth="4" strokeLinecap="round" />
              <path d="M70 120H110" stroke="#93C5FD" strokeWidth="4" strokeLinecap="round" />
              <rect x="30" y="90" width="20" height="12" rx="4" fill="#60A5FA" />
              <rect x="150" y="90" width="20" height="12" rx="4" fill="#60A5FA" />
            </svg>
            <p className="empty-state-text">No time logs added currently. To add new time logs, click Play or Log Time</p>
          </div>
        ) : (
          <div className="time-logs-list">
            <h3 className="logs-list-title">Today's Logs</h3>
            {isRunning && (
              <div className="time-log-row active-timer-row">
                <div className="log-col-info">
                  <span className="log-project-name">
                    {projectsList.find(p => Number(p.id) === Number(selectedProjectId))?.name || 'General Project'}
                  </span>
                  <span className="log-job-name">
                    {tasksList.find(t => Number(t.id) === Number(selectedTaskId))?.name || 'Default Job'}
                  </span>
                </div>
                <div className="log-col-desc">{description || 'Tracking current activity...'}</div>
                <div className="log-col-type billable-badge">{isBillable}</div>
                <div className="log-col-duration running-text">{formatTimerText(timeElapsed)}</div>
                <div className="log-col-action">
                  <span className="live-badge">LIVE</span>
                </div>
              </div>
            )}
            
            {logs.map((log) => (
              <div key={log.id} className="time-log-row">
                <div className="log-col-info">
                  <span className="log-project-name">{log.project}</span>
                  <span className="log-job-name">{log.job}</span>
                </div>
                <div className="log-col-desc">{log.description}</div>
                <div className={`log-col-type ${log.billable === 'Billable' ? 'billable-badge' : 'non-billable-badge'}`}>
                  {log.billable}
                </div>
                <div className="log-col-duration">{formatTimerText(log.duration)}</div>
                <div className="log-col-action">
                  <button onClick={() => handleDeleteLog(log.id)} className="btn-delete-log">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Bottom Totals Summary bar */}
      <div className="tracker-bottom-bar">
        <div className="tracker-bottom-stat">
          <span className="bottom-stat-num">{totalHoursFormatted} Hrs</span>
          <span className="bottom-stat-lbl">Total</span>
        </div>
        <div className="tracker-bottom-stat divider-left">
          <span className="bottom-stat-num">{billableHoursFormatted} Hrs</span>
          <span className="bottom-stat-lbl">Submitted</span>
        </div>
        <div className="tracker-bottom-stat divider-left active-warning">
          <span className="bottom-stat-num">{nonSubmittedHoursFormatted} Hrs</span>
          <span className="bottom-stat-lbl">Not Submitted</span>
        </div>
      </div>
    </div>
  );
}
