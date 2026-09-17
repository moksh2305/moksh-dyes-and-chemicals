import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, AlertTriangle, FlaskConical, ArrowRight } from 'lucide-react';

type FabricType = 'Cotton' | 'Viscose' | 'Silk' | 'Polyester' | 'Linen';

interface AnalysisResult {
  hex: string;
  name: string;
  reactive: number;
  vat: number;
  naphthol: number;
  reactiveDesc: string;
  vatDesc: string;
  naphtholDesc: string;
}

const FabricAnalyzer: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [fabric, setFabric] = useState<FabricType | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fabrics: FabricType[] = ['Cotton', 'Viscose', 'Linen', 'Silk', 'Polyester'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
        setResult(null); // Reset result on new image
      };
      reader.readAsDataURL(file);
    }
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
  };

  const getNearestColorName = (r: number, g: number, b: number) => {
    // Basic heuristic color naming
    if (r > 200 && g < 100 && b < 100) return "Vivid Red";
    if (r < 100 && g > 150 && b < 100) return "Emerald Green";
    if (r < 100 && g < 100 && b > 200) return "Deep Blue";
    if (r > 200 && g > 200 && b < 100) return "Bright Yellow";
    if (r > 150 && g < 100 && b > 150) return "Royal Purple";
    if (r < 50 && g < 50 && b < 50) return "Deep Black";
    if (r > 220 && g > 220 && b > 220) return "Optic White";
    if (r > 100 && r < 150 && g > 50 && g < 100 && b < 50) return "Earthy Brown";
    if (r > 200 && g > 100 && b < 100) return "Warm Orange";
    if (r > 200 && g > 150 && b > 200) return "Dusty Rose";
    return "Custom Shade";
  };

  const analyzeImage = () => {
    if (!image || !fabric) return;
    setIsAnalyzing(true);

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        let r = 0, g = 0, b = 0;
        let count = 0;

        // Sample pixels to get average color
        for (let i = 0; i < data.length; i += 400) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        const hex = rgbToHex(r, g, b);
        const colorName = getNearestColorName(r, g, b);

        setTimeout(() => {
          generateRecommendation(hex, colorName);
        }, 1500); // Simulate processing time
      } catch (e) {
        // Fallback if canvas is tainted (shouldn't happen with local FileReader but just in case)
        setTimeout(() => {
          generateRecommendation("#8B4513", "Earthy Brown (Fallback)");
        }, 1500);
      }
    };
    img.src = image;
  };

  const generateRecommendation = (hex: string, colorName: string) => {
    let reactive = 0, vat = 0, naphthol = 0;
    let rDesc = "", vDesc = "", nDesc = "";

    switch (fabric) {
      case 'Cotton':
      case 'Linen':
        reactive = 95; rDesc = "High suitability. Forms covalent bonds for excellent fastness.";
        vat = 90; vDesc = "Suitable. Premium choice for maximum durability & bleach resistance.";
        naphthol = 75; nDesc = "Application dependent. Great for very deep reds/maroons.";
        break;
      case 'Viscose':
        reactive = 98; rDesc = "Perfect match. Brilliant shades and excellent yield.";
        vat = 85; vDesc = "Highly suitable. Outstanding fastness properties.";
        naphthol = 60; nDesc = "Possible, but reactive is generally preferred.";
        break;
      case 'Silk':
        reactive = 80; rDesc = "Suitable under specific pH controlled conditions.";
        vat = 30; vDesc = "Not recommended. Alkalinity required for vatting can damage silk.";
        naphthol = 20; nDesc = "Not recommended.";
        break;
      case 'Polyester':
        reactive = 10; rDesc = "Incompatible. Requires Disperse dyes.";
        vat = 10; vDesc = "Incompatible. Requires Disperse dyes.";
        naphthol = 10; nDesc = "Incompatible. Requires Disperse dyes.";
        break;
    }

    setResult({
      hex,
      name: colorName,
      reactive,
      vat,
      naphthol,
      reactiveDesc: rDesc,
      vatDesc: vDesc,
      naphtholDesc: nDesc
    });
    setIsAnalyzing(false);
  };

  return (
    <section className="fabric-analyzer-section" id="fabric-analyzer">
      <div className="fabric-analyzer-inner">
        <motion.div 
          className="analyzer-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="subtitle">SMART TOOLS</span>
          <h2>Show Us Your <span className="highlight-text">Fabric</span></h2>
          <p>Have a fabric sample? Don't know which dye you need? Upload a photo, select your fabric, and our digital lab will guide you.</p>
        </motion.div>

        <div className="analyzer-container">
          <div className="analyzer-input-panel">
            <div className="step-group">
              <div className="step-badge">1</div>
              <h3>Upload Sample</h3>
              <div 
                className="upload-zone"
                onClick={() => fileInputRef.current?.click()}
                style={{ backgroundImage: image ? `url(${image})` : 'none' }}
              >
                {!image && (
                  <div className="upload-placeholder">
                    <Camera size={32} />
                    <span>Click to upload photo</span>
                    <span className="small-text">JPG, PNG up to 5MB</span>
                  </div>
                )}
                {image && (
                  <div className="upload-overlay">
                    <Upload size={24} />
                    <span>Change Photo</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
              </div>
            </div>

            <div className="step-group">
              <div className="step-badge">2</div>
              <h3>Select Substrate</h3>
              <div className="fabric-selector">
                {fabrics.map((f) => (
                  <button 
                    key={f} 
                    className={`fabric-btn ${fabric === f ? 'active' : ''}`}
                    onClick={() => setFabric(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <button 
              className={`analyze-btn ${(!image || !fabric) ? 'disabled' : ''}`}
              onClick={analyzeImage}
              disabled={!image || !fabric || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <FlaskConical className="spinner" size={20} />
                  Analyzing Specimen...
                </>
              ) : (
                'Run Fabric Analysis'
              )}
            </button>
          </div>

          <div className="analyzer-results-panel">
            <AnimatePresence mode="wait">
              {!result && !isAnalyzing && (
                <motion.div 
                  className="empty-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key="empty"
                >
                  <FlaskConical size={48} className="empty-icon" />
                  <p>Awaiting sample and substrate data.</p>
                </motion.div>
              )}

              {isAnalyzing && (
                <motion.div 
                  className="analyzing-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  key="analyzing"
                >
                  <div className="scan-line"></div>
                  <p className="glitch-text">Extracting Chromatic Data...</p>
                </motion.div>
              )}

              {result && !isAnalyzing && (
                <motion.div 
                  className="results-dashboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  key="results"
                >
                  <div className="results-header">
                    <h4>FABRIC ANALYSIS</h4>
                  </div>
                  
                  <div className="data-row">
                    <span className="data-label">Detected colour</span>
                    <div className="color-data">
                      <div className="color-swatch" style={{ backgroundColor: result.hex }}></div>
                      <span className="color-name">{result.name} <span className="hex-code">({result.hex})</span></span>
                    </div>
                  </div>

                  <div className="data-row">
                    <span className="data-label">Confirmed substrate</span>
                    <span className="substrate-val">{fabric}</span>
                  </div>

                  <div className="recommendation-bars">
                    <h4>Recommended dye families</h4>
                    
                    <div className="bar-group">
                      <div className="bar-header">
                        <span>REACTIVE</span>
                        <span className="suitability-text" style={{ color: result.reactive > 80 ? '#4ade80' : 'inherit' }}>
                          {result.reactive > 80 ? 'High suitability' : result.reactive > 50 ? 'Application dependent' : 'Not recommended'}
                        </span>
                      </div>
                      <div className="progress-track">
                        <motion.div 
                          className="progress-fill reactive"
                          initial={{ width: 0 }}
                          animate={{ width: `${result.reactive}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        ></motion.div>
                      </div>
                      <p className="bar-desc">{result.reactiveDesc}</p>
                    </div>

                    <div className="bar-group">
                      <div className="bar-header">
                        <span>VAT</span>
                        <span className="suitability-text" style={{ color: result.vat > 80 ? '#4ade80' : 'inherit' }}>
                          {result.vat > 80 ? 'High suitability' : result.vat > 50 ? 'Suitable' : 'Not recommended'}
                        </span>
                      </div>
                      <div className="progress-track">
                        <motion.div 
                          className="progress-fill vat"
                          initial={{ width: 0 }}
                          animate={{ width: `${result.vat}%` }}
                          transition={{ duration: 1, delay: 0.4 }}
                        ></motion.div>
                      </div>
                      <p className="bar-desc">{result.vatDesc}</p>
                    </div>

                    <div className="bar-group">
                      <div className="bar-header">
                        <span>NAPHTHOL</span>
                        <span className="suitability-text" style={{ color: result.naphthol > 80 ? '#4ade80' : 'inherit' }}>
                          {result.naphthol > 80 ? 'High suitability' : result.naphthol > 50 ? 'Application dependent' : 'Not recommended'}
                        </span>
                      </div>
                      <div className="progress-track">
                        <motion.div 
                          className="progress-fill naphthol"
                          initial={{ width: 0 }}
                          animate={{ width: `${result.naphthol}%` }}
                          transition={{ duration: 1, delay: 0.6 }}
                        ></motion.div>
                      </div>
                      <p className="bar-desc">{result.naphtholDesc}</p>
                    </div>
                  </div>

                  <button className="expert-btn" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                    GET EXPERT RECOMMENDATION <ArrowRight size={16} />
                  </button>

                  <div className="disclaimer-box">
                    <AlertTriangle size={16} className="warn-icon" />
                    <p>
                      <strong>Important:</strong> This digital analysis provides a preliminary recommendation. 
                      Professional colour matching relies on proper measurement, formulation workflows, and physical lab validation. Do not use standard photographs for exact laboratory-grade shade matching.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FabricAnalyzer;
