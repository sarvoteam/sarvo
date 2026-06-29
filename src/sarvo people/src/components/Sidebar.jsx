import React from 'react';
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
      { id: 'reports', label: 'Analytics', icon: BarChart2 }
    ],
    'Reporting Manager': [
      { id: 'home', label: 'Dashboard', icon: Home },
      { id: 'batches', label: 'My Batches', icon: Layers },
      { id: 'dailyreports', label: 'Intern Logs', icon: Activity },
      { id: 'tasks', label: 'Tasks Manager', icon: CheckSquare },
      { id: 'projects', label: 'Project reviews', icon: Folder },
      { id: 'attendance', label: 'Attendance', icon: Fingerprint },
      { id: 'leave', label: 'Approve Leaves', icon: Umbrella }
    ],
    Student: [
      { id: 'home', label: 'My Space', icon: Home },
      { id: 'lms', label: 'LMS Study', icon: BookOpen },
      { id: 'tests', label: 'Interview Tests', icon: ClipboardList },
      { id: 'projects', label: 'My Projects', icon: Folder },
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
  const userRole = user?.role === 'Admin' 
    ? 'Admin' 
    : user?.role === 'Reporting Manager' 
      ? 'Reporting Manager' 
      : user?.role === 'Student'
        ? 'Student'
        : 'Intern';

  const visibleMenuItems = menuConfig[userRole] || menuConfig['Intern'];

  return (
    <aside className="sidebar">
      {/* Brand Logo */}
      <div className="sidebar-logo" style={{ background: 'linear-gradient(135deg, var(--active-blue), #00d2ff)', color: 'white', fontWeight: 800, fontSize: '18px' }}>
        S
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
