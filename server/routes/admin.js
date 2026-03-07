/**
 * Admin API Routes
 * Handles superadmin operations for managing users and roles
 */

const express = require('express');
const User = require('../models/User');
const Story = require('../models/Story');
const logger = require('../utils/logger');
const { isSuperAdmin } = require('../middleware/auth');
const router = express.Router();

// GET /api/v1/admin/access/users - Get all connected users
router.get('/access/users', isSuperAdmin, async (req, res) => {
    try {
        const users = await User.find({})
            .select('username email wallet firstName lastName role createdAt')
            .lean();

        // Fetch story counts for each user
        const usersWithStats = await Promise.all(
            users.map(async (user) => {
                const storyCount = await Story.countDocuments({ author: user._id });
                return {
                    ...user,
                    storyCount,
                };
            })
        );

        return res.json({
            success: true,
            data: usersWithStats,
        });
    } catch (error) {
        logger.error('Admin Fetch Users Error:', error.message);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// PATCH /api/v1/admin/access/roles - Update user role
router.patch('/access/roles', isSuperAdmin, async (req, res) => {
    try {
        const { userId, newRole, adminPassword } = req.body;

        if (!userId || !newRole || !adminPassword) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        // Verify admin master password
        // We get the superadmin's hash to compare securely
        const adminUser = await User.findById(req.user.id).select('+password');
        if (!adminUser) {
            return res.status(404).json({ success: false, error: 'Superadmin not found' });
        }

        // In our implementation plan we noted `adminPassword` against 'groqtales' directly because the admin-login-modal just uses 'groqtales' directly, but the best approach here is using the comparePassword method if the user has a password set.
        // However, if the indiehubexe@gmail.com account does not have 'groqtales' as the bcrypt password, the modal explicitly allows frontend login with "groqtales". Let's stick to the frontend's simple logic for the demo or try to use user.comparePassword.
        // Let's use comparePassword, but allow 'groqtales' as a master override for this specific demo requirement as per the modal.

        const isValidPassword = (adminPassword === 'groqtales') || (await adminUser.comparePassword(adminPassword));

        if (!isValidPassword) {
            return res.status(401).json({ success: false, error: 'Invalid admin password' });
        }

        const validRoles = ['user', 'moderator', 'admin'];
        if (!validRoles.includes(newRole)) {
            return res.status(400).json({ success: false, error: 'Invalid role' });
        }

        const userToUpdate = await User.findByIdAndUpdate(
            userId,
            { $set: { role: newRole } },
            { new: true }
        ).select('username email role');

        if (!userToUpdate) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        return res.json({
            success: true,
            message: 'Role updated successfully',
            data: userToUpdate,
        });
    } catch (error) {
        logger.error('Admin Role Update Error:', error.message);
        return res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

module.exports = router;
