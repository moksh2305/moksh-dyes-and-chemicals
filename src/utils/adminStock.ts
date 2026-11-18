import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { products } from '../data/products';

export type StockCategory = 'vat' | 'base' | 'naphthol' | 'reactive' | 'chemical' | 'other';
export type StockUnit = 'kg' | 'drums' | 'bags' | 'L' | 'pcs';

export interface StockItem {
  id: string;
  name: string;
  category: StockCategory;
  color: string;
  stock: number;
  unit: StockUnit;
  price: number;
  notes: string;
  updatedAt: string;
}

export const CATEGORY_LABELS: Record<StockCategory, string> = {
  vat: 'VAT Dye',
  base: 'Base Dye',
  naphthol: 'Naphthol Dye',
  reactive: 'Reactive Dye',
  chemical: 'Chemical',
  other: 'Other',
};

export const UNIT_OPTIONS: StockUnit[] = ['kg', 'drums', 'bags', 'L', 'pcs'];

const STORAGE_ITEMS_KEY = 'moksh_admin_stock_items_v1';
const STORAGE_SCRIPT_URL_KEY = 'moksh_admin_stock_script_url_v1';
const STORAGE_LAST_SYNC_KEY = 'moksh_admin_stock_last_sync_v1';

// SHA-256 of default local passcode ("moksh@2026")
// Override in Vercel Environment Variables via VITE_ADMIN_PASSCODE
const DEFAULT_PASSCODE_SHA256 =
  '7b7833dab7b9c8fff336bbf31b0dc090ef1ab0c1ace524490dc35b3a73481aba';

