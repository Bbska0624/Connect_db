import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text:       { type: String, required: true, trim: true },
  time:       { type: String },     // display time string e.g. "14:32"
  read:       { type: Boolean, default: false },
}, { timestamps: true });

// Speed up thread-list aggregation
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ createdAt: -1 });

export default mongoose.model('Message', messageSchema);
