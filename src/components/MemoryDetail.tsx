import React from 'react';
import { type Memory } from '../types';

interface MemoryDetailProps {
  memory: Memory | null;
  onDelete: (id: string) => void;
}

const MemoryDetail: React.FC<MemoryDetailProps> = ({ memory, onDelete }) => {
  const parseMemoryData = (description: string) => {
    let title = '';
    let date = '';
    let desc = description;

    // Try to extract title and date from the description
    if (description.includes('Title:')) {
      const titleMatch = description.match(/Title: ([^D]+?)(?=Date:|Description:)/);
      if (titleMatch) title = titleMatch[1].trim();
    }
    
    if (description.includes('Date:')) {
      const dateMatch = description.match(/Date: ([^D]+?)(?=Description:)/);
      if (dateMatch) date = dateMatch[1].trim();
    }
    
    if (description.includes('Description:')) {
      const descMatch = description.match(/Description: (.+)/);
      if (descMatch) desc = descMatch[1].trim();
    }

    return { title, date, description: desc };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  if (!memory) {
    return (
      <div className="memory-detail-container">
        <h2>Memory Details</h2>
        <div className="memory-detail-content">
          <p style={{ textAlign: 'center', opacity: 0.7, fontStyle: 'italic' }}>
            Click on a memory card or mandala layer to see the details.
          </p>
        </div>
      </div>
    );
  }

  const { title, date, description } = parseMemoryData(memory.description);

  return (
    <div className="memory-detail-container">
      <h2>Memory Details</h2>
      <div className="memory-detail-content">
        {title && (
          <div className="memory-detail-section">
            <h4>Title</h4>
            <p>{title}</p>
          </div>
        )}
        
        {date && (
          <div className="memory-detail-section">
            <h4>Date</h4>
            <p>{formatDate(date)}</p>
          </div>
        )}
        
        <div className="memory-detail-section">
          <h4>Original Memory</h4>
          <p>{description}</p>
        </div>
        
        <div className="memory-detail-section">
          <h4>Poetic Reflection</h4>
          <p style={{ fontStyle: 'italic', lineHeight: '1.6' }}>{memory.poetic_narrative}</p>
        </div>
        
        <button onClick={() => onDelete(memory.id)} className="delete-button">
          Delete Memory
        </button>
      </div>
    </div>
  );
};

export default MemoryDetail;
