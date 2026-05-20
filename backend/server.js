import dns from 'dns';
if (process.env.NODE_ENV !== 'production') dns.setServers(['8.8.8.8', '1.1.1.1']);

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes     from './routes/auth.js';
import profileRoutes  from './routes/profile.js';
import discoverRoutes from './routes/discover.js';
import scheduleRoutes from './routes/schedule.js';
import chatRoutes     from './routes/chat.js';
import premiumRoutes  from './routes/premium.js';
import adminRoutes    from './routes/admin.js';
import statsRoutes    from './routes/stats.js';

dotenv.config();

const app = express();

app.set('trust proxy', 1);
app.use(helmet());

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Lazy DB connection — works for both serverless (Vercel) and persistent (local/Render)
let dbConnected = false;
app.use(async (_req, res, next) => {
  if (!dbConnected) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        family: 4,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
      });
      dbConnected = true;
      console.log('✅  MongoDB холбогдлоо');
    } catch (err) {
      return res.status(500).json({ success: false, message: 'DB холболт амжилтгүй боллоо', data: null });
    }
  }
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/profile',  profileRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/chat',     chatRoutes);
app.use('/api/premium',  premiumRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/stats',    statsRoutes);

app.get('/api/health', (_req, res) =>
  res.json({ success: true, message: 'NumConnect API running', data: null })
);

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Серверийн алдаа гарлаа',
    data: null,
  });
});

// ── Local development only ────────────────────────────────────────────────────
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀  Server started on http://localhost:${PORT}`));
}

export default app;
