import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { ENV } from './config/env.js';
import { db } from './db/database.js';
import { StorageService } from './services/storageService.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { runDatabaseSeed } from '../../database/seed.js';

const app = express();

// Initialize Storage Buckets
StorageService.initStorage();

// Sync from Supabase & Initialize Local Fallback Cache
(async () => {
  try {
    await runDatabaseSeed();
    await db.syncAllFromSupabase();
  } catch (err) {
    console.warn('Startup sync notice:', err);
  }
})();

// 1. Security & Optimization Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Allow local assets and fonts
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: ENV.CORS_ORIGIN === '*' ? true : ENV.CORS_ORIGIN,
  credentials: true,
}));
app.use(compression());
app.use(morgan(ENV.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(ENV.COOKIE_SECRET));

// 2. Global Rate Limiter for API
app.use('/api', globalLimiter);

// 3. Static Assets & Uploads Serving
app.use('/assets', express.static(path.join(process.cwd(), 'assets')));
app.use('/storage/uploads', express.static(path.join(process.cwd(), 'storage', 'uploads')));

// 4. API Routes Registration
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', publicRoutes);

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    institution: 'Saraswati Shishu Vidya Mandir (CBSE)',
    version: '1.0.0',
    supabase: {
      connected: db.isSupabase,
      storage: ENV.STORAGE_DRIVER
    }
  });
});

// 5. Serve Frontend Static Pages
app.use(express.static(process.cwd()));

// HTML routing
app.get('/mandatory-public-disclosure', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'mandatory-public-disclosure.html'));
});
app.get('/faculty-staff', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'faculty-staff.html'));
});
app.get('/about-school', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'about-school.html'));
});
app.get('/academics', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'academics.html'));
});
app.get('/admissions', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'admissions.html'));
});
app.get('/infrastructure', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'infrastructure.html'));
});
app.get('/fee-structure', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'fee-structure.html'));
});
app.get('/academic-calendar', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'academic-calendar.html'));
});
app.get('/transfer-certificates', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'transfer-certificates.html'));
});
app.get('/school-management', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'school-management.html'));
});
app.get('/notices', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'notices.html'));
});
app.get('/downloads', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'downloads.html'));
});
app.get('/results-achievements', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'results-achievements.html'));
});
app.get('/gallery', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'gallery.html'));
});
app.get('/contact', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'contact.html'));
});
app.get('/admin', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'admin.html'));
});

// 6. Global 404 & Error Handler
app.use((req: Request, res: Response) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: `API endpoint ${req.method} ${req.path} not found.` }
    });
  } else {
    res.status(404).sendFile(path.join(process.cwd(), 'index.html'));
  }
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: ENV.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : err.message
    }
  });
});

// 7. Start Server
const isDirectExecution = process.argv[1] && (process.argv[1].includes('server.ts') || process.argv[1].includes('server.js'));
if (process.env.NODE_ENV !== 'test' && isDirectExecution && !process.env.VERCEL) {
  app.listen(ENV.PORT, () => {
    console.log(`========================================================`);
    console.log(`🏛️  SARASWATI SHISHU VIDYA MANDIR - CBSE PORTAL SERVER`);
    console.log(`🌐 Server running at: http://localhost:${ENV.PORT}`);
    console.log(`📋 Mandatory Public Disclosure: http://localhost:${ENV.PORT}/mandatory-public-disclosure`);
    console.log(`⚙️  Admin Portal: http://localhost:${ENV.PORT}/admin`);
    console.log(`========================================================`);
  });
}

export default app;
