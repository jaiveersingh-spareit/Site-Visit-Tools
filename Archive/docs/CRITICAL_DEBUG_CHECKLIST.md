# 🔴 CRITICAL DEBUG CHECKLIST

This document guides you through identifying the THREE blocking bugs.

---

## BUG #1: Begin Site Visit Button Not Responsive

### Step 1: Open the Form
1. Open `Spare-it_site_visit_form.html` in a web browser
2. Open **Developer Tools** (Press F12 or Cmd+Option+I on Mac)
3. Go to the **Console** tab

### Step 2: Check if Button Exists
In the browser console, type:
```javascript
document.getElementById('btn-start-visit')
```

**Expected Result:** Should show the button element like:
```
<button id="btn-start-visit" class="btn btn-primary">Begin Site Visit →</button>
```

**If you get `null`:** Button doesn't exist in the DOM - CRITICAL ERROR
**If you see the button:** Continue to Step 3

### Step 3: Check if Event Listeners Work
In the console, type:
```javascript
const btn = document.getElementById('btn-start-visit');
btn.click();
```

**Check the console** - you should see either:
- Error message: `[ERROR] Error in startVisit: ...`
- Or the validation modal should appear

**What to look for:**
- ✅ Validation modal pops up with missing field errors
- ❌ Nothing happens at all
- ❌ Console shows an error
- ❌ Page navigates away without validation

### Step 4: Test startVisit() Directly
Type in console:
```javascript
startVisit()
```

**Expected:** Same result as Step 3 (modal appears or error is shown)

**If this works but the button click doesn't:** Event listeners aren't attached properly

---

## BUG #2: Validation Modal Not Showing

### Step 1: Check if Modal Element Exists
In console:
```javascript
document.getElementById('modal-validation')
```

**Expected:** Should show the modal element
**If null:** Modal element is missing

### Step 2: Check if Error List Container Exists
In console:
```javascript
document.getElementById('validation-errors-list')
```

**Expected:** Should show a div element
**If null:** Error display container is missing

### Step 3: Manually Open Modal
In console:
```javascript
openModal('modal-validation')
```

**Expected:** A modal should slide up from the bottom of the screen showing "⚠️ Missing Required Fields"

**If modal doesn't appear:**
- Check CSS is loaded: `window.getComputedStyle(document.getElementById('modal-validation')).display` should be "flex"
- Check if `.open` class is being added: The function should work

### Step 4: Populate and Display Errors
In console:
```javascript
const list = document.getElementById('validation-errors-list');
list.innerHTML = '<div style="background:#FEF2F2; padding:12px; border-radius:6px;"><strong>🏢 Building Name</strong></div>';
openModal('modal-validation');
```

**Expected:** Modal appears with error message

**If this doesn't work:** CSS or DOM issue

---

## BUG #3: File Upload Buttons Not Working

### Step 1: Check if File Inputs Exist
In console:
```javascript
document.getElementById('context-photo-camera')
document.getElementById('context-photo-file')
```

**Expected:** Both should return input elements
**If null:** File inputs are missing

### Step 2: Check if Functions Exist
In console:
```javascript
typeof promptContextPhotoUpload
typeof promptContextPhotoFile
typeof handleContextPhotoUpload
```

**Expected:** All should return "function"
**If undefined:** Functions aren't defined

### Step 3: Test Clicking File Input
In console:
```javascript
const input = document.getElementById('context-photo-file');
input.value = '';
input.click();
```

**Expected:** File picker dialog should open

**If nothing happens:**
- Input might be disabled or hidden
- Browser might block automatic file picker opening
- Try: `console.log(input.style.display)` - should be "none" (hidden is OK)

### Step 4: Test Manual Button Click
On the landing page, locate and click the "🖼️ Choose File" button directly

**Expected:** File picker opens
**If nothing happens:** Onclick handler not working

---

## 🔍 NEXT STEPS

### If All Tests Pass:
The code is working correctly. The issue might be:
- Browser-specific (try Chrome/Firefox/Safari)
- Mobile vs Desktop
- Network/caching issue (hard refresh with Ctrl+Shift+R)

### If Any Test Fails:
Report which test failed and the exact result, and we can apply a targeted fix.

### Create Detailed Bug Report:
```
BUG #: [1/2/3]
TEST THAT FAILED: [Name from above]
RESULT: [What you saw in console]
BROWSER: [Chrome/Firefox/Safari/Mobile]
OS: [Windows/Mac/iOS/Android]
ERROR MESSAGE (if any): [Exact error text]
```

---

## 🔧 Quick Fixes to Try First

### If Button Doesn't Respond:
1. **Hard refresh:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Check console for errors:** Look for red error messages
3. **Check if button is disabled:** In console: `document.getElementById('btn-start-visit').disabled`

### If Modal Doesn't Show:
1. **Check CSS:** In console: `window.getComputedStyle(document.getElementById('modal-validation')).display`
2. **Check if .open class is added:** In console: `document.getElementById('modal-validation').classList`
3. **Try different browser:** Edge/Chrome/Firefox might behave differently

### If File Upload Doesn't Work:
1. **Check if input is hidden (OK):** `document.getElementById('context-photo-file').style.display` should be "none"
2. **Try right-clicking button:** See if there's a context menu
3. **Try in a different browser:** Some browsers block file dialogs

---

## 📝 Console Command Reference

Copy/paste these into the browser console to diagnose:

```javascript
// Check all critical elements
console.log('Button:', document.getElementById('btn-start-visit'));
console.log('Modal:', document.getElementById('modal-validation'));
console.log('Error List:', document.getElementById('validation-errors-list'));
console.log('Camera Input:', document.getElementById('context-photo-camera'));
console.log('File Input:', document.getElementById('context-photo-file'));

// Check all critical functions
console.log('startVisit:', typeof startVisit);
console.log('openModal:', typeof openModal);
console.log('closeModal:', typeof closeModal);
console.log('promptContextPhotoFile:', typeof promptContextPhotoFile);
console.log('handleContextPhotoUpload:', typeof handleContextPhotoUpload);

// Test button click
document.getElementById('btn-start-visit').click();

// Test file picker
document.getElementById('context-photo-file').click();

// Test modal
openModal('modal-validation');
closeModal('modal-validation');
```

---

**Last Updated: May 6, 2026**

When you test these steps, let me know exactly which step fails and what you see.
