# Export Implementation Plan - EmailJS + Pre-Populated Data

## Current Data Available in State

All required information is already captured:

```javascript
state.audit = {
  id: "audit-123",
  buildingName: "123 Summer Street",           // ✓ Have it
  buildingAddress: "Boston MA 02110",          // ✓ Have it
  assessorName: "Jaiveer Singh",               // ✓ Have it
  wasteStreams: ["Trash", "Compost", "Recycling"], // ✓ Have it
  floors: [
    {
      name: "Floor 1",
      floorPlanImage: "data:image/jpeg;base64...", // ✓ Have it
      stations: [
        {
          name: "A",
          pinX: 30.58,
          pinY: 29.83,
          photos: [{id, type, dataUrl}, ...]
        }
      ]
    }
  ]
}
```

---

## Export File Structure

### CSV Header (Pre-Populated)
```
# BUILDING SUMMARY
# Building Name,123 Summer Street,Address,Boston MA 02110,Floors,2,Auditor,Jaiveer Singh
# Visit Date,2026-07-02,Waste Streams,"Trash, Compost, Mixed Recycling"
#
Building Name,Floor,Station,Pin X %,Pin Y %,Stream,Bin ID,Photo References
123 Summer Street,1,A,30.58,29.83,Trash,BIN-1-A-001,audit_123_Floor1_A_context_20260702.jpg; audit_123_Floor1_A_bin_20260702.jpg
...
```

### Excel Header Section (Pre-Populated)
```
Row 1: [Building Summary] [empty cells]
Row 2: Building Name | 123 Summer Street | Address | Boston MA 02110 | Floors | 2
Row 3: Auditor | Jaiveer Singh | Visit Date | 2026-07-02 | Waste Streams | Trash, Compost, Recycling
Row 4: [empty - spacing]
Row 5: [Column Headers] Building Name | Floor | Station | Pin X % | Pin Y % | Stream | Bin ID | Photo References
Row 6+: [Data rows...]
```

---

## Implementation Steps

### Step 1: Setup EmailJS (5 minutes)

**Install EmailJS:**
```html
<!-- Add to <head> in HTML file -->
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/build/index.min.js"></script>

<script>
  emailjs.init("YOUR_PUBLIC_KEY_HERE");
</script>
```

**Get Public Key:**
1. Go to https://www.emailjs.com/
2. Sign up (free)
3. Create service (Gmail/Outlook/Custom SMTP)
4. Create email template
5. Copy Public Key

---

### Step 2: Create Export Functions

