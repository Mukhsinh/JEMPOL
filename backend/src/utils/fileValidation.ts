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
  ];

  const validExtensions = ['.mp4', '.webm', '.avi'];
  const hasValidExtension = validExtensions.some(ext => filename.toLowerCase().endsWith(ext));

  return validMimeTypes.includes(mimeType) && hasValidExtension;
};

/**
 * Validates file size
 */
export const isValidFileSize = (fileSize: number, maxSizeMB: number = 50): boolean => {
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
