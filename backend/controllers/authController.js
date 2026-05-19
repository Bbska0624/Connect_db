import { randomInt } from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendOtpEmail } from '../utils/mailer.js';

const ok   = (res, data, message = 'Request successful', status = 200) =>
  res.status(status).json({ success: true, message, data });

const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, message, data: null });

// POST /api/auth/request-otp
// Body: { email }
export const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.toLowerCase().endsWith('@stud.num.edu.mn')) {
      return fail(res, '@stud.num.edu.mn цахим шуудан шаардлагатай');
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Auto-register on first login — profile can be completed on the setup page
      user = await User.create({
        email: email.toLowerCase(),
        name:  email.split('@')[0],
      });
    }

    // Generate, hash and store a fresh OTP with 5-minute expiry
    const code   = String(randomInt(100000, 1000000));
    const hashed = await bcrypt.hash(code, 10);
    await User.findByIdAndUpdate(user._id, {
      otp:       hashed,
      otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Send OTP via Gmail; fall back to console log if email is not configured or fails
    try {
      await sendOtpEmail(user.email, code);
    } catch (mailErr) {
      console.warn(`[OTP] Email илгээхэд алдаа гарлаа: ${mailErr.message}`);
      console.log(`[OTP] ${user.email} → ${code}`);
    }

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

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return fail(res, 'OTP код хугацаа дууссан. Дахин авна уу.');
    }

    const valid = await bcrypt.compare(code, user.otp);
    if (!valid) return fail(res, 'OTP код буруу байна');

    // Invalidate OTP immediately after successful use
    await User.findByIdAndUpdate(user._id, { otp: null, otpExpiry: null });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    return ok(res,
      { token, user: { id: user._id, email: user.email, name: user.name } },
      'Амжилттай нэвтэрлээ'
    );
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// POST /api/auth/logout
export const logout = async (_req, res) => {
  return ok(res, null, 'Гарлаа');
};
