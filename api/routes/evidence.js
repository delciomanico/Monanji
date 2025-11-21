const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { asyncHandler, createError } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadPath = process.env.UPLOAD_PATH || './uploads';
        const complaintPath = path.join(uploadPath, 'complaints');
        
        try {
            await fs.mkdir(complaintPath, { recursive: true });
            cb(null, complaintPath);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
        'video/mp4'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não permitido'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
        files: parseInt(process.env.MAX_FILES_PER_COMPLAINT) || 10
    }
});

// POST /api/v1/evidence/complaints/:id/evidence
router.post('/complaints/:id/evidence', 
    upload.array('files', 10),
    asyncHandler(async (req, res) => {
        const { id: complaintId } = req.params;
        const descriptions = req.body.descriptions || [];

        if (!req.files || req.files.length === 0) {
            throw createError(400, 'NO_FILES', 'No files uploaded');
        }

        // Check if complaint exists
        const complaintCheck = await query('SELECT id FROM complaints WHERE id = $1', [complaintId]);
        if (complaintCheck.rows.length === 0) {
            throw createError(404, 'NOT_FOUND', 'Complaint not found');
        }

        const uploadedFiles = [];

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            const description = descriptions[i] || null;

            // Insert evidence record
            const evidenceResult = await query(`
                INSERT INTO complaint_evidence (
                    complaint_id, file_name, file_path, file_type, file_size, description, uploaded_by
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id, file_name, file_type
            `, [
                complaintId,
                file.originalname,
                file.path,
                file.mimetype,
                file.size,
                description,
                req.user ? req.user.id : null
            ]);

            const evidence = evidenceResult.rows[0];

            uploadedFiles.push({
                id: evidence.id,
                file_name: evidence.file_name,
                file_url: `${process.env.API_BASE_URL}/api/v1/files/complaints/${file.filename}`,
                file_type: evidence.file_type
            });
        }

        res.json({
            success: true,
            data: {
                uploaded_files: uploadedFiles
            }
        });
    })
);

// GET /api/v1/evidence/complaints/:id/evidence
router.get('/complaints/:id/evidence', asyncHandler(async (req, res) => {
    const { id: complaintId } = req.params;

    // Check if complaint exists
    const complaintCheck = await query('SELECT id FROM complaints WHERE id = $1', [complaintId]);
    if (complaintCheck.rows.length === 0) {
        throw createError(404, 'NOT_FOUND', 'Complaint not found');
    }

    // Get evidence files
    const evidenceResult = await query(`
        SELECT 
            ce.id,
            ce.file_name,
            ce.file_path,
            ce.file_type,
            ce.file_size,
            ce.description,
            ce.uploaded_at,
            u.full_name as uploaded_by_name
        FROM complaint_evidence ce
        LEFT JOIN users u ON ce.uploaded_by = u.id
        WHERE ce.complaint_id = $1
        ORDER BY ce.uploaded_at DESC
    `, [complaintId]);

    const evidence = evidenceResult.rows.map(item => {
        const filename = path.basename(item.file_path);
        return {
            id: item.id,
            file_name: item.file_name,
            file_url: `${process.env.API_BASE_URL}/api/v1/files/complaints/${filename}`,
            file_type: item.file_type,
            file_size: item.file_size,
            description: item.description,
            uploaded_at: item.uploaded_at,
            uploaded_by: item.uploaded_by_name
        };
    });

    res.json({
        success: true,
        data: { evidence }
    });
}));

// DELETE /api/v1/evidence/:id (authenticated users only)
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Get evidence details
    const evidenceResult = await query(`
        SELECT ce.*, c.reporter_user_id 
        FROM complaint_evidence ce
        JOIN complaints c ON ce.complaint_id = c.id
        WHERE ce.id = $1
    `, [id]);

    if (evidenceResult.rows.length === 0) {
        throw createError(404, 'NOT_FOUND', 'Evidence not found');
    }

    const evidence = evidenceResult.rows[0];

    // Check permissions (owner, admin, or investigator)
    if (
        evidence.uploaded_by !== req.user.id &&
        evidence.reporter_user_id !== req.user.id &&
        !['admin', 'investigator'].includes(req.user.role)
    ) {
        throw createError(403, 'FORBIDDEN', 'Not authorized to delete this evidence');
    }

    // Delete file from filesystem
    try {
        await fs.unlink(evidence.file_path);
    } catch (error) {
        console.warn('Could not delete file from filesystem:', error.message);
    }

    // Delete database record
    await query('DELETE FROM complaint_evidence WHERE id = $1', [id]);

    res.json({
        success: true,
        message: 'Evidence deleted successfully'
    });
}));

// Error handling for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'FILE_TOO_LARGE',
                    message: 'File size exceeds limit'
                }
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'TOO_MANY_FILES',
                    message: 'Too many files uploaded'
                }
            });
        }
    }
    
    if (error.message === 'Tipo de arquivo não permitido') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_FILE_TYPE',
                message: 'File type not allowed'
            }
        });
    }
    
    next(error);
});

module.exports = router;
