import multer from 'multer';

export const notFound = (req, res) =>
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });

// Catches errors thrown outside controller try/catch blocks — bad JSON,
// upload limits, CORS rejections — and always answers with JSON.
// Express only treats a middleware as an error handler when it takes 4 args.
export const errorHandler = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: error.message });
  }
  if (error.type === 'entity.parse.failed') {
    return res
      .status(400)
      .json({ success: false, message: 'Request body is not valid JSON' });
  }

  const status = error.status || error.statusCode || 500;
  if (status >= 500) console.error('Unhandled error:', error);
  return res.status(status).json({
    success: false,
    message: status >= 500 ? 'Internal server error' : error.message,
  });
};
