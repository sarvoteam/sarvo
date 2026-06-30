import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const formatDateTimeLocal = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (num) => String(num).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const CompetitionDrawer = ({ isOpen, onClose, competition, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    detailedDescription: '',
    startDate: '',
    endDate: '',
    status: 'active',
    rules: '',
    eligibility: '',
    registrationFee: 0,
    examStartTime: ''
  });

  const [prizes, setPrizes] = useState([{ rank: '1st Rank', reward: '' }]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (competition) {
      setFormData({
        title: competition.title || '',
        description: competition.description || '',
        detailedDescription: competition.detailed_description || '',
        startDate: competition.start_date ? competition.start_date.split('T')[0] : '',
        endDate: competition.end_date ? competition.end_date.split('T')[0] : '',
        status: competition.status || 'active',
        rules: competition.rules || '',
        eligibility: competition.eligibility || '',
        registrationFee: competition.registration_fee
          ? Math.round(competition.registration_fee / 100)
          : 0,
        examStartTime: competition.exam_start_time ? formatDateTimeLocal(competition.exam_start_time) : ''
      });

      // Parse prizes list
      let parsedPrizes = [{ rank: '1st Rank', reward: '' }];
      if (competition.prize_pool) {
        try {
          const parsed = JSON.parse(competition.prize_pool);
          if (Array.isArray(parsed)) {
            parsedPrizes = parsed;
          } else {
            parsedPrizes = [{ rank: 'Prize Pool', reward: competition.prize_pool }];
          }
        } catch (e) {
          parsedPrizes = [{ rank: 'Prize Pool', reward: competition.prize_pool }];
        }
      }
      setPrizes(parsedPrizes);
    } else {
      setFormData({
        title: '',
        description: '',
        detailedDescription: '',
        startDate: '',
        endDate: '',
        status: 'active',
        rules: '',
        eligibility: '',
        registrationFee: 0,
        examStartTime: ''
      });
      setPrizes([{ rank: '1st Rank', reward: '' }]);
    }
    setErrors({});
  }, [competition, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = 'End date cannot be before start date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Filter out any completely empty prize rows
    const activePrizes = prizes.filter(p => p.rank.trim() || p.reward.trim());

    // Convert fee from INR (display) → paise (storage)
    const feeInPaise = formData.registrationFee
      ? Math.round(parseFloat(formData.registrationFee) * 100)
      : 0;

    let examStartTimeISO = null;
    if (formData.examStartTime) {
      try {
        examStartTimeISO = new Date(formData.examStartTime).toISOString();
      } catch (err) {
        console.error('Error formatting examStartTime to ISO:', err);
      }
    }

    onSave({
      ...formData,
      examStartTime: examStartTimeISO,
      prizePool: activePrizes.length > 0 ? JSON.stringify(activePrizes) : '',
      registrationFee: feeInPaise
    });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)',
      zIndex: 11000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '650px',
        maxHeight: '90vh',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'modalScale 0.2s ease-out',
        overflow: 'hidden'
      }}>
        <style>{`
          @keyframes modalScale {
            from { transform: scale(0.95); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>

        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
            {competition ? 'Edit Competition' : 'Create New Competition'}
          </h3>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: '50%'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Sarvo Coding Hackathon 2026"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: errors.title ? '1px solid var(--text-red)' : '1px solid var(--border-color)',
                outline: 'none',
                background: 'rgba(0,0,0,0.01)',
                color: 'inherit'
              }}
            />
            {errors.title && <div style={{ fontSize: '11px', color: 'var(--text-red)', marginTop: '4px' }}>{errors.title}</div>}
          </div>

          {/* Short Description */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Short Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief summary showing on competition cards..."
              rows={2}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: errors.description ? '1px solid var(--text-red)' : '1px solid var(--border-color)',
                outline: 'none',
                background: 'rgba(0,0,0,0.01)',
                color: 'inherit',
                resize: 'vertical'
              }}
            />
            {errors.description && <div style={{ fontSize: '11px', color: 'var(--text-red)', marginTop: '4px' }}>{errors.description}</div>}
          </div>

          {/* Detailed Description */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Detailed Description / About
            </label>
            <textarea
              name="detailedDescription"
              value={formData.detailedDescription}
              onChange={handleChange}
              placeholder="Comprehensive details explaining the event purpose, schedule, etc..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                outline: 'none',
                background: 'rgba(0,0,0,0.01)',
                color: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Dates & Status Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: errors.startDate ? '1px solid var(--text-red)' : '1px solid var(--border-color)',
                  outline: 'none',
                  background: 'rgba(0,0,0,0.01)',
                  color: 'inherit'
                }}
              />
              {errors.startDate && <div style={{ fontSize: '11px', color: 'var(--text-red)', marginTop: '4px' }}>{errors.startDate}</div>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: errors.endDate ? '1px solid var(--text-red)' : '1px solid var(--border-color)',
                  outline: 'none',
                  background: 'rgba(0,0,0,0.01)',
                  color: 'inherit'
                }}
              />
              {errors.endDate && <div style={{ fontSize: '11px', color: 'var(--text-red)', marginTop: '4px' }}>{errors.endDate}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  outline: 'none',
                  background: 'rgba(0,0,0,0.01)',
                  color: 'inherit',
                  cursor: 'pointer'
                }}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Registration Fee */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Registration Fee (₹)
              </label>
              <input
                type="number"
                name="registrationFee"
                value={formData.registrationFee}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="0 = Free"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  outline: 'none',
                  background: 'rgba(0,0,0,0.01)',
                  color: 'inherit'
                }}
              />
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Set to 0 for free registration
              </div>
            </div>
          </div>

          {/* Exam Start Time */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Exam Start Time (Scheduled start for student exam portal)
            </label>
            <input
              type="datetime-local"
              name="examStartTime"
              value={formData.examStartTime}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                outline: 'none',
                background: 'rgba(0,0,0,0.01)',
                color: 'inherit'
              }}
            />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              If scheduled, students will not be able to start the quiz inside their portal until this exact date-time is reached.
            </div>
          </div>

          {/* Ranks & Prizes dynamic configuration builder */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', backgroundColor: 'rgba(0,0,0,0.01)' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
              🏆 Competition Prizes & Ranks
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {prizes.map((prize, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="e.g. 1st Rank / Winner"
                    value={prize.rank}
                    onChange={(e) => {
                      const newPrizes = [...prizes];
                      newPrizes[idx].rank = e.target.value;
                      setPrizes(newPrizes);
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      outline: 'none',
                      background: 'var(--card-bg)',
                      color: 'inherit',
                      fontSize: '13px'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Prize amount / reward description"
                    value={prize.reward}
                    onChange={(e) => {
                      const newPrizes = [...prizes];
                      newPrizes[idx].reward = e.target.value;
                      setPrizes(newPrizes);
                    }}
                    style={{
                      flex: 2,
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      outline: 'none',
                      background: 'var(--card-bg)',
                      color: 'inherit',
                      fontSize: '13px'
                    }}
                  />
                  {prizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newPrizes = prizes.filter((_, pIdx) => pIdx !== idx);
                        setPrizes(newPrizes);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-red)',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Remove Rank"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPrizes([...prizes, { rank: `${prizes.length + 1}${prizes.length === 1 ? 'nd' : prizes.length === 2 ? 'rd' : 'th'} Rank`, reward: '' }])}
              style={{
                background: 'none',
                border: '1px dashed var(--active-blue)',
                color: 'var(--active-blue)',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={14} /> Add Prize / Rank
            </button>
          </div>

          {/* Eligibility Criteria */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Eligibility Criteria (one per line)
            </label>
            <textarea
              name="eligibility"
              value={formData.eligibility}
              onChange={handleChange}
              placeholder="e.g. Open to all batch graduates&#10;Must know JavaScript"
              rows={3}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                outline: 'none',
                background: 'rgba(0,0,0,0.01)',
                color: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Rules & Guidelines */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Rules & Guidelines (one per line)
            </label>
            <textarea
              name="rules"
              value={formData.rules}
              onChange={handleChange}
              placeholder="e.g. Max team size is 3&#10;All submissions must be original work"
              rows={3}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                outline: 'none',
                background: 'rgba(0,0,0,0.01)',
                color: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Drawer Actions */}
          <div style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            flexShrink: 0
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'none',
                color: 'inherit',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--active-blue)',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundImage: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
              }}
            >
              Save Competition
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompetitionDrawer;
