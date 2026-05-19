import mongoose from 'mongoose';

const generalMessageSchema = new mongoose.Schema({
  senderId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName:  { type: String, required: true },
  avatar:      { type: String, default: '😊' },
  avatarStyle: { type: String, default: '' },
  text:        { type: String, required: true, trim: true },
  time:        { type: String },
}, { timestamps: true });

export default mongoose.model('GeneralMessage', generalMessageSchema);
