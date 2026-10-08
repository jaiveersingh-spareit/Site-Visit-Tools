# Add Station Bug Report - currentPhotosTemp Initialization Error

## The Bug

**Line 1259** in `openAddStationModal()`:
```javascript
state.currentPhotosTemp = [];  // ← BUG: Initialized as ARRAY
```

**Line 1293-1296** in `openEditStationModal()`:
```javascript
state.currentPhotosTemp = {    // ← CORRECT: Initialized as OBJECT
  stationPhoto: station.photos.find(...),
  binPhotos: station.photos.filter(...)
};
```

**Then Line 1379** in `promptPhotoUpload()`:
```javascript
state.currentPhotosTemp.stationPhoto = {  // ← ERROR: Can't set property on array!
  dataUrl: ev.target.result,
  timestamp: new Date().toISOString()
};
```

---

## Why This Breaks

### When Adding a New Station:
1. `openAddStationModal()` sets: `state.currentPhotosTemp = []` (empty array)
2. User clicks "Upload Station Photo"
3. `promptPhotoUpload('station')` tries to execute:
   ```javascript
   state.currentPhotosTemp.stationPhoto = {...}
   ```
4. **ERROR**: You can't set `.stationPhoto` on an array!
5. Photo doesn't get stored
6. Validation fails (photo required)

### When Editing a Station:
1. `openEditStationModal()` sets: `state.currentPhotosTemp = { stationPhoto: ..., binPhotos: [...] }`
2. Photo operations work correctly ✓

---

## The Fix

### Change Line 1259 from:
```javascript
state.currentPhotosTemp = [];  // ❌ WRONG
```

### To:
```javascript
state.currentPhotosTemp = {    // ✅ CORRECT
  stationPhoto: null,
  binPhotos: []
};
```

---

## Complete Fixed Function

```javascript
function openAddStationModal() {
  state.isEditMode = false;
  state.editingStationId = null;
  state.currentStationId = 'temp-' + Date.now();
  
  // ✅ FIXED: Initialize as object, not array
  state.currentPhotosTemp = {
    stationPhoto: null,
    binPhotos: []
  };
  
  document.getElementById('station-name').value = '';
  document.getElementById('station-name-error').style.display = 'none';
  document.getElementById('station-photo-error').style.display = 'none';
  document.getElementById('station-streams-error').style.display = 'none';

  document.querySelector('#modal-station .modal-header h2').textContent = 'New Station';

  const photoItem = document.getElementById('station-photo-item');
  photoItem.innerHTML = '<span class="photo-item-label">Station</span><button class="photo-upload-btn" onclick="promptPhotoUpload(\'station\')">📷</button>';
  photoItem.classList.remove('filled');
  photoItem.style.backgroundImage = '';

  document.getElementById('bin-photo-grid').innerHTML = '';

  const streamGroup = document.getElementById('station-streams-group');
  streamGroup.innerHTML = state.audit.wasteStreams.map(stream => `
    <label class="checkbox-item">
      <input type="checkbox" name="station-stream" value="${stream}">
      <span>${stream}</span>
    </label>
  `).join('');

  document.getElementById('modal-station').classList.add('active');
}
```

---

## How to Fix

**Option 1: Quick Fix in Your File**

Edit `site-visit-form-no-zoom.html` Line 1259:

```diff
  function openAddStationModal() {
    state.isEditMode = false;
    state.editingStationId = null;
    state.currentStationId = 'temp-' + Date.now();
-   state.currentPhotosTemp = [];
+   state.currentPhotosTemp = {
+     stationPhoto: null,
+     binPhotos: []
+   };
```

**Option 2: Use the Fixed Version Below**

I'll provide the corrected HTML file with this fix applied.

---

## Verification

After fixing, you should be able to:
1. Click "+ Add" button
2. Enter station name
3. Click camera icon to add photo ✓ (photo will now upload successfully)
4. Photo appears in the modal ✓
5. Add bin photos ✓
6. Select waste streams ✓
7. Click "Save & Place" ✓
8. Place pin on floor plan ✓

Without this fix, adding a photo throws an error and the form doesn't work properly.
