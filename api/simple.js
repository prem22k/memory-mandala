export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ 
    message: 'Simple JS API working!',
    method: req.method,
    timestamp: new Date().toISOString()
  });
}
