import User from '../models/User.js';

const ok   = (res, data, message = 'Request successful') =>
  res.json({ success: true, message, data });

const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, message, data: null });

// GET /api/profile/me
export const getProfile = async (req, res) => {
  try {
    return ok(res, req.user);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// PUT /api/profile/me
// Body: partial user fields
export const updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'major', 'year', 'bio', 'mbti', 'interests', 'goals', 'instagram', 'facebook', 'avatar'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-otp');

    return ok(res, updated, 'Профайл амжилттай хадгалагдлаа');
  } catch (err) {
    return fail(res, err.message, 500);
  }
};
