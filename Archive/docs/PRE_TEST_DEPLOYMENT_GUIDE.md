# Pre-Test Deployment Guide - July 6-7 Testing

## Friday, July 5 - Setup Day

### Step 1: Verify HTML File is Ready
```bash
cd /Users/jaiveersingh/Documents/Claude/Projects/Site Visit Form/

# Confirm file exists
ls -lh site-visit-form-no-zoom.html

# Expected: ~200-250 KB file
# Contains: IndexedDB setup, photo compression, export functions
```

### Step 2: Clear Old Test Data
```bash
# On Mac, clear browser storage for next week's test
# This ensures we start fresh on Monday

# For Safari:
# Preferences → Advanced → Show Develop menu
# Then: Develop → Empty Caches (before Monday test)

# For Chrome:
# Settings → Privacy → Clear Browsing Data
```

### Step 3: Start Local Server (Monday Morning)
```bash
# Terminal session 1: Start server
cd /Users/jaiveersingh/Documents/Claude/Projects/Site Visit Form/
python3 -m http.server 8000

# Output: Serving HTTP on 0.0.0.0 port 8000
# Keep this running during entire test day
```

### Step 4: Get Server IP Address (Monday Morning)
```bash
# Terminal session 2: Get IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# Example output:
# inet 192.168.1.100 netmask 0xffffff00 broadcast 192.168.1.255

# Use this: http://192.168.1.100:8000/site-visit-form-no-zoom.html
```

### Step 5: Mobile Device Setup (Monday Morning)

**For iPhone:**
```
1. Settings → WiFi → Connect to your WiFi network
2. Open Safari
3. URL: http://192.168.1.100:8000/site-visit-form-no-zoom.html
4. Bookmark this page (Add to Home Screen)
```

**For Android:**
```
1. Settings → WiFi → Connect to your WiFi network
2. Open Chrome
3. URL: http://192.168.1.100:8000/site-visit-form-no-zoom.html
4. Add to Home Screen
```

### Step 6: Enable Remote Debugging (Monday Morning)

**iPhone Safari Debugging (from Mac):**
```
1. iPhone: Settings → Safari → Advanced → Web Inspector (ON)
2. Mac: Connect iPhone via USB
3. Mac: Safari → Develop → [your iPhone name]
4. Select page to debug
5. Web Inspector opens in new window
6. Can now see console.log output and storage
```

**Android Chrome Debugging (from Mac):**
```
1. Android: Enable Developer Options
   - Settings → About Phone → Build Number (tap 7x)
2. Android: Settings → Developer Options → USB Debugging (ON)
3. Mac: Connect Android via USB
4. Mac: Chrome → Settings → More Tools → Remote Devices
5. Allows monitoring of Android console
```

### Step 7: Test Checklist - Print This

Print or bookmark this for Monday:

```
MONDAY, JULY 6 - TEST CHECKLIST

Device Inventory:
☐ iPhone (iOS version: ___)
☐ iPhone Chrome installed
☐ Android phone (Android version: ___)
☐ Desktop browser (Firefox/Chrome)
☐ All devices on same WiFi

Pre-Test:
☐ Server running on desktop (http://localhost:8000)
☐ Server IP noted: _______________
☐ All browsers cleared cache
☐ Bookmark app URL on mobile devices

Test Sessions:
☐ Phase 1 (30 min): Mobile basics - all 3 browsers load
☐ Phase 2 (30 min): Floor plan upload - verify image isolation
☐ Phase 3 (45 min): Station & photo capture - 6-8 photos
☐ Phase 4 (30 min): Data persistence - close/reopen app
☐ Phase 5 (30 min): Export - desktop ZIP download
☐ LUNCH BREAK

Afternoon:
☐ Phase 6 (60 min): Complete mobile workflow - full audit
☐ Phase 7 (30 min): IndexedDB verification - DevTools check
☐ Phase 8 (30 min): Edge cases - network, orientation, volume

Documentation:
☐ Console.log output saved (take screenshots)
☐ Any errors noted with device/browser
☐ Performance observations noted
☐ Test results document created
```

---

## What the App Does (Refresher)

