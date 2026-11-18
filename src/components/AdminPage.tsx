import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Search,
  Cloud,
  CloudOff,
  RefreshCw,
  Save,
  Download,
  FileText,
  Settings,
  Check,
  Copy,
  AlertTriangle,
  Package,
  IndianRupee,
  Layers,
  X,
  RotateCcw,
  Undo2,
} from 'lucide-react';
import {
  CATEGORY_LABELS,
  UNIT_OPTIONS,
  GOOGLE_APPS_SCRIPT_CODE,
  createDefaultStockItems,
  loadLocalStockItems,
  saveLocalStockItems,
  getStockScriptUrl,
  setStockScriptUrl,
  getLastSyncTime,
  verifyLocalPasscode,
  fetchStockFromSheet,
  saveStockToSheet,
  formatINR,
  exportStockCSV,
  exportStockPDF,
} from '../utils/adminStock';
import type { StockItem, StockCategory, StockUnit } from '../utils/adminStock';
import './AdminPage.css';

const SESSION_PASS_KEY = 'moksh_admin_session_pass';

interface ToastState {
  message: string;
  isError?: boolean;
  undoItem?: { item: StockItem; index: number };
}

const AdminPage: React.FC = () => {
  // Auth state
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activePasscode, setActivePasscode] = useState('');
  const [passInput, setPassInput] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number>(0);

  // Cloud sync state
  const [scriptUrl, setScriptUrlState] = useState<string>(() => getStockScriptUrl());
  const [showLockUrlInput, setShowLockUrlInput] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasUnsavedCloud, setHasUnsavedCloud] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => getLastSyncTime());

  // Stock data state
  const [items, setItems] = useState<StockItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // UI state
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [modalUrlInput, setModalUrlInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const newlyAddedIdRef = useRef<string | null>(null);
  const autoSaveTimerRef = useRef<number | null>(null);
  const saveVersionRef = useRef<number>(0);
  const itemsRef = useRef<StockItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Set page title & noindex meta tag while on /admin
  useEffect(() => {
    const prevTitle = document.title;
    document.title = isUnlocked
      ? 'Stock & Price Manager | Moksh Dyes Admin'
      : 'Restricted Access';

    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    let createdMeta = false;
    const prevRobotsContent = robotsMeta?.content ?? '';

    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
      createdMeta = true;
    }
    robotsMeta.content = 'noindex, nofollow, noarchive';

    return () => {
      document.title = prevTitle;
      if (robotsMeta) {
        if (createdMeta) {
          robotsMeta.remove();
        } else {
          robotsMeta.content = prevRobotsContent;
        }
      }
    };
  }, [isUnlocked]);

  // Warn before closing tab if cloud changes are unsaved
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUnlocked && scriptUrl && hasUnsavedCloud) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isUnlocked, scriptUrl, hasUnsavedCloud]);

  // Auto-refresh from Google Sheets when returning to this tab on another device
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (
        document.visibilityState !== 'visible' ||
        !isUnlocked ||
        !scriptUrl ||
        !activePasscode ||
        hasUnsavedCloud ||
        isSyncing ||
        autoSaveTimerRef.current !== null
      ) {
        return;
      }

      const res = await fetchStockFromSheet(scriptUrl, activePasscode);
      if (res.ok && !res.isEmpty && res.items && res.items.length > 0) {
        // Only apply if user hasn't started editing while fetch was in flight
        if (autoSaveTimerRef.current === null) {
          setItems(res.items);
          saveLocalStockItems(res.items);
          if (res.syncedAt) setLastSyncedAt(res.syncedAt);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isUnlocked, scriptUrl, activePasscode, hasUnsavedCloud, isSyncing]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) window.clearTimeout(autoSaveTimerRef.current);
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Auto-restore session within the same browser tab
  useEffect(() => {
    const savedPass = sessionStorage.getItem(SESSION_PASS_KEY);
    if (!savedPass) return;

    const restoreSession = async () => {
      const url = getStockScriptUrl();
      if (url) {
        setAuthLoading(true);
        const res = await fetchStockFromSheet(url, savedPass);
        setAuthLoading(false);
        if (res.ok) {
          const loaded =
            res.isEmpty || !res.items || res.items.length === 0
              ? loadLocalStockItems()
              : res.items;
          setItems(loaded);
          saveLocalStockItems(loaded);
          setActivePasscode(savedPass);
          setIsUnlocked(true);
          if (res.syncedAt) setLastSyncedAt(res.syncedAt);
          setHasUnsavedCloud(Boolean(res.isEmpty));
          return;
        }
      } else {
        const valid = await verifyLocalPasscode(savedPass);
        if (valid) {
          setItems(loadLocalStockItems());
          setActivePasscode(savedPass);
          setIsUnlocked(true);
          return;
        }
      }
      sessionStorage.removeItem(SESSION_PASS_KEY);
    };

    void restoreSession();
  }, []);

  // Focus newly added item input
  useEffect(() => {
    if (newlyAddedIdRef.current) {
      const el = document.getElementById(`stock-name-${newlyAddedIdRef.current}`);
      if (el) {
        el.focus();
      }
      newlyAddedIdRef.current = null;
    }
  }, [items]);

  const showToast = (next: ToastState, durationMs = 4500) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToast(next);
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, durationMs);
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now < lockoutUntil) {
      const secs = Math.ceil((lockoutUntil - now) / 1000);
      setAuthError(`Too many failed attempts. Try again in ${secs}s.`);
      return;
    }

    const trimmedPass = passInput.trim();
    if (!trimmedPass) {
      setAuthError('Please enter your admin passcode.');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    const activeUrl = scriptUrl.trim();
    if (activeUrl) {
      setStockScriptUrl(activeUrl);
      const res = await fetchStockFromSheet(activeUrl, trimmedPass);
      setAuthLoading(false);

      if (!res.ok) {
        const nextFails = failedAttempts + 1;
        setFailedAttempts(nextFails);
        if (nextFails >= 5) {
          setLockoutUntil(Date.now() + 30000);
          setFailedAttempts(0);
          setAuthError('Too many failed attempts. Locked for 30 seconds.');
        } else {
          setAuthError(res.error || 'Incorrect passcode.');
        }
        return;
      }

      const loaded =
        res.isEmpty || !res.items || res.items.length === 0
          ? loadLocalStockItems()
          : res.items;
      setItems(loaded);
      saveLocalStockItems(loaded);
      setActivePasscode(trimmedPass);
      sessionStorage.setItem(SESSION_PASS_KEY, trimmedPass);
      setIsUnlocked(true);
      setPassInput('');
      setFailedAttempts(0);
      if (res.syncedAt) setLastSyncedAt(res.syncedAt);
      setHasUnsavedCloud(Boolean(res.isEmpty));

      if (res.isEmpty) {
        showToast({
          message: 'Connected to empty Google Sheet. Click "Save to Sheet" to upload your catalog.',
        });
      }
      return;
    }

    // Local mode verification
    const isValid = await verifyLocalPasscode(trimmedPass);
    setAuthLoading(false);

    if (!isValid) {
      const nextFails = failedAttempts + 1;
      setFailedAttempts(nextFails);
      if (nextFails >= 5) {
        setLockoutUntil(Date.now() + 30000);
        setFailedAttempts(0);
        setAuthError('Too many failed attempts. Locked for 30 seconds.');
      } else {
        setAuthError('Incorrect passcode. Access denied.');
      }
      return;
    }

    setItems(loadLocalStockItems());
    setActivePasscode(trimmedPass);
    sessionStorage.setItem(SESSION_PASS_KEY, trimmedPass);
    setIsUnlocked(true);
    setPassInput('');
    setFailedAttempts(0);
  };

  const handleLock = () => {
    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    sessionStorage.removeItem(SESSION_PASS_KEY);
    setIsUnlocked(false);
    setActivePasscode('');
    setItems([]);
    setPassInput('');
    setAuthError(null);
  };

  const commitItems = (updater: (prev: StockItem[]) => StockItem[]) => {
    setItems((prev) => {
      const next = updater(prev);
      itemsRef.current = next;
      saveLocalStockItems(next);
      return next;
    });

    if (scriptUrl && activePasscode) {
      setHasUnsavedCloud(true);
      const version = ++saveVersionRef.current;

      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
      }

      // Auto-save to Google Sheets 1.5s after the last edit so changes reflect everywhere
      autoSaveTimerRef.current = window.setTimeout(async () => {
        autoSaveTimerRef.current = null;
        setIsSyncing(true);
        const res = await saveStockToSheet(scriptUrl, activePasscode, itemsRef.current);
        setIsSyncing(false);

        if (res.ok) {
          if (saveVersionRef.current === version) {
            setHasUnsavedCloud(false);
          }
          if (res.syncedAt) setLastSyncedAt(res.syncedAt);
        } else {
          showToast(
            { message: res.error || 'Auto-sync failed. Click "Save to Sheet" to retry.', isError: true },
            5000
          );
        }
      }, 1500);
    }
  };

  const handleUpdateField = <K extends keyof StockItem>(
    id: string,
    field: K,
    value: StockItem[K]
  ) => {
    const now = new Date().toISOString();
    commitItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value, updatedAt: now } : item
      )
    );
  };

  const handleAdjustStock = (id: string, delta: number) => {
    const now = new Date().toISOString();
    commitItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, stock: Math.max(0, Number((item.stock + delta).toFixed(2))), updatedAt: now }
          : item
      )
    );
  };

  const handleAddRow = () => {
    const newId = `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newItem: StockItem = {
      id: newId,
      name: '',
      category: categoryFilter !== 'all' && categoryFilter !== 'low'
        ? (categoryFilter as StockCategory)
        : 'vat',
      color: '#b8860b',
      stock: 0,
      unit: 'kg',
      price: 0,
      notes: '',
      updatedAt: new Date().toISOString(),
    };

    // Ensure the new row is visible even if a search query was active
    if (searchQuery.trim()) setSearchQuery('');
    if (categoryFilter === 'low') setCategoryFilter('all');

    newlyAddedIdRef.current = newId;
    commitItems((prev) => [newItem, ...prev]);
    showToast({ message: 'New row added at top of list.' }, 2500);
  };

  const handleDeleteRow = (id: string) => {
    const idx = items.findIndex((it) => it.id === id);
    if (idx === -1) return;
    const removed = items[idx];

    commitItems((prev) => prev.filter((it) => it.id !== id));
    showToast(
      {
        message: `Deleted "${removed.name || 'Untitled item'}"`,
        undoItem: { item: removed, index: idx },
      },
      6000
    );
  };

  const handleUndoDelete = () => {
    if (!toast?.undoItem) return;
    const { item, index } = toast.undoItem;
    commitItems((prev) => {
      const copy = [...prev];
      const insertAt = Math.min(index, copy.length);
      copy.splice(insertAt, 0, item);
      return copy;
    });
    setToast(null);
  };

  const handleSaveToCloud = async () => {
    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    saveLocalStockItems(items);
    if (!scriptUrl) {
      showToast({ message: 'Saved locally in this browser. Connect Google Sheets to sync across devices.' });
      return;
    }

    const version = ++saveVersionRef.current;
    setIsSyncing(true);
    const res = await saveStockToSheet(scriptUrl, activePasscode, items);
    setIsSyncing(false);

    if (res.ok) {
      if (saveVersionRef.current === version) {
        setHasUnsavedCloud(false);
      }
      if (res.syncedAt) setLastSyncedAt(res.syncedAt);
      showToast({ message: `Saved & synced ${items.length} items everywhere!` });
    } else {
      showToast({ message: res.error || 'Failed to sync to Google Sheets.', isError: true }, 6000);
    }
  };

  const handlePullFromCloud = async () => {
    if (!scriptUrl) return;
    if (
      hasUnsavedCloud &&
      !window.confirm('You have unsaved edits. Pull latest data from Google Sheets and overwrite local changes?')
    ) {
      return;
    }

    setIsSyncing(true);
    const res = await fetchStockFromSheet(scriptUrl, activePasscode);
    setIsSyncing(false);

    if (res.ok) {
      if (res.isEmpty || !res.items || res.items.length === 0) {
        showToast({ message: 'Google Sheet is currently empty. Click "Save to Sheet" to upload your rows.' });
      } else {
        setItems(res.items);
        saveLocalStockItems(res.items);
        setHasUnsavedCloud(false);
        if (res.syncedAt) setLastSyncedAt(res.syncedAt);
        showToast({ message: `Loaded ${res.items.length} items from Google Sheets.` });
      }
    } else {
      showToast({ message: res.error || 'Could not refresh from Google Sheets.', isError: true }, 6000);
    }
  };

  const openSyncModal = () => {
    setModalUrlInput(scriptUrl);
    setCopiedCode(false);
    setShowSyncModal(true);
  };

  const handleSaveSyncUrl = async () => {
    const cleaned = modalUrlInput.trim();
    if (!cleaned) {
      setStockScriptUrl('');
      setScriptUrlState('');
      setHasUnsavedCloud(false);
      setShowSyncModal(false);
      showToast({ message: 'Disconnected Google Sheets. Using local browser storage.' });
      return;
    }

    setIsSyncing(true);
    const res = await fetchStockFromSheet(cleaned, activePasscode);
    setIsSyncing(false);

    if (!res.ok) {
      showToast(
        {
          message:
            res.error ||
            'Connection failed. Verify the Web App URL and ensure ADMIN_PASSCODE matches your current passcode.',
          isError: true,
        },
        7000
      );
      return;
    }

    setStockScriptUrl(cleaned);
    setScriptUrlState(cleaned);
    setShowSyncModal(false);

    if (res.isEmpty || !res.items || res.items.length === 0) {
      // Automatically upload existing items to the newly connected empty sheet
      setIsSyncing(true);
      const saveRes = await saveStockToSheet(cleaned, activePasscode, items);
      setIsSyncing(false);
      if (saveRes.ok) {
        setHasUnsavedCloud(false);
        if (saveRes.syncedAt) setLastSyncedAt(saveRes.syncedAt);
        showToast({ message: `Connected & uploaded ${items.length} items to Google Sheets!` });
      } else {
        setHasUnsavedCloud(true);
        showToast({ message: 'Connected to sheet. Click "Save to Sheet" to upload items.' });
      }
    } else {
      setItems(res.items);
      saveLocalStockItems(res.items);
      setHasUnsavedCloud(false);
      if (res.syncedAt) setLastSyncedAt(res.syncedAt);
      showToast({ message: `Connected! Loaded ${res.items.length} items from Google Sheets.` });
    }
  };

  const handleCopyScriptCode = async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      showToast({ message: 'Could not copy automatically. Please select and copy the code.', isError: true });
    }
  };

  const handleResetCatalog = () => {
    if (
      !window.confirm(
        'Reset stock list to the default 36 catalog products? Your current stock numbers and prices will be cleared.'
      )
    ) {
      return;
    }
    const defaults = createDefaultStockItems();
    commitItems(() => defaults);
    showToast({ message: 'Reset to default 36 catalog items.' });
  };

  // Filtered rows & KPI calculations
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (categoryFilter === 'low') {
        if (item.stock > 10) return false;
      } else if (categoryFilter !== 'all') {
        if (item.category !== categoryFilter) return false;
      }

      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q) ||
        CATEGORY_LABELS[item.category].toLowerCase().includes(q)
      );
    });
  }, [items, searchQuery, categoryFilter]);

  const stats = useMemo(() => {
    let totalQty = 0;
    let totalValue = 0;
    let outOfStock = 0;
    let lowStock = 0;

    for (const item of items) {
      totalQty += item.stock;
      totalValue += item.stock * item.price;
      if (item.stock <= 0) outOfStock++;
      else if (item.stock <= 10) lowStock++;
    }

    return {
      totalItems: items.length,
      totalQty,
      totalValue,
      outOfStock,
      lowStock,
      attentionCount: outOfStock + lowStock,
    };
  }, [items]);

  // ── LOCK SCREEN VIEW ──
  if (!isUnlocked) {
    return (
      <div className="admin-shell">
        <div className="admin-lock-screen">
          <div className="admin-lock-card">
            <div className="admin-lock-accent" />
            <div className="admin-lock-icon">
              <Lock size={26} />
            </div>
            <h1 className="admin-lock-title">Restricted Admin</h1>
            <p className="admin-lock-subtitle">
              Authorized personnel only. Enter your secret passcode to manage inventory &amp; pricing.
            </p>

            <form onSubmit={handleUnlock}>
              <label className="admin-field-label" htmlFor="admin-passcode-input">
                Admin Passcode
              </label>
              <div className="admin-pass-wrap">
                <input
                  id="admin-passcode-input"
                  type={showPass ? 'text' : 'password'}
                  className="admin-pass-input"
                  placeholder="Enter secret passcode"
                  value={passInput}
                  onChange={(e) => setPassInput(e.target.value)}
                  autoComplete="current-password"
                  autoFocus
                />
                <button
                  type="button"
                  className="admin-eye-btn"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                className="admin-unlock-btn"
                disabled={authLoading}
              >
                {authLoading ? (
                  <>
                    <RefreshCw size={17} className="admin-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Unlock size={17} />
                    Unlock Stock Manager
                  </>
                )}
              </button>
            </form>

            {authError && (
              <div className="admin-lock-error" role="alert">
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>{authError}</span>
              </div>
            )}

            <div className="admin-lock-sync-toggle">
              <button
                type="button"
                className="admin-text-link"
                onClick={() => setShowLockUrlInput((v) => !v)}
              >
                {scriptUrl
                  ? 'Google Sheet Sync Connected (Edit URL)'
                  : 'Setting up on a new device? Link Google Sheet URL'}
              </button>

              {showLockUrlInput && (
                <div className="admin-lock-script-box">
                  <label
                    className="admin-field-label"
                    htmlFor="lock-script-url"
                    style={{ marginTop: 10 }}
                  >
                    Google Apps Script Web App URL
                  </label>
                  <input
                    id="lock-script-url"
                    type="url"
                    className="admin-pass-input"
                    style={{ padding: '10px 12px', fontSize: '0.84rem' }}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={scriptUrl}
                    onChange={(e) => setScriptUrlState(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── UNLOCKED STOCK MANAGER VIEW ──
  return (
    <div className="admin-shell">
      {/* TOP BAR */}
      <header className="admin-header">
        <div className="admin-brand">
          <div className="admin-brand-badge">
            <Package size={20} />
          </div>
          <div>
            <h1>Moksh Stock &amp; Price Manager</h1>
            <span>Private Inventory Console</span>
          </div>
        </div>

        <div className="admin-header-actions">
          {scriptUrl ? (
            <span
              className={`admin-status-pill ${hasUnsavedCloud ? 'unsaved' : 'synced'}`}
              title={
                lastSyncedAt
                  ? `Last synced: ${new Date(lastSyncedAt).toLocaleString('en-IN')}`
                  : 'Connected to Google Sheets'
              }
            >
              <Cloud size={14} />
              {hasUnsavedCloud ? 'Unsaved Changes' : 'Synced with Sheet'}
            </span>
          ) : (
            <span className="admin-status-pill local">
              <CloudOff size={14} />
              Local Browser Only
            </span>
          )}

          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleSaveToCloud}
            disabled={isSyncing}
          >
            {isSyncing ? <RefreshCw size={15} className="admin-spin" /> : <Save size={15} />}
            {scriptUrl ? 'Save to Sheet' : 'Save'}
          </button>

          {scriptUrl && (
            <button
              type="button"
              className="admin-btn"
              onClick={handlePullFromCloud}
              disabled={isSyncing}
              title="Pull latest rows from Google Sheets"
            >
              <RefreshCw size={15} className={isSyncing ? 'admin-spin' : ''} />
              Refresh
            </button>
          )}

          <button
            type="button"
            className="admin-btn"
            onClick={openSyncModal}
            title="Configure Google Sheets cloud sync"
          >
            <Settings size={15} />
            Sheet Sync
          </button>

          <button
            type="button"
            className="admin-btn"
            onClick={() => exportStockCSV(items)}
            title="Download CSV for Excel / Sheets"
          >
            <Download size={15} />
            CSV
          </button>

          <button
            type="button"
            className="admin-btn"
            onClick={() => exportStockPDF(items)}
            title="Download Confidential Stock PDF"
          >
            <FileText size={15} />
            PDF
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-danger"
            onClick={handleLock}
            title="Lock admin page"
          >
            <Lock size={15} />
            Lock
          </button>
        </div>
      </header>

      <main className="admin-main">
        {/* CLOUD SYNC SETUP PROMPT WHEN NOT CONNECTED YET */}
        {!scriptUrl && (
          <div className="admin-cloud-banner">
            <div className="admin-cloud-banner-text">
              <Cloud size={18} style={{ color: '#e8c96a', flexShrink: 0 }} />
              <span>
                Your edits are currently saved in this browser only. Connect your Google Sheet in 2 minutes to sync live across your phone and laptop.
              </span>
            </div>
            <button type="button" className="admin-btn admin-btn-primary" onClick={openSyncModal}>
              <Settings size={15} />
              Connect Google Sheet
            </button>
          </div>
        )}

        {/* KPI SUMMARY */}
        <section className="admin-kpi-grid" aria-label="Inventory summary">
          <div className="admin-kpi-card">
            <div className="admin-kpi-label">
              <Layers size={14} /> Total Products
            </div>
            <div className="admin-kpi-value">{stats.totalItems}</div>
            <div className="admin-kpi-sub">Active rows in stock list</div>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-label">
              <Package size={14} /> Total Stock Qty
            </div>
            <div className="admin-kpi-value">
              {stats.totalQty.toLocaleString('en-IN')}
            </div>
            <div className="admin-kpi-sub">Combined units across items</div>
          </div>

          <div className="admin-kpi-card">
            <div className="admin-kpi-label">
              <IndianRupee size={14} /> Inventory Value
            </div>
            <div className="admin-kpi-value gold">{formatINR(stats.totalValue)}</div>
            <div className="admin-kpi-sub">Stock Qty × Unit Price</div>
          </div>

          <div
            className="admin-kpi-card clickable"
            onClick={() =>
              setCategoryFilter((prev) => (prev === 'low' ? 'all' : 'low'))
            }
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setCategoryFilter((prev) => (prev === 'low' ? 'all' : 'low'));
              }
            }}
          >
            <div className="admin-kpi-label">
              <AlertTriangle size={14} /> Low / Out of Stock
            </div>
            <div className="admin-kpi-value warn">{stats.attentionCount}</div>
            <div className="admin-kpi-sub">
              {stats.outOfStock} at zero · {stats.lowStock} low (≤10)
            </div>
          </div>
        </section>

        {/* SEARCH, FILTERS & ADD ITEM */}
        <section className="admin-toolbar">
          <div className="admin-search-box">
            <Search size={16} className="admin-search-icon" />
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search item name, category, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="admin-filter-pills">
            {[
              { id: 'all', label: `All (${items.length})` },
              { id: 'vat', label: 'VAT' },
              { id: 'base', label: 'Base' },
              { id: 'naphthol', label: 'Naphthol' },
              { id: 'reactive', label: 'Reactive' },
              { id: 'chemical', label: 'Chemical' },
              { id: 'other', label: 'Other' },
              { id: 'low', label: `Low Stock (${stats.attentionCount})` },
            ].map((pill) => (
              <button
                key={pill.id}
                type="button"
                className={`admin-pill ${categoryFilter === pill.id ? 'active' : ''}`}
                onClick={() => setCategoryFilter(pill.id)}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleAddRow}
          >
            <Plus size={16} />
            Add New Row
          </button>
        </section>

        {/* DESKTOP EDITABLE TABLE */}
        <div className="admin-table-card">
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'center' }}>#</th>
                  <th>Shade</th>
                  <th>Item Name</th>
                  <th>Category</th>
                  <th>Stock Qty</th>
                  <th>Unit</th>
                  <th style={{ textAlign: 'right' }}>Price (₹ / Unit)</th>
                  <th style={{ textAlign: 'right' }}>Total Value</th>
                  <th>Notes / Batch</th>
                  <th style={{ textAlign: 'center' }}>Del</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="admin-empty-state">
                      No matching stock items found. Click <strong>“Add New Row”</strong> or clear your filter.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={item.stock <= 0 ? 'out-of-stock' : ''}
                    >
                      <td className="admin-row-num">{idx + 1}</td>
                      <td>
                        <input
                          type="color"
                          className="admin-color-picker"
                          value={item.color}
                          onChange={(e) =>
                            handleUpdateField(item.id, 'color', e.target.value)
                          }
                          title="Pick shade color"
                          aria-label={`Shade color for ${item.name || 'item'}`}
                        />
                      </td>
                      <td>
                        <input
                          id={`stock-name-${item.id}`}
                          type="text"
                          className="admin-cell-input name-input"
                          placeholder="Enter item name..."
                          value={item.name}
                          onChange={(e) =>
                            handleUpdateField(item.id, 'name', e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <select
                          className="admin-cell-select"
                          value={item.category}
                          onChange={(e) =>
                            handleUpdateField(
                              item.id,
                              'category',
                              e.target.value as StockCategory
                            )
                          }
                          aria-label={`Category for ${item.name || 'item'}`}
                        >
                          {(Object.keys(CATEGORY_LABELS) as StockCategory[]).map((cat) => (
                            <option key={cat} value={cat}>
                              {CATEGORY_LABELS[cat]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <div className="admin-stock-cell">
                          <button
                            type="button"
                            className="admin-step-btn"
                            onClick={() => handleAdjustStock(item.id, -1)}
                            title="Decrease stock by 1"
                            aria-label="Decrease stock"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            className="admin-cell-input num-input"
                            value={item.stock === 0 ? '' : item.stock}
                            placeholder="0"
                            onChange={(e) => {
                              const parsed = parseFloat(e.target.value);
                              handleUpdateField(
                                item.id,
                                'stock',
                                Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
                              );
                            }}
                            aria-label={`Stock quantity for ${item.name || 'item'}`}
                          />
                          <button
                            type="button"
                            className="admin-step-btn"
                            onClick={() => handleAdjustStock(item.id, 1)}
                            title="Increase stock by 1"
                            aria-label="Increase stock"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td>
                        <select
                          className="admin-cell-select unit-select"
                          value={item.unit}
                          onChange={(e) =>
                            handleUpdateField(
                              item.id,
                              'unit',
                              e.target.value as StockUnit
                            )
                          }
                          aria-label={`Unit for ${item.name || 'item'}`}
                        >
                          {UNIT_OPTIONS.map((unit) => (
                            <option key={unit} value={unit}>
                              {unit}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          className="admin-cell-input price-input"
                          value={item.price === 0 ? '' : item.price}
                          placeholder="0.00"
                          onChange={(e) => {
                            const parsed = parseFloat(e.target.value);
                            handleUpdateField(
                              item.id,
                              'price',
                              Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
                            );
                          }}
                          aria-label={`Price for ${item.name || 'item'}`}
                        />
                      </td>
                      <td className="admin-total-cell">
                        {formatINR(item.stock * item.price)}
                      </td>
                      <td>
                        <input
                          type="text"
                          className="admin-cell-input notes-input"
                          placeholder="Batch / godown note..."
                          value={item.notes}
                          onChange={(e) =>
                            handleUpdateField(item.id, 'notes', e.target.value)
                          }
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="admin-delete-btn"
                          onClick={() => handleDeleteRow(item.id)}
                          title={`Delete ${item.name || 'row'}`}
                          aria-label={`Delete ${item.name || 'row'}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE CARD EDITOR */}
        <div className="admin-mobile-list">
          {filteredItems.length === 0 ? (
            <div className="admin-mobile-card admin-empty-state">
              No matching stock items found. Tap <strong>“Add New Row”</strong> to create one.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="admin-mobile-card">
                <div className="admin-mobile-card-top">
                  <input
                    type="color"
                    className="admin-color-picker"
                    value={item.color}
                    onChange={(e) =>
                      handleUpdateField(item.id, 'color', e.target.value)
                    }
                    aria-label="Shade color"
                  />
                  <input
                    type="text"
                    className="admin-cell-input name-input"
                    style={{ minWidth: 0 }}
                    placeholder="Item name..."
                    value={item.name}
                    onChange={(e) =>
                      handleUpdateField(item.id, 'name', e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="admin-delete-btn"
                    onClick={() => handleDeleteRow(item.id)}
                    aria-label="Delete item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="admin-mobile-grid">
                  <div className="admin-mobile-field">
                    <label>Category</label>
                    <select
                      className="admin-cell-select"
                      style={{ minWidth: 0 }}
                      value={item.category}
                      onChange={(e) =>
                        handleUpdateField(
                          item.id,
                          'category',
                          e.target.value as StockCategory
                        )
                      }
                    >
                      {(Object.keys(CATEGORY_LABELS) as StockCategory[]).map((cat) => (
                        <option key={cat} value={cat}>
                          {CATEGORY_LABELS[cat]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-mobile-field">
                    <label>Unit</label>
                    <select
                      className="admin-cell-select unit-select"
                      value={item.unit}
                      onChange={(e) =>
                        handleUpdateField(item.id, 'unit', e.target.value as StockUnit)
                      }
                    >
                      {UNIT_OPTIONS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-mobile-field">
                    <label>Stock Qty</label>
                    <div className="admin-stock-cell">
                      <button
                        type="button"
                        className="admin-step-btn"
                        onClick={() => handleAdjustStock(item.id, -1)}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        className="admin-cell-input num-input"
                        value={item.stock === 0 ? '' : item.stock}
                        placeholder="0"
                        onChange={(e) => {
                          const parsed = parseFloat(e.target.value);
                          handleUpdateField(
                            item.id,
                            'stock',
                            Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
                          );
                        }}
                      />
                      <button
                        type="button"
                        className="admin-step-btn"
                        onClick={() => handleAdjustStock(item.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="admin-mobile-field">
                    <label>Price (₹ / {item.unit})</label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="admin-cell-input price-input"
                      value={item.price === 0 ? '' : item.price}
                      placeholder="0.00"
                      onChange={(e) => {
                        const parsed = parseFloat(e.target.value);
                        handleUpdateField(
                          item.id,
                          'price',
                          Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
                        );
                      }}
                    />
                  </div>
                </div>

                <div className="admin-mobile-field">
                  <label>Notes / Batch</label>
                  <input
                    type="text"
                    className="admin-cell-input notes-input"
                    style={{ minWidth: 0 }}
                    placeholder="Batch / godown note..."
                    value={item.notes}
                    onChange={(e) =>
                      handleUpdateField(item.id, 'notes', e.target.value)
                    }
                  />
                </div>

                <div className="admin-mobile-footer">
                  <span style={{ fontSize: '0.8rem', color: '#9e8f7b' }}>Row Value</span>
                  <strong style={{ color: '#e8c96a', fontSize: '1rem' }}>
                    {formatINR(item.stock * item.price)}
                  </strong>
                </div>
              </div>
            ))
          )}
        </div>

        {/* BOTTOM FOOTER BAR */}
        <div className="admin-footer-bar">
          <span>
            Showing <strong>{filteredItems.length}</strong> of <strong>{items.length}</strong> items
            {lastSyncedAt && scriptUrl
              ? ` · Last synced ${new Date(lastSyncedAt).toLocaleString('en-IN')}`
              : ''}
          </span>

          <button
            type="button"
            className="admin-text-link"
            onClick={handleResetCatalog}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            <RotateCcw size={13} />
            Reset to Default 36 Catalog Items
          </button>
        </div>
      </main>

      {/* GOOGLE SHEETS CLOUD SYNC MODAL */}
      {showSyncModal && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setShowSyncModal(false)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Google Sheets Cloud Sync</h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setShowSyncModal(false)}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#c5b49b', lineHeight: 1.55 }}>
              Connect a private Google Sheet so every stock quantity &amp; price change syncs seamlessly between your phone and laptop.
            </p>

            <ol className="admin-steps-list">
              <li>
                Create a new Google Sheet (e.g. <strong>Moksh Dyes Stock List</strong>).
              </li>
              <li>
                Open <strong>Extensions → Apps Script</strong>, delete existing code, and paste the script below.
              </li>
              <li>
                Update <code>ADMIN_PASSCODE</code> at the top of the script to match your passcode (default: <code>moksh@2026</code>).
              </li>
              <li>
                Click <strong>Deploy → New deployment → Web app</strong>. Set <strong>Execute as: Me</strong> and <strong>Who has access: Anyone</strong>, then deploy.
              </li>
              <li>
                Copy the generated <strong>Web App URL</strong> and paste it below.
              </li>
            </ol>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span className="admin-field-label" style={{ margin: 0 }}>
                Apps Script Code (Code.gs)
              </span>
              <button type="button" className="admin-btn" onClick={handleCopyScriptCode}>
                {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                {copiedCode ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            <pre className="admin-code-box">{GOOGLE_APPS_SCRIPT_CODE}</pre>

            <label className="admin-field-label" htmlFor="modal-script-url-input">
              Google Apps Script Web App URL
            </label>
            <input
              id="modal-script-url-input"
              type="url"
              className="admin-pass-input"
              style={{ padding: '11px 14px', fontSize: '0.88rem' }}
              placeholder="https://script.google.com/macros/s/.../exec"
              value={modalUrlInput}
              onChange={(e) => setModalUrlInput(e.target.value)}
            />
            <p style={{ fontSize: '0.78rem', color: '#9e8f7b', marginTop: 8, lineHeight: 1.5 }}>
              Tip: Add this same URL in Vercel → Settings → Environment Variables as{' '}
              <code>VITE_STOCK_SCRIPT_URL</code> so it auto-connects on every new device.
            </p>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-btn"
                onClick={() => setShowSyncModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleSaveSyncUrl}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <>
                    <RefreshCw size={15} className="admin-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Cloud size={15} />
                    Save &amp; Connect
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST / UNDO NOTIFICATION */}
      {toast && (
        <div className={`admin-toast ${toast.isError ? 'error' : ''}`} role="status">
          <span>{toast.message}</span>
          {toast.undoItem && (
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              style={{ padding: '5px 10px', fontSize: '0.78rem' }}
              onClick={handleUndoDelete}
            >
              <Undo2 size={14} />
              Undo
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