export const createDefaultStockItems = (): StockItem[] => {
  const now = new Date().toISOString();
  return products.map((p, idx) => ({
    id: `prod-${idx + 1}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: p.name,
    category: (['vat', 'base', 'naphthol', 'reactive'].includes(p.cat)
      ? p.cat
      : 'other') as StockCategory,
    color: p.color || '#b8860b',
    stock: 0,
    unit: 'kg',
    price: 0,
    notes: '',
    updatedAt: now,
  }));
};

export const loadLocalStockItems = (): StockItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_ITEMS_KEY);
    if (!raw) return createDefaultStockItems();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return createDefaultStockItems();
    return parsed.map((item, idx) => ({
      id: String(item.id || `item-${idx + 1}`),
      name: String(item.name ?? ''),
      category: (Object.keys(CATEGORY_LABELS).includes(item.category)
        ? item.category
        : 'vat') as StockCategory,
      color: String(item.color || '#b8860b'),
      stock: Number.isFinite(Number(item.stock)) ? Number(item.stock) : 0,
      unit: (UNIT_OPTIONS.includes(item.unit) ? item.unit : 'kg') as StockUnit,
      price: Number.isFinite(Number(item.price)) ? Number(item.price) : 0,
      notes: String(item.notes ?? ''),
      updatedAt: String(item.updatedAt || new Date().toISOString()),
    }));
  } catch {
    return createDefaultStockItems();
  }
};

export const saveLocalStockItems = (items: StockItem[]): void => {
  try {
    localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items));
  } catch {
    // Ignore quota errors
  }
};

export const getStockScriptUrl = (): string => {
  try {
    const localUrl = localStorage.getItem(STORAGE_SCRIPT_URL_KEY);
    if (localUrl && localUrl.trim()) return localUrl.trim();
  } catch {
    // Ignore storage read errors
  }
  const envUrl = import.meta.env.VITE_STOCK_SCRIPT_URL;
  return typeof envUrl === 'string' ? envUrl.trim() : '';
};

export const setStockScriptUrl = (url: string): void => {
  try {
    const trimmed = url.trim();
    if (trimmed) {
      localStorage.setItem(STORAGE_SCRIPT_URL_KEY, trimmed);
    } else {
      localStorage.removeItem(STORAGE_SCRIPT_URL_KEY);
    }
  } catch {
    // Ignore storage errors
  }
};

export const getLastSyncTime = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_LAST_SYNC_KEY);
  } catch {
    return null;
  }
};

export const setLastSyncTime = (iso: string): void => {
  try {
    localStorage.setItem(STORAGE_LAST_SYNC_KEY, iso);
  } catch {
    // Ignore storage errors
  }
};

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const verifyLocalPasscode = async (passcode: string): Promise<boolean> => {
  const envPass = import.meta.env.VITE_ADMIN_PASSCODE;
  if (typeof envPass === 'string' && envPass.trim().length > 0) {
    return passcode === envPass.trim();
  }
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const digest = await sha256Hex(passcode);
    return digest === DEFAULT_PASSCODE_SHA256;
  }
  // Fallback for non-secure HTTP LAN dev environments where crypto.subtle is unavailable
  return btoa(passcode) === 'bW9rc2hAMjAyNg==';
};

export interface CloudSyncResult {
  ok: boolean;
  items?: StockItem[];
  isEmpty?: boolean;
  syncedAt?: string;
  error?: string;
}

export const fetchStockFromSheet = async (
  scriptUrl: string,
  passcode: string
): Promise<CloudSyncResult> => {
  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'get',
        passcode,
      }),
    });

    if (!response.ok) {
      return { ok: false, error: `Server returned HTTP ${response.status}` };
    }

    const data = await response.json();
    if (!data || !data.ok) {
      return { ok: false, error: data?.error || 'Authentication failed or invalid script response.' };
    }

    const rawItems = Array.isArray(data.items) ? data.items : [];
    const items: StockItem[] = rawItems.map((item: Record<string, unknown>, idx: number) => ({
      id: String(item.id || `sheet-${idx + 1}`),
      name: String(item.name ?? ''),
      category: (Object.keys(CATEGORY_LABELS).includes(String(item.category))
        ? String(item.category)
        : 'vat') as StockCategory,
      color: String(item.color || '#b8860b'),
      stock: Number.isFinite(Number(item.stock)) ? Number(item.stock) : 0,
      unit: (UNIT_OPTIONS.includes(String(item.unit) as StockUnit)
        ? String(item.unit)
        : 'kg') as StockUnit,
      price: Number.isFinite(Number(item.price)) ? Number(item.price) : 0,
      notes: String(item.notes ?? ''),
      updatedAt: String(item.updatedAt || new Date().toISOString()),
    }));

    return {
      ok: true,
      items,
      isEmpty: Boolean(data.isEmpty) || items.length === 0,
      syncedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? `Could not connect to Google Sheet: ${err.message}`
          : 'Could not connect to Google Sheet.',
    };
  }
};

export const saveStockToSheet = async (
  scriptUrl: string,
  passcode: string,
  items: StockItem[]
): Promise<CloudSyncResult> => {
  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'save',
        passcode,
        items,
      }),
    });

    if (!response.ok) {
      return { ok: false, error: `Server returned HTTP ${response.status}` };
    }

    const data = await response.json();
    if (!data || !data.ok) {
      return { ok: false, error: data?.error || 'Failed to save to Google Sheet.' };
    }

    const syncedAt = String(data.syncedAt || new Date().toISOString());
    setLastSyncTime(syncedAt);
    return { ok: true, syncedAt };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? `Sync failed: ${err.message}`
          : 'Sync failed. Please check your Google Apps Script URL.',
    };
  }
};

export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
};

export const exportStockCSV = (items: StockItem[]): void => {
  const headers = [
    'Item Name',
    'Category',
    'Stock Qty',
    'Unit',
    'Price (INR)',
    'Total Value (INR)',
    'Notes',
    'Last Updated',
  ];

  const escapeCsv = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = items.map((item) => [
    escapeCsv(item.name),
    escapeCsv(CATEGORY_LABELS[item.category]),
    escapeCsv(item.stock),
    escapeCsv(item.unit),
    escapeCsv(item.price),
    escapeCsv(item.stock * item.price),
    escapeCsv(item.notes),
    escapeCsv(item.updatedAt ? new Date(item.updatedAt).toLocaleString('en-IN') : ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `Moksh_Dyes_Stock_List_${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportStockPDF = (items: StockItem[]): void => {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  doc.setFontSize(20);
  doc.setTextColor(184, 134, 11);
  doc.text('Moksh Dyes & Chemicals', 14, 18);

  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text(`Confidential Stock & Price List  —  ${dateStr}`, 14, 26);

  const totalValue = items.reduce((sum, it) => sum + it.stock * it.price, 0);
  const totalQty = items.reduce((sum, it) => sum + it.stock, 0);

  doc.setFontSize(9.5);
  doc.setTextColor(90, 90, 90);
  doc.text(
    `Total Items: ${items.length}   |   Total Qty: ${totalQty.toLocaleString('en-IN')}   |   Inventory Value: Rs. ${totalValue.toLocaleString('en-IN')}`,
    14,
    33
  );

  const tableData = items.map((item, index) => [
    String(index + 1),
    item.name || '—',
    CATEGORY_LABELS[item.category],
    `${item.stock} ${item.unit}`,
    `Rs. ${item.price.toLocaleString('en-IN')}`,
    `Rs. ${(item.stock * item.price).toLocaleString('en-IN')}`,
    item.notes || '',
  ]);

  autoTable(doc, {
    startY: 39,
    head: [['#', 'Item Name', 'Category', 'Stock', 'Price/Unit', 'Total Value', 'Notes']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [26, 15, 10], textColor: [232, 201, 106] },
    styles: { fontSize: 8.5, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { fontStyle: 'bold', cellWidth: 40 },
      2: { cellWidth: 26 },
      3: { cellWidth: 22 },
      4: { cellWidth: 26 },
      5: { cellWidth: 30 },
      6: { cellWidth: 'auto' },
    },
  });

  const fileDate = new Date().toISOString().slice(0, 10);
  doc.save(`Moksh_Dyes_Stock_Report_${fileDate}.pdf`);
};

export const GOOGLE_APPS_SCRIPT_CODE = `// ============================================================
// MOKSH DYES & CHEMICALS - ADMIN STOCK SYNC (Google Apps Script)
// ============================================================
// SETUP STEPS:
// 1. Create a new Google Sheet (e.g., "Moksh Dyes Stock List")
// 2. Click Extensions -> Apps Script
// 3. Delete existing code, paste ALL of this code, and press Save
// 4. Change ADMIN_PASSCODE below to your secret passcode
// 5. Click Deploy -> New deployment -> Select type: Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 6. Click Deploy, authorize permissions, and copy the Web App URL
// 7. Paste the Web App URL into /admin -> Cloud Sync Settings
//    (And optionally add VITE_STOCK_SCRIPT_URL in Vercel Env Vars
//     so it connects automatically on both phone and laptop!)
// ============================================================

const ADMIN_PASSCODE = "moksh@2026"; // <-- Change this to your secret passcode
const SHEET_NAME = "StockList";

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const header = ["ID", "Item Name", "Category", "Color", "Stock Qty", "Unit", "Price (INR)", "Total Value (INR)", "Notes", "Updated At"];
    sheet.appendRow(header);
    sheet.getRange(1, 1, 1, header.length).setFontWeight("bold").setBackground("#1a0f0a").setFontColor("#e8c96a");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function readAllItems() {
  const sheet = getOrCreateSheet();
  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) {
    return { ok: true, items: [], isEmpty: true };
  }
  const items = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    if (!row[0] && !row[1]) continue;
    items.push({
      id: String(row[0] || ("item-" + i)),
      name: String(row[1] || ""),
      category: String(row[2] || "vat"),
      color: String(row[3] || "#b8860b"),
      stock: Number(row[4]) || 0,
      unit: String(row[5] || "kg"),
      price: Number(row[6]) || 0,
      notes: String(row[8] || ""),
      updatedAt: String(row[9] || "")
    });
  }
  return { ok: true, items: items, isEmpty: items.length === 0 };
}

function writeAllItems(items) {
  const sheet = getOrCreateSheet();
  sheet.clearContents();
  const header = ["ID", "Item Name", "Category", "Color", "Stock Qty", "Unit", "Price (INR)", "Total Value (INR)", "Notes", "Updated At"];
  const rows = [header];
  const now = new Date().toISOString();

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const stock = Number(it.stock) || 0;
    const price = Number(it.price) || 0;
    rows.push([
      String(it.id || ("item-" + (i + 1))),
      String(it.name || ""),
      String(it.category || "vat"),
      String(it.color || "#b8860b"),
      stock,
      String(it.unit || "kg"),
      price,
      stock * price,
      String(it.notes || ""),
      String(it.updatedAt || now)
    ]);
  }

  sheet.getRange(1, 1, rows.length, header.length).setValues(rows);
  sheet.getRange(1, 1, 1, header.length).setFontWeight("bold").setBackground("#1a0f0a").setFontColor("#e8c96a");
  sheet.setFrozenRows(1);
  return { ok: true, count: items.length, syncedAt: now };
}

function doGet(e) {
  try {
    const passcode = (e && e.parameter && e.parameter.passcode) ? String(e.parameter.passcode) : "";
    if (passcode !== ADMIN_PASSCODE) {
      return jsonResponse({ ok: false, error: "Invalid passcode" });
    }
    return jsonResponse(readAllItems());
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    if (!payload || String(payload.passcode || "") !== ADMIN_PASSCODE) {
      return jsonResponse({ ok: false, error: "Invalid passcode" });
    }

    if (payload.action === "get") {
      return jsonResponse(readAllItems());
    }

    if (payload.action === "save") {
      const items = Array.isArray(payload.items) ? payload.items : [];
      return jsonResponse(writeAllItems(items));
    }

    return jsonResponse({ ok: false, error: "Unknown action" });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}`;
