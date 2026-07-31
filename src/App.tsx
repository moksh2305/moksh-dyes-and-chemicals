import React, { useEffect, useState } from 'react';
import AnnouncementBar from './components/AnnouncementBar';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustBar from './components/TrustBar';
import SmartSearch from './components/SmartSearch';
import DyeGuide from './components/DyeGuide';
import ProductGrid from './components/ProductGrid';
import OrderProcess from './components/OrderProcess';
import FAQ from './components/FAQ';
import ScreenshotProtection from './components/ScreenshotProtection';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import StickyCall from './components/StickyCall';
import YieldCalculator from './components/YieldCalculator';
import DarkModeToggle from './components/DarkModeToggle';
import VisitorLogin from './components/VisitorLogin';
import { AnimatePresence, motion } from 'framer-motion';
import './index.css';

const App: React.FC = () => {
  const [showBackTop, setShowBackTop] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('visitor_authenticated') === 'true';
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowBackTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <ScreenshotProtection />
      {!isAuthenticated && (
        <VisitorLogin onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
      <AnnouncementBar />
      <Navbar />
      <Hero />
      <SmartSearch />
      <TrustBar />
      <DyeGuide />
      <ProductGrid />
      <YieldCalculator />
      <OrderProcess />
      <FAQ />
      <About />
      <Contact />
      <Footer />
      <StickyCall />
      <DarkModeToggle />
      
      <AnimatePresence>
        {showBackTop && (
          <motion.button
            id="backTop"
            className="visible"
            onClick={scrollToTop}
            title="Back to top"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ↑
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default App;
