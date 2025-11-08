# Project Overview

**The Mandala of Us** is a romantic, AI-enhanced web application that transforms shared memories into an interactive, growing mandala visualization. Each memory submitted by users is enhanced with AI-generated poetry and unique geometric art patterns, creating a beautiful "celestial garden" of memories. The app features a dark, elegant UI with animated P5.js mandala visualizations, real-time Firebase synchronization, and mobile-responsive design. Users can add memories with titles and dates, view poetic reflections, and interact with their mandala through Canvas, SVG, or WebGL rendering modes.

---

# Repo Structure

```
memory-mandala/
├── api/
│   ├── generate.js           # Vercel serverless function for OpenRouter AI API
│   ├── hello.ts              # Test API endpoint
│   ├── openrouter.ts         # Alternative OpenRouter implementation
│   ├── simple.js             # Simplified API handler
│   └── test.ts               # API testing endpoint
├── public/
│   └── test-api.html         # API testing interface
├── src/
│   ├── components/
│   │   ├── Login.tsx         # Firebase authentication UI
│   │   ├── MandalaDisplay.tsx # P5.js mandala visualization (Canvas/SVG/WebGL)
│   │   ├── MemoryDetail.tsx  # Detailed memory view with poetry
│   │   ├── MemoryForm.tsx    # Memory input form with validation
│   │   └── MemoryList.tsx    # Scrollable list of memories
│   ├── App.tsx               # Main application component
│   ├── App.css               # Component and layout styles
│   ├── deepseekService.ts    # AI service for poetry and art generation
│   ├── firebaseConfig.ts     # Firebase initialization
│   ├── index.css             # Global styles and CSS variables
│   ├── main.tsx              # React app entry point
│   ├── types.ts              # TypeScript type definitions
│   └── vite-env.d.ts         # Vite environment types
├── eslint.config.js
├── index.html
├── package.json
├── README.md
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vercel.json               # Vercel deployment config
└── vite.config.ts
```

---

# How to Run (dev / build / preview)

**Install dependencies:**
```bash
npm install
```

**Run development server:**
```bash
npm run dev
```
- Dev server runs on **default Vite port 5173** (or next available port)
- Uses hot module replacement (HMR) for instant updates

**Build for production:**
```bash
npm run build
```
- Compiles TypeScript with `tsc -b`
- Bundles app with Vite to `dist/` directory

**Preview production build:**
```bash
npm run preview
```

**Lint code:**
```bash
npm run lint
```

**Important npm scripts from package.json:**
- `dev`: Starts Vite dev server
- `build`: TypeScript compilation + Vite production build
- `lint`: Runs ESLint on all files
- `preview`: Serves production build locally

---

# Main Tech Stack & Dependencies

**Core Framework:**
- **React 19.1.1** - UI library with StrictMode
- **TypeScript 5.8.3** - Type-safe JavaScript
- **Vite 7.1.2** - Fast build tool and dev server

**Visualization & Animation:**
- **react-p5 1.4.1** - React wrapper for P5.js generative art library
  - Used for Canvas-based mandala rendering with circles, ellipses, arcs
  - Supports WebGL mode for 3D rotations
  - SVG export functionality for static renders

**Backend & Data:**
- **Firebase 12.1.0** - Authentication (email/password) and Firestore database
- **Axios 1.11.0** - HTTP client for AI API calls

**AI Integration:**
- **OpenRouter API** - DeepSeek R1 Free model for:
  - Poetic narrative generation (3-4 line romantic poetry)
  - Art instruction generation (color, pattern, symmetry, energy)

**Dev Tools:**
- **ESLint 9.33.0** with React hooks and refresh plugins
- **@vitejs/plugin-react 5.0.0** - Fast refresh for React

**Styling:**
- Pure CSS with CSS custom properties (no Tailwind)
- Google Fonts: Inter (UI), Playfair Display (headings)
- Dark theme with glassmorphism effects

---

# Entry Points & Routing

**Main Entry:**
- `src/main.tsx` - Renders `<App />` into `#root` div with React.StrictMode

