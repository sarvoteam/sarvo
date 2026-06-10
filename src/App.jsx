import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CursorTrail from './components/layout/CursorTrail';
import IntroAnimation from './components/layout/IntroAnimation';


// Pages
import Home from './pages/Home';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import TeamPage from './pages/TeamPage';
import ContactPage from './pages/ContactPage';
import ProductPage from './pages/ProductPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import SarvoPeoplePage from './pages/SarvoPeoplePage';
import SarvoCareersPage from './sarvoCareers/src/pages/SarvoCareersPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <div style={{padding: '100px', color: 'red'}}><h1>Something went wrong.</h1><pre>{this.state.error.toString()}</pre></div>;
    }
    return this.props.children; 
  }
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      style={{
        scaleX,
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: '3px',
        background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
        transformOrigin: '0%',
        zIndex: 100
      }}
    />
  );
}

function AppContent() {
  const location = useLocation();
  const isSarvoPeople = location.pathname === '/sarvo-people';
  const isSarvoCareers = location.pathname === '/sarvo-careers';

  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('hasSeenIntro');
  });

  const handleIntroComplete = () => {
    sessionStorage.setItem('hasSeenIntro', 'true');
    setShowIntro(false);
  };

  // If on Sarvo People page, render it standalone (it has its own layout)
  if (isSarvoPeople) {
    return (
      <ErrorBoundary>
        <SarvoPeoplePage />
      </ErrorBoundary>
    );
  }

  // If on Sarvo Careers page, render it standalone
  if (isSarvoCareers) {
    return (
      <ErrorBoundary>
        <SarvoCareersPage />
      </ErrorBoundary>
    );
  }

  return (
    <>
      {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      <motion.div 
        className="app"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <CursorTrail />
        <ScrollProgress />
        <Navbar />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:id" element={<ServiceDetailPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/product" element={<ProductPage />} />
            <Route path="/sarvo-careers" element={<SarvoCareersPage />} />
          </Routes>
        </ErrorBoundary>
        <Footer />
      </motion.div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
