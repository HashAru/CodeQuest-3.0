import jwt from 'jsonwebtoken';

export default function auth(req, res, next){
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No auth token' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id; next();
  } catch (err) { res.status(401).json({ message: 'Invalid token' }); }
}
