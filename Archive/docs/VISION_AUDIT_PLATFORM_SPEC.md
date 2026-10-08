# Spare-it Vision Audit Platform
## Technical Specification & Implementation Blueprint

**Document Version:** 1.0  
**Status:** MVP Specification  
**Last Updated:** June 2026  
**Audience:** R&D Team, Product, Operations

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [User Roles & Workflows](#user-roles--workflows)
4. [Database Schema](#database-schema)
5. [API Specification](#api-specification)
6. [Feature Roadmap](#feature-roadmap)
7. [Implementation Plan](#implementation-plan)
8. [Open Questions & Decision Points](#open-questions--decision-points)

---

## Executive Summary

### Problem Statement
Spare-it Vision requires a systematic way to set up and audit waste management sites. Currently:
- Admin manually coordinates site setup (building info, floor plans, bin placement)
- Auditors have no structured tool for on-site validation
- No centralized tracking of audit progress or data
- No audit report for customer review

### Solution
**Vision Audit Platform** — A three-tier system:
1. **Admin Portal** (Internal) — Build sites, manage floor plans, track audits, generate reports
2. **Customer Portal** (External) — View site progress, download audit reports
3. **Site Audit App** (Mobile-first) — Auditor pins stations, captures photos of QR codes, selects waste streams

### MVP Scope
**In Scope:**
- Admin portal (site setup, floor plan upload)
- Site audit app (pin + photo + waste streams)
- Customer portal (view progress, download report)
- Real-time progress tracking
- Basic audit report generation

**Out of Scope (Phase 2+):**
- QR code extraction/scanning
- Waste assessment tool integration
- Advanced analytics & comparisons
- Mobile native apps
- Custom branding

### Success Metrics
- [ ] Admin can create site + upload floor plans in <5 min
- [ ] Auditor can complete site audit in <30 min per floor
- [ ] 95%+ data integrity (no lost audits)
- [ ] Audit report delivered within 1 min of submission
- [ ] <2sec page load time on mobile (3G)

---

## System Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                     SPARE-IT VISION PLATFORM                │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │ Admin Portal     │  │ Customer Portal  │  │ Audit App  │ │
│  │ (Web)            │  │ (Web)            │  │ (Mobile)   │ │
│  └────────┬─────────┘  └────────┬─────────┘  └────┬───────┘ │
│           │                     │                  │         │
│           └─────────────────────┴──────────────────┘         │
│                         │                                     │
│                    HTTP/REST API                             │
│                         │                                     │
├─────────────────────────┴──────────────────────────────────┤ │
│                      BACKEND SERVICES                        │ │
│  ┌──────────────────┐  ┌──────────────────┐                │ │
│  │ Auth Service     │  │ Site Service     │                │ │
│  │ (JWT, user mgmt) │  │ (CRUD ops)       │                │ │
│  └──────────────────┘  └──────────────────┘                │ │
│  ┌──────────────────┐  ┌──────────────────┐                │ │
│  │ Audit Service    │  │ Report Service   │                │ │
│  │ (Progress track) │  │ (PDF/JSON gen)   │                │ │
│  └──────────────────┘  └──────────────────┘                │ │
│  ┌──────────────────┐  ┌──────────────────┐                │ │
│  │ Notification Svc │  │ Photo Storage    │                │ │
│  │ (Email, push)    │  │ (S3 / Cloud)     │                │ │
│  └──────────────────┘  └──────────────────┘                │ │
│                                                               │
├─────────────────────────────────────────────────────────────┤ │
│                    DATA LAYER                                │ │
│  ┌──────────────────┐  ┌──────────────────┐                │ │
│  │ Primary Database │  │ Cache / Queue    │                │ │
│  │ (PostgreSQL)     │  │ (Redis)          │                │ │
│  └──────────────────┘  └──────────────────┘                │ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
SITE CREATION → AUDIT ASSIGNMENT → AUDIT EXECUTION → REPORT DELIVERY
      ↓               ↓                   ↓                  ↓
   Admin Portal   Email to Auditor   Audit App          Customer
   - Build site    - Unique link     - Pin stations     Portal
   - Upload plans  - Expires on      - Photo QR codes   - Download
   - Set streams   completion        - Select streams   report
                                     - Save draft       - Notify team
                                     - Submit
```

### Integration Points

| System | Direction | Trigger | Data |
|--------|-----------|---------|------|
| Waste Assessment Tool | Out | Report generation | Station photos + QR codes + streams |
| Email Service | Out | Audit started, completed | Link, progress, report |
| Push Notifications | Out | Audit milestones | Status update |
| Photo Storage (S3) | Out | Photo captured | Image file + metadata |
| Spare-it Ops System | In | Real-time | Audit progress events |

---

## User Roles & Workflows

### Actor Definitions

#### 1. **Spare-it Admin** (Internal)
- **Permissions**: Create sites, manage all audits, view all data, generate reports
- **Tools**: Admin Portal
- **Workflow**: 
  1. Create building (name, address, occupancy type)
  2. Upload floor plans (per floor)
  3. Define waste streams (pre-populate for this site)
  4. Invite customer account owner (email)
  5. Track audit progress in real-time
  6. Export/archive audit data

#### 2. **Customer Account Owner** (Sustainability/Facility Manager)
- **Permissions**: View assigned sites, track audit progress, download reports, invite auditors
- **Tools**: Customer Portal + Email
- **Workflow**:
  1. Receive site invitation (email)
  2. Log in to customer portal
  3. View site details (floors, deadline)
  4. Invite team members to audit
  5. Monitor real-time progress
  6. Download audit report on completion

#### 3. **Auditor** (Site Team Member)
- **Permissions**: Execute assigned audit, save drafts, submit
- **Tools**: Site Audit App (mobile)
- **Workflow**:
  1. Receive unique audit link (email + SMS)
  2. Open app → sees building, floors, floor plans
  3. For each floor:
     - Pin stations on floor plan
     - Take photo of QR code
     - Optional: add location note
     - Select waste streams present
  4. Save progress (draft)
  5. Submit audit
  6. Receive confirmation

---

## Database Schema

### Entity Relationship Diagram

```
Customer Account
    │
    ├─→ Site (Building)
    │    │
    │    ├─→ Floor
    │    │    │
    │    │    └─→ FloorPlan (image)
    │    │
    │    ├─→ Audit
    │    │    │
    │    │    ├─→ Station
    │    │    │    │
    │    │    │    ├─→ Station Photo
    │    │    │    │
    │    │    │    └─→ StationWasteStream (pivot)
    │    │    │
    │    │    └─→ AuditProgress
    │    │
    │    └─→ WasteStream (predefined)
    │
    ├─→ User (Account Owner)
    │
    └─→ AuditLink (unique per auditor)
```

### Core Entities

#### **Customer Account**
```
Table: customer_accounts
├── id: UUID (PK)
├── name: VARCHAR(255) - Company name
├── email: VARCHAR(255) - Primary contact
├── status: ENUM(active, inactive, suspended)
├── created_at: TIMESTAMP
├── updated_at: TIMESTAMP
└── metadata: JSONB - Custom fields
```

#### **Site (Building)**
```
Table: sites
├── id: UUID (PK)
├── customer_id: UUID (FK → customer_accounts)
├── name: VARCHAR(255) - Building name
├── address: TEXT
├── occupancy_type: ENUM(office, warehouse, retail, hospitality, healthcare, education, industrial, other)
├── estimated_stations: INT - Auditor hint for expected count
├── created_at: TIMESTAMP
├── updated_at: TIMESTAMP
└── metadata: JSONB
    ├── phone_contact
    ├── facility_manager
    └── notes
```

#### **Floor**
```
Table: floors
├── id: UUID (PK)
├── site_id: UUID (FK → sites)
├── floor_number: INT or VARCHAR(10) - 1, 2, B1, Roof, etc.
├── display_order: INT
├── floor_plan_image_url: VARCHAR(1024) - S3 URL
├── floor_plan_width: INT - Original image width (px)
├── floor_plan_height: INT - Original image height (px)
├── created_at: TIMESTAMP
├── updated_at: TIMESTAMP
└── metadata: JSONB
    └── dimensions_unit: ENUM(px, inches, meters)
```

#### **Audit**
```
Table: audits
├── id: UUID (PK)
├── site_id: UUID (FK → sites)
├── audit_type: ENUM(baseline, follow-up)
├── status: ENUM(draft, in_progress, submitted, completed)
├── started_at: TIMESTAMP
├── completed_at: TIMESTAMP (nullable)
├── deadline: TIMESTAMP (nullable)
├── auditor_name: VARCHAR(255)
├── auditor_email: VARCHAR(255)
├── notes: TEXT
├── created_at: TIMESTAMP
├── updated_at: TIMESTAMP
└── metadata: JSONB
    ├── duration_minutes
    ├── device_info (browser, OS)
    └── location_data (if captured)
```

#### **Station**
```
Table: stations
├── id: UUID (PK)
├── audit_id: UUID (FK → audits)
├── floor_id: UUID (FK → floors)
├── station_letter: VARCHAR(3) - A, B, C, etc.
├── station_name: VARCHAR(255) - Optional custom name
├── pin_x: DECIMAL(5,2) - % position on floor plan (0-100)
├── pin_y: DECIMAL(5,2) - % position on floor plan (0-100)
├── photo_url: VARCHAR(1024) - S3 URL of QR code photo
├── photo_timestamp: TIMESTAMP
├── location_notes: TEXT - "QR code on left bin, top shelf"
├── created_at: TIMESTAMP
├── updated_at: TIMESTAMP
└── metadata: JSONB
    ├── photo_metadata
    └── retakes_count
```

#### **StationWasteStream** (Pivot/Junction Table)
```
Table: station_waste_streams
├── id: UUID (PK)
├── station_id: UUID (FK → stations)
├── waste_stream_id: UUID (FK → waste_streams)
├── created_at: TIMESTAMP
└── metadata: JSONB
```

#### **WasteStream**
```
Table: waste_streams
├── id: UUID (PK)
├── site_id: UUID (FK → sites)
├── name: VARCHAR(255) - Cardboard, Compost, etc.
├── color_code: VARCHAR(7) - #34A853 for UI
├── is_active: BOOLEAN
├── created_at: TIMESTAMP
└── metadata: JSONB
```

#### **AuditLink** (Unique auditor access token)
```
Table: audit_links
├── id: UUID (PK)
├── audit_id: UUID (FK → audits)
├── token: VARCHAR(64) - Unique hash
├── auditor_email: VARCHAR(255)
├── status: ENUM(active, expired, revoked)
├── expires_at: TIMESTAMP
├── activated_at: TIMESTAMP (nullable)
├── created_at: TIMESTAMP
├── created_by: UUID (FK → users - admin who sent link)
└── metadata: JSONB
```

#### **AuditProgress** (Real-time tracking)
```
Table: audit_progress
├── id: UUID (PK)
├── audit_id: UUID (FK → audits)
├── event_type: ENUM(started, station_pinned, photo_captured, stream_selected, draft_saved, submitted)
├── floor_id: UUID (FK → floors, nullable)
├── station_id: UUID (FK → stations, nullable)
├── timestamp: TIMESTAMP
├── metadata: JSONB
    ├── total_stations_expected
    ├── stations_pinned_count
    ├── photos_captured_count
    └── progress_percent
```

#### **AuditReport** (Generated after submission)
```
Table: audit_reports
├── id: UUID (PK)
├── audit_id: UUID (FK → audits) UNIQUE
├── report_url: VARCHAR(1024) - S3 URL to PDF/JSON
├── report_format: ENUM(pdf, json, both)
├── summary: JSONB
│   ├── total_stations
│   ├── waste_streams_found
│   ├── photos_captured
│   └── timestamp
├── generated_at: TIMESTAMP
├── delivered_at: TIMESTAMP (nullable)
└── metadata: JSONB
```

#### **User** (Account owners, admins)
```
Table: users
├── id: UUID (PK)
├── email: VARCHAR(255) UNIQUE
├── password_hash: VARCHAR(255)
├── role: ENUM(admin, customer_owner, auditor)
├── customer_id: UUID (FK → customer_accounts, nullable)
├── first_name: VARCHAR(255)
├── last_name: VARCHAR(255)
├── status: ENUM(active, inactive, suspended)
├── last_login_at: TIMESTAMP
├── created_at: TIMESTAMP
├── updated_at: TIMESTAMP
└── metadata: JSONB
    ├── preferences
    └── notification_settings
```

### Indexing Strategy
```sql
-- Performance-critical queries
CREATE INDEX idx_sites_customer ON sites(customer_id);
CREATE INDEX idx_audits_site ON audits(site_id);
CREATE INDEX idx_stations_audit ON stations(audit_id);
CREATE INDEX idx_audit_progress_audit ON audit_progress(audit_id, timestamp DESC);
CREATE INDEX idx_audit_links_token ON audit_links(token);
CREATE INDEX idx_audit_links_email ON audit_links(auditor_email);
```

---

## API Specification

### Authentication & Authorization

**Token Strategy:** JWT (Bearer Token)
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Payload:**
```json
{
  "sub": "user_id",
  "role": "admin|customer_owner|auditor",
  "customer_id": "optional_for_customer_roles",
  "audit_id": "optional_for_audit_links",
  "exp": 1719360000,
  "iat": 1719273600
}
```

**Audit Link Strategy:** Unique token (no user account required)
```
GET /audit/{auditId}?token=unique_token_hash
```

---

### Admin Portal API

#### **Sites**

**Create Site**
```
POST /api/admin/sites
Content-Type: application/json

{
  "name": "Main Office Building",
  "address": "125 Summer Street, Boston, MA 02110",
  "occupancy_type": "office",
  "estimated_stations": 8,
  "customer_id": "cust_123",
  "metadata": {
    "phone_contact": "+1-617-555-0123",
    "facility_manager": "Jane Doe"
  }
}

Response: 201 Created
{
  "id": "site_456",
  "name": "Main Office Building",
  "address": "125 Summer Street, Boston, MA 02110",
  "created_at": "2026-06-25T10:30:00Z"
}
```

**Upload Floor Plan**
```
POST /api/admin/sites/{siteId}/floors/{floorId}/plan
Content-Type: multipart/form-data

form-data:
  file: <image_file.jpg>
  floor_number: "2"
  display_order: 2

Response: 200 OK
{
  "id": "floor_789",
  "floor_number": "2",
  "floor_plan_image_url": "https://s3.amazonaws.com/spare-it/.../floor_2.jpg",
  "floor_plan_width": 1920,
  "floor_plan_height": 1440
}
```

**Get Site with Full Details**
```
GET /api/admin/sites/{siteId}

Response: 200 OK
{
  "id": "site_456",
  "name": "Main Office Building",
  "address": "125 Summer Street, Boston, MA 02110",
  "occupancy_type": "office",
  "estimated_stations": 8,
  "floors": [
    {
      "id": "floor_1",
      "floor_number": "1",
      "floor_plan_image_url": "..."
    }
  ],
  "waste_streams": [
    {"id": "ws_1", "name": "Cardboard"},
    {"id": "ws_2", "name": "Compost"}
  ],
  "created_at": "2026-06-25T10:30:00Z"
}
```

**Define Waste Streams for Site**
```
POST /api/admin/sites/{siteId}/waste-streams

{
  "streams": [
    {"name": "Cardboard", "color_code": "#34A853"},
    {"name": "Compost", "color_code": "#FFD600"},
    {"name": "Mixed Recycling", "color_code": "#2563EB"}
  ]
}

Response: 201 Created
{
  "site_id": "site_456",
  "waste_streams": [
    {"id": "ws_1", "name": "Cardboard", "color_code": "#34A853"}
  ]
}
```

#### **Audits**

**Create Audit & Generate Auditor Link**
```
POST /api/admin/audits

{
  "site_id": "site_456",
  "auditor_email": "john.smith@customer.com",
  "auditor_name": "John Smith",
  "deadline": "2026-07-10T23:59:59Z",
  "audit_type": "baseline"
}

Response: 201 Created
{
  "id": "audit_abc",
  "site_id": "site_456",
  "status": "draft",
  "audit_link": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "expires_at": "2026-07-10T23:59:59Z",
    "auditor_link": "https://app.spare-it.com/audit?token=eyJ0eXAi..."
  },
  "created_at": "2026-06-25T10:30:00Z"
}
```
*Note: System auto-sends email to auditor_email with link*

**Get Audit Progress (Real-time)**
```
GET /api/admin/audits/{auditId}/progress

Response: 200 OK
{
  "audit_id": "audit_abc",
  "status": "in_progress",
  "started_at": "2026-06-25T11:00:00Z",
  "progress": {
    "floors_total": 2,
    "floors_in_progress": 2,
    "stations_pinned": 5,
    "stations_expected": 8,
    "photos_captured": 5,
    "percent_complete": 62.5
  },
  "timeline": [
    {
      "event": "audit_started",
      "timestamp": "2026-06-25T11:00:00Z"
    },
    {
      "event": "station_pinned",
      "timestamp": "2026-06-25T11:05:00Z",
      "floor": "1"
    }
  ]
}
```

**Get Completed Audit with Report**
```
GET /api/admin/audits/{auditId}

Response: 200 OK
{
  "id": "audit_abc",
  "site_id": "site_456",
  "status": "completed",
  "started_at": "2026-06-25T11:00:00Z",
  "completed_at": "2026-06-25T12:30:00Z",
  "auditor_name": "John Smith",
  "stations": [
    {
      "id": "station_1",
      "floor": "1",
      "station_letter": "A",
      "station_name": "Reception Area",
      "photo_url": "https://s3.amazonaws.com/...",
      "photo_timestamp": "2026-06-25T11:10:00Z",
      "waste_streams": ["Cardboard", "Compost"]
    }
  ],
  "report": {
    "id": "report_xyz",
    "report_url": "https://s3.amazonaws.com/.../audit_report.pdf",
    "generated_at": "2026-06-25T12:31:00Z"
  }
}
```

---

### Customer Portal API

**Get Customer's Sites**
```
GET /api/customer/sites

Authorization: Bearer {customer_jwt_token}

Response: 200 OK
{
  "sites": [
    {
      "id": "site_456",
      "name": "Main Office Building",
      "address": "125 Summer Street",
      "audit": {
        "id": "audit_abc",
        "status": "in_progress",
        "progress_percent": 62.5,
        "started_at": "2026-06-25T11:00:00Z",
        "deadline": "2026-07-10T23:59:59Z"
      }
    }
  ]
}
```

**Download Audit Report**
```
GET /api/customer/audits/{auditId}/report

Authorization: Bearer {customer_jwt_token}

Response: 200 OK
Content-Type: application/pdf

<binary PDF content>
```

**View Audit Photos Gallery**
```
GET /api/customer/audits/{auditId}/photos

Authorization: Bearer {customer_jwt_token}

Response: 200 OK
{
  "audit_id": "audit_abc",
  "photos": [
    {
      "id": "photo_1",
      "station_id": "station_1",
      "station_letter": "A",
      "floor": "1",
      "photo_url": "https://s3.amazonaws.com/...",
      "timestamp": "2026-06-25T11:10:00Z"
    }
  ]
}
```

---

### Site Audit App API

**Get Audit (via Token)**
```
GET /api/audit/{auditId}?token={auditToken}

Response: 200 OK
{
  "id": "audit_abc",
  "site": {
    "id": "site_456",
    "name": "Main Office Building",
    "address": "125 Summer Street"
  },
  "floors": [
    {
      "id": "floor_1",
      "floor_number": "1",
      "floor_plan_image_url": "https://s3.amazonaws.com/.../floor_1.jpg",
      "floor_plan_width": 1920,
      "floor_plan_height": 1440
    }
  ],
  "waste_streams": [
    {"id": "ws_1", "name": "Cardboard"},
    {"id": "ws_2", "name": "Compost"}
  ],
  "estimated_stations": 8
}
```

**Save Draft Audit Progress**
```
POST /api/audit/{auditId}/save-draft?token={auditToken}
Content-Type: application/json

{
  "stations": [
    {
      "id": "station_1",
      "floor_id": "floor_1",
      "station_letter": "A",
      "station_name": "Reception",
      "pin_x": 45.2,
      "pin_y": 62.8,
      "photo_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
      "location_notes": "QR code on left bin",
      "waste_streams": ["Cardboard", "Compost"]
    }
  ],
  "saved_at": "2026-06-25T12:00:00Z"
}

Response: 200 OK
{
  "audit_id": "audit_abc",
  "status": "draft",
  "last_saved": "2026-06-25T12:00:00Z"
}
```

**Submit Audit (Finalize)**
```
POST /api/audit/{auditId}/submit?token={auditToken}
Content-Type: application/json

{
  "stations": [
    {
      "id": "station_1",
      "floor_id": "floor_1",
      "station_letter": "A",
      "station_name": "Reception",
      "pin_x": 45.2,
      "pin_y": 62.8,
      "photo_base64": "data:image/jpeg;base64,...",
      "location_notes": "QR code on left bin",
      "waste_streams": ["Cardboard", "Compost"]
    }
  ],
  "auditor_name": "John Smith",
  "auditor_email": "john.smith@customer.com"
}

Response: 201 Created
{
  "audit_id": "audit_abc",
  "status": "submitted",
  "completed_at": "2026-06-25T12:30:00Z",
  "report_url": "https://s3.amazonaws.com/.../audit_report.pdf",
  "message": "Audit submitted! Report is being generated and will be sent to your account owner shortly."
}
```

**Upload Photo (Chunked for large images)**
```
POST /api/audit/{auditId}/upload-photo?token={auditToken}
Content-Type: multipart/form-data

form-data:
  file: <image.jpg>
  station_id: "station_1"
  chunk: 1
  total_chunks: 3

Response: 200 OK / 202 Accepted
{
  "status": "uploading",
  "progress": 33,
  "photo_id": "photo_1"
}
```

---

### Webhook Events (For Backend Integration)

**Audit Started**
```
POST {customer_webhook_url}
X-Signature: hmac_sha256(secret, payload)
Content-Type: application/json

{
  "event": "audit.started",
  "timestamp": "2026-06-25T11:00:00Z",
  "data": {
    "audit_id": "audit_abc",
    "site_id": "site_456",
    "auditor_email": "john.smith@customer.com"
  }
}
```

**Audit Submitted**
```
POST {customer_webhook_url}

{
  "event": "audit.submitted",
  "timestamp": "2026-06-25T12:30:00Z",
  "data": {
    "audit_id": "audit_abc",
    "site_id": "site_456",
    "total_stations": 8,
    "waste_streams_found": ["Cardboard", "Compost", "Mixed Recycling"],
    "report_url": "https://s3.amazonaws.com/.../audit_report.pdf"
  }
}
```

---

## Feature Roadmap

### MVP (Phase 1) — Launch
**Timeline:** 8-12 weeks

**Admin Portal**
- [ ] User authentication (Spare-it team)
- [ ] Create building (name, address, occupancy type)
- [ ] Upload floor plans (1+ per site)
- [ ] Define waste streams (per site)
- [ ] Create audit & generate auditor link
- [ ] View real-time audit progress (dashboard)
- [ ] View completed audits with photos
- [ ] Export audit data (JSON)
- [ ] Basic audit history (date, status, auditor)

**Customer Portal**
- [ ] User authentication (customer account owners)
- [ ] View assigned sites
- [ ] Real-time progress tracking (% complete)
- [ ] Download audit report (PDF)
- [ ] Photos gallery
- [ ] Email notifications (audit started, completed)

**Site Audit App**
- [ ] Unique token-based access (no login)
- [ ] View site details & pre-loaded floor plans
- [ ] Pin stations on floor plan (drag/click)
- [ ] Capture photos of QR codes (camera + upload)
- [ ] Select waste streams (checkbox list)
- [ ] Optional: location notes for QR code
- [ ] Save draft progress (localStorage + backend sync)
- [ ] Submit audit
- [ ] Confirmation screen
- [ ] Responsive design (mobile-first)

**Backend**
- [ ] REST API (endpoints above)
- [ ] JWT authentication
- [ ] Database (PostgreSQL schema above)
- [ ] Photo storage (S3 / Cloud Storage)
- [ ] Email service (notifications)
- [ ] Report generation (PDF, basic format)
- [ ] Real-time progress tracking via WebSocket or polling

**Monitoring & Ops**
- [ ] Audit completion reminders (email, automated)
- [ ] Error logging & alerting
- [ ] Performance monitoring (API response times, photo upload)

---

### Phase 2 (Post-MVP) — 3-6 Months
**Customer Enhancements**
- [ ] Account owner can invite team members (role-based access)
- [ ] Custom branding (customer logo, colors)
- [ ] Audit comparison (baseline vs. follow-up)
- [ ] Advanced filtering & sorting
- [ ] Data export (Excel, CSV)

**Audit App Enhancements**
- [ ] QR code scanning (auto-extract from photo)
- [ ] Multiple photos per station (carousel)
- [ ] Audio notes (transcribed to text)
- [ ] Offline-first mode (work without internet, sync on reconnect)
- [ ] Dark mode

**Admin Enhancements**
- [ ] Bulk site import (CSV)
- [ ] Scheduled audits (recurring)
- [ ] Audit assignment workflow (admin assigns auditor)
- [ ] Template management (reuse site setup)

**Analytics**
- [ ] Audit completion rate dashboard
- [ ] Average audit duration
- [ ] Waste stream distribution (per site)
- [ ] Photo quality metrics

---

### Phase 3 (Future) — 6+ Months
**Integration & Automation**
- [ ] Waste assessment tool integration (auto-create bins from audit)
- [ ] QR code generation & printing
- [ ] API for third-party integrations
- [ ] Zapier / Make.com connectors

**Mobile Native**
- [ ] iOS app (native)
- [ ] Android app (native)
- [ ] Offline-first with background sync

**Advanced Features**
- [ ] Computer vision (detect waste stream colors from photos)
- [ ] Real-time collaboration (multiple auditors on same site)
- [ ] Augmented reality (visualize bin placement on floor plan)
- [ ] Predictive analytics (forecast waste volumes based on station type)

---

### Nice-to-Have Ideas (Backlog)
- [ ] Multi-language support
- [ ] Accessibility improvements (WCAG 2.1 AA)
- [ ] Single sign-on (SAML / OAuth)
- [ ] Custom reports (drag-drop builder)
- [ ] Workflow automation (conditional notifications)
- [ ] Rate limiting & API quotas (if public API)
- [ ] Geofencing (require on-site to take photos)
- [ ] Barcode printing for stations
- [ ] Integration with Slack / Teams (audit alerts)
- [ ] Time-lapse visualization of audit progress
- [ ] Sustainability scorecard (waste diversion potential)

---

## Implementation Plan

### Tech Stack (MVP)

#### **Frontend (Site Audit App)**
```
Framework: React.js or Vue.js
State Management: Redux / Vuex
Mobile Framework: React Native (future) / PWA (MVP)
UI Components: Custom + Tailwind CSS
Map/Zoom: Hammer.js (gesture) + Custom canvas rendering
Storage: localStorage (draft) + IndexedDB (photos)
Build: Vite / Webpack
Testing: Jest + React Testing Library
```

#### **Frontend (Admin & Customer Portals)**
```
Framework: React.js
State Management: Redux / TanStack Query
UI Library: Material-UI / shadcn/ui
Charts/Analytics: Recharts / Chart.js
Build: Vite
Testing: Jest + React Testing Library
```

#### **Backend**
```
Runtime: Node.js (Express) or Python (FastAPI)
Database: PostgreSQL 14+
Cache: Redis (session, real-time progress)
Queue: Bull / RabbitMQ (async tasks: photo upload, report generation)
Storage: AWS S3 / Google Cloud Storage
Email: SendGrid / AWS SES
Auth: JWT (jsonwebtoken library)
ORM: Sequelize (Node) / SQLAlchemy (Python)
API Docs: OpenAPI/Swagger
Testing: Jest / Pytest
Deployment: Docker / Kubernetes
```

#### **Infrastructure**
```
Cloud Platform: AWS (or GCP / Azure)
Compute: EC2 / ECS / Lambda
Database: RDS (PostgreSQL)
Storage: S3 with CloudFront CDN
CDN: CloudFront
Monitoring: CloudWatch / Datadog
CI/CD: GitHub Actions / GitLab CI
Secrets: AWS Secrets Manager
```

---

### Phased Delivery (MVP)

**Week 1-2: Setup & Foundation**
- [ ] Set up repositories (frontend, backend, infrastructure)
- [ ] Database schema creation & migration pipeline
- [ ] Authentication system (JWT, token generation)
- [ ] CI/CD pipeline (GitHub Actions, Docker builds)

**Week 3-4: Admin Portal (MVP)**
- [ ] User login / authentication
- [ ] Create site (form, validation)
- [ ] Upload floor plans (S3 integration, image processing)
- [ ] Define waste streams
- [ ] Create audit & generate auditor link (email trigger)

**Week 5-6: Audit App (Core)**
- [ ] Fetch audit data (API)
- [ ] Display floor plans (responsive)
- [ ] Pin placement (click/drag, percentage-based)
- [ ] Photo capture & upload (camera API, S3)
- [ ] Waste stream selection

**Week 7-8: Audit App (Submission & Draft)**
- [ ] Save draft (localStorage + API)
- [ ] Submit audit (finalize)
- [ ] Confirmation screen
- [ ] Error handling & recovery

**Week 9-10: Report Generation & Customer Portal**
- [ ] Report generation (PDF, JSON)
- [ ] Customer authentication
- [ ] View sites & progress
- [ ] Download reports
- [ ] Photo gallery

**Week 11-12: Testing, Optimization, Launch**
- [ ] End-to-end testing
- [ ] Performance optimization (bundle size, API response times)
- [ ] Mobile responsiveness (iOS Safari, Android Chrome)
- [ ] Security audit (HTTPS, CORS, SQL injection prevention)
- [ ] Staging environment
- [ ] User documentation

---

### Dependencies & Critical Path

```
┌─────────────────────────────────────────────────────┐
│ Phase 1: Core Infrastructure (Week 1-2)             │
│ - Database, Auth, CI/CD                             │
├─────────────────────────────────────────────────────┤
│                        ↓                             │
│ ┌──────────────────────┬──────────────────────┐     │
│ │ Admin Portal (W3-4)  │ Audit App (W5-6)     │     │
│ │ - Create site        │ - Pin + Photo        │     │
│ │ - Upload floors      │ - Stream selection   │     │
│ └──────────┬───────────┴──────────┬───────────┘     │
│            │                      │                  │
│            ├──────────────────────┤                  │
│                        ↓                             │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Report & Customer Portal (W9-10)                │ │
│ │ - PDF generation, Customer dashboard            │ │
│ └──────────────────┬────────────────────────────┘ │
│                    ↓                               │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Testing & Launch (W11-12)                       │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Critical Dependencies:**
1. Database schema must be finalized before API development
2. Photo storage (S3) integration required before audit app UI
3. Email service required before audit link generation
4. Report generation template needed before customer portal

---

### Staffing Estimate (MVP)

| Role | Headcount | Weeks | Notes |
|------|-----------|-------|-------|
| Backend Engineer (API + Database) | 2 | 12 | Core infrastructure, schemas, endpoints |
| Frontend Engineer (Audit App) | 2 | 12 | Mobile-responsive, photo upload, UX |
| Frontend Engineer (Portals) | 1 | 12 | Admin & customer dashboards |
| DevOps / Infrastructure | 1 | 12 | CI/CD, deployment, monitoring |
| QA / Testing | 1 | 8 | Manual testing, automation framework |
| Product Manager | 0.5 | 12 | Specification, prioritization |
| **Total** | **7.5 FTE** | **12 weeks** | Can run in parallel |

---

### Success Criteria (MVP)

**Functional**
- [ ] Admin can create site + upload floor plans in <5 minutes
- [ ] Auditor can complete audit in <30 minutes per floor
- [ ] Report generated and delivered <1 minute after submission
- [ ] 100% of photos captured successfully (zero loss)
- [ ] All audit data persisted and recoverable

**Performance**
- [ ] API response time: <500ms (p95)
- [ ] Page load time: <2 seconds (3G, mobile)
- [ ] Photo upload: <5 seconds per photo (typical internet)
- [ ] Zero downtime during launch week

**Quality**
- [ ] Test coverage: >80% of critical paths
- [ ] Zero critical security issues (penetration test)
- [ ] Mobile responsiveness: works on iPhone 12+ and Android 10+
- [ ] Accessibility: WCAG 2.1 Level A compliance

**User Adoption**
- [ ] >90% auditors complete assigned audits
- [ ] <2% audit submission errors
- [ ] Customer satisfaction: >4/5 star rating

---

## Open Questions & Decision Points

### Architecture & Backend

**[DECISION] Backend Technology**
- **Options:** 
  - A) Node.js (Express) — Fast, JavaScript full-stack, good for real-time
  - B) Python (FastAPI) — Strong ML/analytics, data science friendly
  - C) Go — High performance, simple deployment
  - D) Cloud-native (serverless Lambda + API Gateway)
- **Recommendation:** Node.js or Python (depending on team expertise)
- **Impact:** Dev speed, operational complexity, scaling
- **Owner:** R&D Lead

**[DECISION] Real-Time Progress Updates**
- **Options:**
  - A) WebSocket (Socket.io) — Real-time, but more complex
  - B) Server-Sent Events (SSE) — Simpler, one-way
  - C) Polling (REST) — Simple, but higher latency
  - D) Hybrid (polling for MVP, WebSocket in Phase 2)
