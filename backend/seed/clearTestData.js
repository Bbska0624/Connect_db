/**
 * Cleanup script — removes all seeded demo/test data from MongoDB.
 * Keeps: admin user, PremiumPlans.
 * Removes: test users, their schedules, messages, connections, reports.
 *
 * Run: npm run clear   (from the backend directory)
 */

import dns from 'dns';
if (process.env.NODE_ENV !== 'production') dns.setServers(['8.8.8.8', '1.1.1.1']);

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
import Report         from '../models/Report.js';
import Connection     from '../models/Connection.js';

const TEST_EMAILS = [
  '20b1num0001@stud.num.edu.mn',
  '20b1num0002@stud.num.edu.mn',
  '20b1num0003@stud.num.edu.mn',
  '20b1num0004@stud.num.edu.mn',
  '20b1num0005@stud.num.edu.mn',
  '20b1num0006@stud.num.edu.mn',
  '20b1num0007@stud.num.edu.mn',
  '20b1num0008@stud.num.edu.mn',
];

async function clearTestData() {
  await mongoose.connect(process.env.MONGODB_URI, { family: 4 });
  console.log('✅  MongoDB холбогдлоо');

  const testUsers = await User.find({ email: { $in: TEST_EMAILS } }).select('_id');
  const testIds   = testUsers.map(u => u._id);
  console.log(`🔍  ${testIds.length} тест хэрэглэгч олдлоо`);

  const { deletedCount: u } = await User.deleteMany({ email: { $in: TEST_EMAILS } });
  console.log(`🗑️   ${u} тест хэрэглэгч устгагдлаа`);

  const { deletedCount: s } = await Schedule.deleteMany({ userId: { $in: testIds } });
  console.log(`🗑️   ${s} хуваарь устгагдлаа`);

  const { deletedCount: m } = await Message.deleteMany({
    $or: [{ senderId: { $in: testIds } }, { receiverId: { $in: testIds } }],
  });
  console.log(`🗑️   ${m} DM мессеж устгагдлаа`);

  const { deletedCount: g } = await GeneralMessage.deleteMany({ senderId: { $in: testIds } });
  console.log(`🗑️   ${g} general мессеж устгагдлаа`);

  const { deletedCount: c } = await Connection.deleteMany({
    $or: [{ userId: { $in: testIds } }, { targetId: { $in: testIds } }],
  });
  console.log(`🗑️   ${c} холболт устгагдлаа`);

  const { deletedCount: r } = await Report.deleteMany({});
  console.log(`🗑️   ${r} гомдол устгагдлаа`);

  console.log('\n✅  Тест өгөгдөл цэвэрлэгдлээ!');
  await mongoose.disconnect();
  process.exit(0);
}

clearTestData().catch(err => {
  console.error('❌  Алдаа:', err.message);
  process.exit(1);
});
