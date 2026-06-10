import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DYE_TYPES = [
  { id: 'vat', name: 'VAT Dyes', rate: 2.5, pricePerKg: 1200, desc: 'High fastness, 2.5% shade' },
  { id: 'reactive', name: 'Reactive Dyes', rate: 4.0, pricePerKg: 850, desc: 'Vivid colors, 4.0% shade' },
  { id: 'naphthol', name: 'Naphthol Dyes', rate: 3.0, pricePerKg: 1050, desc: 'Deep shades, 3.0% shade' },
];

const YieldCalculator: React.FC = () => {
  const [fabricKg, setFabricKg] = useState<number>(100);
  const [selectedDye, setSelectedDye] = useState(DYE_TYPES[0]);
  
  // Calculate results
  const dyeRequiredKg = (fabricKg * selectedDye.rate) / 100;

  return (
    <div className="yield-section" id="calculator">
      <div className="yield-inner">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="eyebrow">Smart Tools</span>
          <h2>Bulk Yield Calculator</h2>
          <p>Calculate exact dye requirements and estimated costs for your batch.</p>
        </motion.div>

        <div className="yield-grid">
          {/* Controls */}
          <motion.div 
            className="yield-controls"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="yield-input-group">
              <label>Fabric Weight (kg)</label>
              <input 
                type="range" 
                min="50" 
                max="5000" 
                step="50"
                value={fabricKg}
                onChange={(e) => setFabricKg(Number(e.target.value))}
                className="yield-slider"
              />
              <div className="yield-val-display">{fabricKg.toLocaleString()} kg</div>
            </div>

            <div className="yield-input-group">
              <label>Dye Category</label>
              <div className="yield-chips">
                {DYE_TYPES.map(dye => (
                  <button 
                    key={dye.id}
                    className={`yield-chip ${selectedDye.id === dye.id ? 'active' : ''}`}
                    onClick={() => setSelectedDye(dye)}
                  >
                    {dye.name}
                  </button>
                ))}
              </div>
              <div className="yield-dye-desc">{selectedDye.desc}</div>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div 
            className="yield-results"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="yield-result-box highlight">
              <div className="yield-result-label">Dye Required</div>
              <motion.div 
                key={dyeRequiredKg}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="yield-result-value"
              >
                {dyeRequiredKg.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span>kg</span>
              </motion.div>
              <div className="yield-result-sub">*Industry standard estimate. May vary by machine.</div>
            </div>
            
            <button className="yield-action-btn" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
              Call to Order This Quantity
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default YieldCalculator;