- **Recommendation:** Polling for MVP (simplicity), WebSocket in Phase 2
- **Impact:** Complexity, infrastructure cost, UX responsiveness
- **Owner:** Backend Lead

**[DECISION] Photo Storage & CDN**
- **Options:**
  - A) AWS S3 + CloudFront — Proven, secure, scalable
  - B) Google Cloud Storage + CDN — Similar, good integration
  - C) Azure Blob Storage — If already using Azure
  - D) Self-hosted (MinIO) — Cost savings, but ops burden
- **Recommendation:** AWS S3 (industry standard, good pricing)
- **Impact:** Cost, latency, compliance
- **Owner:** DevOps Lead

---

### Data & Privacy

**[DECISION] Data Residency & Compliance**
- **Question:** Are photos/audit data subject to GDPR, HIPAA, or other regulations?
- **Impact:** Encryption requirements, data retention, region-specific storage
- **Owner:** Legal / Compliance team

**[DECISION] Customer Data Ownership**
- **Question:** Can customers request data deletion? Audit trails?
- **Options:**
  - A) We own all data, customer has read access
  - B) Customer owns data, we provide access platform
  - C) Hybrid (customer owns content, we own metadata)
- **Impact:** Liability, compliance, data governance
- **Owner:** Legal / Product

---

