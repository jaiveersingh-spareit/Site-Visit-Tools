# Pin Coordinates - Verification Guide

## Verify Coordinates Are Saved

### Method 1: Check Console Logs (Easiest)

After clicking "Save Position", look for this log:

```
[SAVE_EDIT] ✓ Station coordinates updated: {
  pinX: 60.23,
  pinY: 42.15,
  name: "A",
  id: "station-1783009216569"
}
```

This confirms:
- ✅ Old coordinates replaced
- ✅ New coordinates stored in memory
- ✅ Station object updated
- ✅ Ready for localStorage save

---

### Method 2: Check localStorage (Most Reliable)

**Step 1: Open DevTools**
- Press `F12` or `Cmd+Option+I`

**Step 2: Go to Storage/Application Tab**
- Chrome/Firefox: DevTools → Application → LocalStorage
- Safari: DevTools → Storage → Local Storage

**Step 3: Find Your Domain**
- Look for: `file:///Users/jaiveersingh/Library/...`

**Step 4: Click `auditState`**
- You'll see the raw JSON data

**Step 5: Search for Your Station**
- `Ctrl+F` or `Cmd+F`
- Search for station name (e.g., "Kitchen")
- Look for `pinX` and `pinY` values

**Example localStorage entry:**
```json
{
  "id": "audit-1783009000000",
  "buildingName": "Capgemini Bellevue",
  "floors": [
    {
      "id": "floor-0",
      "name": "Floor 1",
      "stations": [
        {
          "id": "station-1783009216569",
          "name": "A",
          "pinX": 60.23,        // ← NEW COORDINATES SAVED
          "pinY": 42.15,        // ← NEW COORDINATES SAVED
          "updatedAt": "2026-07-02T15:30:45.123Z"
        }
      ]
    }
  ]
}
```

---

### Method 3: Verify on Page Reload

**Step 1: Edit a station's position**
- Move from (25%, 25%) to (60%, 40%)
- Click "Save Position"
- See: "✓ Station Position Updated" ✓

**Step 2: Note the coordinates**
- Look at console: `pinX: 60.23, pinY: 42.15`

**Step 3: Refresh page**
- Press `F5` or `Cmd+R`

**Step 4: Navigate back to floor**
- Open Floors screen
- Select Floor 1

**Step 5: Check pin position**
- Pin should be at exact same location (60%, 40%) ✓

**If pin is in same location after reload:**
- ✅ Coordinates were saved to localStorage
- ✅ Coordinates were retrieved on reload
- ✅ System working correctly

---

## What Gets Saved to localStorage

When you click "Save Position", the following happens:

```javascript
// 1. In-memory object updated
station.pinX = 60.23;        // Updated
station.pinY = 42.15;        // Updated
station.updatedAt = "2026-07-02T15:30:45.123Z";  // Timestamp added

// 2. saveState() called
localStorage.setItem('auditState', JSON.stringify(state.audit));

// 3. Console shows
[STORAGE] State saved (photos kept in memory)
```

---

## Complete Data Flow

```
User clicks "Edit Position"
         ↓
state.isEditPositionMode = true
state.editingStationId = "station-..."
state.stationPendingPlacement = {...old station...}
         ↓
User clicks new position (e.g., 60%, 40%)
         ↓
state.stationPendingPlacement.pinX = 60.23
state.stationPendingPlacement.pinY = 42.15
[CLICK logs show old vs new]
         ↓
User clicks "Save Position"
         ↓
[SAVE_EDIT] Old coordinates: {pinX: 25.00, pinY: 25.00}
[SAVE_EDIT] New coordinates: {pinX: 60.23, pinY: 42.15}
         ↓
station.pinX = 60.23     ← ACTUAL STATION OBJECT UPDATED
station.pinY = 42.15     ← ACTUAL STATION OBJECT UPDATED
         ↓
saveState()  ← Calls localStorage.setItem()
         ↓
[STORAGE] State saved (photos kept in memory)
         ↓
[SAVE_EDIT] ✓ Station coordinates updated: {
  pinX: 60.23,
  pinY: 42.15,
  name: "A",
  id: "station-..."
}
         ↓
renderFloorDetail()  ← Pin renders at new position
         ↓
User sees: "✓ A Position Updated" toast
Pin stays at (60%, 40%) on screen ✓
         ↓
[Optional] Refresh page
         ↓
loadState()  ← Retrieves from localStorage
Station still has: {pinX: 60.23, pinY: 42.15}
Pin renders at (60%, 40%) on screen ✓
SAVED!
```

