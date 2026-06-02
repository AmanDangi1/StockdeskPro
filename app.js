
// =====================================================
//  StockDesk Pro — Main React Application
//  Uses React 18 CDN + Firebase Firestore (module)
// =====================================================

const { useState, useEffect, useCallback, useMemo, useRef } = React;

// ── Helpers ──────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);
const fmtQty = (n) => new Intl.NumberFormat('en-IN').format(n || 0);
const fmtDate = (ts) => {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const avatarColors = ['linear-gradient(135deg,#4f8ef7,#8b5cf6)','linear-gradient(135deg,#22c55e,#14b8a6)','linear-gradient(135deg,#f59e0b,#ef4444)','linear-gradient(135deg,#ec4899,#8b5cf6)','linear-gradient(135deg,#14b8a6,#4f8ef7)'];
const getAvatarColor = (name) => avatarColors[(name || '').charCodeAt(0) % avatarColors.length];
const initials = (name) => (name || '??').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
const genId = () => Math.random().toString(36).slice(2, 8).toUpperCase();

// ── Toast Notification ────────────────────────────────
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`} onClick={() => removeToast(t.id)}>
          <span className="toast-icon">{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  const removeToast = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), []);
  return { toasts, addToast, removeToast };
}

// ── Firebase Hook ─────────────────────────────────────
function useFirestore() {
  const [ready, setReady] = useState(!!window.__firebaseReady);
  useEffect(() => {
    if (!window.__firebaseReady) {
      const h = () => setReady(true);
      window.addEventListener('firebase-ready', h);
      return () => window.removeEventListener('firebase-ready', h);
    }
  }, []);
  return { db: window.__firebaseDB, methods: window.__firebaseMethods, ready };
}

// ── Local Demo Mode (when Firebase not configured) ────
const DEMO_CLIENTS = [
  { id: 'C001', name: 'Rajesh Patel', phone: '9876543210', email: 'rajesh@example.com', pan: 'ABCDE1234F', status: 'active', brokerageRate: 0.5, notes: 'Regular trader', cNo: '01' },
  { id: 'C002', name: 'Priya Sharma', phone: '9123456789', email: 'priya@example.com', pan: 'FGHIJ5678K', status: 'active', brokerageRate: 0.3, notes: 'Long-term investor', cNo: '02' },
  { id: 'C003', name: 'Amit Mehta', phone: '9988776655', email: 'amit@example.com', pan: 'KLMNO9012P', status: 'active', brokerageRate: 0.4, notes: '', cNo: '03' },
];
const now = () => ({ toDate: () => new Date() });
const DEMO_TRADES = [
  { id: 'T001', clientId: 'C001', clientName: 'Rajesh Patel', stockSymbol: 'RELIANCE', stockName: 'Reliance Industries', type: 'buy', quantity: 50, rate: 2450.50, brokerage: 612.63, totalValue: 122525, createdAt: now() },
  { id: 'T002', clientId: 'C002', clientName: 'Priya Sharma', stockSymbol: 'TCS', stockName: 'Tata Consultancy Services', type: 'buy', quantity: 20, rate: 3890.00, brokerage: 233.40, totalValue: 77800, createdAt: now() },
  { id: 'T003', clientId: 'C001', clientName: 'Rajesh Patel', stockSymbol: 'HDFC', stockName: 'HDFC Bank', type: 'sell', quantity: 30, rate: 1670.00, brokerage: 250.50, totalValue: 50100, createdAt: now() },
  { id: 'T004', clientId: 'C003', clientName: 'Amit Mehta', stockSymbol: 'INFY', stockName: 'Infosys Ltd', type: 'buy', quantity: 100, rate: 1435.25, brokerage: 574.10, totalValue: 143525, createdAt: now() },
  { id: 'T005', clientId: 'C002', clientName: 'Priya Sharma', stockSymbol: 'WIPRO', stockName: 'Wipro Ltd', type: 'sell', quantity: 75, rate: 468.35, brokerage: 105.38, totalValue: 35126.25, createdAt: now() },
];

// ── Sidebar ───────────────────────────────────────────
const NAV = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'clients', icon: '👥', label: 'Clients' },
  { id: 'trade', icon: '📈', label: 'New Trade' },
  { id: 'trades', icon: '📋', label: 'Trade History' },
  { id: 'portfolio', icon: '💼', label: 'Portfolio' },
  { id: 'brokerage', icon: '💰', label: 'Brokerage' },
];

function Sidebar({ active, setPage, tradeCount }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>📈 StockDesk</h1>
        <p>Broker Management System</p>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {NAV.map(n => (
          <div key={n.id} className={`nav-item ${active === n.id ? 'active' : ''}`} onClick={() => setPage(n.id)}>
            <span className="nav-icon">{n.icon}</span>
            <span>{n.label}</span>
            {n.id === 'trades' && tradeCount > 0 && <span className="nav-badge">{tradeCount}</span>}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <strong>● LIVE</strong> · Demo Mode<br />
        <span style={{ fontSize: '0.7rem' }}>Connect Firebase to persist data</span>
      </div>
    </aside>
  );
}

// ── Dashboard ─────────────────────────────────────────
function Dashboard({ clients, trades, setPage }) {
  const totalBrokerage = trades.reduce((s, t) => s + (t.brokerage || 0), 0);
  const totalBuyVal = trades.filter(t => t.type === 'buy').reduce((s, t) => s + (t.totalValue || 0), 0);
  const totalSellVal = trades.filter(t => t.type === 'sell').reduce((s, t) => s + (t.totalValue || 0), 0);
  const recent = [...trades].sort((a, b) => {
    const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
    const db2 = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
    return db2 - da;
  }).slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <div><h2>Dashboard 📊</h2><p>Overview of your brokerage activity</p></div>
        <button className="btn btn-primary" onClick={() => setPage('trade')}>＋ New Trade</button>
      </div>

      <div className="stats-grid">
        <StatCard color="blue" icon="👥" value={clients.length} label="Total Clients" change="+2 this month" up />
        <StatCard color="green" icon="📈" value={trades.filter(t=>t.type==='buy').length} label="Buy Orders" />
        <StatCard color="red" icon="📉" value={trades.filter(t=>t.type==='sell').length} label="Sell Orders" />
        <StatCard color="amber" icon="💰" value={fmt(totalBrokerage)} label="Total Brokerage Earned" change="This period" up />
        <StatCard color="purple" icon="🛒" value={fmt(totalBuyVal)} label="Total Buy Value" />
        <StatCard color="teal" icon="💵" value={fmt(totalSellVal)} label="Total Sell Value" />
      </div>

      <div className="card">
        <div className="card-header">
          <div><div className="card-title">Recent Trades</div><div className="card-subtitle">Last 5 transactions</div></div>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage('trades')}>View All →</button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <TradeTable trades={recent} compact />
        </div>
      </div>
    </div>
  );
}

function StatCard({ color, icon, value, label, change, up }) {
  return (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {change && <div className={`stat-change ${up ? 'up' : 'down'}`}>{up ? '▲' : '▼'} {change}</div>}
    </div>
  );
}

// ── Trade Table ───────────────────────────────────────
function TradeTable({ trades, compact, onDelete }) {
  if (!trades.length) return (
    <div className="empty-state">
      <div className="empty-icon">📋</div>
      <h3>No trades found</h3>
      <p>Add a new trade to get started</p>
    </div>
  );
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Client</th><th>Stock</th><th>Type</th>
            <th>Qty</th><th>Rate</th><th>Total Value</th>
            <th>Brokerage</th>
            {!compact && <th>Date</th>}
            {onDelete && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {trades.map(t => (
            <tr key={t.id}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: getAvatarColor(t.clientName), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>
                    {initials(t.clientName)}
                  </div>
                  <span style={{ fontWeight: 600 }}>{t.clientName}</span>
                </div>
              </td>
              <td>
                <div style={{ fontWeight: 700 }}>{t.stockSymbol}</div>
                {!compact && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.stockName}</div>}
              </td>
              <td><span className={`badge badge-${t.type}`}>{t.type === 'buy' ? '▲' : '▼'} {t.type.toUpperCase()}</span></td>
              <td style={{ fontWeight: 600 }}>{fmtQty(t.quantity)}</td>
              <td>{fmt(t.rate)}</td>
              <td style={{ fontWeight: 700 }}>{fmt(t.totalValue)}</td>
              <td style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{fmt(t.brokerage)}</td>
              {!compact && <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtDate(t.createdAt)}</td>}
              {onDelete && (
                <td>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-red)' }} onClick={() => onDelete(t.id)}>🗑</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Clients Page ──────────────────────────────────────
function ClientsPage({ clients, trades, addClient, editClient, deleteClient }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) || c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.cNo?.toLowerCase().includes(search.toLowerCase())
  ), [clients, search]);

  const openEdit = (c) => { setEditing(c); setShowModal(true); };
  const openAdd = () => { setEditing(null); setShowModal(true); };

  const clientTrades = (cid) => trades.filter(t => t.clientId === cid);
  const clientBrokerage = (cid) => clientTrades(cid).reduce((s, t) => s + (t.brokerage || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div><h2>Clients 👥</h2><p>Manage your client accounts</p></div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Add Client</button>
      </div>
      <div className="filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input placeholder="Search by name, phone, email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{filtered.length} clients</div>
      </div>
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No clients found</h3>
          <p>Add your first client to get started</p>
        </div>
      ) : (
        <div className="clients-grid">
          {filtered.map(c => {
            const ct = clientTrades(c.id);
            const brok = clientBrokerage(c.id);
            return (
              <div key={c.id} className="client-card">
                <div className="client-card-header">
                  <div className="client-avatar" style={{ background: getAvatarColor(c.name) }}>{initials(c.name)}</div>
                  <div>
                    <div className="client-card-name">{c.name} {c.cNo && <span style={{ color: 'var(--accent-amber)', fontSize: '0.75rem', marginLeft: 6 }}>({c.cNo})</span>}</div>
                    <div className="client-card-id">ID: {c.id} · <span className={`badge badge-${c.status}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>{c.status}</span></div>
                  </div>
                </div>
                <div className="client-card-stats">
                  <div className="client-stat-item"><div className="client-stat-val">{ct.length}</div><div className="client-stat-lbl">Total Trades</div></div>
                  <div className="client-stat-item"><div className="client-stat-val" style={{ color: 'var(--accent-amber)' }}>{fmt(brok)}</div><div className="client-stat-lbl">Brokerage Paid</div></div>
                  <div className="client-stat-item"><div className="client-stat-val" style={{ fontSize: '0.82rem' }}>{c.phone || '—'}</div><div className="client-stat-lbl">Phone</div></div>
                  <div className="client-stat-item"><div className="client-stat-val" style={{ fontSize: '0.72rem', wordBreak: 'break-all' }}>{c.pan || '—'}</div><div className="client-stat-lbl">PAN</div></div>
                </div>
                {c.brokerageRate && (
                  <div style={{ marginTop: 12, padding: '6px 10px', background: 'rgba(245,158,11,0.08)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--accent-amber)' }}>
                    💰 Brokerage Rate: {c.brokerageRate}%
                  </div>
                )}
                <div className="client-card-footer">
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => openEdit(c)}>✏️ Edit</button>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1, color: 'var(--accent-red)' }} onClick={() => deleteClient(c.id)}>🗑 Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showModal && <ClientModal clients={clients} initial={editing} onSave={editing ? editClient : addClient} onClose={() => setShowModal(false)} />}
    </div>
  );
}