### Link & Security

**[DECISION] Audit Link Expiration Model**
- **Options:**
  - A) Expires on audit submission (most restrictive)
  - B) Expires on deadline date (customer-set)
  - C) Expires after X days from creation (e.g., 30 days)
  - D) Never expires, manually revoked (least restrictive)
- **Recommendation:** Option B (customer-set deadline)
- **Impact:** Security posture, auditor convenience, compliance
- **Owner:** Security Lead

**[DECISION] Auditor Authentication**
- **Options:**
  - A) Token-only (no account, link expires)
  - B) One-time password (SMS/email)
  - C) Account creation (email + password)
  - D) SSO (customer's identity provider)
- **Recommendation:** Token-only for MVP (simplest), SSO in Phase 2
- **Impact:** Security, UX friction, integration complexity
- **Owner:** Security + Product

---

### Notifications

**[DECISION] Email Notification Service**
- **Options:**
  - A) SendGrid (transactional + marketing)
  - B) AWS SES (low cost, self-managed)
  - C) Mailgun (simple API)
  - D) In-house solution
- **Recommendation:** SendGrid (reliability, templates, analytics)
- **Impact:** Cost, deliverability, template management
- **Owner:** Backend Lead

**[DECISION] Push Notifications (Future)**
- **Question:** Scope for Phase 2?
- **Options:**
  - A) Email only (MVP)
  - B) Email + in-app banner (MVP)
  - C) Email + mobile push (Phase 2)
