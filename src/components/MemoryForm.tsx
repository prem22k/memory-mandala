import React, { useState } from 'react';

interface MemoryFormProps {
  onAddMemory: (description: string) => void;
  isLoading?: boolean;
}

const MemoryForm: React.FC<MemoryFormProps> = ({ onAddMemory, isLoading = false }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const validateForm = () => {
    const newErrors: { title?: string; description?: string } = {};
    
    if (title.length > 50) {
      newErrors.title = 'Title must be 50 characters or less';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Combine title, date, and description for the memory
    const fullDescription = `${title ? `Title: ${title}` : ''}${date ? ` Date: ${date}` : ''} Description: ${description}`.trim();
    onAddMemory(fullDescription);
    
    // Reset form
    setTitle('');
    setDate('');
    setDescription('');
    setErrors({});
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    if (value.length > 50) {
      setErrors(prev => ({ ...prev, title: 'Title must be 50 characters or less' }));
    } else {
      setErrors(prev => ({ ...prev, title: undefined }));
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDescription(value);
    if (value.length > 500) {
      setErrors(prev => ({ ...prev, description: 'Description must be 500 characters or less' }));
    } else {
      setErrors(prev => ({ ...prev, description: undefined }));
    }
  };

  return (
    <div className="memory-form-container">
      <h2>Add a New Memory</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">
            Memory Title (Optional)
            <span style={{ fontSize: '0.8rem', opacity: 0.7, marginLeft: '0.5rem' }}>
              {title.length}/50
            </span>
          </label>
          <input
            id="title"
            type="text"
            placeholder="Give your memory a name..."
            value={title}
            onChange={handleTitleChange}
            maxLength={50}
            disabled={isLoading}
          />
          {errors.title && (
            <span style={{ color: '#d73a49', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {errors.title}
            </span>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="date">Date (Optional)</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">
            Memory Description
            <span style={{ fontSize: '0.8rem', opacity: 0.7, marginLeft: '0.5rem' }}>
              {description.length}/500
            </span>
          </label>
          <textarea
            id="description"
            placeholder="Describe a shared memory..."
            value={description}
            onChange={handleDescriptionChange}
            maxLength={500}
            required
            disabled={isLoading}
          ></textarea>
          {errors.description && (
            <span style={{ color: '#d73a49', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              {errors.description}
            </span>
          )}
        </div>
        
        <button 
          type="submit" 
          className={`grow-mandala-button ${isLoading ? 'loading' : ''}`}
          disabled={isLoading || !description.trim()}
        >
          {isLoading && <span className="loading-spinner"></span>}
          {isLoading ? 'Growing Our Mandala...' : 'Grow Our Mandala'}
        </button>
      </form>
    </div>
  );
};

export default MemoryForm;
