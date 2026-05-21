import User from '../models/User.js';
import Connection from '../models/Connection.js';
import Schedule from '../models/Schedule.js';

const ok   = (res, data, message = 'Request successful') =>
  res.json({ success: true, message, data });

const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, message, data: null });

// Weighted match score (0-100) from schedule, interests, goals, and MBTI overlap.
const WEIGHTS = { schedule: 0.40, interests: 0.25, goals: 0.20, mbti: 0.15 };

const overlapPct = (mine, peer, keyFn = x => String(x).toLowerCase()) => {
  if (!mine.length || !peer.length) return null;
  const peerSet = new Set(peer.map(keyFn));
  const common = mine.filter(x => peerSet.has(keyFn(x))).length;
  return (common / mine.length) * 100;
};

const mbtiPct = (a, b) => {
  if (!a || !b || a.length !== 4 || b.length !== 4) return null;
  let same = 0;
  for (let i = 0; i < 4; i++) if (a[i].toUpperCase() === b[i].toUpperCase()) same++;
  return (same / 4) * 100;
};

const calcMatch = ({ myFree, peerFree, myInterests, peerInterests, myGoals, peerGoals, myMbti, peerMbti }) => {
  const parts = [
    { w: WEIGHTS.schedule,  v: overlapPct(myFree, peerFree, c => `${c.day}-${c.hour}`) },
    { w: WEIGHTS.interests, v: overlapPct(myInterests, peerInterests) },
    { w: WEIGHTS.goals,     v: overlapPct(myGoals, peerGoals) },
    { w: WEIGHTS.mbti,      v: mbtiPct(myMbti, peerMbti) },
  ].filter(p => p.v !== null);

  if (!parts.length) return 0;
  const weightedSum = parts.reduce((acc, p) => acc + p.v * p.w, 0);
  const totalWeight = parts.reduce((acc, p) => acc + p.w, 0);
  return Math.round(weightedSum / totalWeight);
};

// GET /api/discover/students
// Returns users with dynamically computed schedule-overlap match scores
export const getStudents = async (req, res) => {
  try {
    const acted = await Connection.find({ userId: req.user._id }).select('targetId');
    const actedIds = acted.map(c => c.targetId);

    const me = await User.findById(req.user._id).select('interests goals mbti').lean();
    const mySchedule = await Schedule.findOne({ userId: req.user._id }).lean();
    const myFree = (mySchedule?.cells || []).filter(c => c.type === 'f');

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
      const peerFree = peerCells.filter(c => c.type === 'f');
      const match = calcMatch({
        myFree,            peerFree,
        myInterests: me?.interests || [], peerInterests: s.interests || [],
        myGoals:     me?.goals     || [], peerGoals:     s.goals     || [],
        myMbti:      me?.mbti,            peerMbti:      s.mbti,
      });
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