- **Recommendation:** Email + in-app banner for MVP
- **Impact:** Engagement, infrastructure complexity
- **Owner:** Product

---

### Reporting

**[DECISION] Report Format & Generation**
- **Options:**
  - A) PDF (static, shareable)
  - B) JSON (machine-readable, integrations)
  - C) HTML (interactive, branded)
  - D) Multi-format (PDF + JSON for API)
- **Recommendation:** PDF for MVP (simplicity), add JSON in Phase 2
- **Impact:** Compatibility, flexibility, generation time
- **Owner:** Backend Lead

**[DECISION] QR Code Generation**
- **Question:** Should audit app generate QR codes, or only capture them?
- **Current Plan:** Capture only (internal team generates QR codes for bins)
- **Future:** Auto-generate in Phase 2+
- **Owner:** Product

---

### Integration

**[DECISION] Waste Assessment Tool Handoff**
- **Question:** How does audit data flow to waste assessment system?
- **Options:**
  - A) Webhook (real-time push)
  - B) API polling (periodic fetch)
  - C) Manual export (admin downloads, uploads)
  - D) Shared database (direct access)
- **Recommendation:** Webhook for Phase 2 (after audit finalization)
- **Impact:** Integration complexity, real-time capability
- **Owner:** Integration Engineer + Waste Assessment Team

