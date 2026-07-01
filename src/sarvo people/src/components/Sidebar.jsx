import React from 'react';
import sarvoLogo from '../../../assets/sarvo.jpg';
import {
  Home,
  Layers,
  Activity,
  BookOpen,
  Folder,
  Briefcase,
  Cpu,
  Award,
  BarChart2,
  ShieldCheck,
  Fingerprint,
  Umbrella,
  Clock,
  Trophy,
  CheckSquare,
  MessageSquare,
  Users,
  ClipboardList
} from 'lucide-react';

export const ADMIN_MODULES = [
  { id: 'home', label: 'Dashboard' },
  { id: 'batches', label: 'Batches' },
  { id: 'admin', label: 'Employees' },
  { id: 'tests', label: 'Test Settings' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'leave', label: 'Leaves' },
  { id: 'lms', label: 'LMS Hub' },
  { id: 'projects', label: 'Projects' },
  { id: 'placements', label: 'Placements' },
  { id: 'jobapplications', label: 'Job Apply' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'reports', label: 'Analytics' },
  { id: 'competitions', label: 'Competitions' }
];

export default function Sidebar({ activeTab, setActiveTab, user }) {
  // Master menu items map
  const menuConfig = {
    Admin: [
      { id: 'home', label: 'Dashboard', icon: Home },
      { id: 'batches', label: 'Batches', icon: Layers },
      { id: 'admin', label: 'Employees', icon: ShieldCheck },
      { id: 'tests', label: 'Test Settings', icon: ClipboardList },
      { id: 'attendance', label: 'Attendance', icon: Fingerprint },
      { id: 'leave', label: 'Leaves', icon: Umbrella },
      { id: 'lms', label: 'LMS Hub', icon: BookOpen },
      { id: 'projects', label: 'Projects', icon: Folder },
      { id: 'placements', label: 'Placements', icon: Briefcase },
      { id: 'jobapplications', label: 'Job Apply', icon: ClipboardList },
      { id: 'certificates', label: 'Certificates', icon: Award },
      { id: 'reports', label: 'Analytics', icon: BarChart2 },
      { id: 'competitions', label: 'Competitions', icon: Trophy }
    ],
    Mentor: [
      { id: 'home', label: 'Dashboard', icon: Home },
      { id: 'batches', label: 'My Batches', icon: Layers },
      { id: 'lms', label: 'LMS Schedule', icon: BookOpen },
      { id: 'dailyreports', label: 'Intern Logs', icon: Activity },
      { id: 'tasks', label: 'Tasks Manager', icon: CheckSquare },
      { id: 'projects', label: 'Project reviews', icon: Folder },
      { id: 'attendance', label: 'Attendance', icon: Fingerprint },
      { id: 'leave', label: 'Leaves', icon: Umbrella }
    ],
    Student: [
      { id: 'home', label: 'My Space', icon: Home },
      { id: 'student_batch', label: 'Batch Details', icon: Layers },
      { id: 'student_attendance', label: 'My Attendance', icon: Fingerprint },
      { id: 'tests', label: 'Interview Tests', icon: ClipboardList },
      { id: 'projects', label: 'My Projects', icon: Folder },
      { id: 'lms', label: 'LMS Study', icon: BookOpen },
      { id: 'placements', label: 'Job Placements', icon: Briefcase },
      { id: 'aihub', label: 'AI Prep Hub', icon: Cpu },
      { id: 'certificates', label: 'My Certificate', icon: Award }
    ],
    Intern: [
      { id: 'home', label: 'My Space', icon: Home },
      { id: 'dailyreports', label: 'Daily Logs', icon: Activity },
      { id: 'lms', label: 'LMS Study', icon: BookOpen },
      { id: 'tasks', label: 'Task Checklists', icon: CheckSquare },
      { id: 'projects', label: 'My Projects', icon: Folder },
      { id: 'placements', label: 'Job Placements', icon: Briefcase },
      { id: 'aihub', label: 'AI Prep Hub', icon: Cpu },
      { id: 'certificates', label: 'My Certificate', icon: Award },
      { id: 'leave', label: 'Leaves', icon: Umbrella },
      { id: 'attendance', label: 'Attendance', icon: Fingerprint }
    ]
  };
 
  // Resolve role list
  const userRole =
    user?.role === 'Admin'
      ? 'Admin'
      : user?.role === 'Reporting Manager' || user?.role === 'Mentor'
        ? 'Mentor'
        : user?.role === 'Student'
          ? 'Student'
          : 'Intern';

  let visibleMenuItems = menuConfig[userRole] || menuConfig['Intern'];

  if (userRole === 'Admin') {
    if (user?.allowed_modules && Array.isArray(user.allowed_modules) && user.allowed_modules.length > 0) {
      visibleMenuItems = visibleMenuItems.filter(item => user.allowed_modules.includes(item.id));
    }
  }

  return (
    <aside className="sidebar">
      {/* Brand Logo */}
      <div className="sidebar-logo" style={{ 
        width: '32px', 
        height: '32px', 
        minWidth: '32px', 
        minHeight: '32px', 
        borderRadius: '50%', 
        overflow: 'hidden', 
        background: 'none',
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img 
          src={sarvoLogo} 
          alt="Sarvo Logo" 
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
        />
      </div>

      {/* Navigation Menu */}
      <div className="sidebar-menu">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <div
              key={item.id}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <div className="sidebar-icon-wrapper">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span>{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Footer (Chats & Contacts) */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-item">
          <MessageSquare size={18} />
          <span style={{ fontSize: '9px', marginTop: '2px' }}>Chats</span>
        </div>
        <div className="sidebar-footer-item">
          <Users size={18} />
          <span style={{ fontSize: '9px', marginTop: '2px' }}>Contacts</span>
        </div>
      </div>
    </aside>
  );
}
