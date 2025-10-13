const multer = require('multer');
const path = require('path');

// Use memory storage to handle the file as a buffer
// This is efficient because we are just forwarding it to another service
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit
  fileFilter: function (req, file, cb) {
    // You can add file type checks here if needed
    cb(null, true);
  },
});

module.exports = upload;