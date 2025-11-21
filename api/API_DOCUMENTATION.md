# MININT Complaint System API Documentation

Base URL: `http://localhost:3000/api/v1`

## Authentication

All API endpoints require authentication via Bearer token except for complaint submission (which can be anonymous).

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Endpoints

### Authentication

#### POST /auth/login
Login to the system

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "User Name",
      "role": "citizen"
    }
  }
}
```

#### POST /auth/register
Register a new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "User Full Name",
  "phone": "+244923456789",
  "bi_number": "005448899LA048"
}
```

#### POST /auth/logout
Logout user (invalidate token)

---

### Complaints

#### POST /complaints
Submit a new complaint

**Request Body:**
```json
{
  "complaint_type": "missing-person", // "missing-person" | "common-crime" | "corruption" | "domestic-violence" | "cyber-crime"
  "is_anonymous": false,
  "incident_date": "2024-01-15",
  "incident_time": "14:30",
  "location": "Luanda, Maianga",
  "description": "Detailed description of the incident",
  "latitude": -8.8393,
  "longitude": 13.2894,
  
  // Reporter info (if not anonymous)
  "reporter_name": "João Silva",
  "reporter_contact": "+244923456789",
  "reporter_email": "joao@email.com",
  "reporter_bi": "005448899LA048",
  
  // Type-specific details
  "type_details": {
    // For missing-person
    "full_name": "Maria Santos",
    "age": 25,
    "gender": "female",
    "physical_description": "Altura média, cabelo preto",
    "last_seen_location": "Mercado do Roque Santeiro",
    "last_seen_date": "2024-01-15",
    "last_seen_time": "12:00",
    "clothing_description": "Vestido azul",
    "last_seen_with": "Amiga do trabalho",
    "medical_conditions": "Diabética",
    "frequent_places": "Casa, trabalho, mercado",
    "relationship_to_reporter": "Irmã"
    
    // For common-crime
    "crime_type": "theft",
    "other_crime_type": "Custom crime type if 'other'",
    "brief_description": "Brief description",
    "people_involved": "2 pessoas desconhecidas"
    
    // For corruption
    "corruption_type": "bribery",
    "institution": "Ministério da Educação",
    "official_name": "João Funcionário",
    "estimated_amount": 50000,
    "currency": "AOA",
    "how_known": "Presenciei o ato"
    
    // For domestic-violence
    "victim_name": "Ana Silva",
    "victim_age": 30,
    "victim_gender": "female",
    "relationship_with_aggressor": "Cônjuge",
    "violence_type": "physical",
    "frequency": "frequent",
    "children_involved": true,
    "needs_medical_help": false
    
    // For cyber-crime
    "cyber_crime_type": "online_fraud",
    "platform": "Facebook",
    "url": "https://facebook.com/fake-profile",
    "contact_method": "Mensagem privada",
    "suspect_info": "Perfil falso",
    "estimated_loss": 25000,
    "currency": "AOA"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "protocol_number": "DENUNCIA-20240115-0001",
    "status": "submitted",
    "message": "Denúncia registrada com sucesso"
  }
}
```

#### GET /complaints/:protocol_number
Get complaint by protocol number

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "protocol_number": "DENUNCIA-20240115-0001",
    "complaint_type": "missing-person",
    "status": "investigating",
    "incident_date": "2024-01-15",
    "location": "Luanda, Maianga",
    "description": "Description...",
    "investigator": {
      "name": "Inspector Manuel Santos",
      "phone": "+244923456789",
      "email": "investigator@minint.gov.ao"
    },
    "updates": [
      {
        "date": "2024-01-20",
        "status": "investigating",
        "description": "Caso foi encaminhado para a esquadra local"
      }
    ],
    "next_steps": [
      "Busca nas áreas frequentadas",
      "Contacto com familiares"
    ],
    "type_details": {
      // Type-specific details based on complaint_type
    }
  }
}
```

#### GET /complaints/my
Get complaints by authenticated user (by BI number)

**Query Parameters:**
- `status`: Filter by status
- `type`: Filter by complaint type
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "complaints": [
      {
        "id": "uuid",
        "protocol_number": "DENUNCIA-20240115-0001",
        "complaint_type": "missing-person",
        "status": "investigating",
        "created_at": "2024-01-15T10:30:00Z",
        "person_name": "Maria Santos", // varies by type
        "brief_info": "Last seen at market"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 3,
      "total_pages": 1
    }
  }
}
```

