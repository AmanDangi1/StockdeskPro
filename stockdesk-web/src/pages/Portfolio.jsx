import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { ac, ini, fmtN, fmt } from '../utils/helpers';

export default function Portfolio() {
    const { clients, trades } = useData();
    const [sc, setSc] = useState('all');

    const data = useMemo(() => {
        const cl = sc === 'all' ? clients : clients.filter(c => c.id === sc);
        return cl.map(client => {
            const ct = trades.filter(t => t.cid === client.id);
            const h = {};
            ct.forEach(t => {
                if (!h[t.sym]) h[t.sym] = { sym: t.sym, sn: t.sn, qty: 0, bv: 0, sv: 0, brok: 0 };
                if (t.type === 'buy') { h[t.sym].qty += t.qty; h[t.sym].bv += t.val; }
                else { h[t.sym].qty -= t.qty; h[t.sym].sv += t.val; }
                h[t.sym].brok += t.brok || 0;
            });
            const hl = Object.values(h).filter(x => x.qty !== 0 || x.bv > 0 || x.sv > 0);
            return { c: client, hl };
        }).filter(x => x.hl.length > 0);
    }, [clients, trades, sc]);

    return (
        <div>
            <div className="ph"><div><h2>Client Portfolio 💼</h2><p>Current stock holdings</p></div></div>
            <div className="fb">
                <select style={{ padding: '9px 13px', minWidth: 200 }} value={sc} onChange={e => setSc(e.target.value)}>
                    <option value="all">All Clients Portfolio</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}'s Portfolio</option>)}
                </select>
            </div>
            {data.length === 0 ? <div className="empty"><div className="ei">💼</div><h3>No holdings</h3><p>Clients have no active positions</p></div> :
                data.map((d, i) => (
                    <div key={i} style={{ marginBottom: 30 }}>
                        <div className="poh">
                            <div className="poa" style={{ background: ac(d.c.name) }}>{ini(d.c.name)}</div>
                            <div><div className="pon">{d.c.name}</div><div className="pom">{d.hl.length} stocks traded</div></div>
                            <div className="pop"><div className="popv">{fmt(d.hl.reduce((s, x) => s + x.bv - x.sv, 0))}</div><div className="popl">Net Investment</div></div>
                        </div>
                        <div className="tw"><table>
                            <thead><tr><th>Stock</th><th>Net Qty</th><th>Avg Buy</th><th>Invested</th><th>Realized P&L</th></tr></thead>
                            <tbody>{d.hl.map((h, j) => {
                                const ab = h.bv > 0 ? (h.bv / (trades.filter(t => t.cid === d.c.id && t.sym === h.sym && t.type === 'buy').reduce((s, t) => s + t.qty, 0) || 1)) : 0;
                                const inv = h.qty > 0 ? h.qty * ab : 0;
                                const rpl = h.qty === 0 ? (h.sv - h.bv) : (h.sv - (h.bv - inv));
                                return (
                                    <tr key={j}>
                                        <td><div style={{ fontWeight: 700, color: 'var(--blue)' }}>{h.sym}</div><div style={{ fontSize: '.7rem', color: 'var(--dim)' }}>{h.sn}</div></td>
                                        <td style={{ fontWeight: 600, color: h.qty > 0 ? 'var(--green)' : h.qty < 0 ? 'var(--red)' : 'var(--text)' }}>{fmtN(h.qty)}</td>
                                        <td>{fmt(ab)}</td>
                                        <td>{fmt(inv)}</td>
                                        <td style={{ fontWeight: 700, color: rpl > 0 ? 'var(--green)' : rpl < 0 ? 'var(--red)' : 'var(--dim)' }}>{rpl > 0 ? '+' : ''}{fmt(rpl)}</td>
                                    </tr>
                                )
                            })}</tbody>
                        </table></div>
                    </div>
                ))
            }
        </div>
    );
}