**Top-Level Component:**
- `src/App.tsx` - Single-page application with conditional rendering:
  - Shows `<Login />` if user not authenticated
  - Shows main app interface (mandala + memory management) when authenticated

**No Router:**
- Single-page app with no client-side routing
- State-driven UI (authenticated vs. not authenticated)

---

# Visual / Motion Layers

**Mandala Background:**
- **File:** `src/components/MandalaDisplay.tsx`
- **Library:** P5.js (via react-p5)
- **Rendering Modes:**
  - **Canvas** (default): 2D P5.js drawing with 60fps animations
  - **SVG**: Static export mode with LCG-based random generation
  - **WebGL**: 3D mode with orbital controls and Z-axis animations

**Specialized Render Loops:**
- `draw()` function runs at 60fps (30fps in performance mode)
- `timeRef` increments for continuous rotation animations
- `animationRef` drives pulsing/breathing effects on mandala layers
- Seeded randomness ensures deterministic patterns per memory

**Pointer Interactions:**
- Click detection on mandala rings to select memories
- Hover effects increase glow intensity and particle count
- Mouse distance calculations for ring proximity detection

**Canvas Features:**
- Background gradient with pixel-based star field effect (disabled on mobile)
- Ambient particles orbiting the mandala
- Central core with pulsing glow and shadow blur
- Layered mandala rings with:
  - Multiple draw passes (3-5 layers per memory)
  - Stroke styles: solid, dotted, dashed
  - Pattern types: circle, square, triangle, line, arc
  - Symmetry (4-24 fold) and petals (6-36 count)

**Animation Details:**
- Pulse animation: `sin(animationRef + index) * amplitude + 1`
- Floating elements rotate around rings with sine-based radius variance
- WebGL mode: `rotateX()` and `rotateZ()` based on `timeRef`
- Shadow blur effects for depth (disabled in performance mode)

**Performance Optimizations:**
- Performance mode reduces layers, framerate, and particle count
- Mobile detection reduces canvas size (600px → 350px)
- Respects `prefers-reduced-motion` for accessibility
- Conditional rendering of expensive effects (star field, particles)

---

# Components Map (detailed for important UI blocks)

### `src/components/Login.tsx`
**Purpose:** Firebase email/password authentication interface  
**Props:** None (uses Firebase auth context)  
**Styling:** Inline styles with CSS variables, glassmorphism container  
**Features:**
- Sign in and create account buttons
- Error message display
- Loading states during authentication
- Centered layout with dark gradient background

### `src/components/MandalaDisplay.tsx`
**Purpose:** Interactive P5.js mandala visualization with 3 rendering modes  
**Props:**
- `memories: Memory[]` - Array of memory objects to render
- `onMemorySelect: (memory: Memory | null) => void` - Selection callback
- `selectedMemory?: Memory | null` - Currently selected memory

**Styling:** Inline styles for controls overlay, CSS for positioning  
**Animation/Hooks:**
- `useRef` for p5 instance, animation frame counters
- `useEffect` for mobile detection and window resize
- `useState` for mode (canvas/svg/webgl), perfMode, showPoem
- Custom `seededRandom()` for deterministic pattern generation

**Key Methods:**
- `drawMandalaLayer()` - Renders individual memory rings
- `drawGenerativePattern()` - Draws pattern type (circle/square/triangle/line/arc)
- `mouseClicked()` - Detects ring clicks for memory selection
- `handleExportPNG/SVG/Poster()` - Export functions

### `src/components/MemoryForm.tsx`
**Purpose:** Form for adding new memories with title, date, and description  
**Props:**
- `onAddMemory: (description: string) => void` - Submit callback
- `isLoading?: boolean` - Loading state from parent

**Styling:** `.memory-form-container` and `.form-group` classes from App.css  
**Features:**
- Title validation (max 50 chars)
- Description validation (max 500 chars, required)
- Optional date picker
- Character counters
- Loading spinner during AI processing
- Disabled state when loading

