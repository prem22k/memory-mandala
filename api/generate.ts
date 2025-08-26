export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { prompt, isJson } = req.body || {};
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Missing prompt' });
      return;
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Server misconfigured: OPENROUTER_API_KEY missing' });
      return;
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': (req.headers?.origin || (req.headers?.host ? `https://${req.headers.host}` : 'https://example.com')),
        'X-Title': 'Mandala of Us',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-distill-llama-70b:free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        ...(isJson ? { response_format: { type: 'json_object' } } : {}),
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      res.status(response.status).json({ error: 'OpenRouter error', details: text });
      return;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content ?? '';
    res.status(200).json({ content });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error', details: error?.message || String(error) });
  }
}
