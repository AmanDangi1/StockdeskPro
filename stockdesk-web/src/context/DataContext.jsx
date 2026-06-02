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
        }, err => {
            console.error('Clients listener error:', err);
            add(`Database Error (Clients): ${err.message}`, 'e');
        });

        const unsubT = onSnapshot(query(tradesCol, orderBy('at', 'desc')), snap => {
            setTrades(snap.docs.map(d => ({ ...d.data(), fsId: d.id })));
            setLoading(false);
        }, err => {
            console.error('Trades listener error:', err);
            add(`Database Error (Trades): ${err.message}`, 'e');
            setLoading(false);
        });

        return () => { unsubC(); unsubT(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.uid]); // re-run when uid changes (user switches account)

    // ─── Clients ───────────────────────────────────────────────────────────────
    const addClient = useCallback(async d => {
        if (!user) return;
        const n = { ...d, id: d.id || ('C' + gid()) };
        try {
            const colRef = collection(db, 'users', user.uid, 'clients');
            await addDoc(colRef, n);
            add(`Client "${d.name}" added ✅`, 's');
        } catch (e) {
            console.error('Error adding client:', e);
            add(`Failed to add client: ${e.message}`, 'e');
        }
    }, [add, user?.uid]);

    const editClient = useCallback(async d => {
        if (!user || !d.fsId) return;
        try {
            const docRef = doc(db, 'users', user.uid, 'clients', d.fsId);
            const { fsId, ...updateData } = d;
            await updateDoc(docRef, updateData);
            add(`Client "${d.name}" updated ✅`, 's');
        } catch (e) {
            console.error('Error updating client:', e);
            add(`Failed to update client: ${e.message}`, 'e');
        }
    }, [add, user?.uid]);

    const delClient = useCallback(async id => {
        if (!user) return;
        if (!window.confirm('Delete this client and all their trades?')) return;
        const c = clients.find(x => x.id === id);
        if (!c?.fsId) return;
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'clients', c.fsId));
            add('Client deleted', 'i');
        } catch (e) {
            console.error('Error deleting client:', e);
            add(`Failed to delete client: ${e.message}`, 'e');
        }
    }, [add, clients, user?.uid]);

    // ─── Trades ────────────────────────────────────────────────────────────────
    const addTrade = useCallback(async d => {
        if (!user) return;
        const n = { ...d, id: 'T' + gid() };
        const fireDt = d.at?.toDate ? Timestamp.fromDate(d.at.toDate()) : Timestamp.now();
        const { at, ...tradeData } = n;
        try {
            const colRef = collection(db, 'users', user.uid, 'trades');
            await addDoc(colRef, { ...tradeData, at: fireDt });
            add(`${d.type.toUpperCase()} ${d.qty} ${d.sym} recorded ✅`, 's');
        } catch (e) {
            console.error('Error adding trade:', e);
            add(`Failed to record trade: ${e.message}`, 'e');
        }
    }, [add, user?.uid]);

    const editTrade = useCallback(async d => {
        if (!user || !d.fsId) return;
        const fireDt = d.at?.toDate ? Timestamp.fromDate(d.at.toDate()) : Timestamp.now();
        const { fsId, at, ...tradeData } = d;
        try {
            const docRef = doc(db, 'users', user.uid, 'trades', d.fsId);
            await updateDoc(docRef, { ...tradeData, at: fireDt });
            add('Trade updated ✅', 's');
        } catch (e) {
            console.error('Error updating trade:', e);
            add(`Failed to update trade: ${e.message}`, 'e');
        }
    }, [add, user?.uid]);

    const delTrade = useCallback(async id => {
        if (!user) return;
        if (!window.confirm('Delete this trade?')) return;
        const t = trades.find(x => x.id === id);
        if (!t?.fsId) return;
        try {
            await deleteDoc(doc(db, 'users', user.uid, 'trades', t.fsId));
            add('Trade deleted', 'i');
        } catch (e) {
            console.error('Error deleting trade:', e);
            add(`Failed to delete trade: ${e.message}`, 'e');
        }
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
