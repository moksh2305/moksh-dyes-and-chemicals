import React from 'react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  return (
    <div className="about-strip" id="about">
      <motion.div 
        className="about-inner"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="about-text">
          <h2>Trusted by the Textile Industry</h2>
          <p>
            Moksh Dyes and Chemicals has been a dependable supplier of
            high-grade dyes, serving mills, fabric manufacturers, and processing
            units across India — led personally by proprietor{' '}
            <strong style={{ color: 'var(--gold-lt)' }}>Chirag K Shah</strong>.
          </p>
          <p>
            We specialise in VAT dyes for cellulosic fibres, Naphthol dyes for
            deep shades, Reactive dyes for vibrant wash-fast results, and Base
            dyes for the azoic coupling system — with consistent supply and
            assured quality on every order.
          </p>
        </div>
        <div className="about-stats">
          <div className="stat">
            <div className="stat-num">35+</div>
            <div className="stat-label">Product variants in stock</div>
          </div>
          <div className="stat">
            <div className="stat-num">4</div>
            <div className="stat-label">Dye categories offered</div>
          </div>
          <div className="stat">
            <div className="stat-num">Pan</div>
            <div className="stat-label">India supply network</div>
          </div>
          <div className="stat">
            <div className="stat-num">100%</div>
            <div className="stat-label">Quality assured products</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
