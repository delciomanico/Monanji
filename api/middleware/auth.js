const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Access token required'
                }
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user details from database
        const result = await query(
            'SELECT id, email, full_name, role, bi_number, is_active FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0 || !result.rows[0].is_active) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Invalid or inactive user'
                }
            });
        }

        req.user = result.rows[0];
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Invalid token'
                }
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'TOKEN_EXPIRED',
                    message: 'Token has expired'
                }
            });
        }

        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Authentication error'
            }
        });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Authentication required'
                }
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Insufficient permissions'
                }
            });
        }

        next();
    };
};

module.exports = {
    authenticateToken,
    requireRole
};
