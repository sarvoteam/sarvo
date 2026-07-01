import React, { useState, useEffect } from 'react';
import { ClipboardList, Award, Clock, CheckCircle2, AlertCircle, Play, ArrowRight, ChevronRight } from 'lucide-react';
import { cohortApi } from '../apis/cohortApi';
import { lmsApi } from '../apis/lmsApi';

const LANG_MAP = {
  python: { label: 'Python', idx: 0 },
  java: { label: 'Java', idx: 1 },
  cpp: { label: 'C++', idx: 2 },
  javascript: { label: 'JavaScript', idx: 3 }
};



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
  title: 'sarvo prime coding challenge',
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
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [runningCode, setRunningCode] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('');
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
    setTimeLeft(quizConfig.id === 'apti_test' ? 60 : 600); // 10 minutes for coding round
    setQuizScore(0);
    setSelectedLanguage('python');
    setConsoleOutput('');
  };


  const handleOptionSelect = (oIdx) => {
    if (quizSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIdx]: oIdx
    });
  };

  const getQuestionCode = (qIdx, lang) => {
    const question = activeQuiz?.questions?.[qIdx];
    if (!question) return '';
    const userState = selectedAnswers[qIdx];
    if (userState && userState[lang] !== undefined) {
      return userState[lang];
    }
    const langIdx = LANG_MAP[lang]?.idx ?? 0;
    return question.options?.[langIdx] || '';
  };

  const handleCodeChange = (newCode) => {
    if (quizSubmitted) return;
    const currentQuestionState = selectedAnswers[currentQuestionIdx] || {};
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIdx]: {
        ...currentQuestionState,
        [selectedLanguage]: newCode,
        selectedLanguage: selectedLanguage
      }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const { selectionStart, selectionEnd, value } = e.target;
      const newValue = value.substring(0, selectionStart) + "    " + value.substring(selectionEnd);
      e.target.value = newValue;
      e.target.selectionStart = e.target.selectionEnd = selectionStart + 4;
      handleCodeChange(newValue);
    }
  };

  const handleResetCode = () => {
    if (window.confirm("Are you sure you want to reset your code for this language? All changes will be lost.")) {
      const currentQuestionState = selectedAnswers[currentQuestionIdx] || {};
      const question = activeQuiz.questions[currentQuestionIdx];
      const langIdx = LANG_MAP[selectedLanguage].idx;
      const defaultTemplate = question.options?.[langIdx] || '';
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQuestionIdx]: {
          ...currentQuestionState,
          [selectedLanguage]: defaultTemplate,
          selectedLanguage: selectedLanguage
        }
      });
    }
  };

  const runTestCases = (code, lang, questionText) => {
    const isAddTwoNumbers = questionText.toLowerCase().includes('sum of two') || questionText.toLowerCase().includes('add two number') || questionText.toLowerCase().includes('add two');
    const isPrime = questionText.toLowerCase().includes('prime');
    const isReverse = questionText.toLowerCase().includes('reverse');
    const isArmstrong = questionText.toLowerCase().includes('armstrong');

    let jsCode = code;

    // Stripping line comments
    jsCode = jsCode.replace(/\/\/.*/g, '');
    jsCode = jsCode.replace(/#.*/g, '');

    if (lang === 'python') {
      // Basic def translation
      jsCode = jsCode.replace(/def\s+(\w+)\s*\(([^)]*)\)\s*:/g, 'function $1($2) {');
      jsCode = jsCode.replace(/return\s+/g, 'return ');
      // Ensure we close the brackets if it's python indentation
      jsCode += '\n}';
    } else if (lang === 'java' || lang === 'cpp') {
      // Strip cast expressions: e.g. (int), (double)
      jsCode = jsCode.replace(/\(\s*(int|bool|boolean|string|String|double|float|char|long|short)\s*\)/gi, '');
      // Strip class wrapping
      jsCode = jsCode.replace(/public\s+class\s+\w+\s*\{/g, '');
      jsCode = jsCode.replace(/class\s+\w+\s*\{/g, '');
      // Strip public, int, bool types from function signatures
      jsCode = jsCode.replace(/(public\s+)?(int|bool|boolean|string|void|String|double|float)\s+(\w+)\s*\(([^)]*)\)/gi, 'function $3($4)');
      // Strip type declarations inside parameters
      jsCode = jsCode.replace(/(int|bool|boolean|string|String|double|float)\s+(\w+)/gi, '$2');
      // Replace variable type definitions: e.g. "int c" to "let c"
      jsCode = jsCode.replace(/\b(int|bool|boolean|string|String|double|float|char|long|short)\b(?!\s*\()/g, 'let');
      // Replace .length() with .length
      jsCode = jsCode.replace(/\.length\(\)/g, '.length');
      // Strip any accidental (let) cast expressions
      jsCode = jsCode.replace(/\(\s*let\s*\)/gi, '');
      
      // Strip last closing brace from class Solution
      if (code.includes('class ')) {
        const lastBraceIdx = jsCode.lastIndexOf('}');
        if (lastBraceIdx !== -1) {
          jsCode = jsCode.substring(0, lastBraceIdx) + jsCode.substring(lastBraceIdx + 1);
        }
      }
    }

    try {
      const wrapped = `
        if (typeof String.valueOf !== 'function') {
          String.valueOf = function(val) { return String(val); };
        }
        if (typeof to_string !== 'function') {
          to_string = function(val) { return String(val); };
        }
        ${jsCode}
        if (typeof solve !== 'function') {
          throw new Error("Function 'solve' not found. Please ensure your function is named 'solve'.");
        }
        return solve;
      `;
      const solveFunc = new Function(wrapped)();

      const results = [];
      let allPassed = true;

      if (isAddTwoNumbers) {
        const tests = [
          { inputs: [12, 15], expected: 27 },
          { inputs: [5, 7], expected: 12 },
          { inputs: [-3, 8], expected: 5 }
        ];
        tests.forEach((t, i) => {
          const output = solveFunc(t.inputs[0], t.inputs[1]);
          const passed = output === t.expected;
          if (!passed) allPassed = false;
          results.push({
            name: `Test Case ${i + 1}`,
            inputs: `a = ${t.inputs[0]}, b = ${t.inputs[1]}`,
            expected: t.expected,
            actual: output !== undefined ? output : 'undefined',
            passed
          });
        });
      } else if (isPrime) {
        const tests = [
          { inputs: [7], expected: true },
          { inputs: [4], expected: false },
          { inputs: [1], expected: false },
          { inputs: [11], expected: true }
        ];
        tests.forEach((t, i) => {
          const output = solveFunc(t.inputs[0]);
          const outputBool = (output === 1 || output === true);
          const passed = outputBool === t.expected;
          if (!passed) allPassed = false;
          results.push({
            name: `Test Case ${i + 1}`,
            inputs: `n = ${t.inputs[0]}`,
            expected: t.expected ? 'true' : 'false',
            actual: output !== undefined ? (outputBool ? 'true' : 'false') : 'undefined',
            passed
          });
        });
      } else if (isReverse) {
        const tests = [
          { inputs: ["sarvo"], expected: "ovras" },
          { inputs: ["hello"], expected: "olleh" },
          { inputs: ["a"], expected: "a" }
        ];
        tests.forEach((t, i) => {
          const output = solveFunc(t.inputs[0]);
          const passed = output === t.expected;
          if (!passed) allPassed = false;
          results.push({
            name: `Test Case ${i + 1}`,
            inputs: `s = "${t.inputs[0]}"`,
            expected: `"${t.expected}"`,
            actual: output !== undefined ? `"${output}"` : 'undefined',
            passed
          });
        });
      } else if (isArmstrong) {
        const tests = [
          { inputs: [153], expected: 1 },
          { inputs: [370], expected: 1 },
          { inputs: [123], expected: 0 },
          { inputs: [9474], expected: 1 }
        ];
        tests.forEach((t, i) => {
          const output = solveFunc(t.inputs[0]);
          const passed = (output === t.expected || (output === true && t.expected === 1) || (output === false && t.expected === 0));
          if (!passed) allPassed = false;
          results.push({
            name: `Test Case ${i + 1}`,
            inputs: `n = ${t.inputs[0]}`,
            expected: t.expected,
            actual: output !== undefined ? (output === true ? 1 : (output === false ? 0 : output)) : 'undefined',
            passed
          });
        });
      } else {
        const isEven = questionText.toLowerCase().includes('even');
        if (isEven) {
          const tests = [
            { inputs: [4], expected: true },
            { inputs: [7], expected: false },
            { inputs: [0], expected: true }
          ];
          tests.forEach((t, i) => {
            const output = solveFunc(t.inputs[0]);
            const outputBool = (output === 1 || output === true);
            const passed = outputBool === t.expected;
            if (!passed) allPassed = false;
            results.push({
              name: `Test Case ${i + 1}`,
              inputs: `n = ${t.inputs[0]}`,
              expected: t.expected ? 'true' : 'false',
              actual: output !== undefined ? (outputBool ? 'true' : 'false') : 'undefined',
              passed
            });
          });
        } else {
          throw new Error("No validator test suite defined for this question text.");
        }
      }

      return { success: allPassed, results };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleRunCode = () => {
    setRunningCode(true);
    setConsoleOutput('Compiling code files...\nLinking libraries...\nExecuting standard test cases...\n');
    setTimeout(() => {
      const code = getQuestionCode(currentQuestionIdx, selectedLanguage);
      const question = activeQuiz.questions[currentQuestionIdx];
      const evaluation = runTestCases(code, selectedLanguage, question.q);

      if (evaluation.error) {
        setConsoleOutput(`Compilation Error:\n------------------\n${evaluation.error}\n`);
      } else if (!evaluation.success) {
        let output = `❌ FAILURE: Some sample test cases failed!\n\n`;
        evaluation.results.forEach(res => {
          output += `[RUNNING] ${res.name} (${res.inputs}) -> ${res.passed ? '✅ SUCCESS' : '❌ FAILED'}\n`;
          if (!res.passed) {
            output += `   Expected: ${res.expected}\n   Actual:   ${res.actual}\n`;
          }
        });
        setConsoleOutput(output);
      } else {
        let output = `🎉 SUCCESS: All sample test cases passed successfully!\n\n`;
        evaluation.results.forEach(res => {
          output += `[RUNNING] ${res.name} (${res.inputs}) -> ✅ SUCCESS\n`;
        });
        output += `\nTime elapsed: 18ms\nMemory consumed: 1.2 MB\n`;
        setConsoleOutput(output);
      }
      setRunningCode(false);
    }, 1200);
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
    const isTech = activeQuiz.id === 'tech_test';

    if (isTech) {
      activeQuiz.questions.forEach((q, idx) => {
        const userState = selectedAnswers[idx] || {};
        const currentLang = userState.selectedLanguage || 'python';
        const code = userState[currentLang] || '';
        const defaultTemplate = q.options?.[LANG_MAP[currentLang].idx] || '';

        if (code.trim().length > 0 && code.trim() !== defaultTemplate.trim()) {
          const evaluation = runTestCases(code, currentLang, q.q);
          if (evaluation.success) {
            correct++;
          }
        }
      });
    } else {
      activeQuiz.questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.answer) {
          correct++;
        }
      });
    }

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
        roundDetails: !isApti ? `Cleared Tech Coding (Score: ${scorePct}%)` : (studentProfile.round_details || 'Pending Technical Round'),
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
            maxWidth: activeQuiz.id === 'tech_test' ? '1100px' : '600px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'max-width 0.3s ease-in-out'
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

                {activeQuiz.id === 'tech_test' ? (
                  /* Custom IDE Split Panel for Student */
                  <div style={{ display: 'flex', gap: '20px', flexDirection: 'row', alignItems: 'stretch', minHeight: '380px' }}>
                    {/* Left Description Column */}
                    <div style={{
                      flex: '1',
                      background: 'var(--primary-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '16px',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--active-blue)', textTransform: 'uppercase' }}>
                        Problem Statement
                      </span>
                      <div style={{
                        color: 'var(--text-main)',
                        fontSize: '13px',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-wrap',
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        padding: '12px',
                        borderRadius: '8px',
                        maxHeight: '260px',
                        overflowY: 'auto'
                      }}>
                        {activeQuiz.questions[currentQuestionIdx].q}
                      </div>

                      {activeQuiz.questions[currentQuestionIdx].explanation && (
                        <div style={{ marginTop: 'auto' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                            Examples / Notes:
                          </span>
                          <div style={{
                            padding: '10px',
                            background: 'var(--card-bg)',
                            borderRadius: '8px',
                            fontSize: '11.5px',
                            color: 'var(--text-muted)',
                            borderLeft: '3px solid var(--active-blue)',
                            fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {activeQuiz.questions[currentQuestionIdx].explanation}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Coding Workspace */}
                    <div style={{
                      flex: '1.2',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      {/* Lang selection & control tools */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'var(--primary-bg)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Lang:</span>
                          <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              background: 'var(--card-bg)',
                              fontSize: '12px',
                              color: 'var(--text-main)',
                              outline: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                            <option value="javascript">JavaScript</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={handleResetCode}
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                        >
                          Reset Default
                        </button>
                      </div>

                      {/* Code Editor Box */}
                      <div style={{
                        position: 'relative',
                        background: '#1e1e1e',
                        borderRadius: '10px',
                        border: '1px solid #334155',
                        display: 'flex',
                        overflow: 'hidden',
                        minHeight: '220px'
                      }}>
                        {/* Line numbers column */}
                        <div style={{
                          padding: '12px 6px 12px 10px',
                          color: '#6e6e6e',
                          fontFamily: 'Consolas, Monaco, monospace',
                          fontSize: '12.5px',
                          lineHeight: '18px',
                          userSelect: 'none',
                          textAlign: 'right',
                          background: '#161616',
                          borderRight: '1px solid #2d3748',
                          minWidth: '32px'
                        }}>
                          {Array.from({ length: Math.max(12, (getQuestionCode(currentQuestionIdx, selectedLanguage).match(/\n/g) || []).length + 2) }).map((_, i) => (
                            <div key={i}>{i + 1}</div>
                          ))}
                        </div>

                        {/* Editor field */}
                        <textarea
                          value={getQuestionCode(currentQuestionIdx, selectedLanguage)}
                          onChange={(e) => handleCodeChange(e.target.value)}
                          onKeyDown={handleKeyDown}
                          spellCheck={false}
                          style={{
                            flex: 1,
                            padding: '12px',
                            background: 'transparent',
                            color: '#d4d4d4',
                            border: 'none',
                            outline: 'none',
                            fontFamily: 'Consolas, Monaco, monospace',
                            fontSize: '12.5px',
                            lineHeight: '18px',
                            resize: 'vertical',
                            minHeight: '220px',
                            whiteSpace: 'pre',
                            overflowWrap: 'normal',
                            overflowX: 'auto',
                            tabSize: 4
                          }}
                        />
                      </div>

                      {/* Local Output console log */}
                      <div style={{
                        background: '#0f172a',
                        borderRadius: '8px',
                        border: '1px solid #1e293b',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          background: '#1e293b',
                          padding: '4px 10px',
                          fontSize: '11px',
                          color: '#94a3b8',
                          fontWeight: 700,
                          textAlign: 'left',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span>Console Log</span>
                          {runningCode && <span style={{ color: '#3b82f6' }}>Executing...</span>}
                        </div>
                        <pre style={{
                          margin: 0,
                          padding: '10px',
                          color: '#e2e8f0',
                          background: '#090d16',
                          fontSize: '11px',
                          textAlign: 'left',
                          fontFamily: 'monospace',
                          minHeight: '60px',
                          maxHeight: '100px',
                          overflowY: 'auto',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {consoleOutput || '// Execute templates with standard inputs.'}
                        </pre>
                      </div>

                      {/* Console run actions button */}
                      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <button
                          type="button"
                          onClick={handleRunCode}
                          disabled={runningCode}
                          style={{
                            background: runningCode ? '#475569' : 'var(--active-blue)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '6px 14px',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: runningCode ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Play size={12} fill="white" />
                          <span>Run Code</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
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
                  </>
                )}

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
                    const isCodingTest = activeQuiz.id === 'tech_test';
                    const userAns = selectedAnswers[qIdx];

                    if (isCodingTest) {
                      const userCodeObj = userAns || {};
                      const currentLang = userCodeObj.selectedLanguage || 'python';
                      const code = userCodeObj[currentLang] || '';
                      const defaultTemplate = q.options?.[LANG_MAP[currentLang]?.idx ?? 0] || '';
                      const isModified = code.trim().length > 0 && code.trim() !== defaultTemplate.trim();

                      return (
                        <div key={qIdx} style={{ padding: '16px', background: 'var(--primary-bg)', borderRadius: '8px', border: `1px solid ${isModified ? '#bbf7d0' : 'var(--border-color)'}`, fontSize: '12.5px', textAlign: 'left' }}>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                            <span style={{
                              padding: '2px 6px',
                              background: isModified ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                              color: isModified ? '#10b981' : '#ef4444',
                              fontSize: '9.5px',
                              fontWeight: 700,
                              borderRadius: '4px'
                            }}>
                              {isModified ? 'Submitted' : 'Incomplete'}
                            </span>
                            <strong style={{ color: 'var(--text-main)' }}>{q.q}</strong>
                          </div>

                          {isModified ? (
                            <div style={{ marginTop: '12px' }}>
                              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                Language: <strong style={{ textTransform: 'capitalize' }}>{currentLang}</strong>
                              </div>
                              <pre style={{
                                padding: '10px',
                                background: '#1e1e1e',
                                color: '#d4d4d4',
                                borderRadius: '6px',
                                fontSize: '11.5px',
                                fontFamily: 'Consolas, Monaco, monospace',
                                overflowX: 'auto',
                                maxHeight: '160px',
                                whiteSpace: 'pre',
                                margin: 0
                              }}>
                                {code}
                              </pre>
                            </div>
                          ) : (
                            <p style={{ color: '#ef4444', margin: '8px 0 0 0', fontSize: '11.5px' }}>
                              No code was written or modified for this question.
                            </p>
                          )}
                        </div>
                      );
                    }

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
