# StockDesk Pro 📈

A professional **multi-tenant stock brokerage management system** built with React + Vite + Firebase.

## Features

- 🔐 **Multi-tenant auth** — each broker account has completely isolated data
- 👥 **Client Management** — add/edit/delete clients with custom brokerage rates
- 📈 **Trade Entry** — record buy/sell orders with auto brokerage calculation
- 📋 **Trade History** — searchable/filterable trade log with inline editing
- 💼 **Portfolio View** — per-client stock holdings and realized P&L
- 💰 **Brokerage Report** — daily earnings trend and top clients by revenue
- 📑 **Weekly Settlement Reports** — client-wise billing, P&L, and net payable
- 🚪 **Secure Sign Out** — with Firebase Authentication

## Tech Stack

| Layer       | Technology               |
|-------------|--------------------------|
| Frontend    | React 18 + Vite          |
| Styling     | Vanilla CSS (dark theme) |
| Auth        | Firebase Authentication  |
| Database    | Cloud Firestore          |
| Hosting     | Firebase Hosting         |

## Data Architecture

All data is **scoped per user** in Firestore subcollections:
```
/users/{uid}/clients/{clientId}
/users/{uid}/trades/{tradeId}
```
This ensures zero data leakage between different broker accounts.

## Getting Started

### Prerequisites
- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)

### Local Development

```bash
cd stockdesk-web
npm install
npm run dev
```

### Deploy to Firebase Hosting

```bash
cd stockdesk-web
npm run build
cd ..
firebase deploy --only hosting
```

## Environment

Firebase config is currently inline in `src/utils/firebase.js`.  
For production, move secrets to a `.env` file:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

## License

Private — All rights reserved.
