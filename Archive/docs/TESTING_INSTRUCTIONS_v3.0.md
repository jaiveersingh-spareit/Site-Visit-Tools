# Version 3.0 Testing Instructions

**Test Phase Duration:** 2-3 hours recommended  
**Browsers:** Chrome (Desktop) → Phone (Safari/Chrome)  
**Test Date:** June 11-12, 2026

---

## 🚀 Quick Start

### Step 1: Open the File
**Desktop Testing:**
```
File: Spare-it_site_visit_form_v3.0_PRODUCTION.html
Method: Double-click to open in Chrome, OR
        Run: python3 -m http.server 8000
        Then open: http://localhost:8000/Spare-it_site_visit_form_v3.0_PRODUCTION.html
```

**Phone Testing:**
```
1. Get your Mac IP: ifconfig | grep "inet " (copy the IP address)
2. On phone: Open Safari/Chrome
3. Navigate to: http://[YOUR_MAC_IP]:8000/Spare-it_site_visit_form_v3.0_PRODUCTION.html
```

### Step 2: Open DevTools (for logging)
**Desktop Chrome:**
- Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- Click "Console" tab
- Look for `[PLAN TAP]`, `[RENDER PINS]`, `[ZOOM]` tags

**Phone Safari (iOS):**
- Open Develop menu (Preferences > Advanced → "Show Develop in menu bar")
- Safari → Develop → [Your Mac Name] → Select the tab
- Use remote inspector to view console

**Phone Chrome (Android):**
- Open Chrome on desktop and visit `chrome://inspect`
- Make sure phone Chrome is on same network
- Click "inspect" to see remote console

---

## ✅ Test Suite 1: Desktop Chrome (Full Workflow)

### Test 1.1: Start a Site Visit
**Steps:**
1. Click "Start Visit"
2. Enter: Building name, Address, Hauler, Date, Auditor
3. Select 2-3 waste streams (Cardboard, Compost, Trash)
4. Click "Continue to Floors"

**Expected Result:**
- ✅ Form validates (all fields required)
- ✅ Data saves to localStorage
- ✅ Floor list screen appears

**Log to Check:** `[CONFIRM PIN]` messages should not appear yet

---

### Test 1.2: Floor Plan Upload
**Steps:**
1. Click "Add Floor" or select existing floor
2. Upload a floor plan image (test with the 5840_Floorplan.jpg provided)
3. Observe the floor plan appears

**Expected Result:**
- ✅ Image loads and displays correctly
- ✅ Image fills the container
- ✅ No distortion or scaling issues

**Log to Check:** `[RENDER PINS]` should show floor dimensions

---

### Test 1.3: Pin Placement - Station Creation (NEW IN v3.0)
**Steps:**
1. Click "+ Add Pin"
2. Tap somewhere on the floor plan
3. A **green circle indicator** should appear exactly where you tapped
4. Click "Yes, looks good"
5. Select "Station"
6. Select bins for the station
7. Click "Create Station"
8. Choose "Position Now"
9. Tap on floor plan to position

**Expected Result:**
- ✅ Green indicator appears at tap location
- ✅ Indicator and pin are **perfectly aligned** (v3.0 fix)
- ✅ Station letter auto-generates (A, B, C, D...)
- ✅ Bins are properly configured

**Critical v3.0 Validation:**
- [ ] **Indicator and pin are at SAME location** (was broken in v2.5)
- [ ] Console shows: `[RENDER PINS] Station A: stored=(X.X%, Y.Y%) screen=(XXXpx, XXXpx)`

**Log to Check:**
```
[PLAN TAP] Pin placed at: {x: XX.XX%, y: YY.YY%}
[HIGHLIGHT] Highlight positioned: ...
[RENDER PINS] Station A: stored=(XX.XX%, YY.YY%) ...
```

---

### Test 1.4: Pin Placement - Gateway Creation (NEW IN v3.0)
**Steps:**
1. Click "+ Add Pin"
2. Tap on floor plan
3. Click "Yes, looks good"
4. Select "Gateway"
5. Enter location (e.g., "North Wall")
6. **Verify that label auto-generates** as "GW1" (THIS WAS BUG IN v2.5)
7. Click "Create Gateway"
8. Choose "Position Now"
9. Tap to position on floor plan

