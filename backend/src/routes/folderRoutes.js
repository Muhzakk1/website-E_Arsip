const express = require('express');
const router = express.Router();
const { getAllFolders, getFolderById, createFolder, deleteFolder } = require('../controllers/folderController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

router.get('/', auth, getAllFolders);
router.get('/:id', auth, getFolderById);
router.post('/', auth, createFolder);
router.delete('/:id', auth, roleGuard(['admin']), deleteFolder);

module.exports = router;
