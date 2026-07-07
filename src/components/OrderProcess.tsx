import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const finderSteps = [
  {
    q: "What fabric are you dyeing?",
    hint: "Select the fibre type that best matches your material",
    opts: [
      { icon: "🪡", label: "Cotton", sub: "Woven or knit" },
      { icon: "✨", label: "Viscose / Rayon", sub: "Semi-synthetic" },
      { icon: "🌿", label: "Linen / Jute", sub: "Natural cellulosic" },
      { icon: "🕸️", label: "Silk", sub: "Protein fibre" },
    ],
  },
  {
    q: "What matters most to you?",
    hint: "This helps us match the best dye chemistry for your goal",
    opts: [
      { icon: "💧", label: "Wash Fastness", sub: "Survives many washes" },
      { icon: "☀️", label: "Light Fastness", sub: "Outdoor/sun exposure" },
      { icon: "🎨", label: "Vivid Colour", sub: "Bright & saturated" },
      { icon: "⚡", label: "Bold & Deep", sub: "Dark, rich shades" },
    ],
  },
];

const recommendations: Record<string, any> = {
  "Cotton-Wash Fastness": {
    title: "Reactive Dyes",
    desc: "Reactive dyes form a covalent bond with cotton fibres, giving you the highest wash fastness available. Ideal for garments, bed linen, and anything washed frequently.",
    tags: ["Covalent Bond", "5/5 Wash Fastness", "Cotton", "Bright Shades"],
  },
  "Cotton-Light Fastness": {
    title: "VAT Dyes",
    desc: "VAT dyes are the benchmark for light fastness on cotton. They resist fading under sunlight better than almost any other dye chemistry.",
    tags: ["Excellent Light Fastness", "Cotton", "Deep Shades", "Industrial Grade"],
  },
  "Cotton-Vivid Colour": {
    title: "Reactive Dyes",
    desc: "For the most vibrant, colour-clear results on cotton, Reactive dyes are the answer.",
    tags: ["Vivid & Clear", "High Brilliance", "Cotton / Viscose", "Wash-Fast"],
  },
  "Cotton-Bold & Deep": {
    title: "Naphthol / Base Dyes",
    desc: "Naphthol and Base dyes excel at producing intense, dark, insoluble shades on cotton.",
    tags: ["Deep Shades", "Azoic System", "Bold Colours", "Cotton"],
  },
  "Viscose / Rayon-Wash Fastness": {
    title: "Reactive Dyes",
    desc: "Viscose responds beautifully to Reactive dyes, which bond at a molecular level with the fibre.",
    tags: ["Reactive", "Viscose-Friendly", "Wash-Fast", "Soft Handle"],
  },
  "Viscose / Rayon-Light Fastness": {
    title: "Reactive Dyes",
    desc: "Reactive dyes with good light fastness ratings are the best match for viscose/rayon in applications requiring outdoor durability.",
    tags: ["Reactive", "Light Stable", "Viscose", "Fashion Grade"],
  },
  "Viscose / Rayon-Vivid Colour": {
    title: "Reactive Dyes",
    desc: "Reactive dyes on viscose produce some of the most brilliant shades available in textile dyeing.",
    tags: ["Vivid", "Reactive", "Viscose / Rayon", "Colour Clarity"],
  },
  "Viscose / Rayon-Bold & Deep": {
    title: "VAT Dyes",
    desc: "VAT dyes can achieve deep, rich shades on viscose and other cellulosic fibres.",
    tags: ["VAT", "Deep Shades", "Cellulosic", "Durable"],
  },
  "Linen / Jute-Wash Fastness": {
    title: "VAT Dyes",
    desc: "VAT dyes are ideal for linen and jute — natural cellulosic fibres that respond well to the reduction-oxidation dyeing process.",
    tags: ["VAT", "Linen", "Jute", "Wash-Fast"],
  },
  "Linen / Jute-Light Fastness": {
    title: "VAT Dyes",
    desc: "For linen used in upholstery or outdoor applications, VAT dyes deliver superior light fastness.",
    tags: ["VAT", "Light Stable", "Linen", "Upholstery"],
  },
  "Linen / Jute-Vivid Colour": {
    title: "Reactive Dyes",
    desc: "Reactive dyes can bring vibrancy to linen and natural cellulosic fibres.",
    tags: ["Reactive", "Vivid", "Linen", "Natural Fibre"],
  },
  "Linen / Jute-Bold & Deep": {
    title: "VAT Dyes",
    desc: "VAT dyes produce deep, earthy, durable shades on linen and jute.",
    tags: ["VAT", "Deep", "Linen / Jute", "Earthy Shades"],
  },
  "Silk-Wash Fastness": {
    title: "Reactive Dyes",
    desc: "Reactive dyes work on silk at low temperatures and deliver excellent wash fastness and brilliance.",
    tags: ["Reactive", "Silk-Safe", "Wash-Fast", "Brilliant"],
  },
  "Silk-Light Fastness": {
    title: "Reactive Dyes",
    desc: "For silk exposed to light, Reactive dyes provide durability and colour clarity.",
    tags: ["Reactive", "Light Stable", "Silk", "Premium"],
  },
  "Silk-Vivid Colour": {
    title: "Reactive Dyes",
    desc: "Silk and Reactive dyes are a natural pairing for vivid, luminous shades.",
    tags: ["Reactive", "Vivid", "Silk", "Luminous"],
  },
  "Silk-Bold & Deep": {
    title: "Reactive Dyes",
    desc: "Even for deep, intense shades on silk, Reactive dyes are recommended.",
    tags: ["Reactive", "Deep Shades", "Silk", "Gentle Process"],
  },
};

