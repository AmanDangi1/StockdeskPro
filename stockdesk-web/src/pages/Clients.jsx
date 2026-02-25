import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ini, ac, fmtN, fmt } from '../utils/helpers';

export default function Clients() {
    const { clients, trades, addClient, editClient, delClient } = useData();
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [f, setF] = useState({ name: '', phone: '', email: '', bRate: 0.5 });
    const [q, setQ] = useState('');

    const set = (k, v) => setF(p => ({ ...p, [k]: v }));

    const open = c => {
        setEditTarget(c || null);
        setF(c ? { name: c.name, phone: c.phone || '', email: c.email || '', bRate: c.bRate || 0.5 }
            : { name: '', phone: '', email: '', bRate: 0.5 });
        setShowModal(true);
    };

    const submit = e => {
        e.preventDefault();
        editTarget ? editClient({ ...editTarget, ...f }) : addClient(f);
        setShowModal(false);
    };

    const filtered = clients.filter(c =>
        !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.id?.toLowerCase().includes(q.toLowerCase())
    );

    return (
        <div>
            <div className="ph">
                <div>
                    <h2>Client Management 👥</h2>
                    <p>{clients.length} registered clients</p>
                </div>
                <button className="btn btn-p" onClick={() => open()}>＋ Add Client</button>
            </div>

            {/* Search bar */}
            {clients.length > 0 && (
                <div className="fb" style={{ marginBottom: 20 }}>
                    <div className="sb">
                        <span>🔍</span>
                        <input placeholder="Search clients..." value={q} onChange={e => setQ(e.target.value)} />
                    </div>
                    <span style={{ color: 'var(--dim)', fontSize: '.8rem' }}>{filtered.length} of {clients.length}</span>
                </div>
            )}

            {clients.length === 0 && (
                <div className="empty">
                    <div className="ei">👥</div>
                    <h3>No clients yet</h3>
                    <p>Add your first client to start recording trades</p>
                    <button className="btn btn-p" onClick={() => open()}>＋ Add First Client</button>
                </div>
            )}

            <div className="cgrid">
                {filtered.map(c => {
                    const ct = trades.filter(t => t.cid === c.id);
                    const buys = ct.filter(t => t.type === 'buy');
                    const sells = ct.filter(t => t.type === 'sell');
                    const turnover = ct.reduce((s, t) => s + t.val, 0);
                    const brokEarned = ct.reduce((s, t) => s + (t.brok || 0), 0);

                    return (
                        <div key={c.id} className="cc">
                            <div className="cch">
                                <div className="av" style={{ background: ac(c.name) }}>{ini(c.name)}</div>
                                <div>
                                    <div className="ccn">{c.name}</div>
                                    <div className="cci">{c.id} • {c.bRate}% brokerage</div>
                                    {c.phone && <div className="cci" style={{ marginTop: 2 }}>📞 {c.phone}</div>}
                                </div>
                            </div>

                            <div className="ccs">
                                <div>
                                    <div className="csv" style={{ color: 'var(--green)' }}>{fmtN(buys.length)}</div>
                                    <div className="csl">Buy Orders</div>
                                </div>
                                <div>
                                    <div className="csv" style={{ color: 'var(--red)' }}>{fmtN(sells.length)}</div>
                                    <div className="csl">Sell Orders</div>
                                </div>
                                <div>
                                    <div className="csv" style={{ color: 'var(--blue)' }}>{fmt(turnover)}</div>
                                    <div className="csl">Turnover</div>
                                </div>
                                <div>
                                    <div className="csv" style={{ color: 'var(--amber)' }}>{fmt(brokEarned)}</div>
                                    <div className="csl">Brokerage</div>
                                </div>
                            </div>

                            <div className="ccf">
                                <button className="btn btn-o btn-sm" style={{ flex: 1 }} onClick={() => open(c)}>
                                    ✏️ Edit
                                </button>
                                <button className="btn btn-o btn-sm" style={{ flex: 1, color: 'var(--red)' }} onClick={() => delClient(c.id)}>
                                    🗑 Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: 420 }}>
                        <div className="mh">
                            <div>
                                <h3>{editTarget ? '✏️ Edit Client' : '✨ New Client'}</h3>
                                <p>Enter client details below</p>
                            </div>
                            <button className="mc" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={submit}>
                            <div className="mb">
                                <div className="fg fg1">
                                    <div className="fgrp">
                                        <label>Full Name *</label>
                                        <input required value={f.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Rajan Mehta" />
                                    </div>
                                    <div className="fgrp">
                                        <label>Phone Number</label>
                                        <input type="tel" value={f.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 XXXXXXXXXX" />
                                    </div>
                                    <div className="fgrp">
                                        <label>Email Address</label>
                                        <input type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="client@example.com" />
                                    </div>
                                    <div className="fgrp">
                                        <label>Brokerage Rate (%) *</label>
                                        <div className="ig">
                                            <input type="number" step="0.01" min="0.01" max="10" required value={f.bRate} onChange={e => set('bRate', e.target.value)} />
                                            <span className="is">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mf">
                                <button type="button" className="btn btn-o" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-p">💾 Save Client</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
