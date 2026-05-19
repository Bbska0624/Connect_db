import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  icon:        { type: String, default: '⚠️' },
  title:       { type: String, required: true },
  description: { type: String, required: true },
  status:      { type: String, enum: ['open', 'resolved'], default: 'open' },
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);
