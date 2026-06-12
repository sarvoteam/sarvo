import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

// Import newly structured sub-components
import Sidebar from '../sarvo people/src/components/Sidebar';
import TopNav from '../sarvo people/src/components/TopNav';
import AuthSection from '../sarvo people/src/components/AuthSection';
import Dashboard from '../sarvo people/src/components/Dashboard';
import LeaveTracker from '../sarvo people/src/components/LeaveTracker';
import AttendanceSection from '../sarvo people/src/components/AttendanceSection';
import TimeTracker from '../sarvo people/src/components/TimeTracker';
import Performance from '../sarvo people/src/components/Performance';
import TasksSection from '../sarvo people/src/components/TasksSection';
import CalendarView from '../sarvo people/src/components/CalendarView';
import AdminPanel from '../sarvo people/src/components/AdminPanel';

// Import New System Components
import LMSSection from '../sarvo people/src/components/LMSSection';
import ProjectSection from '../sarvo people/src/components/ProjectSection';
import PlacementSection from '../sarvo people/src/components/PlacementSection';
import AIFeaturesSection from '../sarvo people/src/components/AIFeaturesSection';
import CertificateSection from '../sarvo people/src/components/CertificateSection';
import ReportsSection from '../sarvo people/src/components/ReportsSection';
import BatchSection from '../sarvo people/src/components/BatchSection';
import DailyReportsSection from '../sarvo people/src/components/DailyReportsSection';

// Import Sarvo People styles (scoped within .sarvo-people-wrapper)
import '../sarvo people/src/styles/sidebar.css';
import '../sarvo people/src/styles/topnav.css';
import '../sarvo people/src/styles/dashboard.css';
import '../sarvo people/src/styles/attendance.css';
import '../sarvo people/src/styles/leave.css';
import '../sarvo people/src/styles/tracker.css';
import '../sarvo people/src/styles/tasks.css';
import '../sarvo people/src/styles/profile.css';
import '../sarvo people/src/styles/calendar.css';
import '../sarvo people/src/styles/admin.css';
import '../sarvo people/src/styles/login.css';

