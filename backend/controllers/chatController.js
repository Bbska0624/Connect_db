import mongoose from 'mongoose';
import Message from '../models/Message.js';
import GeneralMessage from '../models/GeneralMessage.js';
import User from '../models/User.js';

const ok   = (res, data, message = 'Request successful') =>
  res.json({ success: true, message, data });

const fail = (res, message, status = 400) =>
  res.status(status).json({ success: false, message, data: null });

const nowTime = () =>
  new Date().toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });

// GET /api/chat/threads
// Aggregates all DM conversations for the current user
export const getThreads = async (req, res) => {
  try {
    const uid = req.user._id;

    // Group messages by conversation partner, pick the most recent per partner
    const threads = await Message.aggregate([
      { $match: { $or: [{ senderId: uid }, { receiverId: uid }] } },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          partnerId: {
            $cond: [{ $eq: ['$senderId', uid] }, '$receiverId', '$senderId'],
          },
        },
      },
      {
        $group: {
          _id:         '$partnerId',
          lastMessage: { $first: '$text' },
          lastTime:    { $first: '$time' },
          unread: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiverId', uid] }, { $eq: ['$read', false] }] },
                1, 0,
              ],
            },
          },
        },
      },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      {
        $project: {
          userId:      '$_id',
          name:        '$user.name',
          avatar:      '$user.avatar',
          avatarStyle: '$user.avatarStyle',
          isOnline:    '$user.isOnline',
          lastMessage: 1,
          lastTime:    1,
          unread:      1,
        },
      },
    ]);

    return ok(res, threads);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// GET /api/chat/messages/:userId
// Returns all messages between current user and :userId, marks received as read
export const getMessages = async (req, res) => {
  try {
    const uid      = req.user._id;
    const otherId  = new mongoose.Types.ObjectId(req.params.userId);

    const messages = await Message.find({
      $or: [
        { senderId: uid,    receiverId: otherId },
        { senderId: otherId, receiverId: uid },
      ],
    }).sort({ createdAt: 1 });

    // Mark all unread incoming messages as read
    await Message.updateMany(
      { senderId: otherId, receiverId: uid, read: false },
      { $set: { read: true } }
    );

    return ok(res, messages);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// POST /api/chat/messages/:userId
// Body: { text }
export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return fail(res, 'Мессеж хоосон байна');

    const newMsg = await Message.create({
      senderId:   req.user._id,
      receiverId: new mongoose.Types.ObjectId(req.params.userId),
      text:       text.trim(),
      time:       nowTime(),
    });

    return ok(res, newMsg, 'Мессеж илгээгдлээ');
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// GET /api/chat/people
// All users except the current user (for the "People" tab)
export const getPeople = async (req, res) => {
  try {
    const people = await User.find({
      _id:    { $ne: req.user._id },
      status: 'active',
      role:   'user',
    }).select('name avatar avatarStyle mbti major year isOnline match interests bio');

    // Shape to match frontend expectations
    const shaped = people.map(p => ({
      id:          p._id,
      name:        p.name,
      age:         20,                      // not stored — placeholder
      avatar:      p.avatar,
      avatarStyle: p.avatarStyle,
      mbti:        p.mbti,
      major:       p.major,
      year:        `${p.year}-р курс`,
      score:       `${p.match}%`,
      isOnline:    p.isOnline,
      tags:        p.interests.slice(0, 4),
      bio:         p.bio,
    }));

    return ok(res, shaped);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// GET /api/chat/general
export const getGeneralMessages = async (req, res) => {
  try {
    const messages = await GeneralMessage.find().sort({ createdAt: 1 }).limit(100);
    return ok(res, messages);
  } catch (err) {
    return fail(res, err.message, 500);
  }
};

// POST /api/chat/general
// Body: { text }
export const sendGeneralMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return fail(res, 'Мессеж хоосон байна');

    const newMsg = await GeneralMessage.create({
      senderId:    req.user._id,
      senderName:  req.user.name,
      avatar:      req.user.avatar,
      avatarStyle: req.user.avatarStyle,
      text:        text.trim(),
      time:        nowTime(),
    });

    return ok(res, newMsg, 'Мессеж илгээгдлээ');
  } catch (err) {
    return fail(res, err.message, 500);
  }
};