#### 2A: Generate CSV with Headers
```javascript
function generateCSV() {
  const audit = state.audit;
  let csv = '';
  
  // Header section
  csv += `# BUILDING SUMMARY\n`;
  csv += `# Building Name,${audit.buildingName},Address,${audit.buildingAddress},Floors,${audit.floors.length},Auditor,${audit.assessorName}\n`;
  csv += `# Visit Date,${new Date().toISOString().split('T')[0]},Waste Streams,"${audit.wasteStreams.join(', ')}"\n`;
  csv += `#\n`;
  
  // Column headers
  csv += `Building Name,Floor,Station,Pin X %,Pin Y %,Stream,Bin ID,Photo References\n`;
  
  // Data rows
  audit.floors.forEach((floor, floorIdx) => {
    floor.stations.forEach(station => {
      const photoFilenames = station.photos
        .map((p, i) => `audit_${audit.id}_Floor${floorIdx + 1}_${station.name}_photo${i}_${Date.now()}.jpg`)
        .join('; ');
      
      audit.wasteStreams.forEach(stream => {
        const binId = `BIN-${floorIdx + 1}-${station.name}-${stream.charAt(0)}`;
        csv += `${audit.buildingName},${floor.name},${station.name},${station.pinX.toFixed(2)},${station.pinY.toFixed(2)},${stream},${binId},"${photoFilenames}"\n`;
      });
    });
  });
  
  return csv;
}
```

#### 2B: Generate Excel (using SheetJS)
```javascript
function generateExcel() {
  const audit = state.audit;
  const data = [];
  
  // Header section
  data.push(['BUILDING SUMMARY']);
  data.push(['Building Name', audit.buildingName, 'Address', audit.buildingAddress, 'Floors', audit.floors.length]);
  data.push(['Auditor', audit.assessorName, 'Visit Date', new Date().toISOString().split('T')[0], 'Waste Streams', audit.wasteStreams.join(', ')]);
  data.push([]); // Spacing
  
  // Column headers
  data.push(['Building Name', 'Floor', 'Station', 'Pin X %', 'Pin Y %', 'Stream', 'Bin ID', 'Photo References']);
  
  // Data rows
  audit.floors.forEach((floor, floorIdx) => {
    floor.stations.forEach(station => {
      const photoFilenames = station.photos
        .map((p, i) => `audit_${audit.id}_Floor${floorIdx + 1}_${station.name}_photo${i}_${Date.now()}.jpg`)
        .join('; ');
      
      audit.wasteStreams.forEach(stream => {
        const binId = `BIN-${floorIdx + 1}-${station.name}-${stream.charAt(0)}`;
        data.push([
          audit.buildingName,
          floor.name,
          station.name,
          station.pinX.toFixed(2),
          station.pinY.toFixed(2),
          stream,
          binId,
          photoFilenames
        ]);
      });
    });
  });
  
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Data");
  
  return workbook;
}
```

#### 2C: Create ZIP with Photos and Files
```javascript
async function createExportZip() {
  const audit = state.audit;
  const zip = new JSZip();
  const dateStamp = new Date().toISOString().split('T')[0];
  
  // Add CSV
  const csv = generateCSV();
  zip.file(`audit_${audit.id}_site_visit_${dateStamp}.csv`, csv);
  
  // Add Excel
  const excel = generateExcel();
  const excelData = await excel.write({ type: 'arraybuffer' });
  zip.file(`audit_${audit.id}_site_visit_${dateStamp}.xlsx`, excelData);
  
  // Add photos with folder structure
  audit.floors.forEach((floor, floorIdx) => {
    floor.stations.forEach(station => {
      station.photos.forEach((photo, photoIdx) => {
        const photoPath = `photos/floor${floorIdx + 1}/${station.name}/audit_${audit.id}_Floor${floorIdx + 1}_${station.name}_photo${photoIdx}_${Date.now()}.jpg`;
        const base64Data = photo.dataUrl.split(',')[1]; // Remove "data:image/jpeg;base64," prefix
        zip.file(photoPath, base64Data, { base64: true });
      });
    });
  });
  
  return zip;
}
```

#### 2D: Send Email with EmailJS
```javascript
async function sendExportEmail() {
  try {
    const zip = await createExportZip();
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Convert to base64 for email attachment
    const reader = new FileReader();
    reader.readAsDataURL(zipBlob);
    
    reader.onload = async () => {
      const params = {
        to_email: 'support@spare-it.com',
        building_name: state.audit.buildingName,
        auditor_name: state.audit.assessorName,
        export_date: new Date().toLocaleDateString(),
        audit_id: state.audit.id
      };
      
      // Send email
      await emailjs.send('SERVICE_ID', 'TEMPLATE_ID', params);
      
      // Download ZIP locally too
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_${state.audit.id}_${new Date().toISOString().split('T')[0]}.zip`;
      link.click();
      
      showToast('✓ Export sent to support@spare-it.com and downloaded');
    };
  } catch (error) {
    console.error('Export error:', error);
    showToast('❌ Export failed: ' + error.message);
  }
}
```

---

## Questions Before Implementation

### 1. **Bin ID Naming**
   - Should BIN ID be: `BIN-Floor-Station-Stream` (e.g., `BIN-1-A-T`)?
   - Or something else based on your ops workflow?

### 2. **Multiple Waste Streams per Station**
   - Currently, each station-stream combo gets a separate row
   - So Station A with 3 waste streams = 3 rows?
   - Or should each station appear once with multiple stream columns?

### 3. **Floor Plans in ZIP**
   - Should floor plan images be included in ZIP under `/floorplans/`?
   - Or just in memory and referenced separately?

### 4. **Photo Naming Detail**
   - Photo types: Should they be captured? (e.g., `context`, `bin`, `overall`)?
   - Or just generic: `photo1`, `photo2`?

### 5. **Export Button Location**
   - Where should "Export & Email" button appear?
   - On floor detail screen?
   - On review screen at end?
   - Both?

---

## Setup Checklist

- [ ] Sign up for EmailJS
- [ ] Create email service (Gmail)
- [ ] Create email template
- [ ] Get Public Key, Service ID, Template ID
- [ ] Add EmailJS library to HTML
- [ ] Answer 5 questions above
- [ ] Implement export functions
- [ ] Test with sample audit data
- [ ] Deploy

---

## Timeline

- **EmailJS Setup:** 10 minutes
- **Implement Export Functions:** 1-2 hours
- **Testing & Debugging:** 1 hour
- **Total:** 2-3 hours

Ready to proceed?

