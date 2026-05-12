const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadFile, downloadFile, deleteFile, searchFiles } = require('../controllers/fileController');
const auth = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.get('/search', auth, searchFiles);
router.post('/upload', auth, upload.single('file'), uploadFile);
router.get('/:id/download', auth, downloadFile);
router.delete('/:id', auth, deleteFile);

module.exports = router;
