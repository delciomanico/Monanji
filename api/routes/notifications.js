const express = require('express');
const { query } = require('../config/database');
const { asyncHandler, createError } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/v1/notifications
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, unread_only = false } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE n.user_id = $1';
    let params = [req.user.id];

    if (unread_only === 'true') {
        whereClause += ' AND n.is_read = false';
    }

    // Get notifications
    const notificationsResult = await query(`
        SELECT 
            n.id,
            n.title,
            n.message,
            n.notification_type,
            n.is_read,
            n.created_at,
            c.protocol_number as complaint_protocol
        FROM notifications n
        LEFT JOIN complaints c ON n.complaint_id = c.id
        ${whereClause}
        ORDER BY n.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `, [...params, limit, offset]);

    // Get unread count
    const unreadResult = await query(
        'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
        [req.user.id]
    );

    const notifications = notificationsResult.rows.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.notification_type,
        is_read: notification.is_read,
        created_at: notification.created_at,
        complaint_protocol: notification.complaint_protocol
    }));

    res.json({
        success: true,
        data: {
            notifications,
            unread_count: parseInt(unreadResult.rows[0].count)
        }
    });
}));

// PUT /api/v1/notifications/:id/read
router.put('/:id/read', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Check if notification exists and belongs to user
    const notificationCheck = await query(
        'SELECT id FROM notifications WHERE id = $1 AND user_id = $2',
        [id, req.user.id]
    );

    if (notificationCheck.rows.length === 0) {
        throw createError(404, 'NOT_FOUND', 'Notification not found');
    }

    // Mark as read
    await query(
        'UPDATE notifications SET is_read = true WHERE id = $1',
        [id]
    );

    res.json({
        success: true,
        message: 'Notification marked as read'
    });
}));

// PUT /api/v1/notifications/read-all
router.put('/read-all', authenticateToken, asyncHandler(async (req, res) => {
    await query(
        'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
        [req.user.id]
    );

    res.json({
        success: true,
        message: 'All notifications marked as read'
    });
}));

// Helper function to create notification (used internally)
const createNotification = async (userId, complaintId, title, message, type = 'update') => {
    await query(`
        INSERT INTO notifications (user_id, complaint_id, title, message, notification_type)
        VALUES ($1, $2, $3, $4, $5)
    `, [userId, complaintId, title, message, type]);
};

module.exports = { router, createNotification };
