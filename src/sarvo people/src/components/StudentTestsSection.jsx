import React, { useState, useEffect } from 'react';
import { ClipboardList, Award, Clock, CheckCircle2, AlertCircle, Play, ArrowRight, ChevronRight } from 'lucide-react';
import { cohortApi } from '../apis/cohortApi';
import { lmsApi } from '../apis/lmsApi';


const APTITUDE_TEST = {
  id: 'apti_test',
  title: 'Sarvo Tech Aptitude Test',
  description: 'Logic, quantitative reasoning, and problem-solving mock assessments for active placements.',
  questions: [
    {
      q: 'If a project member can complete a task in 5 hours, and another member can do it in 10 hours, how long will they take to complete the task together?',
      options: ['3.33 hours', '4 hours', '7.5 hours', '6 hours'],
      answer: 0,
      explanation: 'Formula: 1 / (1/5 + 1/10) = 10/3 = 3.33 hours.'
    },
    {
      q: 'Which number should come next in the pattern: 37, 34, 31, 28, ?',
      options: ['25', '26', '24', '27'],
      answer: 0,
      explanation: 'The sequence decreases by 3 each time: 28 - 3 = 25.'
    },
    {
      q: 'A company has 24 recruiters. If they place 84% of their interns, how many interns are placed out of 200?',
      options: ['168', '150', '180', '160'],
      answer: 0,
      explanation: '84% of 200 is: 0.84 * 200 = 168.'
    },
    {
      q: 'A car travels at 60 km/h for 2 hours, and then 80 km/h for 1 hour. What is its average speed?',
      options: ['66.67 km/h', '70 km/h', '68 km/h', '72 km/h'],
      answer: 0,
      explanation: 'Total distance = 120 + 80 = 200 km. Total time = 3 hours. Average speed = 200/3 = 66.67 km/h.'
    },
    {
      q: 'If "SARVO" is coded as "TBSPVP" (by shifting each letter by +1), what is "TECH" coded as?',
      options: ['UFDI', 'UGDJ', 'SFBG', 'TECI'],
      answer: 0,
      explanation: 'T->U, E->F, C->D, H->I. The code is UFDI.'
    }
  ]
};

const TECHNICAL_TEST = {
  id: 'tech_test',
  title: 'React & Node.js Technical Assessment',
  description: 'Assess key competencies in modern web development, Javascript ES6, REST APIs, and database fundamentals.',
  questions: [
    {
      q: 'What is the output of "typeof null" in JavaScript?',
      options: ["'object'", "'null'", "'undefined'", "'string'"],
      answer: 0,
      explanation: 'Historically, typeof null returns "object", which is a legacy JavaScript behavior.'
    },
    {
      q: 'Which HTTP method is typically used to create a new database resource?',
      options: ['POST', 'GET', 'PUT', 'DELETE'],
      answer: 0,
      explanation: 'POST is standard for creating resources; PUT is for updates, GET for retrieval.'
    },
    {
      q: 'What does SQL stand for?',
      options: ['Structured Query Language', 'Simple Query Language', 'Strong Query Language', 'Schema Query Language'],
      answer: 0,
      explanation: 'SQL stands for Structured Query Language, the standard relational database query syntax.'
    },
    {
      q: 'In CSS Flexbox, which property aligns items along the main axis?',
      options: ['justify-content', 'align-items', 'flex-direction', 'align-content'],
      answer: 0,
      explanation: 'justify-content aligns items along the main axis; align-items aligns along the cross axis.'
    },
    {
      q: 'Which React hook is best used to perform side-effects?',
      options: ['useEffect', 'useState', 'useMemo', 'useRef'],
      answer: 0,
      explanation: 'useEffect lets you synchronize a component with an external system (fetching, DOM, subscriptions).'
    }
  ]
};

