import axios from 'axios';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const generatePrompt = async (prompt: string, isJson = false) => {
  try {
    console.log('Making OpenRouter API call with model: deepseek/deepseek-r1:free');
    console.log('API Key present:', !!API_KEY);
    
    const response = await axios.post(API_URL, {
      model: 'deepseek/deepseek-r1:free',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: isJson ? { type: 'json_object' } : undefined,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Mandala of Us',
      },
    });
    
    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('OpenRouter API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 402) {
      throw new Error('OpenRouter API billing issue. Please check your API key and billing status at https://openrouter.ai/');
    } else if (error.response?.status === 401) {
      throw new Error('Invalid OpenRouter API key. Please check your VITE_OPENROUTER_API_KEY environment variable.');
    } else if (error.response?.status === 429) {
      throw new Error('OpenRouter API rate limit exceeded. Please try again later.');
    } else {
      throw new Error(`OpenRouter API error: ${error.response?.data?.error?.message || error.message}`);
    }
  }
};

const parseArtInstructions = (rawResponse: string) => {
  try {
    // Try to parse the raw response
    console.log('Raw API response:', rawResponse);
    return JSON.parse(rawResponse);
  } catch (error) {
    console.error('Failed to parse JSON from API response:', rawResponse);
    throw new Error('Invalid JSON response from API. Please try again.');
  }
};

export const getEnhancedMemory = async (description: string) => {
  const poeticPrompt = `
    You are a master poet, skilled in capturing the essence of love and memories in beautiful, evocative verse.
    A user has provided this memory: "${description}"
    
    Transform this memory into a short, romantic, and deeply emotional poetic narrative of 3-4 lines.
    The poem should be beautiful, heartfelt, and capture the magic of the moment.
    Make it feel like a love letter or a romantic verse that would be meaningful to a couple.
    
    IMPORTANT: Respond with ONLY the poem text. No markdown formatting, no asterisks, no bold text, no extra symbols.
    Just pure, beautiful poetry in plain text.
  `;

  const artPrompt = `
    You are an expert art director and generative artist. Given this memory: "${description}", derive parameters for a unique mandala layer.

    CRITICAL: You MUST analyze the SPECIFIC content of this memory and choose accordingly. DO NOT default to romantic patterns.

    PATTERN SELECTION - Choose based on the ACTUAL activities described:
    - "circle": ONLY for peaceful activities like sitting together, quiet moments, or when people are in perfect harmony
    - "square": ONLY for structured activities like cooking, organizing, building, or home-related tasks
    - "triangle": ONLY for energetic activities like dancing, sports, running, or dynamic movements
    - "line": ONLY for travel, walking, running, or any linear movement from point A to B
    - "arc": ONLY for unique experiences that combine multiple emotions or are truly one-of-a-kind

    ENERGY SELECTION - Choose based on the ACTUAL mood:
    - "romantic": ONLY for intimate moments like hugs, kisses, or pure love expressions
    - "energetic": ONLY for active moments, sports, dancing, horror experiences, or high-energy activities
    - "calm": ONLY for peaceful moments, quiet activities, nature walks, or relaxing experiences

    PETALS SELECTION - Choose based on the ACTUAL complexity:
    - 6-12 petals: ONLY for simple, single activities (walking, sitting, one emotion)
    - 13-24 petals: ONLY for moderate complexity (2-3 activities or mixed emotions)
    - 25-36 petals: ONLY for complex experiences (4+ activities or highly emotional moments)

    COLOR SELECTION - Choose based on the ACTUAL mood and avoid repetition:
    - Romantic moments: pink (#FF69B4), purple (#9B59B6), rose (#E91E63), magenta (#FF1493)
    - Calm/peaceful: blue (#3498DB), teal (#008B8B), lavender (#E6E6FA), mint (#98FF98)
    - Energetic/exciting: orange (#FF6B35), red (#E74C3C), coral (#FF7F50), yellow (#FFD700)
    - Nature/outdoor: green (#2ECC71), forest (#228B22), sky (#87CEEB), earth (#8B4513)
    - Night/mysterious: indigo (#4B0082), navy (#000080), dark purple (#663399), charcoal (#36454F)
    - Warm/cozy: amber (#FFB347), peach (#FFCBA4), cream (#FFFDD0), tan (#D2B48C)
    - Conflict/tense: dark red (#8B0000), burgundy (#800020), dark orange (#FF8C00), deep purple (#4B0082)

    You must respond with ONLY a valid JSON object containing these exact keys:
    {
      "color": "choose appropriate hex color",
      "secondary_color": "choose complementary hex color",
      "pattern": "choose appropriate pattern",
      "symmetry": "choose number 8-24",
      "petals": "choose number 6-36",
      "energy": "choose appropriate energy",
      "strokeStyle": "choose appropriate stroke style",
      "seed": "choose unique positive integer"
    }

    CRITICAL RULES:
    - If the memory is about walking, running, or travel → pattern MUST be "line"
    - If the memory is about cooking, organizing, or structured tasks → pattern MUST be "square"
    - If the memory is about dancing, sports, or active movement → pattern MUST be "triangle"
    - If the memory is about sitting quietly or peaceful moments → pattern MUST be "circle"
    - If the memory is about horror, excitement, or high energy → energy MUST be "energetic"
    - If the memory is about nature, quiet activities → energy MUST be "calm"
    - If the memory is ONLY about love/intimacy → energy can be "romantic"
    - Petals MUST reflect the actual number of activities or emotions described

    SPECIAL SCENARIOS:
    - FIGHTS/ARGUMENTS: pattern="triangle" (dynamic tension), energy="energetic" (high emotion), petals=20-28 (complex emotions), colors=dark red/burgundy
    - MISUNDERSTANDINGS: pattern="arc" (complex emotions), energy="energetic" (emotional intensity), petals=18-24 (mixed feelings), colors=deep purple/indigo
    - APOLOGIES/MAKEUP: pattern="circle" (coming back to harmony), energy="calm" (resolution), petals=16-22 (moderate complexity), colors=blue/lavender
    - STRESS/ANXIETY: pattern="square" (structured tension), energy="energetic" (internal energy), petals=14-20 (moderate complexity), colors=dark orange/charcoal
    - SADNESS/GRIEF: pattern="arc" (emotional curves), energy="calm" (quiet intensity), petals=22-28 (complex emotions), colors=indigo/navy

    EXAMPLES:
    - "walking in the park" → pattern="line", energy="calm", petals=8-10 (simple activity)
    - "cooking dinner together" → pattern="square", energy="romantic", petals=12-16 (moderate complexity)
    - "dancing at the party" → pattern="triangle", energy="energetic", petals=14-18 (moderate complexity)
    - "horror house experience" → pattern="arc", energy="energetic", petals=20-26 (complex experience)
    - "sitting by the lake" → pattern="circle", energy="calm", petals=6-10 (simple activity)
    - "had a big fight" → pattern="triangle", energy="energetic", petals=22-26 (complex emotions), color=dark red
    - "misunderstanding resolved" → pattern="arc", energy="calm", petals=18-22 (moderate complexity), color=deep purple
    - "stressful work day" → pattern="square", energy="energetic", petals=16-20 (moderate complexity), color=dark orange

    DO NOT default to romantic/arc patterns. Analyze the actual content and choose accordingly.
    Respond with ONLY the JSON object, no other text.
  `;

  const poetic_narrative = await generatePrompt(poeticPrompt);
  const art_instructions_raw = await generatePrompt(artPrompt, true);
  const art_instructions = parseArtInstructions(art_instructions_raw);

  return { poetic_narrative, art_instructions };
};