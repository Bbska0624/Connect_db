/**
 * Seed script — populates MongoDB with initial data.
 * Run once:  npm run seed
 *
 * WARNING: clears all existing data in every collection before inserting.
 */

import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '../.env') });

import User           from '../models/User.js';
import Schedule       from '../models/Schedule.js';
import Message        from '../models/Message.js';
import GeneralMessage from '../models/GeneralMessage.js';
import PremiumPlan    from '../models/PremiumPlan.js';
import Report         from '../models/Report.js';
import Connection     from '../models/Connection.js';

// ─────────────────────────────────────────────────────────────────────────────
// Seed data (mirrors what was in the JSON mock files)
// ─────────────────────────────────────────────────────────────────────────────

const USERS = [
  {
    email:       '20b1num0042@num.edu.mn',
    name:        'Мягмарсүрэн Д.',
    otp:         '427831',
    major:       'Программ хангамж',
    year:        3,
    bio:         'Программ хангамжийн 3-р курсын оюутан. AI, веб хөгжүүлэлтэд сонирхолтой ☕',
    mbti:        'INTP',
    interests:   ['💻 Код бичих', '☕ Кофе', '📖 Уншлага'],
    goals:       ['Хамт суралцах', 'Проект хийх'],
    avatar:      '😊',
    avatarStyle: 'linear-gradient(135deg,var(--accent-lt),var(--accent))',
    match:       0,
    isOnline:    true,
    role:        'admin',
  },
  {
    email:       '20b1num0001@num.edu.mn',
    name:        'Номинчимэг',
    otp:         '112233',
    major:       'Программ хангамж',
    year:        3,
    bio:         'React болон ML-д сонирхолтой. Хамт ажиллах хамтрагч хайж байна.',
    mbti:        'INTJ',
    interests:   ['💻 Код', '📚 Судалгаа', '☕ Кофе', '🤖 AI'],
    goals:       ['Проект', 'Судалгаа'],
    avatar:      '👩‍💻',
    avatarStyle: 'linear-gradient(135deg,var(--accent-lt),var(--accent))',
    match:       87,
    isOnline:    true,
  },
  {
    email:       '20b1num0002@num.edu.mn',
    name:        'Батмөнх',
    otp:         '000001',
    major:       'Эдийн засаг',
    year:        2,
    bio:         'Статистик, өгөгдөл шинжилгээнд дуртай.',
    mbti:        'INFP',
    interests:   ['🔬 Судалгаа', '📖 Уншлага', '🎵 Хөгжим'],
    goals:       ['Судалгаа', 'Хамт суралцах'],
    avatar:      '🧑‍🔬',
    avatarStyle: 'linear-gradient(135deg,#E0F2FE,#6EE7B7)',
    match:       72,
    isOnline:    true,
  },
  {
    email:       '20b1num0003@num.edu.mn',
    name:        'Энхтуяа',
    otp:         '000002',
    major:       'Дизайн',
    year:        1,
    bio:         'UI/UX дизайнд сонирхолтой. Figma, Adobe XD ашигладаг.',
    mbti:        'ENFP',
    interests:   ['🎨 Дизайн', '📸 Фото', '☕ Кофе'],
    goals:       ['Дизайн', 'Бүтээлч'],
    avatar:      '👩‍🎨',
    avatarStyle: 'linear-gradient(135deg,#F3E8FF,#DDD6FE)',
    match:       79,
    isOnline:    true,
  },
  {
    email:       '20b1num0004@num.edu.mn',
    name:        'Алтжин',
    otp:         '000003',
    major:       'Мэдээлэл технологи',
    year:        4,
    bio:         'МТ-ийн 4-р курсын оюутан. Веб хөгжүүлэлтэд сонирхолтой.',
    mbti:        'ENFP',
    interests:   ['🎨 Дизайн', '📸 Фото', '✈️ Аялал'],
    goals:       ['Дизайн', 'Аялал'],
    avatar:      '👩‍🎨',
    avatarStyle: 'linear-gradient(135deg,#FEF3C7,#FCD34D)',
    match:       70,
    isOnline:    true,
  },
  {
    email:       '20b1num0005@num.edu.mn',
    name:        'Тэмүүлэн',
    otp:         '000004',
    major:       'Бизнес',
    year:        4,
    bio:         'Startup founder зорилготой. Бизнесийн орчинд туршлагатай.',
    mbti:        'ENTJ',
    interests:   ['💼 Бизнес', '🗣️ Хэл', '🏃 Гүйлт'],
    goals:       ['Проект', 'Клуб'],
    avatar:      '🧑‍💼',
    avatarStyle: 'linear-gradient(135deg,#F5F5F4,#D6D3D1)',
    match:       65,
    isOnline:    false,
    status:      'reported',
    currentPlan: 'proplus',
    isPremium:   true,
  },
  {
    email:       '20b1num0006@num.edu.mn',
    name:        'Оюунцэцэг',
    otp:         '000005',
    major:       'Математик',
    year:        2,
    bio:         'Олимпиадын математикаар оролцдог. Тооцоолол, алгоритмд сонирхолтой.',
    mbti:        'ISFJ',
    interests:   ['📐 Математик', '📚 Уншлага', '🍵 Цай'],
    goals:       ['Хамт суралцах', 'Судалгаа'],
    avatar:      '👩‍💻',
    avatarStyle: 'linear-gradient(135deg,#F5F5F4,#D6D3D1)',
    match:       61,
    isOnline:    false,
  },
  {
    email:       '20b1num0007@num.edu.mn',
    name:        'Ганболд',
    otp:         '000006',
    major:       'Хууль',
    year:        3,
    bio:         'Хуулийн факультетийн оюутан. Олон улсын хуульд сонирхолтой.',
    mbti:        'ISTJ',
    interests:   ['⚖️ Хууль', '📖 Уншлага', '🎬 Кино'],
    goals:       ['Хамт суралцах', 'Хэлний практик'],
    avatar:      '🧑‍💼',
    avatarStyle: 'linear-gradient(135deg,#EFF6FF,#BFDBFE)',
    match:       58,
    isOnline:    true,
    currentPlan: 'pro',
    isPremium:   true,
  },
  {
    email:       '20b1num0008@num.edu.mn',
    name:        'Сарантуяа',
    otp:         '000007',
    major:       'Биологи',
    year:        1,
    bio:         'Биологийн шинжлэх ухаан, экологид сонирхолтой.',
    mbti:        'ENFJ',
    interests:   ['🧬 Шинжлэх ухаан', '🌿 Байгаль', '📷 Фото'],
    goals:       ['Судалгаа', 'Хамт суралцах'],
    avatar:      '👩‍🔬',
    avatarStyle: 'linear-gradient(135deg,#F0FDF4,#86EFAC)',
    match:       54,
    isOnline:    true,
  },
];

