# 🚀 CodeMind.AI Setup Guide

## Overview
CodeMind.AI is a VS Code-like IDE with integrated AI assistance. It consists of:
- **Frontend (Client)**: Next.js app on port 3000
- **Backend (Server)**: Express API on port 4000
- **AI Service**: Ollama (local LLM)

---

## 📋 Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Ollama** (for AI features)
4. **GitHub Account** (for authentication)

---

## 🔧 Installation Steps

### 1️⃣ Install Dependencies

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 2️⃣ Setup Ollama (AI Service)

**Install Ollama:**
- Visit: https://ollama.ai
- Download and install for your OS

**Pull the required model:**
```bash
ollama pull codellama:7b-instruct
```

**Verify Ollama is running:**
```bash
ollama list
# Should show codellama models
```

### 3️⃣ Configure Environment Variables

**Client (.env.local):**
```bash
cd client
# Create .env.local file (already exists, verify values)
```

**Server (.env):**
```bash
cd server
# Create .env file if needed (optional for now)
```

---

## 🏃‍♂️ Running the Application

### Option 1: Run Both Servers (Recommended)

**Terminal 1 - Backend Server:**
```bash
cd server
npm start
# Server will start on http://localhost:4000
```

**Terminal 2 - Frontend Client:**
```bash
cd client
npm run dev
# Client will start on http://localhost:3000
```

**Terminal 3 - Ollama (if not running as service):**
```bash
ollama serve
# Ollama will start on http://localhost:11434
```

### Option 2: Using Package Scripts

From the root directory:
```bash
# Start backend
npm run server

# Start frontend  
npm run client
```

---

## ✅ Verify Everything Works

1. **Check Ollama:**
   ```bash
   curl http://localhost:11434/api/tags
   ```

2. **Check Backend API:**
   ```bash
   curl http://localhost:4000/health
   # Should return: {"status":"ok"}
   ```

3. **Check Frontend:**
   - Open browser: http://localhost:3000
   - You should see the CodeMind.AI login page

---

## 🐛 Common Issues & Solutions

### ❌ Network Error: Cannot connect to AI service

**Problem:** Frontend can't reach the backend API

**Solutions:**
1. Ensure backend server is running:
   ```bash
   cd server
   npm start
   ```

2. Check if port 4000 is available:
   ```bash
   # Windows
   netstat -ano | findstr :4000
   
   # Mac/Linux
   lsof -i :4000
   ```

3. Verify CORS settings in `server/index.js`

### ❌ Ollama Model Not Found

**Problem:** AI suggestions fail with model error

**Solutions:**
1. Install the model:
   ```bash
   ollama pull codellama:7b-instruct
   ```

2. Check Ollama is running:
   ```bash
   ollama list
   ```

3. Restart Ollama service

### ❌ GitHub Authentication Fails

**Problem:** Can't sign in with GitHub

**Solutions:**
1. Check Firebase config in `client/lib/firebase.ts`
2. Verify GitHub OAuth app settings
3. Clear browser cookies and try again

### ❌ Port Already in Use

**Problem:** Port 3000 or 4000 is busy

**Solutions:**
```bash
# Kill process on port (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Kill process on port (Mac/Linux)
lsof -ti:3000 | xargs kill -9
```

---

## 🎨 Features

### VS Code-Like Interface
- ✅ Activity Bar (Explorer, Search, Git, AI, Extensions)
- ✅ Sidebar with multiple views
- ✅ Editor with Monaco (VS Code's editor)
- ✅ File tabs with close buttons
- ✅ Status bar with real-time info
- ✅ Terminal/Problems/Output panel

### AI Integration
- ✅ AI Chat Assistant (click 💬 icon)
- ✅ Code completion suggestions
- ✅ Repository analysis
- ✅ Code explanations

### GitHub Integration
- ✅ Browse your repositories
- ✅ View and edit files
- ✅ File tree navigation

---

## 📱 Usage

1. **Sign in** with GitHub
2. **Select a repository** from Explorer
3. **Click files** to view/edit
4. **Use AI Assistant** (💬 icon) for help
5. **Click "AI Suggest"** in editor for code completions

---

## 🔌 API Endpoints

### Backend (Port 4000)

```
GET  /health                    - Health check
POST /api/ai/complete          - Code completion
POST /api/ai/chat              - AI chat conversation
POST /api/ai/analyze-repo      - Repository analysis
POST /api/ai/explain           - Code explanation
```

---

## 🛠️ Development

### Project Structure
```
codemind1/
├── client/                 # Next.js frontend
│   ├── app/               # App routes
│   ├── components/        # React components
│   │   ├── layout/       # IDE layout components
│   │   └── views/        # Sidebar views
│   └── lib/              # Utilities
├── server/                # Express backend
│   ├── routes/           # API routes
│   │   ├── ai.js        # AI endpoints
│   │   └── github.js    # GitHub endpoints
│   └── index.js         # Server entry
└── SETUP_GUIDE.md        # This file
```

---

## 🆘 Need Help?

1. Check the console for errors (F12 in browser)
2. Check server logs in the terminal
3. Ensure all services are running:
   - ✅ Ollama on port 11434
   - ✅ Backend on port 4000
   - ✅ Frontend on port 3000

---

## 🚀 Quick Start (TL;DR)

```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start Backend
cd server && npm start

# Terminal 3: Start Frontend
cd client && npm run dev

# Open: http://localhost:3000
```

**That's it! Enjoy coding with AI! 🎉**
