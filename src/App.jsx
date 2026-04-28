import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CursorTrail from './components/layout/CursorTrail';

// Pages
import Home from './pages/Home';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import TeamPage from './pages/TeamPage';
import ContactPage from './pages/ContactPage';
import ProductPage from './pages/ProductPage';

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

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <CursorTrail />
        <ScrollProgress />
        <Navbar />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/product" element={<ProductPage />} />
          </Routes>
        </ErrorBoundary>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
