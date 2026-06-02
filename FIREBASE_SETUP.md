# 🔥 Firebase Setup Guide for StockDesk Pro

## Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click **"Add Project"** → Name: `stockdesk-pro`
3. Disable Google Analytics (optional) → Click **"Create Project"**

## Step 2: Enable Firestore
1. In Firebase Console → Click **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose a location → Click **"Enable"**

## Step 3: Get Your Config
1. Go to **Project Settings** (⚙️ icon) → **General**
2. Scroll down to **"Your apps"** → Click **"</>"** (Web app)
3. Register app name: `stockdesk-web`
4. Copy the firebaseConfig object

## Step 4: Update index.html
Open `index.html` and replace the config section:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",           // ← Your actual key
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123:web:abc123"
};
```

## Step 5: Open the App
Simply double-click `index.html` to open in your browser!
(Or drag it to Chrome/Edge/Firefox)

## Step 6: Configure Firestore Security Rules
To prevent data from vanishing, you must configure Firestore Security Rules to allow reads/writes for logged-in users under their specific user IDs.

1. Go to the **Firebase Console** → click **"Firestore Database"**.
2. Click the **"Rules"** tab.
3. Replace the existing rules with the following rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Secure user-scoped data collections
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
4. Click **"Publish"** to deploy the rules.

---

## 📊 Collections Created in Firestore
- **clients** — Client information
- **trades** — All buy/sell transaction records

## 🎯 Features
- ✅ Dashboard with live stats
- ✅ Client management (add/edit/delete)
- ✅ Trade entry (Buy/Sell) with live summary
- ✅ Auto brokerage calculation by client rate
- ✅ Trade history with filters
- ✅ Portfolio view per client
- ✅ Brokerage earnings report
- ✅ Demo mode with sample data (works offline)

---
> **Note:** Without Firebase config, the app runs in Demo Mode 
> with sample data. All changes are stored in memory only.
