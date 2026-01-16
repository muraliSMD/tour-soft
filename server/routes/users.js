const express = require('express');
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

router.route('/')
    .get(protect, requireAdmin, getUsers)
    .post(protect, requireAdmin, createUser);

router.route('/:id')
    .get(protect, requireAdmin, getUserById)
    .put(protect, requireAdmin, updateUser)
    .delete(protect, requireAdmin, deleteUser);

module.exports = router;
