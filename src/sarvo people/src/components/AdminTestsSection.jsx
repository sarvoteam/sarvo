import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Check, X, AlertCircle, HelpCircle } from 'lucide-react';
import { lmsApi } from '../apis/lmsApi';
import { cohortApi } from '../apis/cohortApi';

export default function AdminTestsSection({ currentUser, subNavItem }) {
  // Common State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Configure Questions State
  const [activeTestFilter, setActiveTestFilter] = useState('apti_test'); // apti_test or tech_test
  const [questions, setQuestions] = useState([]);
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

  // Student Scores State
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load questions based on activeTestFilter
  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await lmsApi.getInterviewQuestions(activeTestFilter);
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

  // Load students for Scores Roster
  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await cohortApi.getAllStudents();
      setStudents(data || []);
    } catch (err) {
      console.error('Failed to load students:', err);
      setErrorMsg('Failed to load student roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subNavItem === 'Configure Questions') {
      loadQuestions();
    } else if (subNavItem === 'Student Scores') {
      loadStudents();
    }
  }, [subNavItem, activeTestFilter]);

  // Open modal for new question
  const handleOpenAddModal = () => {
    setEditingQuestion(null);
    setFormText('');
    setFormOptA('');
    setFormOptB('');
    setFormOptC('');
    setFormOptD('');
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

  // Save (Create or Update) Question
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!formText || !formOptA || !formOptB || !formOptC || !formOptD) {
      setErrorMsg('Please fill in the question text and all four options.');
      return;
    }

    const payload = {
      testId: activeTestFilter,
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

  // Filter students based on search query
  const filteredStudents = students.filter(s => {
    const fullName = `${s.first_name} ${s.last_name}`.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    return fullName.includes(query) || (s.cohort_name || '').toLowerCase().includes(query);
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
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            {/* Filter Buttons */}
            <div style={{
              display: 'flex',
              background: 'var(--primary-bg)',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <button
                onClick={() => setActiveTestFilter('apti_test')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTestFilter === 'apti_test' ? 'var(--card-bg)' : 'transparent',
                  color: 'var(--text-main)',
                  fontWeight: activeTestFilter === 'apti_test' ? 700 : 500,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  boxShadow: activeTestFilter === 'apti_test' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                Aptitude Test Questions
              </button>
              <button
                onClick={() => setActiveTestFilter('tech_test')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeTestFilter === 'tech_test' ? 'var(--card-bg)' : 'transparent',
                  color: 'var(--text-main)',
                  fontWeight: activeTestFilter === 'tech_test' ? 700 : 500,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  boxShadow: activeTestFilter === 'tech_test' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                Technical Assessment Questions
              </button>
            </div>

            {/* Add Button */}
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

                      {/* Options Grid */}
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
                                justifyC: 'center',
                                background: isCorrect ? '#10b981' : 'var(--border-color)',
                                color: isCorrect ? 'white' : 'var(--text-muted)',
                                fontSize: '10px',
                                fontWeight: 800,
                                justifyContent: 'center'
                              }}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span style={{ flex: 1 }}>{opt}</span>
                              {isCorrect && <Check size={14} style={{ color: '#10b981' }} />}
                            </div>
                          );
                        })}
                      </div>

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
        </div>
      )}

      {/* ────────────────── STUDENT SCORES VIEW ────────────────── */}
      {subNavItem === 'Student Scores' && (
        <div>
          {/* Action/Search Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            marginBottom: '20px'
          }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>Student Placements & Assessments</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Track live test responses, completed rounds, and overall qualification grades.
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
                placeholder="Search student or batch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  fontSize: '12.5px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--card-bg)',
                  color: 'var(--text-main)',
                  outline: 'none'
                }}
              />
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
                No student assessment logs found.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--primary-bg)' }}>
                      <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Student</th>
                      <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Batch / Cohort</th>
                      <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Aptitude Test Round</th>
                      <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Technical Test Round</th>
                      <th style={{ padding: '14px 18px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Roster Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(student => (
                      <tr
                        key={student.id}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          transition: 'background 0.2s'
                        }}
                        className="table-row-hover"
                      >
                        <td style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                            {student.first_name ? student.first_name.charAt(0) : 'S'}
                          </div>
                          <div>
                            <strong style={{ fontSize: '13px', color: 'var(--text-main)', display: 'block' }}>
                              {student.first_name} {student.last_name}
                            </strong>
                            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{student.email}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px', fontSize: '12.5px', color: 'var(--text-main)' }}>
                          {student.cohort_name || 'Unassigned'}
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
                            color: student.placement_status === 'Placed' ? '#10b981' : student.placement_status === 'In Process' ? '#f59e0b' : 'var(--text-muted)',
                            background: student.placement_status === 'Placed' ? 'rgba(16, 185, 129, 0.08)' : student.placement_status === 'In Process' ? 'rgba(245, 158, 11, 0.08)' : 'var(--primary-bg)',
                            padding: '3px 8px',
                            borderRadius: '10px',
                            textTransform: 'uppercase',
                            display: 'inline-block'
                          }}>
                            {student.placement_status || 'Unplaced'}
                          </span>
                        </td>
                      </tr>
                    ))}
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
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                  Question Description *
                </label>
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

    </div>
  );
}
