export const STOCKS = [
    { s: 'RELIANCE', n: 'Reliance Industries Ltd.' },
    { s: 'TCS', n: 'Tata Consultancy Services Ltd.' },
    { s: 'HDFCBANK', n: 'HDFC Bank Ltd.' },
    { s: 'ICICIBANK', n: 'ICICI Bank Ltd.' },
    { s: 'INFY', n: 'Infosys Ltd.' },
    { s: 'SBIN', n: 'State Bank of India' },
    { s: 'BHARTIARTL', n: 'Bharti Airtel Ltd.' },
    { s: 'ITC', n: 'ITC Ltd.' },
    { s: 'HINDUNILVR', n: 'Hindustan Unilever Ltd.' },
    { s: 'LT', n: 'Larsen & Toubro Ltd.' },
    { s: 'BAJFINANCE', n: 'Bajaj Finance Ltd.' },
    { s: 'HCLTECH', n: 'HCL Technologies Ltd.' },
    { s: 'MARUTI', n: 'Maruti Suzuki India Ltd.' },
    { s: 'SUNPHARMA', n: 'Sun Pharmaceutical Industries Ltd.' },
    { s: 'TATAMOTORS', n: 'Tata Motors Ltd.' },
    { s: 'ASIANPAINT', n: 'Asian Paints Ltd.' },
    { s: 'M&M', n: 'Mahindra & Mahindra Ltd.' },
    { s: 'TATASTEEL', n: 'Tata Steel Ltd.' },
    { s: 'NTPC', n: 'NTPC Ltd.' },
    { s: 'KOTAKBANK', n: 'Kotak Mahindra Bank Ltd.' },
    { s: 'AXISBANK', n: 'Axis Bank Ltd.' },
    { s: 'WIPRO', n: 'Wipro Ltd.' },
    { s: 'ONGC', n: 'Oil & Natural Gas Corp. Ltd.' },
    { s: 'HDFCLIFE', n: 'HDFC Life Insurance Co. Ltd.' },
    { s: 'TITAN', n: 'Titan Company Ltd.' },
    { s: 'ADANIENT', n: 'Adani Enterprises Ltd.' },
    { s: 'ADANIPORTS', n: 'Adani Ports & SEZ Ltd.' },
    { s: 'COALINDIA', n: 'Coal India Ltd.' },
    { s: 'BAJAJFINSV', n: 'Bajaj Finserv Ltd.' },
    { s: 'ULTRACEMCO', n: 'UltraTech Cement Ltd.' },
    { s: 'POWERGRID', n: 'Power Grid Corp. of India Ltd.' },
    { s: 'BAJAJ-AUTO', n: 'Bajaj Auto Ltd.' },
    { s: 'TECHM', n: 'Tech Mahindra Ltd.' },
    { s: 'GRASIM', n: 'Grasim Industries Ltd.' },
    { s: 'HINDALCO', n: 'Hindalco Industries Ltd.' },
    { s: 'JSWSTEEL', n: 'JSW Steel Ltd.' },
    { s: 'APOLLOHOSP', n: 'Apollo Hospitals Enterprise Ltd.' },
    { s: 'SBILIFE', n: 'SBI Life Insurance Co. Ltd.' },
    { s: 'EICHERMOT', n: 'Eicher Motors Ltd.' },
    { s: 'DRREDDY', n: 'Dr. Reddy\'s Laboratories Ltd.' },
    { s: 'CIPLA', n: 'Cipla Ltd.' },
    { s: 'DIVISLAB', n: 'Divi\'s Laboratories Ltd.' },
    { s: 'BRITANNIA', n: 'Britannia Industries Ltd.' },
    { s: 'BPC', n: 'Bharat Petroleum Corp. Ltd.' },
    { s: 'TATACONSUM', n: 'Tata Consumer Products Ltd.' },
    { s: 'INDUSINDBK', n: 'IndusInd Bank Ltd.' },
    { s: 'MUKANDLTD', n: 'Mukand Ltd.' },
    { s: 'ZOMATO', n: 'Zomato Ltd.' },
    { s: 'PAYTM', n: 'One97 Communications Ltd.' },
    { s: 'NYKAA', n: 'FSN E-Commerce Ventures Ltd.' }
];

export const fmt = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);
export const fmtN = n => new Intl.NumberFormat('en-IN').format(n || 0);
export const fmtD = d => {
    if (!d) return '—';
    try {
        const dt = d.toDate ? d.toDate() : new Date(d);
        if (isNaN(dt)) return String(d);
        return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }).format(dt);
    } catch { return String(d); }
};
export const dfD = d => {
    if (!d) return '—';
    try {
        const dt = d.toDate ? d.toDate() : new Date(d);
        if (isNaN(dt)) return String(d);
        return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(dt);
    } catch { return String(d); }
};
export const gid = () => Math.random().toString(36).substring(2, 8).toUpperCase();
export const ini = n => (n || '?').substring(0, 1).toUpperCase();
export const ac = n => { const c = ['bl', 'gr', 're', 'am', 'pu', 'te']; return `var(--${c[(n || '').length % c.length]})`; };
