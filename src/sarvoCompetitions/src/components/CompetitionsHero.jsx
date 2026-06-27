import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

const CompetitionsHero = ({ 
  searchQuery, 
  setSearchQuery, 
  activeFilter, 
  setActiveFilter, 
  activeCount, 
  completedCount 
}) => {
  const totalCount = activeCount + completedCount;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  return (
    <motion.section 
      className="comps-hero comps-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h1>Showcase Your <span>Engineering</span> Excellence</h1>

      <div className="comps-controls-row">
        {/* Compact Search Box */}
        <div className="comps-search-small">
          <div className="search-icon-small">
            <Search size={15} />
          </div>
          <input
            type="text"
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Compact Filter Buttons with Integrated Count Badges */}
        <div className="comps-filters-small">
          <button
            className={`filter-btn-small all ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Events
            <span className="filter-count-badge">{totalCount}</span>
          </button>
          <button
            className={`filter-btn-small active-filter ${activeFilter === 'active' ? 'active' : ''}`}
            onClick={() => setActiveFilter('active')}
          >
            Active
            <span className="filter-count-badge">{activeCount}</span>
          </button>
          <button
            className={`filter-btn-small completed ${activeFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('completed')}
          >
            Completed
            <span className="filter-count-badge">{completedCount}</span>
          </button>
        </div>
      </div>
    </motion.section>
  );
};

export default CompetitionsHero;
