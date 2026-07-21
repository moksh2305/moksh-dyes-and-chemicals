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
          <h2>Trusted by the Global Textile Industry</h2>
          <p>
            Moksh Dyes and Chemicals has been a dependable supplier of
            high-grade dyes, serving international mills, fabric manufacturers, and processing
            units — led personally by proprietor{' '}
            <strong style={{ color: 'var(--gold-lt)' }}>Chirag K Shah</strong>.
          </p>
          <p>
            We specialise in premium VAT dyes for cellulosic fibres, Naphthol dyes for
            deep shades, Reactive dyes for vibrant wash-fast results, and Base
            dyes for the azoic coupling system — with consistent supply and
            assured quality on every order.
          </p>
        </div>

        <div className="serving-section">
          <h3 className="serving-title">Proudly Serving</h3>
          <div className="serving-grid">
            {['Textile Mills', 'Garment Manufacturers', 'Export Houses', 'Fabric Processors', 'Printing Units'].map((item, idx) => (
              <motion.div 
                key={idx} 
                className="serving-pill"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default About;
