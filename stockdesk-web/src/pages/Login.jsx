import React, { useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useToast } from '../context/ToastContext';

export default function Login() {
    const [mode, setMode] = useState('login'); // 'login' | 'signup'
    const [email, setEmail] = useState('');
    const [pwd, setPwd] = useState('');
    const [l, setL] = useState(false);
    const { add } = useToast();

    const submit = async ev => {
        ev.preventDefault();
        setL(true);
        try {
            if (mode === 'login') {
                await signInWithEmailAndPassword(auth, email, pwd);
            } else {
                await createUserWithEmailAndPassword(auth, email, pwd);
                add('Account created! Welcome to StockDesk Pro 🎉', 's');
            }
        } catch (err) {
            const msg = {
                'auth/invalid-login-credentials': 'Wrong email or password.',
                'auth/invalid-credential': 'Wrong email or password.',
                'auth/email-already-in-use': 'An account with this email already exists. Sign in instead.',
                'auth/weak-password': 'Password must be at least 6 characters.',
                'auth/user-not-found': 'No account found. Sign up first.',
            }[err.code] || err.message;
            add('❌ ' + msg, 'e');
            setL(false);
        }
    };

    return (
        <div style={{
            display: 'flex', minHeight: '100vh',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg)'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: 440, padding: 40, textAlign: 'center' }}>

                {/* Logo */}
                <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: '2.4rem', marginBottom: 6 }}>📈</div>
                    <h1 style={{
                        fontSize: '1.7rem', fontWeight: 900, margin: 0,
                        background: 'linear-gradient(135deg,#4f8ef7,#8b5cf6)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>StockDesk Pro</h1>
                    <p style={{ color: 'var(--dim)', fontSize: '.85rem', marginTop: 4 }}>
                        {mode === 'login' ? 'Sign in to your broker account' : 'Create a new broker account'}
                    </p>
                </div>

                {/* Mode switcher tabs */}
                <div style={{ display: 'flex', background: 'var(--bg2)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
                    {['login', 'signup'].map(m => (
                        <button key={m} type="button"
                            onClick={() => setMode(m)}
                            style={{
                                flex: 1, padding: '9px 0', border: 'none', borderRadius: 8, cursor: 'pointer',
                                fontWeight: 700, fontSize: '.82rem', transition: 'all .2s',
                                background: mode === m ? 'var(--card)' : 'transparent',
                                color: mode === m ? 'var(--text)' : 'var(--dim)',
                                boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,.25)' : 'none',
                            }}>
                            {m === 'login' ? '🔐 Sign In' : '✨ Create Account'}
                        </button>
                    ))}
                </div>

                <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                    <input
                        type="email" required
                        placeholder="Email address"
                        value={email} onChange={e => setEmail(e.target.value)}
                        style={{ padding: 14 }}
                    />
                    <input
                        type="password" required minLength="6"
                        placeholder="Password (min 6 characters)"
                        value={pwd} onChange={e => setPwd(e.target.value)}
                        style={{ padding: 14 }}
                    />
                    <button type="submit" disabled={l} className="btn btn-p"
                        style={{ padding: 14, justifyContent: 'center', marginTop: 4, fontSize: '.95rem' }}>
                        {l ? '⏳ Please wait...' : (mode === 'login' ? '🔐 Sign In' : '🚀 Create Account')}
                    </button>
                </form>

                <p style={{ marginTop: 22, fontSize: '.78rem', color: 'var(--dim)' }}>
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                        style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontWeight: 700, fontSize: '.78rem', padding: 0 }}>
                        {mode === 'login' ? 'Create one →' : '← Sign in'}
                    </button>
                </p>

                <p style={{ marginTop: 14, fontSize: '.68rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                    Each account has its own private data.<br />
                    Clients and trades are never shared between accounts.
                </p>
            </div>
        </div>
    );
}
