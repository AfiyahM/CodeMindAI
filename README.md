# 🚀 CodeMind.AI - AI-Powered Code Editor

<div align="center">

![CodeMind.AI](https://img.shields.io/badge/CodeMind.AI-v1.0.0-blue)
![VS Code Style](https://img.shields.io/badge/UI-VS_Code_Style-007acc)
![AI Powered](https://img.shields.io/badge/AI-Powered-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)

**A professional VS Code-like IDE with integrated AI assistance, mind mapping, and GitHub integration.**

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Screenshots](#screenshots)

</div>

---

## ✨ Features

### 🎨 **VS Code-Like Interface**
- **Activity Bar** - Quick access to all views
- **Sidebar** - Dynamic width based on content
- **Monaco Editor** - The same editor as VS Code
- **Editor Tabs** - Multiple file support
- **Status Bar** - Real-time information
- **Bottom Panel** - Terminal, Problems, Output

### 🧠 **Mind Map Visualization** (NEW!)
- **Tree View** - Hierarchical file structure
- **Radial View** - Circular mind map
- **Zoom Controls** - 50% to 200% zoom
- **Interactive** - Click to explore

### 🎨 **5 Beautiful Themes** (NEW!)
- **Dark+** - Classic VS Code dark theme
- **Monokai** - Vibrant syntax highlighting
- **GitHub Dark** - GitHub's official dark theme
- **One Dark Pro** - Atom's popular theme
- **Dracula** - Popular purple theme

### 🤖 **AI Integration**
- **Code Completion** - Smart suggestions
- **AI Chat Assistant** - Conversational help
- **Repository Analysis** - Deep code insights
- **Code Explanation** - Understand complex code

### 🐙 **GitHub Integration**
- **OAuth Login** - Secure authentication
- **Repository Browser** - Access all your repos
- **File Explorer** - Tree view navigation
- **File Editor** - View and edit files

### ⚙️ **Comprehensive Settings** (NEW!)
- **Theme Selector** - Switch themes instantly
- **Font Control** - 10px to 24px
- **Editor Options** - Minimap, line numbers
- **AI Configuration** - Customize AI behavior
- **Notifications** - Control alerts

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm or yarn
- GitHub account
- Ollama (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/codemind1.git
cd codemind1

# Install dependencies
cd client && npm install
cd ../server && npm install
```

### Install Ollama (AI Service)

```bash
# Visit: https://ollama.ai
# Download and install for your OS

# Pull the AI model
ollama pull codellama:7b-instruct
```

### Start the Application

**Option 1: Batch Script (Windows)**
```bash
# Just double-click:
START_SERVERS.bat
```

**Option 2: Manual (Two Terminals)**
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

**Option 3: npm scripts**
```bash
# Terminal 1
npm run server

# Terminal 2
npm run client
```

### Open in Browser
```
http://localhost:3000
```

---

## 📸 Screenshots

### Main Interface
```
┌────────────────────────────────────────────────────────────┐
│  Activity  │  Sidebar     │  Editor Area                   │
│  Bar       │  (Explorer)  │  ┌──────────────────────────┐ │
│  ┌──┐     │  📁 Project  │  │ file.tsx  code.js       │ │
│  │📁│     │  ├─📁 src    │  ├──────────────────────────┤ │
│  │🔍│     │  └─📁 dist   │  │ Your Code Here          │ │
│  │🌿│     │              │  │                          │ │
│  │🌐│←NEW │              │  │ Monaco Editor           │ │
│  │💬│     │              │  │                          │ │
│  │📦│     │              │  │ Syntax Highlighting     │ │
│  │⚙️│     │              │  └──────────────────────────┘ │
│  └──┘     └──────────────┴────────────────────────────────┘
│  Status Bar: main | AI Ready | Ln 42, Col 15 | TypeScript │
└────────────────────────────────────────────────────────────┘
```

---

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup instructions
- **[QUICK_FIX.md](QUICK_FIX.md)** - Troubleshooting guide
- **[UI_ENHANCEMENTS.md](UI_ENHANCEMENTS.md)** - New feature details
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Cheat sheet
- **[UI_LAYOUT.txt](UI_LAYOUT.txt)** - Visual layout diagrams

---

## 🎯 Usage

### 1. Sign In
```bash
1. Open http://localhost:3000
2. Click "Sign in with GitHub"
3. Authorize the application
```

### 2. Browse Repositories
```bash
1. View your repos in Explorer (📁)
2. Click a repository to open it
3. Navigate files in the tree view
```

### 3. Edit Code
```bash
1. Click any file to open
2. Edit in Monaco editor
3. Use AI Suggest for help
```

### 4. Use Mind Map (NEW!)
```bash
1. Click Mind Map icon (🌐)
2. Select view: Tree or Radial
3. Zoom and explore structure
```

### 5. Chat with AI
```bash
1. Click AI Assistant (💬)
2. Type your question
3. Get instant answers
```

### 6. Change Theme (NEW!)
```bash
1. Click Settings (⚙️)
2. Select Color Theme
3. Pick your favorite
```

---

## 🏗️ Project Structure

```
codemind1/
├── client/                    # Next.js frontend
│   ├── app/                  # App routes
│   │   ├── page.tsx         # Home page
│   │   ├── layout.tsx       # Root layout
│   │   └── repo/[owner]/[repo]/  # Repository viewer
│   ├── components/
│   │   ├── layout/          # IDE layout components
│   │   │   ├── ActivityBar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── IDELayout.tsx
│   │   │   ├── EditorTabs.tsx
│   │   │   ├── StatusBar.tsx
│   │   │   └── Panel.tsx
│   │   ├── views/           # Sidebar views
│   │   │   ├── ExplorerView.tsx
│   │   │   ├── SearchView.tsx
│   │   │   ├── GitView.tsx
│   │   │   ├── MindMapView.tsx    ← NEW!
│   │   │   ├── AIChatView.tsx
│   │   │   └── SettingsView.tsx   ← NEW!
│   │   └── CodeEditor.tsx   # Monaco wrapper
│   └── lib/
│       ├── firebase.ts      # GitHub OAuth
│       └── theme.ts         # Theme system ← NEW!
├── server/                   # Express backend
│   ├── routes/
│   │   ├── ai.js           # AI endpoints
│   │   └── github.js       # GitHub API
│   └── index.js            # Server entry
├── START_SERVERS.bat        # Auto-start script
├── SETUP_GUIDE.md          # Setup instructions
├── QUICK_FIX.md            # Troubleshooting
└── README.md               # This file
```

---

## 🔌 API Endpoints

### Backend (http://localhost:4000)

```
GET  /health                - Health check
POST /api/ai/complete       - Code completion
POST /api/ai/chat           - AI conversation
POST /api/ai/analyze-repo   - Repository analysis
POST /api/ai/explain        - Code explanation
```

---

## 🎨 Available Themes

| Theme | Background | Accent | Best For |
|-------|-----------|---------|----------|
| Dark+ | `#1e1e1e` | `#007acc` | All-day coding |
| Monokai | `#272822` | `#66d9ef` | Vibrant colors |
| GitHub Dark | `#0d1117` | `#1f6feb` | GitHub users |
| One Dark Pro | `#282c34` | `#61afef` | Atom users |
| Dracula | `#282a36` | `#bd93f9` | Night coding |

---

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Monaco Editor** - Code editor
- **TailwindCSS** - Styling
- **Lucide React** - Icons
- **Firebase** - Authentication

### Backend
- **Express.js** - Web server
- **Ollama** - Local AI
- **Axios** - HTTP client
- **CORS** - Cross-origin support

---

## ⚙️ Configuration

### Environment Variables

**Client (.env.local)**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
```

**Server (.env)**
```env
PORT=4000
OLLAMA_HOST=http://localhost:11434
```

---

## 🐛 Troubleshooting

### Network Error
**Problem:** Cannot connect to AI service

**Solution:**
```bash
# Start the backend server
cd server
npm start
```

### Ollama Not Found
**Problem:** AI features don't work

**Solution:**
```bash
# Install Ollama from https://ollama.ai
# Pull the model
ollama pull codellama:7b-instruct
```

### Port Already in Use
**Problem:** Port 3000 or 4000 busy

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **VS Code** - UI inspiration
- **Monaco Editor** - Code editor
- **Ollama** - Local AI inference
- **GitHub** - Repository hosting
- **Firebase** - Authentication

---

## 📞 Support

- 📖 Documentation: See docs folder
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

---

## 🗺️ Roadmap

- [ ] Collaborative editing
- [ ] More AI models
- [ ] Plugin system
- [ ] Mobile app
- [ ] Cloud sync
- [ ] More themes

---

<div align="center">

**Made with ❤️ by the CodeMind.AI Team**

⭐ Star this repo if you find it helpful!

[Back to Top](#-codemindai---ai-powered-code-editor)

</div>
# CodeMindAI
