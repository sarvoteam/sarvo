import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 200 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Outer Ring */}
      <motion.div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '1.5px solid var(--accent-primary)',
          translateX: cursorX,
          translateY: cursorY,
          x: -20,
          y: -20,
          pointerEvents: 'none',
          zIndex: 10000,
        }}
        animate={{
          scale: isHovering ? 2.5 : 1,
          borderWidth: isHovering ? '1px' : '1.5px',
          borderColor: isHovering ? 'var(--accent-secondary)' : 'var(--accent-primary)',
        }}
      />
      
      {/* Inner Dot */}
      <motion.div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: 'var(--accent-secondary)',
          translateX: mouseX,
          translateY: mouseY,
          x: -4,
          y: -4,
          pointerEvents: 'none',
          zIndex: 10001,
          boxShadow: '0 0 15px var(--accent-secondary), 0 0 30px var(--accent-secondary)',
        }}
        animate={{
          scale: isHovering ? 0.5 : 1,
        }}
      />

      
      <style>{`
        * {
          cursor: none !important;
        }
      `}</style>
    </>
  );
};

export default CustomCursor;
