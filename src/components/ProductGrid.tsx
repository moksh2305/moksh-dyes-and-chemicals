import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, MessageCircle, Download, Share2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './OrderModule.css';

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

  const getShareLink = (productName: string) => {
    const text = `Sir, please check this dye from Moksh Dyes. It matches our requirements: ${productName}.\n\nView complete catalog at: https://moksh-dyes-and-chemicals.vercel.app`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  const generatePDFCatalog = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(184, 134, 11); // Gold color
    doc.text('Moksh Dyes & Chemicals', 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text('Premium Product Catalog', 14, 30);
    
    doc.setFontSize(10);
    doc.text('Website: https://moksh-dyes-and-chemicals.vercel.app', 14, 38);
    doc.text('Phone: +91 8369572124 / 8850351482', 14, 44);

    const tableData = products.map(p => [
      p.name,
      tagLabels[p.cat],
      p.desc
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Product Name', 'Category', 'Description']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [26, 15, 10], textColor: [255, 255, 255] },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 'auto' }
      }
    });
    
    doc.save('Moksh_Dyes_Catalog.pdf');
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

          <motion.button 
            onClick={generatePDFCatalog}
            whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(184, 134, 11, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'linear-gradient(135deg, #1a0f0a 0%, #2c2016 100%)',
              color: '#e8c96a',
              border: '1px solid rgba(184, 134, 11, 0.4)',
              padding: '12px 28px',
              borderRadius: '8px',
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 600,
              fontSize: '0.95rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
          >
            <Download size={20} />
            Download PDF Catalog
          </motion.button>
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
              >
                <div className="card-color-bar" style={{ background: p.color }}></div>
                <div className="card-body">
                  <div className="card-category">{tagLabels[p.cat]}</div>
                  <div className="card-dot" style={{ background: p.color }}></div>
                  <div className="card-name">{p.name}</div>
                  <div className="card-hover-info">{p.desc}</div>
                  <span className={`card-tag ${tagClasses[p.cat]}`}>{tagLabels[p.cat]}</span>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '18px', alignItems: 'stretch' }}>
                    <motion.button 
                      onClick={() => addToCart(p)}
                      whileHover={{ scale: 1.02, backgroundColor: '#b8860b', color: '#1a0f0a' }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        flex: 1,
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
                        alignItems: 'center'
                      }}
                    >
                      + Add to Order
                    </motion.button>
                    <motion.a 
                      href={getShareLink(p.name)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      whileHover={{ scale: 1.05, backgroundColor: '#25D366', borderColor: '#25D366', color: '#fff', boxShadow: "0px 8px 15px rgba(37, 211, 102, 0.3)" }}
                      whileTap={{ scale: 0.95 }}
                      title="Share to Manager via WhatsApp"
                      style={{
                        padding: '0 16px',
                        background: 'transparent',
                        color: '#2c2016',
                        border: '1px solid rgba(184, 134, 11, 0.3)',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        textDecoration: 'none'
                      }}
                    >
                      <Share2 size={18} />
                    </motion.a>
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
