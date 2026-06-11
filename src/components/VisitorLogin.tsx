import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X } from 'lucide-react';

interface VisitorLoginProps {
  onLoginSuccess: () => void;
}

const VisitorLogin: React.FC<VisitorLoginProps> = ({ onLoginSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const isAuth = sessionStorage.getItem('visitor_authenticated');
    if (isAuth === 'true') {
      onLoginSuccess();
    }
  }, [onLoginSuccess]);

  const handleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setError(null);
    try {
      if (credentialResponse.credential) {
        const decoded: any = jwtDecode(credentialResponse.credential);
        const { name, email } = decoded;

        // Hardcoded web hook URL
        const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbzfNsuIyX9d5zP8QTvZyI5CRqsFy2DZNneKWteyQ-wljE-kO4sVXQk_TKiwG0gp16In/exec';

        if (scriptUrl) {
          await fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name,
              email,
              timestamp: new Date().toISOString()
            }),
          });
        }

        sessionStorage.setItem('visitor_authenticated', 'true');
        onLoginSuccess();
      }
    } catch (err) {
      console.error('Error handling login success:', err);
      setError('An error occurred while saving your login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleError = () => {
    setError('Google Sign-In failed. Please try again.');
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      const isAuth = sessionStorage.getItem('visitor_authenticated');
      if (isAuth !== 'true') {
        setIsVisible(true);
      }
    }, 60000);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '2rem',
            maxWidth: '28rem',
            width: '100%',
            margin: '0 1rem',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '0.5rem',
            background: 'linear-gradient(to right, #b8860b, #e8c96a)'
          }}></div>

          <button 
            onClick={handleDismiss}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>

          <div style={{
            width: '4rem',
            height: '4rem',
            backgroundColor: 'rgba(184, 134, 11, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
            marginTop: '1rem'
          }}>
            <Lock style={{ width: '2rem', height: '2rem', color: '#b8860b' }} />
          </div>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
            Welcome to Moksh Dyes
          </h2>
          <p style={{ color: '#475569', marginBottom: '2rem' }}>
            Please sign in to view our premium catalog.
          </p>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap
              theme="filled_blue"
              shape="pill"
            />
          </div>

          <button 
            onClick={handleDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}
          >
            Dismiss for now
          </button>

          {isLoading && (
            <p style={{ fontSize: '0.875rem', color: '#b8860b', marginTop: '0.5rem' }}>
              Signing you in...
            </p>
          )}

          {error && (
            <p style={{
              fontSize: '0.875rem',
              color: '#ef4444',
              marginTop: '0.5rem',
              backgroundColor: '#fef2f2',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              width: '100%'
            }}>
              {error}
            </p>
          )}
          
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem' }}>
            By signing in, you agree to share your name and email with Moksh Dyes and Chemicals.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VisitorLogin;
