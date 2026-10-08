# 🔬 Diagnostic Suite User Guide

**Purpose:** Detailed end-to-end testing with exportable results for developer analysis  
**When to use:** When issues arise, before/after fixes, pre-deployment verification  
**Time:** 5 minutes including export

---

## Quick Start

### Run Diagnostics
1. Open `DIAGNOSTIC_SUITE.html` in browser
2. (Optional) Enter a test name: "Pre-Site-Visit Test" or "After Hard Refresh"
3. Click **▶ Run Diagnostics**
4. Wait 2-3 seconds for results

### Share Results with Dev Team
1. Click **📄 Download JSON**
2. Email the JSON file to dev team

OR

1. Click **📋 Copy JSON**
2. Paste into email/message to dev team

---

## Understanding Results

### Score Interpretation
- **100%** ✓ Green - All systems working, ready to use
- **80-99%** ⚠️ Yellow - Minor issues, review details
- **50-79%** 🟠 Orange - Multiple failures, contact dev team
- **<50%** 🔴 Red - Critical issues, app likely non-functional

### Result Categories

**DOM Elements** - All required form fields, buttons, modals exist  
**Button Attributes** - onclick handlers are properly set  
**JavaScript Functions** - Required functions are defined and callable  
**Core Functions** - Modal system, data persistence working  
**CSS & Styling** - Mobile optimization CSS rules present  
**Data & Storage** - Browser storage accessible, data objects initialized  
**Features** - Advanced features (HEIC, pin movement) available

---

## When Results Show Failures

### If Button Checks Fail
**Likely cause:** Browser caching  
**Solution:**
1. Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. Clear cache (Settings → Safari/Chrome → Clear Data)
3. Close browser completely
4. Reopen and test again

### If DOM Checks Fail
**Likely cause:** App file corrupted or outdated  
**Solution:**
1. Verify you're opening the correct file: `Spare-it_site_visit_form.html`
2. Check the file size (~115KB)
3. If wrong file, start over with correct app

### If Function Checks Fail
**Likely cause:** JavaScript error preventing functions from loading  
**Solution:**
1. Open browser console (F12)
2. Check for red error messages
3. Share console screenshot with dev team

### If Multiple Checks Fail (Below 50%)
**Likely cause:** Fundamental app issue or wrong file  
**Solution:**
1. Screenshot the diagnostic results
2. Download and send JSON file
3. Share with dev team along with:
   - Device/browser (iPhone Safari, Android Chrome, etc.)
   - Any error messages from console
   - Steps you took before testing

---

## Exporting Results

### JSON Format
Results are saved as JSON with:
```json
{
  "timestamp": "2026-05-08T14:30:00Z",
  "testDate": "2026-05-08",
  "testName": "Pre-Site-Visit Test",
  "userAgent": "Mozilla/5.0...",
  "platform": "iPhone",
  "checks": [
    {
      "name": "Form Field: Building Name",
      "category": "DOM Elements",
      "status": "pass|fail|warning",
      "detail": "Description of what was checked",
      "error": "Error message if failed"
    }
  ],
  "summary": {
    "total": 25,
    "passed": 23,
    "failed": 2,
    "warnings": 0,
    "percentage": 92
  }
}
```

### Download Options
- **📄 Download JSON** - Save file to computer, share via email/cloud
- **📋 Copy JSON** - Copy all results to clipboard, paste into message
- **📂 Load Last Results** - Reload previous test without re-running

---

## Troubleshooting the Diagnostic Tool

### Tool Won't Load
**Solution:** Make sure you're opening `DIAGNOSTIC_SUITE.html` not `Spare-it_site_visit_form.html`

### Results Show "Not tested"
**Solution:** Click **▶ Run Diagnostics** button to start test

### Can't Export Results
**Solution:** 
1. Run test first (score must show)
2. Try refreshing page
3. Try Copy JSON instead of Download

### Browser Shows Console Error
**This is normal** - Don't worry about errors in the diagnostic tool itself. Focus on the test results it displays.

---

## For Developers Receiving Results

When a user sends you a JSON file from DIAGNOSTIC_SUITE:

1. **Open the JSON file** with a text editor or JSON viewer
2. **Check the `summary` section:**
   - What's the percentage score?
   - Which checks failed?

3. **Look at failed checks** in the `checks` array:
   ```json
   "status": "fail",
   "error": "Element #btn-start-visit not found"
   ```

4. **Match failures to code:**
   - "Element not found" = DOM issue (check HTML)
   - "onclick attribute missing" = HTML attribute issue
   - "function not defined" = JavaScript issue
   - "CSS rule not found" = Stylesheet issue

5. **Use `timestamp`, `userAgent`, `platform`** for context:
   - When was test run?
   - What device/browser?
   - Which OS?

---

## Typical Issues & Patterns

### Pattern 1: All Checks Pass (100%)
✓ App is working  
→ No action needed, safe to use

### Pattern 2: Button Checks Fail Only
Issue: Buttons not responding  
Cause: Missing onclick attributes or browser caching  
Fix: Hard refresh, clear cache, or update onclick attributes in HTML

### Pattern 3: Function Checks Fail
Issue: JavaScript functions not available  
Cause: Script error, wrong file version, or bad deployment  
Fix: Check console for errors, verify file integrity

### Pattern 4: Multiple Failures Across Categories
Issue: Fundamental app problem  
Cause: Corrupted file, major bug, wrong version deployed  
Fix: Restore backup, re-deploy clean version, contact dev

### Pattern 5: Feature Checks Fail (HEIC, Pin Movement)
Issue: Newer features not working  
Cause: Old version, missing libraries, feature not enabled  
Fix: Update to latest version, verify library loaded

---

## Best Practices

### ✅ DO:
- Run before major operations (site visits, deployments)
- Save results for records
- Test after code updates
- Share JSON files with dev team when issues arise
- Use consistent test dates for comparison

### ❌ DON'T:
- Ignore red failures (don't just use the app anyway)
- Test in private/incognito mode (disables localStorage)
- Re-run multiple times looking for different result (run once, act on result)
- Share screenshot of results (dev team prefers JSON for analysis)

---

## When to Contact Dev Team

**Share your diagnostic JSON file if:**
- Score is below 80%
- Any checks show as "fail" (red ✗)
- You've hard refreshed but issues persist
- Specific buttons or features not working
- You need to understand a failure reason

**Dev team will use JSON to:**
- Identify exactly which checks failed
- See error messages and details
- Understand your device/browser context
- Reproduce issue on their end
- Provide targeted fix

---

## Quick Reference Checklist

Before sending results to dev team:
- [ ] Ran DAILY_TEST.html and got results
- [ ] Hard refreshed browser (Cmd+Shift+R)
- [ ] Cleared cache if needed
- [ ] Re-ran diagnostic after refresh
- [ ] Downloaded or copied JSON results
- [ ] Ready to share with dev team

---

## Questions?

**"What does this error message mean?"**  
Look at the `error` field in the JSON. It describes what the check was looking for and why it failed.

**"My score is 92%, is that okay?"**  
Anything 80%+ is generally okay for basic use. Review the failed checks to understand what's not working.

**"Should I send this to dev team?"**  
If score is <100%, yes—send the JSON file.

**"How often should I test?"**  
Before each deployment, before important operations, or if you suspect issues.

---

**Last Updated:** May 8, 2026  
**Status:** Ready for production use
