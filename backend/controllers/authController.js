import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const ok   = (res, data, message = 'Request successful', status = 200) =>
  res.status(status).json({ success: true, message, data });

const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, message, data: null });

// POST /api/auth/request-otp
// Body: { email }
export const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.toLowerCase().endsWith('@num.edu.mn')) {
      return fail(res, '@num.edu.mn цахим шуудан шаардлагатай');
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return fail(res, 'Бүртгэлтэй хэрэглэгч олдсонгүй');

    // In production: send OTP via email. Here we just confirm it exists in DB.
    return ok(res, { email: user.email, expiresIn: 300 }, `${user.email} руу OTP код илгээлээ`);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// POST /api/auth/verify-otp
// Body: { email, code }
export const verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) return fail(res, 'Цахим шуудан болон OTP код шаардлагатай');

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return fail(res, 'Хэрэглэгч олдсонгүй');
    if (user.otp !== code) return fail(res, 'OTP код буруу байна');

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    return ok(res,
      { token, user: { id: user._id, email: user.email, name: user.name } },
      'Амжилттай нэвтэрлээ'
    );
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// POST /api/auth/logout  (client just discards the token — no server state)
export const logout = async (_req, res) => {
  return ok(res, null, 'Гарлаа');
};
