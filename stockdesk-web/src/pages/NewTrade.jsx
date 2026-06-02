import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { STOCKS, fmt } from '../utils/helpers';

export default function NewTrade({ sp }) {
    const { clients, addTrade } = useData();
    const [f, setF] = useState({
        cid: '', type: 'buy', sym: '', sn: '', qty: '', rate: '', bOvr: '',
        dateStr: new Date().toISOString().slice(0, 10)
    });
    const [sq, setSq] = useState('');
    const [sl, setSl] = useState(false);

    const [cSearch, setCSearch] = useState('');
    const [showCDrop, setShowCDrop] = useState(false);

    const set = (k, v) => setF(p => ({ ...p, [k]: v }));

    // Global keyboard listener for '+' and '-' keys
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

    // STANDARD BROKERAGE CALCULATION: Apply percentage to turnover of this let
    const brok = f.bOvr !== '' ? parseFloat(f.bOvr) : (val * br / 100);
    const net = f.type === 'buy' ? val + brok : val - brok;

    const fs = STOCKS.filter(s => s.s.toLowerCase().includes(sq.toLowerCase()) || s.n.toLowerCase().includes(sq.toLowerCase()));

    const pick = s => {
        set('sym', s.s); set('sn', s.n); setSq(s.s); setSl(false);
    };

    const sub = e => {
        e.preventDefault();
        if (!f.cid || !f.sym || !qty || !rate || !f.dateStr) return;
        const dt = new Date(f.dateStr);
        dt.setHours(new Date().getHours(), new Date().getMinutes());
        addTrade({
            cid: f.cid, cn: cli?.name || '',
            sym: f.sym, sn: f.sn, type: f.type,
            qty, rate, brok, val, net,
            at: { toDate: () => dt }
        });
        
        // Clear trade inputs to allow sequential entries without closing
        setF(prev => ({
            ...prev,
            sym: '',
            sn: '',
            qty: '',
            rate: '',
            bOvr: ''
        }));
        setSq('');
    };

    return (
        <div>
            <div className="ph"><div><h2>📈 New Trade Entry</h2><p>Record a buy or sell transaction</p></div></div>
            <div style={{ maxWidth: 620 }}>
                <div className="card">
                    <div className="ch"><div className="ct">Transaction Details</div></div>
                    <div className="cb">
                        <form onSubmit={sub}>
                            <div className="fg">
                                <div className="fgrp full">
                                    <label>Transaction Type *</label>
                                    <div className="tts">
                                        <button type="button" className={`tt buy ${f.type === 'buy' ? 'on' : ''}`} onClick={() => set('type', 'buy')}>▲ BUY</button>
                                        <button type="button" className={`tt sell ${f.type === 'sell' ? 'on' : ''}`} onClick={() => set('type', 'sell')}>▼ SELL</button>
                                    </div>
                                </div>

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
                                    <input value={sq} onChange={e => { setSq(e.target.value); set('sym', e.target.value.toUpperCase()); set('sn', ''); setSl(true); }} onFocus={() => setSl(true)} placeholder="Search stock e.g. RELIANCE, TCS..." autoComplete="off" />
                                    {sl && sq && fs.length > 0 && <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 'var(--r)', zIndex: 200, maxHeight: 180, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,.5)' }}>
                                        {fs.map(s => <div key={s.s} onMouseDown={e => { e.preventDefault(); pick(s); }} style={{ padding: '9px 13px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,142,247,.08)'} onMouseLeave={e => e.currentTarget.style.background = ''}><strong style={{ color: 'var(--blue)' }}>{s.s}</strong><span style={{ color: 'var(--dim)', fontSize: '.78rem', marginLeft: 8 }}>{s.n}</span></div>)}
                                    </div>}
                                </div>

                                <div className="fgrp"><label>Trade Date *</label><input type="date" required value={f.dateStr} onChange={e => set('dateStr', e.target.value)} /></div>
                                <div className="fgrp"><label>Quantity *</label><input type="number" required min="1" value={f.qty} onChange={e => set('qty', e.target.value)} placeholder="e.g. 100" /></div>
                                <div className="fgrp"><label>Rate per Share (₹) *</label><div className="ig"><span className="ip">₹</span><input type="number" required step="0.01" min="0.01" value={f.rate} onChange={e => set('rate', e.target.value)} placeholder="0.00" /></div></div>

                                <div className="fgrp">
                                    <label>Auto Brokerage</label>
                                    <div style={{ padding: '9px 13px', background: 'var(--bg2)', borderRadius: 'var(--r)', border: '1px solid var(--border)', color: 'var(--amber)', fontWeight: 600, fontSize: '.85rem' }}>
                                        {br}% {cli ? `(${cli.name})` : '— select client'}
                                    </div>
                                </div>

                                <div className="fgrp">
                                    <label>Override Brokerage ₹ <span style={{ color: 'var(--dim)', fontWeight: 400 }}>(optional)</span></label>
                                    <div className="ig"><span className="ip">₹</span><input type="number" step="any" min="0" value={f.bOvr} onChange={e => set('bOvr', e.target.value)} placeholder="Leave blank = auto" /></div>
                                </div>
                            </div>

                            {qty > 0 && rate > 0 && <div className="sum">
                                <div style={{ fontWeight: 700, fontSize: '.83rem', marginBottom: 7 }}>📋 Trade Summary</div>
                                <div className="sum-r"><span>Trade Value:</span><strong>{fmt(val)}</strong></div>
                                <div className="sum-r"><span>Brokerage ({br}%):</span><strong style={{ color: 'var(--amber)' }}>{fmt(brok)}</strong></div>
                                <div className="sum-r tot"><span>{f.type === 'buy' ? 'Total Payable' : 'Net Receivable'}:</span><strong>{fmt(net)}</strong></div>
                            </div>}

                            <div style={{ display: 'flex', gap: 8, margin: '18px 0' }}>
                                <button type="button" className="btn btn-o" style={{ flex: 1 }} onClick={() => sp('trades')}>Cancel</button>
                                <button type="submit" className={`btn ${f.type === 'buy' ? 'btn-g' : 'btn-r'}`} style={{ flex: 2 }}>{f.type === 'buy' ? '▲ Record BUY' : '▼ Record SELL'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
