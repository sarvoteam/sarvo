import React, { useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, FileText, Calendar, Filter, PieChart, TrendingUp, Users } from 'lucide-react';

export default function ReportsSection() {
  const [reportType, setReportType] = useState('performance'); // attendance, performance, placement, batch
  const [exportFormat, setExportFormat] = useState('pdf');
  const [downloading, setDownloading] = useState(false);

  const triggerExport = (e) => {
    e.preventDefault();
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      const filename = `${reportType}_report_${new Date().toISOString().slice(0, 10)}.${exportFormat}`;
      alert(`Report compiled successfully!\nDownloaded file: "${filename}"`);
    }, 1500);
  };

  return (
    <div className="reports-container" style={{ padding: '24px', textAlign: 'left' }}>
      
      {/* Charts Visualization Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* Chart 1: Performance Bar Chart (Custom SVG) */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--sidebar-bg)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={16} className="icon-blue" />
              Intern Evaluation Metrics (Average)
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Updated: Today</span>
          </div>

          {/* SVG Bar Chart */}
          <div style={{ position: 'relative', height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '0 20px 24px' }}>
            
            {/* Grid background lines */}
            <div style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none', opacity: 0.1 }}>
              <div style={{ borderBottom: '1px solid var(--text-main)', width: '100%' }}></div>
              <div style={{ borderBottom: '1px solid var(--text-main)', width: '100%' }}></div>
              <div style={{ borderBottom: '1px solid var(--text-main)', width: '100%' }}></div>
              <div style={{ borderBottom: '1px solid var(--text-main)', width: '100%' }}></div>
            </div>

            {/* Bars */}
            {[
              { label: 'Technical', val: 88, color: 'var(--active-blue)' },
              { label: 'Communication', val: 78, color: '#f59e0b' },
              { label: 'Attendance', val: 92, color: '#10b981' },
              { label: 'Projects', val: 85, color: '#8b5cf6' },
              { label: 'Tasks', val: 80, color: '#ec4899' }
            ].map(bar => (
              <div key={bar.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, width: '48px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>{bar.val}%</span>
                <div style={{
                  width: '24px',
                  height: `${bar.val * 1.5}px`,
                  background: bar.color,
                  borderRadius: '6px 6px 0 0',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                  transition: 'height 1s ease-in-out'
                }} />
                <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center', marginTop: '6px', whiteSpace: 'nowrap' }}>
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Placements Ratio Donut Chart (Custom SVG) */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--sidebar-bg)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
            <PieChart size={16} className="icon-blue" />
            Placement Funnel Status
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', height: '220px' }}>
            {/* SVG Donut Circle */}
            <svg width="140" height="140" viewBox="0 0 40 40" style={{ transform: 'rotate(-90deg)' }}>
              {/* Total 100% circle-stroke: placed=60, pipeline=25, unplaced=15 */}
              {/* Track */}
              <circle cx="20" cy="20" r="15.91549430918954" fill="transparent" stroke="var(--primary-bg)" strokeWidth="4" />
              {/* Placed: 60% */}
              <circle cx="20" cy="20" r="15.91549430918954" fill="transparent" stroke="#10b981" strokeWidth="4.2" strokeDasharray="60 40" strokeDashoffset="0" />
              {/* Pipeline: 25% */}
              <circle cx="20" cy="20" r="15.91549430918954" fill="transparent" stroke="#f59e0b" strokeWidth="4.2" strokeDasharray="25 75" strokeDashoffset="-60" />
              {/* Unplaced: 15% */}
              <circle cx="20" cy="20" r="15.91549430918954" fill="transparent" stroke="var(--active-blue)" strokeWidth="4.2" strokeDasharray="15 85" strokeDashoffset="-85" />
            </svg>

            {/* Chart Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: '11.5px', color: 'var(--text-main)' }}>Placed: <strong>60%</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                <span style={{ fontSize: '11.5px', color: 'var(--text-main)' }}>In Pipeline: <strong>25%</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--active-blue)' }} />
                <span style={{ fontSize: '11.5px', color: 'var(--text-main)' }}>Unplaced: <strong>15%</strong></span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Exporter Form Dashboard */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--sidebar-bg)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <BarChart3 size={18} className="icon-blue" />
          Export Reports Registry
        </h3>

        <form onSubmit={triggerExport} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', alignItems: 'end' }}>
          
          {/* Parameter 1: Select Type */}
          <div className="form-group">
            <label>Report Type Category</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                background: 'var(--primary-bg)',
                color: 'var(--text-main)',
                outline: 'none',
                marginTop: '6px',
                fontSize: '12.5px'
              }}
            >
              <option value="attendance">Daily Attendance Log Summary</option>
              <option value="performance">Intern Skill & Performance Scores</option>
              <option value="placement">Placement Application Funnel Statistics</option>
              <option value="batch">Batch Progress & Analytics Report</option>
            </select>
          </div>

          {/* Parameter 2: Format */}
          <div className="form-group">
            <label>Output Exporter Format</label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                background: 'var(--primary-bg)',
                color: 'var(--text-main)',
                outline: 'none',
                marginTop: '6px',
                fontSize: '12.5px'
              }}
            >
              <option value="pdf">Adobe PDF Document (.pdf)</option>
              <option value="xlsx">Microsoft Excel Spreadsheet (.xlsx)</option>
            </select>
          </div>

          {/* Submit Trigger */}
          <button
            type="submit"
            disabled={downloading}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: 'var(--active-blue)',
              color: 'white',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 10px rgba(0, 123, 245, 0.15)',
              height: '40px'
            }}
          >
            {downloading ? (
              <RefreshCw size={14} className="anim-spin" />
            ) : exportFormat === 'pdf' ? (
              <FileText size={14} />
            ) : (
              <FileSpreadsheet size={14} />
            )}
            {downloading ? 'Compiling Registry Files...' : `Compile and Download Report`}
          </button>
        </form>

        <div style={{ marginTop: '20px', display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', background: 'var(--primary-bg)', padding: '12px', borderRadius: '8px' }}>
          <span>* Downloads will consist of all filtered student data, completion certificates audit status, and ratings.</span>
          <span>Security logs: Encrypted JWT Session</span>
        </div>
      </div>
    </div>
  );
}
