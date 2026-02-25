import React, { useState, useEffect } from 'react';
import { STOCKS, fmt } from '../utils/helpers';
import { useToast } from '../context/ToastContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from '../context/AuthContext';

export default function LivePrices() {
    const { user } = useAuth();
    const { add } = useToast();
    const [q, setQ] = useState('');
    const [wl, setWl] = useState([]); // watchlist: array of symbols
    const [prices, setPrices] = useState({}); // { symbol: { price: 100, change: 2.5, time: ... } }
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Load watchlist from Firestore on mount
    useEffect(() => {
        if (!user) return;
        getDoc(doc(db, 'users', user.uid, 'settings', 'watchlist')).then(snap => {
            if (snap.exists() && snap.data().symbols) {
                setWl(snap.data().symbols);
            }
        });
    }, [user]);

    // Save watchlist changes to Firestore
    useEffect(() => {
        if (!user) return;
        setDoc(doc(db, 'users', user.uid, 'settings', 'watchlist'), { symbols: wl })
            .catch(console.error);
    }, [wl, user]);

    // Fetch prices for all symbols in watchlist
    const fetchPrices = async () => {
        if (wl.length === 0) {
            add('Add stocks to watchlist first', 'w');
            return;
        }
        setLoading(true);
        const results = { ...prices };
        let errs = 0;

        for (const sym of wl) {
            try {
                // Yahoo Finance requires .NS suffix for NSE stocks
                const yfSym = sym + '.NS';
                // Use a standard public CORS proxy to bypass browser restrictions
                const url = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://query1.finance.yahoo.com/v8/finance/chart/${yfSym}`)}`;

                const res = await fetch(url);
                const data = await res.json();
                const chartData = JSON.parse(data.contents);

                if (chartData.chart.result && chartData.chart.result.length > 0) {
                    const meta = chartData.chart.result[0].meta;
                    results[sym] = {
                        price: meta.regularMarketPrice,
                        prev: meta.previousClose,
                        valChange: meta.regularMarketPrice - meta.previousClose,
                        pctChange: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
                        time: new Date(meta.regularMarketTime * 1000).toLocaleTimeString()
                    };
                }
            } catch (err) {
                errs++;
                console.error("Failed fetching", sym, err);
            }
        }

        setPrices(results);
        setLoading(false);
        if (errs === 0) add('Latest closing prices fetched ✅', 's');
        else add(`Fetched with ${errs} errors`, 'w');
    };

    // Auto-fetch on initial load if watchlist has items
    useEffect(() => {
        if (wl.length > 0 && Object.keys(prices).length === 0) {
            fetchPrices();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wl.length]);

    const addStock = (sym) => {
        if (wl.includes(sym)) return;
        setWl(p => [...p, sym]);
        setQ(''); // clear search
    };

    const rmStock = (sym) => {
        setWl(p => p.filter(s => s !== sym));
        const newPrices = { ...prices };
        delete newPrices[sym];
        setPrices(newPrices);
    };

    // Filter stocks based on search query
    const filteredStocks = q.trim() ? STOCKS.filter(s =>
        s.s.toLowerCase().includes(q.toLowerCase()) ||
        s.n.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 15) : []; // limit to top 15 results

    return (
        <div style={{ maxWidth: 800 }}>
            <div className="ph">
                <div>
                    <h2>Market Prices 📡</h2>
                    <p>Track latest closing prices for carry-forward positions</p>
                </div>
                <button
                    className="btn btn-p"
                    onClick={fetchPrices}
                    disabled={loading || wl.length === 0}
                >
                    {loading ? '🔄 Fetching...' : '📡 Refresh Prices'}
                </button>
            </div>

            {/* Search Bar */}
            <div className="card" style={{ marginBottom: 20, overflow: 'visible' }}>
                <div style={{ padding: '0 20px', borderBottom: '1px solid var(--border)' }}>
                    <input
                        placeholder="🔍 Search NSE stocks to add (e.g. RELIANCE, TCS)..."
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        style={{ width: '100%', border: 'none', background: 'transparent', padding: '16px 0', fontSize: '1rem', outline: 'none', color: 'var(--text)' }}
                    />
                </div>

                {filteredStocks.length > 0 && (
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {filteredStocks.map(s => (
                            <div
                                key={s.s}
                                style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                                onClick={() => addStock(s.s)}
                            >
                                <div>
                                    <div style={{ fontWeight: 600 }}>{s.s}</div>
                                    <div style={{ fontSize: '.75rem', color: 'var(--dim)' }}>{s.n}</div>
                                </div>
                                <button className="btn btn-sm btn-o" disabled={wl.includes(s.s)}>
                                    {wl.includes(s.s) ? 'Added' : '＋ Add'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Watchlist */}
            <div className="card">
                <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
                    My Watchlist ({wl.length})
                </div>

                {wl.length === 0 ? (
                    <div className="empty">
                        <div className="ei">📉</div>
                        <h3>Watchlist is empty</h3>
                        <p>Search and add stocks above to track their closing prices.</p>
                    </div>
                ) : (
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Symbol</th>
                                <th>Company</th>
                                <th>LTP / Close</th>
                                <th>Change</th>
                                <th>As Of</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {wl.map(sym => {
                                const stockInfo = STOCKS.find(s => s.s === sym) || { n: 'Unknown' };
                                const p = prices[sym];

                                return (
                                    <tr key={sym}>
                                        <td><strong>{sym}</strong></td>
                                        <td><div style={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--dim)', fontSize: '.8rem' }}>{stockInfo.n}</div></td>
                                        <td>
                                            {p ? (
                                                <strong style={{ fontSize: '1.05rem' }}>{fmt(p.price)}</strong>
                                            ) : <span style={{ color: 'var(--muted)' }}>—</span>}
                                        </td>
                                        <td>
                                            {p ? (
                                                <span style={{
                                                    color: p.valChange >= 0 ? 'var(--green)' : 'var(--red)',
                                                    background: p.valChange >= 0 ? 'rgba(16,185,129,.15)' : 'rgba(239,68,68,.15)',
                                                    padding: '2px 6px', borderRadius: 4, fontWeight: 700, fontSize: '.85rem'
                                                }}>
                                                    {p.valChange > 0 ? '+' : ''}{p.valChange.toFixed(2)} ({p.pctChange.toFixed(2)}%)
                                                </span>
                                            ) : <span style={{ color: 'var(--muted)' }}>—</span>}
                                        </td>
                                        <td style={{ fontSize: '.75rem', color: 'var(--dim)' }}>{p?.time || '—'}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button
                                                className="btn btn-sm"
                                                style={{ background: 'transparent', color: 'var(--red)', padding: 5 }}
                                                onClick={() => rmStock(sym)}
                                                title="Remove"
                                            >✕</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
