import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import NewTrade from './pages/NewTrade';
import TradesHistory from './pages/TradesHistory';
import Portfolio from './pages/Portfolio';
import BrokerageReport from './pages/BrokerageReport';
import Reports from './pages/Reports';
import LivePrices from './pages/LivePrices';

const PAGE_META = {
  dashboard: { title: 'Dashboard', sub: 'Overview of your brokerage activity' },
  clients: { title: 'Clients', sub: 'Manage your client base' },
  trade: { title: 'New Trade Entry', sub: 'Record a buy or sell transaction' },
  trades: { title: 'Trade History', sub: 'All your recorded transactions' },
  'live-prices': { title: 'Live Prices', sub: 'Real-time closing prices' },
  portfolio: { title: 'Portfolio', sub: 'Client stock holdings' },
  brokerage: { title: 'Brokerage Earnings', sub: 'Revenue analysis' },
  reports: { title: 'Weekly Reports', sub: 'Client-wise billing and settlement' },
};

export default function App() {
  const { user, loading } = useAuth();
  const [pg, setPg] = useState('dashboard');

  if (loading) {
    return (
      <div className="loader">
        <div style={{ fontSize: '1.4rem', fontWeight: 800, background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          📈 StockDesk Pro
        </div>
        <div className="lsp" />
        <div style={{ color: 'var(--dim)', fontSize: '.8rem' }}>Loading your workspace...</div>
      </div>
    );
  }

  if (!user) return <Login />;

  const meta = PAGE_META[pg] || { title: pg, sub: '' };

  return (
    <div className="layout">
      <Sidebar pg={pg} setPg={setPg} />
      <div className="main">
        <div className="topbar">
          <div>
            <h2>{meta.title}</h2>
            <p>{meta.sub}</p>
          </div>
          <div className="topbar-r">
            <button className="btn btn-p btn-sm" onClick={() => setPg('trade')}>＋ New Trade</button>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.9rem', color: '#fff', cursor: 'default', title: user.email }}>
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </div>
        <div className="page">
          {pg === 'dashboard' && <Dashboard setPg={setPg} />}
          {pg === 'clients' && <Clients />}
          {pg === 'trade' && <NewTrade sp={setPg} />}
          {pg === 'trades' && <TradesHistory />}
          {pg === 'live-prices' && <LivePrices />}
          {pg === 'portfolio' && <Portfolio />}
          {pg === 'brokerage' && <BrokerageReport />}
          {pg === 'reports' && <Reports />}
        </div>
      </div>
    </div>
  );
}
