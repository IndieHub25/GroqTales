const express = require('express');
const router = express.Router();
const axios = require('axios');
const logger = require('../utils/logger');
const { authRequired } = require('../middleware/auth');

/**
 * @swagger
 * /api/feeds/notifications/me:
 *   get:
 *     tags:
 *       - Feed
 *     summary: Get notifications for the authenticated user
 *     description: Returns notifications for the current user, proxied from the CF Worker or sourced from MongoDB.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unread
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Max number of unread notifications to return.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Total limit of notifications to return.
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       title:
 *                         type: string
 *                       body:
 *                         type: string
 *                       read:
 *                         type: integer
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized.
 *       502:
 *         description: Failed to fetch notifications from upstream.
 */
router.get('/notifications/me', authRequired, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.sub;
        const unread = req.query.unread || 50;
        const limit = req.query.limit || 30;

        const workerUrl = process.env.CF_WORKER_URL || 'https://groqtales-backend-workers.mantejsingh.workers.dev';
        const token = req.headers.authorization?.split(' ')[1];

        try {
            const response = await axios.get(
                `${workerUrl}/api/feeds/notifications/${userId}?unread=${unread}&limit=${limit}`,
                {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                    },
                    validateStatus: false,
                    timeout: 10000,
                }
            );

            if (response.status === 200) {
                return res.json(response.data);
            }
        } catch (cfErr) {
            logger.warn('CF Worker notification fetch failed, falling back to empty:', cfErr.message);
        }

        // Fallback: return empty data if CF Worker is unavailable
        return res.json({ data: [] });
    } catch (error) {
        logger.error('Error fetching notifications:', error.message);
        res.status(502).json({ error: 'Failed to fetch notifications', message: error.message });
    }
});

/**
 * @swagger
 * /api/feeds/notifications/{id}/read:
 *   post:
 *     tags:
 *       - Feed
 *     summary: Mark a notification as read
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read.
 *       401:
 *         description: Unauthorized.
 */
router.post('/notifications/:id/read', authRequired, async (req, res) => {
    try {
        const { id } = req.params;
        const workerUrl = process.env.CF_WORKER_URL || 'https://groqtales-backend-workers.mantejsingh.workers.dev';
        const token = req.headers.authorization?.split(' ')[1];

        try {
            const response = await axios.post(
                `${workerUrl}/api/feeds/notifications/${id}/read`,
                {},
                {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                        'Content-Type': 'application/json',
                    },
                    validateStatus: false,
                    timeout: 10000,
                }
            );
            return res.status(response.status).json(response.data || { success: true });
        } catch (cfErr) {
            logger.warn('CF Worker mark-read failed:', cfErr.message);
            return res.json({ success: true }); // Graceful fallback
        }
    } catch (error) {
        logger.error('Error marking notification read:', error.message);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

/**
 * @swagger
 * /api/feeds/notifications/mark-all-read:
 *   post:
 *     tags:
 *       - Feed
 *     summary: Mark all notifications as read
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read.
 *       401:
 *         description: Unauthorized.
 */
router.post('/notifications/mark-all-read', authRequired, async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.sub;
        const workerUrl = process.env.CF_WORKER_URL || 'https://groqtales-backend-workers.mantejsingh.workers.dev';
        const token = req.headers.authorization?.split(' ')[1];

        try {
            const response = await axios.post(
                `${workerUrl}/api/feeds/notifications/mark-all-read`,
                { userId },
                {
                    headers: {
                        ...(token && { Authorization: `Bearer ${token}` }),
                        'Content-Type': 'application/json',
                    },
                    validateStatus: false,
                    timeout: 10000,
                }
            );
            return res.status(response.status).json(response.data || { success: true });
        } catch (cfErr) {
            logger.warn('CF Worker mark-all-read failed:', cfErr.message);
            return res.json({ success: true }); // Graceful fallback
        }
    } catch (error) {
        logger.error('Error marking all notifications read:', error.message);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
});

module.exports = router;