export default function SarvoPeoplePage() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('sarvo_people_auth') === 'true';
  });

  const [employee, setEmployee] = useState(() => {
    if (sessionStorage.getItem('sarvo_people_auth') === 'true') {
      const saved = localStorage.getItem('sarvo_current_user');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  // Default active tab based on role on login
  const [activeTab, setActiveTab] = useState('home');
  const [activeSubTab, setActiveSubTab] = useState('My Space');
  const [subNavItem, setSubNavItem] = useState('Overview');

  useEffect(() => {
    if (employee) {
      const isSystemAdmin = employee.role === 'Admin';
      const isSystemMentor = employee.role === 'Reporting Manager';
      if (isSystemAdmin) {
        setActiveTab('home');
        setActiveSubTab('Control Center');
        setSubNavItem('Roster Status');
      } else if (isSystemMentor) {
        setActiveTab('home');
        setActiveSubTab('Mentor Space');
        setSubNavItem('Overview');
      } else {
        setActiveTab('home');
        setActiveSubTab('My Space');
        setSubNavItem('Overview');
      }
    }
  }, [employee]);

  // Handle secondary sub-routing selectors
  useEffect(() => {
    if (activeTab === 'leave') {
      setActiveSubTab('My Data');
      setSubNavItem('Leave Summary');
    } else if (activeTab === 'attendance') {
      setActiveSubTab('My Data');
      setSubNavItem('Attendance Summary');
    } else if (activeTab === 'timetracker') {
      setActiveSubTab('My Data');
      setSubNavItem('Time Logs');
    } else if (activeTab === 'performance') {
      setActiveSubTab('My Data');
      setSubNavItem('KRA');
    } else if (activeTab === 'tasks') {
      setActiveSubTab('Tasks');
      setSubNavItem('My Tasks');
    } else if (activeTab === 'admin') {
      setActiveSubTab('Control Center');
      setSubNavItem('Employee Records');
    } else if (activeTab === 'lms') {
      setActiveSubTab('LMS Hub');
      setSubNavItem('My Courses');
    } else if (activeTab === 'projects') {
      setActiveSubTab('Project Spaces');
      setSubNavItem('My Projects');
    } else if (activeTab === 'placements') {
      setActiveSubTab('Jobs Portal');
      setSubNavItem('Openings');
    } else if (activeTab === 'aihub') {
      setActiveSubTab('AI Sandbox');
      setSubNavItem('AI Features');
    } else if (activeTab === 'certificates') {
      setActiveSubTab('Credentials');
      setSubNavItem('My Certificates');
    } else if (activeTab === 'reports') {
      setActiveSubTab('Analytics Hub');
      setSubNavItem('SVG Graphs');
    } else if (activeTab === 'batches') {
      setActiveSubTab('Cohorts');
      setSubNavItem('Active Batches');
    } else if (activeTab === 'dailyreports') {
      setActiveSubTab('Work Logs');
      setSubNavItem('Daily Logs');
    } else {
      setActiveSubTab('My Space');
      setSubNavItem('Overview');
    }
  }, [activeTab]);

  const topNavLinks = activeTab === 'leave' || activeTab === 'attendance'
    ? ['My Data', 'Team']
    : activeTab === 'timetracker' || activeTab === 'performance'
      ? ['My Data']
      : activeTab === 'tasks'
        ? ['Tasks', 'Checklists']
        : activeTab === 'admin'
          ? ['Control Center']
          : activeTab === 'lms'
            ? ['LMS Hub']
            : activeTab === 'projects'
              ? ['Project Spaces']
              : activeTab === 'placements'
                ? ['Jobs Portal']
                : activeTab === 'aihub'
                  ? ['AI Sandbox']
                  : activeTab === 'certificates'
                    ? ['Credentials']
                    : activeTab === 'reports'
                      ? ['Analytics Hub']
                      : activeTab === 'batches'
                        ? ['Cohorts']
                        : activeTab === 'dailyreports'
                          ? ['Work Logs']
                          : ['My Space', 'Team', 'Organization'];

  const subNavLinks = activeTab === 'leave'
    ? ['Leave Summary', 'Leave Requests', 'Compensatory Request']
    : activeTab === 'attendance'
      ? ['Attendance Summary', 'Regularization', 'On Duty']
      : activeTab === 'timetracker'
        ? ['Time Logs', 'Timesheets', 'Jobs', 'Projects', 'Job Schedule']
        : activeTab === 'performance'
          ? ['KRA', 'Skill Set', 'Goals', 'Competency', 'Feedback']
          : activeTab === 'tasks'
            ? ['My Tasks', 'Track Tasks', 'Form View']
            : activeTab === 'admin'
              ? ['Employee Records']
              : activeTab === 'lms'
                ? ['My Courses', 'Certificates']
                : activeTab === 'projects'
                  ? ['My Projects', 'Syllabus Review']
                  : activeTab === 'placements'
                    ? ['Openings', 'Applications Funnel']
                    : activeTab === 'aihub'
                      ? ['AI Features', 'Mock Interview Chat']
                      : activeTab === 'certificates'
                        ? ['My Certificates', 'Public Verification']
                        : activeTab === 'reports'
                          ? ['SVG Graphs', 'Data Exporters']
                          : activeTab === 'batches'
                            ? ['Active Batches', 'Roster Map']
                            : activeTab === 'dailyreports'
                              ? ['Daily Logs', 'Mentor Comments']
                              : ['Overview', 'Dashboard', 'Calendar'];

  // ── Show Login if not authenticated ──
  if (!isAuthenticated) {
    return (
      <div className="sarvo-people-wrapper">
        <AuthSection 
          onLoginSuccess={(emp) => {
            setEmployee(emp);
            setIsAuthenticated(true);
          }}
          onBackToSite={() => navigate('/')}
        />
      </div>
    );
  }

  // ── Show Sarvo People Dashboard ──
  return (
    <div className="sarvo-people-wrapper">
      <style>{`
        .sarvo-people-wrapper {
          --primary-bg: ${theme === 'dark' ? '#070a13' : '#f4f7fa'};
          --sidebar-bg: ${theme === 'dark' ? '#0a0d18' : '#0f1c3f'};
          --top-nav-bg: ${theme === 'dark' ? '#0f1424' : '#162447'};
          --top-nav-text: #ffffff;
          --active-blue: #007bf5;
          --border-color: ${theme === 'dark' ? '#1a233a' : '#e5e9f2'};
          --text-main: ${theme === 'dark' ? '#e2e8f0' : '#333333'};
          --text-muted: ${theme === 'dark' ? '#64748b' : '#8e9bb3'};
          --text-red: #ef4444;
          --text-green: #10b981;
          --btn-green: #10b981;
          --btn-green-hover: ${theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#e8f7f2'};
          --card-bg: ${theme === 'dark' ? '#0f172a' : '#ffffff'};
          --card-shadow: ${theme === 'dark' ? '0 10px 25px rgba(0, 0, 0, 0.2)' : '0 4px 12px rgba(0, 0, 0, 0.04)'};
          --font-family: 'Inter', sans-serif;
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 9999;
          background-color: var(--primary-bg);
          color: var(--text-main);
          font-family: var(--font-family);
          overflow: hidden;
        }
        .sarvo-people-wrapper * {
          box-sizing: border-box;
        }
        .sarvo-people-wrapper .app-container {
          display: flex;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
        }
        .sarvo-people-wrapper .main-wrapper {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          overflow: hidden;
          height: 100vh;
        }
        .sarvo-people-wrapper .sub-nav {
          height: 40px;
          background-color: var(--card-bg);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          padding: 0 24px;
          gap: 25px;
          flex-shrink: 0;
        }
        .sarvo-people-wrapper .sub-nav-link {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 500;
          text-decoration: none;
          padding: 11px 0;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }
        .sarvo-people-wrapper .sub-nav-link:hover,
        .sarvo-people-wrapper .sub-nav-link.active {
          color: var(--active-blue);
          border-bottom-color: var(--active-blue);
        }
        .sarvo-people-wrapper .main-content {
          flex-grow: 1;
          overflow-y: auto;
          padding: 0;
          position: relative;
        }
        .sarvo-people-wrapper .bottom-chat-bar {
          height: 40px;
          background-color: var(--card-bg);
          border-top: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          flex-shrink: 0;
        }
        .sarvo-people-wrapper .chat-input-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
        }
        .sarvo-people-wrapper .stock-info {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-green);
        }
        .sarvo-people-wrapper .chat-actions-right {
          display: flex;
          align-items: center;
          gap: 15px;
          color: var(--text-muted);
        }
      `}</style>
      <div className="app-container">
        {/* 1. Left Sidebar Navigation */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={employee} />

        {/* Main Workspace Frame */}
        <div className="main-wrapper">
          {/* 2. Top Header Navigation */}
          <TopNav
            employee={employee}
            activeSubTab={activeSubTab}
            setActiveSubTab={setActiveSubTab}
            links={topNavLinks}
            onLogout={() => {
              localStorage.removeItem('sarvo_current_user');
              sessionStorage.removeItem('sarvo_people_auth');
              setEmployee(null);
              setIsAuthenticated(false);
            }}
          />

          {/* 3. Sub-Navigation Bar */}
          <div className="sub-nav">
            {subNavLinks.map((item) => (
              <span
                key={item}
                className={`sub-nav-link ${subNavItem === item ? 'active' : ''}`}
                onClick={() => setSubNavItem(item)}
              >
                {item}
              </span>
            ))}
          </div>

          {/* 4. Page Content area */}
          <div className="main-content">
            {activeTab === 'home' ? (
              subNavItem === 'Calendar' ? (
                <CalendarView />
              ) : (
                <Dashboard />
              )
            ) : activeTab === 'attendance' ? (
              <AttendanceSection />
            ) : activeTab === 'leave' ? (
              <LeaveTracker />
            ) : activeTab === 'timetracker' ? (
              <TimeTracker />
            ) : activeTab === 'performance' ? (
              <Performance />
            ) : activeTab === 'tasks' ? (
              <TasksSection />
            ) : activeTab === 'admin' ? (
              <AdminPanel />
            ) : activeTab === 'lms' ? (
              <LMSSection />
            ) : activeTab === 'projects' ? (
              <ProjectSection currentUser={employee} />
            ) : activeTab === 'placements' ? (
              <PlacementSection currentUser={employee} />
            ) : activeTab === 'aihub' ? (
              <AIFeaturesSection currentUser={employee} />
            ) : activeTab === 'certificates' ? (
              <CertificateSection currentUser={employee} />
            ) : activeTab === 'reports' ? (
              <ReportsSection />
            ) : activeTab === 'batches' ? (
              <BatchSection currentUser={employee} />
            ) : activeTab === 'dailyreports' ? (
              <DailyReportsSection currentUser={employee} />
            ) : (
              <div style={{ padding: '40px', color: '#6b7280', textAlign: 'center' }}>
                <h2>{activeTab.toUpperCase()} Section</h2>
                <p style={{ marginTop: '10px' }}>This section is currently under development.</p>
                <button
                  onClick={() => setActiveTab('home')}
                  style={{
                    marginTop: '20px',
                    padding: '8px 16px',
                    backgroundColor: '#007bf5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Go to Home Dashboard
                </button>
              </div>
            )}
          </div>

          {/* 5. Bottom Chat / Ticker status bar */}
          <footer className="bottom-chat-bar">
            <div className="chat-input-wrapper">
              <span className="chat-icon" style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%', background: 'var(--border-color)', border: '1px solid var(--text-muted)' }}></span>
              <span>Here is your Smart Chat (Ctrl+Space)</span>
            </div>

            <div className="stock-info">
              SARVO TECH <span style={{ color: '#10b981' }}>▲ +3.42%</span>
            </div>

            <div className="chat-actions-right">
              <span>Chats</span>
              <span>Contacts</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
