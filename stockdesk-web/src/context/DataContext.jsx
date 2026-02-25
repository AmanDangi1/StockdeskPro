import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { db } from '../utils/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc, deleteDoc, Timestamp } from 'firebase/firestore';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { gid } from '../utils/helpers';

const DataContext = createContext({});

export const DataProvider = ({ children }) => {
    const { user } = useAuth();
    const { add } = useToast();
    const [clients, setClients] = useState([]);
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);

    // ─── Helper: get user-scoped collection refs ───────────────────────────────
    // All data lives under /users/{uid}/clients  and  /users/{uid}/trades
    // This ensures complete data isolation between different broker accounts.
    const clientsCol = user ? collection(db, 'users', user.uid, 'clients') : null;
    const tradesCol = user ? collection(db, 'users', user.uid, 'trades') : null;

    useEffect(() => {
        if (!user) {
            setLoading(false);
            setClients([]);
            setTrades([]);
            return;
        }

        const unsubC = onSnapshot(clientsCol, snap => {
            setClients(snap.docs.map(d => ({ ...d.data(), fsId: d.id })));
        });

        const unsubT = onSnapshot(query(tradesCol, orderBy('at', 'desc')), snap => {
            setTrades(snap.docs.map(d => ({ ...d.data(), fsId: d.id })));
            setLoading(false);
        }, err => {
            console.error('Trades listener error:', err);
            setLoading(false);
        });

        return () => { unsubC(); unsubT(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid]); // re-run when uid changes (user switches account)

    // ─── Clients ───────────────────────────────────────────────────────────────
    const addClient = useCallback(async d => {
        if (!clientsCol) return;
        const n = { ...d, id: d.id || ('C' + gid()) };
        setClients(p => [...p, n]);
        await addDoc(clientsCol, n);
        add(`Client "${d.name}" added ✅`, 's');
    }, [add, user?.uid]);

    const editClient = useCallback(async d => {
        if (!user) return;
        setClients(p => p.map(c => c.id === d.id ? { ...c, ...d } : c));
        await updateDoc(doc(db, 'users', user.uid, 'clients', d.fsId), d);
        add(`Client "${d.name}" updated ✅`, 's');
    }, [add, user?.uid]);

    const delClient = useCallback(async id => {
        if (!user) return;
        if (!window.confirm('Delete this client and all their trades?')) return;
        const c = clients.find(x => x.id === id);
        setClients(p => p.filter(x => x.id !== id));
        if (c?.fsId) await deleteDoc(doc(db, 'users', user.uid, 'clients', c.fsId));
        add('Client deleted', 'i');
    }, [add, clients, user?.uid]);

    // ─── Trades ────────────────────────────────────────────────────────────────
    const addTrade = useCallback(async d => {
        if (!tradesCol) return;
        const n = { ...d, id: 'T' + gid() };
        setTrades(p => [n, ...p]);
        const fireDt = d.at?.toDate ? Timestamp.fromDate(d.at.toDate()) : Timestamp.now();
        try {
            const docRef = await addDoc(tradesCol, { ...n, at: fireDt });
            setTrades(p => p.map(t => t.id === n.id ? { ...t, fsId: docRef.id } : t));
        } catch (e) { console.error(e); }
        add(`${d.type.toUpperCase()} ${d.qty} ${d.sym} recorded ✅`, 's');
    }, [add, user?.uid]);

    const editTrade = useCallback(async d => {
        if (!user) return;
        setTrades(p => p.map(t => t.id === d.id ? { ...t, ...d } : t));
        const fireDt = d.at?.toDate ? Timestamp.fromDate(d.at.toDate()) : Timestamp.now();
        if (d.fsId) await updateDoc(doc(db, 'users', user.uid, 'trades', d.fsId), { ...d, at: fireDt });
        add('Trade updated ✅', 's');
    }, [add, user?.uid]);

    const delTrade = useCallback(async id => {
        if (!user) return;
        if (!window.confirm('Delete this trade?')) return;
        const t = trades.find(x => x.id === id);
        setTrades(p => p.filter(x => x.id !== id));
        if (t?.fsId) await deleteDoc(doc(db, 'users', user.uid, 'trades', t.fsId));
        add('Trade deleted', 'i');
    }, [add, trades, user?.uid]);

    return (
        <DataContext.Provider value={{
            clients, trades, loading,
            addClient, editClient, delClient,
            addTrade, editTrade, delTrade
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
