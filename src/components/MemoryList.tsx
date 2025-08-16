import React from 'react';
import { type Memory } from '../types';

interface MemoryListProps {
  memories: Memory[];
  onMemorySelect: (memory: Memory) => void;
  selectedMemory?: Memory | null;
}

const MemoryList: React.FC<MemoryListProps> = ({ memories, onMemorySelect, selectedMemory }) => {
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
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="memory-list-container">
      <h2>Our Memories</h2>
      {memories.length === 0 ? (
        <p style={{ textAlign: 'center', opacity: 0.7, fontStyle: 'italic' }}>
          No memories yet. Add your first memory to start growing your mandala!
        </p>
      ) : (
        <ul>
          {memories.map((memory) => {
            const { title, date, description } = parseMemoryData(memory.description);
            const isSelected = selectedMemory?.id === memory.id;
            
            return (
              <li 
                key={memory.id} 
                className={`memory-card ${isSelected ? 'selected' : ''}`}
                onClick={() => onMemorySelect(memory)}
              >
                {title && <h3>{title}</h3>}
                {date && <div className="memory-date">{formatDate(date)}</div>}
                <div className="memory-preview">{description}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MemoryList;
