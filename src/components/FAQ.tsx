import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqData = [
  {
    q: "What types of dyes do you supply?",
    a: "We supply three primary categories — VAT dyes (ideal for cotton and cellulosic fibres), Naphthol/Azoic dyes (for bold, two-component shade development), and Reactive dyes (for vibrant, wash-fast results on cotton, viscose, and silk). We stock 35+ variants across all three categories."
  },
  {
    q: "Is there a minimum order quantity?",
    a: "We work with customers of all scales — from processing units placing small test orders to large mills needing regular bulk supply. Contact Chirag K Shah directly to discuss the quantities that suit your requirement and get the best pricing accordingly."
  },
  {
    q: "Do you supply across India?",
    a: "Yes. Moksh Dyes & Chemicals supplies to textile mills, fabric manufacturers, and processing units across India. We are based in Mumbai, Maharashtra, and dispatch orders nationally through reliable logistics partners."
  },
  {
    q: "How do I know which dye to use for my fabric?",
    a: "The Dye Category Guide on this page gives a clear overview. As a rule of thumb: use VAT dyes for cotton requiring high fastness; Naphthol dyes for bold shades on cotton; Reactive dyes for vibrant colours on cotton, viscose, or silk. When in doubt, call us."
  },
  {
    q: "What does 'M.F' mean in some product names?",
    a: "'M.F' stands for Machine Formulated — these are standardised, pre-blended formulations designed for consistency in automated or large-scale dyeing processes. They ensure even shade distribution across the batch with minimal manual adjustment."
  },
  {
    q: "What are your working hours?",
    a: "We are available Monday to Saturday, 11 AM to 7 PM. You can reach us on any of the three numbers listed in the Contact section. For urgent inquiries, WhatsApp messages are also welcome."
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-section" id="faq">
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="eyebrow">Common Questions</span>
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know before placing an order</p>
        </motion.div>
      </div>

      <div className="faq-list">
        {faqData.map((faq, index) => (
          <motion.div 
            key={index}
            className={`faq-item ${openIndex === index ? 'open' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="faq-question" onClick={() => toggleFaq(index)}>
              {faq.q}
              <span className="faq-icon">{openIndex === index ? '−' : '+'}</span>
            </div>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div 
                  className="faq-answer-wrapper"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="faq-answer" style={{ display: 'block', paddingTop: 0 }}>
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
