# Platform Integration Proposal - Site Visit Form

## Current State (MVP - Local Storage)

```
Mobile App
  ├─ Photos captured → compressed → stored in IndexedDB (local)
  ├─ Audit data → stored in localStorage (local)
  └─ Export → ZIP file (local device)
      └─ User manually sends/uploads to platform
```

**Limitations:**
- ❌ Photos only in device memory (limited to ~50MB IndexedDB)
- ❌ No backup across devices
- ❌ Manual export + upload workflow
- ❌ No real-time sync to operations team

---

## Proposed State: Platform Integration

```
Mobile App
  ├─ Photos captured → compressed
  ├─ SYNC: Upload compressed photos directly to Spare-it Platform
  │   └─ Real-time → photos appear in portal immediately
  ├─ Audit data uploaded → synced to platform
  │   └─ Real-time → data backed up securely
  └─ Operations Team
      └─ Access photos/data from platform portal (no ZIP download needed)
```

**Benefits:**
- ✅ Unlimited photo storage (backend)
- ✅ Real-time sync across devices
- ✅ Automatic backup to secure portal
- ✅ Operations team sees data immediately
- ✅ No manual export required
- ✅ Works offline (queue + sync when online)

---

## Technical Architecture

### Phase 1: Add Backend API Endpoint (3-5 days)

**What we need:**
```
POST /api/audit/upload-photo
Headers:
  - Authorization: Bearer {token}
  - Content-Type: application/octet-stream

Body:
  - file: compressed photo (650KB)
  - auditId: "audit-123"
  - floorIdx: 0
  - stationId: "station-456"
  - photoType: "context" | "bin"
  - timestamp: ISO string

Response:
  - success: true
  - photoId: "photo-789"
  - url: "https://platform.spare-it.com/photos/photo-789.jpg"
```

**Expected response time:** < 2 seconds per photo

---

### Phase 2: Update Mobile App (2-3 days)

**Changes:**
1. Add photo upload function (on photo capture)
2. Queue if offline, sync when online
3. Replace local IndexedDB backup with platform backup
4. Keep local cache for instant display

**New flow:**
```
User captures photo
  ↓
1. Display immediately (from local cache)
2. Queue for upload
3. Background: Upload to platform
4. On success: Mark as synced
5. If offline: Queue persists in IndexedDB
6. When online: Auto-sync queued photos
```

---

### Phase 3: Update Export (1 day)

**Instead of:**
- Generate local ZIP with photos

**Do:**
- Generate CSV + Excel with photo URLs (from platform)
- Send to operations@spare-it.com with links
- Operations team downloads from platform portal

---

## Data Flow Diagram

```
BEFORE (MVP):
┌─────────────────┐
│   Mobile App    │
│  IndexedDB      │ (local storage)
└────────┬────────┘
         │
         └─→ ZIP Download → Manual upload to platform

AFTER (Integrated):
┌─────────────────┐         ┌──────────────────┐
│   Mobile App    │◄───────→│ Platform Backend │
│  Local Cache    │ (sync)  │  S3/Cloud Store  │
└─────────────────┘         └────────┬─────────┘
                                     │
                                     └─→ Operations Portal
                                         (photos visible immediately)
```

---

## API Requirements

### 1. Photo Upload Endpoint
```
POST /api/audit/upload-photo

What mobile app needs:
- Accepts compressed JPEG (650KB)
- Returns unique photo ID
- Stores in S3 or cloud storage
- Generates secure URL for access
```

### 2. Audit Data Sync Endpoint
```
POST /api/audit/save

What mobile app needs:
- Accepts audit JSON (building, floors, stations, coordinates)
- Persists to database
- Returns confirmation
```

### 3. Offline Queue Handling
```
GET /api/audit/{auditId}/sync-status

What mobile app needs:
- Check if there are queued photos waiting to upload
- Resume upload if connection interrupted
```

---

## Implementation Timeline

| Phase | Task | Effort | Days |
|-------|------|--------|------|
| 1 | Design API endpoints | 2 hours | 0.5 |
| 1 | Build upload endpoint | 4 hours | 1 |
| 1 | Setup S3/cloud storage | 3 hours | 0.5 |
| 1 | Testing | 4 hours | 1 |
| 2 | Implement mobile upload | 4 hours | 1 |
| 2 | Add offline queuing | 4 hours | 1 |
| 2 | Integration testing | 4 hours | 1 |
| 3 | Update export format | 2 hours | 0.5 |
| **Total** | | | **6-7 days** |

---

## Benefits for Operations Team

### Before:
- Waits for auditor to export ZIP
- Downloads ZIP manually
- Extracts files manually
- Photos don't arrive until next day/week
- No way to check progress during audit

### After:
- Photos appear in portal **in real-time**
- Can see audit status **as it happens**
- No manual download/extract needed
- Can review during or immediately after site visit
- One source of truth (platform portal)

---

## Security Considerations

- ✅ Photos encrypted in transit (HTTPS)
- ✅ Photos encrypted at rest (S3 encryption)
- ✅ Access controlled via API token/auth
- ✅ Photo URLs time-limited (expire after 7 days)
- ✅ Audit trail (who accessed what photos, when)

---

## Cost Estimate

**Cloud Storage (S3 or equivalent):**
- 10 audits × 10 photos × 650KB = 65 MB/month
- Estimated cost: $1-2/month for storage + $0.5/month for transfer

**API Infrastructure:**
- Can run on existing backend (no new servers)
- Estimated cost: Included in existing infrastructure

---

## How to Present to Dev Team

### Opening:
*"We've successfully deployed a mobile site visit form with local storage. Now we want to integrate it with our existing platform to enable real-time syncing and eliminate manual export workflows."*

### The Ask:
*"We need three API endpoints:*
1. *Photo upload (with queueing for offline)*
2. *Audit data sync*
3. *Offline queue status check"*

*The benefit is that operations team can see audit data and photos in real-time, and auditors don't need to manually export/send files."*

### Timeline:
*"This is a 6-7 day effort. We'd benefit from starting next sprint."*

### Success Criteria:
- ✅ Photos upload in < 2 seconds
- ✅ Works offline (queues and syncs)
- ✅ Operations team sees data in real-time
- ✅ No more manual ZIP exports
- ✅ Backward compatible (old audits still work)

---

## Questions for Your Dev Team

1. **Backend infrastructure:** Can we add endpoints to existing API?
2. **Cloud storage:** Do we use S3, or do you have a preferred solution?
3. **Authentication:** How do we secure photo uploads? (API keys, OAuth, tokens?)
4. **Photo URLs:** Should photos be private (password-protected) or public (shareable)?
5. **Database:** Where should audit data be stored? (existing database or new?)

---

## Phase-Out Plan

**If this integrates successfully:**

Phase 1 (MVP - Current): ✅ Mobile form with local storage + ZIP export
Phase 2 (v1.1): Add platform sync + real-time portal
Phase 3 (v2.0): Deprecate ZIP exports, use platform portal exclusively

---

## Next Steps

1. Share this document with dev team
2. Set up meeting to discuss API requirements
3. Get commitment on 6-7 day timeline
4. Start Phase 1 next sprint
5. Migrate from local storage → platform integration

