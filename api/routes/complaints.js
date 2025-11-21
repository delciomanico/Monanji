const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { asyncHandler, createError } = require('../middleware/errorHandler');
const { authenticateToken, requireRole } = require('../middleware/auth');
const moment = require('moment');

const router = express.Router();

// Validation rules
const complaintValidation = [
    body('complaint_type').isIn(['missing-person', 'common-crime', 'corruption', 'domestic-violence', 'cyber-crime']),
    body('is_anonymous').isBoolean(),
    body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('incident_date').optional().isISO8601().withMessage('Invalid date format'),
    body('incident_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
    body('location').optional().trim().isLength({ min: 3 }),
    body('latitude').optional().isFloat({ min: -90, max: 90 }),
    body('longitude').optional().isFloat({ min: -180, max: 180 })
];

// Helper function to generate protocol number
const generateProtocolNumber = async () => {
    const today = moment().format('YYYYMMDD');
    const countResult = await query(
        'SELECT COUNT(*) FROM complaints WHERE DATE(created_at) = CURRENT_DATE'
    );
    const count = parseInt(countResult.rows[0].count) + 1;
    return `DENUNCIA-${today}-${count.toString().padStart(4, '0')}`;
};

// Helper function to insert type-specific details
const insertTypeDetails = async (complaintId, complaintType, typeDetails, client) => {
    switch (complaintType) {
        case 'missing-person':
            await client.query(`
                INSERT INTO missing_person_details (
                    complaint_id, full_name, age, gender, physical_description,
                    last_seen_location, last_seen_date, last_seen_time,
                    clothing_description, last_seen_with, medical_conditions,
                    frequent_places, relationship_to_reporter
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            `, [
                complaintId,
                typeDetails.full_name,
                typeDetails.age,
                typeDetails.gender,
                typeDetails.physical_description,
                typeDetails.last_seen_location,
                typeDetails.last_seen_date,
                typeDetails.last_seen_time,
                typeDetails.clothing_description,
                typeDetails.last_seen_with,
                typeDetails.medical_conditions,
                typeDetails.frequent_places,
                typeDetails.relationship_to_reporter
            ]);
            break;

        case 'common-crime':
            await client.query(`
                INSERT INTO common_crime_details (
                    complaint_id, crime_type, other_crime_type, brief_description, people_involved
                ) VALUES ($1, $2, $3, $4, $5)
            `, [
                complaintId,
                typeDetails.crime_type,
                typeDetails.other_crime_type,
                typeDetails.brief_description,
                typeDetails.people_involved
            ]);
            break;

        case 'corruption':
            await client.query(`
                INSERT INTO corruption_details (
                    complaint_id, corruption_type, institution, official_name,
                    estimated_amount, currency, how_known
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                complaintId,
                typeDetails.corruption_type,
                typeDetails.institution,
                typeDetails.official_name,
                typeDetails.estimated_amount,
                typeDetails.currency || 'AOA',
                typeDetails.how_known
            ]);
            break;

        case 'domestic-violence':
            await client.query(`
                INSERT INTO domestic_violence_details (
                    complaint_id, victim_name, victim_age, victim_gender,
                    relationship_with_aggressor, violence_type, frequency,
                    children_involved, needs_medical_help
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
                complaintId,
                typeDetails.victim_name,
                typeDetails.victim_age,
                typeDetails.victim_gender,
                typeDetails.relationship_with_aggressor,
                typeDetails.violence_type,
                typeDetails.frequency,
                typeDetails.children_involved,
                typeDetails.needs_medical_help
            ]);
            break;

        case 'cyber-crime':
            await client.query(`
                INSERT INTO cyber_crime_details (
                    complaint_id, cyber_crime_type, platform, url,
                    contact_method, suspect_info, estimated_loss, currency
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
                complaintId,
                typeDetails.cyber_crime_type,
                typeDetails.platform,
                typeDetails.url,
                typeDetails.contact_method,
                typeDetails.suspect_info,
                typeDetails.estimated_loss,
                typeDetails.currency || 'AOA'
            ]);
            break;
    }
};

// POST /api/v1/complaints
router.post('/', complaintValidation, asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw createError(400, 'VALIDATION_ERROR', 'Validation failed', errors.array());
    }

    const {
        complaint_type,
        is_anonymous,
        incident_date,
        incident_time,
        location,
        description,
        latitude,
        longitude,
        reporter_name,
        reporter_contact,
        reporter_email,
        reporter_bi,
        type_details
    } = req.body;

    const client = await require('../config/database').pool.connect();

    try {
        await client.query('BEGIN');

        const protocolNumber = await generateProtocolNumber();

        // Insert main complaint
        const complaintResult = await client.query(`
            INSERT INTO complaints (
                protocol_number, complaint_type, status, is_anonymous,
                reporter_user_id, reporter_name, reporter_contact, reporter_email, reporter_bi,
                incident_date, incident_time, location, description,
                latitude, longitude
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING id, protocol_number, status, created_at
        `, [
            protocolNumber,
            complaint_type,
            'submitted',
            is_anonymous,
            req.user ? req.user.id : null,
            is_anonymous ? null : reporter_name,
            is_anonymous ? null : reporter_contact,
            is_anonymous ? null : reporter_email,
            is_anonymous ? null : reporter_bi,
            incident_date || null,
            incident_time || null,
            location,
            description,
            latitude || null,
            longitude || null
        ]);

        const complaint = complaintResult.rows[0];

        // Insert type-specific details if provided
        if (type_details) {
            await insertTypeDetails(complaint.id, complaint_type, type_details, client);
        }

        // Add initial status update
        await client.query(`
            INSERT INTO complaint_updates (complaint_id, status, update_description, is_public)
            VALUES ($1, $2, $3, $4)
        `, [complaint.id, 'submitted', 'Denúncia submetida e registrada no sistema', true]);

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            data: {
                id: complaint.id,
                protocol_number: complaint.protocol_number,
                status: complaint.status,
                created_at: complaint.created_at,
                message: 'Denúncia registrada com sucesso'
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}));

// GET /api/v1/complaints/:protocol_number
router.get('/:protocol_number', asyncHandler(async (req, res) => {
    const { protocol_number } = req.params;

    // Get main complaint info
    const complaintResult = await query(`
        SELECT c.*, u.full_name as investigator_name, u.phone as investigator_phone, u.email as investigator_email
        FROM complaints c
        LEFT JOIN users u ON c.investigator_id = u.id
        WHERE c.protocol_number = $1
    `, [protocol_number]);

    if (complaintResult.rows.length === 0) {
        throw createError(404, 'NOT_FOUND', 'Complaint not found');
    }

    const complaint = complaintResult.rows[0];

    // Check if user has access to this complaint
    if (req.user) {
        const hasAccess = (
            complaint.reporter_user_id === req.user.id ||
            complaint.investigator_id === req.user.id ||
            req.user.role === 'admin' ||
            (complaint.reporter_bi === req.user.bi_number && complaint.reporter_bi !== null)
        );

        if (!hasAccess) {
            throw createError(403, 'FORBIDDEN', 'Access denied to this complaint');
        }
    }

    // Get type-specific details
    let typeDetails = {};
    switch (complaint.complaint_type) {
        case 'missing-person':
            const missingResult = await query(
                'SELECT * FROM missing_person_details WHERE complaint_id = $1',
                [complaint.id]
            );
            if (missingResult.rows.length > 0) {
                typeDetails = missingResult.rows[0];
            }
            break;

        case 'common-crime':
            const crimeResult = await query(
                'SELECT * FROM common_crime_details WHERE complaint_id = $1',
                [complaint.id]
            );
            if (crimeResult.rows.length > 0) {
                typeDetails = crimeResult.rows[0];
            }
            break;

        case 'corruption':
            const corruptionResult = await query(
                'SELECT * FROM corruption_details WHERE complaint_id = $1',
                [complaint.id]
            );
            if (corruptionResult.rows.length > 0) {
                typeDetails = corruptionResult.rows[0];
            }
            break;

        case 'domestic-violence':
            const violenceResult = await query(
                'SELECT * FROM domestic_violence_details WHERE complaint_id = $1',
                [complaint.id]
            );
            if (violenceResult.rows.length > 0) {
                typeDetails = violenceResult.rows[0];
            }
            break;

        case 'cyber-crime':
            const cyberResult = await query(
                'SELECT * FROM cyber_crime_details WHERE complaint_id = $1',
                [complaint.id]
            );
            if (cyberResult.rows.length > 0) {
                typeDetails = cyberResult.rows[0];
            }
            break;
    }

    // Get updates
    const updatesResult = await query(`
        SELECT cu.*, u.full_name as updated_by_name
        FROM complaint_updates cu
        LEFT JOIN users u ON cu.updated_by = u.id
        WHERE cu.complaint_id = $1 AND cu.is_public = true
        ORDER BY cu.created_at DESC
    `, [complaint.id]);

    const updates = updatesResult.rows.map(update => ({
        date: moment(update.created_at).format('YYYY-MM-DD'),
        status: update.status,
        description: update.update_description,
        updated_by: update.updated_by_name
    }));

    // Generate next steps based on complaint type and status
    let nextSteps = [];
    if (complaint.status === 'investigating') {
        switch (complaint.complaint_type) {
            case 'missing-person':
                nextSteps = [
                    'Busca nas áreas frequentadas pela pessoa',
                    'Contacto com familiares e amigos',
                    'Verificação em hospitais e centros de saúde',
                    'Divulgação da foto nos postos policiais'
                ];
                break;
            default:
                nextSteps = [
                    'Recolha de provas adicionais',
                    'Entrevistas com testemunhas',
                    'Análise técnica das evidências'
                ];
        }
    }

    res.json({
        success: true,
        data: {
            id: complaint.id,
            protocol_number: complaint.protocol_number,
            complaint_type: complaint.complaint_type,
            status: complaint.status,
            incident_date: complaint.incident_date,
            incident_time: complaint.incident_time,
            location: complaint.location,
            description: complaint.description,
            is_anonymous: complaint.is_anonymous,
            created_at: complaint.created_at,
            investigator: complaint.investigator_name ? {
                name: complaint.investigator_name,
                phone: complaint.investigator_phone,
                email: complaint.investigator_email
            } : null,
            updates,
            next_steps: nextSteps,
            type_details: typeDetails
        }
    });
}));

// GET /api/v1/complaints/my
router.get('/my', authenticateToken, asyncHandler(async (req, res) => {
    const { status, type, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE (c.reporter_user_id = $1 OR c.reporter_bi = $2)';
    let params = [req.user.id, req.user.bi_number];
    let paramIndex = 3;

    if (status) {
        whereClause += ` AND c.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
    }

    if (type) {
        whereClause += ` AND c.complaint_type = $${paramIndex}`;
        params.push(type);
        paramIndex++;
    }

    // Get complaints with type-specific info for display
    const complaintResult = await query(`
        SELECT 
            c.id, c.protocol_number, c.complaint_type, c.status, c.created_at,
            c.incident_date, c.location,
            mp.full_name as missing_person_name,
            cc.crime_type,
            co.institution as corruption_institution,
            dv.victim_name as violence_victim_name,
            cy.cyber_crime_type
        FROM complaints c
        LEFT JOIN missing_person_details mp ON c.id = mp.complaint_id
        LEFT JOIN common_crime_details cc ON c.id = cc.complaint_id
        LEFT JOIN corruption_details co ON c.id = co.complaint_id
        LEFT JOIN domestic_violence_details dv ON c.id = dv.complaint_id
        LEFT JOIN cyber_crime_details cy ON c.id = cy.complaint_id
        ${whereClause}
        ORDER BY c.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    // Get total count
    const countResult = await query(`
        SELECT COUNT(*) FROM complaints c ${whereClause}
    `, params);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    const complaints = complaintResult.rows.map(complaint => {
        let displayName = '';
        let briefInfo = '';

        switch (complaint.complaint_type) {
            case 'missing-person':
                displayName = complaint.missing_person_name || 'Pessoa desaparecida';
                briefInfo = `Última vez vista: ${complaint.incident_date || 'Data não informada'}`;
                break;
            case 'common-crime':
                displayName = complaint.crime_type || 'Crime comum';
                briefInfo = `Local: ${complaint.location || 'Local não informado'}`;
                break;
            case 'corruption':
                displayName = complaint.corruption_institution || 'Corrupção';
                briefInfo = `Instituição: ${complaint.corruption_institution || 'Não informada'}`;
                break;
            case 'domestic-violence':
                displayName = complaint.violence_victim_name || 'Violência doméstica';
                briefInfo = `Vítima: ${complaint.violence_victim_name || 'Não informada'}`;
                break;
            case 'cyber-crime':
                displayName = complaint.cyber_crime_type || 'Crime cibernético';
                briefInfo = `Tipo: ${complaint.cyber_crime_type || 'Não informado'}`;
                break;
        }

        return {
            id: complaint.id,
            protocol_number: complaint.protocol_number,
            complaint_type: complaint.complaint_type,
            status: complaint.status,
            created_at: complaint.created_at,
            display_name: displayName,
            brief_info: briefInfo
        };
    });

    res.json({
        success: true,
        data: {
            complaints,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                total_pages: totalPages
            }
        }
    });
}));

// PUT /api/v1/complaints/:id/update (investigators/admins only)
router.put('/:id/update', 
    authenticateToken, 
    requireRole(['investigator', 'admin']),
    [
        body('status').isIn(['submitted', 'received', 'reviewing', 'investigating', 'resolved', 'archived']),
        body('description').trim().isLength({ min: 5 }),
        body('is_public').isBoolean()
    ],
    asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw createError(400, 'VALIDATION_ERROR', 'Validation failed', errors.array());
        }

        const { id } = req.params;
        const { status, description, is_public = true } = req.body;

        // Check if complaint exists
        const complaintCheck = await query('SELECT id FROM complaints WHERE id = $1', [id]);
        if (complaintCheck.rows.length === 0) {
            throw createError(404, 'NOT_FOUND', 'Complaint not found');
        }

        // Update complaint status
        await query('UPDATE complaints SET status = $1, updated_at = NOW() WHERE id = $2', [status, id]);

        // Add update record
        await query(`
            INSERT INTO complaint_updates (complaint_id, status, update_description, updated_by, is_public)
            VALUES ($1, $2, $3, $4, $5)
        `, [id, status, description, req.user.id, is_public]);

        res.json({
            success: true,
            message: 'Complaint updated successfully'
        });
    })
);

module.exports = router;
