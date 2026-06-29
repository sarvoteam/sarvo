import React from 'react';
import { motion } from 'framer-motion';

const CompetitionsFilters = ({ activeFilter, setActiveFilter }) => {
  const filterOptions = [
    { id: 'all', label: 'All Events' },
    { id: 'active', label: 'Active / Running' },
    { id: 'completed', label: 'Completed' }
  ];

  return (
    <motion.div 
      className="comp-filters-container comps-container"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {filterOptions.map((opt) => (
        <button
          key={opt.id}
          className={`filter-btn ${activeFilter === opt.id ? 'active' : ''}`}
          onClick={() => setActiveFilter(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </motion.div>
  );
};

export default CompetitionsFilters;
