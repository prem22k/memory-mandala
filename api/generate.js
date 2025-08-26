export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = req.body || {};
    const prompt = body.prompt;
    const isJson = body.isJson;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Missing prompt in request body' });
      return;
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Server misconfigured: OPENROUTER_API_KEY missing' });
      return;
    }

    const referer = (req.headers?.origin || (req.headers?.host ? `https://${req.headers.host}` : 'https://example.com'));

    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': referer,
        'X-Title': 'Mandala of Us',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-distill-llama-70b:free',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        ...(isJson ? { response_format: { type: 'json_object' } } : {}),
      }),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      res.status(upstream.status).json({ error: 'OpenRouter error', status: upstream.status, details: text });
      return;
    }

    const data = await upstream.json();
    const content = data?.choices?.[0]?.message?.content ?? '';
    res.status(200).json({ content });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error?.message || String(error) });
  }
}
