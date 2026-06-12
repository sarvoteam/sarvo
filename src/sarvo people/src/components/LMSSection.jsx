import React, { useState, useEffect } from 'react';
import { BookOpen, Play, Download, Award, FileText, CheckCircle2, ChevronRight, BarChart3, AlertCircle, Clock } from 'lucide-react';
import { lmsApi } from '../../../apis/lmsApi';

const COURSES_DATA = [
  {
    id: 1,
    title: 'MERN Stack Developer BootCamp',
    category: 'Full-Stack',
    duration: '8 weeks',
    progress: 75,
    lessons: [
      { id: 101, title: 'Introduction to Node.js & NPM', type: 'video', duration: '22 mins', completed: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 102, title: 'Express.js Routing and Middlewares', type: 'video', duration: '35 mins', completed: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 103, title: 'MongoDB Schemas with Mongoose', type: 'pdf', size: '2.4 MB', completed: true },
      { id: 104, title: 'React Hooks Deep Dive (State, Effect, Memo)', type: 'video', duration: '48 mins', completed: false, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 105, title: 'JWT Authentication & RBAC in Express', type: 'pdf', size: '1.8 MB', completed: false }
    ],
    quizzes: [
      { id: 201, title: 'Node.js & Express Fundamentals', questionsCount: 5, difficulty: 'Easy', timeLimit: 60 }
    ]
  },
  {
    id: 2,
    title: 'UI/UX Design Essentials',
    category: 'Design',
    duration: '4 weeks',
    progress: 30,
    lessons: [
      { id: 301, title: 'Introduction to Figma & Vector Tools', type: 'video', duration: '18 mins', completed: true, videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 302, title: 'Visual Hierarchy and Color Theories', type: 'pdf', size: '4.2 MB', completed: false },
      { id: 303, title: 'Responsive Layouts & Auto-Layout Figma', type: 'video', duration: '30 mins', completed: false }
    ],
    quizzes: [
      { id: 401, title: 'Design Principles & Layouts', questionsCount: 5, difficulty: 'Medium', timeLimit: 90 }
    ]
  },
  {
    id: 3,
    title: 'System Design & Scalability',
    category: 'Architecture',
    duration: '6 weeks',
    progress: 0,
    lessons: [
      { id: 501, title: 'Vertical vs Horizontal Scaling', type: 'pdf', size: '3.1 MB', completed: false },
      { id: 502, title: 'Caching Strategies: Redis & Memcached', type: 'video', duration: '40 mins', completed: false },
      { id: 503, title: 'Database Sharding and Replication', type: 'video', duration: '55 mins', completed: false }
    ],
    quizzes: [
      { id: 601, title: 'Scaling & Caching Architectures', questionsCount: 5, difficulty: 'Hard', timeLimit: 120 }
    ]
  }
];

const QUIZ_QUESTIONS = {
  201: [
    {
      id: 1,
      q: 'Which core module in Node.js is used to handle file operations?',
      options: ['path', 'fs', 'http', 'os'],
      answer: 1,
      explanation: 'The "fs" (File System) module allows you to work with the file system on your computer.'
    },
    {
      id: 2,
      q: 'What is the purpose of middleware in Express.js?',
      options: [
        'To connect to the database directly',
        'To compile React components into HTML',
        'To execute code and modify request/response objects',
        'To compress images automatically'
      ],
      answer: 2,
      explanation: 'Middleware functions have access to the request (req) and response (res) objects, and can execute code, modify them, or end the request-response cycle.'
    },
    {
      id: 3,
      q: 'Which database model mapping technique is used by Mongoose?',
      options: ['SQL Schema mapping', 'ORM (Object Relational Mapping)', 'ODM (Object Document Mapping)', 'Key-Value indexing'],
      answer: 2,
      explanation: 'Mongoose is an ODM (Object Document Mapper) library for MongoDB and Node.js. It manages relationships between data, provides schema validation, etc.'
    },
    {
      id: 4,
      q: 'What does JWT stand for?',
      options: ['Java Web Token', 'JSON Web Token', 'JSON Web Tool', 'Joint Web Transit'],
      answer: 1,
      explanation: 'JWT stands for JSON Web Token. It is a compact, URL-safe means of representing claims to be transferred between two parties.'
    },
    {
      id: 5,
      q: 'In Express routing, what is req.params used for?',
      options: [
        'To read query parameters like ?page=2',
        'To read parameters matched in the route path like /user/:id',
        'To read JSON body fields',
        'To read cookies from requests'
      ],
      answer: 1,
      explanation: 'req.params is an object containing properties mapped to the named route "parameters". For example, if you have the route /user/:name, then the "name" property is available as req.params.name.'
    }
  ]
};

