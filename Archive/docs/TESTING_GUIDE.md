# 📋 Testing Guide · Spare-it Site Visit Form

**Purpose:** Simple daily testing & hygiene verification before releases or site visits  
**Audience:** Operations team, QA, developers  
**Time:** 5-10 minutes per test

---

## Quick Start

### Open the Test Tool
1. **On Mac:** Double-click `DAILY_TEST.html` or drag to Chrome/Safari
2. **On iPhone:** Use the local server method or open via cloud link

### Run Tests
1. Set the **Test Date** (optional, defaults to today)
2. Click **▶ Run All Tests**
3. Wait 2-3 seconds for results
4. Review the **Score** and **Details**

### Interpret Results
- **100%** ✓ Green - Ready to deploy/use
- **80-99%** ◐ Yellow - Some issues, review details
- **Below 80%** ✗ Red - Critical issues, fix before use

---

## What Gets Tested

### 1️⃣ Hygiene & Code Health (6 checks)
✓ No JavaScript console errors  
✓ All buttons have onclick handlers  
✓ All functions properly defined  
✓ All modals exist and are linked  
✓ Browser storage (localStorage) working  
✓ Photo upload inputs accessible  

**When it fails:** Refresh the page, check browser console (F12), or contact dev team

---

### 2️⃣ Core Functionality (5 checks)
✓ Form fields (Building name, date, auditor) present  
✓ Button click handlers attached  
✓ Modal open/close system working  
✓ Form data saves and loads  
✓ Validation catches missing fields  

**When it fails:** Try hard refresh (Cmd+Shift+R), clear cache, or reload from server

---

### 3️⃣ Feature Phases (3 checks)
✓ **Phase 4:** HEIC photo support (iPhone compatibility)  
✓ **Phase 1:** Pin movement (long-press, drag to move)  
✓ **Phase 2:** Station selection modal (link existing stations)  

**When it fails:** These are newer features; ensure you're using the latest version

---

### 4️⃣ Mobile Optimization (4 checks)
✓ Touch targets are 48px minimum (easy to tap)  
✓ Touch action optimization (no double-tap zoom delay)  
✓ Viewport configuration (responsive design)  
✓ Checkbox sizing (20px for touch accuracy)  

**When it fails:** Mobile testing may not work; desktop version should be fine

---

## Folder Structure

```
Site Visit Form/
│
├── 🔴 MAIN APPLICATION
│   └── Spare-it_site_visit_form.html    (The actual form app)
│
├── 🧪 TESTING & DIAGNOSTICS
│   ├── DAILY_TEST.html                  (Interactive test dashboard)
│   └── TESTING_GUIDE.md                 (This file)
│
├── 📁 Development/                      (All process documentation)
│   ├── Sprint_Iteration_Log.md
│   ├── UX_Improvements_Summary.md
│   ├── UX_Flow_Pin_Management.md
│   ├── Phase1_PIN_Movement_Tests.md
│   ├── Phase2_Station_Modal_Tests.md
│   ├── Phase4_HEIC_Support_Tests.md
│   └── Testing_Execution_Checklist.md
│
└── 📁 Archive/                          (Old/reference files)
    ├── Debug_iPhone_Touch_Fix_May6.md
    └── [other legacy files]
```

### File Purposes

**Main App**
- `Spare-it_site_visit_form.html` - The working application. Edit this for features/fixes.

**Testing**
- `DAILY_TEST.html` - Run this before each deployment or site visit
- `TESTING_GUIDE.md` - You're reading it now!

**Development** (reference only)
- Sprint logs & process documentation
- Detailed test procedures for each phase
- UX design notes
- Keep for audit trail but don't edit frequently

**Archive**
- Legacy debug files and old versions
- Keep for reference, don't use

---

## When to Run Tests

### ✅ Always Run Before:
- **Deploying to production**
- **Starting a site visit with the ops team**
- **After any code changes**
- **Weekly hygiene check**

### Optional:
- **Daily** if in active development
- **After major updates** from dev team
- **When troubleshooting issues**

---

## Testing Workflow Example

### Scenario: Pre-Site-Visit Test (Next Tuesday)

**Step 1: Set up**
1. Open `DAILY_TEST.html`
2. Click date picker, select next Tuesday
3. Save this date

**Step 2: Run test**
1. Click **▶ Run All Tests**
2. Wait for results

**Step 3: Review**
- If 100%: You're good! Go ahead with site visit
- If <100%: Contact dev team, share the results
- Document any failures in Development/ folder

**Step 4: Save results**
- Screenshot the score (optional but helpful)
- Note the date tested in your records

---

## Troubleshooting

### Test Dashboard Won't Load
**Solution:**
1. Make sure you're opening `DAILY_TEST.html` not `Spare-it_site_visit_form.html`
2. Try dragging the file to Chrome instead of double-clicking
3. If on iPhone, use the local server method (see below)

### Buttons Say "Failed" But They Work
**Solution:**
1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)
2. On iPhone: Settings > Safari > Clear History and Website Data
3. Close browser completely and reopen

### "HEIC Support" Fails on Desktop
**This is normal.** HEIC is iPhone-specific. Test this on actual iPhone for accurate results.

### Many Tests Failing
**First:** Hard refresh your browser  
**Second:** Close and reopen the browser completely  
**Third:** Contact dev team with screenshot of results

---

## For Developers

### Adding New Tests
Edit `DAILY_TEST.html` in the JavaScript section:
1. Add function: `function checkMyFeature() { ... }`
2. Add to category: `results.push({ name: '...', passed: checkMyFeature(), details: '...' })`

### Test Data
Results are **not** saved automatically. Screenshot or take notes if you need a record.

### Automated Testing
To schedule tests automatically on specific dates, contact dev team about setting up automated test scheduling.

---

## Quick Reference Checklist

Before deploying or starting a site visit:

- [ ] Opened `DAILY_TEST.html`
- [ ] Set test date (or left as today)
- [ ] Clicked "Run All Tests"
- [ ] Score is 100% (or reviewed failures)
- [ ] Documented any issues
- [ ] Confirmed I'm using the right HTML file

---

## Questions?

**For technical issues:** Check Development/ folder for detailed phase test procedures  
**For feature questions:** Refer to UX_Improvements_Summary.md  
**For debugging:** See Debug files in Archive/  

---

**Last Updated:** May 8, 2026  
**Status:** Ready for daily use
