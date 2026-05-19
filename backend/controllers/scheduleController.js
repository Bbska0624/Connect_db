import Schedule from '../models/Schedule.js';

const ok   = (res, data, message = 'Request successful') =>
  res.json({ success: true, message, data });

const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, message, data: null });

// GET /api/schedule/me
export const getSchedule = async (req, res) => {
  try {
    let schedule = await Schedule.findOne({ userId: req.user._id });

    // Create empty schedule document on first access
    if (!schedule) {
      schedule = await Schedule.create({ userId: req.user._id, cells: [] });
    }

    return ok(res, schedule);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// PUT /api/schedule/me
// Body: { cells: [{ day, hour, type }] }
export const saveSchedule = async (req, res) => {
  try {
    const { cells } = req.body;

    if (!Array.isArray(cells)) return fail(res, 'cells массив шаардлагатай');

    const schedule = await Schedule.findOneAndUpdate(
      { userId: req.user._id },
      { $set: { cells } },
      { new: true, upsert: true, runValidators: true }
    );

    return ok(res, schedule, 'Хуваарь амжилттай хадгалагдлаа');
  } catch (err) {
    return fail(res, err.message, 500);
  }
};
