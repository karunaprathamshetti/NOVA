# 🌊 StreamFlow

**StreamFlow** is a premium, real-time social streaming platform designed for creators and communities. Built with high-performance technologies and a stunning **Rose & Slate** design aesthetic, StreamFlow offers a seamless experience for broadcasters and viewers alike.

![StreamFlow Preview](https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000)

## ✨ Core Features

- 📹 **Pro-Grade Streaming**: Integrated with OBS Studio for high-definition RTMP broadcasting.
- 🔍 **Real-time Discovery**: Instant profile search with live-status indicators.
- 📱 **Social Hub**: Share photos, videos, and text posts with your community.
- 🔔 **Smart Notifications**: Real-time alerts for follows, going live, and milestones.
- 🎨 **Rose & Slate Design**: A custom design system featuring glassmorphism, neural inputs, and dynamic animations.
- 🌓 **Dark/Light Mode**: Fully responsive theme switching that respects user preference.

## 🚀 Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + Vanilla CSS (Design System)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **State Management**: Zustand
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 🛠️ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/your-username/streamcraft-hub.git
cd streamcraft-hub
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
Run the SQL found in `supabase_schema.sql` in your Supabase SQL Editor to set up the necessary tables and RLS policies.

### 5. Run the development server
```bash
npm run dev
```

## 📺 Streaming with OBS

1. Open **OBS Studio**.
2. Go to **Settings > Output** and set **Output Mode** to **Simple**.
3. Set **Encoder** to **Software (x264)**.
4. Go to **Settings > Stream** and select **Custom**.
5. Paste your **RTMP URL** and **Stream Key** from your StreamFlow Dashboard.
6. Click **Start Streaming**!

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with 💖 by the StreamFlow Team.
