import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    // Get API key from server environment (not exposed to client)
    const API_KEY = process.env.OPENROUTER_API_KEY;
    
    if (!API_KEY) {
      console.error('OpenRouter API key not found in environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

    // Generate poetic narrative
    const poeticPrompt = `
      You are a master poet, skilled in capturing the essence of love and memories in beautiful, evocative verse.
      A user has provided this memory: "${description}"
      
      Transform this memory into a short, romantic, and deeply emotional poetic narrative of 3-4 lines.
      The poem should be beautiful, heartfelt, and capture the magic of the moment.
      Make it feel like a love letter or a romantic verse that would be meaningful to a couple.
    `;

    const poeticResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': req.headers.origin || 'https://your-domain.vercel.app',
        'X-Title': 'Mandala of Us',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1:free',
        messages: [
          {
            role: 'user',
            content: poeticPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!poeticResponse.ok) {
      const errorData = await poeticResponse.json().catch(() => ({}));
      console.error('OpenRouter API Error:', {
        status: poeticResponse.status,
        statusText: poeticResponse.statusText,
        data: errorData,
      });
      
      if (poeticResponse.status === 402) {
        return res.status(500).json({ error: 'OpenRouter API billing issue. Please check your API key and billing status.' });
      } else if (poeticResponse.status === 401) {
        return res.status(500).json({ error: 'Invalid OpenRouter API key.' });
      } else if (poeticResponse.status === 429) {
        return res.status(429).json({ error: 'OpenRouter API rate limit exceeded. Please try again later.' });
      } else {
        return res.status(500).json({ error: `OpenRouter API error: ${errorData.error?.message || 'Unknown error'}` });
      }
    }

    const poeticData = await poeticResponse.json();
    const poetic_narrative = poeticData.choices[0].message.content;

    // Generate art instructions
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

    const artResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'HTTP-Referer': req.headers.origin || 'https://your-domain.vercel.app',
        'X-Title': 'Mandala of Us',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1:free',
        messages: [
          {
            role: 'user',
            content: artPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!artResponse.ok) {
      const errorData = await artResponse.json().catch(() => ({}));
      console.error('OpenRouter API Error (art):', {
        status: artResponse.status,
        statusText: artResponse.statusText,
        data: errorData,
      });
      
      return res.status(500).json({ error: `OpenRouter API error: ${errorData.error?.message || 'Unknown error'}` });
    }

    const artData = await artResponse.json();
    const art_instructions_raw = artData.choices[0].message.content;
    
    // Parse the art instructions
    let art_instructions;
    try {
      art_instructions = JSON.parse(art_instructions_raw);
    } catch (error) {
      console.error('Failed to parse JSON from API response:', art_instructions_raw);
      return res.status(500).json({ error: 'Invalid JSON response from API. Please try again.' });
    }

    // Return the enhanced memory data
    return res.status(200).json({
      poetic_narrative,
      art_instructions
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
