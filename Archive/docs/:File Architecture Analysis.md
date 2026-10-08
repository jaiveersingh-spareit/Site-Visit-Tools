# Site Visit Form — File Architecture Analysis & System Intake Proposal

## CURRENT STATE

### Where Files Are Stored (Today)

| File Type | Current Location | Format | Problem |
|-----------|------------------|--------|---------|
| **Photos (all types)** | Browser localStorage | Base64 data URLs | Embedded in state object; not as separate files |
| **Marked-up floor plan** | Browser canvas element | Canvas drawing data | Converted to markupDataUrl (base64); stored in memory |
| **Metadata** | localStorage in object `S` | JavaScript object | Mixed with UI state; hard to parse |
| **Excel export** | Generated on-demand | XLSX (blob download) | Photos referenced by filename but not included as files |

### Current Export Workflow

```
User Data (in browser)
    ↓
exportCSV() or doExportExcel()
    ↓
Generate XLSX with photo filenames (e.g., "03_Station_F1_A_Photo1.jpg")
    ↓
Download XLSX to Downloads folder
    ↓
❌ Photos NOT included — only referenced by name
❌ Floor plan markup NOT exported
❌ Files scattered across Downloads — no folder structure
```

### Why This Is a Problem

1. **Photos are base64 strings, not files** — They can't be easily imported into your system
2. **No folder structure** — Files need to be organized for batch processing
3. **No standard naming/metadata** — Hard to match photos to database records
4. **Manual linking required** — Ops team has to manually attach images to records
5. **No floor plan images** — Marked-up floor plans don't get exported as actual images

---

## PROPOSED ARCHITECTURE (System-Ready)

### New Export Structure

```
Building_Name_2026-05-08_Export/
├── metadata.json                          (All structured data + file references)
├── site_visit_data.xlsx                   (Current export)
├── 01_Context_Photos/
│   ├── 01_Context_Overall_Building.jpg
│   ├── 01_Context_Dumpster_Area.jpg
│   └── manifest.json                      (Photo metadata + tags)
├── 02_Floor_Plans/
│   ├── Floor_1_Marked_Up.jpg              (Canvas screenshot with pins)
│   ├── Floor_2_Marked_Up.jpg
│   └── manifest.json                      (Pin coordinates, marked elements)
├── 03_Stations/
│   ├── F1_Station_A/
│   │   ├── Station_F1_A_Photo_1.jpg
│   │   ├── Station_F1_A_Photo_2.jpg
│   │   └── metadata.json                  (Station name, location, coordinates)
│   ├── F1_Station_B/
│   └── F2_Station_A/
├── 04_Gateways/
│   ├── F1_Gateway_GW1/
│   │   ├── Gateway_F1_GW1_Photo.jpg
│   │   └── metadata.json                  (Location, signal strength, notes)
│   └── F1_Gateway_GW2/
└── 05_Bins/
    └── manifest.json                      (Bin count, types, scales per station)
```

### metadata.json Structure

```json
{
  "export_info": {
    "building_name": "Building Name",
    "export_date": "2026-05-08",
    "export_time": "14:30:00",
    "app_version": "1.0.0",
    "auditor": "Name"
  },
  "building": {
    "name": "Building Name",
    "address": "123 Main St",
    "floors": [1, 2, 3]
  },
  "files": {
    "context_photos": [
      { "filename": "01_Context_Overall_Building.jpg", "description": "Overall", "tags": ["exterior"] },
      { "filename": "01_Context_Dumpster_Area.jpg", "description": "Dumpster area", "tags": ["waste"] }
    ],
    "floor_plans": [
      { "filename": "Floor_1_Marked_Up.jpg", "floor": 1, "pins_count": 4, "gateways_count": 2 },
      { "filename": "Floor_2_Marked_Up.jpg", "floor": 2, "pins_count": 3, "gateways_count": 1 }
    ],
    "stations": [
      {
        "id": "F1_A",
        "floor": 1,
        "letter": "A",
        "location": "North corner",
        "photos": ["Station_F1_A_Photo_1.jpg", "Station_F1_A_Photo_2.jpg"],
        "pin_position": { "x": 45.2, "y": 23.8 }
      }
    ],
    "gateways": [
      {
        "id": "GW1",
        "floor": 1,
        "label": "GW1",
        "location": "East wall",
        "photo": "Gateway_F1_GW1_Photo.jpg",
        "pin_position": { "x": 78.5, "y": 56.2 }
      }
    ]
  },
  "mapping": {
    "station_to_photos": { "F1_A": ["03_Stations/F1_Station_A/Station_F1_A_Photo_1.jpg"] },
    "gateway_to_photos": { "F1_GW1": ["04_Gateways/F1_Gateway_GW1/Gateway_F1_GW1_Photo.jpg"] },
    "floor_to_markup": { "1": "02_Floor_Plans/Floor_1_Marked_Up.jpg" }
  }
}
```

