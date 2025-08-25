export default async function handler(req: any, res: any) {
	res.setHeader('Content-Type', 'application/json');
	
	return res.status(200).json({
		message: 'API is working!',
		method: req.method,
		envCheck: {
			hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
			keyLength: process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.length : 0
		}
	});
}
