export interface Memory {
  id: string;
  uid: string;
  description: string;
  poetic_narrative: string;
  art_instructions: {
    color: string;
    pattern: string;
    // New optional fields for richer, unique mandalas
    secondary_color?: string;
    symmetry?: number; // e.g., 4-24
    petals?: number; // e.g., 4-36
    energy?: 'calm' | 'romantic' | 'energetic';
    strokeStyle?: 'solid' | 'dotted' | 'dashed';
    seed?: number; // deterministic seed per memory
  };
  createdAt?: Date; // Added for sorting
}
