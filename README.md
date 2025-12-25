# Memory Mandala

Memory Mandala is a web application that transforms shared memories into an interactive, generative art visualization.

## Problem Statement

Traditional methods of documenting shared history, such as journals or photo albums, often fail to capture the cumulative and evolving nature of a relationship. Users lack a medium that visualizes the growth and emotional complexity of their shared experiences in a single, dynamic interface. This project addresses this by converting text-based memories into a living digital mandala, where each layer represents a distinct moment in time.

## Key Features

- **Generative Visualization**: Renders memories as concentric layers in a mandala using P5.js, supporting Canvas, SVG, and WebGL modes.
- **AI Enhancement**: Utilizes DeepSeek R1 (via OpenRouter) to analyze memory descriptions and generate unique artistic parameters (color, pattern, symmetry) and poetic narratives.
- **Real-time Synchronization**: Leverages Firebase Firestore to store and sync memories instantly across devices.
- **Authentication**: Secure user access via Firebase Authentication (Email/Password).
- **Responsive Interface**: Adaptive design that functions on both desktop and mobile devices.

## Tech Stack

- **Frontend**: React 19, Vite, TypeScript
- **Visualization**: P5.js (react-p5)
- **Backend Services**: Firebase Authentication, Firebase Firestore
- **API Layer**: Vercel Serverless Functions (Node.js)
- **AI Integration**: OpenRouter API (DeepSeek R1 Distill Llama 70b)

## Architecture

The application follows a serverless architecture:

1. **Input**: The user submits a text description of a memory.
2. **Processing**: A Vercel Serverless Function intercepts the request and forwards the description to the OpenRouter API.
3. **Generation**: The AI model generates a short poem and determines specific visual attributes (color palette, geometric shape, symmetry order) based on the emotional context of the memory.
4. **Storage**: The original description, generated poem, and visual parameters are stored as a document in Firebase Firestore.
5. **Rendering**: The React frontend subscribes to the Firestore collection. Upon data updates, the P5.js component dynamically redraws the mandala, adding a new layer for the added memory.

## Local Development

### Prerequisites

- Node.js (v18 or higher)
- A Firebase project with Authentication and Firestore enabled
- An OpenRouter API key

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd memory-mandala
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Frontend Environment**
   Create a `.env` file in the root directory with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Configure Backend Environment**
   The application uses Vercel Functions which require the `OPENROUTER_API_KEY`. For local development, use the Vercel CLI to inject this variable.

5. **Run the Application**
   Use the Vercel CLI to serve both the frontend and the API functions locally:
   ```bash
   npm i -g vercel
   vercel dev
   ```
   The application will be available at `http://localhost:3000`.

   *Note: Running `npm run dev` will only start the Vite frontend server. API calls to `/api/generate` will fail without the Vercel backend environment.*

## Deployment

The project is configured for deployment on Vercel.

1. Push the code to a Git repository.
2. Import the project into Vercel.
3. Configure the environment variables in the Vercel dashboard (add both the `VITE_` Firebase keys and the `OPENROUTER_API_KEY`).
4. Deploy.

## Limitations

- **Data Loading**: The application currently loads all user memories at startup. This may impact performance with large datasets.
- **Editing**: Users can add and delete memories, but editing existing memories is not yet implemented.
- **Testing**: The repository does not currently contain an automated test suite.
- **User Management**: There is no interface for updating user profiles or resetting passwords.

## Contributors

- Prem Sai Kota (@prem22k)
