import User from '../models/User.js';
import Connection from '../models/Connection.js';
import Schedule from '../models/Schedule.js';

const ok   = (res, data, message = 'Request successful') =>
  res.json({ success: true, message, data });

const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, message, data: null });

// Free-cell overlap score (0-100). Falls back to interest similarity when no schedule.
const calcMatch = (myFreeCells, peerFreeCells, myInterests = [], peerInterests = []) => {
  if (myFreeCells.length && peerFreeCells.length) {
    const peerKeys = new Set(peerFreeCells.map(c => `${c.day}-${c.hour}`));
    const common = myFreeCells.filter(c => peerKeys.has(`${c.day}-${c.hour}`));
    return Math.round((common.length / myFreeCells.length) * 100);
  }
  if (myInterests.length && peerInterests.length) {
    const peerSet = new Set(peerInterests.map(i => i.toLowerCase()));
    const overlap = myInterests.filter(i => peerSet.has(i.toLowerCase())).length;
    return Math.round((overlap / myInterests.length) * 100);
  }
  return 0;
};

// GET /api/discover/students
// Returns users with dynamically computed schedule-overlap match scores
export const getStudents = async (req, res) => {
  try {
    const acted = await Connection.find({ userId: req.user._id }).select('targetId');
    const actedIds = acted.map(c => c.targetId);

    const me = await User.findById(req.user._id).select('interests').lean();
    const mySchedule = await Schedule.findOne({ userId: req.user._id }).lean();
    const myFreeCells = (mySchedule?.cells || []).filter(c => c.type === 'f');

    const students = await User.find({
      _id:    { $nin: [req.user._id, ...actedIds] },
      status: 'active',
      role:   'user',
    }).select('-otp').lean();

    const studentIds = students.map(s => s._id);
    const schedules = await Schedule.find({ userId: { $in: studentIds } }).lean();
    const scheduleMap = new Map(schedules.map(s => [String(s.userId), s.cells]));

    const withMatch = students.map(s => {
      const peerCells = scheduleMap.get(String(s._id)) || [];
      const peerFreeCells = peerCells.filter(c => c.type === 'f');
      const match = calcMatch(myFreeCells, peerFreeCells, me?.interests || [], s.interests || []);
      return { ...s, match };
    });

    withMatch.sort((a, b) => b.match - a.match);

    return ok(res, withMatch);
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