export default function StudentTestsSection({ currentUser }) {
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [quizScore, setQuizScore] = useState(0);
  
  const [studentProfile, setStudentProfile] = useState(() => {
    const saved = localStorage.getItem('sarvo_current_user');
    return saved ? JSON.parse(saved) : currentUser;
  });

  const [aptitudeQuestions, setAptitudeQuestions] = useState(APTITUDE_TEST.questions);
  const [technicalQuestions, setTechnicalQuestions] = useState(TECHNICAL_TEST.questions);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const aptiData = await lmsApi.getInterviewQuestions('apti_test');
        if (aptiData && aptiData.length > 0) {
          const parsed = aptiData.map(q => ({
            id: q.id,
            q: q.question_text,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
            answer: q.correct_option,
            explanation: q.explanation
          }));
          setAptitudeQuestions(parsed);
        }
      } catch (err) {
        console.error('Failed to load aptitude questions, using fallback', err);
      }

      try {
        const techData = await lmsApi.getInterviewQuestions('tech_test');
        if (techData && techData.length > 0) {
          const parsed = techData.map(q => ({
            id: q.id,
            q: q.question_text,
            options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
            answer: q.correct_option,
            explanation: q.explanation
          }));
          setTechnicalQuestions(parsed);
        }
      } catch (err) {
        console.error('Failed to load technical questions, using fallback', err);
      }
      setLoadingQuestions(false);
    };
    fetchQuestions();
  }, []);


  // Keep studentProfile updated with changes
  useEffect(() => {
    const saved = localStorage.getItem('sarvo_current_user');
    if (saved) setStudentProfile(JSON.parse(saved));
  }, [activeQuiz]);

  // Quiz Timer
  useEffect(() => {
    if (!activeQuiz || quizSubmitted || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuiz, quizSubmitted, timeLeft]);

  const startQuiz = (quizConfig) => {
    const questionsToUse = quizConfig.id === 'apti_test' ? aptitudeQuestions : technicalQuestions;
    setActiveQuiz({
      ...quizConfig,
      questions: questionsToUse
    });
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setTimeLeft(60);
    setQuizScore(0);
  };


  const handleOptionSelect = (oIdx) => {
    if (quizSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIdx]: oIdx
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < activeQuiz.questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(currentQuestionIdx - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setQuizSubmitted(true);
    let correct = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) {
        correct++;
      }
    });

    const scorePct = Math.round((correct / activeQuiz.questions.length) * 100);
    setQuizScore(scorePct);

    // Sync score directly to backend/database
    try {
      const isApti = activeQuiz.id === 'apti_test';
      const todayStr = new Date().toISOString().split('T')[0];
      
      const payload = {
        firstName: studentProfile.first_name || studentProfile.name?.split(' ')[0] || 'Student',
        lastName: studentProfile.last_name || studentProfile.name?.split(' ').slice(1).join(' ') || 'User',
        email: studentProfile.email,
        phone: studentProfile.phone,
        placementStatus: 'In Process',
        placementCompanyName: studentProfile.placement_company_name || null,
        placementCompanyAddress: studentProfile.placement_company_address || null,
        placementRole: studentProfile.placement_role || null,
        placementPackage: studentProfile.placement_package || null,
        
        // Conditional Test Updates
        aptiDetails: isApti ? `Cleared (Score: ${scorePct}%)` : (studentProfile.apti_details || 'Cleared'),
        aptiDate: isApti ? todayStr : (studentProfile.apti_date ? new Date(studentProfile.apti_date).toISOString().split('T')[0] : todayStr),
        jdDetails: studentProfile.jd_details || 'React / Fullstack Role JD',
        jdDate: studentProfile.jd_date ? new Date(studentProfile.jd_date).toISOString().split('T')[0] : todayStr,
        roundDetails: !isApti ? `Cleared Tech MCQ (Score: ${scorePct}%)` : (studentProfile.round_details || 'Pending Technical Round'),
        roundDate: !isApti ? todayStr : (studentProfile.round_date ? new Date(studentProfile.round_date).toISOString().split('T')[0] : null)
      };

      const updatedStudent = await cohortApi.updateStudentProfile(studentProfile.id, payload);

      // Save to localStorage/State
      const updatedUserObj = {
        ...studentProfile,
        placement_status: updatedStudent.placement_status,
        placement_company_name: updatedStudent.placement_company_name,
        placement_company_address: updatedStudent.placement_company_address,
        placement_role: updatedStudent.placement_role,
        placement_package: updatedStudent.placement_package,
        apti_details: updatedStudent.apti_details,
        apti_date: updatedStudent.apti_date,
        jd_details: updatedStudent.jd_details,
        jd_date: updatedStudent.jd_date,
        round_details: updatedStudent.round_details,
        round_date: updatedStudent.round_date
      };

      localStorage.setItem('sarvo_current_user', JSON.stringify(updatedUserObj));
      setStudentProfile(updatedUserObj);
    } catch (err) {
      console.error('Failed to sync student test results:', err);
    }
  };

  const closeQuiz = () => {
    setActiveQuiz(null);
  };

  return (
    <div style={{ padding: '24px', textAlign: 'left' }}>
      
      {/* Header Info */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>Sarvo Tech Interview assessments</h2>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
          Complete your interview process rounds like Aptitude and Technical Assessments to qualify for direct placements.
        </p>
      </div>

      {/* QUIZ DRAWER OVERLAY */}
      {activeQuiz && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '600px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--primary-bg)'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>{activeQuiz.title}</span>
              <button 
                onClick={closeQuiz} 
                style={{ background: 'none', border: 'none', color: 'var(--text-red)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                Exit Test
              </button>
            </div>

            {/* Test Screen */}
            {!quizSubmitted ? (
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '16px' }}>
                  <span>Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: timeLeft < 15 ? 'red' : 'inherit' }}>
                    <Clock size={13} /> Time Remaining: {timeLeft}s
                  </span>
                </div>

                <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '20px', lineHeight: '1.5' }}>
                  {activeQuiz.questions[currentQuestionIdx].q}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeQuiz.questions[currentQuestionIdx].options.map((opt, oIdx) => {
                    const isSelected = selectedAnswers[currentQuestionIdx] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleOptionSelect(oIdx)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '14px',
                          border: isSelected ? '2px solid var(--active-blue)' : '1px solid var(--border-color)',
                          borderRadius: '8px',
                          background: isSelected ? 'rgba(0,123,245,0.05)' : 'var(--card-bg)',
                          color: 'var(--text-main)',
                          fontSize: '13px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
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

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                  <button
                    disabled={currentQuestionIdx === 0}
                    onClick={prevQuestion}
                    style={{ padding: '8px 16px', border: '1px solid var(--border-color)', background: 'none', color: 'var(--text-main)', borderRadius: '6px', cursor: 'pointer', opacity: currentQuestionIdx === 0 ? 0.4 : 1 }}
                  >
                    Previous
                  </button>
                  {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
                    <button
                      onClick={nextQuestion}
                      style={{ padding: '8px 20px', background: 'var(--active-blue)', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      style={{ padding: '8px 24px', background: '#10b981', border: 'none', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 800 }}
                    >
                      Submit Exam
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* RESULTS PANEL */
              <div style={{ padding: '20px', maxHeight: '80vh', overflowY: 'auto' }}>
                <div style={{
                  background: 'var(--primary-bg)',
                  borderRadius: '10px',
                  padding: '20px',
                  textAlign: 'center',
                  border: '1px solid var(--border-color)',
                  marginBottom: '20px'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: quizScore >= 70 ? '#10b981' : '#f59e0b' }}>
                    {quizScore}%
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginTop: '6px' }}>
                    {quizScore >= 70 ? '🎉 Clear! You passed this round!' : 'Try again later to secure passing marks.'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Passing Score: 70% | Score synced with database roster.
                  </div>
                </div>

                <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>Assessment Review</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeQuiz.questions.map((q, qIdx) => {
                    const userAns = selectedAnswers[qIdx];
                    const isCorrect = userAns === q.answer;
                    return (
                      <div key={qIdx} style={{ padding: '12px', background: 'var(--primary-bg)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '12.5px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                          <span style={{
                            padding: '2px 6px',
                            background: isCorrect ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            color: isCorrect ? '#10b981' : '#ef4444',
                            fontSize: '9.5px',
                            fontWeight: 700,
                            borderRadius: '4px'
                          }}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                          <strong style={{ color: 'var(--text-main)' }}>{q.q}</strong>
                        </div>
                        <div style={{ color: 'var(--text-muted)', marginTop: '6px' }}>
                          Your Choice: <span style={{ color: isCorrect ? '#10b981' : '#ef4444', fontWeight: 600 }}>{q.options[userAns] || 'Skipped'}</span>
                        </div>
                        {!isCorrect && (
                          <div style={{ color: '#10b981', marginTop: '2px' }}>
                            Correct Choice: <span style={{ fontWeight: 600 }}>{q.options[q.answer]}</span>
                          </div>
                        )}
                        <p style={{ marginTop: '6px', fontSize: '11.5px', background: 'var(--card-bg)', padding: '6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                          <em>Explanation:</em> {q.explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button 
                    onClick={closeQuiz} 
                    style={{ padding: '8px 20px', background: 'var(--active-blue)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Finish Review
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Dashboard view */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Card 1: Aptitude Test */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>ROUND 1</span>
              <span style={{
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '10.5px',
                fontWeight: 700,
                background: studentProfile.apti_details?.includes('Cleared') ? 'rgba(16,185,129,0.1)' : 'rgba(0,123,245,0.06)',
                color: studentProfile.apti_details?.includes('Cleared') ? '#10b981' : 'var(--active-blue)'
              }}>
                {studentProfile.apti_details || 'Pending'}
              </span>
            </div>
            
            <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-main)', marginTop: '12px' }}>{APTITUDE_TEST.title}</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.5' }}>{APTITUDE_TEST.description}</p>
            
            <div style={{ marginTop: '14px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '15px' }}>
              <span>Duration: <strong>15 mins</strong></span>
              <span>Questions: <strong>{aptitudeQuestions.length} MCQs</strong></span>
              <span>Minimum Score: <strong>70%</strong></span>
            </div>
          </div>

          <button
            onClick={() => startQuiz(APTITUDE_TEST)}
            style={{
              width: '100%',
              padding: '10px',
              background: 'var(--active-blue)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '12.5px',
              cursor: 'pointer',
              marginTop: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Play size={13} fill="white" /> {studentProfile.apti_details?.includes('Cleared') ? 'Retake Aptitude Test' : 'Start Aptitude Test'}
          </button>
        </div>

        {/* Card 2: Technical Assessment */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>ROUND 2</span>
              <span style={{
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '10.5px',
                fontWeight: 700,
                background: studentProfile.round_details?.includes('Cleared') ? 'rgba(16,185,129,0.1)' : 'rgba(0,123,245,0.06)',
                color: studentProfile.round_details?.includes('Cleared') ? '#10b981' : 'var(--active-blue)'
              }}>
                {studentProfile.round_details || 'Pending'}
              </span>
            </div>

            <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-main)', marginTop: '12px' }}>{TECHNICAL_TEST.title}</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: '1.5' }}>{TECHNICAL_TEST.description}</p>

            <div style={{ marginTop: '14px', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '15px' }}>
              <span>Duration: <strong>10 mins</strong></span>
              <span>Questions: <strong>{technicalQuestions.length} MCQs</strong></span>
              <span>Minimum Score: <strong>70%</strong></span>
            </div>
          </div>

          <button
            onClick={() => startQuiz(TECHNICAL_TEST)}
            style={{
              width: '100%',
              padding: '10px',
              background: 'var(--active-blue)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '12.5px',
              cursor: 'pointer',
              marginTop: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Play size={13} fill="white" /> {studentProfile.round_details?.includes('Cleared') ? 'Retake Technical Test' : 'Start Technical Assessment'}
          </button>
        </div>

      </div>

    </div>
  );
}