const OrderProcess: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const handlePick = (label: string) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = label;
    setAnswers(newAnswers);
    setCurrentStep(currentStep + 1);
  };

  const resetFinder = () => {
    setAnswers([]);
    setCurrentStep(0);
  };

  const pct = (currentStep / finderSteps.length) * 100;
  const isComplete = currentStep >= finderSteps.length;

  let rec = null;
  if (isComplete) {
    const key = answers.join("-");
    rec = recommendations[key] || {
      title: "VAT Dyes",
      desc: "Based on your inputs, VAT dyes are a versatile starting point. Please call Chirag K Shah directly.",
      tags: ["VAT Dyes", "Versatile", "All Cotton Types"],
    };
  }

  return (
    <div className="process-section" id="process">
      {/* FABRIC FINDER QUIZ */}
      <div className="finder-section" id="finder">
        <motion.div 
          className="finder-inner reveal visible"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="section-header">
            <span className="eyebrow">Quick Tool</span>
            <h2>Find Your Right Dye</h2>
            <p>Answer 2 quick questions — we'll recommend the best dye type for your application</p>
          </div>
          
          <div className="finder-progress">
            <div className="finder-progress-bar" style={{ width: `${pct}%` }}></div>
          </div>
          
          <div className="finder-step-row">
            {finderSteps.map((_, i) => (
              <div key={i} className={`finder-step-dot ${i < currentStep ? "done" : i === currentStep ? "active" : ""}`}>
                <div className="dot">{i < currentStep ? "✓" : i + 1}</div>
                Step {i + 1}
              </div>
            ))}
          </div>

          <div className="finder-card">
            <AnimatePresence mode="wait">
              {!isComplete ? (
                <motion.div 
                  key="question"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="finder-question">{finderSteps[currentStep].q}</div>
                  <div className="finder-hint">{finderSteps[currentStep].hint}</div>
                  <div className="finder-options">
                    {finderSteps[currentStep].opts.map((o, i) => (
                      <button key={i} className="finder-opt" onClick={() => handlePick(o.label)}>
                        <span className="finder-opt-icon">{o.icon}</span>
                        <span className="finder-opt-label">{o.label}</span>
                        <span className="finder-opt-sub">{o.sub}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="finder-result show"
                >
                  <div className="finder-result-label">Recommended Dye Type</div>
                  <div className="finder-result-title">{rec?.title}</div>
                  <div className="finder-result-desc">{rec?.desc}</div>
                  <div className="finder-result-tags">
                    {rec?.tags.map((t: string, idx: number) => (
                      <span key={idx} className="finder-result-tag">{t}</span>
                    ))}
                  </div>
                  <div className="finder-actions">
                    <button className="finder-btn" onClick={resetFinder}>Start Over</button>
                    <button className="finder-btn primary" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                      Call to Order
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* DID YOU KNOW */}
      <div className="dyk-section">
        <motion.div 
          className="dyk-inner reveal visible"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="section-header">
            <span className="eyebrow">Industry Knowledge</span>
            <h2>Did You Know?</h2>
            <p>Useful facts about textile dyes every buyer should know</p>
          </div>
          <div className="dyk-grid">
            <div className="dyk-card">
              <div className="dyk-num">01</div>
              <div className="dyk-title">VAT Dyes are the Oldest Industrial Dye</div>
              <div className="dyk-text">VAT dyes, including natural indigo, have been used for thousands of years...</div>
            </div>
            <div className="dyk-card">
              <div className="dyk-num">02</div>
              <div className="dyk-title">Naphthol Dyes Need Two Steps</div>
              <div className="dyk-text">Unlike most dyes, Naphthol (azoic) dyes are created directly on the fabric in two stages...</div>
            </div>
            <div className="dyk-card">
              <div className="dyk-num">03</div>
              <div className="dyk-title">Reactive Dyes Bond with the Fibre</div>
              <div className="dyk-text">Reactive dyes form a covalent chemical bond with the fabric molecule itself...</div>
            </div>
            <div className="dyk-card">
              <div className="dyk-num">04</div>
              <div className="dyk-title">"M.F" Means MicroFine</div>
              <div className="dyk-text">Products labelled M.F are highly refined, micro-pulverized blends engineered for superior solubility and consistency in dyeing...</div>
            </div>
            <div className="dyk-card">
              <div className="dyk-num">05</div>
              <div className="dyk-title">Base Dyes Are the First Half</div>
              <div className="dyk-text">Base dyes like Red GL Base and Blue B Base are not used alone — they are the coupling component...</div>
            </div>
            <div className="dyk-card">
              <div className="dyk-num">06</div>
              <div className="dyk-title">Wash Fastness is Rated 1–5</div>
              <div className="dyk-text">The textile industry rates colour fastness on a scale of 1 (poor) to 5 (excellent)...</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ORDER PROCESS */}
      <div className="process-section-inner">
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div className="section-header reveal visible" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <span className="eyebrow">Simple &amp; Reliable</span>
            <h2>How Ordering Works</h2>
            <p>A straightforward process from enquiry to delivery</p>
          </motion.div>
          <motion.div className="process-steps reveal visible" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="process-step">
              <div className="process-num">1</div>
              <div className="process-title">Call or Enquire</div>
              <div className="process-desc">Reach out to Chirag K Shah directly by phone. Discuss your shade requirements, quantities, and fabric type.</div>
            </div>
            <div className="process-step">
              <div className="process-num">2</div>
              <div className="process-title">Get a Quote</div>
              <div className="process-desc">Receive competitive bulk pricing tailored to your order. No middlemen — direct from the supplier.</div>
            </div>
            <div className="process-step">
              <div className="process-num">3</div>
              <div className="process-title">Confirm Order</div>
              <div className="process-desc">Finalise the dye type, quantity, and packaging. We ensure each batch meets consistent quality standards.</div>
            </div>
            <div className="process-step">
              <div className="process-num">4</div>
              <div className="process-title">Dispatch &amp; Deliver</div>
              <div className="process-desc">Your order is carefully packed and dispatched across India — to mills, processors, and fabric units nationwide.</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrderProcess;
