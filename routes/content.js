const express = require('express');
const { 
  uploadContent, 
  getAllContent, 
  updateContent, 
  deleteContent, 
  shareContent,
  getSharedContent 
} = require('../controllers/contentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

router.route('/')
  .get(protect, getAllContent)
  .post(protect, upload.single('file'), uploadContent);

router.route('/:id')
  .put(protect, updateContent)
  .delete(protect, deleteContent);

router.post('/:id/share', protect, shareContent);
router.get('/shared', protect, getSharedContent);

module.exports = router;