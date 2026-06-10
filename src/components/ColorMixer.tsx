import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BASE_DYES = [
  { name: 'Vat Yellow 3RT', color: '#fdd835' },
  { name: 'Vat Blue BC', color: '#0d47a1' },
  { name: 'Vat Red 6B', color: '#e53935' },
  { name: 'Vat Green 2G', color: '#2e7d32' },
];

const ColorMixer: React.FC = () => {
  const [dyeA, setDyeA] = useState(BASE_DYES[0]);
  const [dyeB, setDyeB] = useState(BASE_DYES[1]);
  const [ratioA, setRatioA] = useState(50);
  const [mixing, setMixing] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const ratioB = 100 - ratioA;

  // Simple blend function for visualization
  const blendColors = (color1: string, color2: string, percentage: number) => {
    const hex2rgb = (hex: string) => {
      const match = hex.replace('#', '').match(/.{1,2}/g);
      return {
        r: parseInt(match![0], 16),
        g: parseInt(match![1], 16),
        b: parseInt(match![2], 16)
      };
    };

    const c1 = hex2rgb(color1);
    const c2 = hex2rgb(color2);

    const r = Math.round(c1.r * (percentage / 100) + c2.r * ((100 - percentage) / 100));
    const g = Math.round(c1.g * (percentage / 100) + c2.g * ((100 - percentage) / 100));
    const b = Math.round(c1.b * (percentage / 100) + c2.b * ((100 - percentage) / 100));

    return `rgb(${r}, ${g}, ${b})`;
  };

  const finalColor = blendColors(dyeA.color, dyeB.color, ratioA);

  const handleMix = () => {
    setMixing(true);
    setShowResult(false);
    setTimeout(() => {
      setMixing(false);
      setShowResult(true);
    }, 1500);
  };

  return (
    <div className="mixer-section" id="mixer">
      <div className="mixer-inner">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="eyebrow">Interactive Lab</span>
          <h2>Color Recipe Generator</h2>
          <p>Simulate mixing our VAT dyes to discover new shade recipes.</p>
        </motion.div>

        <div className="mixer-dashboard">
          <div className="mixer-controls">
            <div className="mixer-drop-zone">
              <h4>Base Dye 1</h4>
              <select value={dyeA.name} onChange={(e) => setDyeA(BASE_DYES.find(d => d.name === e.target.value)!)} className="mixer-select">
                {BASE_DYES.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
              <div className="mixer-color-preview" style={{ background: dyeA.color }} />
              <div className="mixer-ratio-display">{ratioA}%</div>
            </div>

            <div className="mixer-slider-wrap">
              <input 
                type="range" 
                min="0" max="100" 
                value={ratioA} 
                onChange={(e) => setRatioA(Number(e.target.value))}
                className="yield-slider"
              />
            </div>

            <div className="mixer-drop-zone">
              <h4>Base Dye 2</h4>
              <select value={dyeB.name} onChange={(e) => setDyeB(BASE_DYES.find(d => d.name === e.target.value)!)} className="mixer-select">
                {BASE_DYES.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
              <div className="mixer-color-preview" style={{ background: dyeB.color }} />
              <div className="mixer-ratio-display">{ratioB}%</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="yield-action-btn" onClick={handleMix} disabled={mixing}>
              {mixing ? 'Blending...' : 'Mix Recipe'}
            </button>
          </div>

          <AnimatePresence>
            {(mixing || showResult) && (
              <motion.div 
                className="mixer-result-area"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {mixing && (
                  <div className="mixer-animation">
                    <motion.div 
                      className="liquid-drop drop-a"
                      style={{ background: dyeA.color }}
                      animate={{ y: [0, 80], scale: [1, 0.5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <motion.div 
                      className="liquid-drop drop-b"
                      style={{ background: dyeB.color }}
                      animate={{ y: [0, 80], scale: [1, 0.5, 0] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <div className="beaker"></div>
                  </div>
                )}
                {showResult && !mixing && (
                  <motion.div 
                    className="mixer-final"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  >
                    <div className="mixer-final-color" style={{ background: finalColor }}></div>
                    <div className="mixer-final-text">
                      <h3>Custom Shade Achieved</h3>
                      <p>Recipe: {ratioA}% {dyeA.name} + {ratioB}% {dyeB.name}</p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ColorMixer;
