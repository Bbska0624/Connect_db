import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action:   { type: String, enum: ['connect', 'pass'], required: true },
}, { timestamps: true });

// One user can only act on another user once
connectionSchema.index({ userId: 1, targetId: 1 }, { unique: true });

export default mongoose.model('Connection', connectionSchema);
