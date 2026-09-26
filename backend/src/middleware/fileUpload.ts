import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Request } from 'express';
import { ENV } from '../config/env.js';
import { StorageService, VALID_BUCKETS, StorageBucket } from '../services/storageService.js';

// Allowed MIME Types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

// Allowed File Extensions
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    let bucket = (req.params.bucket || req.body.bucket || 'school-documents') as StorageBucket;
    if (!VALID_BUCKETS.includes(bucket)) {
      bucket = 'school-documents';
    }
    const uploadPath = StorageService.getBucketDir(bucket);
    cb(null, uploadPath);
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBaseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    const uniqueSuffix = crypto.randomBytes(6).toString('hex');
    cb(null, `${safeBaseName}_${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only PDF, JPG, PNG, and WEBP documents are permitted.'));
  }

  cb(null, true);
};

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: ENV.MAX_FILE_SIZE_MB * 1024 * 1024, // 10MB default
  },
  fileFilter,
});