function ClientModal({ clients, initial, onSave, onClose }) {
  const [form, setForm] = useState({
    name: initial?.name || '', phone: initial?.phone || '',
    email: initial?.email || '', pan: initial?.pan || '',
    brokerageRate: initial?.brokerageRate !== undefined && initial?.brokerageRate !== null ? initial.brokerageRate : 0.5,
    status: initial?.status || 'active', notes: initial?.notes || '',
    cNo: initial?.cNo || ''
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    if (!initial && clients) {
      let maxNo = 0;
      clients.forEach(x => {
        const val = parseInt(x.cNo, 10);
        if (!isNaN(val) && val > maxNo) {
          maxNo = val;
        }
      });
      const nextNo = String(maxNo + 1).padStart(2, '0');
      set('cNo', nextNo);
    }
  }, [initial, clients]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({ ...initial, ...form, brokerageRate: parseFloat(form.brokerageRate) || 0 });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div><h3>{initial ? '✏️ Edit Client' : '➕ Add New Client'}</h3><p>{initial ? 'Update client information' : 'Register a new client account'}</p></div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group full"><label>Full Name *</label><input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Rahul Sharma" /></div>
              <div className="form-group"><label>Client Number (e.g. 01, 02) *</label><input required value={form.cNo} onChange={e => set('cNo', e.target.value)} placeholder="e.g. 01" /></div>
              <div className="form-group"><label>Phone Number</label><input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9876543210" /></div>
              <div className="form-group"><label>Email Address</label><input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" /></div>
              <div className="form-group"><label>PAN Number</label><input value={form.pan} onChange={e => set('pan', e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} /></div>
              <div className="form-group"><label>Brokerage Rate (%)</label>
                <div className="input-group">
                  <input type="number" step="any" min="0" max="100" value={form.brokerageRate} onChange={e => set('brokerageRate', e.target.value)} />
                  <span className="input-suffix">%</span>
                </div>
              </div>
              <div className="form-group"><label>Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group full"><label>Notes</label><textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Additional notes about this client..." /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">{initial ? '💾 Save Changes' : '➕ Add Client'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Trade Entry ───────────────────────────────────────
const POPULAR_STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Industries' }, { symbol: 'TCS', name: 'Tata Consultancy Services' },
  { symbol: 'HDFC', name: 'HDFC Bank' }, { symbol: 'INFY', name: 'Infosys Ltd' },
  { symbol: 'WIPRO', name: 'Wipro Ltd' }, { symbol: 'ITC', name: 'ITC Ltd' },
  { symbol: 'SBIN', name: 'State Bank of India' }, { symbol: 'BHARTIARTL', name: 'Bharti Airtel' },
  { symbol: 'TATASTEEL', name: 'Tata Steel' }, { symbol: 'MARUTI', name: 'Maruti Suzuki' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises' }, { symbol: 'BAJFINANCE', name: 'Bajaj Finance' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank' }, { symbol: 'LT', name: 'Larsen & Toubro' },
  { symbol: 'AXISBANK', name: 'Axis Bank' }, { symbol: 'HCLTECH', name: 'HCL Technologies' },
];

function TradePage({ clients, addTrade, setPage }) {
  const [form, setForm] = useState({
    clientId: '', type: 'buy', stockSymbol: '', stockName: '',
    quantity: '', rate: '', brokerageOverride: ''
  });
  const [stockSearch, setStockSearch] = useState('');
  const [showStockList, setShowStockList] = useState(false);
  const [cSearch, setCSearch] = useState('');
  const [showCDrop, setShowCDrop] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '+' || e.key === 'Add') {
        e.preventDefault();
        set('type', 'buy');
      } else if (e.key === '-' || e.key === 'Subtract') {
        e.preventDefault();
        set('type', 'sell');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const selected = clients.find(c => c.id === form.clientId);
    if (selected) {
      setCSearch(selected.cNo ? `${selected.cNo} - ${selected.name}` : selected.name);
    } else {
      setCSearch('');
    }
  }, [form.clientId, clients]);

  const selectedClient = clients.find(c => c.id === form.clientId);
  const qty = parseFloat(form.quantity) || 0;
  const rate = parseFloat(form.rate) || 0;
  const tradeValue = qty * rate;
  const brokerageRate = selectedClient?.brokerageRate !== undefined ? selectedClient.brokerageRate : 0.5;
  const calcBrokerage = form.brokerageOverride !== '' ? parseFloat(form.brokerageOverride) : (tradeValue * brokerageRate / 100);
  const totalWithBrokerage = form.type === 'buy' ? tradeValue + calcBrokerage : tradeValue - calcBrokerage;

  const filteredStocks = POPULAR_STOCKS.filter(s =>
    s.symbol.toLowerCase().includes(stockSearch.toLowerCase()) ||
    s.name.toLowerCase().includes(stockSearch.toLowerCase())
  );

  const selectStock = (s) => {
    set('stockSymbol', s.symbol); set('stockName', s.name);
    setStockSearch(s.symbol); setShowStockList(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.clientId || !form.stockSymbol || !qty || !rate) return;
    addTrade({
      clientId: form.clientId,
      clientName: selectedClient?.name || '',
      stockSymbol: form.stockSymbol,
      stockName: form.stockName,
      type: form.type,
      quantity: qty, rate, brokerage: calcBrokerage,
      totalValue: tradeValue,
      netAmount: totalWithBrokerage,
    });
    
    // Clear trade inputs to allow sequential entries without closing
    setForm(prev => ({
      ...prev,
      stockSymbol: '',
      stockName: '',
      quantity: '',
      rate: '',
      brokerageOverride: ''
    }));
    setStockSearch('');
  };

  return (
    <div>
      <div className="page-header">
        <div><h2>📈 New Trade Entry</h2><p>Record a buy or sell transaction for a client</p></div>
      </div>
      <div style={{ maxWidth: 660 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Transaction Details</div></div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {/* Trade Type */}
                <div className="form-group full">
                  <label>Transaction Type *</label>
                  <div className="trade-type-selector">
                    <button type="button" className={`trade-type-btn buy ${form.type === 'buy' ? 'active' : ''}`} onClick={() => set('type', 'buy')}>▲ BUY</button>
                    <button type="button" className={`trade-type-btn sell ${form.type === 'sell' ? 'active' : ''}`} onClick={() => set('type', 'sell')}>▼ SELL</button>
                  </div>
                </div>

                {/* Client */}
                <div className="form-group full" style={{ position: 'relative' }}>
                  <label>Select Client *</label>
                  <input
                    required
                    value={cSearch}
                    onChange={e => {
                      const val = e.target.value;
                      setCSearch(val);
                      setShowCDrop(true);
                      
                      const exact = clients.find(c => c.cNo && c.cNo.toLowerCase().trim() === val.toLowerCase().trim());
                      if (exact) {
                        set('clientId', exact.id);
                        setShowCDrop(false);
                      } else {
                        if (!val) set('clientId', '');
                      }
                    }}
                    onFocus={e => {
                      setShowCDrop(true);
                      e.target.select();
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowCDrop(false), 200);
                    }}
                    placeholder="Type client name or number (e.g. 01)..."
                    autoComplete="off"
                  />
                  {showCDrop && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      zIndex: 300,
                      maxHeight: 200,
                      overflowY: 'auto',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
                    }}>
                      {clients.filter(c => {
                        if (!cSearch) return true;
                        const query = cSearch.toLowerCase();
                        const nameMatch = c.name.toLowerCase().includes(query);
                        const cNoMatch = c.cNo && c.cNo.toLowerCase().includes(query);
                        const idMatch = c.id && c.id.toLowerCase().includes(query);
                        return nameMatch || cNoMatch || idMatch;
                      }).map(c => (
                        <div key={c.id} onMouseDown={() => {
                          set('clientId', c.id);
                          setShowCDrop(false);
                        }} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,142,247,0.08)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <strong style={{ color: 'var(--accent-blue)' }}>{c.cNo ? `${c.cNo} - ` : ''}{c.name}</strong>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: 8 }}>(Brokerage: {c.brokerageRate}%)</span>
                        </div>
                      ))}
                      {clients.filter(c => {
                        if (!cSearch) return true;
                        const query = cSearch.toLowerCase();
                        const nameMatch = c.name.toLowerCase().includes(query);
                        const cNoMatch = c.cNo && c.cNo.toLowerCase().includes(query);
                        const idMatch = c.id && c.id.toLowerCase().includes(query);
                        return nameMatch || cNoMatch || idMatch;
                      }).length === 0 && (
                        <div style={{ padding: '10px 14px', color: 'var(--text-muted)', textAlign: 'center' }}>No matching clients</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Stock Symbol */}
                <div className="form-group full" style={{ position: 'relative' }}>
                  <label>Stock Symbol / Name *</label>
                  <input
                    value={stockSearch}
                    onChange={e => { setStockSearch(e.target.value); set('stockSymbol', e.target.value.toUpperCase()); set('stockName', ''); setShowStockList(true); }}
                    onFocus={() => setShowStockList(true)}
                    placeholder="Search NSE/BSE symbol (e.g. RELIANCE)"
                    autoComplete="off"
                  />
                  {showStockList && stockSearch && filteredStocks.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', zIndex: 200, maxHeight: 200, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                      {filteredStocks.map(s => (
                        <div key={s.symbol} onClick={() => selectStock(s)} style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', transition: 'var(--transition)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,142,247,0.08)'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}>
                          <strong style={{ color: 'var(--accent-blue)' }}>{s.symbol}</strong>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: 8 }}>{s.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Qty & Rate */}
                <div className="form-group">
                  <label>Quantity *</label>
                  <input type="number" required min="1" value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="e.g. 100" />
                </div>
                <div className="form-group">
                  <label>Rate per Share (₹) *</label>
                  <div className="input-group">
                    <span className="input-prefix">₹</span>
                    <input type="number" required step="0.01" min="0.01" value={form.rate} onChange={e => set('rate', e.target.value)} placeholder="0.00" />
                  </div>
                </div>

                {/* Brokerage */}
                <div className="form-group">
                  <label>Brokerage Rate</label>
                  <div style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', color: 'var(--accent-amber)', fontWeight: 600 }}>
                    {brokerageRate}% {selectedClient ? `(${selectedClient.name}'s rate)` : '(select client)'}
                  </div>
                </div>
                <div className="form-group">
                  <label>Override Brokerage (₹) <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>optional</span></label>
                  <div className="input-group">
                    <span className="input-prefix">₹</span>
                    <input type="number" step="any" min="0" value={form.brokerageOverride} onChange={e => set('brokerageOverride', e.target.value)} placeholder="Leave blank to auto-calc" />
                  </div>
                </div>
              </div>

              {/* Live Summary */}
              {qty > 0 && rate > 0 && (
                <div className="trade-summary">
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8, color: 'var(--text-primary)' }}>📋 Trade Summary</div>
                  <div className="trade-summary-row"><span>Trade Value:</span><strong>{fmt(tradeValue)}</strong></div>
                  <div className="trade-summary-row"><span>Brokerage ({brokerageRate}%):</span><strong style={{ color: 'var(--accent-amber)' }}>{fmt(calcBrokerage)}</strong></div>
                  <div className="trade-summary-row total">
                    <span>{form.type === 'buy' ? 'Total Payable' : 'Net Receivable'}:</span>
                    <strong>{fmt(totalWithBrokerage)}</strong>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setPage('trades')}>Cancel</button>
                <button type="submit" className={`btn ${form.type === 'buy' ? 'btn-success' : 'btn-danger'}`} style={{ flex: 2 }}>
                  {form.type === 'buy' ? '▲ Record BUY Trade' : '▼ Record SELL Trade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Trade History Page ────────────────────────────────
function TradesPage({ trades, clients, deleteTrade }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterClient, setFilterClient] = useState('all');

  const filtered = useMemo(() => trades.filter(t => {
    const matchSearch = t.stockSymbol?.toLowerCase().includes(search.toLowerCase()) || t.clientName?.toLowerCase().includes(search.toLowerCase()) || t.stockName?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || t.type === filterType;
    const matchClient = filterClient === 'all' || t.clientId === filterClient;
    return matchSearch && matchType && matchClient;
  }), [trades, search, filterType, filterClient]);

  const sorted = [...filtered].sort((a, b) => {
    const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
    const db2 = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
    return db2 - da;
  });

  return (
    <div>
      <div className="page-header">
        <div><h2>Trade History 📋</h2><p>{trades.length} total transactions recorded</p></div>
      </div>
      <div className="filter-bar">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input placeholder="Search stock or client..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          <option value="buy">Buy Only</option>
          <option value="sell">Sell Only</option>
        </select>
        <select className="filter-select" value={filterClient} onChange={e => setFilterClient(e.target.value)}>
          <option value="all">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{sorted.length} records</div>
      </div>
      <TradeTable trades={sorted} onDelete={deleteTrade} />
    </div>
  );
}

