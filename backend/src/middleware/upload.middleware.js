import multer from 'multer';

// Files stay in memory and are streamed straight to ImageKit.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    if (file.mimetype.startsWith('image/')) return callback(null, true);
    const error = new Error('Only image files can be uploaded');
    error.status = 400;
    return callback(error);
  },
});
