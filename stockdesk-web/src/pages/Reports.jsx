import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { dfD, fmt, ac, ini } from '../utils/helpers';
import { TradeTable } from '../components/SharedUI';

export default function Reports() {
    const { trades, clients } = useData();
    const [sc, setSc] = useState(clients[0]?.id || '');

    const rps = useMemo(() => {
        if (!sc) return [];
        const ct = trades.filter(t => t.cid === sc).sort((a, b) => { const da = a.at?.toDate ? a.at.toDate() : new Date(0); const db = b.at?.toDate ? b.at.toDate() : new Date(0); return db - da; });
        const wp = {};

        ct.forEach(t => {
            const dt = t.at?.toDate ? t.at.toDate() : new Date(t.at);
            const wStart = new Date(dt);
            wStart.setDate(dt.getDate() - dt.getDay() + 1); // Monday
            const wEnd = new Date(wStart);
            wEnd.setDate(wStart.getDate() + 4); // Friday
            const k = `${dfD(wStart)} - ${dfD(wEnd)}`;

            if (!wp[k]) wp[k] = { k, ct: [], tb: 0, totalPnl: 0 };
            wp[k].ct.push(t);
            wp[k].tb += (t.brok || 0);

            if (t.type === 'sell') {
                const bts = trades.filter(x => x.cid === sc && x.sym === t.sym && x.type === 'buy');
                const ab = bts.reduce((s, x) => s + x.val, 0) / (bts.reduce((s, x) => s + x.qty, 0) || 1);
                const pnl = t.val - (t.qty * ab);
                wp[k].totalPnl += pnl;
            }
        });

        return Object.values(wp).map(w => {
            const netCol = w.totalPnl - w.tb;
            return { ...w, netCol };
        });
    }, [trades, sc, clients]);

    return (
        <div>
            <div className="ph"><div><h2>Weekly Settlement Reports 📑</h2><p>Client-wise billing and performance</p></div></div>
            <div className="fb">
                <select style={{ padding: '9px 13px', minWidth: 200 }} value={sc} onChange={e => setSc(e.target.value)}>
                    {clients.length === 0 && <option value="">No clients found</option>}
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div style={{ flex: 1, textAlign: 'right' }}>
                    <button className="btn btn-o" onClick={() => window.print()}>🖨 Print Report</button>
                </div>
            </div>

            {sc && rps.length === 0 && <div className="empty"><h3>No trading history</h3><p>This client has no trades yet.</p></div>}

            {rps.map((r, i) => (
                <div key={i} className="card" style={{ marginBottom: 30, breakInside: 'avoid' }}>
                    <div className="ch" style={{ background: 'rgba(79,142,247,.05)', borderBottom: '1px solid var(--border)', paddingBottom: 18 }}>
                        <div><div className="ct" style={{ fontSize: '1.2rem' }}>Settlement Period: <span style={{ color: 'var(--blue)' }}>{r.k}</span></div><div className="cs" style={{ fontSize: '.85rem' }}>{r.ct.length} transactions in this period</div></div>
                        <div style={{ textAlign: 'right' }}><div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--amber)' }}>{fmt(r.tb)}</div><div style={{ fontSize: '.7rem', color: 'var(--dim)' }}>Total Brokerage Payable</div></div>
                    </div>
                    <div className="cb">
                        <div className="sgrid" style={{ marginBottom: 16 }}>
                            <div className="scard" style={{ padding: 16 }}><div className="sl">Total Realized P&L</div><div className="sv" style={{ fontSize: '1.3rem', color: r.totalPnl >= 0 ? 'var(--green)' : 'var(--red)', marginTop: 4 }}>{r.totalPnl >= 0 ? '+' : ''}{fmt(r.totalPnl)}</div></div>
                            <div className="scard" style={{ padding: 16 }}><div className="sl">Total Brokerage (You)</div><div className="sv" style={{ fontSize: '1.3rem', color: 'var(--amber)', marginTop: 4 }}>-{fmt(r.tb)}</div></div>
                            <div className="scard" style={{ padding: 16, border: '1px solid var(--blue)' }}><div className="sl" style={{ color: 'var(--text)', fontWeight: 700 }}>{r.netCol >= 0 ? 'Broker to Pay Client' : 'Client to Pay Broker'}</div><div className="sv" style={{ fontSize: '1.4rem', color: r.netCol >= 0 ? 'var(--green)' : 'var(--red)', marginTop: 4 }}>{fmt(Math.abs(r.netCol))}</div></div>
                        </div>
                        <div style={{ fontSize: '.85rem', fontWeight: 700, marginBottom: 8, color: 'var(--muted)' }}>Transactions in Period</div>
                        <TradeTable trades={r.ct} compact />
                    </div>
                </div>
            ))}
        </div>
    );
}
