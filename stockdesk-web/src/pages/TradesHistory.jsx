import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { TradeTable } from '../components/SharedUI';
import { STOCKS } from '../utils/helpers';

function TradeModal({ clients, init, onSave, onClose }) {
    const [f, setF] = useState({
        cid: init?.cid || '', type: init?.type || 'buy', sym: init?.sym || '',
        sn: init?.sn || '', qty: init?.qty || '', rate: init?.rate || '',
        bOvr: init?.brok !== undefined ? init.brok : '',
        dateStr: init?.at ? (init.at.toDate ? init.at.toDate() : new Date(init.at)).toLocaleString('sv-SE').replace(' ', 'T').slice(0, 10) : new Date().toISOString().slice(0, 10)
    });
    const [sq, setSq] = useState(init?.sym || '');
    const [sl, setSl] = useState(false);

    const [cSearch, setCSearch] = useState('');
    const [showCDrop, setShowCDrop] = useState(false);

    const set = (k, v) => setF(p => ({ ...p, [k]: v }));

    // Sync client search field when selected client changes
    useEffect(() => {
        const selected = clients.find(c => c.id === f.cid);
        if (selected) {
            setCSearch(selected.cNo ? `${selected.cNo} - ${selected.name}` : selected.name);
        } else {
            setCSearch('');
        }
    }, [f.cid, clients]);

    const cli = clients.find(c => c.id === f.cid);
    const qty = parseFloat(f.qty) || 0, rate = parseFloat(f.rate) || 0;
    const val = qty * rate;
    const br = cli && (cli.bRate !== undefined && cli.bRate !== null) ? cli.bRate : 0.5;

    let brok = f.bOvr !== '' ? parseFloat(f.bOvr) : (val * br / 100);
    const net = f.type === 'buy' ? val + brok : val - brok;
    const fs = STOCKS.filter(s => s.s.toLowerCase().includes(sq.toLowerCase()) || s.n.toLowerCase().includes(sq.toLowerCase()));
    const pick = s => { set('sym', s.s); set('sn', s.n); setSq(s.s); setSl(false); };

    const sub = e => {
        e.preventDefault();
        if (!f.cid || !f.sym || !qty || !rate || !f.dateStr) return;
        const dt = new Date(f.dateStr);
        if (init && init.at) {
            const initDt = init.at.toDate ? init.at.toDate() : new Date(init.at);
            dt.setHours(initDt.getHours(), initDt.getMinutes(), initDt.getSeconds());
        } else {
            dt.setHours(new Date().getHours(), new Date().getMinutes());
        }
        onSave({ ...init, cid: f.cid, cn: cli?.name || '', sym: f.sym, sn: f.sn, type: f.type, qty, rate, brok, val, net, at: { toDate: () => dt } });
        onClose();
    };

    return (<div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal">
            <div className="mh"><div><h3>✏️ Edit Trade</h3><p>Update transaction details</p></div><button className="mc" onClick={onClose}>✕</button></div>
            <form onSubmit={sub}>
                <div className="mb">
                    <div className="fg">
                        <div className="fgrp full"><label>Transaction Type *</label><div className="tts"><button type="button" className={`tt buy ${f.type === 'buy' ? 'on' : ''}`} onClick={() => set('type', 'buy')}>▲ BUY</button><button type="button" className={`tt sell ${f.type === 'sell' ? 'on' : ''}`} onClick={() => set('type', 'sell')}>▼ SELL</button></div></div>
                        <div className="fgrp full" style={{ position: 'relative' }}>
                            <label>Select Client *</label>
                            <input
                                required
                                value={cSearch}
                                onChange={e => {
                                    const val = e.target.value;
                                    setCSearch(val);
                                    setShowCDrop(true);
                                    
                                    // Check if exactly matches a client's cNo
                                    const exact = clients.find(c => c.cNo && c.cNo.toLowerCase().trim() === val.toLowerCase().trim());
                                    if (exact) {
                                        set('cid', exact.id);
                                        setShowCDrop(false);
                                    } else {
                                        if (!val) set('cid', '');
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
                                    background: 'var(--card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--r)',
                                    zIndex: 300,
                                    maxHeight: 200,
                                    overflowY: 'auto',
                                    boxShadow: '0 8px 24px rgba(0,0,0,.5)'
                                }}>
                                    {clients.filter(c => {
                                        if (!cSearch) return true;
                                        const query = cSearch.toLowerCase();
                                        const nameMatch = c.name.toLowerCase().includes(query);
                                        const cNoMatch = c.cNo && c.cNo.toLowerCase().includes(query);
                                        const idMatch = c.id && c.id.toLowerCase().includes(query);
                                        return nameMatch || cNoMatch || idMatch;
                                    }).map(c => (
                                        <div
                                            key={c.id}
                                            onMouseDown={() => {
                                                set('cid', c.id);
                                                setShowCDrop(false);
                                            }}
                                            style={{
                                                padding: '9px 13px',
                                                cursor: 'pointer',
                                                borderBottom: '1px solid var(--border)'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,142,247,.08)'}
                                            onMouseLeave={e => e.currentTarget.style.background = ''}
                                        >
                                            <strong style={{ color: 'var(--blue)' }}>
                                                {c.cNo ? `${c.cNo} - ` : ''}{c.name}
                                            </strong>
                                            <span style={{ color: 'var(--dim)', fontSize: '.78rem', marginLeft: 8 }}>
                                                ({c.bRate}% brokerage)
                                            </span>
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
                                        <div style={{ padding: '9px 13px', color: 'var(--dim)', textAlign: 'center' }}>
                                            No matching clients
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="fgrp full" style={{ position: 'relative' }}>
                            <label>Stock Symbol *</label>
                            <input value={sq} onChange={e => { setSq(e.target.value); set('sym', e.target.value.toUpperCase()); set('sn', ''); setSl(true); }} onFocus={() => setSl(true)} placeholder="Search stock..." autoComplete="off" />
                            {sl && sq && fs.length > 0 && <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r)', zIndex: 200, maxHeight: 180, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,.5)' }}>
                                {fs.map(s => <div key={s.s} onMouseDown={e => { e.preventDefault(); pick(s); }} style={{ padding: '9px 13px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,142,247,.08)'} onMouseLeave={e => e.currentTarget.style.background = ''}><strong style={{ color: 'var(--blue)' }}>{s.s}</strong><span style={{ color: 'var(--dim)', fontSize: '.78rem', marginLeft: 8 }}>{s.n}</span></div>)}
                            </div>}
                        </div>
                        <div className="fgrp"><label>Trade Date *</label><input type="date" required value={f.dateStr} onChange={e => set('dateStr', e.target.value)} /></div>
                        <div className="fgrp"><label>Quantity *</label><input type="number" required min="1" value={f.qty} onChange={e => set('qty', e.target.value)} /></div>
                        <div className="fgrp"><label>Rate (₹) *</label><div className="ig"><span className="ip">₹</span><input type="number" required step="0.01" min="0.01" value={f.rate} onChange={e => set('rate', e.target.value)} /></div></div>
                        <div className="fgrp full"><label>Brokerage ₹ Override *</label><div className="ig"><span className="ip">₹</span><input type="number" step="any" min="0" required value={f.bOvr} onChange={e => set('bOvr', e.target.value)} /></div></div>
                    </div>
                </div>
                <div className="mf"><button type="button" className="btn btn-o" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-p">💾 Save Changes</button></div>
            </form>
        </div>
    </div>);
}

export default function TradesHistory() {
    const { trades, clients, delTrade, editTrade } = useData();
    const [q, setQ] = useState('');
    const [ft, setFt] = useState('all');
    const [fc, setFc] = useState('all');
    const [show, setShow] = useState(false);
    const [ed, setEd] = useState(null);

    const fil = useMemo(() => [...trades].filter(t => {
        const ms = t.sym?.toLowerCase().includes(q.toLowerCase()) || t.cn?.toLowerCase().includes(q.toLowerCase()) || t.sn?.toLowerCase().includes(q.toLowerCase());
        return ms && (ft === 'all' || t.type === ft) && (fc === 'all' || t.cid === fc);
    }).sort((a, b) => {
        const da = a.at?.toDate ? a.at.toDate() : new Date(0);
        const db2 = b.at?.toDate ? b.at.toDate() : new Date(0);
        return db2 - da;
    }), [trades, q, ft, fc]);

    return (
        <div>
            <div className="ph"><div><h2>Trade History 📋</h2><p>{trades.length} total transactions</p></div></div>
            <div className="fb">
                <div className="sb"><span>🔍</span><input placeholder="Search stock or client..." value={q} onChange={e => setQ(e.target.value)} /></div>
                <select style={{ padding: '9px 13px', minWidth: 130 }} value={ft} onChange={e => setFt(e.target.value)}><option value="all">All Types</option><option value="buy">Buy Only</option><option value="sell">Sell Only</option></select>
                <select style={{ padding: '9px 13px', minWidth: 140 }} value={fc} onChange={e => setFc(e.target.value)}><option value="all">All Clients</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                <span style={{ color: 'var(--dim)', fontSize: '.8rem' }}>{fil.length} records</span>
            </div>

            <TradeTable trades={fil} onDel={delTrade} onEdit={t => { setEd(t); setShow(true); }} />
            {show && <TradeModal clients={clients} init={ed} onSave={editTrade} onClose={() => setShow(false)} />}
        </div>
    );
}
