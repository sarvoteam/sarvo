import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import titleIntroSound from '../../assets/sounds/titleIntro.mp3';

const Crystal = () => (
  <motion.svg
    width="250"
    height="300"
    viewBox="0 0 200 250"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    animate={{
      y: [0, -15, 0],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    style={{
      filter: 'drop-shadow(0px 0px 20px rgba(255, 255, 255, 0.1))'
    }}
  >
    {/* Geometric shards to look like the Resn 3D object */}
    <motion.g
       animate={{ rotateY: [0, 15, -15, 0] }}
       transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
       style={{ transformOrigin: 'center' }}
    >
      <polygon points="100,10 150,100 100,200 50,100" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
      <polygon points="100,10 130,100 100,180" fill="rgba(255,255,255,0.1)"/>
      <polygon points="100,10 70,100 100,180" fill="rgba(255,255,255,0.02)"/>
      <polygon points="100,200 150,100 130,100 100,180" fill="rgba(255,255,255,0.15)"/>
      <polygon points="100,200 50,100 70,100 100,180" fill="rgba(255,255,255,0.08)"/>
    </motion.g>

    {/* Floating disconnected shards */}
    <motion.polygon 
      points="20,150 40,140 30,170" 
      fill="rgba(255,255,255,0.2)"
      animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 90, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: '30px 155px' }}
    />
    <motion.polygon 
      points="170,80 180,60 190,90" 
      fill="rgba(255,255,255,0.1)"
      animate={{ y: [0, 20, 0], x: [0, -10, 0], rotate: [0, -90, 0] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: '180px 75px' }}
    />
    <motion.polygon 
      points="80,220 100,240 110,210" 
      fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5"
      animate={{ y: [0, 15, 0], rotate: [0, 45, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: '95px 225px' }}
    />
  </motion.svg>
);

const IntroAnimation = ({ onComplete }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const audioRef = useRef(null);

  useEffect(() => {
    // Prevent scrolling while intro is visible
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleStart = () => {
    setHasStarted(true);
    
    // Play the audio with a slight delay to sync perfectly with the text
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(err => console.warn("Audio play failed:", err));
      }
    }, 1200);

    // Start the timer to end the cinematic intro (wait 1 extra second for text to hold)
    setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 1200); // Wait for background fade out before notifying parent
    }, 4000);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0, ease: "easeInOut" }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#050505',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            zIndex: 9999,
            overflow: 'hidden'
          }}
          onClick={!hasStarted ? handleStart : undefined}
        >
          <audio ref={audioRef} src={titleIntroSound} preload="auto" />

          <AnimatePresence mode="wait">
            {!hasStarted ? (
              <motion.div
                key="start-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                transition={{ duration: 1 }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <Crystal />
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    color: '#ffffff',
                    fontFamily: '"Inter", "Outfit", sans-serif',
                    letterSpacing: '0.4em',
                    paddingLeft: '0.4em', // perfectly centers text to counter letter-spacing asymmetry
                    textTransform: 'uppercase',
                    fontSize: '0.8rem',
                    marginTop: '2rem',
                    fontWeight: 300,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
                    paddingBottom: '6px'
                  }}
                >
                  Sarvo
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="cinematic-text"
                initial={{ opacity: 0, scale: 1.1, letterSpacing: '1.5em', paddingLeft: '1.5em', filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, letterSpacing: '0.2em', paddingLeft: '0.2em', filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.2, letterSpacing: '0em', paddingLeft: '0em', filter: 'blur(20px)' }}
                transition={{ 
                  default: {
                    duration: 2.0, 
                    ease: "easeOut", // Use standard easeOut to prevent custom bezier jitter
                  },
                  exit: {
                    duration: 1.0,
                    ease: "easeIn"
                  }
                }}
                style={{
                  position: 'absolute',
                  color: '#ffffff',
                  fontSize: 'clamp(3rem, 8vw, 8rem)',
                  fontWeight: 300,
                  fontFamily: '"Inter", "Outfit", sans-serif',
                  textTransform: 'uppercase',
                  paddingBottom: '1vw',
                  willChange: 'transform, letter-spacing, padding-left, filter, opacity', // Force GPU acceleration
                  transformOrigin: 'center center',
                }}
              >
                Sarvo
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation;
