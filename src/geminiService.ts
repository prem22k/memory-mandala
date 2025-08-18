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
    You are an expert art director and generative artist. Given this memory: "${description}", derive parameters for a unique mandala layer.

    Respond ONLY with valid JSON containing these keys:
    {
      "color": "#RRGGBB",                // primary hex color
      "secondary_color": "#RRGGBB",      // complementary/accent color
      "pattern": "circle|square|triangle|line|arc", // base archetype (fallback)
      "symmetry": 4..24,                  // number of symmetries/rotational repeats
      "petals": 4..36,                    // number of petals/lobes for floral/arc motifs
      "energy": "calm|romantic|energetic", // influences motion/amplitude
      "strokeStyle": "solid|dotted|dashed", // line style
      "seed": 1..1000000                  // deterministic seed for this memory
    }

    Notes:
    - Choose colors to match emotion (romantic: pink/purple/gold, calm: blue/green, energetic: orange/red/electric blue)
    - symmetry higher => more intricate; petals ties to floral look; energy drives motion amplitude
    - seed must be a positive integer for reproducibility
  `;

  const poetic_narrative = await generatePrompt(poeticPrompt);
  const art_instructions_raw = await generatePrompt(artPrompt, true);
  const art_instructions = JSON.parse(art_instructions_raw);

  return { poetic_narrative, art_instructions };
};
