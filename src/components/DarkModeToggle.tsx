import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DarkModeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [clickPos, setClickPos] = useState({ x: 0, y: 0 });

  const toggleTheme = (e: React.MouseEvent) => {
    if (animating) return;
    
    const x = e.clientX;
    const y = e.clientY;
    setClickPos({ x, y });
    setAnimating(true);
    
    // Switch theme exactly when the circle covers the screen
    setTimeout(() => {
      if (isDark) {
        document.body.classList.remove('dark-theme');
      } else {
        document.body.classList.add('dark-theme');
      }
      setIsDark(!isDark);
    }, 400);

    // End animation
    setTimeout(() => {
      setAnimating(false);
    }, 800);
  };

  return (
    <>
      <button 
        className="theme-toggle-btn" 
        onClick={toggleTheme}
        title="Toggle Dark Mode"
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      {/* The Ink Drop Animation Layer */}
      <AnimatePresence>
        {animating && (
          <motion.div
            className="ink-drop-overlay"
            initial={{ 
              clipPath: `circle(0px at ${clickPos.x}px ${clickPos.y}px)`,
              backgroundColor: isDark ? '#ffffff' : '#0a0a0a'
            }}
            animate={{ 
              clipPath: `circle(150% at ${clickPos.x}px ${clickPos.y}px)`,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.64, 0, 0.28, 1] }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 9999,
              pointerEvents: 'none'
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default DarkModeToggle;
