# Memory Mandala

A web application that visualizes shared memories as an interactive, growing mandala. Each memory is enhanced with AI-generated poetry and artistic patterns, creating a unique visual representation of the relationship.

## Architecture

- **Frontend**: React 19, Vite, TypeScript, P5.js (for visualization)
- **Backend**: Firebase (Auth, Firestore), Vercel Serverless Functions
- **AI**: OpenRouter API (DeepSeek R1 Distill Llama 70b) for poetry and art direction

## Features

- **Interactive Mandala**: P5.js-based visualization supporting Canvas, SVG, and WebGL modes.
- **AI Enhancement**: Memories are processed to generate poetic narratives and specific art parameters (color, pattern, symmetry).
- **Real-time Sync**: Firebase Firestore integration for real-time updates across devices.
- **Responsive Design**: Mobile-first approach with optimized touch interactions.

## Prerequisites

- Node.js (v18+ recommended)
- Firebase Project
- OpenRouter API Key

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd memory-mandala
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create a `.env` file in the root directory for frontend configuration:

   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

   For the backend (Vercel Functions), the `OPENROUTER_API_KEY` is required. In a local environment using `vercel dev`, you can set this in a `.env.local` file or pull it from Vercel.

4. **Firebase Setup**
   - Create a project in the [Firebase Console](https://console.firebase.google.com/).
   - Enable **Authentication** (Email/Password provider).
   - Create a **Firestore Database** and set appropriate security rules.

## Development

### Running Locally

To run the full application (Frontend + API) locally, use Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

This serves the frontend at `http://localhost:3000` and the API functions at `http://localhost:3000/api/...`.

> **Note**: Running `npm run dev` only starts the Vite frontend server (default port 5173). API calls will fail unless you have a backend running on port 3000 or configure a proxy.

### Building

```bash
npm run build
```

## Deployment

The project is configured for deployment on Vercel.

1. Push code to a Git repository.
2. Import the project in Vercel.
3. Configure the Environment Variables (both `VITE_` variables and `OPENROUTER_API_KEY`).
4. Deploy.

## Project Structure

- `api/`: Serverless functions for AI generation.
- `src/components/`: React components (MandalaDisplay, MemoryForm, etc.).
- `src/deepseekService.ts`: Service for interacting with the backend API.
- `src/firebaseConfig.ts`: Firebase initialization.
