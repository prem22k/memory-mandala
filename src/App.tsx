import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
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
      });
      return () => unsubscribe();
    } else {
      setMemories([]);
    }
  }, [user]);

  const addMemory = async (description: string) => {
    if (!user) return;
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMemory = async (id: string) => {
    try {
      await deleteDoc(doc(db, "memories", id));
      setSelectedMemory(null);
    } catch (error) {
      console.error("Error deleting memory:", error);
    }
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>The Mandala of Us</h1>
        <button className="sign-out-button" onClick={() => auth.signOut()}>Sign Out</button>
      </header>
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

export default App
