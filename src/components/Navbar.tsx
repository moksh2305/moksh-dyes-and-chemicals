import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    closeMenu();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <nav>
        <a className="nav-logo" href="#" onClick={(e) => scrollToSection(e, 'top')}>
          Moksh <span>Dyes & Chemicals</span>
        </a>
        <ul className="nav-links">
          <li><a href="#products" onClick={(e) => scrollToSection(e, 'products')}>Products</a></li>
          <li><a href="#dye-guide" onClick={(e) => scrollToSection(e, 'dye-guide')}>Dye Guide</a></li>
          <li><a href="#about" onClick={(e) => scrollToSection(e, 'about')}>About</a></li>
          <li><a href="#contact" className="nav-cta" onClick={(e) => scrollToSection(e, 'contact')}>Order Now</a></li>
        </ul>
        <button 
          className={`hamburger ${isOpen ? 'open' : ''}`} 
          onClick={toggleMenu} 
          aria-label="Toggle menu"
        >
          <span></span><span></span><span></span>
        </button>
      </nav>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={`mobile-nav ${isOpen ? 'open' : ''}`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            style={{ display: 'flex' }}
          >
            <div className="mobile-nav-section">
              <div className="mobile-nav-label">Browse Products</div>
              <a href="#products" onClick={(e) => scrollToSection(e, 'products')}>
                <span className="mobile-nav-icon">🎨</span>All Products
              </a>
              <a href="#products" onClick={(e) => scrollToSection(e, 'products')}>
                <span className="mobile-nav-icon">🟢</span>VAT Dyes
              </a>
              <a href="#products" onClick={(e) => scrollToSection(e, 'products')}>
                <span className="mobile-nav-icon">🟠</span>Naphthol Dyes
              </a>
              <a href="#products" onClick={(e) => scrollToSection(e, 'products')}>
                <span className="mobile-nav-icon">🔵</span>Reactive Dyes
              </a>
            </div>
            <div className="mobile-nav-section">
              <div className="mobile-nav-label">Learn</div>
              <a href="#dye-guide" onClick={(e) => scrollToSection(e, 'dye-guide')}>
                <span className="mobile-nav-icon">📖</span>Dye Guide
              </a>
              <a href="#process" onClick={(e) => scrollToSection(e, 'process')}>
                <span className="mobile-nav-icon">⚙️</span>How It Works
              </a>
              <a href="#faq" onClick={(e) => scrollToSection(e, 'faq')}>
                <span className="mobile-nav-icon">❓</span>FAQ
              </a>
            </div>
            <div className="mobile-nav-section">
              <div className="mobile-nav-label">Company</div>
              <a href="#about" onClick={(e) => scrollToSection(e, 'about')}>
                <span className="mobile-nav-icon">🏭</span>About Us
              </a>
              <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')}>
                <span className="mobile-nav-icon">📞</span>Contact
              </a>
            </div>
            <div className="mobile-nav-section">
              <div className="mobile-nav-label">Call to Order</div>
              <div className="mobile-contact-block">
                <p>Speak directly for pricing & bulk enquiries</p>
                <a href="tel:+918850351482"><span>☎</span>+91 88503 51482</a>
                <a href="tel:+919820596646"><span>☎</span>+91 98205 96646</a>
                <a href="tel:+918369572124"><span>☎</span>+91 83695 72124</a>
              </div>
            </div>
            <div className="mobile-owner">
              <p>Proprietor</p>
              <strong>Chirag K Shah</strong>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
