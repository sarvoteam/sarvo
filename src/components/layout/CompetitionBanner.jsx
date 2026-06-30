import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Zap, ChevronRight, Star } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CompetitionBanner = () => {
  const [competitions, setCompetitions] = useState([]);
  const [offset, setOffset] = useState(0);
  const trackRef = useRef(null);
  const animRef = useRef(null);

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

  // Update CSS variable --banner-height on body instead of hardcoded fixed style
  useEffect(() => {
    if (competitions.length > 0) {
      document.body.classList.add('has-competition-banner');
    } else {
      document.body.classList.remove('has-competition-banner');
    }
    return () => {
      document.body.classList.remove('has-competition-banner');
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
    <div className="competition-banner-container">
      {/* Animated glow orbs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
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
      <div className="banner-label-wrapper">
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
      <div className="banner-fade-left" />
      <div className="banner-fade-right" />

      {/* Scrolling Track */}
      <div className="banner-track-container">
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
                <div className="banner-card-pill">
                  {/* Icon */}
                  <div className="banner-card-icon">
                    <Trophy size={22} color="#fff" />
                  </div>

                  {/* Title */}
                  <span className="banner-card-title">
                    {comp.title}
                  </span>

                  {/* Divider */}
                  <span className="banner-card-divider">|</span>

                  {/* Registered students */}
                  <span className="banner-card-meta">
                    <Users size={18} /> {regCount} registered
                  </span>

                  {/* Divider */}
                  {prize && <span className="banner-card-divider">|</span>}

                  {/* Top prize */}
                  {prize && (
                    <span className="banner-card-prize">
                      <Star size={16} fill="#fde68a" color="#fde68a" /> {prize}
                    </span>
                  )}

                  {/* Date */}
                  {comp.end_date && (
                    <>
                      <span className="banner-card-divider">|</span>
                      <span className="banner-card-end-date">
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
        .competition-banner-container {
          position: absolute;
          top: 88px;
          left: 0;
          right: 0;
          z-index: 90;
          height: 110px;
          width: 100%;
          background: linear-gradient(135deg, #0f0a1e 0%, #1a0b3b 40%, #2d1b69 70%, #1e0a4a 100%);
          border-bottom: 2px solid rgba(139, 92, 246, 0.4);
          overflow: hidden;
        }

        .banner-label-wrapper {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          z-index: 2;
          display: flex;
          align-items: center;
          background: linear-gradient(90deg, #1a0b3b 0%, #1a0b3b 85%, transparent 100%);
          padding-right: 30px;
        }

        .banner-fade-left {
          position: absolute;
          left: 220px;
          top: 0;
          bottom: 0;
          width: 80px;
          z-index: 1;
          background: linear-gradient(90deg, #1a0b3b, transparent);
          pointer-events: none;
        }

        .banner-fade-right {
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
          width: 100px;
          z-index: 1;
          background: linear-gradient(270deg, #0f0a1e, transparent);
          pointer-events: none;
        }

        .banner-track-container {
          overflow: hidden;
          padding-left: 270px;
          padding-right: 100px;
          height: 110px;
          display: flex;
          align-items: center;
        }

        .banner-card-pill {
          display: inline-flex;
          align-items: center;
          gap: 16px;
          background: rgba(139,92,246,0.08);
          border: 1.5px solid rgba(139,92,246,0.25);
          border-radius: 100px;
          padding: 14px 32px 14px 18px;
          margin: 0 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .banner-card-pill:hover {
          background: rgba(139,92,246,0.18) !important;
          transform: scale(1.03);
        }

        .banner-card-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #a78bfa);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(124,58,237,0.3);
        }
        
        .banner-card-title {
          font-family: var(--font-heading);
          font-size: 20px;
          font-weight: 800;
          color: #e9d5ff;
          max-width: 320px;
          overflow: hidden;
          text-overflow: ellipsis;
          text-shadow: 0 2px 10px rgba(233, 213, 255, 0.2);
        }

        .banner-card-divider {
          color: rgba(196,181,253,0.3);
          font-size: 18px;
          font-family: var(--font-body);
        }

        .banner-card-meta {
          font-family: var(--font-body);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          color: #c4b5fd;
          font-weight: 600;
        }

        .banner-card-prize {
          font-family: var(--font-body);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          color: #fde68a;
          font-weight: 700;
          text-shadow: 0 2px 8px rgba(253, 230, 138, 0.3);
        }

        .banner-card-end-date {
          font-family: var(--font-body);
          font-size: 15px;
          color: rgba(196,181,253,0.6);
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @media (max-width: 768px) {
          .competition-banner-container {
            top: 68px;
            height: 120px;
          }
          
          .banner-label-wrapper {
            position: absolute;
            left: 50%;
            top: 12px;
            bottom: auto;
            transform: translateX(-50%);
            background: transparent;
            padding-right: 0;
            width: 100%;
            justify-content: center;
          }

          .banner-label-wrapper > div {
            margin-left: 0 !important;
          }

          .banner-fade-left {
            display: none;
          }

          .banner-fade-right {
            width: 30px;
          }

          .banner-track-container {
            padding-left: 0;
            padding-right: 0;
            margin-top: 45px;
            height: 65px;
            width: 100%;
          }

          .banner-card-pill {
            padding: 6px 16px 6px 10px;
            margin: 0 8px;
            gap: 10px;
          }

          .banner-card-icon {
            width: 32px !important;
            height: 32px !important;
          }
          .banner-card-icon svg {
            width: 14px !important;
            height: 14px !important;
          }
          .banner-card-title {
            font-size: 14px !important;
            max-width: 140px !important;
          }
          .banner-card-divider {
            font-size: 14px !important;
          }
          .banner-card-meta {
            font-size: 13px !important;
            gap: 4px !important;
          }
          .banner-card-meta svg {
            width: 12px !important;
            height: 12px !important;
          }
          .banner-card-prize {
            font-size: 13px !important;
            gap: 4px !important;
          }
          .banner-card-prize svg {
            width: 12px !important;
            height: 12px !important;
          }
          .banner-card-end-date {
            font-size: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CompetitionBanner;
