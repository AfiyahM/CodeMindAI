# 🔧 Network Error - Quick Fix Guide

## ❌ Error You're Seeing
```
AxiosError: Network Error
Cannot connect to AI service
```

## ✅ Solution

The error occurs because the **backend server is not running**. You need to run BOTH servers.

---

## 🚀 Quick Start (Choose One Method)

### Method 1: Batch Script (Easiest - Windows)
```bash
# Double-click this file:
START_SERVERS.bat
```
This will automatically start both servers in separate windows.

### Method 2: Manual (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd server
npm start
```
Wait for: `Server running on http://localhost:4000`

**Terminal 2 - Frontend:**
```bash
cd client  
npm run dev
```
Wait for: `Ready on http://localhost:3000`

### Method 3: Using npm scripts
```bash
# Terminal 1
npm run server

# Terminal 2  
npm run client
```

---

## ✅ How to Verify It's Fixed

1. **Backend Running:**
   - Open: http://localhost:4000/health
   - Should see: `{"status":"ok"}`

2. **Frontend Running:**
   - Open: http://localhost:3000
   - Should see the CodeMind.AI login page

3. **Try AI Feature:**
   - Sign in with GitHub
   - Open a file
   - Click "AI Suggest" button
   - Error should be gone!

---

## 🎨 What's Been Fixed

### 1. ✅ CodeEditor Component Updated
**File:** `client/components/CodeEditor.tsx`

**Changes:**
- ✅ Added proper error handling for network errors
- ✅ Clear error messages with helpful instructions
- ✅ VS Code-style UI with dark theme
- ✅ Better visual feedback (loading spinner, icons)
- ✅ Improved error display with close button
- ✅ Enhanced AI suggestion panel

**New Features:**
- Loading state with spinner
- Detailed error messages
- VS Code colors (#1e1e1e, #007acc)
- Better typography and spacing
- Monaco editor optimizations

### 2. ✅ Server Package.json Updated
**File:** `server/package.json`

**Added:**
```json
"scripts": {
  "start": "node index.js",
  "dev": "node index.js"
}
```

### 3. ✅ Helper Files Created
- `SETUP_GUIDE.md` - Complete setup instructions
- `START_SERVERS.bat` - Auto-start script for Windows
- `QUICK_FIX.md` - This file

---

## 🎯 What to Do Next

1. **Start both servers** (use any method above)
2. **Refresh your browser** (Ctrl + F5)
3. **Try the AI features** - error should be gone!

---

## 📍 Current Status

### ✅ Fixed
- Network error handling
- CodeEditor UI (VS Code style)
- Error messages
- Server scripts
- Documentation

### ⚠️ Requires Action
- **Start the backend server** (port 4000)
- Install Ollama if you want AI features:
  ```bash
  # Visit: https://ollama.ai
  # Then run:
  ollama pull codellama:7b-instruct
  ```

---

## 🆘 Still Having Issues?

### Check These:

1. **Port 4000 in use?**
   ```bash
   netstat -ano | findstr :4000
   ```

2. **Dependencies installed?**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

3. **Node version?**
   ```bash
   node --version
   # Should be v18 or higher
   ```

---

## 📝 Summary

The network error happens because the frontend (port 3000) tries to connect to the backend (port 4000), but the backend isn't running.

**Fix = Run both servers!**

```bash
# Terminal 1
cd server && npm start

# Terminal 2  
cd client && npm run dev
```

**That's it! 🎉**
