import React, { useState } from 'react';
import { Cpu, FileText, Send, Sparkles, CheckCircle2, ShieldAlert, Award, RefreshCw, BarChart, ArrowRight, Play, BookOpen } from 'lucide-react';

const INTERVIEW_QUESTIONS = {
  Fullstack: [
    'Explain the event loop in Node.js. How does it handle asynchronous I/O operations?',
    'What is the difference between Virtual DOM and Shadow DOM in React?',
    'Explain how indexes work in databases and how you would optimize a slow query in PostgreSQL.',
    'What is the purpose of JWT and how do you store it securely on the client-side?'
  ],
  Frontend: [
    'How does React reconciler work under the hood in Fiber architecture?',
    'Explain CSS specificity and what are the benefits of CSS Custom Variables over preprocessor variables?',
    'What are React Server Components (RSC) and how do they differ from SSR?'
  ],
  Backend: [
    'Explain the difference between SQL and NoSQL database scaling models.',
    'How do queue managers (like BullMQ/Redis) ensure task delivery in high load systems?',
    'What is database replication and what are the write/read separation principles?'
  ]
};

export default function AIFeaturesSection({ currentUser }) {
  const [activeTab, setActiveTab] = useState('ats'); // ats, skillgap, interview, question, insights
  
  // ATS & Analyzer States
  const [resumeText, setResumeText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [atsResult, setAtsResult] = useState(null);

  // Skill Gap States
  const [targetRole, setTargetRole] = useState('MERN Stack Developer');
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [checkingGap, setCheckingGap] = useState(false);

  // Mock Interview States
  const [interviewRole, setInterviewRole] = useState('Fullstack');
  const [inInterview, setInInterview] = useState(false);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [interviewFeedback, setInterviewFeedback] = useState(null);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  // Technical Question Generator States
  const [selectedTech, setSelectedTech] = useState('JavaScript');
  const [generatedQuestion, setGeneratedQuestion] = useState(null);
  const [generatingQuestion, setGeneratingQuestion] = useState(false);

  // Perform ATS Check
  const handleAtsCheck = (e) => {
    e.preventDefault();
    if (!resumeText) return;

    setAnalyzing(true);
    setAtsResult(null);

    setTimeout(() => {
      // Calculate a mockup score based on keyword lengths
      const score = Math.floor(Math.random() * 20) + 72; // 72 - 92
      setAtsResult({
        score,
        keywordsMatched: ['React', 'Node.js', 'JavaScript', 'HTML/CSS', 'Git'],
        keywordsMissing: ['TypeScript', 'Docker', 'Redis', 'CI/CD Pipelines'],
        formattingScore: '92/100 (Clean single column format detected)',
        strengthPoints: [
          'Strong listing of MERN stack core dependencies.',
          'Quantifiable achievements (e.g. "scaled DB query performance by 40%").',
          'Good contact info layout and clear GitHub/LinkedIn profiling.'
        ],
        weaknessPoints: [
          'Lacks Cloud hosting details (AWS/Heroku/Vercel).',
          'No mention of automated unit testing frameworks (Jest/Mocha).',
          'Education section lacks GPA score formatting.'
        ]
      });
      setAnalyzing(false);
    }, 1200);
  };

  // Run Skill Gap Analysis
  const handleSkillGap = (e) => {
    e.preventDefault();
    setCheckingGap(true);
    setGapAnalysis(null);

    setTimeout(() => {
      let matched = [];
      let missing = [];
      let courses = [];

      if (targetRole.includes('MERN')) {
        matched = ['React.js', 'Node.js', 'Express.js', 'CSS Flexbox/Grid', 'REST APIs'];
        missing = ['TypeScript', 'MongoDB Aggregations', 'JWT Security Best Practices'];
        courses = [
          { title: 'Advanced MongoDB Aggregations', platform: 'LMS System Course 103' },
          { title: 'JWT Authentication & Security', platform: 'LMS System Course 105' }
        ];
      } else if (targetRole.includes('DevOps')) {
        matched = ['Git', 'Linux Basics'];
        missing = ['Docker', 'Kubernetes', 'CI/CD GitHub Actions', 'AWS S3/EC2'];
        courses = [
          { title: 'Docker Containers in Node.js', platform: 'Training Program Library' },
          { title: 'Deployment Orchestration: AWS EC2', platform: 'Placement Prep Hub' }
        ];
      } else {
        matched = ['HTML/CSS', 'JavaScript Basics', 'Figma Wireframing'];
        missing = ['Framer Motion Animations', 'Responsive Auto-Layout Figma', 'Tailwind CSS'];
        courses = [
          { title: 'UI/UX Design Essentials', platform: 'LMS System Course 2' }
        ];
      }

      setGapAnalysis({
        matched,
        missing,
        courses,
        marketDemand: '94% (Very High demand in active placement listings)'
      });
      setCheckingGap(false);
    }, 1000);
  };

  // Interview Methods
  const startMockInterview = () => {
    const questions = INTERVIEW_QUESTIONS[interviewRole];
    setChatLog([
      { sender: 'AI Interviewer', text: `Welcome to your AI Mock Technical Interview. I will act as a Lead Engineer evaluating you for the ${interviewRole} Role. Let's begin. \n\nQuestion 1: ${questions[0]}` }
    ]);
    setCurrentQIdx(0);
    setUserAnswer('');
    setInterviewFeedback(null);
    setInInterview(true);
  };

  const handleSendAnswer = (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    const questions = INTERVIEW_QUESTIONS[interviewRole];
    const nextQ = questions[currentQIdx + 1];

    setSubmittingAnswer(true);
    
    // Log user response
    const newChat = [...chatLog, { sender: 'You', text: userAnswer }];
    setChatLog(newChat);

    setTimeout(() => {
      if (nextQ) {
        setChatLog([
          ...newChat,
          { sender: 'AI Interviewer', text: `Interesting points. \n\nQuestion ${currentQIdx + 2}: ${nextQ}` }
        ]);
        setCurrentQIdx(currentQIdx + 1);
        setUserAnswer('');
        setSubmittingAnswer(false);
      } else {
        // End of interview, show feedback
        setChatLog([
          ...newChat,
          { sender: 'AI Interviewer', text: 'Thank you. That completes our mock interview. Calculating feedback scorecard...' }
        ]);

        setTimeout(() => {
          setInterviewFeedback({
            overallScore: Math.floor(Math.random() * 15) + 78, // 78 - 93
            technicalAccuracy: 'Good explanation of scaling and caching structures, but event loop phases could be detailed better.',
            communicationSkills: 'Clear and structured sentence formats. Good technical vocabulary.',
            toImprove: [
              'Provide code-level syntax syntax examples when explaining React Fiber.',
              'Explain cache eviction strategies explicitly when mentioning Redis.',
              'Explain JWT signing algorithms (like HS256 vs RS256).'
            ]
          });
          setInInterview(false);
        }, 1200);
      }
    }, 800);
  };

  // Generate Tech Question
  const handleGenerateQuestion = () => {
    setGeneratingQuestion(true);
    setGeneratedQuestion(null);

    setTimeout(() => {
      let q = '';
      let snippet = '';
      let answer = '';

      if (selectedTech === 'JavaScript') {
        q = 'Write a function that flattens a deeply nested array structure. The input may contain integers, other arrays, or mixed symbols.';
        snippet = 'function flattenArray(arr) {\n  // Implement flatten logic here\n}\n\n// Example input:\n// flattenArray([1, [2, [3, [4]], 5]]) -> [1, 2, 3, 4, 5]';
        answer = 'Can be solved recursively (loop and check Array.isArray) or iteratively using a stack structure. ES6 flat(Infinity) works but check for custom logic rules.';
      } else if (selectedTech === 'React') {
        q = 'Create a custom hook called useDebounce that rate-limits value state modifications to prevent high API trigger workloads.';
        snippet = 'function useDebounce(value, delay) {\n  // Custom debounce hook logic\n}';
        answer = 'Utilize a useEffect hook that schedules a setTimeout update and returns a cleanup callback with clearTimeout to abort stale timers.';
      } else {
        q = 'Write an Express middleware that logs route access times and headers into database audit files.';
        snippet = 'const auditLogger = (req, res, next) => {\n  // Custom logger middleware\n};';
        answer = 'Intercept req execution, record date.now() on start, hook into res.on("finish") to calculate elapsed time, and save metrics.';
      }

      setGeneratedQuestion({ q, snippet, answer });
      setGeneratingQuestion(false);
    }, 900);
  };

  return (
    <div className="ai-hub-container" style={{ padding: '24px', textAlign: 'left' }}>
      
      {/* Tab Navigation header */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '24px' }}>
        {[
          { id: 'ats', label: 'Resume ATS Checker' },
          { id: 'skillgap', label: 'Skill Gap Analyzer' },
          { id: 'interview', label: 'Mock Interview Simulator' },
          { id: 'question', label: 'Code Q&A Generator' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: activeTab === tab.id ? 'var(--active-blue)' : 'none',
              color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Sparkles size={14} fill={activeTab === tab.id ? 'white' : 'none'} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. RESUME ATS CHECKER */}
      {activeTab === 'ats' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--sidebar-bg)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <FileText size={18} className="icon-blue" />
              Upload Resume Content
            </h3>
            
            <form onSubmit={handleAtsCheck}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Paste Resume Text or Achievements Summary</label>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste details of your resume (Education, Projects, Skills, Internships)..."
                  rows={10}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    background: 'var(--primary-bg)',
                    color: 'var(--text-main)',
                    fontSize: '12.5px',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={analyzing}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: 'var(--active-blue)',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 10px rgba(0, 123, 245, 0.2)'
                }}
              >
                {analyzing ? 'Analyzing formatting and matches...' : 'Analyze ATS Suitability'}
              </button>
            </form>
          </div>

          <div>
            {atsResult ? (
              <div className="card animate-fade-in" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--sidebar-bg)' }}>ATS Report Summary</h3>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: atsResult.score >= 80 ? '#10b981' : '#f59e0b' }}>
                    {atsResult.score}%
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      Keywords Matched
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {atsResult.keywordsMatched.map(k => (
                        <span key={k} style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '4px', fontWeight: 600 }}>
                          ✓ {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      Suggested Additions (Keyword Gaps)
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {atsResult.keywordsMissing.map(k => (
                        <span key={k} style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '4px', fontWeight: 600 }}>
                          + {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                      Resume Key Strengths
                    </span>
                    {atsResult.strengthPoints.map((pt, i) => (
                      <div key={i} style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '4px', display: 'flex', gap: '6px' }}>
                        <span style={{ color: '#10b981' }}>✔</span> {pt}
                      </div>
                    ))}
                  </div>

                  <div>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                      Areas for Correction
                    </span>
                    {atsResult.weaknessPoints.map((pt, i) => (
                      <div key={i} style={{ fontSize: '12px', color: 'var(--text-main)', marginTop: '4px', display: 'flex', gap: '6px' }}>
                        <span style={{ color: '#ef4444' }}>⚠</span> {pt}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: '40px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', minHeight: '300px' }}>
                <Cpu size={36} style={{ color: 'var(--border-color)', marginBottom: '12px', opacity: 0.6 }} />
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>Scan Pending</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'center' }}>Enter your resume achievements on the left to run an automated keywords matching and layout analysis.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SKILL GAP ANALYZER */}
      {activeTab === 'skillgap' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--sidebar-bg)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <BarChart size={18} className="icon-blue" />
              Target Employment Role
            </h3>

            <form onSubmit={handleSkillGap}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Select Target Placement Designation</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    background: 'var(--primary-bg)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    marginTop: '6px'
                  }}
                >
                  <option value="MERN Stack Developer">MERN Stack Developer (Sarvo, Stripe)</option>
                  <option value="DevOps & Deployments Engineer">DevOps & Deployments Engineer (TechnoCorp)</option>
                  <option value="UI/UX Frontend Developer">UI/UX Frontend Developer (DesignGrid)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={checkingGap}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: 'var(--active-blue)',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {checkingGap ? 'Checking skill registries...' : 'Analyze Skill Gap'}
              </button>
            </form>
          </div>

          <div>
            {gapAnalysis ? (
              <div className="card animate-fade-in" style={{ padding: '24px' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--sidebar-bg)' }}>Registry Analysis for {targetRole}</h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Market Demand: <strong style={{ color: 'var(--active-blue)' }}>{gapAnalysis.marketDemand}</strong></span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      Matched Profile Skills
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {gapAnalysis.matched.map(s => (
                        <span key={s} style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '4px', fontWeight: 600 }}>
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      Identified Gaps (Missing Registry Keynotes)
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {gapAnalysis.missing.map(s => (
                        <span key={s} style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', borderRadius: '4px', fontWeight: 600 }}>
                          + {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                      Recommended LMS Courses
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {gapAnalysis.courses.map((course, i) => (
                        <div key={i} style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary-bg)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <BookOpen size={12} style={{ color: 'var(--active-blue)' }} /> {course.title}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{course.platform}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: '40px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', minHeight: '300px' }}>
                <Cpu size={36} style={{ color: 'var(--border-color)', marginBottom: '12px', opacity: 0.6 }} />
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>Analysis Pending</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'center' }}>Select a target placement designation to examine skill registries and map course recommendations.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. MOCK INTERVIEW SIMULATOR */}
      {activeTab === 'interview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--sidebar-bg)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Cpu size={18} className="icon-blue" />
              Mock Configuration
            </h3>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Select Mock Interview Domain</label>
              <select
                value={interviewRole}
                onChange={(e) => setInterviewRole(e.target.value)}
                disabled={inInterview}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  background: 'var(--primary-bg)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  marginTop: '6px'
                }}
              >
                <option value="Fullstack">Fullstack MERN Engineer</option>
                <option value="Frontend">Frontend React Developer</option>
                <option value="Backend">Backend Node/Database Specialist</option>
              </select>
            </div>

            <button
              onClick={startMockInterview}
              disabled={inInterview}
              style={{
                width: '100%',
                padding: '10px 20px',
                border: 'none',
                background: inInterview ? 'var(--border-color)' : 'var(--active-blue)',
                color: inInterview ? 'var(--text-muted)' : 'white',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '12.5px',
                cursor: inInterview ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Play size={14} fill={inInterview ? 'none' : 'white'} /> Start Mock Interview
            </button>

            {interviewFeedback && (
              <div className="animate-fade-in" style={{
                background: 'rgba(16, 185, 129, 0.03)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '10px',
                padding: '16px',
                marginTop: '20px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ color: '#10b981', fontSize: '13px' }}>Interview Scorecard</strong>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#10b981' }}>{interviewFeedback.overallScore}%</span>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '8px' }}>
                  <strong>Accuracy:</strong> {interviewFeedback.technicalAccuracy}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  <strong>Improvement Tips:</strong>
                  {interviewFeedback.toImprove.map((tip, idx) => (
                    <div key={idx} style={{ marginTop: '4px' }}>• {tip}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Chat Logs Window */}
          <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '420px' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} style={{ color: 'var(--active-blue)' }} />
              <strong style={{ fontSize: '13.5px', color: 'var(--text-main)' }}>AI Mock Session</strong>
            </div>

            {/* Chat Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {chatLog.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Cpu size={32} style={{ margin: '0 auto 8px', opacity: 0.6 }} />
                  <p style={{ fontSize: '12px' }}>Click "Start Mock Interview" to begin technical evaluation.</p>
                </div>
              ) : (
                chatLog.map((chat, idx) => {
                  const isAI = chat.sender === 'AI Interviewer';
                  return (
                    <div key={idx} style={{
                      maxWidth: '85%',
                      alignSelf: isAI ? 'flex-start' : 'flex-end',
                      background: isAI ? 'var(--primary-bg)' : 'rgba(0,123,245,0.08)',
                      border: isAI ? '1px solid var(--border-color)' : '1px solid rgba(0,123,245,0.2)',
                      borderRadius: isAI ? '0 12px 12px 12px' : '12px 0 12px 12px',
                      padding: '12px',
                      fontSize: '12.5px',
                      color: 'var(--text-main)',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-line'
                    }}>
                      <strong style={{ display: 'block', fontSize: '10.5px', color: isAI ? 'var(--active-blue)' : 'var(--text-main)', marginBottom: '4px' }}>
                        {chat.sender}
                      </strong>
                      {chat.text}
                    </div>
                  );
                })
              )}
            </div>

            {/* Chat Input */}
            {inInterview && (
              <form onSubmit={handleSendAnswer} style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your technical answer details here..."
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    background: 'var(--primary-bg)',
                    color: 'var(--text-main)',
                    fontSize: '12.5px',
                    outline: 'none'
                  }}
                  required
                />
                <button
                  type="submit"
                  disabled={submittingAnswer}
                  style={{
                    padding: '10px 16px',
                    border: 'none',
                    background: 'var(--active-blue)',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Send size={14} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 4. CODE Q&A GENERATOR */}
      {activeTab === 'question' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--sidebar-bg)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Sparkles size={18} className="icon-blue" />
              Configure Topic
            </h3>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Select Technology Language</label>
              <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  background: 'var(--primary-bg)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  marginTop: '6px'
                }}
              >
                <option value="JavaScript">JavaScript (ES6+, Scopes, Async)</option>
                <option value="React">React (Hooks, Reconciliation, Portals)</option>
                <option value="Node.js">Node.js / Express (I/O, Streams, Routing)</option>
              </select>
            </div>

            <button
              onClick={handleGenerateQuestion}
              disabled={generatingQuestion}
              style={{
                width: '100%',
                padding: '10px 20px',
                border: 'none',
                background: 'var(--active-blue)',
                color: 'white',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '12.5px',
                cursor: 'pointer'
              }}
            >
              {generatingQuestion ? 'Generating custom puzzle...' : 'Generate Coding Question'}
            </button>
          </div>

          <div>
            {generatedQuestion ? (
              <div className="card animate-fade-in" style={{ padding: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                  {generatedQuestion.q}
                </h4>

                {generatedQuestion.snippet && (
                  <pre style={{
                    background: 'var(--primary-bg)',
                    border: '1px solid var(--border-color)',
                    padding: '14px',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                    fontSize: '11.5px',
                    fontFamily: 'Courier, monospace',
                    overflowX: 'auto',
                    textAlign: 'left',
                    lineHeight: '1.4',
                    marginBottom: '16px'
                  }}>
                    {generatedQuestion.snippet}
                  </pre>
                )}

                <div style={{
                  background: 'rgba(16, 185, 129, 0.03)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '12px',
                  color: 'var(--text-main)',
                  textAlign: 'left'
                }}>
                  <strong>AI Technical Answer Reference:</strong>
                  <p style={{ marginTop: '4px', color: 'var(--text-muted)' }}>{generatedQuestion.answer}</p>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: '40px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-color)', minHeight: '200px' }}>
                <Cpu size={36} style={{ color: 'var(--border-color)', marginBottom: '12px', opacity: 0.6 }} />
                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>No Question Loaded</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Choose a technical subject on the left and trigger the AI generation.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
