# Site Visit Form - Export Architecture

## Export Data Structure

### CSV/Excel Format

**Columns:**
```
Building Name | Floor | Station | Coordinates | Pin X | Pin Y | Stream | Bin ID | Photo References
```

**Example Row:**
```
123 Building | Floor 1 | A | 30.58%, 29.83% | 30.58 | 29.83 | Trash | BIN-A-001 | audit_123_Floor1_A_context_20260702.jpg; audit_123_Floor1_A_bin_20260702.jpg
```

### ZIP File Structure
```
audit_123_2026-07-02.zip
├── audit_123_site_visit_2026-07-02.csv
├── audit_123_site_visit_2026-07-02.xlsx
└── photos/
    ├── floor1/
    │   ├── stationA/
    │   │   ├── audit_123_Floor1_A_context_20260702.jpg
    │   │   └── audit_123_Floor1_A_bin_20260702.jpg
    │   └── stationB/
    │       └── audit_123_Floor1_B_context_20260702.jpg
    └── floor2/
        └── stationA/
            └── audit_123_Floor2_A_context_20260702.jpg
```

---

## Photo Storage: Two Options Analysis

### **OPTION A: Local Storage (Current Approach)**

**How it works:**
- Photos stored in browser's localStorage during session
- Persisted when user clicks "Download ZIP"
- All photos included in ZIP export
- No external server needed

**Pros:**
- ✓ Works offline indefinitely
- ✓ No backend infrastructure needed
- ✓ Private (stays on user's device)
- ✓ Fast (local access)
- ✓ Easy to implement

**Cons:**
- ✗ localStorage has ~5-10MB limit per domain
- ✗ Photos lost if user clears browser cache
- ✗ Can't sync across devices
- ✗ Photos only available in ZIP after export

**Storage Math:**
- 1 high-res photo = ~500KB-2MB
- 3 stations × 2 photos = 6 photos
- 6 × 1MB average = 6MB (fits in localStorage)
- **Limit: ~5-8 photos per audit max**

**Best for:** Single-session audits, small building (~10 stations), immediate export

---

### **OPTION B: Backend Sync (Recommended for Production)**

**How it works:**
1. Photos upload to backend server as captured (or on demand)
2. Backend stores in S3/cloud storage
3. Export references server URLs instead of local files
4. ZIP contains CSV/Excel + photo metadata (not actual images)
5. Or: Export creates ZIP with photos downloaded from server

**Pros:**
- ✓ Unlimited photo storage
- ✓ Photos safe even if browser crashes
- ✓ Can sync across devices
- ✓ Photos available anytime (not just at export)
- ✓ Scalable for large audits (50+ stations)
- ✓ Better for team collaboration

**Cons:**
- ✗ Requires backend infrastructure (Node, S3, etc.)
- ✗ Needs API endpoints for photo upload/download
- ✗ Authentication/security setup required
- ✗ More complex implementation
- ✗ Dependency on network connectivity

**Implementation Effort:** 2-3 days

**Best for:** Enterprise deployments, multiple auditors, large buildings, compliance requirements

---

## Email Integration: Implementation Strategy

### **Current Flow (Manual Export)**
```
User completes audit
    ↓
User clicks "Download ZIP"
    ↓
ZIP created locally
    ↓
File downloads to user's device
    ↓
User manually emails to ops team
```

### **Proposed Flow (Auto-Email)**
```
User completes audit
    ↓
User clicks "Download ZIP" + "Email to Ops"
    ↓
Frontend creates ZIP
    ↓
Frontend sends to backend endpoint
    ↓
Backend:
  1. Receives ZIP
  2. Stores temporarily
  3. Sends email with ZIP attachment (or link)
  4. Deletes temporary copy
    ↓
Ops team receives email with attachments
```

### **Email Integration Requirements**

**Backend Endpoint Needed:**
```
POST /api/audit/export-email
{
  "auditId": "audit_123",
  "toEmail": "ops@spare-it.com",
  "zipFile": <binary data>
}
```

**Email Service Options:**
1. **SendGrid** - Easy setup, ~$20-100/month
2. **AWS SES** - Cheap, ~$0.10/1000 emails
3. **Gmail API** - Free but limited
4. **Postmark** - Developer-friendly

**Attachment Size Limit:**
- Most email services: 25MB max
- With photos: ~15MB ZIP fits safely
- **Limit: ~10-15 photos per export**

---

## Recommendations by Use Case

### **Scenario 1: MVP / Internal Testing** 
→ **Use OPTION A (Local Storage)**
- No backend needed
- Works offline
- Good for <10 stations
- Implementation: 1 day
- Add feature: "Email manually" button (opens mailto: with attachment)

### **Scenario 2: Production Ops Team Rollout**
→ **Use OPTION B (Backend Sync) + Email**
- Photos synced to S3
- Auto-email to ops team
- Supports any audit size
- Implementation: 3-5 days
- Pros: Reliable, scalable, enterprise-ready

### **Scenario 3: Hybrid (Best of Both)**
→ **OPTION A + Optional OPTION B**
- Default: Local storage (works offline)
- If available: Sync to backend for backup
- Falls back to local if sync fails
- Implementation: 2-3 days

---

## Recommended Path Forward

**Phase 1 (This Week):** 
- Implement local storage photo queuing
- Export CSV + Excel + ZIP with photos
- Manual email feature (mailto: link)
- **Why:** MVP ready, no backend dependency, works now

**Phase 2 (Next Sprint):**
- Add backend sync option
- Implement auto-email
- Add photo backup to S3
- **Why:** Production-ready, scales with ops team

---

## Current Data Flow (No Changes Needed)

```
User takes photo
  ↓
Photo stored in state.audit.floors[i].stations[j].photos[]
  ↓
On export:
  1. Extract all photos
  2. Rename per convention: audit_123_Floor1_A_context_date.jpg
  3. Create ZIP subfolder structure
  4. Add filenames to CSV/Excel
  5. Include ZIP in download
```

---

## Questions to Finalize Architecture

1. **For Phase 1 (MVP):**
   - Should we include photos directly in ZIP (larger file, simpler) or just references?
   - What's your max comfortable ZIP file size? (50MB? 100MB?)

2. **For Backend Sync (Phase 2):**
   - Do you have backend infrastructure already, or need recommendation?
   - What ops email address should receive auto-emails?
   - Should export trigger email automatically or have "Send Email" button?

3. **Photo Limits:**
   - What's realistic photo count per audit? (3 per station? 5?)
   - Any minimum photo requirements per station?

4. **Security:**
   - Should ZIP be password-protected?
   - Should email links be time-limited (expire after 7 days)?

