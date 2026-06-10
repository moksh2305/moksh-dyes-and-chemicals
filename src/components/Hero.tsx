import React from 'react';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero">
      {/* Floating Orbs using Framer Motion */}
      <motion.div 
        className="hero-orb hero-orb-1"
        animate={{ 
          x: [0, 30, 0], 
          y: [0, 20, 0],
          scale: [1, 1.08, 1]
        }}
        transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div 
        className="hero-orb hero-orb-2"
        animate={{ 
          x: [0, -30, 0], 
          y: [0, -20, 0],
          scale: [1, 1.08, 1]
        }}
        transition={{ duration: 14, ease: "easeInOut", repeat: Infinity, delay: 2 }}
      />
      <motion.div 
        className="hero-orb hero-orb-3"
        animate={{ 
          x: [0, 20, 0], 
          y: [0, -30, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ duration: 10, ease: "easeInOut", repeat: Infinity, delay: 4 }}
      />

      <motion.div 
        className="hero-badge"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Est. in Mumbai &nbsp;·&nbsp; Premium Quality
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        The Art of <em>Colour</em>,<br />The Science of Dyes
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        Supplying premium VAT dyes, Naphthol dyes, Reactive dyes, and Base dyes
        to the textile and fabric industry across India.
      </motion.p>

      <motion.div 
        className="hero-proprietor"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="hero-proprietor-label">Proprietor</div>
        <div className="hero-proprietor-name">Chirag K Shah</div>
      </motion.div>

      <motion.button
        className="hero-cta"
        onClick={scrollToProducts}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        Explore Products
      </motion.button>
    </section>
  );
};

export default Hero;
