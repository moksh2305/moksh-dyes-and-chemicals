import React, { useEffect, useState } from 'react';

const ScreenshotProtection: React.FC = () => {
  const [isBlackedOut, setIsBlackedOut] = useState(false);

  useEffect(() => {
    // Prevent right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Detect PrintScreen and typical screenshot shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key, or Cmd+Shift+S (Mac), Cmd+Shift+3/4 (Mac), Windows+Shift+S (Windows)
      if (
        e.key === 'PrintScreen' ||
        (e.metaKey && e.shiftKey && (e.key === 's' || e.key === 'S' || e.key === '3' || e.key === '4' || e.key === '5')) ||
        (e.ctrlKey && e.key === 'p') // sometimes used for printing
      ) {
        setIsBlackedOut(true);
        
        // Clear clipboard just in case they captured something (Works on some browsers)
        try {
          navigator.clipboard.writeText('Screenshots are disabled for security reasons.');
        } catch (err) {
          // Ignore
        }

        // Restore after a short delay
        setTimeout(() => setIsBlackedOut(false), 3000);
      }
    };

    // Many snipping tools cause the browser to lose focus. 
    // Black out the screen when the window loses focus to prevent capturing.
    const handleBlur = () => {
      setIsBlackedOut(true);
    };

    const handleFocus = () => {
      setIsBlackedOut(false);
    };

    // Prevent text selection via CSS
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.body.style.userSelect = 'auto';
      document.body.style.webkitUserSelect = 'auto';
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <>
      {/* Watermark that is always visible but doesn't interfere with clicks */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 99998,
        display: 'flex',
        flexWrap: 'wrap',
        overflow: 'hidden',
        opacity: 0.04, // Very subtle, but visible if someone edits contrast
        transform: 'rotate(-30deg) scale(1.5)',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {Array.from({ length: 150 }).map((_, i) => (
          <div key={i} style={{ 
            padding: '40px', 
            fontSize: '18px', 
            fontWeight: 'bold', 
            color: 'black',
            whiteSpace: 'nowrap' 
          }}>
            Moksh Dyes & Chemicals • Protected
          </div>
        ))}
      </div>

      {/* Blackout overlay triggered by shortcuts or blur */}
      {isBlackedOut && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'black',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'sans-serif'
        }}>
          <p style={{ opacity: 0.1 }}>Protected Content</p>
        </div>
      )}
    </>
  );
};

export default ScreenshotProtection;