---

### Testing & Launch

**[DECISION] Launch Environment**
- **Options:**
  - A) Beta program (10-20 users, feedback loop)
  - B) Soft launch (limited customers, gradual rollout)
  - C) Hard launch (full production immediately)
  - D) Staged rollout (by region/customer segment)
- **Recommendation:** Beta program (reduce risk, gather feedback)
- **Impact:** Time-to-market, risk, data quality
- **Owner:** Product + Operations

---

### Platform & Tools

**[DECISION] Monitoring & Observability**
- **Options:**
  - A) Datadog (full-stack monitoring, expensive)
  - B) New Relic (similar to Datadog)
  - C) CloudWatch + X-Ray (AWS-native, lower cost)
  - D) Open-source (Prometheus + Grafana + ELK Stack)
- **Recommendation:** CloudWatch for MVP (simplicity), Datadog in Phase 2
- **Impact:** Cost, visibility, debugging capability
- **Owner:** DevOps Lead

---

## Appendix: Risk Mitigation

### High-Risk Items

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Photo upload failures (network) | Medium | High | Implement retry logic, local queue, offline support |
| Database schema mismatch | Low | High | Version migrations, staging environment testing |
| Audit link token expiration issues | Low | Medium | Clear documentation, grace period, re-send feature |
| Report generation timeout | Low | Medium | Async processing, email delivery fallback |
| Scaling to 1000+ concurrent audits | Low | High | Load testing week 11, database indexing, caching |
| Customer adoption (low audit completion) | Medium | High | UX testing, reminders, support process |

### Monitoring & Alerting

```
Critical Alerts:
  - API downtime (>5 min)
  - Photo upload failure rate >1%
  - Report generation failures
  - Database connection pool exhaustion
  - S3 access errors

Warning Alerts:
  - API response time >1s (p95)
  - Incomplete audits (draft state >48 hours)
  - Email delivery failure rate >0.1%
```

---

## Next Steps

1. **Clarify Decisions** — R&D lead reviews open questions, makes tech stack decisions
2. **Finalize Requirements** — Product team validates feature list, priorities
3. **Design Review** — Architecture review with full team, feedback incorporation
4. **Setup Repositories** — Create Git repos, CI/CD pipelines
5. **Begin Development** — Kick off Phase 1 (Week 1-2)

---

**Document Approval:**
- [ ] Product Manager
- [ ] R&D Lead
- [ ] Security Lead
- [ ] Operations Lead

**Last Updated:** June 25, 2026  
**Next Review:** Before Phase 2 kickoff
