# 🖐️ Neural Sculptor — Hand Tracking 3D App

> Control a 3D glass object with just your hand using AI-powered hand tracking and WebGL rendering.

[![Live Demo](https://img.shields.io/badge/▶_Live_Demo-CyberSlide-00f5d4?style=for-the-badge&logo=github)](https://clashlex.github.io/hand-tracking-app)
![Tech](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![Tech](https://img.shields.io/badge/Three.js-r184-black?style=flat-square&logo=threedotjs)
![Tech](https://img.shields.io/badge/MediaPipe-0.10-blue?style=flat-square)
![Tech](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## ✨ Features

- **Real-time Hand Tracking** — MediaPipe detects your index finger at 60fps via webcam
- **3D Glass Blob** — A torus knot with physically-based glass/refraction material that follows your hand
- **GPU Accelerated AI** — MediaPipe runs on GPU delegate for near-zero latency
- **Skiper UI Overlays** — Glassmorphism HUD panel with live X/Y coordinate tracking
- **Animated Loading Screen** — Spinning orb with progress bar while the neural engine boots
- **Hand Detection Status** — Real-time green/red indicator showing tracking state
- **Smooth Lerp Movement** — Buttery 60fps interpolation between hand positions
- **Dark Cinematic UI** — Vignette, gradient text, and ClashLex branding

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 + Vite |
| 3D Rendering | React Three Fiber + Three.js |
| 3D Helpers | @react-three/drei |
| AI / Vision | MediaPipe Hand Landmarker |
| Styling | Inline CSS + CSS Variables |
| Deployment | GitHub Pages + GitHub Actions |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A webcam
- A modern browser (Chrome recommended for GPU support)

### Installation

```bash
git clone https://github.com/ClashLex/hand-tracking-app.git
cd hand-tracking-app
npm install
npm run dev
```

Then open `http://localhost:5173` and allow camera access.

---

## 🎮 How to Use

1. Open the app in your browser
2. Allow webcam permission when prompted
3. Wait for **"Initializing GPU..."** to complete
4. Hold your hand in front of the camera
5. Move your **index finger** to control the 3D glass blob
6. Watch the HUD panel track your coordinates in real time

---

## 📁 Project Structure

```
hand-tracking-app/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx          # Main app — 3D scene + AI logic + UI overlays
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── index.html
├── vite.config.js
└── package.json
```

---

## 🧠 How It Works

```
Webcam Feed
    ↓
MediaPipe Hand Landmarker (GPU)
    ↓
Index Finger Tip (Landmark #8) coordinates
    ↓
Mutable React Ref (bypasses re-renders)
    ↓
React Three Fiber useFrame (60fps)
    ↓
Lerp → Torus Knot Position Update
```

The hand coordinates are stored in a **mutable ref** instead of React state — this prevents 60 re-renders per second and keeps the 3D animation buttery smooth.

---

## 👤 Author

**ClashLex** — [github.com/ClashLex](https://github.com/ClashLex)

---

## 📄 License

MIT — free to use and modify.

