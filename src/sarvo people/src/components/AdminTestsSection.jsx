import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Check, X, AlertCircle, HelpCircle, Trophy } from 'lucide-react';
import { lmsApi } from '../apis/lmsApi';
import { cohortApi } from '../apis/cohortApi';
import { competitionApi } from '../apis/competitionApi';

export default function AdminTestsSection({ currentUser, subNavItem }) {
  // Common State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Configure Questions State
  const [activeTestFilter, setActiveTestFilter] = useState('apti_test'); // apti_test or tech_test
  const [activeContext, setActiveContext] = useState('training'); // training or competition
  const [questions, setQuestions] = useState([]);
  const [competitions, setCompetitions] = useState([]);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState('');
  const [loadingCompetitions, setLoadingCompetitions] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copySourceCompId, setCopySourceCompId] = useState('');
  const [activeLangTab, setActiveLangTab] = useState({});
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Form State for Add/Edit Question
  const [formText, setFormText] = useState('');
  const [formOptA, setFormOptA] = useState('');
  const [formOptB, setFormOptB] = useState('');
  const [formOptC, setFormOptC] = useState('');
  const [formOptD, setFormOptD] = useState('');
  const [formCorrectIdx, setFormCorrectIdx] = useState(0);
  const [formExplanation, setFormExplanation] = useState('');

  // Student Scores State & Filters
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompFilter, setSelectedCompFilter] = useState('all');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState('all');
  const [selectedCollegeFilter, setSelectedCollegeFilter] = useState('all');
  const [selectedScoreFilter, setSelectedScoreFilter] = useState('all');

  // Load active competitions
  const loadCompetitions = async () => {
    setLoadingCompetitions(true);
    try {
      const data = await competitionApi.getCompetitions();
      const activeOnly = (data || []).filter(c => c.status === 'active');
      setCompetitions(activeOnly);
      if (activeOnly.length > 0) {
        setSelectedCompetitionId(prev => prev || activeOnly[0].id);
        setCopySourceCompId(prev => prev || activeOnly[0].id);
      }
    } catch (err) {
      console.error('Failed to load active competitions:', err);
    } finally {
      setLoadingCompetitions(false);
    }
  };

  // Load questions based on activeTestFilter and activeContext
  const loadQuestions = async () => {
    if (activeContext === 'competition' && !selectedCompetitionId) {
      setQuestions([]);
      return;
    }
    setLoading(true);
    try {
      const apiTestId = activeContext === 'competition'
        ? (activeTestFilter === 'apti_test' ? `competition_${selectedCompetitionId}_apti_test` : `competition_${selectedCompetitionId}_tech_test`)
        : activeTestFilter;
      const data = await lmsApi.getInterviewQuestions(apiTestId);
      // Parse options if stored as string
      const parsed = data.map(q => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
      }));
      setQuestions(parsed || []);
    } catch (err) {
      console.error('Failed to load questions:', err);
      setErrorMsg('Failed to load questions from database.');
    } finally {
      setLoading(false);
    }
  };

  // Load students for Scores Roster (Competition Participants)
  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await cohortApi.getCompetitionStudents();
      setStudents(data || []);
    } catch (err) {
      console.error('Failed to load students:', err);
      setErrorMsg('Failed to load student roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompetitions();
  }, []);

  useEffect(() => {
    if (subNavItem === 'Configure Questions') {
      loadQuestions();
    } else if (subNavItem === 'Student Scores') {
      loadStudents();
    }
  }, [subNavItem, activeTestFilter, activeContext, selectedCompetitionId]);

  // Open modal for new question
  const handleOpenAddModal = () => {
    setEditingQuestion(null);
    setFormText('');
    if (activeTestFilter === 'tech_test') {
      setFormOptA('def solve(n):\n    # Write your Python code here\n    pass');
      setFormOptB('public class Solution {\n    public int solve(int n) {\n        // Write your Java code here\n        return 0;\n    }\n}');
      setFormOptC('#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n    int solve(int n) {\n        // Write your C++ code here\n        return 0;\n    }\n};');
      setFormOptD('function solve(n) {\n    // Write your JavaScript code here\n    return 0;\n}');
    } else {
      setFormOptA('');
      setFormOptB('');
      setFormOptC('');
      setFormOptD('');
    }
    setFormCorrectIdx(0);
    setFormExplanation('');
    setIsQuestionModalOpen(true);
  };

  // Open modal for editing question
  const handleOpenEditModal = (q) => {
    setEditingQuestion(q);
    setFormText(q.question_text || '');
    setFormOptA(q.options?.[0] || '');
    setFormOptB(q.options?.[1] || '');
    setFormOptC(q.options?.[2] || '');
    setFormOptD(q.options?.[3] || '');
    setFormCorrectIdx(q.correct_option || 0);
    setFormExplanation(q.explanation || '');
    setIsQuestionModalOpen(true);
  };

  const handleAutoGenerateTemplates = () => {
    if (!formText.trim()) {
      alert("Please enter a question description first.");
      return;
    }

    const desc = formText.toLowerCase();

    let funcName = 'solve';
    let pyParams = 'n';
    let javaParams = 'int n';
    let cppParams = 'int n';
    let jsParams = 'n';
    let returnTypeJava = 'int';
    let returnTypeCpp = 'int';
    let javaDefaultReturn = '0';
    let cppDefaultReturn = '0';
    let pyDefaultReturn = 'pass';
    let jsDefaultReturn = '0';
    let explanation = '';

    // 1. Even/Odd
    if (desc.includes('even') && (desc.includes('odd') || desc.includes('check') || desc.includes('number'))) {
      pyParams = 'n';
      javaParams = 'int n';
      cppParams = 'int n';
      jsParams = 'n';
      returnTypeJava = 'boolean';
      returnTypeCpp = 'bool';
      javaDefaultReturn = 'false';
      cppDefaultReturn = 'false';
      pyDefaultReturn = 'pass';
      jsDefaultReturn = 'return false;';
      explanation = "Example 1:\nInput: n = 4\nOutput: true\n\nExample 2:\nInput: n = 7\nOutput: false";
    }
    // 2. Prime Number
    else if (desc.includes('prime')) {
      pyParams = 'n';
      javaParams = 'int n';
      cppParams = 'int n';
      jsParams = 'n';
      returnTypeJava = 'boolean';
      returnTypeCpp = 'bool';
      javaDefaultReturn = 'false';
      cppDefaultReturn = 'false';
      pyDefaultReturn = 'pass';
      jsDefaultReturn = 'return false;';
      explanation = "Example 1:\nInput: n = 7\nOutput: true\n\nExample 2:\nInput: n = 4\nOutput: false";
    }
    // 3. Add / Sum of Two Numbers
    else if (desc.includes('add') || desc.includes('sum') || desc.includes('plus')) {
      pyParams = 'a, b';
      javaParams = 'int a, int b';
      cppParams = 'int a, int b';
      jsParams = 'a, b';
      returnTypeJava = 'int';
      returnTypeCpp = 'int';
      javaDefaultReturn = '0';
      cppDefaultReturn = '0';
      pyDefaultReturn = 'pass';
      jsDefaultReturn = 'return 0;';
      explanation = "Example 1:\nInput: a = 5, b = 7\nOutput: 12\n\nExample 2:\nInput: a = 12, b = 15\nOutput: 27";
    }
    // 4. Reverse String
    else if (desc.includes('reverse') && desc.includes('string')) {
      pyParams = 's';
      javaParams = 'String s';
      cppParams = 'string s';
      jsParams = 's';
      returnTypeJava = 'String';
      returnTypeCpp = 'string';
      javaDefaultReturn = '""';
      cppDefaultReturn = '""';
      pyDefaultReturn = 'pass';
      jsDefaultReturn = "return '';";
      explanation = "Example 1:\nInput: s = \"hello\"\nOutput: \"olleh\"";
    }
    // 5. Palindrome
    else if (desc.includes('palindrome')) {
      pyParams = 's';
      javaParams = 'String s';
      cppParams = 'string s';
      jsParams = 's';
      returnTypeJava = 'boolean';
      returnTypeCpp = 'bool';
      javaDefaultReturn = 'false';
      cppDefaultReturn = 'false';
      pyDefaultReturn = 'pass';
      jsDefaultReturn = 'return false;';
      explanation = "Example 1:\nInput: s = \"radar\"\nOutput: true\n\nExample 2:\nInput: s = \"sarvo\"\nOutput: false";
    }
    // 6. Factorial
    else if (desc.includes('factorial')) {
      pyParams = 'n';
      javaParams = 'int n';
      cppParams = 'int n';
      jsParams = 'n';
      returnTypeJava = 'int';
      returnTypeCpp = 'int';
      javaDefaultReturn = '1';
      cppDefaultReturn = '1';
      pyDefaultReturn = 'pass';
      jsDefaultReturn = 'return 1;';
      explanation = "Example 1:\nInput: n = 5\nOutput: 120";
    }
    // Generic guesser
    else {
      if (desc.includes('two') || desc.includes('a, b') || desc.includes('a and b')) {
        pyParams = 'a, b';
        jsParams = 'a, b';
        javaParams = 'int a, int b';
        cppParams = 'int a, int b';
      }
    }

    const pyTemplate = `def ${funcName}(${pyParams}):\n    # Write your Python code here\n    ${pyDefaultReturn}`;
    const javaTemplate = `public class Solution {\n    public ${returnTypeJava} ${funcName}(${javaParams}) {\n        // Write your Java code here\n        return ${javaDefaultReturn};\n    }\n}`;
    const cppTemplate = `class Solution {\npublic:\n    ${returnTypeCpp} ${funcName}(${cppParams}) {\n        // Write your C++ code here\n        return ${cppDefaultReturn};\n    }\n};`;
    const jsTemplate = `function ${funcName}(${jsParams}) {\n    // Write your JavaScript code here\n    ${jsDefaultReturn}\n}`;

    setFormOptA(pyTemplate);
    setFormOptB(javaTemplate);
    setFormOptC(cppTemplate);
    setFormOptD(jsTemplate);
    if (explanation) {
      setFormExplanation(explanation);
    }
  };

  // Save (Create or Update) Question
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!formText || !formOptA || !formOptB || !formOptC || !formOptD) {
      setErrorMsg('Please fill in the question text and all four options.');
      return;
    }

    const apiTestId = activeContext === 'competition'
      ? (activeTestFilter === 'apti_test' ? `competition_${selectedCompetitionId}_apti_test` : `competition_${selectedCompetitionId}_tech_test`)
      : activeTestFilter;

    const payload = {
      testId: apiTestId,
      questionText: formText,
      options: [formOptA, formOptB, formOptC, formOptD],
      correctOption: Number(formCorrectIdx),
      explanation: formExplanation
    };

    try {
      if (editingQuestion) {
        await lmsApi.updateInterviewQuestion(editingQuestion.id, payload);
        setSuccessMsg('Question updated successfully!');
      } else {
        await lmsApi.createInterviewQuestion(payload);
        setSuccessMsg('Question added successfully!');
      }
      setIsQuestionModalOpen(false);
      loadQuestions();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to save question:', err);
      setErrorMsg(err.message || 'Error saving question details.');
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  // Copy questions from Competition to Training
  const handleCopyFromCompetition = () => {
    if (competitions.length === 0) {
      alert("No active competitions found to copy questions from.");
      return;
    }
    setIsCopyModalOpen(true);
  };

  const handleExecuteCopy = async () => {
    if (!copySourceCompId) {
      setErrorMsg("Please select a source competition first.");
      return;
    }

    const fromTestId = activeTestFilter === 'apti_test' ? `competition_${copySourceCompId}_apti_test` : `competition_${copySourceCompId}_tech_test`;
    const toTestId = activeTestFilter;
    
    const categoryName = activeTestFilter === 'apti_test' ? 'Aptitude' : 'Technical';
    const compTitle = competitions.find(c => c.id === copySourceCompId)?.title || 'Selected Competition';
    
    if (!window.confirm(`Are you sure you want to replace all Training ${categoryName} questions with the questions from "${compTitle}"?`)) {
      return;
    }
    
    setLoading(true);
    setIsCopyModalOpen(false);
    try {
      const res = await lmsApi.copyQuestions(fromTestId, toTestId);
      setSuccessMsg(`Successfully copied ${res.copiedCount || 0} questions from "${compTitle}" to Training.`);
      loadQuestions();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to copy questions:', err);
      setErrorMsg('Failed to copy questions from the selected competition.');
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await lmsApi.deleteInterviewQuestion(id);
      setSuccessMsg('Question deleted successfully.');
      loadQuestions();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to delete question:', err);
      setErrorMsg('Failed to delete question.');
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  // Unique values for dropdown filters
  const uniqueCompetitions = Array.from(new Set(students.map(s => s.competition_title).filter(Boolean)));
  const uniqueColleges = Array.from(new Set(students.map(s => s.college_name).filter(Boolean)));

  // Filter students based on search query and dropdown filters
  const filteredStudents = students.filter(s => {
    // Search query filter
    const studentName = s.student_name || `${s.first_name || ''} ${s.last_name || ''}`;
    const fullName = studentName.toLowerCase();
    const email = (s.email || '').toLowerCase();
    const college = (s.college_name || '').toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    
    const matchesSearch = fullName.includes(query) || 
      email.includes(query) || 
      college.includes(query) || 
      (s.cohort_name || '').toLowerCase().includes(query);

    // Competition filter
    const matchesComp = selectedCompFilter === 'all' || s.competition_title === selectedCompFilter;

    // Payment status filter
    const matchesPayment = selectedPaymentFilter === 'all' || 
      (selectedPaymentFilter === 'paid' && s.payment_status?.toLowerCase() === 'paid') ||
      (selectedPaymentFilter === 'free' && s.payment_status?.toLowerCase() === 'free') ||
      (selectedPaymentFilter === 'pending' && (!s.payment_status || s.payment_status?.toLowerCase() === 'pending'));

    // College filter
    const matchesCollege = selectedCollegeFilter === 'all' || s.college_name === selectedCollegeFilter;

    // Score/status filter
    let matchesScore = true;
    if (selectedScoreFilter === 'apti_cleared') {
      matchesScore = s.apti_details?.includes('Cleared') || false;
    } else if (selectedScoreFilter === 'apti_pending') {
      matchesScore = !s.apti_details || s.apti_details === 'Pending';
    } else if (selectedScoreFilter === 'tech_cleared') {
      matchesScore = s.round_details?.includes('Cleared') || false;
    } else if (selectedScoreFilter === 'tech_pending') {
      matchesScore = !s.round_details || s.round_details === 'Pending' || s.round_details?.includes('Pending');
    }

    return matchesSearch && matchesComp && matchesPayment && matchesCollege && matchesScore;
  });

  return (
    <div style={{ padding: '24px', textAlign: 'left' }}>
      
      {/* Alert Notices */}
      {successMsg && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(16,185,129,0.1)',
          color: '#10b981',
          borderRadius: '8px',
          border: '1px solid rgba(16,185,129,0.2)',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={16} />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(239,68,68,0.1)',
          color: '#ef4444',
          borderRadius: '8px',
          border: '1px solid rgba(239,68,68,0.2)',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      {/* ────────────────── CONFIGURE QUESTIONS VIEW ────────────────── */}
      {subNavItem === 'Configure Questions' && (
        <div>
          {/* Section Cards Panel */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {/* Training Card */}
            <div 
              onClick={() => setActiveContext('training')}
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: activeContext === 'training' ? '2px solid var(--active-blue)' : '1px solid var(--border-color)',
                background: 'var(--card-bg)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeContext === 'training' ? '0 8px 24px rgba(0, 123, 245, 0.08)' : 'none',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '140px'
              }}
            >
              {activeContext === 'training' && (
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0, 123, 245, 0.1)',
                  color: 'var(--active-blue)',
                  fontSize: '9.5px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '100px',
                  textTransform: 'uppercase'
                }}>
                  Selected
                </span>
              )}
              <div>
                <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                  Training Mock Exams
                </h3>
                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                  Configure logic reasoning and coding practice tests used by students for workspace placement training.
                </p>
              </div>
              
              {/* Internal Sub-toggles */}
              <div 
                onClick={(e) => e.stopPropagation()} 
                style={{ display: 'flex', gap: '8px' }}
              >
                <button
                  onClick={() => {
                    setActiveContext('training');
                    setActiveTestFilter('apti_test');
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: (activeContext === 'training' && activeTestFilter === 'apti_test') ? 'var(--active-blue)' : 'var(--primary-bg)',
                    color: (activeContext === 'training' && activeTestFilter === 'apti_test') ? 'white' : 'var(--text-main)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Aptitude Test
                </button>
                <button
                  onClick={() => {
                    setActiveContext('training');
                    setActiveTestFilter('tech_test');
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: (activeContext === 'training' && activeTestFilter === 'tech_test') ? 'var(--active-blue)' : 'var(--primary-bg)',
                    color: (activeContext === 'training' && activeTestFilter === 'tech_test') ? 'white' : 'var(--text-main)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Technical Assessment
                </button>
              </div>
            </div>

            {/* Competition Card */}
            <div 
              onClick={() => setActiveContext('competition')}
              style={{
                padding: '20px',
                borderRadius: '12px',
                border: activeContext === 'competition' ? '2px solid var(--active-blue)' : '1px solid var(--border-color)',
                background: 'var(--card-bg)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeContext === 'competition' ? '0 8px 24px rgba(0, 123, 245, 0.08)' : 'none',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '140px'
              }}
            >
              {activeContext === 'competition' && (
                <span style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0, 123, 245, 0.1)',
                  color: 'var(--active-blue)',
                  fontSize: '9.5px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '100px',
                  textTransform: 'uppercase'
                }}>
                  Selected
                </span>
              )}
              <div>
                <h3 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                  Competition Challenges
                </h3>
                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                  Configure live placement hackathons and active assessments synced with official portal events.
                </p>
              </div>
              
              {/* Internal Sub-toggles */}
              <div 
                onClick={(e) => e.stopPropagation()} 
                style={{ display: 'flex', gap: '8px' }}
              >
                <button
                  onClick={() => {
                    setActiveContext('competition');
                    setActiveTestFilter('apti_test');
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: (activeContext === 'competition' && activeTestFilter === 'apti_test') ? 'var(--active-blue)' : 'var(--primary-bg)',
                    color: (activeContext === 'competition' && activeTestFilter === 'apti_test') ? 'white' : 'var(--text-main)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Aptitude Test
                </button>
                <button
                  onClick={() => {
                    setActiveContext('competition');
                    setActiveTestFilter('tech_test');
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: (activeContext === 'competition' && activeTestFilter === 'tech_test') ? 'var(--active-blue)' : 'var(--primary-bg)',
                    color: (activeContext === 'competition' && activeTestFilter === 'tech_test') ? 'white' : 'var(--text-main)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Technical Assessment
                </button>
              </div>
            </div>
          </div>

          {activeContext === 'competition' && (
            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              boxShadow: 'var(--card-shadow)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <Trophy size={18} style={{ color: '#f59e0b' }} />
                <h5 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-main)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Select Target Active Competition
                </h5>
              </div>
              
              {loadingCompetitions ? (
                <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                  Loading active competitions...
                </div>
              ) : competitions.length === 0 ? (
                <div style={{
                  padding: '16px',
                  background: 'rgba(239, 68, 68, 0.05)',
                  color: '#ef4444',
                  borderRadius: '10px',
                  border: '1px solid rgba(239, 68, 68, 0.1)',
                  fontSize: '12.5px',
                  textAlign: 'center'
                }}>
                  <AlertCircle size={20} style={{ margin: '0 auto 8px', display: 'block' }} />
                  <strong>No Active Competitions Found</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                    Please create and activate a competition in the Competitions panel before configuring questions.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {competitions.map((comp) => {
                    const isSelected = selectedCompetitionId === comp.id;
                    const dateStr = comp.exam_start_time 
                      ? new Date(comp.exam_start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : 'Not Scheduled';
                    return (
                      <div
                        key={comp.id}
                        onClick={() => setSelectedCompetitionId(comp.id)}
                        style={{
                          padding: '14px 18px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid var(--active-blue)' : '1px solid var(--border-color)',
                          background: isSelected ? 'rgba(0, 123, 245, 0.04)' : 'var(--primary-bg)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          minWidth: '220px',
                          flexShrink: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          boxShadow: isSelected ? '0 4px 12px rgba(0, 123, 245, 0.08)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: isSelected ? 'var(--active-blue)' : 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                            {comp.title}
                          </span>
                          {isSelected && <Check size={14} style={{ color: 'var(--active-blue)' }} />}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                          <span>Start: {dateStr}</span>
                          <span style={{ fontWeight: 700, color: comp.registration_fee > 0 ? '#10b981' : 'var(--text-muted)' }}>
                            {comp.registration_fee > 0 ? `₹${comp.registration_fee / 100}` : 'Free'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeContext === 'competition' && !selectedCompetitionId ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Please select an active competition from the list above to view or configure its questions.
            </div>
          ) : (
            <>
              {/* Section Action Bar & Title */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                flexWrap: 'wrap',
                gap: '16px',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '20px'
              }}>
                <div>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: 'var(--text-main)', textTransform: 'capitalize' }}>
                    {activeContext === 'training' ? 'Training Mode' : 'Competition Mode'} / {activeTestFilter === 'apti_test' ? 'Aptitude Questions' : 'Technical Questions'}
                  </h4>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Currently showing configured question bank lists.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {activeContext === 'training' && (
                    <button
                      onClick={handleCopyFromCompetition}
                      style={{
                        padding: '8px 16px',
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--active-blue)'}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                      Copy from Competition
                    </button>
                  )}

                  <button
                    onClick={handleOpenAddModal}
                    style={{
                      padding: '8px 16px',
                      background: 'var(--active-blue)',
                      border: 'none',
                      color: 'white',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(0, 123, 245, 0.15)'
                    }}
                  >
                    <Plus size={15} /> Add Question
                  </button>
                </div>
              </div>

              {/* List of Questions */}
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Loading test questions...
                </div>
              ) : questions.length === 0 ? (
                <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No questions configured for this test yet. Click "Add Question" to set them manually.
                </div>
              ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {questions.map((q, idx) => (
                <div key={q.id} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        QUESTION {idx + 1}
                      </span>
                      <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-main)', marginTop: '6px', marginBottom: '16px', lineHeight: '1.5' }}>
                        {q.question_text}
                      </h4>

                      {/* Options or Code Templates Grid */}
                      {activeTestFilter === 'tech_test' ? (
                        <div style={{ marginBottom: '16px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                            Starter Code Templates:
                          </span>
                          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                            {['Python', 'Java', 'C++', 'JavaScript'].map((lang, lIdx) => {
                              const activeTab = (activeLangTab[q.id] ?? 0) === lIdx;
                              return (
                                <button
                                  key={lang}
                                  type="button"
                                  onClick={() => setActiveLangTab(prev => ({ ...prev, [q.id]: lIdx }))}
                                  style={{
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '11.5px',
                                    fontWeight: 700,
                                    border: activeTab ? '1px solid var(--active-blue)' : '1px solid var(--border-color)',
                                    background: activeTab ? 'rgba(0, 123, 245, 0.08)' : 'var(--card-bg)',
                                    color: activeTab ? 'var(--active-blue)' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  {lang}
                                </button>
                              );
                            })}
                          </div>
                          <pre style={{
                            padding: '12px 14px',
                            background: 'var(--primary-bg)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            fontSize: '12px',
                            color: 'var(--text-main)',
                            fontFamily: 'Consolas, Monaco, monospace',
                            overflowX: 'auto',
                            maxHeight: '160px',
                            textAlign: 'left',
                            whiteSpace: 'pre',
                            margin: 0,
                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
                          }}>
                            {q.options?.[activeLangTab[q.id] ?? 0] || '// No template set'}
                          </pre>
                        </div>
                      ) : (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                          gap: '10px',
                          marginBottom: '16px'
                        }}>
                          {q.options?.map((opt, oIdx) => {
                            const isCorrect = q.correct_option === oIdx;
                            return (
                              <div
                                key={oIdx}
                                style={{
                                  padding: '10px 12px',
                                  borderRadius: '6px',
                                  border: isCorrect ? '1px solid #10b981' : '1px solid var(--border-color)',
                                  background: isCorrect ? 'rgba(16,185,129,0.05)' : 'var(--primary-bg)',
                                  color: 'var(--text-main)',
                                  fontSize: '12.5px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}
                              >
                                <span style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: isCorrect ? '#10b981' : 'var(--border-color)',
                                  color: isCorrect ? 'white' : 'var(--text-muted)',
                                  fontSize: '10px',
                                  fontWeight: 800
                                }}>
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span style={{ flex: 1 }}>{opt}</span>
                                {isCorrect && <Check size={14} style={{ color: '#10b981' }} />}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Explanation */}
                      {q.explanation && (
                        <div style={{
                          padding: '10px 12px',
                          background: 'var(--primary-bg)',
                          borderRadius: '6px',
                          borderLeft: '3px solid var(--active-blue)',
                          fontSize: '12px',
                          color: 'var(--text-muted)'
                        }}>
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenEditModal(q)}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--card-bg)',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Edit Question"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          border: '1px solid rgba(239,68,68,0.2)',
                          background: 'var(--card-bg)',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Delete Question"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </>
          )}
        </div>
      )}

      {/* ────────────────── STUDENT SCORES VIEW ────────────────── */}
      {subNavItem === 'Student Scores' && (
        <div>
          {/* Action/Search/Filter Bar */}
          <div className="card" style={{
            padding: '20px',
            marginBottom: '20px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>Student Placements & Assessments</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Track live test responses, completed rounds, and qualification grades for competition participants.
                </p>
              </div>

              {/* Search */}
              <div style={{ position: 'relative', width: '280px' }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  type="text"
                  placeholder="Search student or college..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    fontSize: '12.5px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--primary-bg)',
                    color: 'var(--text-main)',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Filter Dropdowns Row */}
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '16px'
            }}>
              {/* Competition Filter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '165px' }}>
                <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Competition</label>
                <select
                  value={selectedCompFilter}
                  onChange={(e) => setSelectedCompFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--primary-bg)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontWeight: 600
                  }}
                >
                  <option value="all">All Competitions</option>
                  {uniqueCompetitions.map(comp => (
                    <option key={comp} value={comp}>{comp}</option>
                  ))}
                </select>
              </div>

              {/* College Filter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '165px' }}>
                <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>College</label>
                <select
                  value={selectedCollegeFilter}
                  onChange={(e) => setSelectedCollegeFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--primary-bg)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontWeight: 600
                  }}
                >
                  <option value="all">All Colleges</option>
                  {uniqueColleges.map(coll => (
                    <option key={coll} value={coll}>{coll}</option>
                  ))}
                </select>
              </div>

              {/* Payment Filter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '135px' }}>
                <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Type</label>
                <select
                  value={selectedPaymentFilter}
                  onChange={(e) => setSelectedPaymentFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--primary-bg)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontWeight: 600
                  }}
                >
                  <option value="all">All Payments</option>
                  <option value="paid">Paid</option>
                  <option value="free">Free</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {/* Score Filter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '165px' }}>
                <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assessment Status</label>
                <select
                  value={selectedScoreFilter}
                  onChange={(e) => setSelectedScoreFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--primary-bg)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontWeight: 600
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="apti_cleared">Aptitude Cleared</option>
                  <option value="apti_pending">Aptitude Pending</option>
                  <option value="tech_cleared">Technical Cleared</option>
                  <option value="tech_pending">Technical Pending</option>
                </select>
              </div>

              {/* Reset Filters button */}
              {(searchQuery || selectedCompFilter !== 'all' || selectedCollegeFilter !== 'all' || selectedPaymentFilter !== 'all' || selectedScoreFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCompFilter('all');
                    setSelectedCollegeFilter('all');
                    setSelectedPaymentFilter('all');
                    setSelectedScoreFilter('all');
                  }}
                  style={{
                    alignSelf: 'flex-end',
                    padding: '8px 14px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    background: 'rgba(239, 68, 68, 0.05)',
                    color: '#ef4444',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    height: '35px'
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Roster Scores Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading scores records...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No matching competition student assessment logs found.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--primary-bg)' }}>
                      <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student</th>
                      <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Competition & College</th>
                      <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Aptitude Test Round</th>
                      <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Technical Test Round</th>
                      <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(student => {
                      const studentName = student.student_name || `${student.first_name || ''} ${student.last_name || ''}`;
                      return (
                        <tr
                          key={student.id}
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            transition: 'background 0.2s'
                          }}
                          className="table-row-hover"
                        >
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: 'rgba(0, 123, 245, 0.08)',
                                color: 'var(--active-blue)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                textTransform: 'uppercase'
                              }}>
                                {studentName ? studentName.charAt(0) : 'S'}
                              </div>
                              <div>
                                <strong style={{ fontSize: '13px', color: 'var(--text-main)', display: 'block' }}>
                                  {studentName}
                                </strong>
                                <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block' }}>{student.email}</span>
                                {student.phone && <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '1px' }}>{student.phone}</span>}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '12.5px', color: 'var(--text-main)' }}>
                            <strong style={{ fontSize: '12.5px', color: 'var(--text-main)', display: 'block' }}>
                              {student.competition_title || 'Unassigned'}
                            </strong>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                              {student.college_name || 'N/A'}
                            </span>
                            {(student.course || student.branch) && (
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>
                                {student.course} {student.branch ? `(${student.branch})` : ''} {student.graduation_year ? `'${student.graduation_year}` : ''}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{
                              fontSize: '11.5px',
                              fontWeight: 700,
                              color: student.apti_details?.includes('Cleared') ? '#10b981' : 'var(--text-muted)',
                              display: 'block'
                            }}>
                              {student.apti_details || 'Pending'}
                            </span>
                            {student.apti_date && (
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                                Completed: {new Date(student.apti_date).toLocaleDateString('en-GB')}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{
                              fontSize: '11.5px',
                              fontWeight: 700,
                              color: student.round_details?.includes('Cleared') ? '#10b981' : 'var(--text-muted)',
                              display: 'block'
                            }}>
                              {student.round_details || 'Pending'}
                            </span>
                            {student.round_date && (
                              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                                Completed: {new Date(student.round_date).toLocaleDateString('en-GB')}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: student.payment_status?.toLowerCase() === 'paid' ? '#10b981' : student.payment_status?.toLowerCase() === 'free' ? 'var(--active-blue)' : '#f59e0b',
                              background: student.payment_status?.toLowerCase() === 'paid' ? 'rgba(16, 185, 129, 0.08)' : student.payment_status?.toLowerCase() === 'free' ? 'rgba(0, 123, 245, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                              padding: '3px 8px',
                              borderRadius: '10px',
                              textTransform: 'uppercase',
                              display: 'inline-block'
                            }}>
                              {student.payment_status || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────── QUESTION EDIT / ADD DRAWER MODAL ────────────────── */}
      {isQuestionModalOpen && (
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
            maxWidth: '520px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--primary-bg)'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>
                {editingQuestion ? 'Edit Question Details' : 'Add New Question'}
              </span>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveQuestion} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Question Text */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                    Question Description *
                  </label>
                  {activeTestFilter === 'tech_test' && (
                    <button
                      type="button"
                      onClick={handleAutoGenerateTemplates}
                      style={{
                        background: 'rgba(59, 130, 246, 0.08)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        color: 'var(--active-blue)',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      ✨ Auto-generate Code & Tests
                    </button>
                  )}
                </div>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter the logical reasoning or coding problem..."
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  style={{
                    padding: '10px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--primary-bg)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              {/* Options */}
              {activeTestFilter === 'tech_test' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                    Language Starter Code Templates *
                  </label>
                  {[
                    ['Python Starter Code', formOptA, setFormOptA],
                    ['Java Starter Code', formOptB, setFormOptB],
                    ['C++ Starter Code', formOptC, setFormOptC],
                    ['JavaScript Starter Code', formOptD, setFormOptD]
                  ].map(([label, value, setter]) => (
                    <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>{label}</span>
                      <textarea
                        required
                        rows={4}
                        placeholder={`Enter default starter code for ${label.split(' ')[0]}...`}
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        style={{
                          padding: '8px 10px',
                          fontSize: '12px',
                          fontFamily: 'Consolas, Monaco, monospace',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--primary-bg)',
                          color: 'var(--text-main)',
                          outline: 'none',
                          resize: 'vertical',
                          whiteSpace: 'pre'
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                      Multiple Choice Options *
                    </label>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[['A', formOptA, setFormOptA], ['B', formOptB, setFormOptB], ['C', formOptC, setFormOptC], ['D', formOptD, setFormOptD]].map(([lbl, val, setter], idx) => (
                        <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', width: '12px' }}>{lbl}</span>
                          <input
                            type="text"
                            required
                            placeholder={`Option ${lbl} text`}
                            value={val}
                            onChange={(e) => setter(e.target.value)}
                            style={{
                              flex: 1,
                              padding: '8px 10px',
                              fontSize: '12.5px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color)',
                              background: 'var(--primary-bg)',
                              color: 'var(--text-main)',
                              outline: 'none'
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Correct Option Selector */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                      Select Correct Answer Option *
                    </label>
                    <select
                      value={formCorrectIdx}
                      onChange={(e) => setFormCorrectIdx(Number(e.target.value))}
                      style={{
                        padding: '8px 10px',
                        fontSize: '12.5px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--primary-bg)',
                        color: 'var(--text-main)',
                        outline: 'none'
                      }}
                    >
                      <option value={0}>Option A</option>
                      <option value={1}>Option B</option>
                      <option value={2}>Option C</option>
                      <option value={3}>Option D</option>
                    </select>
                  </div>
                </>
              )}

              {/* Explanation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                  Answer Explanation
                </label>
                <input
                  type="text"
                  placeholder="Provide correct steps or logic code explanation..."
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    fontSize: '12.5px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--primary-bg)',
                    color: 'var(--text-main)',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid var(--border-color)',
                    background: 'none',
                    color: 'var(--text-main)',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    background: 'var(--active-blue)',
                    border: 'none',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Save Question
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ────────────────── COPY QUESTIONS SELECTOR MODAL ────────────────── */}
      {isCopyModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '440px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trophy size={18} style={{ color: '#f59e0b' }} />
                Copy Questions from Competition
              </h4>
              <button 
                onClick={() => setIsCopyModalOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>
            
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
              Select the source active competition to copy the <strong>{activeTestFilter === 'apti_test' ? 'Aptitude' : 'Technical'}</strong> questions to the general <strong>Training</strong> question bank.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                Source Competition
              </label>
              <select
                value={copySourceCompId}
                onChange={(e) => setCopySourceCompId(e.target.value)}
                style={{
                  padding: '10px',
                  fontSize: '13px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--primary-bg)',
                  color: 'var(--text-main)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {competitions.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.title} ({comp.registration_fee > 0 ? `₹${comp.registration_fee / 100}` : 'Free'})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setIsCopyModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid var(--border-color)',
                  background: 'none',
                  color: 'var(--text-main)',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteCopy}
                style={{
                  padding: '8px 20px',
                  background: 'var(--active-blue)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Copy Questions
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
