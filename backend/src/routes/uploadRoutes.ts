import { Router, Response } from 'express';
import { uploadMiddleware } from '../middleware/fileUpload.js';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth.js';
import { StorageService, StorageBucket, VALID_BUCKETS } from '../services/storageService.js';
import { AuditService } from '../services/auditService.js';

const router = Router();

// Protect upload endpoints
router.use(authenticateToken);

// POST /api/upload/:bucket
router.post(
  '/:bucket',
  requireRole('SUPER_ADMIN', 'ADMIN', 'EDITOR'),
  uploadMiddleware.single('file'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: { code: 'FILE_MISSING', message: 'No file was provided in the upload request.' }
        });
        return;
      }

      const bucket = (req.params.bucket as StorageBucket) || 'school-documents';
      if (!VALID_BUCKETS.includes(bucket)) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_BUCKET', message: `Invalid storage bucket: ${bucket}.` }
        });
        return;
      }

      const fileUrl = await StorageService.uploadFile(
        bucket,
        req.file.filename,
        req.file.path,
        req.file.mimetype
      );
      const fileSizeFormatted = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`;

      await AuditService.log({
        admin_user_id: req.user?.id,
        admin_user_email: req.user?.email,
        action: 'UPLOAD_FILE',
        entity_type: 'STORAGE',
        entity_id: req.file.filename,
        new_data: { bucket, file_name: req.file.originalname, file_url: fileUrl },
        ip_address: req.ip
      });

      res.status(201).json({
        success: true,
        data: {
          file_url: fileUrl,
          file_name: req.file.originalname,
          file_type: req.file.mimetype.includes('pdf') ? 'PDF' : 'IMAGE',
          file_size: fileSizeFormatted
        }
      });
    } catch (err: any) {
      console.error('File upload error:', err);
      res.status(500).json({
        success: false,
        error: { code: 'UPLOAD_FAILED', message: err.message || 'File upload failed.' }
      });
    }
  }
);

// DELETE /api/upload/:bucket/:fileName
router.delete(
  '/:bucket/:fileName',
  requireRole('SUPER_ADMIN', 'ADMIN'),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const bucket = req.params.bucket as StorageBucket;
    const fileName = req.params.fileName;

    if (!VALID_BUCKETS.includes(bucket)) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_BUCKET', message: 'Invalid storage bucket.' }
      });
      return;
    }

    const deleted = await StorageService.deleteFile(bucket, fileName);
    if (!deleted) {
      res.status(404).json({
        success: false,
        error: { code: 'FILE_NOT_FOUND', message: 'File could not be found or was already deleted.' }
      });
      return;
    }

    await AuditService.log({
      admin_user_id: req.user?.id,
      admin_user_email: req.user?.email,
      action: 'DELETE_FILE',
      entity_type: 'STORAGE',
      entity_id: fileName,
      old_data: { bucket, file_name: fileName },
      ip_address: req.ip
    });

    res.json({
      success: true,
      data: { message: 'File deleted successfully.' }
    });
  }
);

export default router;
