# Architecture

## System Design

The application is a Single Page Application (SPA) built with React, utilizing a serverless backend for AI processing and a Backend-as-a-Service (BaaS) for data persistence and authentication. The core loop involves transforming user input into generative art parameters via LLMs, storing them in a real-time database, and rendering them client-side.

## Module Responsibility

### Frontend (`src/`)

- **`components/`**:
  - **`MandalaDisplay.tsx`**: The core visualization engine using `react-p5`. It manages the P5.js instance and handles rendering logic for Canvas, SVG, and WebGL modes. It translates abstract memory parameters into visual primitives.
  - **`MemoryForm.tsx`**: Handles user input, validation, and initiates the AI generation process.
  - **`MemoryList.tsx`** & **`MemoryDetail.tsx`**: Provide the browsing interface for the textual representation of memories.
  - **`Login.tsx`**: Manages Firebase Authentication flows.
- **`deepseekService.ts`**: An abstraction layer for communicating with the backend AI generation endpoints. It decouples the UI from specific API implementation details.
- **`firebaseConfig.ts`**: Initializes and exports singleton instances of Firebase Auth and Firestore.

### Backend (`api/`)

- **`generate.js`**: A Vercel Serverless Function acting as a secure proxy to the OpenRouter API. Its primary responsibilities are:
  - Protecting the OpenRouter API key (server-side only).
  - Constructing the prompt context for the LLM.
  - Handling upstream API errors before they reach the client.

## Data Flow

1.  **Submission**: User submits a text description via `MemoryForm`.
2.  **AI Processing**:
    - Frontend invokes `deepseekService.getEnhancedMemory`, calling the `/api/generate` endpoint.
    - The serverless function forwards the request to OpenRouter (DeepSeek R1).
    - The AI model returns a structured JSON containing a poetic narrative and visual parameters (color, pattern, symmetry).
3.  **Persistence**:
    - The frontend receives the AI response.
    - The frontend constructs a memory object (original text + AI metadata) and writes it to the Firestore `memories` collection.
4.  **Synchronization & Rendering**:
    - `App.tsx` maintains an active `onSnapshot` listener on the Firestore collection.
    - Firestore pushes the new document to all connected clients instantly.
    - React state updates, triggering `MandalaDisplay` to re-calculate and render the new layer in the visualization.

## Key Decisions & Trade-offs

### Serverless Functions vs. Dedicated Backend
- **Decision**: Use Vercel Serverless Functions.
- **Reasoning**: Eliminates server maintenance overhead and scales automatically. It is sufficient for stateless API proxying.
- **Trade-off**: Introduces potential cold start latency. Execution time is limited, which requires the upstream AI API to be reasonably fast.

### Firebase Firestore (NoSQL)
- **Decision**: Use Firestore for the database.
- **Reasoning**: The "real-time" requirement for the mandala to update immediately across devices is natively solved by Firestore's listeners. The flexible document schema accommodates the variable JSON output from the AI.
- **Trade-off**: Tightly couples the frontend to the Firebase SDK. Complex queries (e.g., full-text search on memories) are more difficult than with a SQL database.

### P5.js for Visualization
- **Decision**: Use `react-p5` wrapper around P5.js.
- **Reasoning**: P5.js offers a high-level API for creative coding that supports both 2D (Canvas) and 3D (WebGL) contexts, which is essential for the "generative art" aspect.
- **Trade-off**: Canvas rendering is imperative and operates outside React's virtual DOM. This requires careful lifecycle management (using refs and `useEffect`) to prevent memory leaks and ensure synchronization with React state.

### Client-Side Rendering (CSR)
- **Decision**: Fully client-side React app (Vite).
- **Reasoning**: The application is highly interactive and relies entirely on authenticated, user-specific data. SEO is not a priority for private content.
- **Trade-off**: Initial load time includes the JavaScript bundle download.
