import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div style={{
        background: 'var(--container-bg)',
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h2>The Mandala of Us</h2>
        <p style={{ 
          textAlign: 'center', 
          marginBottom: '2rem', 
          opacity: 0.8,
          fontSize: '0.95rem',
          lineHeight: '1.5'
        }}>
          Welcome to your personal celestial garden of memories
        </p>
        
        <div style={{ marginBottom: '1rem' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            disabled={isLoading}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            disabled={isLoading}
          />
        </div>
        
        <button 
          onClick={handleLogin} 
          disabled={isLoading}
          style={{ marginBottom: '0.75rem' }}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
        
        <button 
          onClick={handleSignUp} 
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
        
        {error && (
          <p className="error-message" style={{ marginTop: '1rem' }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
