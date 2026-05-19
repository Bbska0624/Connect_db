import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // ── Auth ──────────────────────────────────────────────────────────────
  email:       { type: String, required: true, unique: true, lowercase: true, trim: true },
  otp:         { type: String },
  otpExpiry:   { type: Date, default: null },

  // ── Profile ───────────────────────────────────────────────────────────
  name:        { type: String, required: true, trim: true },
  major:       { type: String, default: 'Программ хангамж' },
  year:        { type: Number, default: 1, min: 1, max: 6 },
  bio:         { type: String, default: '' },
  mbti:        { type: String, default: null },
  interests:   { type: [String], default: [] },
  goals:       { type: [String], default: [] },
  instagram:   { type: String, default: '' },
  facebook:    { type: String, default: '' },
  avatar:      { type: String, default: '😊' },
  avatarStyle: { type: String, default: 'linear-gradient(135deg,var(--accent-lt),var(--accent))' },

  // ── Discovery ─────────────────────────────────────────────────────────
  match:       { type: Number, default: 0 },   // schedule-overlap score vs seed user
  isOnline:    { type: Boolean, default: false },

  // ── Premium ───────────────────────────────────────────────────────────
  isPremium:   { type: Boolean, default: false },
  currentPlan: { type: String, enum: ['free', 'pro', 'proplus'], default: 'free' },

  // ── Admin ─────────────────────────────────────────────────────────────
  status:      { type: String, enum: ['active', 'blocked', 'reported'], default: 'active' },
  role:        { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
