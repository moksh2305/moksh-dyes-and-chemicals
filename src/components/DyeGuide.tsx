import React from 'react';
import { motion } from 'framer-motion';

const DyeGuide: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants: any = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="dye-guide" id="dye-guide">
      <div className="dye-guide-inner">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <span className="eyebrow">Know Your Dyes</span>
          <h2>The Dye Category Guide</h2>
          <p>Understanding the right dye for your fabric and application</p>
        </motion.div>
        
        <motion.div 
          className="dye-guide-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* VAT */}
          <motion.div className="dye-card vat" variants={cardVariants}>
            <div className="dye-card-inner">
              <div className="dye-card-icon">🟢</div>
              <div className="dye-card-title">VAT Dyes</div>
              <div className="dye-card-subtitle">Cellulosic · Cotton · Linen</div>
              <div className="dye-card-desc">
                VAT dyes are insoluble pigments reduced to a soluble form for
                dyeing, then oxidised back on the fibre. They deliver
                exceptional wash fastness, light fastness, and are the gold
                standard for deep, long-lasting shades on cotton and cellulosic
                fabrics.
              </div>
              <div className="dye-card-tags">
                <span className="dye-tag">High Wash Fastness</span>
                <span className="dye-tag">Light Stable</span>
                <span className="dye-tag">Deep Shades</span>
                <span className="dye-tag">Cotton</span>
              </div>
            </div>
          </motion.div>

          {/* Naphthol */}
          <motion.div className="dye-card naph" variants={cardVariants}>
            <div className="dye-card-inner">
              <div className="dye-card-icon">🟠</div>
              <div className="dye-card-title">Naphthol Dyes</div>
              <div className="dye-card-subtitle">Azoic · Cotton · Bold Shades</div>
              <div className="dye-card-desc">
                Naphthol (azoic) dyes are a two-component system — a naphthol
                base coupling with a diazonium salt on the fibre to produce
                intense, bold colours. Ideal for brilliant reds, oranges, blues,
                and khakis with excellent dry-cleaning fastness.
              </div>
              <div className="dye-card-tags">
                <span className="dye-tag">Bold Colours</span>
                <span className="dye-tag">Azoic Chemistry</span>
                <span className="dye-tag">Dry-Clean Safe</span>
                <span className="dye-tag">Two-Part System</span>
              </div>
            </div>
          </motion.div>

          {/* Reactive */}
          <motion.div className="dye-card react" variants={cardVariants}>
            <div className="dye-card-inner">
              <div className="dye-card-icon">🔵</div>
              <div className="dye-card-title">Reactive Dyes</div>
              <div className="dye-card-subtitle">Cotton · Viscose · Silk</div>
              <div className="dye-card-desc">
                Reactive dyes form a covalent bond with the fibre, becoming part
                of the fabric itself. This makes them the most wash-fast option
                for brilliant, vibrant shades. Perfect for fashion textiles,
                home furnishings, and prints where colour clarity matters most.
              </div>
              <div className="dye-card-tags">
                <span className="dye-tag">Vibrant Shades</span>
                <span className="dye-tag">Covalent Bond</span>
                <span className="dye-tag">Best Wash-Fast</span>
                <span className="dye-tag">Silk / Viscose</span>
              </div>
            </div>
          </motion.div>

          {/* Base */}
          <motion.div className="dye-card base" variants={cardVariants}>
            <div className="dye-card-inner">
              <div className="dye-card-icon">🧪</div>
              <div className="dye-card-title">Base Dyes</div>
              <div className="dye-card-subtitle">Coupling · Azoic · Cotton</div>
              <div className="dye-card-desc">
                Base dyes are the coupling component in the azoic (Naphthol)
                dyeing system. Applied first to the fabric, they react with a
                diazonium salt on the fibre surface to develop bold, insoluble
                azo shades. Examples include Red GL Base and Blue B Base —
                essential for producing vivid, deep colours with excellent
                fastness on cotton.
              </div>
              <div className="dye-card-tags">
                <span className="dye-tag">Coupling Agent</span>
                <span className="dye-tag">Azoic System</span>
                <span className="dye-tag">Bold Shades</span>
                <span className="dye-tag">Cotton</span>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
};

export default DyeGuide;
