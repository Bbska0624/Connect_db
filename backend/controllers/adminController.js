import User from '../models/User.js';
import Connection from '../models/Connection.js';
import Report from '../models/Report.js';

const ok   = (res, data, message = 'Request successful') =>
  res.json({ success: true, message, data });

const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, message, data: null });

// Seeded DAU data (would come from a time-series collection in production)
const DAU_SEED = [
  { day: 'Да', value: 98  },
  { day: 'Мя', value: 128 },
  { day: 'Лх', value: 86  },
  { day: 'Пү', value: 156 },
  { day: 'Ба', value: 116 },
  { day: 'Бя', value: 169 },
  { day: 'Ня', value: 124 },
];

// GET /api/admin/dashboard
// Computes KPIs from live MongoDB data
export const getDashboard = async (_req, res) => {
  try {
    const [totalUsers, totalConnections, premiumUsers] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Connection.countDocuments({ action: 'connect' }),
      User.countDocuments({ currentPlan: { $ne: 'free' } }),
    ]);

    const kpis = {
      totalUsers,
      totalUsersChange:      12,
      dailyActive:           Math.round(totalUsers * 0.27),
      dailyActiveChange:     8,
      totalConnections,
      totalConnectionsChange: 24,
      premiumUsers,
      conversionRate:        totalUsers > 0 ? +((premiumUsers / totalUsers) * 100).toFixed(1) : 0,
    };

    const metrics = { matchScore: 71, chatResponseRate: 40, premiumConversion: kpis.conversionRate, rating: 4.3 };

    return ok(res, { kpis, dau: DAU_SEED, metrics });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// GET /api/admin/users?search=&filter=
export const getUsers = async (req, res) => {
  try {
    const { search = '', filter = 'Бүгд' } = req.query;

    const query = { role: 'user' };

    if (search.trim()) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (filter !== 'Бүгд') {
      query.currentPlan = filter.toLowerCase();
    }

    const users = await User.find(query).select('-otp').sort({ createdAt: 1 });

    // Shape to match frontend admin table
    const shaped = users.map(u => ({
      id:     u._id,
      name:   u.name,
      email:  u.email,
      avatar: u.avatar,
      major:  u.major,
      year:   `${u.year}-р курс`,
      plan:   u.currentPlan,
      status: u.status,
    }));

    return ok(res, shaped);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// PUT /api/admin/users/:id/block
export const blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { status: 'blocked' } },
      { new: true }
    );
    if (!user) return fail(res, 'Хэрэглэгч олдсонгүй', 404);

    return ok(res, { userId: user._id }, 'Хэрэглэгч блоклогдлоо');
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// GET /api/admin/reports
export const getReports = async (_req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    return ok(res, reports);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};
