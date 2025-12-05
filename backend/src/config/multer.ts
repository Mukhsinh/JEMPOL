import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Different limits for different file types
const MAX_VIDEO_SIZE = parseInt(process.env.MAX_VIDEO_SIZE_MB || '1024') * 1024 * 1024; // 1GB for videos
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '100') * 1024 * 1024; // 100MB for other files

// Ensure uploads directory exists
const uploadsPath = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    // Sanitize filename
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(sanitizedName);
    const nameWithoutExt = path.basename(sanitizedName, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  },
});

// File filter for allowed types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    // PowerPoint
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // PDF
    'application/pdf',
    // Video
    'video/mp4',
    'video/webm',
    'video/x-msvideo',
    'video/quicktime',
    'video/mpeg',
    'video/x-matroska',
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipe file tidak didukung. Hanya PowerPoint (ppt, pptx), PDF, Video (mp4, webm, avi, mov, mkv), dan Foto (jpg, png, gif, webp) yang diperbolehkan.'));
  }
};

// Dynamic file size limit based on file type
const getFileSizeLimit = (req: Request): number => {
  // Check if this is a video upload from the request body or query
  const type = req.body?.type || req.query?.type;
  if (type === 'video') {
    return MAX_VIDEO_SIZE;
  }
  return MAX_FILE_SIZE;
};

export const upload = multer({
  storage,
  limits: {
    fileSize: MAX_VIDEO_SIZE, // Use max video size as the upper limit
  },
  fileFilter,
});
