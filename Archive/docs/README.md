# Spare-it Site Visit Form

**Status:** ✅ Production Ready  
**Last Updated:** May 8, 2026  
**Version:** 3.0 (Pin Movement, Station Linking, HEIC Support)

---

## 📱 What is This?

A mobile-optimized form for Spare-it operations team to record site visit information:
- Building details (name, address, contact info)
- Waste stream selection
- Floor plans with pin placement
- Photo documentation
- Offline support with sync queue

---

## 🚀 Quick Start

### Run the App
**Desktop/Local Server:**
```bash
cd "/Users/jaiveersingh/Documents/Claude/Projects/Site Visit Form"
python3 -m http.server 8000
# Then open: http://localhost:8000/Spare-it_site_visit_form.html
```

**iPhone (via local server):**
- Find Mac IP: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Open in Chrome: `http://[IP]:8000/Spare-it_site_visit_form.html`

**Cloud Link:**
- Upload to Google Drive / Dropbox and open in Chrome

---

## 📋 What's in This Folder?

### Essential Files
```
Spare-it_site_visit_form.html     ← THE APP (only file users interact with)
DAILY_TEST.html                   ← Hygiene & functionality testing tool
TESTING_GUIDE.md                  ← How to use the testing tool
```

### Reference Folders
```
Development/                      ← Sprint logs, design docs, test procedures
Archive/                          ← Old debug files (reference only)
```

---

## 🧪 Testing & Verification

### Before Each Deployment or Site Visit

1. **Open:** `DAILY_TEST.html` in your browser
2. **Set Date:** When you plan to use the form (optional)
3. **Run Tests:** Click "Run All Tests"
4. **Review Results:** 
   - ✓ 100% = Ready to go
   - ◐ 80-99% = Some issues, review details
   - ✗ Below 80% = Fix before use

**Time:** 5 minutes  
**Frequency:** Before each deployment, site visit, or weekly

---

## 🔍 What Gets Tested?

| Category | Checks | Details |
|----------|--------|---------|
| **Hygiene** | 6 checks | Errors, functions, modals, storage, buttons |
| **Functionality** | 5 checks | Form fields, handlers, data persistence |
| **Features** | 3 checks | HEIC photos, pin movement, station modal |
| **Mobile** | 4 checks | Touch targets, responsive design |

---

## 📁 Folder Structure

```
Site Visit Form/
│
├── 🟢 MAIN APPLICATION
│   ├── Spare-it_site_visit_form.html    (THE APP - deploy this)
│   ├── Spare-it_TESTING_VERSION.html    (Alternate test version)
│   │
├── 🧪 TESTING & DIAGNOSTICS
│   ├── DAILY_TEST.html                  (Quick test dashboard)
│   ├── TESTING_GUIDE.md                 (How to test)
│   ├── Code_Hygiene_Check.html          (Legacy - use DAILY_TEST instead)
│   ├── Full_System_Diagnostic.html      (Legacy - use DAILY_TEST instead)
│   ├── Landing_Page_Debug.html          (Legacy)
│   └── Progress_Tracker.html            (Legacy)
│
├── 📚 DEVELOPMENT (Reference Only - Don't Edit)
│   ├── Sprint_Iteration_Process_Log.md     (Process metrics & time tracking)
│   ├── UX_Improvements_Summary.md          (Feature overview)
│   ├── UX_Flow_Pin_Management.md           (Design documentation)
│   ├── Phase1_PIN_Movement_Tests.md        (Detailed test procedures)
│   ├── Phase2_Station_Modal_Tests.md       (Detailed test procedures)
│   ├── Phase4_HEIC_File_Support.md         (Detailed test procedures)
│   └── Testing_Execution_Checklist.md      (Step-by-step walkthrough)
│
├── 🗂️ ARCHIVE (Legacy Files - Reference Only)
│   ├── Debug_iPhone_Touch_Fix.md
│   ├── Fixes_Applied.md
│   └── [Other old debug files]
│
└── README.md                             (This file)
```

---

## 🎯 For Operations Team

### Using the Form
1. Open `Spare-it_site_visit_form.html` on phone (iOS or Android)
2. Fill in building details
3. Select waste streams (checkbox modal)
4. Take or upload photos
5. Add floors, pins, stations
6. Submit when complete
7. Sync photos if offline

### Testing Before Site Visits
1. **2 hours before:** Open `DAILY_TEST.html`
2. **Set date:** When you plan to do the visit
3. **Run tests:** Click button, wait 2 seconds
4. **Check results:** Should see 100% ✓
5. **If issues:** Screenshot and send to dev team

**Contact for Issues:** Include DAILY_TEST results screenshot

---

## 👨‍💻 For Developers