const PLANS = [
  {
    planId:      'free',
    name:        'Үнэгүй',
    price:       0,
    priceLabel:  '₮0',
    period:      'үүрд үнэгүй',
    highlighted: false,
    features: [
      { text: 'Долоо хоногт 10 холболт',   included: true  },
      { text: '1:1 чат',                    included: true  },
      { text: 'Хуваарь тохируулах',         included: true  },
      { text: '# general суваг',            included: true  },
      { text: 'Бүлгийн чат',                included: false },
      { text: 'Хэн үзсэнийг харах',         included: false },
    ],
  },
  {
    planId:      'pro',
    name:        'Pro',
    price:       4900,
    priceLabel:  '₮4,900',
    period:      '/ сар',
    periodSub:   'Кофены үнэ ☕',
    highlighted: true,
    badge:       '🔥 ОЮУТНУУДЫН СОНГОЛТ',
    features: [
      { text: 'Хязгааргүй холболт',               included: true  },
      { text: 'Бүлгийн чат (5 хүртэл)',            included: true  },
      { text: 'Хэн профайл үзсэнийг харах',        included: true  },
      { text: 'Мессеж уншсан эсэх (✓✓)',           included: true  },
      { text: 'Discover-д эхэнд харагдах',         included: true  },
      { text: 'Эвент үүсгэх',                      included: false },
    ],
  },
  {
    planId:      'proplus',
    name:        'Pro+',
    price:       8900,
    priceLabel:  '₮8,900',
    period:      '/ сар · бүх боломж',
    highlighted: false,
    features: [
      { text: 'Pro-ийн бүх боломж',                included: true },
      { text: 'Хязгааргүй бүлгийн чат',            included: true },
      { text: 'Уулзалт/эвент зохион байгуулах',    included: true },
      { text: 'Хуваарийн дэлгэрэнгүй шинжилгээ',  included: true },
      { text: 'Нэмэлт профайл тохиргоо',           included: true },
      { text: 'Pro+ badge ✦',                       included: true },
    ],
  },
];

const REPORTS = [
  { icon: '⚠️', title: 'Спам мессеж',      description: 'Батмөнх → Тэмүүлэн · 2 цагийн өмнө', status: 'open'     },
  { icon: '🚫', title: 'Зохисгүй зураг',   description: 'Тэмүүлэн · 5 цагийн өмнө',           status: 'open'     },
  { icon: '✅', title: 'Хуурамч профайл', description: 'Өчигдөр · Шийдвэрлэсэн',              status: 'resolved' },
];

