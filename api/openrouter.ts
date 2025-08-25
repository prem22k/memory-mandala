export default async function handler(req: any, res: any) {
	console.log('API handler called with method:', req.method);
	console.log('Request headers:', req.headers);
	console.log('Request body type:', typeof req.body);
	console.log('Environment check - API_KEY exists:', !!process.env.OPENROUTER_API_KEY);

	// Set proper headers for JSON responses
	res.setHeader('Content-Type', 'application/json');

	// Only allow POST requests
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		let description: string | undefined;
		try {
			if (typeof req.body === 'string') {
				const parsed = JSON.parse(req.body);
				description = parsed?.description;
			} else {
				description = req.body?.description;
			}
		} catch (parseErr) {
			console.error('Failed to parse request body:', parseErr);
			return res.status(400).json({ error: 'Invalid JSON in request body' });
		}

		console.log('Parsed description:', description);

		if (!description || typeof description !== 'string') {
			return res.status(400).json({ error: 'Description is required' });
		}

		// Get API key from server environment (not exposed to client)
		const API_KEY = process.env.OPENROUTER_API_KEY;
		
		if (!API_KEY) {
			console.error('OpenRouter API key not found in environment variables');
			return res.status(500).json({ 
				error: 'Server configuration error: missing OPENROUTER_API_KEY',
				details: 'Please set OPENROUTER_API_KEY in Vercel environment variables'
			});
		}

		console.log('API key found, length:', API_KEY.length);

		const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
		const referer = (req.headers && (req.headers.origin || req.headers.referer)) || 'https://memory-mandala.vercel.app';
		
		console.log('Using referer:', referer);

		const commonHeaders = {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${API_KEY}`,
			'HTTP-Referer': referer,
			'X-Title': 'Mandala of Us',
		};

		console.log('Making first API call for poetic narrative...');

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
			headers: commonHeaders,
			body: JSON.stringify({
				model: 'deepseek/deepseek-r1:free',
				messages: [
					{ role: 'user', content: poeticPrompt }
				],
				temperature: 0.7,
				max_tokens: 1000,
			}),
		});

		console.log('Poetic response status:', poeticResponse.status);

		if (!poeticResponse.ok) {
			let errorPayload: any = undefined;
			const text = await poeticResponse.text();
			try { 
				errorPayload = JSON.parse(text); 
			} catch { 
				errorPayload = { raw: text }; 
			}
			console.error('OpenRouter API Error (poetry):', {
				status: poeticResponse.status,
				statusText: poeticResponse.statusText,
				data: errorPayload,
			});
			return res.status(poeticResponse.status).json({
				error: 'OpenRouter error (poetry)',
				details: errorPayload,
			});
		}

		const poeticData = await poeticResponse.json();
		const poetic_narrative = poeticData.choices?.[0]?.message?.content || '';

		console.log('Poetic narrative generated, length:', poetic_narrative.length);

		// Generate art instructions
		const artPrompt = `
			You are an expert art director and generative artist. Given this memory: "${description}", derive parameters for a unique mandala layer.
			CRITICAL: Analyze the specific content and choose parameters accordingly.
			Respond with ONLY a JSON object with keys: color, secondary_color, pattern, symmetry, petals, energy, strokeStyle, seed.
		`;

		console.log('Making second API call for art instructions...');

		const artResponse = await fetch(API_URL, {
			method: 'POST',
			headers: commonHeaders,
			body: JSON.stringify({
				model: 'deepseek/deepseek-r1:free',
				messages: [
					{ role: 'user', content: artPrompt }
				],
				temperature: 0.7,
				max_tokens: 1000,
				response_format: { type: 'json_object' },
			}),
		});

		console.log('Art response status:', artResponse.status);

		if (!artResponse.ok) {
			let errorPayload: any = undefined;
			const text = await artResponse.text();
			try { 
				errorPayload = JSON.parse(text); 
			} catch { 
				errorPayload = { raw: text }; 
			}
			console.error('OpenRouter API Error (art):', {
				status: artResponse.status,
				statusText: artResponse.statusText,
				data: errorPayload,
			});
			return res.status(artResponse.status).json({
				error: 'OpenRouter error (art)',
				details: errorPayload,
			});
		}

		const artData = await artResponse.json();
		const art_instructions_raw = artData.choices?.[0]?.message?.content || '{}';
		
		console.log('Art instructions raw:', art_instructions_raw);
		
		let art_instructions: any;
		try {
			art_instructions = JSON.parse(art_instructions_raw);
		} catch (error) {
			console.error('Failed to parse JSON from API response:', art_instructions_raw);
			return res.status(500).json({ 
				error: 'Invalid JSON response from API (art)', 
				details: art_instructions_raw 
			});
		}

		console.log('Successfully generated both poetic narrative and art instructions');

		// Return the enhanced memory data
		return res.status(200).json({
			poetic_narrative,
			art_instructions
		});

	} catch (error: any) {
		console.error('Server error:', { 
			message: error?.message, 
			stack: error?.stack,
			name: error?.name 
		});
		return res.status(500).json({ 
			error: 'Internal server error', 
			message: error?.message,
			type: error?.name
		});
	}
}
