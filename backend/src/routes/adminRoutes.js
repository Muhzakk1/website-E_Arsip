const express = require('express');
const router = express.Router();
const { getAllUsers, getPendingUsers, approveUser, createUser, updateUser, deleteUser, toggleUserStatus, getActivityLogs } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

router.get('/users', auth, roleGuard(['admin']), getAllUsers);
router.get('/users/pending', auth, roleGuard(['admin']), getPendingUsers);
router.post('/users', auth, roleGuard(['admin']), createUser);
router.patch('/users/:id/approve', auth, roleGuard(['admin']), approveUser);
router.patch('/users/:id/status', auth, roleGuard(['admin']), toggleUserStatus);
router.put('/users/:id', auth, roleGuard(['admin']), updateUser);
router.delete('/users/:id', auth, roleGuard(['admin']), deleteUser);
router.get('/logs', auth, roleGuard(['admin']), getActivityLogs);

module.exports = router;
