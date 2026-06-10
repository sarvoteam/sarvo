import React from 'react';
import { Search } from 'lucide-react';

const CareersHero = ({ searchQuery, setSearchQuery }) => {
  return (
    <section className="careers-hero">
      <div className="careers-container">
        <h1>Build the <span>Future</span> with Sarvo</h1>
        <p>
          We are builders, creators, and innovators. Join our mission to create world-class digital applications that redefine industries.
        </p>

        <div className="hero-stats">
          <div className="stat-item">
            <h3>5</h3>
            <p>Open Roles</p>
          </div>
          <div className="stat-item">
            <h3>50+</h3>
            <p>Team Members</p>
          </div>
          <div className="stat-item">
            <h3>100%</h3>
            <p>Growth Focus</p>
          </div>
        </div>

        <div className="job-search-box">
          <span className="search-icon-wrapper">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search roles (e.g. Frontend, React, Product)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="button">Search</button>
        </div>
      </div>
    </section>
  );
};

export default CareersHero;