export default function LMSSection() {
  const [activeCourse, setActiveCourse] = useState(COURSES_DATA[0]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizDetails, setQuizDetails] = useState(null);
  
  // Interactive Quiz States
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizScore, setQuizScore] = useState(0);

  // Quiz timer
  useEffect(() => {
    if (!showQuiz || quizSubmitted || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto submit when time runs out
          clearInterval(interval);
          handleQuizSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showQuiz, currentQuestionIdx, quizSubmitted, timeLeft]);

  const startQuiz = (quiz) => {
    const questions = QUIZ_QUESTIONS[quiz.id];
    if (!questions) {
      alert('Quiz questions for this course are coming soon!');
      return;
    }
    setQuizDetails({
      ...quiz,
      questions
    });
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setTimeLeft(30);
    setShowQuiz(true);
  };

  const handleOptionSelect = (optIdx) => {
    if (quizSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIdx]: optIdx
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < quizDetails.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
      setTimeLeft(30);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
      setTimeLeft(30);
    }
  };

  const handleQuizSubmit = () => {
    setQuizSubmitted(true);
    
    // Calculate Score
    let correctCount = 0;
    quizDetails.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / quizDetails.questions.length) * 100);
    setQuizScore(scorePct);

    // Save score to database
    lmsApi.saveQuizGrade({
      quizId: String(quizDetails.id),
      quizName: quizDetails.title,
      score: scorePct,
      totalQuestions: quizDetails.questions.length,
      passed: scorePct >= 50
    }).catch(err => console.error('Failed to save quiz grade:', err));
  };

  const exitQuiz = () => {
    setShowQuiz(false);
    setQuizDetails(null);
  };

  return (
    <div className="lms-container" style={{ padding: '24px' }}>
      
      {/* Quiz Modal Player */}
      {showQuiz && quizDetails && (
        <div className="modal-overlay">
          <div className="modal-content-card" style={{ maxWidth: '640px', padding: '24px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} className="icon-blue" />
                <h3>{quizDetails.title}</h3>
              </div>
              <button className="modal-close-btn" onClick={exitQuiz}>Exit Quiz</button>
            </div>

            {!quizSubmitted ? (
              <div className="quiz-player-body" style={{ textAlign: 'left', marginTop: '16px' }}>
                {/* Progress Indicators */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '13px', fontWeight: 600 }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Question {currentQuestionIdx + 1} of {quizDetails.questions.length}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: timeLeft < 10 ? 'var(--text-red)' : 'var(--text-muted)' }}>
                    <Clock size={14} /> Time: {timeLeft}s
                  </span>
                </div>

                {/* Question */}
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '20px', lineHeight: '1.5' }}>
                  {quizDetails.questions[currentQuestionIdx].q}
                </h4>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {quizDetails.questions[currentQuestionIdx].options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[currentQuestionIdx] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleOptionSelect(oIdx)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '14px 16px',
                          border: isSelected ? '2px solid var(--active-blue)' : '1px solid var(--border-color)',
                          borderRadius: '10px',
                          background: isSelected ? 'rgba(0, 123, 245, 0.05)' : 'var(--card-bg)',
                          color: 'var(--text-main)',
                          fontSize: '13.5px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: isSelected ? 'var(--active-blue)' : 'var(--primary-bg)',
                          color: isSelected ? 'white' : 'var(--text-muted)',
                          marginRight: '12px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}>
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                  <button
                    disabled={currentQuestionIdx === 0}
                    onClick={prevQuestion}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid var(--border-color)',
                      background: 'none',
                      color: 'var(--text-main)',
                      borderRadius: '8px',
                      cursor: currentQuestionIdx === 0 ? 'not-allowed' : 'pointer',
                      opacity: currentQuestionIdx === 0 ? 0.5 : 1
                    }}
                  >
                    Previous
                  </button>
                  {currentQuestionIdx < quizDetails.questions.length - 1 ? (
                    <button
                      onClick={nextQuestion}
                      style={{
                        padding: '8px 20px',
                        border: 'none',
                        background: 'var(--active-blue)',
                        color: 'white',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      onClick={handleQuizSubmit}
                      style={{
                        padding: '8px 24px',
                        border: 'none',
                        background: '#10b981',
                        color: 'white',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 700,
                        boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      Submit Quiz
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // Quiz Submission Scorecard & Review
              <div className="quiz-result-body" style={{ textAlign: 'left', marginTop: '16px' }}>
                <div style={{
                  background: 'var(--primary-bg)',
                  borderRadius: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  marginBottom: '24px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: quizScore >= 70 ? '#10b981' : '#f59e0b' }}>
                    {quizScore}%
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
                    {quizScore >= 70 ? 'Congratulations! You Passed!' : 'Keep practicing to improve!'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Passing Score: 70% | Score Saved to Performance Record
                  </div>
                </div>

                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>Review Answers:</h4>
                <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '6px' }}>
                  {quizDetails.questions.map((q, idx) => {
                    const userAns = selectedAnswers[idx];
                    const isCorrect = userAns === q.answer;
                    return (
                      <div key={q.id} style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        padding: '14px',
                        background: 'var(--card-bg)'
                      }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: isCorrect ? '#10b981' : '#ef4444',
                            fontSize: '11px',
                            fontWeight: 700,
                            marginTop: '2px'
                          }}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>{q.q}</span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Your answer: <span style={{ fontWeight: 600, color: isCorrect ? '#10b981' : '#ef4444' }}>{q.options[userAns] || 'Unanswered'}</span>
                        </div>
                        {!isCorrect && (
                          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                            Correct answer: <span style={{ fontWeight: 600 }}>{q.options[q.answer]}</span>
                          </div>
                        )}
                        <div style={{
                          marginTop: '8px',
                          padding: '8px',
                          borderRadius: '6px',
                          background: 'var(--primary-bg)',
                          fontSize: '11.5px',
                          color: 'var(--text-muted)',
                          lineHeight: '1.4'
                        }}>
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button
                    onClick={exitQuiz}
                    style={{
                      padding: '10px 24px',
                      border: 'none',
                      background: 'var(--active-blue)',
                      color: 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 700
                    }}
                  >
                    Finish & Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid Layout: Left sidebar with course selection, Right side with lessons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', textAlign: 'left' }}>
        
        {/* Left Side: Courses list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--sidebar-bg)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <BookOpen size={18} className="icon-blue" />
              My Training Programs
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {COURSES_DATA.map((course) => {
                const isActive = activeCourse.id === course.id;
                return (
                  <div
                    key={course.id}
                    onClick={() => { setActiveCourse(course); setSelectedLesson(null); }}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      border: isActive ? '2px solid var(--active-blue)' : '1px solid var(--border-color)',
                      background: isActive ? 'rgba(0, 123, 245, 0.03)' : 'var(--card-bg)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--active-blue)', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {course.category}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                      {course.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      <span>{course.duration}</span>
                      <span>{course.progress}% Complete</span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ width: '100%', height: '5px', background: 'var(--primary-bg)', borderRadius: '10px', marginTop: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${course.progress}%`, height: '100%', background: 'var(--active-blue)', borderRadius: '10px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Learning Analytics */}
          <div className="card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
              <BarChart3 size={16} /> Learning Analytics
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Completed Lessons</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>4 / 11 Modules</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Time Spent Study</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>6.8 Hours</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Average Quiz Score</span>
                <span style={{ fontWeight: 600, color: '#10b981' }}>80%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Active Course Syllabus & Video Player */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Active Lesson Video Panel */}
          {selectedLesson && selectedLesson.type === 'video' && (
            <div className="card" style={{ padding: '16px' }}>
              <div style={{
                position: 'relative',
                paddingTop: '56.25%', /* 16:9 Aspect Ratio */
                borderRadius: '10px',
                overflow: 'hidden',
                background: '#000',
                marginBottom: '12px'
              }}>
                <iframe
                  title="Lesson Video"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  src={selectedLesson.videoUrl}
                  allowFullScreen
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{selectedLesson.title}</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Video Tutorial • {selectedLesson.duration}</p>
                </div>
                <button
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    background: 'var(--active-blue)',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    // Toggle locally completed
                    selectedLesson.completed = true;
                    setActiveCourse({ ...activeCourse });
                  }}
                >
                  Mark as Complete
                </button>
              </div>
            </div>
          )}

          {/* Syllabus Content list */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--sidebar-bg)' }}>{activeCourse.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Syllabus Breakdown & Interactive Assessments</p>
              </div>
            </div>

            {/* Syllabus Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeCourse.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: 'var(--primary-bg)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    {lesson.completed ? (
                      <CheckCircle2 size={18} style={{ color: '#10b981', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid var(--border-color)', flexShrink: 0 }} />
                    )}

                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                        {lesson.title}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        {lesson.type === 'video' ? 'Video Lesson • ' + lesson.duration : 'PDF Resource • ' + lesson.size}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {lesson.type === 'video' ? (
                      <button
                        onClick={() => setSelectedLesson(lesson)}
                        style={{
                          padding: '6px 12px',
                          border: 'none',
                          background: 'rgba(0, 123, 245, 0.08)',
                          color: 'var(--active-blue)',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Play size={12} fill="var(--active-blue)" /> Play Lesson
                      </button>
                    ) : (
                      <a
                        href="#download-pdf"
                        onClick={(e) => { e.preventDefault(); alert('Downloading PDF resources summary: ' + lesson.title); }}
                        style={{
                          padding: '6px 12px',
                          border: 'none',
                          background: 'rgba(16, 185, 129, 0.08)',
                          color: '#10b981',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Download size={12} /> Download
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quizzes List */}
            {activeCourse.quizzes && activeCourse.quizzes.length > 0 && (
              <div style={{ marginTop: '28px' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>Quizzes & Knowledge Checks</h4>
                
                {activeCourse.quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      background: 'rgba(245, 158, 11, 0.03)',
                      border: '1px dashed #f59e0b',
                      borderRadius: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Award size={22} style={{ color: '#f59e0b' }} />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-main)' }}>{quiz.title}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {quiz.questionsCount} Questions • Time Limit: {quiz.timeLimit}s • Level: {quiz.difficulty}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => startQuiz(quiz)}
                      style={{
                        padding: '8px 16px',
                        border: 'none',
                        background: '#f59e0b',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 10px rgba(245, 158, 11, 0.15)'
                      }}
                    >
                      Start Quiz
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
