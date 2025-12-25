# Quick Start Guide

## Prerequisites

Before you begin, ensure you have the following:

- **Node.js**: v18 or higher.
- **Vercel CLI**: Install globally via `npm i -g vercel`.
- **Firebase Project**:
  - Create a project at [console.firebase.google.com](https://console.firebase.google.com/).
  - Enable **Authentication** (Email/Password).
  - Enable **Firestore Database** (Start in test mode for development).
- **OpenRouter API Key**: Sign up at [openrouter.ai](https://openrouter.ai/) to get a key for DeepSeek R1.

## Environment Setup

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd memory-mandala
    ```

2.  **Frontend Configuration**:
    Create a `.env` file in the root directory:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

3.  **Backend Configuration**:
    The backend functions run on Vercel. For local development, you need to provide the `OPENROUTER_API_KEY`.
    
    You can set this up by linking to a Vercel project:
    ```bash
    vercel link
    vercel env add OPENROUTER_API_KEY
    vercel env pull .env.local
    ```
    
    *Alternatively*, for a quick local test without linking to Vercel cloud, you can create a `.env.local` file manually, but `vercel dev` is still required to load it for the serverless functions.

## Installation

```bash
npm install
```

## Running Locally

To run the full stack (React Frontend + Node.js API):

```bash
vercel dev
```

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api/generate

> **⚠️ Important**: Do not use `npm run dev`. It only starts the Vite server (port 5173) and will not serve the `/api` endpoints, causing AI generation to fail.

## Common Issues

### "API Error: 404 Not Found"
- **Cause**: You are likely running the app with `npm run dev` instead of `vercel dev`.
- **Fix**: Stop the server and run `vercel dev`.

### "Firebase: Error (auth/configuration-not-found)"
- **Cause**: The `.env` file is missing or contains incorrect values.
- **Fix**: Verify your Firebase config values against the Firebase Console settings.

### "OpenRouter API Key missing"
- **Cause**: The backend function cannot find `process.env.OPENROUTER_API_KEY`.
- **Fix**: Ensure you have pulled environment variables using `vercel env pull` or defined them in `.env.local`.
