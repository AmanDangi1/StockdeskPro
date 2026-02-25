import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { StatCard, TradeTable } from '../components/SharedUI';
import { fmt } from '../utils/helpers';

export default function Dashboard({ setPg }) {
    const { clients, trades } = useData();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const ds = useMemo(() => {
        let bv = 0, sv = 0, tb = 0, tdb = 0;
        trades.forEach(t => {
            if (t.type === 'buy') bv += t.val; else sv += t.val;
            tb += t.brok || 0;
            const tDate = t.at && t.at.toDate ? t.at.toDate() : new Date(t.at);
            if (tDate >= today) tdb += t.brok || 0;
        });
        return { bv, sv, tb, tdb, tTrades: trades.length, tClients: clients.length };
    }, [trades, clients, today]);

    return (
        <div>
            <div className="dbanner">⚠️ Note: Intraday brokerage is charged correctly on both legs.</div>
            <div className="sgrid" style={{ marginTop: 15 }}>
                <StatCard c="bl" icon="👥" val={ds.tClients} lbl="Active Clients" />
                <StatCard c="pu" icon="📋" val={ds.tTrades} lbl="Total Transactions" />
                <StatCard c="am" icon="💰" val={fmt(ds.tb)} lbl="Lifetime Brokerage Earned" />
                <StatCard c="gr" icon="🚀" val={fmt(ds.tdb)} lbl="Today's Brokerage" />
            </div>

            <div className="card">
                <div className="ch">
                    <div>
                        <div className="ct">Recent Transactions</div>
                        <div className="cs">Latest client trading activity</div>
                    </div>
                </div>
                <div className="cb">
                    <TradeTable trades={trades.slice(0, 8)} compact />
                    {trades.length > 8 && (
                        <div style={{ textAlign: 'center', marginTop: 15 }}>
                            <button className="btn btn-o" onClick={() => setPg('trades')}>View All History →</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
