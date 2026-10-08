# PHASE 9 IMPLEMENTATION PLAN — ZIP Export with Photo Storage Structure

## FINAL SPECIFICATION (Confirmed)

### ZIP Output Structure
```
125_Main_Street_2026-05-06_14-30-00.zip
└── Site Visits/
    └── 125 Main Street/
        ├── Context_Overall_2026-05-06_14-10-00.jpg
        ├── Context_Dumpster_2026-05-06_14-12-00.jpg
        ├── Floor 1/
        │   ├── Station_A_Bin_2026-05-06_14-32-45.jpg
        │   ├── Station_A_Bin_2026-05-06_14-32-50.jpg
        │   ├── Station_B_Bin_2026-05-06_14-35-00.jpg
        │   ├── F1_Gateway_GW1_NorthWall_2026-05-06_14-33-20.jpg
        │   ├── F1_Display_D1_2026-05-06_14-34-15.jpg
        │   └── Floor_Plan_Markup_2026-05-06_15-00-00.jpg
        ├── Floor 2/
        │   ├── Station_C_Bin_2026-05-06_14-40-00.jpg
        │   ├── F2_Gateway_GW2_2026-05-06_14-41-00.jpg
        │   └── Floor_Plan_Markup_2026-05-06_15-05-00.jpg
        ├── site_visit_data.xlsx
        └── metadata.json
```

### Naming Conventions
| Photo Type | Format | Example |
|------------|--------|---------|
| **Context** | `Context_[Description]_[TIMESTAMP].jpg` | `Context_Overall_2026-05-06_14-10-00.jpg` |
| **Station Bin** | `Station_[LETTER]_Bin_[TIMESTAMP].jpg` | `Station_A_Bin_2026-05-06_14-32-45.jpg` |
| **Gateway** | `F[FLOOR]_Gateway_[ID]_[LOCATION]_[TIMESTAMP].jpg` | `F1_Gateway_GW1_NorthWall_2026-05-06_14-33-20.jpg` |
| **Display** | `F[FLOOR]_Display_[ID]_[TIMESTAMP].jpg` | `F1_Display_D1_2026-05-06_14-34-15.jpg` |
| **Floor Plan Markup** | `Floor_Plan_Markup_[TIMESTAMP].jpg` | `Floor_Plan_Markup_2026-05-06_15-00-00.jpg` |

---

## CURRENT STATE ANALYSIS

### Where Photos Are Currently Stored

| Photo Type | HTML Location | Data Structure | Format |
|------------|---------------|-----------------|--------|
| **Context Photos** | `S.contextPhotos` | Array of objects with `dataUrl`, `description` | Base64 data URL |
| **Station Photos** | `S.floors[].stations[].photos[]` | Array with `data` property | Base64 data URL |
| **Gateway Photos** | `S.floors[].gateways[].photoDataUrl` | Single photo per gateway | Base64 data URL |
| **Display Photos** | `S.floors[].displays[].photoDataUrl` | Single photo per display | Base64 data URL |
| **Floor Plan Markup** | `S.floors[].markupDataUrl` | Canvas drawing as data URL | Canvas data URL |

### Current Export (doExportExcel)
- Generates Excel with photo filenames but NO actual image files
- Photos never leave browser memory as base64 strings
- Floor plan markup never exported

---

## IMPLEMENTATION ROADMAP

### STEP 1: Create Photo Extraction & Encoding Functions

**Location:** Add to script section (after existing export functions, before `</script>`)