### `src/components/MemoryList.tsx`
**Purpose:** Scrollable list of memory cards with hover/select states  
**Props:**
- `memories: Memory[]` - Array of memories
- `onMemorySelect: (memory: Memory) => void` - Click callback
- `selectedMemory?: Memory | null` - Highlighted memory

**Styling:** `.memory-card` with hover transform, `.selected` class for active state  
**Features:**
- Parses title/date from description string
- Truncates preview to 2 lines with CSS ellipsis
- Formats dates with `toLocaleDateString()`
- Empty state message when no memories

### `src/components/MemoryDetail.tsx`
**Purpose:** Detailed view of selected memory with poetry and delete option  
**Props:**
- `memory: Memory | null` - Selected memory object
- `onDelete: (id: string) => void` - Delete callback

**Styling:** `.memory-detail-section` with glassmorphism backgrounds  
**Features:**
- Parses and displays title, date, original description
- Shows AI-generated poetic narrative in italics
- Delete button with confirmation (no modal, direct delete)
- Empty state when no memory selected

---

# State Management & Data Flow

**Global State (via hooks in App.tsx):**
- `user` - Firebase User object or null (from `onAuthStateChanged`)
- `memories` - Array of Memory objects from Firestore real-time listener
- `selectedMemory` - Currently selected memory (shared across components)
- `isLoading` - Loading state during AI API call
- `error` - Error message string for user display

**Data Flow:**
1. User submits memory in `MemoryForm` → calls `onAddMemory(description)`
2. `App.tsx` calls `getEnhancedMemory()` from `deepseekService.ts`
3. Service makes 2 API calls to `/api/generate` (poetry + art instructions)
4. Enhanced memory saved to Firestore with `addDoc()`
5. Firestore `onSnapshot` listener updates `memories` state
6. `MandalaDisplay` and `MemoryList` re-render with new data
7. User clicks memory → `onMemorySelect()` updates `selectedMemory`
8. `MemoryDetail` displays selected memory details

**No Global State Library:**
- Pure React state management with `useState` and `useEffect`
- Props drilling for callbacks (onMemorySelect, onDelete, onAddMemory)
- Firebase provides real-time data sync across sessions

**Data Source:**
- All memories stored in Firestore collection `"memories"`
- Query filtered by `uid` field matching current user
- Sorted by `createdAt` timestamp
- AI-generated content (poetry + art) stored with each memory document

---

# Styling & Theming

**CSS Architecture:**
- **No Tailwind** - Pure CSS with BEM-inspired class names
- **CSS Variables** defined in `src/index.css`:
  ```css
  --dark-bg: #0d1117
  --container-bg: #1c2128
  --primary-text: #e6edf3
  --accent-color: #30a8f0
  --accent-hover: #4ab9f1
  --border-color: #30363d
  --shadow-color: rgba(48, 168, 240, 0.15)
  ```

**Theme Characteristics:**
- Dark mode only (GitHub-inspired palette)
- Glassmorphism effects: `backdrop-filter: blur(10px)`
- Gradient backgrounds: `linear-gradient(135deg, ...)`
- Box shadows with accent color glow

**Typography:**
- **Google Fonts:**
  - `Inter` - Body text, forms, buttons (weights: 400, 500, 600)
  - `Playfair Display` - Headings and title (weight: 700)
- **Font smoothing:** `-webkit-font-smoothing: antialiased`

