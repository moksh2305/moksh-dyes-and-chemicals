import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer>
      <p>
        <strong>Moksh Dyes &amp; Chemicals</strong> &nbsp;·&nbsp; Mumbai,
        Maharashtra, India
      </p>
      <p>
        VAT Dyes &nbsp;|&nbsp; Naphthol Dyes &nbsp;|&nbsp; Reactive Dyes
        &nbsp;|&nbsp; Base Dyes &nbsp;|&nbsp; Bulk Supply
      </p>
      <div className="footer-proprietor">
        Proprietor &mdash; <span>Chirag K Shah</span>
      </div>
      <p style={{ marginTop: '0.8rem', fontSize: '0.72rem', opacity: 0.5 }}>
        © {new Date().getFullYear()} Moksh Dyes and Chemicals. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
