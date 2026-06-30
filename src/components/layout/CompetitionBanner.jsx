import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Zap, ChevronRight, Star } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CompetitionBanner = () => {
  const [competitions, setCompetitions] = useState([]);
  const [offset, setOffset] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const trackRef = useRef(null);
  const animRef = useRef(null);

  // Scroll listener for sticky dynamic top
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/competitions/list`, {
      headers: { 'x-company-id': 'default' }
    })
      .then((r) => r.json())
      .then((data) => {
        const active = (Array.isArray(data) ? data : []).filter((c) => c.status === 'active');
        setCompetitions(active);
      })
      .catch(() => {});
  }, []);

  // Update CSS variable --banner-height on root element
  useEffect(() => {
    if (competitions.length > 0) {
      document.documentElement.style.setProperty('--banner-height', '128px');
    } else {
      document.documentElement.style.setProperty('--banner-height', '0px');
    }
    return () => {
      document.documentElement.style.setProperty('--banner-height', '0px');
    };
  }, [competitions]);

  // Auto-scroll ticker
  useEffect(() => {
    if (!trackRef.current || competitions.length === 0) return;
    let pos = 0;
    const speed = 0.5; // px per frame

    const tick = () => {
      pos -= speed;
      const trackW = trackRef.current?.scrollWidth / 2 || 0;
      if (Math.abs(pos) >= trackW) pos = 0;
      setOffset(pos);
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [competitions]);

  if (competitions.length === 0) return null;

  const parsePrize = (raw) => {
    if (!raw) return null;
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length > 0) return arr[0].reward;
    } catch (_) {}
    return typeof raw === 'string' ? raw : null;
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Duplicate items for seamless loop
  const items = [...competitions, ...competitions];

  return (
    <div style={{
      width: '100%',
      background: 'linear-gradient(135deg, #0f0a1e 0%, #1a0b3b 40%, #2d1b69 70%, #1e0a4a 100%)',
      borderBottom: '2px solid rgba(139, 92, 246, 0.4)',
      overflow: 'hidden',
      position: 'fixed',
      top: isScrolled ? '68px' : '88px',
      left: 0,
      right: 0,
      zIndex: 90,
      height: '128px',
      transition: 'top 0.6s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s',
    }}>
      {/* Animated glow orbs */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-40px', left: '15%',
          width: '450px', height: '180px',
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.35) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }} />
        <div style={{
          position: 'absolute', top: '-20px', right: '25%',
          width: '350px', height: '140px',
          background: 'radial-gradient(ellipse, rgba(196,181,253,0.3) 0%, transparent 70%)',
          filter: 'blur(25px)',
        }} />
      </div>

      {/* Label pill */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 2,
        display: 'flex', alignItems: 'center',
        background: 'linear-gradient(90deg, #1a0b3b 0%, #1a0b3b 85%, transparent 100%)',
        paddingRight: '30px',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1.5px solid rgba(16, 185, 129, 0.5)',
          borderRadius: '50px',
          padding: '8px 16px 8px 12px',
          marginLeft: '20px',
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)',
        }}>
          <Zap size={14} fill="#10b981" color="#10b981" />
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '12px', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: '#10b981',
            textShadow: '0 0 10px rgba(16, 185, 129, 0.3)',
            whiteSpace: 'nowrap',
          }}>
            Live Competitions
          </span>
        </div>
      </div>

      {/* Fade edges */}
      <div style={{
        position: 'absolute', left: '220px', top: 0, bottom: 0, width: '80px', zIndex: 1,
        background: 'linear-gradient(90deg, #1a0b3b, transparent)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '100px', zIndex: 1,
        background: 'linear-gradient(270deg, #0f0a1e, transparent)',
        pointerEvents: 'none',
      }} />

      {/* Scrolling Track */}
      <div style={{ overflow: 'hidden', paddingLeft: '270px', paddingRight: '100px', height: '128px', display: 'flex', alignItems: 'center' }}>
        <div
          ref={trackRef}
          style={{
            display: 'flex', alignItems: 'center', gap: '0',
            transform: `translateX(${offset}px)`,
            willChange: 'transform',
            whiteSpace: 'nowrap',
          }}
        >
          {items.map((comp, i) => {
            const prize = parsePrize(comp.prize_pool);
            const regCount = comp.registration_count ?? 0;

            return (
              <Link
                key={`${comp.id}-${i}`}
                to="/sarvo-competitions"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
              >
                {/* Card pill */}
                <div
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '16px',
                    background: 'rgba(139,92,246,0.08)',
                    border: '1.5px solid rgba(139,92,246,0.25)',
                    borderRadius: '100px',
                    padding: '14px 32px 14px 18px',
                    margin: '0 24px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(139,92,246,0.18)';
                    e.currentTarget.style.transform = 'scale(1.03)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(139,92,246,0.08)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
                  }}>
                    <Trophy size={22} color="#fff" />
                  </div>

                  {/* Title */}
                  <span style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '20px', fontWeight: 800,
                    color: '#e9d5ff', maxWidth: '320px',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    textShadow: '0 2px 10px rgba(233, 213, 255, 0.2)'
                  }}>
                    {comp.title}
                  </span>

                  {/* Divider */}
                  <span style={{ color: 'rgba(196,181,253,0.3)', fontSize: '18px', fontFamily: 'var(--font-body)' }}>|</span>

                  {/* Registered students */}
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    fontSize: '16px', color: '#c4b5fd', fontWeight: 600
                  }}>
                    <Users size={18} /> {regCount} registered
                  </span>

                  {/* Divider */}
                  {prize && <span style={{ color: 'rgba(196,181,253,0.3)', fontSize: '18px', fontFamily: 'var(--font-body)' }}>|</span>}

                  {/* Top prize */}
                  {prize && (
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      fontSize: '16px', color: '#fde68a', fontWeight: 700,
                      textShadow: '0 2px 8px rgba(253, 230, 138, 0.3)'
                    }}>
                      <Star size={16} fill="#fde68a" color="#fde68a" /> {prize}
                    </span>
                  )}

                  {/* Date */}
                  {comp.end_date && (
                    <>
                      <span style={{ color: 'rgba(196,181,253,0.3)', fontSize: '18px', fontFamily: 'var(--font-body)' }}>|</span>
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '15px', color: 'rgba(196,181,253,0.6)'
                      }}>
                        Ends {formatDate(comp.end_date)}
                      </span>
                    </>
                  )}

                  <ChevronRight size={18} color="rgba(196,181,253,0.5)" />
                </div>

                {/* Dot separator between cards */}
                <span style={{ color: 'rgba(139,92,246,0.4)', fontSize: '8px', margin: '0 8px' }}>●</span>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
};

export default CompetitionBanner;
