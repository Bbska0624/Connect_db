import mongoose from 'mongoose';

const cellSchema = new mongoose.Schema({
  day:  { type: Number, required: true, min: 0, max: 6 },  // 0=Mon … 6=Sun
  hour: { type: Number, required: true, min: 8, max: 20 },
  type: { type: String, enum: ['f', 'b'], required: true }, // f=free, b=busy
}, { _id: false });

const scheduleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  cells:  { type: [cellSchema], default: [] },
}, { timestamps: true });

export default mongoose.model('Schedule', scheduleSchema);