**What to build:**
```javascript
// Convert base64 data URL to Blob
function dataUrlToBlob(dataUrl) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}

// Generate timestamp in format YYYY-MM-DD_HH-MM-SS
function getTimestamp(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${m}-${d}_${h}-${min}-${s}`;
}
```

**Why:** Need to convert browser's base64 strings to actual file blobs that can go into ZIP

---

### STEP 2: Build Photo Collection Function

**Location:** New function `collectPhotosForZip()`

**What it does:**
```javascript
function collectPhotosForZip() {
  const photos = [];
  const baseTimestamp = getTimestamp();
  
  // 1. Context photos
  (S.contextPhotos || []).forEach((p, i) => {
    photos.push({
      path: `Context_${p.description || 'Photo_' + (i + 1)}_${baseTimestamp}.jpg`,
      blob: dataUrlToBlob(p.dataUrl),
      type: 'context'
    });
  });
  
  // 2. Floor-specific photos
  S.floors.forEach(f => {
    // Station photos (flat in floor folder)
    f.stations.forEach(st => {
      (st.photos || []).forEach((p, i) => {
        // Each photo gets unique timestamp (5 seconds apart)
        const photoTime = new Date(new Date(`${baseTimestamp.split('_')[0]}T${baseTimestamp.split('_')[1]}`.replace(/-/g, ':')));
        photoTime.setSeconds(photoTime.getSeconds() + (i * 5));
        const photoTs = getTimestamp(photoTime);
        
        photos.push({
          path: `Floor ${f.number}/Station_${st.letter}_Bin_${photoTs}.jpg`,
          blob: dataUrlToBlob(p.data),
          type: 'station'
        });
      });
    });
    
    // Gateway photos
    f.gateways.forEach(gw => {
      if (gw.photoDataUrl) {
        const photoTs = getTimestamp();
        photos.push({
          path: `Floor ${f.number}/F${f.number}_Gateway_${gw.label}_${gw.location || 'Unknown'}_${photoTs}.jpg`,
          blob: dataUrlToBlob(gw.photoDataUrl),
          type: 'gateway'
        });
      }
    });
    
    // Display photos
    f.displays.forEach(d => {
      if (d.photoDataUrl) {
        const photoTs = getTimestamp();
        photos.push({
          path: `Floor ${f.number}/F${f.number}_Display_${d.label}_${photoTs}.jpg`,
          blob: dataUrlToBlob(d.photoDataUrl),
          type: 'display'
        });
      }
    });
    
    // Floor plan markup
    if (f.markupDataUrl) {
      const photoTs = getTimestamp();
      photos.push({
        path: `Floor ${f.number}/Floor_Plan_Markup_${photoTs}.jpg`,
        blob: dataUrlToBlob(f.markupDataUrl),
        type: 'floor_plan'
      });
    }
  });
  
  return photos;
}
```

**Why:** Centralizes all photo extraction logic. Returns array of {path, blob, type} for ZIP creation.

---

### STEP 3: Create Metadata Generator

**Location:** New function `generateMetadataJson()`

**What it does:**
```javascript
function generateMetadataJson() {
  const metadata = {
    export_info: {
      building_name: S.building,
      address: S.address,
      export_date: new Date().toISOString(),
      auditor: S.auditor,
      app_version: '1.1.0'
    },
    building: {
      name: S.building,
      address: S.address,
      employees: S.employees,
      hauler: S.hauler,
      contact_notes: S.contactNotes
    },
    floors: S.floors.map(f => ({
      number: f.number,
      stations: f.stations.length,
      gateways: f.gateways.length,
      displays: f.displays.length,
      bins_total: f.stations.reduce((sum, st) => sum + (st.bins?.length || 0), 0)
    })),
    photo_count: collectPhotosForZip().length,
    file_structure: {
      context_photos: S.contextPhotos.length,
      station_photos: S.floors.reduce((sum, f) => 
        sum + f.stations.reduce((s, st) => s + (st.photos?.length || 0), 0), 0),
      gateway_photos: S.floors.reduce((sum, f) => 
        sum + f.gateways.filter(g => g.photoDataUrl).length, 0),
      display_photos: S.floors.reduce((sum, f) => 
        sum + f.displays.filter(d => d.photoDataUrl).length, 0),
      floor_plans: S.floors.filter(f => f.markupDataUrl).length
    }
  };
  
  return JSON.stringify(metadata, null, 2);
}
```

**Why:** Creates comprehensive manifest for system intake. Helps verify all files are present.

---

### STEP 4: Integrate JSZip Library

**Location:** HTML head section (before `</head>`)

**Add:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
```

**Why:** JSZip allows client-side ZIP file creation without server.

---

### STEP 5: Build ZIP Creation Function

**Location:** New function `buildAndDownloadZip()`

