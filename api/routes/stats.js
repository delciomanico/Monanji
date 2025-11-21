const express = require('express');
const { query } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/v1/stats/dashboard (admin/investigator only)
router.get('/dashboard', 
    authenticateToken, 
    requireRole(['admin', 'investigator']),
    asyncHandler(async (req, res) => {
        // Total complaints
        const totalResult = await query('SELECT COUNT(*) FROM complaints');
        const totalComplaints = parseInt(totalResult.rows[0].count);

        // By type
        const typeResult = await query(`
            SELECT complaint_type, COUNT(*) as count
            FROM complaints
            GROUP BY complaint_type
        `);
        
        const byType = typeResult.rows.reduce((acc, row) => {
            acc[row.complaint_type.replace('-', '_')] = parseInt(row.count);
            return acc;
        }, {});

        // By status
        const statusResult = await query(`
            SELECT status, COUNT(*) as count
            FROM complaints
            GROUP BY status
        `);
        
        const byStatus = statusResult.rows.reduce((acc, row) => {
            acc[row.status] = parseInt(row.count);
            return acc;
        }, {});

        // Recent activity (last 30 days)
        const activityResult = await query(`
            SELECT DATE(created_at) as date, COUNT(*) as complaints
            FROM complaints
            WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) DESC
            LIMIT 30
        `);

        const recentActivity = activityResult.rows.map(row => ({
            date: row.date,
            complaints: parseInt(row.complaints)
        }));

        // Success rate (resolved / total resolved or archived)
        const resolvedResult = await query(`
            SELECT 
                SUM(CASE WHEN status IN ('resolved') THEN 1 ELSE 0 END) as resolved,
                SUM(CASE WHEN status IN ('resolved', 'archived') THEN 1 ELSE 0 END) as total_closed
            FROM complaints
        `);
        
        const resolved = parseInt(resolvedResult.rows[0].resolved) || 0;
        const totalClosed = parseInt(resolvedResult.rows[0].total_closed) || 0;
        const successRate = totalClosed > 0 ? (resolved / totalClosed * 100).toFixed(1) : 0;

        res.json({
            success: true,
            data: {
                total_complaints: totalComplaints,
                by_type: {
                    missing_person: byType.missing_person || 0,
                    common_crime: byType.common_crime || 0,
                    corruption: byType.corruption || 0,
                    domestic_violence: byType.domestic_violence || 0,
                    cyber_crime: byType.cyber_crime || 0
                },
                by_status: {
                    submitted: byStatus.submitted || 0,
                    received: byStatus.received || 0,
                    reviewing: byStatus.reviewing || 0,
                    investigating: byStatus.investigating || 0,
                    resolved: byStatus.resolved || 0,
                    archived: byStatus.archived || 0
                },
                recent_activity: recentActivity,
                success_rate: parseFloat(successRate)
            }
        });
    })
);

// GET /api/v1/stats/my-summary (authenticated users)
router.get('/my-summary', 
    authenticateToken,
    asyncHandler(async (req, res) => {
        // Get user's complaints summary
        const summaryResult = await query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'investigating' THEN 1 ELSE 0 END) as investigating,
                SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
                complaint_type
            FROM complaints
            WHERE reporter_user_id = $1 OR reporter_bi = $2
            GROUP BY complaint_type
        `, [req.user.id, req.user.bi_number]);

        const summary = summaryResult.rows.reduce((acc, row) => {
            if (!acc.by_type) acc.by_type = {};
            acc.by_type[row.complaint_type.replace('-', '_')] = {
                total: parseInt(row.total),
                investigating: parseInt(row.investigating),
                resolved: parseInt(row.resolved)
            };
            return acc;
        }, { by_type: {} });

        // Calculate totals
        const totals = summaryResult.rows.reduce((acc, row) => ({
            total: acc.total + parseInt(row.total),
            investigating: acc.investigating + parseInt(row.investigating),
            resolved: acc.resolved + parseInt(row.resolved)
        }), { total: 0, investigating: 0, resolved: 0 });

        res.json({
            success: true,
            data: {
                ...totals,
                ...summary
            }
        });
    })
);

module.exports = router;
