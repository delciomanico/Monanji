const errorHandler = (err, req, res, next) => {
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query
    });

    // Default error response
    let error = {
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error'
        }
    };

    // Database errors
    if (err.code && err.code.startsWith('23')) {
        if (err.code === '23505') { // Unique constraint violation
            error.error.code = 'DUPLICATE_ENTRY';
            error.error.message = 'Resource already exists';
        } else if (err.code === '23503') { // Foreign key violation
            error.error.code = 'REFERENCE_ERROR';
            error.error.message = 'Referenced resource not found';
        } else {
            error.error.code = 'DATABASE_ERROR';
            error.error.message = 'Database constraint violation';
        }
        return res.status(400).json(error);
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        error.error.code = 'VALIDATION_ERROR';
        error.error.message = err.message;
        error.error.details = err.details;
        return res.status(400).json(error);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error.error.code = 'UNAUTHORIZED';
        error.error.message = 'Invalid token';
        return res.status(401).json(error);
    }

    if (err.name === 'TokenExpiredError') {
        error.error.code = 'TOKEN_EXPIRED';
        error.error.message = 'Token has expired';
        return res.status(401).json(error);
    }

    // Multer/file upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        error.error.code = 'FILE_TOO_LARGE';
        error.error.message = 'File size exceeds limit';
        return res.status(400).json(error);
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        error.error.code = 'TOO_MANY_FILES';
        error.error.message = 'Too many files uploaded';
        return res.status(400).json(error);
    }

    // Custom app errors
    if (err.status) {
        error.error.code = err.code || 'CUSTOM_ERROR';
        error.error.message = err.message;
        return res.status(err.status).json(error);
    }

    // Default 500 error
    res.status(500).json(error);
};

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

const createError = (status, code, message, details = null) => {
    const error = new Error(message);
    error.status = status;
    error.code = code;
    error.details = details;
    return error;
};

module.exports = {
    errorHandler,
    asyncHandler,
    createError
};