**What it does:**
```javascript
function buildAndDownloadZip() {
  if (!S.building) {
    alert('Building name required to export.');
    return;
  }
  
  const zip = new JSZip();
  const baseFolder = zip.folder(`Site Visits/${S.building}`);
  
  // 1. Add all photos
  const photos = collectPhotosForZip();
  photos.forEach(photo => {
    baseFolder.file(photo.path, photo.blob);
  });
  
  // 2. Add metadata.json
  const metadataJson = generateMetadataJson();
  baseFolder.file('metadata.json', metadataJson);
  
  // 3. Add current Excel export
  // (We'll regenerate and include it)
  // For now, assume Excel blob is available
  // This requires calling buildAndDownloadExcel() logic but returning blob instead
  
  // 4. Generate ZIP
  const timestamp = getTimestamp();
  const zipFilename = `${S.building.replace(/\s+/g, '_')}_${timestamp}.zip`;
  
  zip.generateAsync({ type: 'blob' }).then(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = zipFilename;
    a.click();
    URL.revokeObjectURL(url);
  }).catch(err => {
    console.error('ZIP generation failed:', err);
    alert('Error creating ZIP file: ' + err.message);
  });
}
```

**Why:** Uses JSZip to create in-browser ZIP file with all photos organized in folder structure.

---

## CODE MODIFICATIONS NEEDED

### File: `Spare-it_site_visit_form.html`

#### Change 1: Add JSZip Library
**Line:** Before `</head>` (around line 127)
```html
<!-- Add after other script tags -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
```

#### Change 2: Replace Export Button
**Current:** 
```html
<button class="btn btn-yellow" style="flex:1" onclick="openModal('modal-export')">⬇ Export</button>
```

**New:**
```html
<button class="btn btn-yellow" style="flex:1" onclick="doExportZip()">⬇ Export ZIP</button>
```

#### Change 3: Update Modal or Create New Export Function
**Option A:** Replace `doExportExcel()` with new `doExportZip()`
```javascript
function doExportZip() {
  if (!S.floors.length) {
    alert('No data to export yet.');
    return;
  }
  if (typeof JSZip === 'undefined') {
    alert('ZIP library not loaded. Check your connection and try again.');
    return;
  }
  buildAndDownloadZip();
}
```

#### Change 4: Add All New Functions
**After existing export functions** (around line 3200), add:
1. `dataUrlToBlob()`
2. `getTimestamp()`
3. `collectPhotosForZip()`
4. `generateMetadataJson()`
5. `buildAndDownloadZip()`
6. `doExportZip()`

---

## TESTING CHECKLIST

- [ ] **File Blob Conversion:** Test `dataUrlToBlob()` with sample base64 photo
- [ ] **Timestamp Generation:** Verify format `YYYY-MM-DD_HH-MM-SS` with multiple time zones
- [ ] **Photo Collection:** Check that all 5 photo types are collected
- [ ] **ZIP Creation:** Download ZIP and verify folder structure matches spec
- [ ] **Metadata.json:** Parse downloaded JSON, verify all counts match
- [ ] **Floor Organization:** Verify photos grouped correctly under Floor folders
- [ ] **Naming:** Check that file names match exact format (especially gateway/display with F#)
- [ ] **Performance:** Test with 10+ photos, verify ZIP download completes without lag
- [ ] **Edge Cases:**
  - Building with no photos
  - Multiple photos of same bin
  - Gateway/display without photos
  - Missing floor plan markup

---

## INTEGRATION WITH CURRENT EXCEL EXPORT

**Future enhancement:** The Excel export could be included in the ZIP. For now:
1. Users export ZIP (photos + metadata.json)
2. Users export Excel separately (keep existing button)
3. Next iteration: Include Excel in ZIP automatically

---

## DELIVERABLES

1. **ZIP file** with organized photo structure
2. **metadata.json** with complete file manifest
3. **Site visit data** ready for system intake
4. **No manual photo linking** required on backend

---

## TIMELINE

- **Phase 9a** (This sprint): ZIP export with photos
- **Phase 9b** (Next sprint): API endpoint to accept ZIP + parse metadata.json
- **Phase 9c** (Future): Real-time sync (remove ZIP, stream photos directly)

