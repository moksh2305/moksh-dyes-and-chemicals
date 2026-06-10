import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import './VisitorLogin.css';

interface VisitorLoginProps {
  onLoginSuccess: () => void;
}

const VisitorLogin: React.FC<VisitorLoginProps> = ({ onLoginSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

        const scriptUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;

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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="visitor-login-overlay"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="visitor-login-modal"
        >
          <div className="visitor-login-header-bar"></div>

          <div className="visitor-login-content">
            <div className="visitor-login-icon-container">
              <Lock className="visitor-login-icon" />
            </div>
            
            <h2 className="visitor-login-title">
              Welcome to Moksh Dyes
            </h2>
            <p className="visitor-login-subtitle">
              Please sign in to access our website.
            </p>

            <div className="visitor-login-button-container">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                useOneTap
                theme="filled_blue"
                shape="pill"
              />
            </div>

            {isLoading && (
              <p className="visitor-login-loading">
                Signing you in...
              </p>
            )}

            {error && (
              <p className="visitor-login-error">
                {error}
              </p>
            )}
            
            <p className="visitor-login-footer">
              By signing in, you agree to share your name and email with Moksh Dyes and Chemicals.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VisitorLogin;
