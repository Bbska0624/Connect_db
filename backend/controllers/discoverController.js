import User from '../models/User.js';
import Connection from '../models/Connection.js';
import Schedule from '../models/Schedule.js';

const ok   = (res, data, message = 'Request successful') =>
  res.json({ success: true, message, data });

const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, message, data: null });

// Symmetric Jaccard-based match score with MBTI compatibility chart and major/year bonuses.
const WEIGHTS = { schedule: 35, interests: 25, goals: 20, mbti: 20 };

// Jaccard similarity: |A∩B| / |A∪B| · 100
const jaccard = (a, b, keyFn = x => String(x).toLowerCase()) => {
  if (!a.length || !b.length) return null;
  const setA = new Set(a.map(keyFn));
  const setB = new Set(b.map(keyFn));
  let inter = 0;
  for (const k of setA) if (setB.has(k)) inter++;
  const union = setA.size + setB.size - inter;
  return union === 0 ? null : (inter / union) * 100;
};

// Known compatible MBTI pairs (Keirsey/16Personalities consensus). Returns 100 if listed.
const MBTI_PAIRS = {
  INFJ: ['ENFP', 'ENTP'], INFP: ['ENFJ', 'ENTJ'],
  ENFJ: ['INFP', 'ISFP'], ENFP: ['INFJ', 'INTJ'],
  INTJ: ['ENFP', 'ENTP'], INTP: ['ENTJ', 'ESTJ'],
  ENTJ: ['INTP', 'INFP'], ENTP: ['INFJ', 'INTJ'],
  ISFJ: ['ESFP', 'ESTP'], ISFP: ['ENFJ', 'ESFJ'],
  ESFJ: ['ISFP', 'ISTP'], ESFP: ['ISFJ', 'ISTJ'],
  ISTJ: ['ESFP', 'ESTP'], ISTP: ['ESFJ', 'ESTJ'],
  ESTJ: ['ISTP', 'INTP'], ESTP: ['ISFJ', 'ISTJ'],
};

const mbtiScore = (a, b) => {
  if (!a || !b || a.length !== 4 || b.length !== 4) return null;
  const A = a.toUpperCase(), B = b.toUpperCase();
  if (A === B) return 100;
  if (MBTI_PAIRS[A]?.includes(B) || MBTI_PAIRS[B]?.includes(A)) return 100;
  let same = 0;
  for (let i = 0; i < 4; i++) if (A[i] === B[i]) same++;
  return (same / 4) * 75; // max 75 for non-listed pairs, scaled by letter match
};

const calcMatch = ({
  myFree, peerFree,
  myInterests, peerInterests,
  myGoals, peerGoals,
  myMbti, peerMbti,
  myMajor, peerMajor,
  myYear, peerYear,
}) => {
  const parts = [
    { w: WEIGHTS.schedule,  v: jaccard(myFree, peerFree, c => `${c.day}-${c.hour}`) },
    { w: WEIGHTS.interests, v: jaccard(myInterests, peerInterests) },
    { w: WEIGHTS.goals,     v: jaccard(myGoals, peerGoals) },
    { w: WEIGHTS.mbti,      v: mbtiScore(myMbti, peerMbti) },
  ].filter(p => p.v !== null);

  if (!parts.length) return 0;
  const base = parts.reduce((s, p) => s + p.w * p.v, 0) / parts.reduce((s, p) => s + p.w, 0);

  // Bonuses (capped, only added once base is computed)
  let bonus = 0;
  if (myMajor && peerMajor && myMajor.trim().toLowerCase() === peerMajor.trim().toLowerCase()) bonus += 5;
  if (myYear && peerYear) {
    const diff = Math.abs(myYear - peerYear);
    if (diff === 0) bonus += 4;
    else if (diff === 1) bonus += 2;
  }

  return Math.min(100, Math.max(0, Math.round(base + bonus)));
};

// GET /api/discover/students
// Returns users with dynamically computed schedule-overlap match scores
export const getStudents = async (req, res) => {
  try {
    const acted = await Connection.find({ userId: req.user._id }).select('targetId');
    const actedIds = acted.map(c => c.targetId);

    const me = await User.findById(req.user._id).select('interests goals mbti major year').lean();
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
        myFree,                           peerFree,
        myInterests: me?.interests || [], peerInterests: s.interests || [],
        myGoals:     me?.goals     || [], peerGoals:     s.goals     || [],
        myMbti:      me?.mbti,            peerMbti:      s.mbti,
        myMajor:     me?.major,           peerMajor:     s.major,
        myYear:      me?.year,            peerYear:      s.year,
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
