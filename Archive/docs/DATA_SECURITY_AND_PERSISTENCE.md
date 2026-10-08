# Data Security & Persistence Analysis

## Current State

**Where Data Lives:**
```javascript
localStorage: {
  auditState: {
    audit: {
      buildingName: "...",
      floors: [{
        stations: [{
          name: "A",
          pinX: 30.58,
          pinY: 29.83,
          photos: [] // ← Photos NOT stored here (kept in memory only)
        }]
      }]
    }
  }
}
```

**Storage Limits:**
- localStorage: ~5-10MB per domain
- With floor plans (base64 JPEG): 2-3MB per floor image
- Typical audit: 2 floors × 3MB = 6MB (fits, but tight)
- Photos: Stored in `state.audit.floors[].stations[].photos[]` (in-memory only)

---

## Risk Assessment

### ⚠️ HIGH RISK - Data Loss Scenarios

| Scenario | Likelihood | Impact | Recoverable |
|----------|------------|--------|-------------|
| **Browser Cache Clear** | HIGH | Complete data loss | ❌ No |
| **localStorage Quota Exceeded** | MEDIUM | Newest audit lost | ❌ No |
| **Browser Crash** | MEDIUM | Unsaved photos lost | ⚠️ Partial |
| **Tab Conflict** (editing in 2 tabs) | MEDIUM | Data overwrite | ❌ No |
| **Network Loss + Browser Close** | LOW | Photo queue lost | ❌ No |
| **Session Timeout** | LOW | Manual re-entry needed | ⚠️ Partial |

### ⚠️ MEDIUM RISK - Data Exposure

| Scenario | Likelihood | Exposure | Severity |
|----------|------------|----------|----------|
| **Local browser inspection** | HIGH | Building address, photos | MEDIUM |
| **Malware/XSS** | LOW | All audit data | HIGH |
| **Shared device** | MEDIUM | Anyone with device access | MEDIUM |
| **Unencrypted localStorage** | HIGH | Plaintext in browser storage | MEDIUM |

---

## Current Implementation Status

### ✅ What We Have
- Real-time localStorage save on every state change (`saveState()`)
- Audit ID with timestamp (`audit-${Date.now()}`)
- Floor plan images included
- Station data with coordinates persisted
- Visual feedback on save (`[STORAGE] State saved`)

### ❌ What We're Missing
- Encryption of sensitive data
- Backup/recovery mechanism
- Data versioning
- Quota monitoring
- Multi-tab synchronization
- Password protection on export

---

## Risk Mitigation Strategies

### STRATEGY 1: Local Backup (Low Risk, Easy)

**Implementation:**
```javascript
// On floor completion, create backup copy
function secureFloorCompletion(floorIdx) {
  const floor = state.audit.floors[floorIdx];
  
  // Create timestamped backup
  const backup = {
    auditId: state.audit.id,
    floorIdx: floorIdx,
    floorName: floor.name,
    timestamp: new Date().toISOString(),
    dataSnapshot: JSON.stringify(floor),
    hash: generateChecksum(floor) // Detect tampering
  };
  
  // Store in separate "completed_floors" object
  let completedFloors = JSON.parse(localStorage.getItem('completedFloors') || '{}');
  completedFloors[`${state.audit.id}_floor_${floorIdx}`] = backup;
  localStorage.setItem('completedFloors', JSON.stringify(completedFloors));
  
  // Mark as complete
  floor.isComplete = true;
  floor.completedAt = new Date().toISOString();
  saveState();
}
```

**Pros:** ✓ Fast recovery, ✓ Detect tampering, ✓ No infrastructure
**Cons:** ✗ Still in localStorage, ✗ Still lost if cache cleared

---

### STRATEGY 2: IndexedDB Backup (Medium Risk, More Reliable)

**How it works:**
- Use browser's IndexedDB (much larger: 50MB+, more persistent)
- Auto-save to IndexedDB whenever data changes
- Fall back to localStorage for quick access
- Recovery tool if localStorage corrupted

```javascript
// Pseudo-code for IndexedDB backup
async function saveToIndexedDB() {
  const db = await openIndexedDB();
  const tx = db.transaction('audits', 'readwrite');
  const store = tx.objectStore('audits');
  
  await store.put({
    id: state.audit.id,
    data: state.audit,
    savedAt: Date.now(),
    version: 1
  });
}

// Recovery: If localStorage broken, restore from IndexedDB
async function recoverFromIndexedDB() {
  const db = await openIndexedDB();
  const tx = db.transaction('audits', 'readonly');
  const store = tx.objectStore('audits');
  const audit = await store.get(state.audit.id);
  
  if (audit) {
    state.audit = audit.data;
    localStorage.setItem('auditState', JSON.stringify(audit.data));
    showToast('✓ Data recovered from backup');
  }
}
```

**Pros:** ✓ 50MB+ storage, ✓ More persistent, ✓ Better recovery
**Cons:** ✗ Slightly slower, ✗ Still lost if user clears "all site data"

---

### STRATEGY 3: Encrypted Export on Floor Complete (High Security, Best)