---

## Troubleshooting

### "I don't see the exact coordinates in console"
The console shows `Object` instead of the values. This means the toFixed() call might be failing.

**Fix:** The updated code now shows exact values like `pinX: 60.23, pinY: 42.15`

**Try this:** Edit a position again and check console. You should now see:
```
[SAVE_EDIT] ✓ Station coordinates updated: {
  pinX: 60.23,
  pinY: 42.15,
  name: "A"
}
```

### "Coordinates aren't persisting after reload"
Check these in order:

1. **Console shows save completed?**
   - Look for: `[SAVE_EDIT] Complete`
   - Look for: `[STORAGE] State saved`
   - If not: Save didn't complete

2. **localStorage has the data?**
   - Open DevTools → LocalStorage
   - Search for your station name
   - Should see `pinX` and `pinY` values

3. **Coordinates persisted after reload?**
   - After reload, check pin position
   - Should be at new location
   - If not: loadState() might be failing

---

## Console Output - What to Look For

### Successful Save Sequence:
```
[CLICK] Floor plan clicked
[CLICK] isEditPositionMode: true
[CLICK] Click coordinates: {x: 60.23, y: 42.15}
[CLICK] Edit mode: Updating pending station with coordinates: {x: 60.23, y: 42.15}
[CLICK] Old pending position: {pinX: 25.00, pinY: 25.00}
[CLICK] New pending position: {pinX: 60.23, pinY: 42.15}
[RENDER] renderFloorDetail called for floor: Floor 1
[SAVE_EDIT] Starting save edit position
[SAVE_EDIT] stationPendingPlacement: {id: "station-...", ...}
[SAVE_EDIT] editingStationId: station-...
[SAVE_EDIT] Station found: A
[SAVE_EDIT] Old coordinates: {pinX: 25.00, pinY: 25.00}
[SAVE_EDIT] New coordinates: {pinX: 60.23, pinY: 42.15}
[SAVE_EDIT] ✓ Station coordinates updated: {pinX: 60.23, pinY: 42.15, name: "A", id: "station-..."}
[SAVE_EDIT] Calling saveState()...
[STORAGE] State saved (photos kept in memory)
[SAVE_EDIT] State saved successfully
[RENDER] renderFloorDetail called for floor: Floor 1
[SAVE_EDIT] Complete
✓ A Position Updated (toast message)
```

### If you see this, coordinates are saved! ✓

---

## Test Procedure

1. **Edit position** and click new location
2. **Immediately check console** - look for coordinates logged
3. **Click "Save Position"**
4. **Check console again** - look for `[SAVE_EDIT] ✓ Station coordinates updated`
5. **Check localStorage**
   - DevTools → Application → LocalStorage
   - Search for station name
   - Verify `pinX` and `pinY` match
6. **Reload page**
   - Pin should stay at new position
   - Open DevTools console before reload
   - After reload, station loads with new coordinates

---

## Files Updated

✅ Enhanced logging added to show exact coordinate values:
- `/Documents/Claude/Projects/Site Visit Form/site-visit-form-no-zoom.html`
- `/outputs/site-visit-form-no-zoom.html`

Now you'll see precise coordinates like `pinX: 60.23, pinY: 42.15` instead of `Object`.
