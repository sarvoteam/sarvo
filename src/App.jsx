import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CursorTrail from './components/layout/CursorTrail';
import IntroAnimation from './components/layout/IntroAnimation';
import ScrollToTop from './components/common/ScrollToTop';
import AppRouter from './routes/AppRouter';

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
      return (
        <div style={{ padding: '100px', color: 'red' }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{
        scaleX,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background:
          'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
        transformOrigin: '0%',
        zIndex: 100,
      }}
    />
  );
}

function AppContent() {
  const location = useLocation();

  const isSarvoPeople = location.pathname.startsWith('/sarvo-people');
  const isSarvoCareers = location.pathname.startsWith('/sarvo-careers');

  const [showIntro, setShowIntro] = useState(false);

  // Lifted authentication states for Sarvo People
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('sarvo_people_auth') === 'true';
  });

  const [employee, setEmployee] = useState(() => {
    if (sessionStorage.getItem('sarvo_people_auth') === 'true') {
      const saved = localStorage.getItem('sarvo_current_user');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const handleIntroComplete = () => {
    sessionStorage.setItem('hasSeenIntro', 'true');
    setShowIntro(false);
  };

  // Standalone pages (no main site header/footer)
  if (isSarvoPeople || isSarvoCareers) {
    return (
      <ErrorBoundary>
        <AppRouter 
          employee={employee}
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
          setEmployee={setEmployee}
        />
      </ErrorBoundary>
    );
  }

  return (
    <>
      <ScrollToTop />

      {showIntro && (
        <IntroAnimation onComplete={handleIntroComplete} />
      )}

      <motion.div
        className="app"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <CursorTrail />
        <ScrollProgress />
        <Navbar />

        <ErrorBoundary>
          <AppRouter 
            employee={employee}
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
            setEmployee={setEmployee}
          />
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