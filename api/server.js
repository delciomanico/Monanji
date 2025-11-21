const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import routes
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const searchRoutes = require('./routes/search');
const evidenceRoutes = require('./routes/evidence');
const statsRoutes = require('./routes/stats');
const { router: notificationRoutes } = require('./routes/notifications');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8081',
    credentials: true
}));

// Logging
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests, please try again later'
        }
    }
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'MININT Complaint System API is running',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/complaints', complaintRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/evidence', evidenceRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Serve static files (uploaded evidence)
app.use('/api/v1/files', express.static(process.env.UPLOAD_PATH || './uploads'));

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: 'Endpoint not found'
        }
    });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 MININT API server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📱 Mobile access: http://192.168.100.23:${PORT}/health`);
    console.log(`📚 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

module.exports = app;
