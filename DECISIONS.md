# Decisions Log

## Context

This project was built as a creative exploration of shared memory visualization. The primary goal was to create an emotional, interactive experience. Speed of development, visual impact, and "zero-maintenance" deployment were prioritized over strict enterprise scalability.

## Technology Stack Decisions

### 1. Frontend: React + Vite
- **Decision**: Use React 19 with Vite.
- **Why**: React's component model maps well to the UI structure (Form, List, Display). Vite provides a superior developer experience with instant HMR compared to Create React App.
- **Alternatives Considered**: Next.js (deemed overkill for a primarily client-side visualizer), Vanilla JS (too difficult to manage complex state).

### 2. Visualization: P5.js (react-p5)
- **Decision**: Use P5.js via a React wrapper.
- **Why**: P5.js is the industry standard for creative coding. It abstracts WebGL complexity while allowing for sophisticated visual output. It supports both 2D and 3D contexts out of the box.
- **Trade-off**: Integrating an imperative canvas library with React's declarative state model requires careful lifecycle management (refs, cleanup) to avoid memory leaks.

### 3. Backend: Firebase (Auth + Firestore)
- **Decision**: Use Firebase as a Backend-as-a-Service.
- **Why**:
    - **Real-time**: The "living mandala" concept requires immediate updates when a memory is added. Firestore's `onSnapshot` makes this trivial.
    - **Speed**: Authentication and database setup takes minutes, not hours.
- **Trade-off**: Vendor lock-in. Migrating away from Firestore later would be difficult due to its specific query limitations and SDK coupling.

### 4. AI: OpenRouter (DeepSeek R1)
- **Decision**: Use OpenRouter to access DeepSeek R1.
- **Why**: DeepSeek R1 offers high-quality reasoning and creative writing capabilities at a fraction of the cost of GPT-4. OpenRouter provides a unified API interface, allowing us to switch models without changing code.
- **Constraint**: Cost and accessibility were key factors for a personal/hobbyist project.

## Constraints & Trade-offs

### 1. Client-Side Performance vs. Complexity
- **Constraint**: The mandala renders *all* memories at once.
- **Trade-off**: As the number of memories grows (>100), the P5.js render loop will slow down. We accepted this for v1 to avoid the complexity of implementing "level of detail" rendering or complex pagination logic for the visualizer.

### 2. Security vs. Speed
- **Constraint**: Rapid prototyping.
- **Trade-off**: Security rules are currently basic. In a production environment, strict row-level security (RLS) rules in Firestore are required to ensure users can strictly only access their own data.

### 3. Immutability
- **Constraint**: Scope.
- **Trade-off**: Memories are immutable (except for deletion). Implementing an edit history or "update" flow would complicate the AI generation pipeline (e.g., should we re-generate the art parameters if the text changes? Should we keep the old poem?).

## Future Improvements (v2)

If we were to rebuild or extend this project:

1.  **Optimized Rendering**: Move from immediate mode rendering in P5.js to a retained mode or use instanced rendering in Three.js/React Three Fiber. This would drastically improve performance for large datasets.
2.  **Partner Linking**: Currently, the "shared" aspect implies sharing a login or device. v2 should allow two distinct user accounts to link and contribute to a shared mandala collection.
3.  **Pagination**: Implement infinite scroll for the memory list and a "time-window" view for the mandala to handle long-term usage.
4.  **Testing**: Add unit tests for the AI parsing logic and integration tests for the Firebase flows to ensure reliability.
