import React, { useState } from 'react';

interface MemoryFormProps {
  onAddMemory: (description: string) => void;
  isLoading?: boolean;
}

const MemoryForm: React.FC<MemoryFormProps> = ({ onAddMemory, isLoading = false }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    
    // Combine title, date, and description for the memory
    const fullDescription = `${title ? `Title: ${title}` : ''}${date ? ` Date: ${date}` : ''} Description: ${description}`.trim();
    onAddMemory(fullDescription);
    
    // Reset form
    setTitle('');
    setDate('');
    setDescription('');
  };

  return (
    <div className="memory-form-container">
      <h2>Add a New Memory</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Memory Title (Optional)</label>
          <input
            id="title"
            type="text"
            placeholder="Give your memory a name..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="date">Date (Optional)</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Memory Description</label>
          <textarea
            id="description"
            placeholder="Describe a shared memory..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        
        <button 
          type="submit" 
          className={`grow-mandala-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading && <span className="loading-spinner"></span>}
          {isLoading ? 'Growing Our Mandala...' : 'Grow Our Mandala'}
        </button>
      </form>
    </div>
  );
};

export default MemoryForm;
