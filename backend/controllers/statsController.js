import User from '../models/User.js';
import Connection from '../models/Connection.js';

const ok   = (res, data, message = 'Request successful') =>
  res.json({ success: true, message, data });

const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, message, data: null });

// GET /api/stats  (public — no auth needed)
export const getStats = async (_req, res) => {
  try {
    const [activeUsers, totalConnections, totalActions] = await Promise.all([
      User.countDocuments({ status: 'active' }),
      Connection.countDocuments({ action: 'connect' }),
      Connection.countDocuments(),
    ]);

    // matchRate = what % of swipe actions resulted in a connect
    const matchRate = totalActions > 0
      ? Math.round((totalConnections / totalActions) * 100)
      : 0;

    return ok(res, {
      activeUsers,
      matchRate,
      totalConnections,
    });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};
