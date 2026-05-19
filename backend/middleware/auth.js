import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Attaches req.user for all protected routes.
// Expects:  Authorization: Bearer <token>
const auth = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Нэвтрэх шаардлагатай', data: null });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-otp');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Хэрэглэгч олдсонгүй', data: null });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Токен хүчингүй байна', data: null });
  }
};

export default auth;