**Color Usage:**
- `--accent-color` (#30a8f0) - Primary blue for buttons, borders, highlights
- `--dark-bg` (#0d1117) - Main background
- `--container-bg` (#1c2128) - Card backgrounds
- `--border-color` (#30363d) - Subtle borders
- Gradients for buttons and backgrounds

**Responsive Design:**
- Media queries at 1024px, 768px, 480px breakpoints
- Grid layout switches to single column below 1024px
- Canvas size reduces on mobile (600px → 350px)
- Touch device optimizations with `:active` pseudo-class
- Respects `prefers-reduced-motion` for accessibility

**Custom Scrollbar:**
- 8px width with dark track and lighter thumb
- Styled via `::-webkit-scrollbar-*` pseudo-elements

---

# Performance / Accessibility notes

**Performance Optimizations:**
- **Performance Mode Toggle:** Reduces animation complexity
  - Lowers framerate (60fps → 30fps)
  - Reduces layers per memory (5 → 2)
  - Limits symmetry and petal counts
  - Disables expensive effects (star field, shadow blur)
  - Sparse particle rendering
- **Mobile Optimizations:**
  - Smaller canvas size (350px vs 600px)
  - Fewer animation layers
  - Disabled ambient particles
  - Reduced draw complexity
- **Conditional Rendering:**
  - Star field background only on desktop
  - Floating elements only on desktop + non-perf mode
  - Shadow blur disabled in performance mode
- **Seeded Randomness:** LCG (Linear Congruential Generator) for deterministic patterns without re-computation

**Accessibility:**
- **Reduced Motion:** Respects `prefers-reduced-motion: reduce`
  - Disables all animations via `transition-duration: 0.01ms !important`
  - Stops spinner animation
  - Activates performance mode automatically
- **Touch Optimizations:**
  - `-webkit-tap-highlight-color: transparent`
  - `:active` states replace `:hover` on touch devices
  - Larger touch targets (buttons, cards)
- **Form Accessibility:**
  - Proper `<label>` elements with `htmlFor` attributes
  - `required` attribute on description field
  - Character counters for field limits
  - Error messages with `aria-live` behavior (visual only)
- **Keyboard Navigation:**
  - All interactive elements are `<button>` or native inputs
  - Tab order follows visual layout

**Image Optimization:**
- No external images used
- All visuals generated via P5.js canvas/SVG
- Export functions for PNG/SVG/Poster download

**Loading States:**
- Skeleton states for loading memories (via empty state message)
- Loading spinner on form submit button
- Disabled form inputs during submission

**Lazy Loading:**
- No lazy loading implemented (single-page app, all components always mounted)

---

# Key Scripts / Build Configurations

**package.json scripts:**
```json
{
  "dev": "vite",                    // Start dev server (port 5173)
  "build": "tsc -b && vite build",  // Compile TS + bundle to dist/
  "lint": "eslint .",               // Lint all .ts/.tsx files
  "preview": "vite preview"         // Preview production build
}
```

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```
- Minimal Vite config with React plugin
- No custom build settings
- Uses default port (5173) for dev server

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```
- Vercel deployment configuration
- Serverless functions in `api/` directory auto-deployed
- Environment variable `OPENROUTER_API_KEY` set in Vercel dashboard

**tsconfig.json:**
- References `tsconfig.app.json` (app config) and `tsconfig.node.json` (build tooling)
- Strict type checking enabled
- JSX transform for React 19

**TypeScript Compilation:**
- `tsc -b` builds project references
- Output goes to `dist/` (via Vite)
- Source maps included in dev mode

**API Endpoints (Serverless Functions):**
- `api/generate.js` - Main OpenRouter proxy endpoint
  - Accepts `{ prompt: string, isJson: boolean }`
  - Returns `{ content: string }`
  - Uses DeepSeek R1 Distill Llama 70B Free model
  - Sets HTTP-Referer and X-Title headers for OpenRouter
  - Supports JSON mode for structured art instruction output

**Environment Variables Required:**
- `VITE_FIREBASE_API_KEY` - Firebase API key
- `VITE_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID
- `VITE_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `VITE_FIREBASE_MESSAGING_SENDER_ID` - Firebase sender ID
- `VITE_FIREBASE_APP_ID` - Firebase app ID
- `OPENROUTER_API_KEY` - Server-side only (Vercel env var, no VITE_ prefix)

**Build Output:**
- `dist/index.html` - Entry HTML file
- `dist/assets/*.js` - Bundled and minified JavaScript
- `dist/assets/*.css` - Extracted and minified CSS
- All imports resolved and tree-shaken by Vite

---

**End of CODEBASE_SUMMARY.md**
