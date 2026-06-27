import React, { useState } from 'react';
import { Search, Bell, Grid, LogOut, Sun, Moon, Check, MessageSquare, User } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import ProfileModal from './ProfileModal';

export default function TopNav({ employee, activeSubTab, setActiveSubTab, links = ['My Space', 'Team', 'Organization'], onLogout }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Theme Toggle Hook
  const { theme, toggleTheme } = useTheme();

  // Mock Notifications list
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'System Admin assigned you to batch "Summer BootCamp 2026".', read: false, time: '2 hours ago' },
    { id: 2, text: 'New Course: "JWT Authentication" has been added to LMS.', read: false, time: '5 hours ago' },
    { id: 3, text: 'Welcome to Sarvo People! Complete your profile registration.', read: true, time: '1 day ago' }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotifClick = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const userInitials = employee?.first_name 
    ? employee.first_name.charAt(0).toUpperCase() 
    : employee?.name 
      ? employee.name.charAt(0).toUpperCase() 
      : 'U';

  const getFriendlyRole = (role) => {
    if (!role) return 'Guest';
    const r = role.toLowerCase();
    if (r === 'reporting manager') return 'Mentor';
    if (r === 'admin') return 'Admin';
    if (r === 'intern') return 'Intern';
    if (r === 'student') return 'Student';
    if (r === 'employee') return 'Employee';
    return role;
  };

  return (
    <header className="top-nav" style={{ position: 'relative', zIndex: 1000 }}>
      {/* Left Navigation links */}
      <div className="top-nav-left">
        <span className="top-nav-brand">Sarvo Prime</span>
        {links.map((link) => (
          <span 
            key={link} 
            className={`top-nav-link ${activeSubTab === link ? 'active' : ''}`}
            onClick={() => setActiveSubTab(link)}
          >
            {link}
          </span>
        ))}
      </div>

      {/* Right side utilities */}
      <div className="top-nav-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {/* Search */}
        <div className="top-nav-search">
          <Search size={14} />
          <input type="text" placeholder="Search" />
        </div>

        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '50%',
            transition: 'background 0.2s'
          }}
          title="Toggle Theme"
          onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <div 
            className="top-nav-icon" 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={() => { setShowNotifDropdown(!showNotifDropdown); setShowDropdown(false); }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="icon-badge" style={{ position: 'absolute', top: '-4px', right: '-4px', width: '15px', height: '15px', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {unreadCount}
              </span>
            )}
          </div>

          {/* Notifications Dropdown Drawer */}
          {showNotifDropdown && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              backgroundColor: 'var(--card-bg, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: '10px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              width: '280px',
              zIndex: 1001,
              padding: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>
                <strong style={{ fontSize: '12.5px', color: 'var(--text-main)' }}>Notifications</strong>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead} 
                    style={{ background: 'none', border: 'none', color: 'var(--active-blue)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => handleNotifClick(n.id)}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      background: n.read ? 'none' : 'rgba(0,123,245,0.03)',
                      border: n.read ? '1px solid transparent' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontSize: '11.5px', color: 'var(--text-main)', lineHeight: '1.4' }}>{n.text}</div>
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>{n.time}</span>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', padding: '10px 0', display: 'block', textAlign: 'center' }}>No new notifications.</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            onClick={() => { setShowDropdown(!showDropdown); setShowNotifDropdown(false); }}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '20px',
              transition: 'background 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#ffffff' }}>
                {employee?.first_name ? `${employee.first_name} ${employee.last_name}` : employee?.name || 'User'}
              </span>
              <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.65)', fontWeight: 600 }}>
                {getFriendlyRole(employee?.role)}
              </span>
            </div>
            
            <div 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--active-blue, #007bf5) 0%, #00d2ff 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '14px',
                border: '1.5px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 2px 5px rgba(0,0,0,0.15)'
              }}
            >
              {userInitials}
            </div>
          </div>
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              backgroundColor: 'var(--card-bg, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: '6px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              padding: '8px 0',
              minWidth: '160px',
              zIndex: 1001
            }}>
              <div style={{
                padding: '6px 16px',
                fontSize: '11.5px',
                color: 'var(--text-muted)',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '4px',
                whiteSpace: 'nowrap'
              }}>
                Logged in as<br />
                <strong style={{ color: 'var(--text-main)' }}>
                  {employee?.first_name ? `${employee.first_name} ${employee.last_name || ''}` : employee?.name || 'User'}
                </strong>
                <div style={{ fontSize: '10px', color: 'var(--active-blue)', fontWeight: 700, marginTop: '2px' }}>Role: {getFriendlyRole(employee?.role)}</div>
              </div>
              <button 
                onClick={() => {
                  setShowDropdown(false);
                  setShowProfileModal(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  fontSize: '12px',
                  color: 'var(--text-main)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  transition: 'background 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--primary-bg)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <User size={14} style={{ color: 'var(--active-blue)' }} />
                My Profile
              </button>
              <button 
                onClick={() => {
                  setShowDropdown(false);
                  if (onLogout) onLogout();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  fontSize: '12px',
                  color: '#dc2626',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontFamily: 'inherit'
                }}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Apps Grid */}
        <div className="top-nav-icon">
          <Grid size={18} />
        </div>
      </div>

      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </header>
  );
}