---

## TECHNICAL REQUIREMENTS FOR R&D TEAM

### Phase 1: Export File Generation (Priority 1)

**Objective:** Convert in-memory base64 photos + canvas markup into actual image files organized in structured folders

**What Needs to Happen:**

1. **Extract all photos from localStorage**
   - Decode base64 → PNG/JPEG
   - Organize by type (context, station, gateway, floor plan)

2. **Export marked-up floor plan**
   - Canvas element → screenshot/image (PNG)
   - Include pin positions and labels

3. **Create metadata.json**
   - Map all files to database IDs
   - Include pin coordinates (for visualization in desktop system)
   - Include photo descriptions and tags

4. **Package as ZIP**
   - Folder structure above
   - Include both Excel export + image files + metadata.json
   - File size limit: ~50MB (compress if needed)

**Deliverable:** Downloadable ZIP file with complete file structure ready for system intake

---

### Phase 2: System Intake Integration (Priority 2)

**For your backend/API team:**

1. **Webhook endpoint:** Accept ZIP upload with metadata.json
   - Parse metadata.json
   - Validate file references match actual files
   - Create database records linking photos to sites/floors/stations

2. **Photo storage strategy:**
   - Move images from ZIP to permanent storage (S3/GCS/local)
   - Store file paths in database
   - Index by (building_id, floor, station_id, photo_type)

3. **Floor plan markup processing:**
   - Store marked-up image in image gallery
   - Extract pin positions from metadata
   - Optionally run OCR/computer vision on photos for waste classification

**Database schema addition:**
```
SiteVisit {
  id, building_id, date, auditor, ...
  export_metadata_json,  // Full metadata.json stored for audit
  folder_path,           // Where ZIP was extracted
  status: ["pending_intake", "ingesting", "complete"]
}

Photo {
  id, site_visit_id, type: ["context"|"station"|"gateway"|"floor_plan"],
  filename, file_path, object_id: (station/gateway), floor,
  created_at
}

FloorPlanMarkup {
  floor_id, site_visit_id, image_path, pins_data: JSON (coordinates)
}
```

---

## IMPLEMENTATION ROADMAP

### NOW (v1.1)
- [ ] Extract base64 photos → actual image files in folders
- [ ] Export floor plan markup as PNG/JPG
- [ ] Generate metadata.json with all mappings
- [ ] Package as ZIP download

### NEXT (v1.2)
- [ ] UI option to upload ZIP directly to your system
- [ ] Progress tracking during upload
- [ ] Confirmation dashboard showing ingested data

### FUTURE (v2.0)
- [ ] Real-time sync to system (no ZIP needed)
- [ ] Photo auto-classification (waste type) via computer vision
- [ ] Direct floor plan visualization in your dashboard

---

## TECHNICAL QUESTIONS FOR R&D

1. **File size limits?** How big can a single ZIP be? (photos × site size)
2. **File format preference?** JPEG (smaller) or PNG (lossless)?
3. **Metadata storage?** Store metadata.json in database, or just use for parsing?
4. **Photo retention?** Keep originals in organized folder, or delete after processing?
5. **Floor plan pins?** Do you need exact pixel coordinates, or percentage-based (0-100%)?
6. **Naming convention:** Should we standardize filenames for your system (e.g., `{building_id}_{floor}_{type}_{datetime}.jpg`)?

