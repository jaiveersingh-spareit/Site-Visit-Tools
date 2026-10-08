# 🔧 Code Hygiene Debug & Testing Guide

**Created:** May 6, 2026  
**Purpose:** Comprehensive debugging tools and checklists for verifying all pages and functionality

---

## 📚 What You Have

Three debugging tools have been created to help verify code quality and functionality:

### 1. **Code_Hygiene_Check.html** 🔍
**Purpose:** Automated structural analysis of the entire codebase

**What it checks:**
- All screens (s-home, s-floors, s-floor, s-station, s-gateway)
- All buttons and their handlers
- All form fields
- All modals and their triggers
- Function definitions
- Missing or undefined function references

**How to use:**
1. Open `Code_Hygiene_Check.html` in a web browser
2. Wait for analysis to complete (reads Spare-it_site_visit_form.html)
3. Review the report:
   - **Summary cards** show totals
   - **Landing Page section** validates required buttons and fields
   - **Modals section** shows all modals and their triggers
   - **Functions section** lists all defined functions
   - **Warnings/Errors section** highlights issues

**Key checks performed:**
- ✓ Screens exist and have content
- ✓ Landing page buttons (Stream Select, Take Photo, Choose File, Begin Site Visit)
- ✓ Form fields (Building, Date, Auditor, etc.)
- ✓ Modals (Stream Select, Validation, Export, Floor, etc.)
- ✓ Function references vs definitions

---

### 2. **Detailed_Hygiene_Checklist.md** ✅
**Purpose:** Comprehensive manual verification checklist

**Organized by:**
- Landing Page (s-home) - all fields and buttons
- Floors Page (s-floors) - navigation and controls
- Floor Detail (s-floor) - floor plan and stations
- Station Detail (s-station) - station management
- Gateway Detail (s-gateway) - gateway management
- Universal checks - navigation, persistence, offline, accessibility

**How to use:**
1. Open `Detailed_Hygiene_Checklist.md` in an editor or markdown viewer
2. Go through each section
3. Check off items as you verify them
4. Follow the **Testing Scenarios** section to test real workflows
5. Use **Known Issues** section to check for recently fixed bugs

**Key sections:**
- Form fields with validation requirements
- Button specifications and expected behavior
- Modal triggers and functionality
- Testing scenarios for common use cases
- Success criteria checklist

---

### 3. **Landing_Page_Debug.html** 🧪
**Purpose:** Interactive testing tool for the landing page specifically

**What it tests:**
- Form field existence and labels
- Button presence and handlers
- Modal structure and triggers
- Navigation system functionality

**How to use:**
1. Open `Landing_Page_Debug.html` in a web browser
2. The page will load with 5 test buttons:
   - **Test Form Fields** - Verifies all 6 form inputs exist with proper labels
   - **Test Buttons** - Checks all 5 main buttons are present with handlers
   - **Test Modals** - Validates modal existence and triggers
   - **Test Navigation** - Confirms screens and back buttons work
   - **Run All Tests** - Executes all tests at once

3. Review the results:
   - **✅ Passed Checks** (green) - Everything is working
   - **❌ Errors** (red) - Issues that need fixing
   - **⚠️ Warnings** (yellow) - Potential problems
   - **Summary** - Overall status

**Run this after code changes to ensure nothing broke.**

---

## 🎯 How to Use These Tools Together

### Step 1: Initial Analysis (5 minutes)
1. Open **Code_Hygiene_Check.html**
2. Review the Summary cards
3. Note any warnings or errors
4. Screenshot the results for reference

### Step 2: Manual Verification (10 minutes)
1. Open **Detailed_Hygiene_Checklist.md**
2. Go through the "Landing Page" section
3. Verify each checkbox:
   - Do form fields exist and have labels?
   - Do all 5 buttons exist?
   - Do all buttons have correct handlers?
   - Does the modal show up?

### Step 3: Interactive Testing (10 minutes)
1. Open **Landing_Page_Debug.html**
2. Click **Run All Tests**
3. Check results:
   - If all green ✅ → Code is clean
   - If yellow ⚠️ → Check the warning
   - If red ❌ → This is a bug that needs fixing

