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
    You are a poet, skilled in capturing the essence of a memory in a short, beautiful, and evocative narrative.
    A user has provided this memory: "${description}"
    Transform this memory into a poetic narrative of no more than 4 lines.
  `;

  const artPrompt = `
    You are an art director, skilled in translating emotions and concepts into visual instructions.
    A user has provided this memory: "${description}"
    Based on the feeling and content of this memory, provide ONLY a JSON object with two keys: "color" (a hex code representing the dominant emotion) and "pattern" (a simple geometric shape like "circle", "square", "triangle", "line", or "arc").
    Do not include any other text or explanation.
    Example output: { "color": "#FFD700", "pattern": "circle" }
  `;

  const poetic_narrative = await generatePrompt(poeticPrompt);
  const art_instructions_raw = await generatePrompt(artPrompt, true);
  const art_instructions = JSON.parse(art_instructions_raw);

  return { poetic_narrative, art_instructions };
};