// ─────────────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
  console.log('✅  MongoDB холбогдлоо');

  // Clear all collections
  await Promise.all([
    User.deleteMany({}),
    Schedule.deleteMany({}),
    Message.deleteMany({}),
    GeneralMessage.deleteMany({}),
    PremiumPlan.deleteMany({}),
    Report.deleteMany({}),
    Connection.deleteMany({}),
  ]);
  console.log('🗑️   Бүх collection цэвэрлэгдлээ');

  // ── Users ──────────────────────────────────────────────────────────────────
  const users = await User.insertMany(USERS);
  console.log(`👥  ${users.length} хэрэглэгч нэмэгдлээ`);

  const [myagmar, nominchimeg, batmunkh, enkhtuyaa, , temuulen] = users;

  // ── Schedule for Мягмарсүрэн ──────────────────────────────────────────────
  await Schedule.create({
    userId: myagmar._id,
    cells: [
      { day: 1, hour: 9,  type: 'b' },
      { day: 1, hour: 10, type: 'b' },
      { day: 1, hour: 11, type: 'b' },
      { day: 3, hour: 8,  type: 'b' },
      { day: 3, hour: 9,  type: 'b' },
      { day: 2, hour: 14, type: 'f' },
      { day: 2, hour: 15, type: 'f' },
      { day: 4, hour: 10, type: 'f' },
      { day: 4, hour: 11, type: 'f' },
      { day: 5, hour: 14, type: 'f' },
    ],
  });
  console.log('📅  Хуваарь нэмэгдлээ');

  // ── DM Messages ───────────────────────────────────────────────────────────
  const nowTime = () => new Date().toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });

  await Message.insertMany([
    // Мягмарсүрэн ↔ Энхтуяа
    { senderId: enkhtuyaa._id, receiverId: myagmar._id, text: 'Сайн байна уу! Маргааш хамт суралцах боломжтой юу? 📚', time: '14:20', read: true },
    { senderId: myagmar._id,   receiverId: enkhtuyaa._id, text: 'Тийм! 14:00 цагаас болох уу?', time: '14:22', read: true },
    { senderId: enkhtuyaa._id, receiverId: myagmar._id, text: 'Маргааш 14:00 цагтай уу? ☕', time: '14:32', read: false },
    // Мягмарсүрэн ↔ Батмөнх
    { senderId: batmunkh._id,  receiverId: myagmar._id, text: 'Сайн байна уу 👋', time: '12:15', read: true },
    // Мягмарсүрэн ↔ Тэмүүлэн
    { senderId: temuulen._id,  receiverId: myagmar._id, text: 'React project хийж байна уу?', time: '10:00', read: true },
  ]);
  console.log('💬  DM мессежүүд нэмэгдлээ');

  // ── General channel messages ───────────────────────────────────────────────
  await GeneralMessage.insertMany([
    { senderId: nominchimeg._id, senderName: 'Номинчимэг', avatar: '👩‍💻', avatarStyle: 'linear-gradient(135deg,var(--accent-lt),var(--accent))',  text: 'Бүгд сайн байна уу! React мэддэг хүн байна уу? 🙋', time: '14:20' },
    { senderId: batmunkh._id,    senderName: 'Батмөнх',    avatar: '🧑‍🔬', avatarStyle: 'linear-gradient(135deg,#E0F2FE,#6EE7B7)',                  text: 'Би мэднэ! Ямар асуудал гарсан бэ?',                time: '14:22' },
    { senderId: enkhtuyaa._id,   senderName: 'Энхтуяа',    avatar: '👩‍🎨', avatarStyle: 'linear-gradient(135deg,#F3E8FF,#C4B5FD)',                  text: 'Маргааш номын санд хамт суралцах хүн байна уу? ☕', time: '14:25' },
    { senderId: nominchimeg._id, senderName: 'Номинчимэг', avatar: '👩‍💻', avatarStyle: 'linear-gradient(135deg,var(--accent-lt),var(--accent))',  text: 'useEffect дотор async function хэрхэн ашиглах вэ?', time: '14:31' },
  ]);
  console.log('📢  General мессежүүд нэмэгдлээ');

  // ── Premium plans ──────────────────────────────────────────────────────────
  await PremiumPlan.insertMany(PLANS);
  console.log('👑  Premium багцууд нэмэгдлээ');

  // ── Reports ───────────────────────────────────────────────────────────────
  await Report.insertMany(REPORTS);
  console.log('🚨  Гомдлууд нэмэгдлээ');

  console.log('\n✅  Seed дууслаа! MongoDB-д бүх өгөгдөл бэлэн боллоо.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌  Seed алдаа:', err.message);
  process.exit(1);
});
