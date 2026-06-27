import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Layers, Calendar, User, GraduationCap, AlertCircle, Plus, BookOpen } from 'lucide-react';
import { cohortApi } from '../apis/cohortApi';
import { Save } from 'lucide-react';

const SESSION_TYPES = ['Lecture','Lab / Hands-On','Quiz / Assessment','Self-Study','Mentor Session','Project Work','Review & Recap'];

const TYPE_COLORS = {
  'Lecture':           { bg:'rgba(0,123,245,0.12)',   color:'#007bf5',  light:'rgba(0,123,245,0.06)'   },
  'Lab / Hands-On':    { bg:'rgba(16,185,129,0.12)',  color:'#10b981',  light:'rgba(16,185,129,0.06)'  },
  'Quiz / Assessment': { bg:'rgba(245,158,11,0.12)',  color:'#f59e0b',  light:'rgba(245,158,11,0.06)'  },
  'Self-Study':        { bg:'rgba(167,139,250,0.12)', color:'#a78bfa',  light:'rgba(167,139,250,0.06)' },
  'Mentor Session':    { bg:'rgba(251,113,133,0.12)', color:'#fb7185',  light:'rgba(251,113,133,0.06)' },
  'Project Work':      { bg:'rgba(251,146,60,0.12)',  color:'#fb923c',  light:'rgba(251,146,60,0.06)'  },
  'Review & Recap':    { bg:'rgba(99,102,241,0.12)',  color:'#6366f1',  light:'rgba(99,102,241,0.06)'  },
};

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function toISO(y, m, d) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}
function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// ── Read-only Day View Modal (Student) ──
function DayViewModal({ iso, entry, onClose }) {
  const [y, m, d] = iso.split('-');
  const label = new Date(+y, +m-1, +d).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
  const tc = entry ? (TYPE_COLORS[entry.type] || TYPE_COLORS['Lecture']) : null;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'var(--card-bg)', border:'1px solid var(--border-color)', borderRadius:'18px', width:'100%', maxWidth:'480px', boxShadow:'0 20px 60px rgba(0,0,0,0.2)', overflow:'hidden' }}>
        {/* Header */}
        <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid var(--border-color)', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:'11px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'4px' }}>Day Schedule</div>
            <div style={{ fontSize:'16px', fontWeight:800, color:'var(--text-main)' }}>{label}</div>
          </div>
          <button onClick={onClose} style={{ background:'var(--primary-bg)', border:'1px solid var(--border-color)', borderRadius:'8px', padding:'6px', cursor:'pointer', color:'var(--text-muted)', display:'flex' }}>
            <X size={15}/>
          </button>
        </div>
        {/* Content */}
        <div style={{ padding:'22px 24px 24px', display:'flex', flexDirection:'column', gap:'16px' }}>
          {entry ? (
            <>
              <div>
                <div style={{ fontSize:'11px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'8px' }}>Session Type</div>
                <span style={{ display:'inline-block', padding:'5px 14px', borderRadius:'20px', fontSize:'12.5px', fontWeight:700, background: tc.bg, color: tc.color, border:`1px solid ${tc.bg}` }}>
                  {entry.type}
                </span>
              </div>
              <div>
                <div style={{ fontSize:'11px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>Topic</div>
                <div style={{ fontSize:'15px', fontWeight:700, color:'var(--text-main)' }}>{entry.topic}</div>
              </div>
              {entry.description && (
                <div>
                  <div style={{ fontSize:'11px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'6px' }}>Details</div>
                  <div style={{ fontSize:'13px', color:'var(--text-muted)', lineHeight:1.6, background:'var(--primary-bg)', padding:'12px 14px', borderRadius:'10px', border:'1px solid var(--border-color)' }}>
                    {entry.description}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign:'center', padding:'20px 0', color:'var(--text-muted)' }}>
              <Calendar size={28} style={{ opacity:0.3, marginBottom:'8px' }}/>
              <div style={{ fontSize:'13px', fontWeight:600 }}>No topic scheduled for this day</div>
            </div>
          )}
        </div>
        <div style={{ padding:'0 24px 20px', display:'flex', justifyContent:'flex-end' }}>
          <button onClick={onClose} style={{ padding:'8px 20px', border:'1px solid var(--border-color)', borderRadius:'8px', fontSize:'12px', fontWeight:600, color:'var(--text-muted)', background:'none', cursor:'pointer' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Modal (Admin) ──
function DayModal({ iso, entry, onClose, onSave }) {
  const [y, m, d] = iso.split('-');
  const label = new Date(+y, +m-1, +d).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
  const [topic, setTopic] = useState(entry?.topic || '');
  const [type, setType]   = useState(entry?.type || 'Lecture');
  const [desc, setDesc]   = useState(entry?.description || '');
  const tc = TYPE_COLORS[type] || TYPE_COLORS['Lecture'];

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}>
      <div style={{ background:'var(--card-bg)', border:'1px solid var(--border-color)', borderRadius:'18px', width:'100%', maxWidth:'520px', boxShadow:'0 20px 60px rgba(0,0,0,0.2)', overflow:'hidden' }}>
        <div style={{ padding:'20px 24px 16px', borderBottom:'1px solid var(--border-color)', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:'11px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'4px' }}>Learning Plan</div>
            <div style={{ fontSize:'16px', fontWeight:800, color:'var(--text-main)' }}>{label}</div>
          </div>
          <button onClick={onClose} style={{ background:'var(--primary-bg)', border:'1px solid var(--border-color)', borderRadius:'8px', padding:'6px', cursor:'pointer', color:'var(--text-muted)', display:'flex' }}>
            <X size={15}/>
          </button>
        </div>
        <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:'14px' }}>
          <div>
            <label style={{ fontSize:'11.5px', fontWeight:700, color:'var(--text-muted)', display:'block', marginBottom:'6px' }}>SESSION TYPE</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
              {SESSION_TYPES.map(t => {
                const c = TYPE_COLORS[t]||TYPE_COLORS['Lecture'];
                return (
                  <button key={t} onClick={()=>setType(t)}
                    style={{ padding:'5px 12px', border:`1.5px solid ${type===t?c.color:'var(--border-color)'}`, borderRadius:'20px', fontSize:'11.5px', fontWeight:700, cursor:'pointer', background:type===t?c.bg:'transparent', color:type===t?c.color:'var(--text-muted)', transition:'all 0.15s' }}>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label style={{ fontSize:'11.5px', fontWeight:700, color:'var(--text-muted)', display:'block', marginBottom:'6px' }}>TOPIC TITLE</label>
            <input type="text" placeholder="e.g. Introduction to React Hooks" value={topic} onChange={e=>setTopic(e.target.value)} autoFocus
              style={{ width:'100%', padding:'10px 14px', border:'1px solid var(--border-color)', borderRadius:'10px', fontSize:'13.5px', fontWeight:600, background:'var(--primary-bg)', color:'var(--text-main)', outline:'none' }}/>
          </div>
          <div>
            <label style={{ fontSize:'11.5px', fontWeight:700, color:'var(--text-muted)', display:'block', marginBottom:'6px' }}>DETAILS / NOTES</label>
            <textarea placeholder="What will be covered? Add objectives, tasks, or notes..." value={desc} onChange={e=>setDesc(e.target.value)} rows={3}
              style={{ width:'100%', padding:'10px 14px', border:'1px solid var(--border-color)', borderRadius:'10px', fontSize:'12.5px', background:'var(--primary-bg)', color:'var(--text-main)', resize:'vertical', outline:'none', fontFamily:'inherit' }}/>
          </div>
        </div>
        <div style={{ padding:'14px 24px 20px', borderTop:'1px solid var(--border-color)', display:'flex', justifyContent:'flex-end', gap:'8px' }}>
          <button onClick={onClose} style={{ padding:'8px 16px', border:'1px solid var(--border-color)', borderRadius:'8px', fontSize:'12px', fontWeight:600, color:'var(--text-muted)', background:'none', cursor:'pointer' }}>Cancel</button>
          <button onClick={()=>onSave({ topic, type, description: desc })} disabled={!topic.trim()}
            style={{ padding:'8px 20px', border:'none', borderRadius:'8px', fontSize:'12px', fontWeight:700, color:'white', background: topic.trim()?'var(--active-blue)':'var(--border-color)', cursor: topic.trim()?'pointer':'not-allowed' }}>
            Save Day
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Shared Month Grid ──
function MonthGrid({ path, calYear, calMonth, onPrevMonth, onNextMonth, onDayClick, readOnly, batchName, batchStart, batchEnd, configuredCount }) {
  const totalDays = daysInMonth(calYear, calMonth);
  const todayISO = toISO(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Month nav bar */}
      <div style={{ background:'var(--card-bg)', borderBottom:'1px solid var(--border-color)', padding:'12px 22px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div>
          <div style={{ fontSize:'14px', fontWeight:800, color:'var(--text-main)' }}>{batchName}</div>
          <div style={{ fontSize:'11px', color:'var(--text-muted)' }}>{batchStart} → {batchEnd} &nbsp;•&nbsp; {configuredCount} days scheduled</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'var(--primary-bg)', border:'1px solid var(--border-color)', borderRadius:'10px', padding:'5px 12px' }}>
          <button onClick={onPrevMonth} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', padding:'2px' }}><ChevronLeft size={15}/></button>
          <span style={{ fontSize:'13px', fontWeight:800, color:'var(--text-main)', minWidth:'120px', textAlign:'center' }}>{MONTHS[calMonth]} {calYear}</span>
          <button onClick={onNextMonth} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex', padding:'2px' }}><ChevronRight size={15}/></button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex:1, overflowY:'auto', padding:'20px 24px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', gap:'12px' }}>
          {Array.from({ length: totalDays }, (_, i) => {
            const day = i + 1;
            const iso = toISO(calYear, calMonth, day);
            const entry = path[iso];
            const tc = entry ? (TYPE_COLORS[entry.type] || TYPE_COLORS['Lecture']) : null;
            const isToday = iso === todayISO;

            return (
              <div key={iso} onClick={() => onDayClick(iso)}
                style={{ background: entry ? tc.light : 'var(--card-bg)', border:`1.5px solid ${entry ? tc.bg : isToday ? 'rgba(0,123,245,0.3)' : 'var(--border-color)'}`, borderRadius:'14px', padding:'14px 12px', cursor: (readOnly && !entry) ? 'default' : 'pointer', minHeight:'86px', display:'flex', flexDirection:'column', gap:'5px', transition:'all 0.18s', position:'relative', boxShadow: entry ? `0 2px 10px ${tc.bg}` : 'none' }}
                onMouseOver={e => { if(entry || !readOnly) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=entry?`0 6px 18px ${tc.bg}`:'0 4px 14px rgba(0,0,0,0.06)'; }}}
                onMouseOut={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=entry?`0 2px 10px ${tc.bg}`:'none'; }}
              >
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:'13px', fontWeight:800, color: entry?tc.color:isToday?'var(--active-blue)':'var(--text-muted)' }}>{day}</span>
                  {entry
                    ? <span style={{ fontSize:'9px', fontWeight:700, padding:'2px 5px', borderRadius:'8px', background:tc.bg, color:tc.color }}>{entry.type.split(' ')[0]}</span>
                    : (!readOnly && <Plus size={12} color="var(--text-muted)" style={{ opacity:0.35 }}/>)
                  }
                </div>
                {entry?.topic
                  ? <div style={{ fontSize:'11.5px', fontWeight:700, color:'var(--text-main)', lineHeight:1.3, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{entry.topic}</div>
                  : (!readOnly && <div style={{ fontSize:'10.5px', color:'var(--text-muted)', opacity:0.4, fontStyle:'italic' }}>Click to add</div>)
                }
                {isToday && <span style={{ position:'absolute', top:'7px', left:'7px', width:'5px', height:'5px', borderRadius:'50%', background:'var(--active-blue)', display:'block' }}/>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ──
export default function LMSSection({ currentUser }) {
  const isStudent = currentUser?.role === 'Student';
  const isMentor  = currentUser?.role === 'Mentor';

  const getFullName = (user) => {
    if (!user) return '';
    if (user.first_name) {
      return `${user.first_name} ${user.last_name || ''}`.trim();
    }
    return user.name || '';
  };

  const [batches, setBatches]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [learningPaths, setLearningPaths] = useState({});
  const [modalDate, setModalDate]         = useState(null);
  const today = new Date();
  const [calYear, setCalYear]   = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const fmtDate = (str) => { if(!str) return 'N/A'; return new Date(str).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); };
  const prevMonth = () => { if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1); };
  const nextMonth = () => { if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1); };

  useEffect(()=>{
    const load = async () => {
      try {
        const cohorts = await cohortApi.getCohorts();
        setBatches(cohorts || []);

        if (isStudent) {
          // Auto-find and open the student's own batch
          const allStudents = await cohortApi.getAllStudents();
          const me = allStudents.find(s => s.email?.toLowerCase() === currentUser?.email?.toLowerCase());
          if (me?.cohort_id) {
            const myBatch = cohorts.find(c => c.id === me.cohort_id);
            if (myBatch) {
              setSelectedBatch(myBatch);
              if(myBatch.start_date){ const d=new Date(myBatch.start_date); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); }
              const saved = localStorage.getItem(`lms_path_${myBatch.id}`);
              setLearningPaths(prev=>({ ...prev, [myBatch.id]: saved ? JSON.parse(saved) : {} }));
            }
          }
        } else if (isMentor) {
          // Auto-find and open if the mentor only has 1 batch assigned
          const mentorName = getFullName(currentUser).toLowerCase();
          const mentorEmail = (currentUser?.email || '').toLowerCase();
          const myBatches = cohorts.filter(b => 
            (b.mentor_email && b.mentor_email.toLowerCase() === mentorEmail) ||
            (b.mentor_name && b.mentor_name.toLowerCase() === mentorName)
          );
          if (myBatches.length === 1) {
            const myBatch = myBatches[0];
            setSelectedBatch(myBatch);
            if(myBatch.start_date){ const d=new Date(myBatch.start_date); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); }
            const saved = localStorage.getItem(`lms_path_${myBatch.id}`);
            setLearningPaths(prev=>({ ...prev, [myBatch.id]: saved ? JSON.parse(saved) : {} }));
          }
        }
      } catch(err) {
        console.error('LMS load error:', err);
        setBatches([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openBatch = (batch) => {
    setSelectedBatch(batch);
    if(batch.start_date){ const d=new Date(batch.start_date); setCalYear(d.getFullYear()); setCalMonth(d.getMonth()); }
    const saved = localStorage.getItem(`lms_path_${batch.id}`);
    setLearningPaths(prev=>({ ...prev, [batch.id]: saved ? JSON.parse(saved) : {} }));
  };

  const getPath = () => learningPaths[selectedBatch?.id] || {};

  const saveEntry = (iso, data) => {
    const updated = { ...getPath(), [iso]: data };
    setLearningPaths(prev => ({ ...prev, [selectedBatch.id]: updated }));
    try { localStorage.setItem(`lms_path_${selectedBatch.id}`, JSON.stringify(updated)); } catch {}
    setModalDate(null);
  };

  const handleDayClick = (iso) => {
    if (isStudent || isMentor) {
      // Students/Mentors: only open if there's something to view
      const entry = getPath()[iso];
      if (entry) setModalDate(iso);
    } else {
      setModalDate(iso);
    }
  };

  const path = getPath();
  const configuredCount = Object.keys(path).length;

  // ── LOADING ──
  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--text-muted)', fontSize:'13px' }}>
        Loading...
      </div>
    );
  }

  // ── STUDENT: no batch found ──
  if (isStudent && !selectedBatch) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:'12px', color:'var(--text-muted)' }}>
        <BookOpen size={36} style={{ opacity:0.3 }}/>
        <div style={{ fontSize:'15px', fontWeight:600 }}>You are not assigned to any batch yet.</div>
        <div style={{ fontSize:'12.5px' }}>Contact your admin or mentor to get assigned.</div>
      </div>
    );
  }

  // ── MONTH GRID (student/mentor read-only OR admin with batch selected) ──
  if (selectedBatch) {
    const readOnly = isStudent || isMentor;
    return (
      <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>

        {/* Modals */}
        {modalDate && (isStudent || isMentor) && (
          <DayViewModal iso={modalDate} entry={path[modalDate]} onClose={()=>setModalDate(null)}/>
        )}
        {modalDate && !isStudent && !isMentor && (
          <DayModal iso={modalDate} entry={path[modalDate]} onClose={()=>setModalDate(null)} onSave={(data)=>saveEntry(modalDate, data)}/>
        )}

        {/* Back button for admin and mentor */}
        {!isStudent && (
          <div style={{ background:'var(--card-bg)', borderBottom:'1px solid var(--border-color)', padding:'10px 20px', flexShrink:0 }}>
            <button onClick={()=>setSelectedBatch(null)} style={{ background:'var(--primary-bg)', border:'1px solid var(--border-color)', borderRadius:'8px', padding:'5px 12px', cursor:'pointer', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', fontWeight:600 }}>
              <ChevronLeft size={13}/> {isMentor ? 'My Batches' : 'All Batches'}
            </button>
          </div>
        )}

        <MonthGrid
          path={path}
          calYear={calYear} calMonth={calMonth}
          onPrevMonth={prevMonth} onNextMonth={nextMonth}
          onDayClick={handleDayClick}
          readOnly={readOnly}
          batchName={selectedBatch.name}
          batchStart={fmtDate(selectedBatch.start_date)}
          batchEnd={fmtDate(selectedBatch.end_date)}
          configuredCount={configuredCount}
        />
      </div>
    );
  }

  // ── MENTOR: own batch list ──
  if (isMentor) {
    const mentorName = getFullName(currentUser).toLowerCase();
    const mentorEmail = (currentUser?.email || '').toLowerCase();
    const myBatches = batches.filter(b => 
      (b.mentor_email && b.mentor_email.toLowerCase() === mentorEmail) ||
      (b.mentor_name && b.mentor_name.toLowerCase() === mentorName)
    );
    return (
      <div style={{ padding:'28px 32px' }}>
        <div style={{ marginBottom:'24px' }}>
          <h2 style={{ fontSize:'19px', fontWeight:800, color:'var(--text-main)', margin:0, display:'flex', alignItems:'center', gap:'10px' }}>
            <GraduationCap size={21} color="var(--active-blue)"/> My Batch Schedules
          </h2>
          <p style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'5px' }}>Click a batch to view its monthly learning schedule.</p>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'18px' }}>
          {myBatches.map(batch => {
            const saved = localStorage.getItem(`lms_path_${batch.id}`);
            const dayCount = saved ? Object.keys(JSON.parse(saved)).length : 0;
            return (
              <div key={batch.id} onClick={()=>openBatch(batch)}
                style={{ background:'var(--card-bg)', border:'1px solid var(--border-color)', borderRadius:'16px', padding:'22px', cursor:'pointer', transition:'all 0.2s', boxShadow:'var(--card-shadow)', position:'relative' }}
                onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(0,123,245,0.4)';e.currentTarget.style.boxShadow='0 4px 20px rgba(0,123,245,0.1)';} }
                onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border-color)';e.currentTarget.style.boxShadow='var(--card-shadow)';} }
              >
                <div style={{ position:'absolute', top:'14px', right:'14px' }}>
                  <span style={{ fontSize:'10px', fontWeight:700, padding:'3px 9px', borderRadius:'20px', background: dayCount>0?'rgba(16,185,129,0.1)':'rgba(245,158,11,0.1)', color: dayCount>0?'#10b981':'#f59e0b', border:`1px solid ${dayCount>0?'rgba(16,185,129,0.2)':'rgba(245,158,11,0.2)'}` }}>
                    {dayCount>0?`${dayCount} Days Set`:'No Schedule Yet'}
                  </span>
                </div>
                <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'rgba(0,123,245,0.08)', border:'1px solid rgba(0,123,245,0.15)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px' }}>
                  <BookOpen size={19} color="var(--active-blue)"/>
                </div>
                <div style={{ fontSize:'15px', fontWeight:800, color:'var(--text-main)', marginBottom:'6px', paddingRight:'80px' }}>{batch.name}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'3px', marginBottom:'14px' }}>
                  <div style={{ fontSize:'11.5px', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'5px' }}><Calendar size={10}/> {fmtDate(batch.start_date)} – {fmtDate(batch.end_date)}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'12px', fontWeight:700, color:'var(--active-blue)' }}>View Schedule <ChevronRight size={13}/></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── ADMIN: Batch list ──
  return (
    <div style={{ padding:'28px 32px' }}>
      <div style={{ marginBottom:'24px' }}>
        <h2 style={{ fontSize:'19px', fontWeight:800, color:'var(--text-main)', margin:0, display:'flex', alignItems:'center', gap:'10px' }}>
          <GraduationCap size={21} color="var(--active-blue)"/> LMS — Batch Learning Paths
        </h2>
        <p style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'5px' }}>Select a batch to build its monthly learning schedule.</p>
      </div>

      {batches.length===0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text-muted)' }}>
          <AlertCircle size={34} style={{ marginBottom:'12px', opacity:0.4 }}/>
          <div style={{ fontSize:'15px', fontWeight:600 }}>No batches found</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'18px' }}>
          {batches.map(batch => {
            const saved = localStorage.getItem(`lms_path_${batch.id}`);
            const dayCount = saved ? Object.keys(JSON.parse(saved)).length : 0;
            const isConfigured = dayCount > 0;
            return (
              <div key={batch.id} onClick={()=>openBatch(batch)}
                style={{ background:'var(--card-bg)', border:'1px solid var(--border-color)', borderRadius:'16px', padding:'22px', cursor:'pointer', transition:'all 0.2s', boxShadow:'var(--card-shadow)', position:'relative' }}
                onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(0,123,245,0.4)';e.currentTarget.style.boxShadow='0 4px 20px rgba(0,123,245,0.1)';}}
                onMouseOut={e=>{e.currentTarget.style.borderColor='var(--border-color)';e.currentTarget.style.boxShadow='var(--card-shadow)';}}
              >
                <div style={{ position:'absolute', top:'14px', right:'14px' }}>
                  <span style={{ fontSize:'10px', fontWeight:700, padding:'3px 9px', borderRadius:'20px', background:isConfigured?'rgba(16,185,129,0.1)':'rgba(245,158,11,0.1)', color:isConfigured?'#10b981':'#f59e0b', border:`1px solid ${isConfigured?'rgba(16,185,129,0.2)':'rgba(245,158,11,0.2)'}` }}>
                    {isConfigured?`${dayCount} Days Set`:'Not Configured'}
                  </span>
                </div>
                <div style={{ width:'40px', height:'40px', borderRadius:'12px', background:'rgba(0,123,245,0.08)', border:'1px solid rgba(0,123,245,0.15)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'12px' }}>
                  <Layers size={19} color="var(--active-blue)"/>
                </div>
                <div style={{ fontSize:'15px', fontWeight:800, color:'var(--text-main)', marginBottom:'6px', paddingRight:'80px' }}>{batch.name}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:'3px', marginBottom:'14px' }}>
                  {batch.mentor_name && <div style={{ fontSize:'11.5px', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'5px' }}><User size={10}/> {batch.mentor_name}</div>}
                  <div style={{ fontSize:'11.5px', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'5px' }}><Calendar size={10}/> {fmtDate(batch.start_date)} – {fmtDate(batch.end_date)}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:'11px', color:'var(--text-muted)', background:'var(--primary-bg)', padding:'3px 8px', borderRadius:'6px', border:'1px solid var(--border-color)' }}>{batch.status||'Active'}</span>
                  <span style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'12px', fontWeight:700, color:'var(--active-blue)' }}>
                    {isConfigured?'Edit Path':'Setup Path'} <ChevronRight size={13}/>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
