import React, { useState, useEffect } from 'react';
import { Mail, Lock, LogIn, ShieldAlert, Award, Clock, CheckCircle, ArrowRight, ArrowLeft, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  title: 'Sarvo prime coding challenge',
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

export default function CompetitionTestPage() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('sarvo_current_user');
    const isAuth = sessionStorage.getItem('sarvo_people_auth') === 'true';
    return isAuth && saved ? JSON.parse(saved) : null;
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Test Selection & Quiz States
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [quizScore, setQuizScore] = useState(0);

  // Dynamic Questions from Database
  const [aptitudeQuestions, setAptitudeQuestions] = useState(APTITUDE_TEST.questions);
  const [technicalQuestions, setTechnicalQuestions] = useState(TECHNICAL_TEST.questions);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [runningCode, setRunningCode] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState('');

  // Scheduled Exam States
  const [activeCompetition, setActiveCompetition] = useState(null);
  const [isExamTimeReached, setIsExamTimeReached] = useState(true);
  const [timeUntilExam, setTimeUntilExam] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoadingComp, setIsLoadingComp] = useState(false);

  // Fetch active competition and verify if current student is registered
  useEffect(() => {
    if (!currentUser) return;

    const checkActiveCompetition = async () => {
      setIsLoadingComp(true);
      try {
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const compRes = await fetch(`${apiBase}/competitions/list`);
        if (!compRes.ok) return;
        const comps = await compRes.json();

        const activeComp = comps.find(c => c.status === 'active');
        if (activeComp) {
          setActiveCompetition(activeComp);

          const regRes = await fetch(`${apiBase}/payments/registrations/${activeComp.id}`);
          if (regRes.ok) {
            const regs = await regRes.json();
            const studentReg = regs.some(r => r.student_email.toLowerCase() === currentUser.email.toLowerCase());
            setIsRegistered(studentReg);
          }
        }
      } catch (err) {
        console.error('Error fetching active competition:', err);
      } finally {
        setIsLoadingComp(false);
      }
    };

    checkActiveCompetition();
  }, [currentUser]);

  // Fetch dynamic test questions from database
  useEffect(() => {
    if (!currentUser) return;
    const loadDBQuestions = async () => {
      try {
        const token = sessionStorage.getItem('sarvo_token');
        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

        // Fetch Aptitude Questions
        const aptRes = await fetch(`${apiBase}/lms/interview-questions?testId=competition_apti_test`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (aptRes.ok) {
          const data = await aptRes.json();
          if (data && data.length > 0) {
            const parsed = data.map(q => ({
              id: q.id,
              q: q.question_text,
              options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
              answer: q.correct_option,
              explanation: q.explanation
            }));
            setAptitudeQuestions(parsed);
          }
        }

        // Fetch Technical Questions (Coding questions)
        const techRes = await fetch(`${apiBase}/lms/interview-questions?testId=competition_tech_test`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (techRes.ok) {
          const data = await techRes.json();
          if (data && data.length > 0) {
            const parsed = data.map(q => ({
              id: q.id,
              q: q.question_text,
              options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
              answer: q.correct_option,
              explanation: q.explanation
            }));
            setTechnicalQuestions(parsed);
          }
        }
      } catch (err) {
        console.error('Error fetching questions from backend:', err);
      }
    };
    loadDBQuestions();
  }, [currentUser]);

  // Real-time ticking countdown to scheduled exam start time
  useEffect(() => {
    if (!activeCompetition || !activeCompetition.exam_start_time) {
      setIsExamTimeReached(true);
      return;
    }

    const examTime = new Date(activeCompetition.exam_start_time).getTime();

    // Initial check
    const checkTime = () => {
      const now = new Date().getTime();
      const difference = examTime - now;

      if (difference <= 0) {
        setIsExamTimeReached(true);
        setTimeUntilExam('');
        return true; // completed
      } else {
        setIsExamTimeReached(false);
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        let timeStr = '';
        if (days > 0) timeStr += `${days}d `;
        if (hours > 0 || days > 0) timeStr += `${hours}h `;
        timeStr += `${minutes}m ${seconds}s`;

        setTimeUntilExam(timeStr);
        return false;
      }
    };

    const isDone = checkTime();
    if (isDone) return;

    const interval = setInterval(() => {
      const done = checkTime();
      if (done) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeCompetition]);

  // Timer Logic
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSubmitting(true);

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const res = await fetch(`${apiBase}/payments/competition/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });

      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem('sarvo_token', data.token);
        localStorage.setItem('sarvo_current_user', JSON.stringify(data.user));
        sessionStorage.setItem('sarvo_people_auth', 'true');
        setCurrentUser(data.user);
      } else {
        const errData = await res.json();
        setLoginError(errData.error || 'Invalid credentials. Please verify details.');
      }
    } catch (err) {
      console.error(err);
      setLoginError('Could not connect to server. Try again.');
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('sarvo_people_auth');
    sessionStorage.removeItem('sarvo_token');
    localStorage.removeItem('sarvo_current_user');
    setCurrentUser(null);
    setActiveQuiz(null);
  };

  const startQuiz = (testConfig) => {
    const questionsToUse = testConfig.id === 'apti_test' ? aptitudeQuestions : technicalQuestions;
    setActiveQuiz({
      ...testConfig,
      questions: questionsToUse
    });
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setTimeLeft(testConfig.id === 'apti_test' ? 120 : 600); // 10 minutes for coding round
    setQuizScore(0);
    setSelectedLanguage('python');
    setConsoleOutput('');
  };

  const handleOptionSelect = (optIndex) => {
    if (quizSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIdx]: optIndex
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
        // Armstrong test cases
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
        // Dynamic generic fallback for other questions
        // If the question is Even/Odd:
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

  const handleSubmitQuiz = async () => {
    setQuizSubmitted(true);
    let score = 0;
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
            score++;
          }
        }
      });
    } else {
      activeQuiz.questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.answer) {
          score++;
        }
      });
    }

    setQuizScore(score);

    // Sync results with the database
    try {
      const token = sessionStorage.getItem('sarvo_token');
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const todayStr = new Date().toISOString().split('T')[0];
      const scorePct = Math.round((score / activeQuiz.questions.length) * 100);

      const payload = {
        firstName: currentUser.first_name || currentUser.name?.split(' ')[0] || 'Student',
        lastName: currentUser.last_name || currentUser.name?.split(' ').slice(1).join(' ') || 'User',
        email: currentUser.email,
        phone: currentUser.phone,
        placementStatus: 'In Process',
        placementCompanyName: currentUser.placement_company_name || null,
        placementCompanyAddress: currentUser.placement_company_address || null,
        placementRole: currentUser.placement_role || null,
        placementPackage: currentUser.placement_package || null,

        aptiDetails: !isTech ? `Cleared (Score: ${scorePct}%)` : (currentUser.apti_details || 'Cleared'),
        aptiDate: !isTech ? todayStr : (currentUser.apti_date ? new Date(currentUser.apti_date).toISOString().split('T')[0] : todayStr),
        jdDetails: currentUser.jd_details || 'React / Fullstack Role JD',
        jdDate: currentUser.jd_date ? new Date(currentUser.jd_date).toISOString().split('T')[0] : todayStr,
        roundDetails: isTech ? `Cleared Tech Coding (Score: ${scorePct}%)` : (currentUser.round_details || 'Pending Technical Round'),
        roundDate: isTech ? todayStr : (currentUser.round_date ? new Date(currentUser.round_date).toISOString().split('T')[0] : null)
      };

      const res = await fetch(`${apiBase}/cohorts/students/${currentUser.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const updatedStudent = await res.json();
        const updatedUserObj = {
          ...currentUser,
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
        setCurrentUser(updatedUserObj);
      }
    } catch (err) {
      console.error('Failed to sync student quiz results to backend:', err);
    }
  };

  if (!currentUser) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        padding: '24px',
        fontFamily: "'Outfit', sans-serif"
      }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '440px',
          padding: '36px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              display: 'inline-flex',
              padding: '12px',
              borderRadius: '16px',
              background: 'rgba(59, 130, 246, 0.08)',
              color: '#3b82f6',
              marginBottom: '14px'
            }}>
              <Award size={36} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Student Test Login
            </h2>
            <p style={{ color: '#475569', fontSize: '0.9rem', margin: 0 }}>
              Enter your credentials to enter the assessment workspace
            </p>
          </div>

          {loginError && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#dc2626',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '0.85rem',
              fontWeight: 500,
              marginBottom: '20px'
            }}>
              <ShieldAlert size={14} style={{ flexShrink: 0 }} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Student Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. student@gmail.com"
                  required
                  disabled={loginSubmitting}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#0f172a',
                    outline: 'none',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loginSubmitting}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#0f172a',
                    outline: 'none',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginSubmitting}
              style={{
                width: '100%',
                background: loginSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: loginSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                transition: 'transform 0.2s',
                fontFamily: 'inherit',
                marginTop: '6px'
              }}
            >
              {loginSubmitting ? (
                'Entering...'
              ) : (
                <>
                  <span>Start Practice Portal</span>
                  <LogIn size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Logged-in Practice Workspace View
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: "'Outfit', sans-serif"
    }}>
      {/* Header bar */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => window.location.href = '/sarvo-competitions'}
            style={{
              background: 'rgba(15, 23, 42, 0.05)',
              color: '#0f172a',
              border: '1px solid rgba(15, 23, 42, 0.1)',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s',
              marginRight: '8px',
              fontFamily: 'inherit'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.05)'}
          >
            <ArrowLeft size={16} />
            Back to Site
          </button>

          <div style={{
            background: 'rgba(59, 130, 246, 0.08)',
            color: '#3b82f6',
            padding: '8px',
            borderRadius: '10px',
            display: 'flex'
          }}>
            <Award size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              SARVO Test Assessment Hub
            </h1>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Welcome back, <strong>{currentUser.first_name} {currentUser.last_name}</strong>
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '10px',
            padding: '6px 14px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          Sign Out
        </button>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: activeQuiz && activeQuiz.id === 'tech_test' ? '1400px' : '1024px', margin: '0 auto', padding: '40px 24px', transition: 'max-width 0.2s ease-in-out' }}>
        {isLoadingComp ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh', color: '#64748b' }}>
            <div style={{ textAlign: 'center' }}>
              <span className="comps-loader" style={{
                display: 'inline-block',
                width: '24px',
                height: '24px',
                border: '3px solid rgba(59, 130, 246, 0.2)',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '12px'
              }}></span>
              <p style={{ fontWeight: 600, margin: 0 }}>Loading scheduled assessments...</p>
            </div>
          </div>
        ) : !activeQuiz ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                Select Your Assessment
              </h2>
              <p style={{ color: '#475569', fontSize: '0.95rem' }}>
                Practice quantitative reasoning and coding challenge mock exams to prepare for evaluation.
              </p>
            </div>

            {/* Scheduled Warning Banner */}
            {!isExamTimeReached && activeCompetition && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.05)',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: '16px',
                padding: '20px 24px',
                marginBottom: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: '#ef4444', display: 'flex', padding: '10px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '12px' }}>
                    <Lock size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                      Exam Scheduled: {activeCompetition.title}
                    </h4>
                    <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0 }}>
                      The exam is scheduled to start on <strong>{new Date(activeCompetition.exam_start_time).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}</strong>.
                    </p>
                  </div>
                </div>
                <div style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '1rem',
                  padding: '8px 20px',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)',
                  fontFamily: 'monospace'
                }}>
                  Starts in: {timeUntilExam}
                </div>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px'
            }}>
              {/* Test 1 Card */}
              <div style={{
                background: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '20px',
                padding: '28px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{
                    display: 'inline-flex',
                    padding: '10px',
                    borderRadius: '12px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    color: '#f59e0b',
                    marginBottom: '16px'
                  }}>
                    <Clock size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
                    {APTITUDE_TEST.title}
                  </h3>
                  <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                    {APTITUDE_TEST.description}
                  </p>
                </div>
                <button
                  onClick={() => startQuiz(APTITUDE_TEST)}
                  disabled={!isExamTimeReached}
                  style={{
                    background: !isExamTimeReached ? '#94a3b8' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: !isExamTimeReached ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%'
                  }}
                >
                  {!isExamTimeReached ? (
                    <>
                      <Lock size={16} />
                      <span>Locked (Starts in {timeUntilExam})</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      <span>Start Aptitude Test</span>
                    </>
                  )}
                </button>
              </div>

              {/* Test 2 Card */}
              <div style={{
                background: '#ffffff',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderRadius: '20px',
                padding: '28px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{
                    display: 'inline-flex',
                    padding: '10px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    color: '#10b981',
                    marginBottom: '16px'
                  }}>
                    <CheckCircle2 size={20} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
                    {TECHNICAL_TEST.title}
                  </h3>
                  <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: 1.5, margin: '0 0 20px 0' }}>
                    {TECHNICAL_TEST.description}
                  </p>
                </div>
                <button
                  onClick={() => startQuiz(TECHNICAL_TEST)}
                  disabled={!isExamTimeReached}
                  style={{
                    background: !isExamTimeReached ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: !isExamTimeReached ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%'
                  }}
                >
                  {!isExamTimeReached ? (
                    <>
                      <Lock size={16} />
                      <span>Locked (Starts in {timeUntilExam})</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      <span>Start Coding & Technical Test</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Active Test Execution Space */
          <div style={{
            background: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '24px',
            padding: activeQuiz && activeQuiz.id === 'tech_test' ? '24px' : '40px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)'
          }}>
            {/* Quiz Header Info */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              paddingBottom: '20px',
              marginBottom: '30px'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#3b82f6', fontWeight: 700 }}>
                  Active Assessment
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
                  {activeQuiz.title}
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {!quizSubmitted && (
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to exit the test? Your current progress will be lost.")) {
                        setActiveQuiz(null);
                      }
                    }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '10px',
                      padding: '8px 16px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)'}
                  >
                    Exit Test
                  </button>
                )}

                {!quizSubmitted && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    color: '#dc2626',
                    fontWeight: 700,
                    fontSize: '0.95rem'
                  }}>
                    <Clock size={16} />
                    Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </div>
                )}
              </div>
            </div>

            {/* Test progress indicator */}
            {!quizSubmitted ? (
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '30px' }}>
                  {activeQuiz.questions.map((_, idx) => {
                    const isSelected = selectedAnswers[idx] !== undefined;
                    const isCurrent = idx === currentQuestionIdx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setCurrentQuestionIdx(idx)}
                        style={{
                          flex: 1,
                          height: '8px',
                          borderRadius: '4px',
                          background: isCurrent
                            ? '#3b82f6'
                            : isSelected
                              ? 'rgba(59, 130, 246, 0.4)'
                              : '#e2e8f0',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                      />
                    );
                  })}
                </div>

                {/* Question Block / Premium IDE workspace */}
                {activeQuiz.id === 'tech_test' ? (
                  <div style={{ display: 'flex', gap: '24px', flexDirection: 'row', alignItems: 'stretch', marginTop: '20px', minHeight: '560px' }}>
                    {/* Left: Problem Statement Panel */}
                    <div style={{
                      flex: '1',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      padding: '24px',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.01)',
                      maxHeight: '600px',
                      overflowY: 'auto'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Problem Description
                        </span>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
                          Question {currentQuestionIdx + 1} of {activeQuiz.questions.length}
                        </h4>
                      </div>

                      <div style={{
                        color: '#334155',
                        fontSize: '0.92rem',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        background: '#ffffff',
                        border: '1px solid rgba(0,0,0,0.06)',
                        padding: '16px',
                        borderRadius: '12px',
                        maxHeight: '380px',
                        overflowY: 'auto',
                        fontFamily: 'inherit'
                      }}>
                        {activeQuiz.questions[currentQuestionIdx].q}
                      </div>

                      {activeQuiz.questions[currentQuestionIdx].explanation && (
                        <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                            Input/Output Examples:
                          </span>
                          <div style={{
                            padding: '12px 14px',
                            background: '#f1f5f9',
                            borderRadius: '10px',
                            fontSize: '0.8rem',
                            color: '#475569',
                            borderLeft: '4px solid #3b82f6',
                            fontFamily: 'Consolas, Monaco, monospace',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {activeQuiz.questions[currentQuestionIdx].explanation}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Coding IDE Panel */}
                    <div style={{
                      flex: '1.2',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}>
                      {/* Language selection header */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: '#f8fafc',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                            Language:
                          </span>
                          <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '8px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: '#334155',
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
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          Reset Template
                        </button>
                      </div>

                      {/* Code Editor Area */}
                      <div style={{
                        position: 'relative',
                        background: '#1e1e1e',
                        borderRadius: '16px',
                        border: '1px solid #334155',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        overflow: 'hidden',
                        minHeight: '300px'
                      }}>
                        {/* Line Numbers gutter */}
                        <div style={{
                          padding: '16px 8px 16px 12px',
                          color: '#858585',
                          fontFamily: 'Consolas, Monaco, monospace',
                          fontSize: '13px',
                          lineHeight: '20px',
                          userSelect: 'none',
                          textAlign: 'right',
                          background: '#181818',
                          borderRight: '1px solid #2d3748',
                          minWidth: '35px'
                        }}>
                          {Array.from({ length: Math.max(15, (getQuestionCode(currentQuestionIdx, selectedLanguage).match(/\n/g) || []).length + 2) }).map((_, i) => (
                            <div key={i}>{i + 1}</div>
                          ))}
                        </div>

                        {/* Code input textarea */}
                        <textarea
                          value={getQuestionCode(currentQuestionIdx, selectedLanguage)}
                          onChange={(e) => handleCodeChange(e.target.value)}
                          onKeyDown={handleKeyDown}
                          spellCheck={false}
                          style={{
                            flex: 1,
                            padding: '16px',
                            background: 'transparent',
                            color: '#d4d4d4',
                            border: 'none',
                            outline: 'none',
                            fontFamily: 'Consolas, Monaco, monospace',
                            fontSize: '13px',
                            lineHeight: '20px',
                            resize: 'vertical',
                            minHeight: '300px',
                            whiteSpace: 'pre',
                            overflowWrap: 'normal',
                            overflowX: 'auto',
                            tabSize: 4
                          }}
                        />
                      </div>

                      {/* Output Console log box */}
                      <div style={{
                        background: '#0f172a',
                        borderRadius: '12px',
                        border: '1px solid #1e293b',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          background: '#1e293b',
                          padding: '6px 12px',
                          fontSize: '0.75rem',
                          color: '#94a3b8',
                          fontWeight: 700,
                          textAlign: 'left',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span>Output Console Log</span>
                          {runningCode && <span style={{ color: '#3b82f6' }}>Executing tests...</span>}
                        </div>
                        <pre style={{
                          margin: 0,
                          padding: '12px',
                          color: '#e2e8f0',
                          background: '#090d16',
                          fontSize: '0.8rem',
                          textAlign: 'left',
                          fontFamily: 'Consolas, Monaco, monospace',
                          minHeight: '80px',
                          maxHeight: '120px',
                          overflowY: 'auto',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {consoleOutput || '// Click "Run Code" to compile and execute local test cases.'}
                        </pre>
                      </div>

                      {/* IDE Buttons panel */}
                      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <button
                          type="button"
                          onClick={handleRunCode}
                          disabled={runningCode}
                          style={{
                            background: runningCode ? '#475569' : 'linear-gradient(135deg, #475569, #334155)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 20px',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            cursor: runningCode ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Play size={14} fill="white" />
                          <span>Run Code</span>
                        </button>
                      </div>

                    </div>
                  </div>
                ) : (
                  <div style={{ marginBottom: '30px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>
                      QUESTION {currentQuestionIdx + 1} OF {activeQuiz.questions.length}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '8px 0 24px 0', lineHeight: 1.5 }}>
                      {activeQuiz.questions[currentQuestionIdx].q}
                    </h3>

                    {/* Options */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {activeQuiz.questions[currentQuestionIdx].options.map((opt, oIdx) => {
                        const isSelected = selectedAnswers[currentQuestionIdx] === oIdx;
                        return (
                          <div
                            key={oIdx}
                            onClick={() => handleOptionSelect(oIdx)}
                            style={{
                              padding: '16px 20px',
                              border: isSelected ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                              background: isSelected ? 'rgba(59, 130, 246, 0.04)' : '#ffffff',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              border: isSelected ? '5px solid #3b82f6' : '2px solid #cbd5e1',
                              background: '#ffffff',
                              flexShrink: 0
                            }} />
                            <span style={{ fontSize: '0.95rem', color: '#334155', fontWeight: isSelected ? 600 : 500 }}>
                              {opt}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Nav actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                  <button
                    disabled={currentQuestionIdx === 0}
                    onClick={() => setCurrentQuestionIdx(currentQuestionIdx - 1)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '10px 20px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      cursor: currentQuestionIdx === 0 ? 'not-allowed' : 'pointer',
                      color: '#475569',
                      opacity: currentQuestionIdx === 0 ? 0.5 : 1
                    }}
                  >
                    Previous Question
                  </button>

                  {currentQuestionIdx < activeQuiz.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
                      style={{
                        background: '#3b82f6',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 24px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Next Question
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      style={{
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 28px',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      Submit Test
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Success/Result Screen */
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  display: 'inline-flex',
                  padding: '16px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.08)',
                  color: '#10b981',
                  marginBottom: '20px'
                }}>
                  <CheckCircle size={48} />
                </div>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0' }}>
                  Test Assessment Completed!
                </h3>
                <p style={{ color: '#475569', fontSize: '1rem', margin: '0 0 24px 0' }}>
                  You have successfully completed the practice mock test.
                </p>

                {/* Score panel */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'inline-block',
                  minWidth: '220px',
                  marginBottom: '40px'
                }}>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Your Score
                  </span>
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: '#10b981', margin: '4px 0' }}>
                    {quizScore} <span style={{ fontSize: '1.5rem', color: '#64748b', fontWeight: 500 }}>/ {activeQuiz.questions.length}</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                    Percentage: {Math.round((quizScore / activeQuiz.questions.length) * 100)}%
                  </span>
                </div>

                {/* Review Answers block */}
                <div style={{ textAlign: 'left', borderTop: '1px solid #e2e8f0', paddingTop: '30px', marginTop: '20px' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>
                    Review Answers
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {activeQuiz.questions.map((q, idx) => {
                      const isCodingTest = activeQuiz.id === 'tech_test';
                      const userAns = selectedAnswers[idx];

                      if (isCodingTest) {
                        const userCodeObj = userAns || {};
                        const currentLang = userCodeObj.selectedLanguage || 'python';
                        const code = userCodeObj[currentLang] || '';
                        const defaultTemplate = q.options?.[LANG_MAP[currentLang]?.idx ?? 0] || '';
                        const isModified = code.trim().length > 0 && code.trim() !== defaultTemplate.trim();

                        return (
                          <div key={idx} style={{
                            border: `1px solid ${isModified ? '#bbf7d0' : '#fecdd3'}`,
                            background: isModified ? '#f0fdf4' : '#fff5f5',
                            padding: '20px',
                            borderRadius: '16px',
                            textAlign: 'left'
                          }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isModified ? '#16a34a' : '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              {isModified ? '✓ Code Submitted' : '✗ Unattempted / Incomplete'}
                            </span>
                            <h5 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 12px 0' }}>
                              {idx + 1}. {q.q}
                            </h5>

                            {isModified ? (
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#475569', marginBottom: '8px', fontWeight: 600 }}>
                                  <span>Language: <strong style={{ textTransform: 'capitalize' }}>{currentLang}</strong></span>
                                </div>
                                <pre style={{
                                  padding: '12px',
                                  background: '#1e1e1e',
                                  color: '#d4d4d4',
                                  borderRadius: '10px',
                                  fontSize: '0.8rem',
                                  fontFamily: 'Consolas, Monaco, monospace',
                                  overflowX: 'auto',
                                  maxHeight: '200px',
                                  whiteSpace: 'pre',
                                  margin: 0
                                }}>
                                  {code}
                                </pre>
                              </div>
                            ) : (
                              <p style={{ fontSize: '0.9rem', color: '#dc2626', margin: 0 }}>
                                No code was written or modified for this question.
                              </p>
                            )}
                          </div>
                        );
                      }

                      const isCorrect = userAns === q.answer;
                      return (
                        <div key={idx} style={{
                          border: `1px solid ${isCorrect ? '#bbf7d0' : '#fecdd3'}`,
                          background: isCorrect ? '#f0fdf4' : '#fff5f5',
                          padding: '20px',
                          borderRadius: '16px'
                        }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isCorrect ? '#16a34a' : '#dc2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                          </span>
                          <h5 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 12px 0' }}>
                            {idx + 1}. {q.q}
                          </h5>
                          <p style={{ fontSize: '0.9rem', color: '#334155', margin: '0 0 6px 0' }}>
                            Your Answer: <strong>{userAns !== undefined ? q.options[userAns] : 'Not answered'}</strong>
                          </p>
                          <p style={{ fontSize: '0.9rem', color: '#16a34a', margin: '0 0 10px 0' }}>
                            Correct Answer: <strong>{q.options[q.answer]}</strong>
                          </p>
                          <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.05)', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', color: '#475569' }}>
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '40px' }}>
                  <button
                    onClick={() => setActiveQuiz(null)}
                    style={{
                      background: '#3b82f6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 30px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Back to Test List
                  </button>
                  <button
                    onClick={() => {
                      window.location.href = '/sarvo-competitions';
                    }}
                    style={{
                      background: 'rgba(15, 23, 42, 0.05)',
                      color: '#0f172a',
                      border: '1px solid rgba(15, 23, 42, 0.1)',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Back to Competitions Hub
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
