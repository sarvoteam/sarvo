import React, { useState } from 'react';
import { Calendar, ArrowRight, Award, Compass, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const CompetitionCard = ({ competition, onView, onRegister }) => {
  const { title, description, start_date, end_date, status, eligibility, prize_pool } = competition;
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Extract all ranks
  const getAllRanks = () => {
    if (!prize_pool) return [];
    try {
      const parsed = JSON.parse(prize_pool);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {}
    return [{ rank: "Prize", reward: prize_pool }];
  };

  // Extract eligibility preview
  const getEligibilityPreview = () => {
    if (!eligibility) return null;
    const items = eligibility.split('\n').map(i => i.trim()).filter(i => i.length > 0);
    return items.length > 0 ? items[0] : null;
  };

  const ranks = getAllRanks();
  const eligibilityPreview = getEligibilityPreview();

  return (
    <motion.div 
      className="comp-card"
      onClick={onView}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        cursor: 'pointer',
        background: 'var(--card-bg-grad)',
        backdropFilter: 'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        border: isHovered ? '1px solid var(--card-border-hover)' : '1px solid var(--card-border-glow)',
        borderRadius: '24px',
        padding: '28px',
        boxShadow: isHovered ? 'var(--card-shadow-hover)' : 'var(--card-shadow-luxury)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        minHeight: '320px'
      }}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -6 }}
    >

      {/* Header Row: Title & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', zIndex: 2 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h3 style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color: 'var(--text-primary-luxury)',
            margin: 0,
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
            fontFamily: "'Outfit', sans-serif"
          }}>
            {title}
          </h3>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            fontSize: '0.82rem',
            color: 'var(--text-mute)',
            fontWeight: 600
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} style={{ color: '#a855f7' }} />
              <span>
                {formatDate(start_date)} - {formatDate(end_date)}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={13} style={{ color: '#38bdf8' }} />
              <span>
                {competition.registration_count || 0} Registered
              </span>
            </div>
          </div>
        </div>

        <span style={{
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          background: status === 'active' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
          border: status === 'active' ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(244, 63, 94, 0.25)',
          color: status === 'active' ? '#34d399' : '#fb7185',
          fontSize: '10px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          padding: '4px 10px',
          borderRadius: '100px'
        }}>
          {status === 'active' && (
            <span style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: '#34d399',
              display: 'inline-block',
              animation: 'pulse 1.5s infinite'
            }} />
          )}
          {status === 'active' ? 'Active' : 'Completed'}
        </span>
      </div>

      {/* Thin elegant separator */}
      <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.05)', zIndex: 2 }} />

      {/* Description */}
      <p style={{
        fontSize: '0.9rem',
        color: 'var(--text-secondary-luxury)',
        lineHeight: 1.6,
        zIndex: 2,
        margin: 0,
        flex: 1,
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {description}
      </p>

      {/* Eligibility Tag & Ranks List */}
      {(eligibilityPreview || ranks.length > 0) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 2 }}>
          {/* Eligibility Tag */}
          {eligibilityPreview && (
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#38bdf8',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              padding: '6px 12px',
              borderRadius: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              alignSelf: 'flex-start'
            }}>
              <Compass size={13} />
              <span>Open to: {eligibilityPreview}</span>
            </span>
          )}

          {/* Ranks list block */}
          {ranks.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '12px 16px',
              background: 'var(--card-inner-bg)',
              borderRadius: '16px',
              border: '1px solid var(--glass-border-luxury)'
            }}>
              <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--comps-accent)', marginBottom: '2px' }}>Prizes & Ranks</span>
              {ranks.map((r, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', gap: '12px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--comps-accent)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    🏆 {r.rank}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary-luxury)', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                    {r.reward}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Interactive Bottom Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        zIndex: 2,
        gap: '12px'
      }}>
        {/* Left: View Details */}
        <div 
          onClick={onView}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            fontWeight: 800,
            color: isHovered ? 'var(--text-primary-luxury)' : 'var(--comps-accent)',
            letterSpacing: '0.05em',
            transition: 'color 0.3s ease',
            cursor: 'pointer'
          }}
        >
          <span>VIEW DETAILS</span>
          <ArrowRight 
            size={14} 
            style={{ 
              transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              color: isHovered ? 'var(--text-primary-luxury)' : 'var(--comps-accent)'
            }} 
          />
        </div>

        {/* Right: Register Now button */}
        {status === 'active' && onRegister && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRegister(competition);
            }}
            style={{
              background: 'linear-gradient(135deg, #a855f7, #6d28d9)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '8px 18px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(109, 40, 217, 0.2)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              fontFamily: 'inherit'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(109, 40, 217, 0.35)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(109, 40, 217, 0.2)';
            }}
          >
            Register Now
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default CompetitionCard;
