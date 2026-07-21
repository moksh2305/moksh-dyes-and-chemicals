import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';

const AnimatedCounter: React.FC<{ value: number; suffix?: string; prefix?: string }> = ({ value, suffix = "", prefix = "" }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 40, damping: 15, mass: 1 });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest).toLocaleString());
    });
    return unsubscribe;
  }, [springValue]);

  return <span ref={ref}>{prefix}{displayValue}{suffix}</span>;
};

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
        
        <div className="premium-stats hero-stats">
          <div className="stat">
            <div className="stat-num"><AnimatedCounter value={30} suffix="+" /></div>
            <div className="stat-label">Years Experience</div>
          </div>
          <div className="stat">
            <div className="stat-num"><AnimatedCounter value={120} suffix="+" /></div>
            <div className="stat-label">Business Clients</div>
          </div>
          <div className="stat">
            <div className="stat-num"><AnimatedCounter value={18} suffix="+" /></div>
            <div className="stat-label">States Supplied</div>
          </div>
          <div className="stat">
            <div className="stat-num"><AnimatedCounter value={99} suffix="%" /></div>
            <div className="stat-label">Repeat Customers</div>
          </div>
        </div>
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
