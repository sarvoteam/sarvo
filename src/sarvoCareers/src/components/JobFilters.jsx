import React from 'react';

const JobFilters = ({ filters, setFilters }) => {
  const departments = ['All', 'Engineering', 'Design', 'Marketing', 'Operations'];
  const jobTypes = ['All', 'Full-time', 'Part-time', 'Internship'];
  const locations = ['All', 'Pune', 'Mumbai', 'Remote'];

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="careers-container">
      <div className="job-filters-container">
        <div className="filter-group">
          <label htmlFor="dept-filter">Department</label>
          <select
            id="dept-filter"
            className="filter-select"
            value={filters.department}
            onChange={(e) => handleFilterChange('department', e.target.value)}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="type-filter">Job Type</label>
          <select
            id="type-filter"
            className="filter-select"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            {jobTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="loc-filter">Location</label>
          <select
            id="loc-filter"
            className="filter-select"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default JobFilters;
