import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, MessageCircle, Share2 } from 'lucide-react';
import { products, tagLabels, tagClasses } from '../data/products';
import './OrderModule.css';

export interface CartItem {
  product: typeof products[0];
  quantity: string;
}

const ProductGrid: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const filteredProducts = filter === 'all' 
    ? products 
    : products.filter(p => p.cat === filter);

  const addToCart = (product: typeof products[0]) => {
    if (!cart.find(item => item.product.name === product.name)) {
      setCart([...cart, { product, quantity: '50 kg' }]);
    }
    setIsCartOpen(true);
  };

  const removeFromCart = (productName: string) => {
    setCart(cart.filter(item => item.product.name !== productName));
  };

  const updateQuantity = (productName: string, quantity: string) => {
    setCart(cart.map(item => 
      item.product.name === productName ? { ...item, quantity } : item
    ));
  };

  const generateWhatsAppLink = (phone: string) => {
    let text = "Hello Chirag Shah! I would like to place an order inquiry for:\n\n";
    cart.forEach(item => {
      text += `- ${item.quantity} of ${item.product.name}\n`;
    });
    text += "\nPlease let me know your best pricing and availability.";
    
    return `https://wa.me/91${phone}?text=${encodeURIComponent(text)}`;
  };

  const getShareLink = (productName: string) => {
    const text = `Sir, please check this dye from Moksh Dyes. It matches our requirements: ${productName}.\n\nView complete catalog at: https://moksh-dyes-and-chemicals.vercel.app`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  return (
    <div id="products">
      <div className="section-wrap">
        <div className="catalog-header-flex">
          <motion.div 
            className="section-header"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'left', marginBottom: '2rem' }}
          >
            <span className="eyebrow">Our Range</span>
            <h2 style={{ marginBottom: 0 }}>Product Collection</h2>
            <p>Filter by dye category and add products to your inquiry order</p>
          </motion.div>
        </div>

        <div className="tabs">
          <button className={`tab-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Products</button>
          <button className={`tab-btn ${filter === 'vat' ? 'active' : ''}`} onClick={() => setFilter('vat')}>VAT Dyes</button>
          <button className={`tab-btn ${filter === 'naphthol' ? 'active' : ''}`} onClick={() => setFilter('naphthol')}>Naphthol Dyes</button>
          <button className={`tab-btn ${filter === 'reactive' ? 'active' : ''}`} onClick={() => setFilter('reactive')}>Reactive Dyes</button>
          <button className={`tab-btn ${filter === 'base' ? 'active' : ''}`} onClick={() => setFilter('base')}>Base Dyes</button>
        </div>

        <motion.div layout className="product-grid" id="productGrid">
          <AnimatePresence>
            {filteredProducts.map((p, idx) => (
              <motion.div 
                key={p.name + idx}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="product-card"
                style={{ position: 'relative' }}
              >
                <div className="card-color-bar" style={{ background: p.color }}></div>
                <div className="card-body">
                  <div className="card-category">{tagLabels[p.cat]}</div>
                  <div className="card-dot" style={{ background: p.color }}></div>
                  <div className="card-name">{p.name}</div>
                  <div className="card-hover-info">{p.desc}</div>
                  <span className={`card-tag ${tagClasses[p.cat]}`}>{tagLabels[p.cat]}</span>
                  
                  {/* Floating Share Button */}
                  <motion.a 
                    href={getShareLink(p.name)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    whileHover={{ scale: 1.1, backgroundColor: '#25D366', color: '#fff', boxShadow: "0px 4px 10px rgba(37, 211, 102, 0.3)" }}
                    whileTap={{ scale: 0.9 }}
                    title="Share to Manager via WhatsApp"
                    style={{
                      position: 'absolute',
                      top: '20px',
                      right: '16px',
                      width: '32px',
                      height: '32px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#1a0f0a',
                      border: '1px solid rgba(184, 134, 11, 0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      zIndex: 10
                    }}
                  >
                    <Share2 size={14} />
                  </motion.a>

                  {/* Full Width Add to Order Button */}
                  <div style={{ marginTop: '18px' }}>
                    <motion.button 
                      onClick={() => addToCart(p)}
                      whileHover={{ scale: 1.02, backgroundColor: '#b8860b', color: '#1a0f0a' }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        background: 'transparent',
                        border: '1px solid #b8860b',
                        color: '#b8860b',
                        borderRadius: '6px',
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      + Add to Order
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.button 
            className="order-floating-btn"
            onClick={() => setIsCartOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ShoppingCart size={20} />
            <span>{cart.length} Items</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              className="order-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div 
              className="order-sidebar"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="order-header">
                <h3>Order Inquiry</h3>
                <button className="close-order" onClick={() => setIsCartOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="order-items">
                {cart.length === 0 ? (
                  <div className="empty-order">
                    <p>Your order list is empty.</p>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div className="order-item" key={idx}>
                      <div className="order-item-header">
                        <span className="order-item-name">{item.product.name}</span>
                        <button className="remove-item" onClick={() => removeFromCart(item.product.name)}>Remove</button>
                      </div>
                      <div className="order-item-qty">
                        <label>Quantity:</label>
                        <input 
                          type="text" 
                          value={item.quantity} 
                          onChange={(e) => updateQuantity(item.product.name, e.target.value)}
                          placeholder="e.g., 50 kg or 2 drums"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="order-footer">
                  <p style={{ marginBottom: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Send this order directly to our sales team via WhatsApp for pricing and confirmation:
                  </p>
                  <div className="wa-buttons">
                    <a 
                      href={generateWhatsAppLink('8369572124')} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="wa-btn"
                    >
                      <MessageCircle size={20} /> Send to Chirag (8369572124)
                    </a>
                    <a 
                      href={generateWhatsAppLink('8850351482')} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="wa-btn"
                    >
                      <MessageCircle size={20} /> Send to Team (8850351482)
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductGrid;
