const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { asyncHandler, createError } = require('../middleware/errorHandler');

const router = express.Router();

// Validation rules
const registerValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('full_name').trim().isLength({ min: 2 }).withMessage('Full name is required'),
    body('phone').optional().matches(/^\+244[0-9]{9}$/).withMessage('Invalid phone format'),
    body('bi_number').matches(/^[0-9]{9}[A-Z]{2}[0-9]{3}$/).withMessage('Invalid BI format')
];

const loginValidation = [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
];

// Helper function to generate JWT
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// POST /api/v1/auth/register
router.post('/register', registerValidation, asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw createError(400, 'VALIDATION_ERROR', 'Validation failed', errors.array());
    }

    const { email, password, full_name, phone, bi_number } = req.body;

    // Check if user already exists
    const existingUser = await query(
        'SELECT id FROM users WHERE email = $1 OR bi_number = $2',
        [email, bi_number]
    );

    if (existingUser.rows.length > 0) {
        throw createError(400, 'USER_EXISTS', 'User with this email or BI already exists');
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await query(
        `INSERT INTO users (email, password_hash, full_name, phone, bi_number, role)
         VALUES ($1, $2, $3, $4, $5, 'citizen')
         RETURNING id, email, full_name, role`,
        [email, passwordHash, full_name, phone, bi_number]
    );

    const user = result.rows[0];
    const token = generateToken(user.id);

    res.status(201).json({
        success: true,
        data: {
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        }
    });
}));

// POST /api/v1/auth/login
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw createError(400, 'VALIDATION_ERROR', 'Validation failed', errors.array());
    }

    const { email, password } = req.body;

    // Get user by email
    const result = await query(
        'SELECT id, email, password_hash, full_name, role, is_active FROM users WHERE email = $1',
        [email]
    );

    if (result.rows.length === 0) {
        throw createError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const user = result.rows[0];

    if (!user.is_active) {
        throw createError(401, 'ACCOUNT_DISABLED', 'Account is disabled');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
        throw createError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const token = generateToken(user.id);

    res.json({
        success: true,
        data: {
            token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role
            }
        }
    });
}));

// POST /api/v1/auth/logout
router.post('/logout', (req, res) => {
    // In a stateless JWT system, logout is handled client-side
    // In production, you might want to maintain a blacklist of tokens
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// GET /api/v1/auth/me
router.get('/me', require('../middleware/auth').authenticateToken, (req, res) => {
    res.json({
        success: true,
        data: {
            user: {
                id: req.user.id,
                email: req.user.email,
                full_name: req.user.full_name,
                role: req.user.role,
                bi_number: req.user.bi_number
            }
        }
    });
});

module.exports = router;
