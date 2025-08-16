import axios from 'axios';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

const generatePrompt = async (prompt: string, isJson = false) => {
  const response = await axios.post(API_URL, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: isJson ? { response_mime_type: "application/json" } : undefined,
  }, {
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': API_KEY,
    },
  });
  return response.data.candidates[0].content.parts[0].text;
};

export const getEnhancedMemory = async (description: string) => {
  const poeticPrompt = `
    You are a master poet, skilled in capturing the essence of love and memories in beautiful, evocative verse.
    A user has provided this memory: "${description}"
    
    Transform this memory into a short, romantic, and deeply emotional poetic narrative of 3-4 lines.
    The poem should be beautiful, heartfelt, and capture the magic of the moment.
    Make it feel like a love letter or a romantic verse that would be meaningful to a couple.
  `;

  const artPrompt = `
    You are an expert art director and color theorist, specializing in creating stunning visual designs for mandala art.
    A user has provided this memory: "${description}"
    
    Based on the emotional content, mood, and feeling of this memory, create a sophisticated color palette and pattern design.
    
    Provide ONLY a JSON object with these keys:
    - "color": A beautiful, vibrant hex color that represents the dominant emotion (choose from: deep purples, rich blues, warm golds, soft pinks, emerald greens, or vibrant oranges)
    - "pattern": A complex geometric pattern type (choose from: "circle", "square", "triangle", "line", "arc")
    
    Consider the emotional weight:
    - Romantic/loving memories: soft pinks, purples, or warm golds
    - Joyful/happy memories: vibrant oranges, yellows, or bright blues
    - Peaceful/calm memories: soft blues, greens, or lavender
    - Passionate/intense memories: deep reds, purples, or electric blues
    - Nostalgic memories: warm ambers, soft oranges, or muted golds
    
    Example output: { "color": "#E91E63", "pattern": "circle" }
    
    Do not include any other text or explanation.
  `;

  const poetic_narrative = await generatePrompt(poeticPrompt);
  const art_instructions_raw = await generatePrompt(artPrompt, true);
  const art_instructions = JSON.parse(art_instructions_raw);

  return { poetic_narrative, art_instructions };
};
