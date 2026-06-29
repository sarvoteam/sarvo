import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import sarvoLogo from '../../../assets/sarvo.jpg';
import { Sun, Moon, ArrowLeft } from 'lucide-react';
import '../styles/competitions.css';

import CompetitionsHero from '../components/CompetitionsHero';
import CompetitionCard from '../components/CompetitionCard';
import CompetitionDetailView from '../components/CompetitionDetailView';
import { competitionApi } from '../../../sarvo people/src/apis/competitionApi';
import Footer from '../../../components/layout/Footer';

const SarvoCompetitionsPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [competitions, setCompetitions] = useState([]);
  const [selectedComp, setSelectedComp] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch from DB
  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const data = await competitionApi.getCompetitions();
        setCompetitions(data || []);
      } catch (err) {
        console.error('API error fetching competitions:', err);
        setCompetitions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompetitions();
  }, []);

  // Scroll to top when view changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedComp]);

  // Filter competitions based on search query and status tab
  const filteredComps = competitions.filter((comp) => {
    const matchesFilter = activeFilter === 'all' || comp.status === activeFilter;
    const matchesSearch = 
      comp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comp.detailed_description && comp.detailed_description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const activeCount = competitions.filter(c => c.status === 'active').length;
  const completedCount = competitions.filter(c => c.status === 'completed').length;

  return (
    <div className="sarvo-competitions-wrapper">
      {/* Competitions Portal Header */}
      <header className="comps-header">
        <div className="comps-header-content comps-container">
          <div className="comps-brand" onClick={() => window.location.href = '/'} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <ArrowLeft 
              size={18} 
              style={{
                color: 'var(--text-secondary-luxury)',
                transition: 'all 0.3s ease',
                marginRight: '0.1rem'
              }}
              className="brand-back-arrow"
            />
            <img 
              src={sarvoLogo} 
              alt="Sarvo Logo" 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1.5px solid var(--comps-accent)'
              }} 
            />
            <span className="comps-brand-name">Sarvo <span>Competitions</span> Hub</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={toggleTheme}
              style={{
                background: 'var(--glass-bg, rgba(255,255,255,0.03))',
                border: '1px solid var(--glass-border, rgba(255,255,255,0.08))',
                color: 'var(--text-primary, #ffffff)',
                cursor: 'pointer',
                padding: '0.65rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      {!selectedComp ? (
        <>
          <CompetitionsHero 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            activeCount={activeCount}
            completedCount={completedCount}
          />
          
          <main className="comps-container" style={{ marginTop: '0' }}>
            
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <p>Loading competitions details...</p>
              </div>
            ) : (
              <div className="comps-grid">
                {filteredComps.length > 0 ? (
                  filteredComps.map((comp) => (
                    <CompetitionCard
                      key={comp.id}
                      competition={comp}
                      onView={() => setSelectedComp(comp)}
                    />
                  ))
                ) : (
                  <div className="no-comps-found">
                    <h3>No Competitions Found</h3>
                    <p>We couldn't find any competitions matching your search criteria. Try adjusting your filters.</p>
                  </div>
                )}
              </div>
            )}
          </main>
        </>
      ) : (
        <CompetitionDetailView
          competition={selectedComp}
          onBack={() => setSelectedComp(null)}
        />
      )}

      <Footer />
    </div>
  );
};

export default SarvoCompetitionsPage;