// ── Portfolio Page ─────────────────────────────────────
function PortfolioPage({ clients, trades }) {
  const [selectedClient, setSelectedClient] = useState('all');

  const portfolioData = useMemo(() => {
    const clientList = selectedClient === 'all' ? clients : clients.filter(c => c.id === selectedClient);
    return clientList.map(client => {
      const ct = trades.filter(t => t.clientId === client.id);
      const holdings = {};
      ct.forEach(t => {
        if (!holdings[t.stockSymbol]) holdings[t.stockSymbol] = { symbol: t.stockSymbol, name: t.stockName, qty: 0, buyValue: 0, sellValue: 0, brokerage: 0, buyQty: 0 };
        if (t.type === 'buy') { 
          holdings[t.stockSymbol].qty += t.quantity; 
          holdings[t.stockSymbol].buyValue += t.totalValue; 
          holdings[t.stockSymbol].buyQty += t.quantity;
        } else { 
          holdings[t.stockSymbol].qty -= t.quantity; 
          holdings[t.stockSymbol].sellValue += t.totalValue; 
        }
        holdings[t.stockSymbol].brokerage += t.brokerage || 0;
      });
      const holdingsList = Object.values(holdings).map(h => {
        const ab = h.buyValue > 0 ? (h.buyValue / (h.buyQty || 1)) : 0;
        const inv = h.qty > 0 ? h.qty * ab : 0;
        const rpl = h.qty === 0 ? (h.sellValue - h.buyValue) : (h.sellValue - (h.buyValue - inv));
        return { ...h, ab, inv, rpl };
      });
      const totalBrokerageEarned = ct.reduce((s, t) => s + (t.brokerage || 0), 0);
      return { client, holdings: holdingsList, totalBrokerageEarned, tradeCount: ct.length };
    });
  }, [clients, trades, selectedClient]);

  return (
    <div>
      <div className="page-header">
        <div><h2>Portfolio 💼</h2><p>Client-wise stockholdings overview</p></div>
        <select className="filter-select" style={{ minWidth: 200 }} value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
          <option value="all">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      {portfolioData.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">💼</div><h3>No portfolio data</h3><p>Add clients and trades to see portfolio</p></div>
      ) : (
        portfolioData.map(({ client, holdings, totalBrokerageEarned, tradeCount }) => {
          const totalInv = holdings.reduce((s, x) => s + x.inv, 0);
          const totalRpl = holdings.reduce((s, x) => s + x.rpl, 0);
          return (
            <div key={client.id} style={{ marginBottom: 28 }}>
              <div className="portfolio-header">
                <div className="portfolio-avatar" style={{ background: getAvatarColor(client.name) }}>{initials(client.name)}</div>
                <div>
                  <div className="portfolio-client-name">{client.name}</div>
                  <div className="portfolio-client-meta">ID: {client.id} · {tradeCount} trades · PAN: {client.pan || '—'}</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '24px', textAlign: 'right' }}>
                  <div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>{fmt(totalInv)}</div>
                    <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>Net Investment</div>
                  </div>
                  <div>
                    <div style={{ 
                      fontSize: '1.3rem', 
                      fontWeight: 800, 
                      color: totalRpl > 0 ? 'var(--accent-green)' : totalRpl < 0 ? 'var(--accent-red)' : 'var(--text-muted)' 
                    }}>
                      {totalRpl > 0 ? '+' : ''}{fmt(totalRpl)}
                    </div>
                    <div style={{ fontSize: '.7rem', color: 'var(--text-muted)' }}>Realized P&L</div>
                  </div>
                </div>
              </div>
              {holdings.length === 0 ? (
                <div className="empty-state" style={{ padding: 30 }}><p>No holdings recorded</p></div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr><th>Symbol</th><th>Company</th><th>Net Qty</th><th>Avg Buy</th><th>Invested</th><th>Realized P&L</th></tr>
                    </thead>
                    <tbody>
                      {holdings.map(h => (
                        <tr key={h.symbol}>
                          <td><strong style={{ color: 'var(--accent-blue)' }}>{h.symbol}</strong></td>
                          <td style={{ color: 'var(--text-secondary)' }}>{h.name}</td>
                          <td><strong style={{ color: h.qty > 0 ? 'var(--accent-green)' : h.qty < 0 ? 'var(--accent-red)' : 'var(--text-muted)' }}>{fmtQty(h.qty)}</strong></td>
                          <td>{fmt(h.ab)}</td>
                          <td>{fmt(h.inv)}</td>
                          <td style={{ fontWeight: 700, color: h.rpl > 0 ? 'var(--accent-green)' : h.rpl < 0 ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                            {h.rpl > 0 ? '+' : ''}{fmt(h.rpl)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

// ── Brokerage Page ────────────────────────────────────
function BrokeragePage({ trades, clients }) {
  const [period, setPeriod] = useState('all');

  const now = new Date();
  const filteredTrades = useMemo(() => {
    if (period === 'all') return trades;
    const cutoff = new Date();
    if (period === 'today') cutoff.setHours(0, 0, 0, 0);
    else if (period === 'week') cutoff.setDate(now.getDate() - 7);
    else if (period === 'month') cutoff.setMonth(now.getMonth() - 1);
    return trades.filter(t => {
      const d = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(0);
      return d >= cutoff;
    });
  }, [trades, period]);

  const totalBrok = filteredTrades.reduce((s, t) => s + (t.brokerage || 0), 0);
  const buyBrok = filteredTrades.filter(t => t.type === 'buy').reduce((s, t) => s + (t.brokerage || 0), 0);
  const sellBrok = filteredTrades.filter(t => t.type === 'sell').reduce((s, t) => s + (t.brokerage || 0), 0);

  const byClient = useMemo(() => clients.map(c => ({
    ...c,
    brok: filteredTrades.filter(t => t.clientId === c.id).reduce((s, t) => s + (t.brokerage || 0), 0),
    trades: filteredTrades.filter(t => t.clientId === c.id).length,
  })).filter(c => c.trades > 0).sort((a, b) => b.brok - a.brok), [clients, filteredTrades]);

  return (
    <div>
      <div className="page-header">
        <div><h2>Brokerage Report 💰</h2><p>Brokerage earned across all transactions</p></div>
        <div className="tabs" style={{ marginBottom: 0 }}>
          {[['all', 'All Time'], ['month', 'This Month'], ['week', 'This Week'], ['today', 'Today']].map(([v, l]) => (
            <button key={v} className={`tab-btn ${period === v ? 'active' : ''}`} onClick={() => setPeriod(v)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <StatCard color="amber" icon="💰" value={fmt(totalBrok)} label="Total Brokerage Earned" />
        <StatCard color="green" icon="▲" value={fmt(buyBrok)} label="From Buy Orders" />
        <StatCard color="red" icon="▼" value={fmt(sellBrok)} label="From Sell Orders" />
        <StatCard color="blue" icon="📋" value={filteredTrades.length} label="Transactions in Period" />
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Brokerage by Client</div></div>
        <div className="card-body" style={{ padding: 0 }}>
          {byClient.length === 0 ? (
            <div className="empty-state"><p>No brokerage data for this period</p></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Client</th><th>PAN</th><th>Rate</th><th>Trades</th><th>Brokerage Earned</th><th>% Share</th></tr>
                </thead>
                <tbody>
                  {byClient.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: getAvatarColor(c.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700 }}>{initials(c.name)}</div>
                          <div><div style={{ fontWeight: 600 }}>{c.name}</div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.email || '—'}</div></div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{c.pan || '—'}</td>
                      <td><span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{c.brokerageRate}%</span></td>
                      <td>{c.trades}</td>
                      <td><strong style={{ color: 'var(--accent-amber)', fontSize: '1rem' }}>{fmt(c.brok)}</strong></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--bg-secondary)', borderRadius: 10, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.round((c.brok / totalBrok) * 100)}%`, background: 'var(--gradient-amber)', borderRadius: 10 }} />
                          </div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', minWidth: 36 }}>{Math.round((c.brok / totalBrok) * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Firebase Data Layer ───────────────────────────────
function useData(addToast) {
  const { db, methods, ready } = useFirestore();
  const isDemo = !ready || !db || !window.__firebaseConfig?.apiKey || window.__firebaseConfig?.apiKey === 'YOUR_API_KEY';

  const [clients, setClients] = useState(DEMO_CLIENTS);
  const [trades, setTrades] = useState(DEMO_TRADES);

  const tryFirestore = useCallback(async (fn) => {
    if (isDemo) return null;
    try { return await fn(); }
    catch (e) { console.error('Firestore error:', e); addToast('Firestore error: ' + e.message, 'error'); return null; }
  }, [isDemo, addToast]);

  // Clients
  const addClient = useCallback(async (data) => {
    const newC = { ...data, id: data.id || genId() };
    setClients(p => [...p, newC]);
    await tryFirestore(() => methods.addDoc(methods.collection(db, 'clients'), { ...newC, createdAt: methods.Timestamp.now() }));
    addToast(`Client "${data.name}" added! ✅`, 'success');
  }, [tryFirestore, methods, db, addToast]);

  const editClient = useCallback(async (data) => {
    setClients(p => p.map(c => c.id === data.id ? { ...c, ...data } : c));
    await tryFirestore(() => methods.updateDoc(methods.doc(db, 'clients', data.firestoreId || data.id), data));
    addToast(`Client "${data.name}" updated! ✅`, 'success');
  }, [tryFirestore, methods, db, addToast]);

  const deleteClient = useCallback(async (id) => {
    if (!window.confirm('Delete this client? This cannot be undone.')) return;
    setClients(p => p.filter(c => c.id !== id));
    setTrades(p => p.filter(t => t.clientId !== id));
    addToast('Client deleted.', 'info');
  }, [addToast]);

  // Trades
  const addTrade = useCallback(async (data) => {
    const newT = { ...data, id: genId(), createdAt: { toDate: () => new Date() } };
    setTrades(p => [newT, ...p]);
    await tryFirestore(() => methods.addDoc(methods.collection(db, 'trades'), { ...data, createdAt: methods.Timestamp.now() }));
    addToast(`Trade recorded: ${data.type.toUpperCase()} ${data.quantity} ${data.stockSymbol} ✅`, 'success');
  }, [tryFirestore, methods, db, addToast]);

  const deleteTrade = useCallback(async (id) => {
    if (!window.confirm('Delete this trade record?')) return;
    setTrades(p => p.filter(t => t.id !== id));
    addToast('Trade deleted.', 'info');
  }, [addToast]);

  return { clients, trades, addClient, editClient, deleteClient, addTrade, deleteTrade, isDemo };
}

// ── Main App ──────────────────────────────────────────
function App() {
  const [page, setPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const { toasts, addToast, removeToast } = useToast();
  const { clients, trades, addClient, editClient, deleteClient, addTrade, deleteTrade, isDemo } = useData(addToast);

  useEffect(() => { setTimeout(() => setLoading(false), 1200); }, []);

  const pageTitle = { dashboard: 'Dashboard', clients: 'Clients', trade: 'New Trade', trades: 'Trade History', portfolio: 'Portfolio', brokerage: 'Brokerage Report' };
  const pageSubtitle = { dashboard: 'Welcome back, Broker', clients: 'Manage your client base', trade: 'Record a new transaction', trades: 'All transactions', portfolio: 'Client stock holdings', brokerage: 'Earnings overview' };

  if (loading) return (
    <div className="loader-wrapper">
      <div className="loader-logo">📈 StockDesk Pro</div>
      <div className="loader-spinner" />
      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Loading your dashboard...</div>
    </div>
  );

  return (
    <div className="app-layout">
      <Sidebar active={page} setPage={setPage} tradeCount={trades.length} />
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <h2>{pageTitle[page]}</h2>
            <p>{pageSubtitle[page]}</p>
          </div>
          <div className="topbar-right">
            {isDemo && (
              <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: '5px 12px', fontSize: '0.72rem', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', gap: 6 }}>
                ⚠️ Demo Mode — Connect Firebase to persist data
              </div>
            )}
            <button className="btn-icon" title="Refresh" onClick={() => window.location.reload()}>🔄</button>
            <button className="btn btn-primary btn-sm" onClick={() => setPage('trade')}>＋ New Trade</button>
            <div className="avatar" title="Broker">B</div>
          </div>
        </div>

        <div className="page-content">
          {page === 'dashboard' && <Dashboard clients={clients} trades={trades} setPage={setPage} />}
          {page === 'clients' && <ClientsPage clients={clients} trades={trades} addClient={addClient} editClient={editClient} deleteClient={deleteClient} />}
          {page === 'trade' && <TradePage clients={clients} addTrade={addTrade} setPage={setPage} />}
          {page === 'trades' && <TradesPage trades={trades} clients={clients} deleteTrade={deleteTrade} />}
          {page === 'portfolio' && <PortfolioPage clients={clients} trades={trades} />}
          {page === 'brokerage' && <BrokeragePage trades={trades} clients={clients} />}
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