**Expected Result:**
- ✅ Gateway label **auto-generates as "GW1"** (v3.0 fix)
- ✅ Green indicator appears and matches pin location
- ✅ Gateway appears on floor plan with correct label

**Critical v3.0 Validation:**
- [ ] Gateway label auto-generates (was missing in v2.5)
- [ ] Indicator and pin perfectly aligned

---

### Test 1.5: Pin Placement - Display Creation (NEW IN v3.0)
**Steps:**
1. Click "+ Add Pin"
2. Tap on floor plan
3. Click "Yes, looks good"
4. Select "Display"
5. Enter location (e.g., "Main Entrance")
6. **Verify that label auto-generates** as "D1" (THIS WAS BUG IN v2.5)
7. Click "Create Display"
8. Choose "Position Now"
9. Tap to position on floor plan

**Expected Result:**
- ✅ Display label **auto-generates as "D1"** (v3.0 fix)
- ✅ Green indicator appears and matches pin location
- ✅ Display appears on floor plan with correct label

**Critical v3.0 Validation:**
- [ ] Display label auto-generates (was missing in v2.5)
- [ ] Indicator and pin perfectly aligned

---

### Test 1.6: Zoom Behavior (CRITICAL v3.0 FIX)
**Steps:**
1. Click "Zoom: 100%"
2. Zoom to 150%
3. Wait 2 seconds
4. Zoom to 175%
5. Wait 2 seconds
6. Zoom back to 100%
7. **Observe pins throughout**

**Expected Result:**
- ✅ Pins render instantly at every zoom level
- ✅ Pins do **NOT disappear** (was broken in v2.5)
- ✅ Stored coordinates remain identical across zoom levels
- ✅ No 47-second delay for pins to reappear

**Critical v3.0 Validation:**
- [ ] Pins visible at zoom 100%, 125%, 150%, 175%
- [ ] Pins visible **immediately after zoom** (no delay)
- [ ] Console shows: `[ZOOM] Cleared dimension cache to force recalculation`

**Log to Check:**
```
[ZOOM] Changing zoom level: {from: 1, to: 1.5}
[ZOOM] Cleared dimension cache to force recalculation
[RENDER PINS] Starting render at zoom 1.50 with dimensions: {...}
[RENDER PINS] Station A: stored=(25.3%, 33.5%) screen=(151px, 150px) visible=true
```

---

### Test 1.7: Scroll at Zoom 150% (CRITICAL v3.0 FIX)
**Steps:**
1. Zoom to 150%
2. Scroll the floor plan to the right (so pins move left)
3. Scroll back left
4. **Observe indicator visibility**
5. Try to place a new pin while scrolled right
6. **Verify green indicator appears**

**Expected Result:**
- ✅ Green indicator appears even when floor plan is scrolled
- ✅ Indicator follows the pin as you scroll
- ✅ Pin placement works at any scroll position
- ✅ Indicator is visible and clickable

**Critical v3.0 Validation:**
- [ ] Indicator visible when scrolled (was invisible in v2.5)
- [ ] Indicator stays aligned with pin while scrolling

**Log to Check:**
```
[HIGHLIGHT] Highlight positioned: {imagePercent: {x: 87.40, y: 49.04}, ...}
[HIGHLIGHT] Position: left=521.758px, top=219.57px
[RENDER PINS] Station C: stored=(87.4%, 49.0%) screen=(522px, 220px) visible=true
```

---

### Test 1.8: Export Functionality
**Steps:**
1. Create at least 2-3 stations/gateways/displays
2. Click "Export"
3. Choose format: CSV, Excel, or ZIP
4. Download file
5. **Open the exported file**
6. **Verify coordinates are present** (should show X%, Y% values)

**Expected Result:**
- ✅ Export file downloads successfully
- ✅ Coordinates are included (0-100% format)
- ✅ All object labels included
- ✅ No formatting errors

