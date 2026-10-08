# Testing Guide: Stream Selection Modal Fix

## Pre-Test Checklist

- [ ] You have the updated HTML file (with the inp-employees fix)
- [ ] You have a modern web browser (Chrome, Firefox, Safari, Edge)
- [ ] You can access the Developer Tools (F12)
- [ ] You have about 5 minutes for testing

---

## Test 1: Browser Console - Verify No Init Errors

**Objective:** Confirm the initialization runs without errors

### Steps:
1. Open your **Spare-it_site_visit_form.html** file in a browser
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Look at the console output during page load

### Expected Results:
You should see initialization messages like:
```
[INIT] Initializing application...
[INIT] Set date input to today
[INIT] Loaded from localStorage: NO
[INIT] No previous session found, starting fresh
```

### What NOT to See:
- ❌ Red error messages about `inp-employees`
- ❌ `Cannot set property 'value' of null` errors
- ❌ Uncaught TypeError messages

**Status:** ✓ Pass / ✗ Fail (Report any errors)

---

## Test 2: Button Visibility and Clickability

**Objective:** Verify the "Select Waste Streams" button is visible and clickable

### Steps:
1. Look at the home screen (s-home)
2. Find the button labeled "⚙️ Select Waste Streams *"
3. It should be located below the "Building Name" input field
4. Click on it once

### Expected Results:
- Button is visible
- Button is not disabled (appears clickable)
- Button responds to click with some visual feedback

**Status:** ✓ Pass / ✗ Fail

---

## Test 3: Modal Opening - Console Monitoring

**Objective:** Verify the modal opens and the 'open' CSS class is applied

### Steps:
1. Keep the Console tab open from Test 1
2. Clear the console: `console.clear()`
3. Click the **"⚙️ Select Waste Streams"** button
4. Watch the console for log messages

### Expected Console Output:
```
openModal("modal-stream-select") called
Modal found: modal-stream-select
✓ Open class added to modal: modal-stream-select
Rendering stream selector...
```

