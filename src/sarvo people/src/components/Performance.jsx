import React from 'react';

export default function Performance() {
  return (
    <div className="performance-container">
      {/* Main empty state container */}
      <div className="performance-content-card">
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
          <h2 className="empty-state-title" style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginTop: '15px' }}>
            No Data Found
          </h2>
        </div>
      </div>
    </div>
  );
}
