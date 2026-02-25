import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext({});

export const ToastProvider = ({ children }) => {
    const [ts, setTs] = useState([]);

    const add = useCallback((msg, type = 's') => {
        const id = Date.now();
        setTs(p => [...p, { id, msg, type }]);
        setTimeout(() => setTs(p => p.filter(t => t.id !== id)), 4000);
    }, []);

    const rm = useCallback(id => setTs(p => p.filter(t => t.id !== id)), []);

    return (
        <ToastContext.Provider value={{ ts, add, rm }}>
            {children}
            <div className="tc">
                {ts.map(t => (
                    <div key={t.id} className={`toast ${t.type}`}>
                        {t.type === 's' ? '✅' : t.type === 'e' ? '❌' : 'ℹ️'} {t.msg}
                        <button style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.1rem' }} onClick={() => rm(t.id)}>✕</button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