### Photo Storage Flow:
```
1. User captures photo on mobile
   ↓
2. Photos automatically compress (1.5MB → 650KB)
   ↓
3. Compressed photo saved to IndexedDB instantly
   ↓
4. Photo displayed in UI
   ↓
5. Every 2-3 minutes: Full audit backed up to IndexedDB
   ↓
6. If app closes: Photos recovered from IndexedDB on reload
   ↓
7. User exports: ZIP created with all photos from IndexedDB
```

### Export ZIP Contents:
```
audit_[id]_[date].zip
├── audit_[id]_site_visit_[date].csv       (pre-populated)
├── audit_[id]_site_visit_[date].xlsx      (formatted)
└── photos/
    ├── floor1/
    │   ├── stationA/
    │   │   ├── audit_123_Floor1_A_photo1.jpg
    │   │   └── audit_123_Floor1_A_photo2.jpg
    │   └── stationB/
    │       └── audit_123_Floor1_B_photo1.jpg
    └── floor2/
        └── stationA/
            └── audit_123_Floor2_A_photo1.jpg
```

---

## Expected Test Results

### Success Criteria:
- ✅ All 3 mobile browsers load without console errors
- ✅ Floor plans display and isolate per floor
- ✅ Photos compress (50%+ reduction visible in console)
- ✅ Photos backup to IndexedDB (logs visible in DevTools)
- ✅ Photos persist after app close/reopen
- ✅ Export creates proper ZIP with all files
- ✅ Device orientation changes handled
- ✅ Responsive UI on all screen sizes

### Console Logs to Expect:
```
[APP] Starting application...
[IDB] IndexedDB initialized
[EMAIL] EmailJS initialized (with warning if not configured)
[COMPRESS] Starting compression
[COMPRESS] 1.5 MB → 650 KB (57% reduction)
[IDB] Photo saved: photo_1783...
[IDB] Starting periodic backup every 2 minutes
[IDB] Recovered 10 photos (after app restart)
[EXPORT] Starting export...
[ZIP] Added CSV
[ZIP] Added Excel
[ZIP] Added 10 photos
[ZIP] Added floor plans
[ZIP] Created: 28.5 MB
```

---

## Troubleshooting Guide (If Issues Arise Monday)

### Issue: App Won't Load
**Check:**
- Server running? `ps aux | grep http.server`
- Correct IP? `ifconfig | grep inet`
- URL correct? `http://192.168.1.X:8000/site-visit-form-no-zoom.html`
- Try: Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Chrome)

### Issue: Photos Not Showing
**Check:**
- Console for `[COMPRESS]` error
- Is IndexedDB initialized? Look for `[IDB] IndexedDB initialized`
- Try: Clear Safari cache and reload

### Issue: Export ZIP Empty or Missing Photos
**Check:**
- Did you add photos to stations? (should show toast "✓ Photo saved")
- Are photos in IndexedDB? Check DevTools → Application → IndexedDB → AuditDB → photos
- Try: Export again, check Downloads folder

### Issue: "Storage 80% full" Warning
**Expected:** Normal if you add 12+ photos
**Check:** Delete test audits from localStorage and retry
**Not a failure:** Just means storage is used

### Issue: Lag/Freezing
**Check:**
- How many photos? (15+ might cause slight lag)
- Device available RAM? (Close other apps)
- This is tracked for optimization

---

## Data Cleanup After Testing

### Clear Test Data (After Monday Tests):
```bash
# On each mobile device, after testing:
# Safari: Settings → Safari → Clear History and Website Data
# Chrome: Settings → Privacy → Clear Browsing Data

# This removes test audit data before next week's testing
```

### Save Test Results:
```bash
# Keep these files for reference:
# MOBILE_TEST_RESULTS_JULY_6_7.md
# Console output screenshots
# Any error screenshots
```

---

## Success = Ready for Production

After all tests PASS on Monday/Tuesday:

1. **EmailJS Setup** (by July 10)
   - Create account: https://www.emailjs.com/
   - Add public key to EMAIL_CONFIG
   - Test email sending

2. **Final Verification** (by July 13)
   - Send test email to support@spare-it.com
   - Full end-to-end workflow test

3. **Deployment** (by July 15)
   - Deploy to production server
   - Brief operations team
   - Launch for auditors

---

## Notes for Monday

- Bring chargers for all devices
- Have coffee/water ready
- Plan for 4-5 hours of testing
- Document any findings in real-time
- Screenshots of any errors
- Console output saved

**You've got this! 🚀**

