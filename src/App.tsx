import { useState, useEffect, useCallback } from 'react';
import MandalaDisplay from './components/MandalaDisplay.tsx';
import MemoryForm from './components/MemoryForm.tsx';
import MemoryDetail from './components/MemoryDetail.tsx';
import MemoryList from './components/MemoryList.tsx';
import Login from './components/Login.tsx';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { getEnhancedMemory } from './deepseekService';
import { type Memory } from './types';
import './App.css';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setError(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      console.log('Setting up Firebase listener for user:', user.uid);
      try {
        // First try with orderBy, if it fails, fall back to simple query
        const q = query(collection(db, "memories"), where("uid", "==", user.uid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const memoriesData: Memory[] = [];
          console.log('Firebase query result - documents count:', querySnapshot.size);
          console.log('Query metadata:', {
            empty: querySnapshot.empty,
            metadata: querySnapshot.metadata
          });
          
          querySnapshot.forEach((doc) => {
            try {
              const data = doc.data();
              console.log('Memory document:', { id: doc.id, uid: data.uid, description: data.description?.substring(0, 50) });
              
              // Ensure all required fields are present with fallbacks
              // Convert Firebase Timestamp to Date if needed
              let createdAt: Date;
              if (data.createdAt) {
                // Check if it's a Firebase Timestamp
                if (data.createdAt instanceof Timestamp) {
                  createdAt = data.createdAt.toDate();
                } else if (data.createdAt.toDate && typeof data.createdAt.toDate === 'function') {
                  // Handle case where it might be a Timestamp-like object
                  createdAt = data.createdAt.toDate();
                } else if (data.createdAt instanceof Date) {
                  createdAt = data.createdAt;
                } else {
                  // Fallback for other formats
                  createdAt = new Date(data.createdAt);
                }
              } else {
                createdAt = new Date();
              }
              
              const memory: Memory = {
                id: doc.id,
                uid: data.uid || user.uid,
                description: data.description || '',
                poetic_narrative: data.poetic_narrative || 'A beautiful memory to cherish forever.',
                art_instructions: {
                  color: data.art_instructions?.color || '#FF69B4',
                  pattern: data.art_instructions?.pattern || 'circle',
                  secondary_color: data.art_instructions?.secondary_color || '#FFD700',
                  symmetry: data.art_instructions?.symmetry || 12,
                  petals: data.art_instructions?.petals || 12,
                  energy: data.art_instructions?.energy || 'romantic',
                  strokeStyle: data.art_instructions?.strokeStyle || 'solid',
                  seed: data.art_instructions?.seed || Math.floor(Math.random() * 1000000) + 1
                },
                createdAt: createdAt,
              };
              
              memoriesData.push(memory);
            } catch (docError) {
              console.error('Error processing document:', doc.id, docError);
            }
          });
          
          // Sort by createdAt if available, otherwise by document ID
          memoriesData.sort((a, b) => {
            try {
              // Ensure we have valid Date objects
              const aDate = (a.createdAt && a.createdAt instanceof Date) ? a.createdAt : new Date(0);
              const bDate = (b.createdAt && b.createdAt instanceof Date) ? b.createdAt : new Date(0);
              
              // Additional safety check to ensure getTime() is available
              if (typeof aDate.getTime !== 'function' || typeof bDate.getTime !== 'function') {
                console.warn('Invalid date objects detected in sort, falling back to ID comparison');
                return a.id.localeCompare(b.id);
              }
              
              return aDate.getTime() - bDate.getTime();
            } catch (sortError) {
              console.error('Error sorting memories:', sortError);
              // Fallback to sorting by ID if date sorting fails
              return a.id.localeCompare(b.id);
            }
          });
          
          console.log('Setting memories state with:', memoriesData.length, 'memories');
          console.log('Memory IDs:', memoriesData.map(m => m.id));
          setMemories(memoriesData);
        }, (error) => {
          console.error("Error fetching memories:", error);
          setError("Failed to load memories. Please refresh the page.");
        });
        return () => unsubscribe();
      } catch (queryError) {
        console.error("Error setting up Firebase query:", queryError);
        setError("Failed to set up memory loading. Please refresh the page.");
      }
    } else {
      setMemories([]);
      setSelectedMemory(null);
    }
  }, [user]);

  const addMemory = useCallback(async (description: string) => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Calling OpenRouter API for description:', description);
      const enhancedMemory = await getEnhancedMemory(description);
      console.log('OpenRouter API response:', enhancedMemory);
      
      const memoryData = {
        uid: user.uid,
        description,
        ...enhancedMemory,
        createdAt: new Date(),
      };
      console.log('Storing memory data:', memoryData);
      
      const docRef = await addDoc(collection(db, "memories"), memoryData);
      console.log('Memory stored successfully with ID:', docRef.id);
      
    } catch (error: any) {
      console.error("OpenRouter API failed:", error);
      setError("Failed to add memory. Please check your API key and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const deleteMemory = useCallback(async (id: string) => {
    try {
      await deleteDoc(doc(db, "memories", id));
      setSelectedMemory(null);
      setError(null);
    } catch (error) {
      console.error("Error deleting memory:", error);
      setError("Failed to delete memory. Please try again.");
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await auth.signOut();
      setSelectedMemory(null);
      setError(null);
    } catch (error) {
      console.error("Error signing out:", error);
      setError("Failed to sign out. Please try again.");
    }
  }, []);

  if (!user) {
    return <Login />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>The Mandala of Us</h1>
        <button className="sign-out-button" onClick={handleSignOut}>
          Sign Out
        </button>
      </header>
      
      {error && (
        <div style={{
          position: 'fixed',
          top: '1rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#d73a49',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          zIndex: 1000,
          fontSize: '0.9rem',
          maxWidth: '90vw',
          textAlign: 'center'
        }}>
          {error}
          <button 
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              marginLeft: '1rem',
              cursor: 'pointer',
              fontSize: '1.2rem'
            }}
          >
            ×
          </button>
        </div>
      )}
      
      <main className="App-main">
        <div className="left-panel">
          <MandalaDisplay memories={memories} onMemorySelect={setSelectedMemory} selectedMemory={selectedMemory} />
        </div>
        <div className="right-panel">
          <MemoryForm onAddMemory={addMemory} isLoading={isLoading} />
          <MemoryList memories={memories} onMemorySelect={setSelectedMemory} selectedMemory={selectedMemory} />
          {selectedMemory && <MemoryDetail memory={selectedMemory} onDelete={deleteMemory} />}
        </div>
      </main>
    </div>
  );
}

export default App;
