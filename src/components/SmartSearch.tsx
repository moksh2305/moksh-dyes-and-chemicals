import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, CheckCircle2, XCircle, ArrowRight, Loader2 } from 'lucide-react';
import { products } from '../data/products';

interface SearchAnalysis {
  category: string;
  reasoning: string;
  recommendedDyes: typeof products;
  pros: string[];
  cons: string[];
}

const analyzeQuery = (query: string): SearchAnalysis | null => {
  const q = query.toLowerCase();
  
  if (q.trim() === '') return null;

  // Rule 1: High fastness, cotton, uniform, deep shades, black
  if (q.includes('cotton') || q.includes('fastness') || q.includes('uniform') || q.includes('vat') || q.includes('deep black')) {
    return {
      category: "VAT Dyes",
      reasoning: "Based on your need for cellulosic fibres and extreme durability/fastness, VAT dyes are the industry standard.",
      recommendedDyes: products.filter(p => p.cat === 'vat').slice(0, 4),
      pros: [
        "Exceptional wash and light fastness",
        "Withstands industrial laundering and bleaching",
        "Deep, rich, and permanent shade development"
      ],
      cons: [
        "Requires a vatting (reduction/oxidation) process",
        "Insoluble in water until chemically reduced"
      ]
    };
  }
  
  // Rule 2: Bright, vibrant, reactive
  if (q.includes('bright') || q.includes('vibrant') || q.includes('reactive') || q.includes('silk') || q.includes('viscose')) {
    return {
      category: "Reactive Dyes",
      reasoning: "For brilliant, vibrant colors that chemically bond with the fibre, Reactive dyes are the optimal choice.",
      recommendedDyes: products.filter(p => p.cat === 'reactive').slice(0, 4),
      pros: [
        "Brilliant and vivid color palette",
        "Forms a permanent covalent bond with the fabric",
        "Relatively simple application process"
      ],
      cons: [
        "Requires precise temperature control",
        "Potential for hydrolysis (wasted dye) if not managed well"
      ]
    };
  }

  // Rule 3: Naphthol / Base / Bold Red / Deep Maroon
  if (q.includes('naphthol') || q.includes('base') || q.includes('red') || q.includes('maroon') || q.includes('azoic')) {
    return {
      category: "Naphthol & Base Dyes",
      reasoning: "Azoic coupling (Naphthol + Base) yields incredibly deep, bold shades like reds and maroons that are highly cost-effective.",
      recommendedDyes: products.filter(p => p.cat === 'base' || p.cat === 'naphthol').slice(0, 4),
      pros: [
        "Produces unparalleled deep, brilliant reds and oranges",
        "Excellent cost-to-yield ratio for heavy shades",
        "Very good wash fastness on cotton"
      ],
      cons: [
        "Two-step application process (padding then developing)",
        "Poor fastness to rubbing if not washed off properly"
      ]
    };
  }

  // Fallback
  return {
    category: "General Recommendation",
    reasoning: "Based on your query, we recommend reviewing our premium catalog for the exact match.",
    recommendedDyes: products.slice(0, 4),
    pros: [
      "Consistent batch-to-batch quality",
      "M.F (MicroFine) grades available for even dyeing",
      "Pan-India shipping network"
    ],
    cons: [
      "Please contact our experts for a precise lab-matched formulation"
    ]
  };
};

const SmartSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SearchAnalysis | null>(null);

  const handleSearch = () => {
    if (!query.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);

    // Simulate AI thinking time for premium feel
    setTimeout(() => {
      setResult(analyzeQuery(query));
      setIsAnalyzing(false);
    }, 1200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="smart-search-section">
      <div className="smart-search-inner">
        <motion.div 
          className="smart-search-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2><Sparkles size={24} style={{ color: 'var(--gold)' }} /> Intelligent Dye Expert</h2>
          <p>Describe your fabric, desired colour, or technical requirements, and our system will recommend the optimal dye category.</p>
        </motion.div>

        <div className="smart-search-box">
          <input 
            type="text" 
            placeholder="e.g., 'Need deep black for cotton with high wash fastness'" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSearch} disabled={isAnalyzing}>
            {isAnalyzing ? <Loader2 size={20} className="spinner" /> : <Search size={20} />}
            <span>Analyze</span>
          </button>
        </div>

        <AnimatePresence>
          {result && !isAnalyzing && (
            <motion.div 
              className="smart-search-results"
              initial={{ opacity: 0, height: 0, y: 20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="result-main-card">
                <div className="result-category">
                  <h3>Recommended: <span>{result.category}</span></h3>
                  <p>{result.reasoning}</p>
                </div>

                <div className="result-analysis-grid">
                  <div className="analysis-box pros">
                    <h4>Advantages</h4>
                    <ul>
                      {result.pros.map((pro, idx) => (
                        <li key={idx}><CheckCircle2 size={16} className="icon" /> {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="analysis-box cons">
                    <h4>Technical Considerations</h4>
                    <ul>
                      {result.cons.map((con, idx) => (
                        <li key={idx}><XCircle size={16} className="icon" /> {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="result-products">
                  <h4>Top Matches from our Catalog</h4>
                  <div className="result-products-grid">
                    {result.recommendedDyes.map((dye, idx) => (
                      <div key={idx} className="result-dye-card">
                        <div className="color-swatch" style={{ background: dye.color }}></div>
                        <div className="dye-info">
                          <span className="dye-name">{dye.name}</span>
                        </div>
                        <a href="#products" className="view-link"><ArrowRight size={16} /></a>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default SmartSearch;
