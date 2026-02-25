import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';

const NAVS = [
    { id: 'dashboard', icon: '📊', lbl: 'Dashboard' },
    { id: 'clients', icon: '👥', lbl: 'Clients' },
    { id: 'trade', icon: '📈', lbl: 'New Entry' },
    { id: 'trades', icon: '📋', lbl: 'History' },
    { id: 'live-prices', icon: '📡', lbl: 'Live Prices' },
    { id: 'portfolio', icon: '💼', lbl: 'Portfolio' },
    { id: 'brokerage', icon: '💰', lbl: 'Earnings' },
    { id: 'reports', icon: '📑', lbl: 'Reports' },
];

export default function Sidebar({ pg, setPg }) {
    const { user } = useAuth();
    const { trades, clients } = useData();

    // Enrich nav labels with live counts
    const navs = NAVS.map(n => {
        if (n.id === 'trades') return { ...n, lbl: `History (${trades.length})` };
        if (n.id === 'clients') return { ...n, lbl: `Clients (${clients.length})` };
        return n;
    });

    const handleLogout = async () => {
        if (window.confirm('Sign out of StockDesk Pro?')) {
            await signOut(auth);
        }
    };

    return (
        <div className="sidebar">
            <div className="s-logo">
                <h1>📈 StockDesk Pro</h1>
                <p>Broker Management System</p>
            </div>

            <div className="s-nav">
                <div className="nav-lbl">Main Menu</div>
                {navs.map(n => (
                    <div
                        key={n.id}
                        onClick={() => setPg(n.id)}
                        className={`nav-item ${pg === n.id ? 'active' : ''}`}
                    >
                        <span>{n.icon}</span><span className="n-lbl">{n.lbl}</span>
                    </div>
                ))}
            </div>

            <div className="s-foot">
                {/* Active account info */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '10px 12px', background: 'rgba(79,142,247,.06)',
                    borderRadius: 10, marginBottom: 10, border: '1px solid rgba(79,142,247,.12)'
                }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '.82rem', color: '#fff'
                    }}>
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.email || 'Broker'}
                        </div>
                        <div style={{ fontSize: '.65rem', color: 'var(--blue)', fontWeight: 700 }}>
                            🛡️ BROKER ACCOUNT
                        </div>
                    </div>
                </div>

                <button
                    className="btn btn-o btn-sm"
                    style={{ width: '100%', color: 'var(--red)', borderColor: 'rgba(239,68,68,.25)' }}
                    onClick={handleLogout}
                >
                    🚪 Sign Out
                </button>
            </div>
        </div>
    );
}
