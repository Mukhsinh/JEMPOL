/**
 * Validates PowerPoint file types
 */
export const isValidPowerPointFile = (mimeType: string, filename: string): boolean => {
  const validMimeTypes = [
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];

  const validExtensions = ['.ppt', '.pptx'];
  const hasValidExtension = validExtensions.some(ext => filename.toLowerCase().endsWith(ext));

  return validMimeTypes.includes(mimeType) && hasValidExtension;
};

/**
 * Validates video file types
 */
export const isValidVideoFile = (mimeType: string, filename: string): boolean => {
  const validMimeTypes = [
    'video/mp4',
    'video/webm',
    'video/x-msvideo',
    'video/quicktime',
    'video/mpeg',
    'video/x-matroska',
  ];

  const validExtensions = ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.mpeg'];
  const hasValidExtension = validExtensions.some(ext => filename.toLowerCase().endsWith(ext));

  return validMimeTypes.includes(mimeType) && hasValidExtension;
};

/**
 * Validates file size based on file type
 */
export const isValidFileSize = (fileSize: number, fileType: 'video' | 'powerpoint' | 'photo'): boolean => {
  const maxSizes = {
    video: 1024, // 1GB for videos
    powerpoint: 100, // 100MB for PowerPoint
    photo: 50, // 50MB for photos
  };
  
  const maxSizeMB = maxSizes[fileType] || 50;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize > 0 && fileSize <= maxSizeBytes;
};

/**
 * Gets file type from mimetype
 */
export const getFileType = (mimeType: string): 'powerpoint' | 'video' | null => {
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
    return 'powerpoint';
  }
  if (mimeType.includes('video')) {
    return 'video';
  }
  return null;
};
