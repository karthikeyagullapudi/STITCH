import multer from 'multer';

// Files stay in memory and are streamed straight to ImageKit.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});
