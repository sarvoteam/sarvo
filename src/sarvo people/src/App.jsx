import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Dashboard from './components/Dashboard';
import LeaveTracker from './components/LeaveTracker';
import AttendanceSection from './components/AttendanceSection';
import TimeTracker from './components/TimeTracker';
import Performance from './components/Performance';
import TasksSection from './components/TasksSection';
import CalendarView from './components/CalendarView';
import { MessageSquare } from 'lucide-react';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';


export default function App() {
  const [employee, setEmployee] = useState(() => {
    const saved = localStorage.getItem('zoho_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState(() => {
    if (employee) {
      const isAdmin = employee.role === 'Reporting Manager' || employee.role === 'Admin' || employee.department === 'Administration';
      return isAdmin ? 'admin' : 'home';
    }
    return 'home';
  });
  const [activeSubTab, setActiveSubTab] = useState('My Space');
  const [subNavItem, setSubNavItem] = useState('Overview');

  // Monitor active tab and set defaults
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
    } else {
      setActiveSubTab('My Space');
      setSubNavItem('Overview');
    }
  }, [activeTab]);

  // Enforce role separation - redirect Admin to admin tab, and Employee from admin tab
  useEffect(() => {
    if (employee) {
      const isAdmin = employee.role === 'Reporting Manager' || employee.role === 'Admin' || employee.department === 'Administration';
      if (isAdmin) {
        if (activeTab !== 'admin') {
          setActiveTab('admin');
        }
      } else {
        if (activeTab === 'admin') {
          setActiveTab('home');
        }
      }
    }
  }, [activeTab, employee]);

  // Quick check-in check to show avatar in header
  useEffect(() => {
    if (!employee) return;
    const fetchEmployee = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/employees/${employee.employee_id}`);
        if (res.ok) {
          const data = await res.json();
          setEmployee(data);
          localStorage.setItem('zoho_current_user', JSON.stringify(data));
        }
      } catch (err) {
        // Fallback for mock mode
        const localMe = localStorage.getItem('zoho_current_user');
        if (localMe) {
          setEmployee(JSON.parse(localMe));
        }
      }
    };
    fetchEmployee();
    // Poll occasionally to keep avatar and checkin state synced
    const interval = setInterval(fetchEmployee, 3000);
    return () => clearInterval(interval);
  }, [employee?.employee_id]);

  const topNavLinks = activeTab === 'leave' || activeTab === 'attendance'
    ? ['My Data', 'Team']
    : activeTab === 'timetracker' || activeTab === 'performance'
      ? ['My Data']
      : activeTab === 'tasks'
        ? ['Tasks', 'Checklists']
        : activeTab === 'admin'
          ? ['Control Center']
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
              : ['Overview', 'Dashboard', 'Calendar'];

  if (!employee) {
    return <Login onLoginSuccess={(emp) => setEmployee(emp)} />;
  }

  return (
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
            localStorage.removeItem('zoho_current_user');
            setEmployee(null);
            setActiveTab('home');
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
        ) : (
          <div style={{ padding: '40px', color: '#6b7280', textAlign: 'center' }}>
            <h2>{activeTab.toUpperCase()} Section</h2>
            <p style={{ marginTop: '10px' }}>This section is currently under development to match the Zoho layout.</p>
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

        {/* 5. Bottom Chat / Ticker status bar */}
        <footer className="bottom-chat-bar">
          <div className="chat-input-wrapper">
            <MessageSquare size={14} />
            <span>Here is your Smart Chat (Ctrl+Space)</span>
          </div>

          <div className="stock-info">
            LICI <span style={{ color: '#00b87c' }}>▲ +1.73%</span>
          </div>

          <div className="chat-actions-right">
            <span>Chats</span>
            <span>Contacts</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
