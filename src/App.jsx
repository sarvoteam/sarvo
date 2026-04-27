import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Navbar from './components/layout/Navbar';
import Hero from './features/hero/Hero';
import Services from './features/services/Services';
import Stats from './features/stats/Stats';
import Team from './features/team/Team';
import Testimonials from './features/testimonials/Testimonials';
import Pricing from './features/pricing/Pricing';
import Contact from './features/contact/Contact';
import Footer from './components/layout/Footer';
import CursorTrail from './components/layout/CursorTrail';


function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="app">
      <CursorTrail />
      <motion.div
        style={{
          scaleX,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
          transformOrigin: '0%',
          zIndex: 100
        }}
      />
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Stats />
        <Team />
        <Testimonials />
        <Pricing />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;
