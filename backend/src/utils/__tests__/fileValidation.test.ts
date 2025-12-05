import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  isValidPowerPointFile,
  isValidVideoFile,
  isValidFileSize,
  getFileType,
} from '../fileValidation';

// **Feature: innovation-landing-page, Property 6: PowerPoint file validation**
describe('Property: PowerPoint file validation', () => {
  it('should accept valid PowerPoint files', () => {
    const validCases = [
      { mimeType: 'application/vnd.ms-powerpoint', filename: 'presentation.ppt' },
      { mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', filename: 'slides.pptx' },
      { mimeType: 'application/vnd.ms-powerpoint', filename: 'DEMO.PPT' },
    ];

    validCases.forEach(({ mimeType, filename }) => {
      expect(isValidPowerPointFile(mimeType, filename)).toBe(true);
    });
  });

  it('should reject invalid PowerPoint files', () => {
    const invalidCases = [
      { mimeType: 'application/pdf', filename: 'document.pdf' },
      { mimeType: 'video/mp4', filename: 'video.mp4' },
      { mimeType: 'application/vnd.ms-powerpoint', filename: 'file.txt' },
      { mimeType: 'text/plain', filename: 'file.ppt' },
    ];

    invalidCases.forEach(({ mimeType, filename }) => {
      expect(isValidPowerPointFile(mimeType, filename)).toBe(false);
    });
  });

  it('should validate PowerPoint files with various names', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom('.ppt', '.pptx', '.pdf', '.txt', '.mp4'),
        (basename, extension) => {
          const filename = basename + extension;
          const mimeType = extension === '.ppt' || extension === '.pptx'
            ? 'application/vnd.ms-powerpoint'
            : 'application/pdf';

          const result = isValidPowerPointFile(mimeType, filename);
          const expected = (extension === '.ppt' || extension === '.pptx') &&
            mimeType.includes('powerpoint');

          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// **Feature: innovation-landing-page, Property 7: Video file validation**
describe('Property: Video file validation', () => {
  it('should accept valid video files', () => {
    const validCases = [
      { mimeType: 'video/mp4', filename: 'video.mp4' },
      { mimeType: 'video/webm', filename: 'clip.webm' },
      { mimeType: 'video/x-msvideo', filename: 'movie.avi' },
      { mimeType: 'video/mp4', filename: 'VIDEO.MP4' },
    ];

    validCases.forEach(({ mimeType, filename }) => {
      expect(isValidVideoFile(mimeType, filename)).toBe(true);
    });
  });

  it('should reject invalid video files', () => {
    const invalidCases = [
      { mimeType: 'application/pdf', filename: 'document.pdf' },
      { mimeType: 'application/vnd.ms-powerpoint', filename: 'slides.ppt' },
      { mimeType: 'video/mp4', filename: 'file.txt' },
      { mimeType: 'text/plain', filename: 'file.mp4' },
    ];

    invalidCases.forEach(({ mimeType, filename }) => {
      expect(isValidVideoFile(mimeType, filename)).toBe(false);
    });
  });

  it('should validate video files with various names', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.constantFrom('.mp4', '.webm', '.avi', '.pdf', '.txt'),
        (basename, extension) => {
          const filename = basename + extension;
          const mimeType = ['.mp4', '.webm', '.avi'].includes(extension)
            ? 'video/mp4'
            : 'application/pdf';

          const result = isValidVideoFile(mimeType, filename);
          const expected = ['.mp4', '.webm', '.avi'].includes(extension) &&
            mimeType.includes('video');

          expect(result).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('File size validation', () => {
  it('should accept files within size limit', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 50 * 1024 * 1024 }),
        (fileSize) => {
          expect(isValidFileSize(fileSize, 50)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject files exceeding size limit', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 51 * 1024 * 1024, max: 100 * 1024 * 1024 }),
        (fileSize) => {
          expect(isValidFileSize(fileSize, 50)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should reject zero or negative file sizes', () => {
    expect(isValidFileSize(0)).toBe(false);
    expect(isValidFileSize(-1)).toBe(false);
  });
});

describe('Get file type', () => {
  it('should correctly identify file types', () => {
    expect(getFileType('application/vnd.ms-powerpoint')).toBe('powerpoint');
    expect(getFileType('application/vnd.openxmlformats-officedocument.presentationml.presentation')).toBe('powerpoint');
    expect(getFileType('video/mp4')).toBe('video');
    expect(getFileType('video/webm')).toBe('video');
    expect(getFileType('application/pdf')).toBe(null);
    expect(getFileType('text/plain')).toBe(null);
  });
});
