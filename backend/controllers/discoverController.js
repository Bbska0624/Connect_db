import User from '../models/User.js';
import Connection from '../models/Connection.js';

const ok   = (res, data, message = 'Request successful') =>
  res.json({ success: true, message, data });

const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, message, data: null });

// GET /api/discover/students
// Returns users the current user has not yet connected or passed on
export const getStudents = async (req, res) => {
  try {
    // IDs already acted on by this user
    const acted = await Connection.find({ userId: req.user._id }).select('targetId');
    const actedIds = acted.map(c => c.targetId);

    const students = await User.find({
      _id:    { $nin: [req.user._id, ...actedIds] },
      status: 'active',
      role:   'user',
    })
      .select('-otp')
      .sort({ match: -1 }); // highest match first

    return ok(res, students);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// POST /api/discover/connect/:id
export const connectStudent = async (req, res) => {
  try {
    const target = await User.findById(req.params.id).select('name');
    if (!target) return fail(res, 'Хэрэглэгч олдсонгүй', 404);

    await Connection.findOneAndUpdate(
      { userId: req.user._id, targetId: target._id },
      { action: 'connect' },
      { upsert: true }
    );

    return ok(res,
      { studentId: target._id, name: target.name },
      `${target.name}-тай холбогдлоо!`
    );
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// POST /api/discover/pass/:id
export const passStudent = async (req, res) => {
  try {
    await Connection.findOneAndUpdate(
      { userId: req.user._id, targetId: req.params.id },
      { action: 'pass' },
      { upsert: true }
    );

    return ok(res, { studentId: req.params.id }, 'Алгасав');
  } catch (err) {
    return fail(res, err.message, 500);
  }
};
