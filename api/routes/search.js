const express = require('express');
const { query: queryValidator, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { asyncHandler, createError } = require('../middleware/errorHandler');

const router = express.Router();

// GET /api/v1/search/missing-persons
router.get('/missing-persons', [
    queryValidator('q').optional().trim().isLength({ min: 2 }),
    queryValidator('gender').optional().isIn(['male', 'female', 'other', 'prefer_not_say']),
    queryValidator('age_min').optional().isInt({ min: 0, max: 150 }),
    queryValidator('age_max').optional().isInt({ min: 0, max: 150 }),
    queryValidator('province').optional().trim(),
    queryValidator('status').optional().isIn(['submitted', 'investigating', 'resolved', 'archived']),
    queryValidator('page').optional().isInt({ min: 1 }),
    queryValidator('limit').optional().isInt({ min: 1, max: 50 })
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw createError(400, 'VALIDATION_ERROR', 'Validation failed', errors.array());
    }

    const {
        q,
        gender,
        age_min,
        age_max,
        province,
        status,
        page = 1,
        limit = 10
    } = req.query;

    const offset = (page - 1) * limit;

    let whereConditions = ['c.complaint_type = $1'];
    let params = ['missing-person'];
    let paramIndex = 2;

    // Build WHERE clause dynamically
    if (q) {
        whereConditions.push(`(
            mp.full_name ILIKE $${paramIndex} OR 
            mp.last_seen_location ILIKE $${paramIndex + 1} OR
            c.location ILIKE $${paramIndex + 2}
        )`);
        const searchTerm = `%${q}%`;
        params.push(searchTerm, searchTerm, searchTerm);
        paramIndex += 3;
    }

    if (gender) {
        whereConditions.push(`mp.gender = $${paramIndex}`);
        params.push(gender);
        paramIndex++;
    }

    if (age_min) {
        whereConditions.push(`mp.age >= $${paramIndex}`);
        params.push(age_min);
        paramIndex++;
    }

    if (age_max) {
        whereConditions.push(`mp.age <= $${paramIndex}`);
        params.push(age_max);
        paramIndex++;
    }

    if (province) {
        whereConditions.push(`c.location ILIKE $${paramIndex}`);
        params.push(`%${province}%`);
        paramIndex++;
    }

    if (status) {
        whereConditions.push(`c.status = $${paramIndex}`);
        params.push(status);
        paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get missing persons
    const personsResult = await query(`
        SELECT 
            c.id,
            c.protocol_number,
            c.status,
            c.incident_date,
            c.location,
            c.created_at,
            mp.full_name,
            mp.age,
            mp.gender,
            mp.last_seen_location,
            mp.last_seen_date,
            mp.physical_description
        FROM complaints c
        INNER JOIN missing_person_details mp ON c.id = mp.complaint_id
        ${whereClause}
        ORDER BY c.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, [...params, limit, offset]);

    // Get total count
    const countResult = await query(`
        SELECT COUNT(*) 
        FROM complaints c
        INNER JOIN missing_person_details mp ON c.id = mp.complaint_id
        ${whereClause}
    `, params);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    const persons = personsResult.rows.map(person => ({
        id: person.id,
        protocol_number: person.protocol_number,
        full_name: person.full_name,
        age: person.age,
        gender: person.gender,
        last_seen_location: person.last_seen_location || person.location,
        last_seen_date: person.last_seen_date || person.incident_date,
        status: person.status,
        photo_url: null, // Would need evidence table integration
        description: person.physical_description || 'Sem descrição disponível'
    }));

    res.json({
        success: true,
        data: {
            persons,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                total_pages: totalPages
            }
        }
    });
}));

// GET /api/v1/search/cases
router.get('/cases', [
    queryValidator('bi_number').matches(/^[0-9]{9}[A-Z]{2}[0-9]{3}$/).withMessage('Invalid BI format')
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw createError(400, 'VALIDATION_ERROR', 'Validation failed', errors.array());
    }

    const { bi_number } = req.query;

    // Find cases where the person with this BI is involved
    const casesResult = await query(`
        SELECT 
            c.id,
            c.protocol_number,
            c.complaint_type,
            c.status,
            c.created_at,
            c.reporter_bi,
            mp.full_name as missing_person_name,
            mp.relationship_to_reporter,
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
        WHERE c.reporter_bi = $1
        ORDER BY c.created_at DESC
    `, [bi_number]);

    const cases = casesResult.rows.map(caseItem => {
        let personInfo = {};
        let relationship = 'reporter';

        switch (caseItem.complaint_type) {
            case 'missing-person':
                personInfo = {
                    name: caseItem.missing_person_name,
                    brief_description: `Pessoa desaparecida`
                };
                if (caseItem.relationship_to_reporter) {
                    relationship = 'family_member';
                }
                break;
            case 'common-crime':
                personInfo = {
                    name: caseItem.crime_type || 'Crime comum',
                    brief_description: `Crime reportado`
                };
                break;
            case 'corruption':
                personInfo = {
                    name: caseItem.corruption_institution || 'Corrupção',
                    brief_description: `Corrupção reportada`
                };
                break;
            case 'domestic-violence':
                personInfo = {
                    name: caseItem.violence_victim_name || 'Violência doméstica',
                    brief_description: `Violência reportada`
                };
                relationship = 'reporter'; // Could be victim, but need more logic
                break;
            case 'cyber-crime':
                personInfo = {
                    name: caseItem.cyber_crime_type || 'Crime cibernético',
                    brief_description: `Crime digital reportado`
                };
                break;
        }

        return {
            id: caseItem.id,
            protocol_number: caseItem.protocol_number,
            complaint_type: caseItem.complaint_type,
            status: caseItem.status,
            created_at: caseItem.created_at,
            relationship,
            person_info: personInfo
        };
    });

    res.json({
        success: true,
        data: { cases }
    });
}));

module.exports = router;