**Validation:**
- [ ] Check CSV: coordinates in correct columns
- [ ] Check Excel: data readable and formatted
- [ ] Check ZIP: JSON has correct structure

---

## ✅ Test Suite 2: Phone Testing (Safari & Chrome)

### Test 2.1: Basic Workflow on Phone
**Steps:**
1. Complete Steps 1.1-1.3 on phone
2. Tap on floor plan to place a station pin
3. Verify the **green indicator appears**
4. Confirm placement
5. Pin should render on floor plan

**Expected Result:**
- ✅ All interactions responsive
- ✅ Touch works reliably
- ✅ No lag or delays
- ✅ Indicator is visible and tap-able

---

### Test 2.2: Phone Zoom Behavior
**Steps:**
1. On phone, click "Zoom: 100%"
2. Use pinch gesture to zoom to 150% (or use zoom controls)
3. Wait 1 second
4. Zoom back to 100%

**Expected Result:**
- ✅ Pinch-zoom works smoothly
- ✅ Pins visible at all zoom levels
- ✅ No freezing or crashes

---

### Test 2.3: Phone Scroll with Zoomed Floor Plan
**Steps:**
1. Zoom to 150%
2. Try to scroll/pan the floor plan (swipe your finger)
3. Place a new pin while scrolled

**Expected Result:**
- ✅ Pan gesture works
- ✅ Indicator appears when scrolled (v3.0 fix)
- ✅ Touch is responsive

---

### Test 2.4: Phone Photo Upload
**Steps:**
1. On station/gateway/display, click "Add Photo"
2. Select camera or photo library
3. Take/select a photo
4. Verify it uploads

**Expected Result:**
- ✅ Photo selection works
- ✅ Photo preview shows
- ✅ No crashes
- ✅ HEIC auto-converts (if iPhone)

---

## 🐛 Bug Reports Format

If you find any issues, please document:

**Bug Report Template:**
```
Title: [Brief description]
Severity: Critical / High / Medium / Low

Device: [iPhone 12 / Chrome Desktop / Android Samsung]
Browser: [Safari / Chrome / Firefox]
OS: [iOS 16 / Windows 11 / Android 12]

Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected Result:
[What should happen]

Actual Result:
[What actually happened]

Screenshots/Video: [If possible]

Console Logs:
[Copy any red errors from F12 DevTools Console tab]
[Look for [ERROR] or [WARNING] tags]
```

---

## ✅ Sign-Off Checklist

**After completing all tests above, verify:**

### Desktop Chrome
- [ ] Pin placement works (indicator + pin aligned)
- [ ] Zoom works at all levels (1.0, 1.25, 1.5, 1.75)
- [ ] Zoom doesn't cause pins to disappear
- [ ] Scrolled floor plan allows pin placement
- [ ] Gateway label auto-generates ("GW1", "GW2"...)
- [ ] Display label auto-generates ("D1", "D2"...)
- [ ] Export files contain coordinates
- [ ] No console errors (check F12)

### Phone Safari
- [ ] Touch placement works
- [ ] Zoom works with pinch gesture
- [ ] Scroll/pan works
- [ ] Photo upload works
- [ ] No crashes or freezes

### Phone Chrome
- [ ] Touch placement works
- [ ] Zoom works
- [ ] Scroll/pan works
- [ ] Photo upload works

---

## 📞 Testing Support

**If you encounter issues:**
1. Check the console logs (F12 → Console tab)
2. Screenshot the screen + console errors
3. Note exact steps to reproduce
4. Share with development team

**Critical Tests (Must Pass):**
- ✅ Indicator and pin perfectly aligned (v3.0 fix)
- ✅ Gateway label auto-generates (v3.0 fix)
- ✅ Display label auto-generates (v3.0 fix)
- ✅ Pins visible after zoom (v3.0 fix)
- ✅ Indicator visible when scrolled (v3.0 fix)

---

## 🎉 When Testing is Complete

Once you've verified all tests pass, the application is **approved for production deployment** to the organization.

**Next Steps:**
1. Share test results with team
2. Brief operations team on new features
3. Deploy to production environment
4. Monitor field usage for any issues

