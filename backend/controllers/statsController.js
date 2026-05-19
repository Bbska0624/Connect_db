import User from '../models/User.js';
import Connection from '../models/Connection.js';

const ok   = (res, data, message = 'Request successful') =>
  res.json({ success: true, message, data });

const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, message, data: null });

// GET /api/stats  (public — no auth needed)
export const getStats = async (_req, res) => {
  try {
    const [activeUsers, totalConnections] = await Promise.all([
      User.countDocuments({ status: 'active' }),
      Connection.countDocuments({ action: 'connect' }),
    ]);

    return ok(res, {
      activeUsers,
      matchRate:        89,   // % — would be computed from schedule overlaps in production
      totalConnections,
      rating:           4.8,
    });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};