### Step 4: Real-World Testing (20 minutes)
Using the same checklist, manually test each scenario:

**Scenario A: Complete a visit**
1. Fill in: Building Name, Date, Auditor
2. Select: Waste Streams
3. Click: Begin Site Visit
4. Result: Should navigate to Floors page

**Scenario B: Incomplete submission**
1. Leave fields empty
2. Click: Begin Site Visit
3. Result: Should show validation modal with missing fields

**Scenario C: Add context photos**
1. Click: 📷 Take Photo
2. Result: Should open camera on mobile, file picker on desktop
3. Click: 🖼️ Choose File
4. Result: Should open file picker

**Scenario D: Stream selection**
1. Click: ⚙️ Select Waste Streams
2. Check: A few streams
3. Click: Confirm
4. Result: Modal closes, stays on page, shows selected streams

---

## 🐛 Common Issues to Check

### Issue: "Begin Site Visit button doesn't work"
**Check:**
1. Button exists with id="btn-start-visit" ✓
2. Event listeners attached (click + touchend) ✓
3. startVisit() function is defined ✓
4. Validation modal exists ✓
5. Try in browser console: `typeof startVisit` → should return "function"

**Fix:** If button isn't responding, check browser console for JavaScript errors

### Issue: "Validation modal doesn't appear"
**Check:**
1. modal-validation exists in HTML ✓
2. openModal() function is defined ✓
3. validation-errors-list div exists ✓
4. Try manually: `openModal('modal-validation')`

### Issue: "Form fields losing data"
**Check:**
1. persist() function is called after changes ✓
2. localStorage is enabled in browser ✓
3. LS variable is set to 'spare_site_v3' ✓
4. Check in browser: open DevTools → Application → localStorage

### Issue: "Photos not uploading"
**Check:**
1. context-photo-file input exists ✓
2. context-photo-camera input exists ✓
3. handleContextPhotoUpload() is defined ✓
4. FileReader API is supported in browser ✓

---

## 📊 Success Checklist

Before considering the code production-ready:

- [ ] Code_Hygiene_Check.html shows 0 errors
- [ ] Code_Hygiene_Check.html shows 0 warnings (or acceptable warnings)
- [ ] Landing_Page_Debug.html "Run All Tests" passes all checks
- [ ] Manual testing of all 4 scenarios passes
- [ ] No console errors in browser DevTools
- [ ] Button clicks responsive on mobile
- [ ] Form validation shows on-page modal (not alert)
- [ ] Data persists when page reloads
- [ ] All required fields marked with *
- [ ] All buttons have clear, actionable text

---

## 🚀 Next Steps After Debugging

1. **Fix any errors** found by the tools
2. **Re-run tests** to verify fixes
3. **Mobile device testing** on actual iPhone/Android
4. **User acceptance testing** with operations team
5. **Deploy to staging** for final validation
6. **Production release**

---

## 📝 Debug Output Examples

### ✅ Passing Test
```
✓ inp-building (REQUIRED)
Label present: Yes
Accessible in startVisit(): Yes
Validation check: Building name required
```

### ⚠️ Warning
```
⚠️ Modal has no triggers: Export Data
(modal-export)
```

### ❌ Error
```
✗ Button not found: Confirm Selection
Expected handler: confirmSelection()
```

---

## 🔗 File Locations

All debug files are in: `/Users/jaiveersingh/Documents/Claude/Projects/Site Visit Form/`

- `Spare-it_site_visit_form.html` - Main application
- `Code_Hygiene_Check.html` - Automated analysis tool
- `Landing_Page_Debug.html` - Interactive testing tool
- `Detailed_Hygiene_Checklist.md` - Manual checklist
- `DEBUG_GUIDE.md` - This file

---

**Tips:**
- Use these tools after every code change
- Share the output with the team for documentation
- Keep this guide handy during development
- Test on actual devices, not just browser

---

*Last Updated: May 6, 2026*
