import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public Web Pages
import Home from '../pages/Home';
import AboutPage from '../pages/AboutPage';
import ServicesPage from '../pages/ServicesPage';
import ServiceDetailPage from '../pages/ServiceDetailPage';
import TeamPage from '../pages/TeamPage';
import ContactPage from '../pages/ContactPage';
import ProductPage from '../pages/ProductPage';

// Portal / App Platforms
import SarvoPeoplePage from '../pages/SarvoPeoplePage';
import SarvoCareersPage from '../sarvoCareers/src/pages/SarvoCareersPage';
import SarvoCompetitionsPage from '../sarvoCompetitions/src/pages/SarvoCompetitionsPage';
import CompetitionTestPage from '../sarvoCompetitions/src/pages/CompetitionTestPage';

export default function AppRouter({ 
  employee, 
  isAuthenticated, 
  setIsAuthenticated, 
  setEmployee 
}) {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/services/:id" element={<ServiceDetailPage />} />
      <Route path="/team" element={<TeamPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/product" element={<ProductPage />} />
      <Route path="/sarvo-careers" element={<SarvoCareersPage />} />
      <Route path="/sarvo-competitions" element={<SarvoCompetitionsPage />} />
      <Route path="/competition-test" element={<CompetitionTestPage />} />

      {/* Sarvo People Portal - Nested Route Wildcard */}
      <Route 
        path="/sarvo-people/*" 
        element={
          <SarvoPeoplePage 
            employee={employee} 
            isAuthenticated={isAuthenticated} 
            setIsAuthenticated={setIsAuthenticated} 
            setEmployee={setEmployee} 
          />
        } 
      />
      
      {/* Redirect wildcards */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
