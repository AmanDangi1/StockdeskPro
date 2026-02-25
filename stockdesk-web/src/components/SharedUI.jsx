import React from 'react';
import { ac, ini, fmtN, fmt, fmtD } from '../utils/helpers';

export function StatCard({ c, icon, val, lbl }) {
    return (
        <div className={`scard ${c}`}>
            <div className="si">{icon}</div>
            <div className="sv">{val}</div>
            <div className="sl">{lbl}</div>
        </div>
    );
}

export function TradeTable({ trades, onDel, onEdit, compact }) {
    if (!trades.length) return <div className="empty"><div className="ei">📋</div><h3>No trades found</h3><p>Wait for new transactions</p></div>;
    return (
        <div className="tw">
            <table>
                <thead>
                    <tr>
                        <th>Client</th>
                        <th>Stock</th>
                        <th>Type</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Total</th>
                        <th>Brokerage</th>
                        {!compact && <th>Date</th>}
                        {(onDel || onEdit) && <th>Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {trades.map(t => (
                        <tr key={t.id}>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: ac(t.cn), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.62rem', fontWeight: 700 }}>
                                        {ini(t.cn)}
                                    </div>
                                    <span style={{ fontWeight: 600 }}>{t.cn}</span>
                                </div>
                            </td>
                            <td>
                                <div style={{ fontWeight: 700, color: 'var(--blue)' }}>{t.sym}</div>
                                {!compact && <div style={{ fontSize: '.7rem', color: 'var(--dim)' }}>{t.sn}</div>}
                            </td>
                            <td><span className={`badge b-${t.type}`}>{t.type === 'buy' ? '▲' : '▼'} {t.type.toUpperCase()}</span></td>
                            <td style={{ fontWeight: 600 }}>{fmtN(t.qty)}</td>
                            <td>{fmt(t.rate)}</td>
                            <td style={{ fontWeight: 700 }}>{fmt(t.val)}</td>
                            <td style={{ color: 'var(--amber)', fontWeight: 600 }}>{fmt(t.brok)}</td>
                            {!compact && <td style={{ fontSize: '.74rem', color: 'var(--dim)' }}>{fmtD(t.at)}</td>}
                            {(onDel || onEdit) && <td>
                                {onEdit && <button className="btn btn-o btn-sm" style={{ marginRight: 6 }} onClick={() => onEdit(t)}>✏️</button>}
                                {onDel && <button className="btn btn-o btn-sm" style={{ color: 'var(--red)' }} onClick={() => onDel(t.id)}>🗑</button>}
                            </td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
