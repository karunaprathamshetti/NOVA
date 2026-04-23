# 🌌 Nova: The Standalone Streaming Empire

**Nova** is a premium, real-time standalone streaming ecosystem designed for absolute independence. Built for creators who want full control, Nova removes the need for external software like OBS or third-party platforms like YouTube, offering a native, pro-grade broadcasting experience directly in the browser.

![Nova Cinematic Intro](https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000)

## ✨ Core Innovations

- 📹 **Nova Studio**: Direct-from-browser broadcasting in 1080p. No external encoders required.
- 📡 **Global Stream Persistence**: Our custom-built 'Global Control Room' (Zustand-powered) keeps your camera feed active even as you navigate between pages.
- 🌍 **Cinematic 3D Intro**: A high-end interactive 3D globe introduction with real-time global node synchronization and a dramatic **Heavy Mist transition**.
- 🤝 **Robust Social Graph**: Advanced follow logic with automatic database syncing, isolated notification handling, and optimistic UI updates for a seamless user experience.
- 🚦 **Advanced SPA Routing**: Custom Vercel routing configuration (`vercel.json`) that guarantees zero 404 errors for complex OAuth redirects and password recoveries.
- 🔍 **Real-time Discovery**: Instant profile search with live-status indicators and PostgreSQL Real-time synchronization.
- 📱 **Community Hub**: Share photos, videos, and text posts directly with your audience.
- 🔔 **Smart Notifications**: Real-time alerts for follows, going live, and community milestones.
- 🎨 **Nova Aesthetic**: A curated design system using **Terra Cotta & Slate**, featuring glassmorphism, neural inputs, and cinematic blurs.

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite
- **3D Graphics**: Cobe (Interative Global Engine)
- **Styling**: Tailwind CSS + Custom Design Tokens
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Real-time)
- **State Management**: Zustand (Global Broadcasting Engine)
- **Icons**: Lucide React

## 🛠️ Getting Started

### 1. Clone and Install
```bash
git clone https://github.com/your-username/nova-stream.git
cd nova-stream
npm install
```

### 2. Environment Setup
Create a `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Launch
```bash
npm run dev
```

## 🎥 Deployment Guide

### GitHub Push
1. Create a new repository on GitHub.
2. Run the following:
   ```bash
   git add .
   git commit -m "Initial release of Nova Standalone Platform"
   git branch -M main
   git remote add origin https://github.com/your-username/your-repo-name.git
   git push -u origin main
   ```

### Vercel Deployment (Recommended)
1. Import your repository into **Vercel**.
2. Set the **Framework Preset** to `Vite`.
3. Add your Environment Variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).
4. Click **Deploy**!

---

Built with 💖 by the Nova Team. 🌌🚀
