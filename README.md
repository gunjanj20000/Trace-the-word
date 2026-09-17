# Trace A Word - Word Tracing & Early Literacy PWA

A beautiful, sensory-friendly, production-ready Progressive Web App (PWA) designed primarily for autistic, neurodivergent, and nonverbal children, but engaging and accessible for all early learners.

---

## 🌟 Key Features

### 1. Genuine SVG Vector Tracing Engine
- Scalable vector tracing engine across iPhone, Android, iPad, tablets, desktops, and interactive touchscreens.
- All 26 uppercase English letters (A–Z) with:
  - Accurate stroke ordering and direction hints
  - Start point indicator with glowing pulsing target
  - Animated directional chevrons
  - Proximity tracking and coverage calculation along sampled vector curves
  - Configurable tolerance settings:
    - **Easy**: Extra thick guide (42px tolerance), high forgiveness (~70% completion), guided hints
    - **Medium**: Moderate stroke guide (28px tolerance), ~80% completion
    - **Advanced**: Sleek guide (18px tolerance), ~88% completion for independent writing
- **Sensory-Friendly Philosophy**: Mistakes are **never** penalized with jarring buzzers or red X marks. The engine gently guides the child back with a soft, supportive glowing hint.

### 2. Multi-Tier Practice Modes
1. **Guided Mode**: One letter at a time with a massive centered tracing canvas. Optimal for early learners and focused attention.
2. **Word Mode**: Shows the complete word (e.g. `B A L L`) with interactive progress tabs while highlighting and sequencing the active letter.
3. **Free Practice**: Direct A–Z letter selector carousel allowing repeated practice and audio listening of any individual letter without completing words.

### 3. Gentle Celebration & Multisensory Learning
- **Calm Celebrations**: Gentle floating stars, balloons, sparkles, or soft pastel confetti (customizable or can be toggled completely off).
- **Multisensory Output**:
  - Offline-first Web Audio API synthesized marimba and chime melodies (gentle sine/triangle waves with smooth exponential decays, no harsh transients).
  - Web Speech API text-to-speech (TTS) fallback.
  - Optional Phonics pronunciation (e.g. `B` → *"buh"*, `A` → *"ah"*, `L` → *"lll"*, followed by the whole word *"BALL"*).
  - Custom audio recording directly inside the app using microphone or pre-recorded MP3/WebM file upload.

### 4. Rich Built-in Offline Library
- Preloaded with **50 child-friendly words** across lengths:
  - 20 three-letter words: `CAT`, `DOG`, `COW`, `PIG`, `FOX`, `BUS`, `CAR`, `VAN`, `SUN`, `BED`, `CUP`, `HAT`, `PEN`, `BOX`, `KEY`, `EGG`, `PIE`, `JAM`, `BOY`, `EYE`
  - 20 four-letter words: `BALL`, `BOOK`, `FISH`, `FROG`, `DUCK`, `BIRD`, `LION`, `BEAR`, `MILK`, `CAKE`, `SOUP`, `TREE`, `MOON`, `STAR`, `RAIN`, `BOAT`, `SHOE`, `DOOR`, `HAND`, `NOSE`
  - 6 five-letter words: `APPLE`, `TRAIN`, `HOUSE`, `WATER`, `SMILE`, `HEART`
  - 4 six-letter words: `BANANA`, `FLOWER`, `ROCKET`, `MONKEY`
- Over 30 custom vector SVG illustrations embedded locally — no external network requests needed for imagery.
- Default categories: Animals, Food, Things, Nature, Vehicles, Body, Home, People, Actions, My Words.

### 5. Parent Settings & Management
- **Protected by Parent Gate**:
  - 3-second hold circular timer
  - Adult math challenge
  - Direct access (can be turned off if preferred)
- **Word Length Filtering**: Toggle 3, 4, 5, or 6-letter words.
- **Word Management**: Add, edit, delete, toggle active/hidden status, and mark favorites.
- **Category Management**: Create and assign custom categories.
- **Data & Backup**:
  - Full JSON backup export and import.
  - Progress reset and factory default restore options.
  - IndexedDB storage architecture with separate media store for uploaded images and recorded voice clips.

### 6. Universal Device Responsiveness
- Tailored layouts for:
  - Small mobile portrait
  - Large mobile portrait
  - Mobile landscape (intelligent side-by-side layout preventing vertical overflow on short screens)
  - iPad / tablet portrait
  - iPad / tablet landscape
  - Desktop browsers
- Full touch target sizing (minimum 48–56px) and iOS safe area padding support (`viewport-fit=cover`).
- High-contrast mode and reduced motion accessibility options.

---

## 🛠 Tech Stack
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Local Storage**: IndexedDB via `idb`
- **PWA**: Service Worker (`public/sw.js`), Web App Manifest (`public/manifest.json`), Offline Cache
- **Build Tool**: Vite 6

---

## 🚀 Getting Started

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### E2E Testing with Puppeteer
```bash
node test-e2e.cjs
```
