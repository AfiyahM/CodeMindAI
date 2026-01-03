# 🚀 Quick Reference - CodeMind.AI

## ⚡ Quick Start

```bash
# Terminal 1 - Backend
cd server
npm start        ← NOT "nom start" 😊

# Terminal 2 - Frontend
cd client
npm run dev
```

**Open:** http://localhost:3000

---

## 🎨 New Features

### 1. Mind Map (🌐)
- **Tree View**: File hierarchy
- **Radial View**: Circular visualization
- **Zoom**: 50% - 200%

### 2. Themes (⚙️ Settings)
- Dark+ (default)
- Monokai
- GitHub Dark
- One Dark Pro
- Dracula

### 3. Settings Panel (⚙️)
- Theme selector
- Font size (10-24px)
- Editor options
- AI configuration
- Notifications

---

## 📊 Activity Bar Icons

```
┌─────────────┐
│ 📁 Explorer │ ← Files & folders
│ 🔍 Search   │ ← Find in files
│ 🌿 Git      │ ← Source control
│ 🌐 Mind Map │ ← NEW! Visualize code
│ 💬 AI Chat  │ ← AI assistant
│ 📦 Layers   │ ← Extensions
│─────────────│
│ ⚙️ Settings │ ← Preferences
└─────────────┘
```

---

## 🎯 Keyboard Shortcuts (Coming Soon)

```
Ctrl + B        Toggle sidebar
Ctrl + `        Toggle terminal
Ctrl + Shift+P  Command palette
Ctrl + P        Quick open
Ctrl + /        Toggle comment
```

---

## 🎨 Color Schemes

### Dark+ (Default)
- Background: `#1e1e1e`
- Accent: `#007acc`
- Perfect for: All-day coding

### Monokai
- Background: `#272822`
- Accent: `#66d9ef`
- Perfect for: Vibrant colors

### GitHub Dark
- Background: `#0d1117`
- Accent: `#1f6feb`
- Perfect for: GitHub users

### One Dark Pro
- Background: `#282c34`
- Accent: `#61afef`
- Perfect for: Atom users

### Dracula
- Background: `#282a36`
- Accent: `#bd93f9`
- Perfect for: Night coding

---

## 💡 Pro Tips

1. **Mind Map Best Practices**
   - Start with Tree view
   - Switch to Radial for overview
   - Zoom in for details

2. **Theme Selection**
   - Try different themes
   - Pick based on lighting
   - Changes apply instantly

3. **AI Assistant**
   - Be specific in questions
   - Include code context
   - Use for: debugging, explaining, refactoring

4. **File Navigation**
   - Use Explorer for browsing
   - Search for finding files
   - Mind Map for structure

---

## 🐛 Common Issues

### "nom: command not found"
**Fix:** Use `npm` not `nom`
```bash
npm start  ✅
nom start  ❌
```

### Network Error in AI
**Fix:** Start backend server
```bash
cd server && npm start
```

### UI looks broken
**Fix:** Clear cache
```bash
cd client
rm -rf .next
npm run dev
```

---

## 📏 UI Measurements

**Sidebar Widths:**
- Explorer: 250px
- Search: 250px
- Git: 250px
- Mind Map: 400px ← Wider!
- AI Chat: 350px
- Settings: 250px

**Activity Bar:** 48px
**Status Bar:** 24px
**Editor Tabs:** 36px
**Panel:** 200px (default)

---

## 🎨 Icon Reference

**File Types:**
- 📁 Folder: `#dcb67a` (yellow)
- 📄 File: `#519aba` (blue)
- ⚙️ Component: `#c586c0` (purple)
- 🔧 Function: `#dcdcaa` (light yellow)
- 📦 Class: `#4ec9b0` (cyan)

---

## ✅ Checklist

Before coding:
- [ ] Backend running (port 4000)
- [ ] Frontend running (port 3000)
- [ ] GitHub signed in
- [ ] Theme selected
- [ ] Font size comfortable

---

## 🆘 Help

**Documentation:**
- SETUP_GUIDE.md - Full setup
- QUICK_FIX.md - Troubleshooting
- UI_ENHANCEMENTS.md - Feature details

**Check Status:**
```bash
# Backend health
curl http://localhost:4000/health

# Frontend
# Open: http://localhost:3000
```

---

## 🎉 You're All Set!

1. Run servers: `npm start` (server), `npm run dev` (client)
2. Open: http://localhost:3000
3. Sign in with GitHub
4. Explore new features!

**Enjoy your enhanced IDE! 🚀**
