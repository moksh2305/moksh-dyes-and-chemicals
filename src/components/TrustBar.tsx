import React from 'react';

const tickerItems = [
  { label: "Chirag K Shah ", val: "Proprietor & Direct Contact" },
  { label: "Bulk Orders ", val: "All Quantities Welcome" },
  { label: "MicroFine ", val: "M.F Grade Available" },
  { label: "Quality Assured ", val: "Consistent Every Batch" },
  { label: "VAT Dyes ", val: "Premium Cellulosic Series" },
  { label: "Fast Shipping ", val: "Pan India Delivery" },
];

const TrustBar: React.FC = () => {
  const tickerHTML = [...tickerItems, ...tickerItems];

  return (
    <>
      <div className="color-strip"></div>
      {/* SCROLLING TICKER */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          {tickerHTML.map((t, idx) => (
            <div key={idx} className="ticker-item">
              <b>{t.label}</b>{t.val}
            </div>
          ))}
        </div>
      </div>
      <div className="trust-bar">
        <div className="trust-bar-inner">
          <div className="trust-item">
            <div className="trust-icon">✅</div>
            <div className="trust-text">
              <strong>Quality Assured</strong>Consistent grade on every batch
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">🚚</div>
            <div className="trust-text">
              <strong>Pan-India Delivery</strong>Mills &amp; units across India
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">📦</div>
            <div className="trust-text">
              <strong>Bulk Supply Ready</strong>No minimum order restriction
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">💬</div>
            <div className="trust-text">
              <strong>Direct Pricing</strong>Speak to Chirag K Shah directly
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrustBar;