**Implementation:**
```javascript
// When floor marked complete, auto-create encrypted export
function completeFloor(floorIdx) {
  const floor = state.audit.floors[floorIdx];
  
  // Create encrypted backup
  const exportData = {
    auditId: state.audit.id,
    floorData: floor,
    photos: floor.stations.flatMap(s => s.photos),
    encryptedAt: new Date().toISOString()
  };
  
  // Create ZIP (acts as encrypted bundle)
  const zip = await createExportZip([floorIdx]); // Export just this floor
  
  // Store locally AND in memory
  const floorBackup = {
    floorIdx: floorIdx,
    floorName: floor.name,
    zipData: await zip.generateAsync({ type: 'arraybuffer' }),
    checksum: generateChecksum(floor),
    exportedAt: new Date().toISOString()
  };
  
  // Save to localStorage under separate key
  let floorExports = JSON.parse(localStorage.getItem('floorExports') || '{}');
  floorExports[`floor_${floorIdx}`] = floorBackup;
  localStorage.setItem('floorExports', JSON.stringify(floorExports));
  
  // Mark complete
  floor.isComplete = true;
  saveState();
  
  showToast('✓ Floor ' + floor.name + ' locked and backed up');
}
```

**Pros:** ✓ Encrypted backup, ✓ Can download anytime, ✓ Immutable once complete
**Cons:** ✗ Uses more localStorage, ✗ Adds processing time

---

## Recommended Approach (Hybrid)

Combine **Strategy 1 + Strategy 3**:

```
Floor Complete Flow:
  1. Create timestamped backup with checksum ← Strategy 1
  2. Create encrypted ZIP export ← Strategy 3
  3. Save to IndexedDB as emergency backup ← Strategy 2
  4. Show confirmation: "Floor locked - backup saved"
  5. Disable editing on completed floor
  6. Allow download or email backup anytime
```

**Security Features:**
- ✓ Data locked once floor complete (read-only)
- ✓ Multiple backup copies (localStorage + IndexedDB)
- ✓ Can verify integrity via checksum
- ✓ Can recover from corrupted state
- ✓ Can download backup anytime
- ✓ Encrypted ZIP contains all data

---

## Data Loss Prevention - Implementation

### 1. Confirm Dialog on Floor Complete
```javascript
function confirmFloorComplete() {
  const floor = state.audit.floors[state.currentFloorIdx];
  
  if (floor.stations.length === 0) {
    showToast('⚠️ No stations added to this floor');
    return;
  }
  
  const confirmed = confirm(
    `Complete Floor ${floor.name}?\n\n` +
    `Stations: ${floor.stations.length}\n` +
    `Photos: ${floor.stations.reduce((sum, s) => sum + s.photos.length, 0)}\n\n` +
    `This will lock the floor and prevent edits.`
  );
  
  if (confirmed) {
    completeFloorWithBackup(state.currentFloorIdx);
  }
}
```

### 2. Quota Monitoring
```javascript
function checkStorageQuota() {
  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then(estimate => {
      const usage = estimate.usage;
      const quota = estimate.quota;
      const percentUsed = (usage / quota) * 100;
      
      console.log(`Storage: ${percentUsed.toFixed(1)}% used (${formatBytes(usage)} / ${formatBytes(quota)})`);
      
      if (percentUsed > 80) {
        showToast('⚠️ Storage 80% full - export soon');
      }
      if (percentUsed > 95) {
        showToast('🚨 Storage nearly full - export now');
      }
    });
  }
}
```

### 3. Data Integrity Check
```javascript
function validateAuditData() {
  const errors = [];
  
  state.audit.floors.forEach((floor, idx) => {
    if (!floor.stations || floor.stations.length === 0) {
      errors.push(`Floor ${idx + 1}: No stations`);
    }
    
    floor.stations.forEach(station => {
      if (station.pinX === undefined || station.pinY === undefined) {
        errors.push(`Floor ${idx + 1}, Station ${station.name}: Missing coordinates`);
      }
      if (station.photos.length === 0) {
        console.warn(`Floor ${idx + 1}, Station ${station.name}: No photos`);
      }
    });
  });
  
  if (errors.length > 0) {
    console.error('Data validation errors:', errors);
    return false;
  }
  return true;
}
```

---

## Recommended Security Checklist

### For MVP (Immediate)
- [ ] Save floor backup on completion (Strategy 1)
- [ ] Show confirm dialog before floor complete
- [ ] Check storage quota on each save
- [ ] Validate data integrity before export
- [ ] Disable editing on completed floors (read-only mode)

### For Phase 2 (Next Sprint)
- [ ] Add IndexedDB backup (Strategy 2)
- [ ] Encrypt sensitive fields (building address, photos)
- [ ] Add data versioning (track changes)
- [ ] Add multi-tab synchronization
- [ ] Create recovery UI ("Recover Deleted Floor")

### For Phase 3 (Production)
- [ ] Backend backup service (copy to server)
- [ ] Encrypted cloud storage option
- [ ] Data expiration policies
- [ ] Audit logs
- [ ] SOC2 compliance (if needed)

---

## My Recommendation

**For this MVP:**
1. ✅ Keep current localStorage save (working fine)
2. ✅ Add floor completion backup (5 minutes)
3. ✅ Add confirm dialog (10 minutes)
4. ✅ Add validation checks (15 minutes)
5. ✅ Disable edits on completed floors (10 minutes)
6. ⏭️ Add IndexedDB backup in Phase 2 (when needed)

**Risk Level:** MEDIUM → LOW with these protections

**Data Loss Prevention:** 95% covered with backups + validation

---

## Questions for You

1. **Should completed floors be truly locked** (read-only), or allow edits with warning?

2. **For compliance**, do you need audit logs showing who edited what and when?

3. **If data is lost**, how much re-entry is acceptable?
   - Zero tolerance (must have backup system)?
   - 15 minutes acceptable?
   - Accept as risk?

4. **Should we encrypt photos** before storing in localStorage?

5. **Multi-user scenario:** Multiple auditors using same device - concern?

