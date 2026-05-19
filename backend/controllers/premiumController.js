import PremiumPlan from '../models/PremiumPlan.js';
import User from '../models/User.js';

const ok   = (res, data, message = 'Request successful') =>
  res.json({ success: true, message, data });

const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, message, data: null });

// GET /api/premium/plans
export const getPlans = async (_req, res) => {
  try {
    const plans = await PremiumPlan.find().sort({ price: 1 });
    // Return planId as 'id' to match frontend shape
    const shaped = plans.map(p => ({ ...p.toObject(), id: p.planId }));
    return ok(res, shaped);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// GET /api/premium/status
export const getStatus = async (req, res) => {
  try {
    return ok(res, { currentPlan: req.user.currentPlan });
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// POST /api/premium/subscribe
// Body: { planId }
export const subscribe = async (req, res) => {
  try {
    const { planId } = req.body;
    const validPlans = ['free', 'pro', 'proplus'];
    if (!validPlans.includes(planId)) return fail(res, 'Буруу багцын ID');

    const plan = await PremiumPlan.findOne({ planId });
    if (!plan) return fail(res, 'Багц олдсонгүй', 404);

    await User.findByIdAndUpdate(req.user._id, {
      currentPlan: planId,
      isPremium:   planId !== 'free',
    });

    return ok(res, { plan: planId }, `${plan.name} багц амжилттай идэвхжлээ 🎉`);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};