#### PUT /complaints/:id/update
Add update to complaint (investigators only)

**Request Body:**
```json
{
  "status": "investigating",
  "description": "New update description",
  "is_public": true
}
```

---

### Search

#### GET /search/missing-persons
Search for missing persons

**Query Parameters:**
- `q`: Search query (name, location)
- `gender`: Filter by gender
- `age_min`: Minimum age
- `age_max`: Maximum age
- `province`: Filter by province
- `status`: Filter by status
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "persons": [
      {
        "id": "uuid",
        "protocol_number": "DENUNCIA-20240115-0001",
        "full_name": "Maria Santos",
        "age": 25,
        "gender": "female",
        "last_seen_location": "Luanda, Maianga",
        "last_seen_date": "2024-01-15",
        "status": "investigating",
        "photo_url": "https://api.example.com/photos/uuid.jpg",
        "description": "Brief description"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "total_pages": 2
    }
  }
}
```

#### GET /search/cases
Search cases by BI number

**Query Parameters:**
- `bi_number`: BI number to search for

**Response:**
```json
{
  "success": true,
  "data": {
    "cases": [
      {
        "id": "uuid",
        "protocol_number": "DENUNCIA-20240115-0001",
        "complaint_type": "missing-person",
        "status": "investigating",
        "created_at": "2024-01-15T10:30:00Z",
        "relationship": "reporter", // "reporter" | "family_member" | "victim"
        "person_info": {
          "name": "Maria Santos",
          "brief_description": "Missing since Jan 15"
        }
      }
    ]
  }
}
```

---

### Evidence/Media

#### POST /complaints/:id/evidence
Upload evidence files

**Request:** Multipart form data
- `files[]`: Multiple files (images, documents)
- `descriptions[]`: Optional descriptions for each file

**Response:**
```json
{
  "success": true,
  "data": {
    "uploaded_files": [
      {
        "id": "uuid",
        "file_name": "evidence1.jpg",
        "file_url": "https://api.example.com/evidence/uuid.jpg",
        "file_type": "image/jpeg"
      }
    ]
  }
}
```

#### GET /complaints/:id/evidence
Get evidence files for complaint

**Response:**
```json
{
  "success": true,
  "data": {
    "evidence": [
      {
        "id": "uuid",
        "file_name": "evidence1.jpg",
        "file_url": "https://api.example.com/evidence/uuid.jpg",
        "file_type": "image/jpeg",
        "description": "Photo of the scene",
        "uploaded_at": "2024-01-15T14:30:00Z"
      }
    ]
  }
}
```

---

### Statistics (Admin/Investigator only)

#### GET /stats/dashboard
Get dashboard statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "total_complaints": 1547,
    "by_type": {
      "missing-person": 650,
      "common-crime": 423,
      "corruption": 234,
      "domestic-violence": 156,
      "cyber-crime": 84
    },
    "by_status": {
      "investigating": 234,
      "resolved": 1200,
      "submitted": 67,
      "archived": 46
    },
    "recent_activity": [
      {
        "date": "2024-01-20",
        "complaints": 12
      }
    ],
    "success_rate": 92.5
  }
}
```

---

### Notifications

#### GET /notifications
Get user notifications

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "title": "Atualização no seu caso",
        "message": "Seu caso DENUNCIA-20240115-0001 foi atualizado",
        "type": "complaint_update",
        "is_read": false,
        "created_at": "2024-01-20T10:30:00Z",
        "complaint_protocol": "DENUNCIA-20240115-0001"
      }
    ],
    "unread_count": 3
  }
}
```

#### PUT /notifications/:id/read
Mark notification as read

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "complaint_type",
      "message": "Invalid complaint type"
    }
  }
}
```

### Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `INTERNAL_ERROR`: Server error

## Rate Limiting

- Anonymous complaints: 5 per IP per hour
- Authenticated users: 100 requests per hour
- File uploads: 10 MB per file, 50 MB total per complaint

## File Upload Guidelines

**Supported formats:**
- Images: JPG, PNG, WEBP (max 10MB each)
- Documents: PDF (max 10MB each)
- Videos: MP4 (max 50MB each)

**Storage:**
- Files are stored securely with UUID names
- URLs expire after 24 hours for security
- Evidence files are encrypted at rest
