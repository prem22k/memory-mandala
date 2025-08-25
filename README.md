# The Mandala of Us - A Celestial Garden of Memories

A beautiful, AI-enhanced web application that creates a living digital mandala representing your relationship's shared memories. Each memory becomes a unique layer in a growing, interactive mandala with AI-generated poetry and artistic patterns.

## ✨ Features

- **Interactive 3D Mandala**: Beautiful, animated mandala that grows with each memory
- **AI-Generated Poetry**: Each memory gets a romantic, heartfelt poem
- **Sophisticated Art Patterns**: Unique geometric patterns and colors for each memory
- **Mobile Responsive**: Optimized for both desktop and mobile devices
- **Real-time Sync**: Memories are saved and synced across sessions
- **Beautiful UI**: "The Celestial Garden" design with elegant dark theme

## 🚀 Quick Setup for Sharing

### 1. Environment Variables Setup

Create a `.env` file in the root directory with your API keys:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# OpenRouter API Key (for DeepSeek R1 Free) - Server-side only
# This should be set in Vercel environment variables, not in .env
# OPENROUTER_API_KEY=your_openrouter_api_key
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Create a Firestore database
5. Copy your config values to the `.env` file

### 3. OpenRouter AI Setup

1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up and get your API key
3. Add it to your Vercel environment variables as `OPENROUTER_API_KEY` (no `VITE_` prefix)

### 4. Install & Run

```bash
npm install
npm run dev
```

## 🎯 Pre-Sharing Checklist

### ✅ Technical Setup

- [ ] Environment variables configured
- [ ] Firebase project created and configured
- [ ] OpenRouter API key obtained
- [ ] App builds successfully (`npm run build`)
- [ ] App runs locally without errors

### ✅ Functionality Test

- [ ] User registration/login works
- [ ] Adding memories works
- [ ] AI generates poetic narratives
- [ ] Mandala displays correctly
- [ ] Memory details show properly
- [ ] Mobile responsiveness works
- [ ] Error handling works

### ✅ User Experience

- [ ] Beautiful loading states
- [ ] Smooth animations
- [ ] Intuitive navigation
- [ ] Clear error messages
- [ ] Responsive design on all devices

## 🌟 How to Use

1. **Sign Up/Login**: Create an account or sign in
2. **Add Memories**: Fill out the form with title, date, and description
3. **Watch the Mandala Grow**: Each memory becomes a new layer
4. **Interact**: Click on mandala layers or memory cards to view details
5. **Enjoy the Poetry**: Each memory gets a beautiful AI-generated poem

## 🎨 The Experience

### For Your Girlfriend:

- **Personal Touch**: Each memory is transformed into beautiful art
- **Emotional Connection**: AI-generated poetry captures the essence of your moments
- **Growing Artwork**: The mandala becomes more complex and beautiful over time
- **Interactive**: Click to explore and relive memories
- **Mobile Friendly**: Works perfectly on phones and tablets

### Technical Highlights:

- **React 19** with TypeScript
- **P5.js** for beautiful mandala visualization
- **Firebase** for secure data storage
- **OpenRouter AI** (DeepSeek R1 Free) for intelligent content generation
- **Responsive Design** for all devices

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy!

## 💝 Perfect Gift Features

- **Romantic**: Designed specifically for couples
- **Personal**: Each memory is unique and meaningful
- **Beautiful**: Stunning visual design and animations
- **Interactive**: Engaging and fun to use
- **Growing**: The gift that keeps growing with your relationship
- **Accessible**: Works on any device, anywhere

## 🔧 Troubleshooting

### Common Issues:

1. **Build Errors**: Check that all environment variables are set
2. **API Errors**: Verify your OpenRouter API key is valid
3. **Firebase Errors**: Ensure your Firebase project is properly configured
4. **Mobile Issues**: Test on different devices and browsers

### Support:

- Check the browser console for error messages
- Verify all API keys are correct
- Ensure Firebase rules allow read/write access

## 🎉 Ready to Share!

Once you've completed the checklist above, your girlfriend will have access to:

- A beautiful, interactive mandala of your shared memories
- AI-generated poetry for each special moment
- A growing, living piece of digital art
- A romantic, personalized experience

This is truly a unique and meaningful gift that will grow more beautiful with every memory you add together! ✨
