import { useState, useEffect, useCallback } from 'react';
import MandalaDisplay from './components/MandalaDisplay.tsx';
import MemoryForm from './components/MemoryForm.tsx';
import MemoryDetail from './components/MemoryDetail.tsx';
import MemoryList from './components/MemoryList.tsx';
import Login from './components/Login.tsx';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { collection, addDoc, onSnapshot, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { getEnhancedMemory } from './geminiService';
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
      const q = query(collection(db, "memories"), where("uid", "==", user.uid), orderBy("createdAt"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const memoriesData: Memory[] = [];
        querySnapshot.forEach((doc) => {
          memoriesData.push({ id: doc.id, ...doc.data() } as Memory);
        });
        setMemories(memoriesData);
      }, (error) => {
        console.error("Error fetching memories:", error);
        setError("Failed to load memories. Please refresh the page.");
      });
      return () => unsubscribe();
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
      const enhancedMemory = await getEnhancedMemory(description);
      await addDoc(collection(db, "memories"), {
        uid: user.uid,
        description,
        ...enhancedMemory,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error adding memory:", error);
      setError("Failed to add memory. Please try again.");
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
          <MandalaDisplay memories={memories} onMemorySelect={setSelectedMemory} />
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