### What NOT to See:
- ❌ `Modal not found: modal-stream-select`
- ❌ JavaScript errors (red text in console)
- ❌ Nothing at all (means the button click isn't being registered)

**Status:** ✓ Pass / ✗ Fail

---

## Test 4: Modal Visual Display

**Objective:** Verify the modal is visually displayed on the screen

### Steps:
1. With the console still open, click the "⚙️ Select Waste Streams" button
2. Look at the bottom of your screen
3. A modal should slide up from the bottom with:
   - Title: "Waste Streams in Building"
   - Subtitle: "Check each stream present, then select available scale sizes."
   - A list of checkboxes for different waste streams
   - Two buttons: "← Back" and "Continue →"

### Expected Results:
- Modal appears on screen
- Modal has smooth slide-up animation
- Modal content is visible and readable
- Buttons are clickable

### Visual Checklist:
- [ ] Modal background (semi-transparent dark overlay) is visible
- [ ] Modal sheet slides up from bottom
- [ ] All text is readable
- [ ] Checkboxes are visible and clickable
- [ ] Buttons are styled correctly

**Status:** ✓ Pass / ✗ Fail

---

## Test 5: Stream Selection and Confirmation

**Objective:** Verify the full stream selection workflow

### Steps:
1. Modal should still be open from Test 4
2. Check the boxes for at least 2 waste streams (e.g., "Trash", "Recycling")
3. Click the **"Continue →"** button
4. Observe what happens

### Expected Results:
- Modal closes
- A notification appears saying "✓ Saved" in the bottom-right corner
- The button text or appearance might update to show selected streams
- Console shows: `confirmStreamSelection()` execution

### What NOT to See:
- ❌ Modal stays open
- ❌ Error messages in console
- ❌ Selected streams not being saved

**Status:** ✓ Pass / ✗ Fail

---

## Test 6: Back Button and Reopening

**Objective:** Verify the Back button works and modal can be reopened

### Steps:
1. Click the "⚙️ Select Waste Streams" button again
2. Modal should open showing your previously selected streams (checkboxes checked)
3. Click the **"← Back"** button
4. Modal should close

### Expected Results:
- Modal opens with previously selected streams still checked
- Back button closes the modal
- No errors in console

**Status:** ✓ Pass / ✗ Fail

---

## Test 7: Session Persistence

**Objective:** Verify selected streams are saved to localStorage

### Steps:
1. Select some streams (if not already selected)
2. Close the browser tab or window
3. Close and reopen the browser
4. Navigate back to the HTML file
5. Click the "⚙️ Select Waste Streams" button
6. Check if your previously selected streams are still selected

### Expected Results:
- Modal opens
- Previously selected streams are still checked
- Form fields (Building Name, Hauler, etc.) are filled with previous values if they were filled

**Status:** ✓ Pass / ✗ Fail

---

## Test 8: Error Handling - Clear Session

**Objective:** Verify the clearSession function works without errors

### Steps:
1. Open the browser console (F12 → Console)
2. Type this command: `clearSession()`
3. Press Enter
4. Observe the console for any errors

### Expected Results:
- No errors appear
- Console shows successful execution
- Form fields are cleared
- No red error messages about missing elements

**Status:** ✓ Pass / ✗ Fail

---

## Test 9: Multiple Modal Interactions

**Objective:** Verify the modal system is stable with repeated interactions

### Steps:
1. Click "Select Waste Streams" - Modal opens
2. Click Back - Modal closes
3. Click "Select Waste Streams" again - Modal opens
4. Check some streams
5. Click Continue
6. Click "Select Waste Streams" again
7. Verify streams are still selected
8. Uncheck all streams
9. Try to click Continue

### Expected Results:
- Modal opens and closes smoothly every time
- No errors in console
- Modal behaves consistently
- Alert appears: "Please select at least one waste stream."

**Status:** ✓ Pass / ✗ Fail

---

## Summary Report

| Test | Status | Notes |
|------|--------|-------|
| Test 1: Init No Errors | ✓/✗ | |
| Test 2: Button Visible | ✓/✗ | |
| Test 3: Console Logging | ✓/✗ | |
| Test 4: Modal Display | ✓/✗ | |
| Test 5: Stream Selection | ✓/✗ | |
| Test 6: Back Button | ✓/✗ | |
| Test 7: Persistence | ✓/✗ | |
| Test 8: Clear Session | ✓/✗ | |
| Test 9: Multiple Interactions | ✓/✗ | |

---

## If Tests Fail

### Console Shows No Messages on Button Click
**Problem:** The button click isn't triggering the function  
**Solution:** Check that the button has `onclick="openStreamSelectHome()"` attribute

### Console Shows Errors About Missing Elements
**Problem:** There are still references to missing HTML elements  
**Solution:** Check that the fix was applied correctly to both init function and clearSession

### Modal Opens But Is Invisible
**Problem:** CSS display issue  
**Solution:** Try this in console: `document.getElementById('modal-stream-select').classList.add('open')`  
If that works, there's a CSS override somewhere.

### Modal Appears Then Immediately Closes
**Problem:** Click handler on modal overlay is removing the open class  
**Solution:** Check the modal backdrop click listener around line 1324

---

## Success Criteria

✓ **All Tests Pass** → Modal system is working correctly  
✓ **No console errors** → Code is stable  
✓ **Data persists** → localStorage is working  
✓ **Streams selectable** → Full workflow functions  

Once all tests pass, the modal system is fixed and ready for full application testing.

---

## Next Steps

After confirming the modal fix works:

1. Test the complete site visit workflow:
   - Select streams
   - Add floor
   - Add station (with auto-lettering)
   - Add bins
   - Add photos

2. Test on mobile device (if applicable)

3. Test other modals (Add Floor, Add Station, Add Gateway, etc.)

4. Test export functionality with the fixed code

