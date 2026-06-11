import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, MessageCircle } from 'lucide-react';
import './ShoppingCart.css';

const products = [
  { name: "Black BB", cat: "vat", color: "#1a1a2e", desc: "Deep jet black VAT dye with excellent wash and light fastness." },
  { name: "Golden Yellow 3G", cat: "vat", color: "#f5c518", desc: "Bright golden yellow with high colour brilliance." },
  { name: "Golden Yellow GK", cat: "vat", color: "#e8b400", desc: "Warm golden shade with excellent build-up on cotton." },
  { name: "Golden Yellow RK", cat: "vat", color: "#d4a017", desc: "Rich golden yellow with a reddish undertone." },
  { name: "Magenta", cat: "vat", color: "#c2185b", desc: "Vivid magenta VAT dye for cellulosic fibres." },
  { name: "Green 2G", cat: "vat", color: "#2e7d32", desc: "Stable green VAT dye with good fastness properties." },
  { name: "VAT Pink R", cat: "vat", color: "#e91e8c", desc: "Soft pink VAT dye with consistent shade development." },
  { name: "Black AC", cat: "vat", color: "#0d0d0d", desc: "Alternative carbon black VAT dye for deep shades." },
  { name: "Olive Green B", cat: "vat", color: "#6b7c3b", desc: "Muted olive green for earthy textile applications." },
  { name: "Yellow 3RT", cat: "vat", color: "#fdd835", desc: "Brilliant vat yellow with high wash fastness." },
  { name: "Red GL Base", cat: "base", color: "#c62828", desc: "Naphthol coupling base for brilliant red shade development on cotton." },
  { name: "Blue B Base", cat: "base", color: "#1565c0", desc: "Coupling base component for developing deep, rich navy blue shades." },
  { name: "Brown 3G", cat: "vat", color: "#795548", desc: "Warm brown VAT dye with a greenish undertone." },
  { name: "Brown BR", cat: "vat", color: "#6d4c41", desc: "Reddish-brown VAT dye with strong fastness." },
  { name: "Golden Orange G", cat: "vat", color: "#e65100", desc: "Machine formulated golden orange VAT dye." },
  { name: "Brown RRD", cat: "vat", color: "#7b3f00", desc: "Deep reddish-brown with durable shade retention." },
  { name: "Brown 2G", cat: "vat", color: "#8d6e63", desc: "Greenish-brown VAT dye for medium shades." },
  { name: "Brown R", cat: "vat", color: "#a0522d", desc: "Classic reddish-brown VAT dye." },
  { name: "Orange RRT", cat: "vat", color: "#f57c00", desc: "VAT orange with reddish undertone." },
  { name: "VAT Brown 2G", cat: "vat", color: "#8b5e3c", desc: "Machine formulated VAT Brown 2G for even dyeing." },
  { name: "VAT Indigo Blue", cat: "vat", color: "#283593", desc: "Classic indigo blue — premium denim grade." },
  { name: "VAT Blue 4G", cat: "vat", color: "#1976d2", desc: "Bright blue VAT dye with a greenish tint." },
  { name: "Brown G", cat: "vat", color: "#78564a", desc: "Neutral warm brown, VAT quality." },
  { name: "Mehendi Green", cat: "vat", color: "#4a7c59", desc: "Traditional mehendi shade, vat based." },
  { name: "VAT Navy Blue VH", cat: "vat", color: "#0a1172", desc: "Very heavy navy blue VAT dye." },
  { name: "Purple Violet 4R", cat: "vat", color: "#6a1b9a", desc: "Deep purple vat dye for cotton." },
  { name: "Olive D", cat: "vat", color: "#7a7a2a", desc: "Distinct olive VAT dye shade." },
  { name: "Violet RR", cat: "vat", color: "#7b1fa2", desc: "Rich reddish-violet vat dye." },
  { name: "Pink R", cat: "vat", color: "#e91e63", desc: "Bright vat pink for cellulosic fibres." },
  { name: "Black CH", cat: "vat", color: "#212121", desc: "Cold hue black VAT dye." },
  { name: "Vat Grey 2B", cat: "vat", color: "#607d8b", desc: "Bluish grey VAT dye." },
  { name: "Blue 3R", cat: "vat", color: "#1e88e5", desc: "VAT blue with a reddish cast." },
  { name: "Red 6B", cat: "vat", color: "#e53935", desc: "Brilliant vat red dye." },
  { name: "Khakhi 2G", cat: "vat", color: "#9e8c6b", desc: "VAT khaki for military and casual textiles." },
  { name: "Dark Blue BO", cat: "vat", color: "#1a237e", desc: "Dark blue-on-black VAT dye." },
  { name: "VAT Blue BC", cat: "vat", color: "#0d47a1", desc: "Standard bright blue VAT carrier." },
  { name: "P Green", cat: "vat", color: "#388e3c", desc: "Pigment-grade green VAT dye." },
  { name: "Brown 2G", cat: "vat", color: "#8d6348", desc: "Machine formulated Brown 2G for even dyeing." },
];

const tagLabels: Record<string, string> = {
  vat: "VAT Dye",
  naphthol: "Naphthol Dye",
  reactive: "Reactive Dye",
  base: "Base Dye",
};

const tagClasses: Record<string, string> = {
  vat: "tag-vat",
  naphthol: "tag-naphthol",
  reactive: "tag-reactive",
  base: "tag-base",
};

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

  return (
    <div id="products">
      <div className="section-wrap">
        <motion.div 
          className="section-header"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="eyebrow">Our Range</span>
          <h2>Product Collection</h2>
          <p>Filter by dye category and add products to your inquiry order</p>
        </motion.div>

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
              >
                <div className="card-color-bar" style={{ background: p.color }}></div>
                <div className="card-body">
                  <div className="card-category">{tagLabels[p.cat]}</div>
                  <div className="card-dot" style={{ background: p.color }}></div>
                  <div className="card-name">{p.name}</div>
                  <div className="card-hover-info">{p.desc}</div>
                  <span className={`card-tag ${tagClasses[p.cat]}`}>{tagLabels[p.cat]}</span>
                  
                  <button className="add-to-cart-btn" onClick={() => addToCart(p)}>
                    + Add to Order
                  </button>
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
            className="cart-floating-btn"
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
              className="cart-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div 
              className="cart-sidebar"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="cart-header">
                <h3>Order Inquiry</h3>
                <button className="close-cart" onClick={() => setIsCartOpen(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className="cart-items">
                {cart.length === 0 ? (
                  <div className="empty-cart">
                    <p>Your order list is empty.</p>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div className="cart-item" key={idx}>
                      <div className="cart-item-header">
                        <span className="cart-item-name">{item.product.name}</span>
                        <button className="remove-item" onClick={() => removeFromCart(item.product.name)}>Remove</button>
                      </div>
                      <div className="cart-item-qty">
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
                <div className="cart-footer">
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
