import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { products, tagLabels } from '../data/products';

export const generatePDFCatalog = () => {
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
