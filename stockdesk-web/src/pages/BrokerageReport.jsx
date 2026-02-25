import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { dfD, fmt, ini, ac } from '../utils/helpers';
import { StatCard } from '../components/SharedUI';

export default function BrokerageReport() {
    const { trades, clients } = useData();
    const [sc, setSc] = useState('all');

    const dt = useMemo(() => {
        const ct = sc === 'all' ? trades : trades.filter(t => t.cid === sc);
        let tb = 0, db = {}, cb = {};

        ct.forEach(t => {
            const date = dfD(t.at);
            tb += t.brok || 0;
            db[date] = (db[date] || 0) + (t.brok || 0);
            cb[t.cid] = (cb[t.cid] || 0) + (t.brok || 0);
        });

        const dl = Object.entries(db).sort((a, b) => new Date(b[0]) - new Date(a[0])).map(([d, b]) => ({ date: d, brok: b }));
        const clst = Object.entries(cb).sort((a, b) => b[1] - a[1]).map(([id, b]) => {
            const cl = clients.find(c => c.id === id);
            return { cn: cl ? cl.name : 'Unknown', brok: b };
        });

        return { tb, dl, clst, t: ct.length };
    }, [trades, clients, sc]);

    return (
        <div>
            <div className="ph"><div><h2>Brokerage Earnings 💰</h2><p>Revenue analysis</p></div></div>
            <div className="fb">
                <select style={{ padding: '9px 13px', minWidth: 200 }} value={sc} onChange={e => setSc(e.target.value)}>
                    <option value="all">All Clients Total Brokerage</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}'s Brokerage</option>)}
                </select>
            </div>

            <div className="sgrid">
                <StatCard c="am" icon="💰" val={fmt(dt.tb)} lbl="Lifetime Brokerage Earned" />
                <StatCard c="pu" icon="📋" val={dt.t} lbl="Trades Facilitated" />
            </div>

            <div className="fg fg1">
                {sc === 'all' && (
                    <div className="card">
                        <div className="ch"><div className="ct">Top Clients by Brokerage</div></div>
                        <div className="cb">
                            {dt.clst.length === 0 ? <div className="empty" style={{ padding: 20 }}>No data</div> :
                                dt.clst.slice(0, 5).map((c, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div className="av" style={{ width: 34, height: 34, fontSize: '.75rem', background: ac(c.cn) }}>{ini(c.cn)}</div>
                                            <span style={{ fontWeight: 600 }}>{c.cn}</span>
                                        </div>
                                        <div style={{ fontWeight: 800, color: 'var(--amber)' }}>{fmt(c.brok)}</div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                )}

                <div className="card">
                    <div className="ch"><div className="ct">Daily Brokerage Trend</div></div>
                    <div className="cb">
                        {dt.dl.length === 0 ? <div className="empty" style={{ padding: 20 }}>No data</div> :
                            <div className="tw"><table>
                                <thead><tr><th>Date</th><th>Brokerage Earned</th></tr></thead>
                                <tbody>
                                    {dt.dl.map((d, i) => (
                                        <tr key={i}>
                                            <td style={{ fontWeight: 600 }}>{d.date}</td>
                                            <td style={{ fontWeight: 700, color: 'var(--amber)' }}>{fmt(d.brok)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table></div>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