### File Structure
- **Main app:** `Spare-it_site_visit_form.html` (~2,400 lines)
  - Lines 1-200: CSS (colors, layouts, buttons, modals)
  - Lines 200-400: Pin movement & modal styling
  - Lines 900-1,300: Core data & initialization
  - Lines 1,300-2,000: UI rendering & event handlers
  - Lines 2,000-2,400: Advanced features (offline, sync)

### Making Changes
1. Edit `Spare-it_site_visit_form.html`
2. Test locally: `python3 -m http.server 8000`
3. Run `DAILY_TEST.html` to verify changes
4. Test on iPhone with local server
5. Commit changes with git

### Adding Features
Refer to `Development/` folder for:
- Design approach: `UX_Flow_PIN_MANAGEMENT_AND_FILES.md`
- Testing procedures: `Phase*.md` files
- Process documentation: `SPRINT_ITERATION_PROCESS_LOG.md`

### Legacy Files (Don't Use)
- `Code_Hygiene_Check.html` → Use `DAILY_TEST.html` instead
- `Full_System_Diagnostic.html` → Use `DAILY_TEST.html` instead
- Other `.html` diagnostic files → Reference only

---

## 📊 Features (Latest)

| Feature | Status | Details |
|---------|--------|---------|
| Building Info | ✅ | Name, address, contact, hauler |
| Waste Streams | ✅ | Checkbox selection with custom bins |
| Photos | ✅ | Upload from camera or file, HEIC support |
| Floors | ✅ | Upload floor plans, visual pin placement |
| **Pins** | ✅ | **New:** Long-press to move, drag, delete |
| **Station Link** | ✅ | **New:** Link to existing stations, prevent duplicates |
| Offline | ✅ | Works without internet, syncs when online |
| **HEIC** | ✅ | **New:** iPhone photos auto-convert to JPEG |
| Export | ✅ | Download site visit data as file |

---

## 🔧 Technical Stack

- **Frontend:** Vanilla JavaScript, CSS3, HTML5
- **Storage:** localStorage (client-side)
- **Mobile:** Responsive design, touch events
- **Libraries:** heic2any (HEIC conversion), SheetJS (export)
- **Browsers:** Chrome, Safari, Firefox, Edge (iOS and Android)

---

## 🐛 Common Issues & Solutions

### "Buttons don't work on iPhone"
**Solution:** Hard refresh (Cmd+Shift+R), clear cache  
**Root cause:** Browser cached old version

### "Photos don't show up"
**Solution:** Wait 2-3 seconds, refresh page  
**Cause:** File upload processing takes time

### "Form data disappeared"
**Solution:** Don't use private/incognito mode  
**Cause:** localStorage disabled in private browsing

### "Test dashboard shows failures"
**Solution:** 
1. Hard refresh browser
2. Close and reopen browser completely
3. Contact dev team with screenshot

---

## 📈 Usage Metrics

**Tracked in Development folder:**
- Implementation time per phase
- Code lines added/modified
- Testing coverage
- Browser compatibility
- Mobile optimization metrics

---

## 🔐 Security & Privacy

- **No server:** Data stays on device
- **No backend:** No cloud storage
- **No tracking:** No analytics
- **Offline capable:** Works without internet
- **Export only:** Manual data export when ready

---

## 📞 Support

**For Testing Issues:**
- See TESTING_GUIDE.md
- Check Development/ folder for detailed procedures

**For Feature Questions:**
- See UX_Improvements_Summary.md in Development/

**For Development:**
- See Sprint_Iteration_Process_Log.md in Development/

**For Bugs:**
1. Run DAILY_TEST.html
2. Screenshot results
3. Share with dev team
4. Include browser/device info

---

## ✅ Checklist for Launch

Before going live with any updates:

- [ ] Run DAILY_TEST.html - 100% score
- [ ] Test on iPhone Safari
- [ ] Test on iPhone Chrome
- [ ] Test on Android Chrome
- [ ] Test desktop versions (if used)
- [ ] Complete full workflow (start to finish)
- [ ] Check console for errors (F12)
- [ ] Verify offline functionality (turn off WiFi)
- [ ] Screenshot test results for records
- [ ] Update version number if major changes

---

## 📅 Deployment History

| Date | Version | Changes |
|------|---------|---------|
| May 8, 2026 | 3.0 | Pin movement, station linking, HEIC support, consolidated testing |
| May 6, 2026 | 2.5 | iPhone touch fixes, mobile optimization |
| Earlier | 1.0-2.0 | Core form, photos, floors, export |

---

**Questions?** Check the TESTING_GUIDE.md or Development/ folder  
**Ready to deploy?** Run DAILY_TEST.html first!
