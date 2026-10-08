# Stream Selection Modal - Debugging Guide

## Quick Diagnosis (Run in Browser Console)

### Step 1: Open the Developer Tools
- Press **F12** (Windows/Linux) or **Cmd+Option+I** (Mac)
- Go to the **Console** tab

### Step 2: Run This Diagnostic Script
Copy and paste this entire block into the console and press Enter:

```javascript
console.clear();
console.log('=== STREAM MODAL DIAGNOSTIC ===\n');

// Check 1: Modal element exists
const modalElement = document.getElementById('modal-stream-select');
console.log('1. Modal Element Found:', !!modalElement);
if (!modalElement) {
  console.error('CRITICAL: Modal element not found in DOM!');
} else {
  console.log('   - Element ID: modal-stream-select');
  console.log('   - Has open class:', modalElement.classList.contains('open'));
  console.log('   - Display CSS:', getComputedStyle(modalElement).display);
  console.log('   - Z-index:', getComputedStyle(modalElement).zIndex);
}

// Check 2: Button exists
const button = document.querySelector('[onclick="openStreamSelectHome()"]');
console.log('\n2. Stream Select Button Found:', !!button);
if (button) {
  console.log('   - Button text:', button.textContent.trim());
}

// Check 3: openStreamSelectHome function exists
console.log('\n3. openStreamSelectHome Function:', typeof openStreamSelectHome);

// Check 4: openModal function exists
console.log('4. openModal Function:', typeof openModal);

// Check 5: renderStreamSelector function exists
console.log('5. renderStreamSelector Function:', typeof renderStreamSelector);

// Check 6: WASTE_STREAMS constant exists
console.log('\n6. WASTE_STREAMS Defined:', typeof WASTE_STREAMS);
if (typeof WASTE_STREAMS === 'object') {
  console.log('   - Streams available:', Object.keys(WASTE_STREAMS).length);
}

// Check 7: Global state S exists
console.log('7. Global State S:', typeof S);
if (typeof S === 'object') {
  console.log('   - selectedStreams:', S.selectedStreams);
}

console.log('\n=== TESTING MODAL OPEN ===\n');

// Test 4: Manually call openModal
console.log('Calling openModal("modal-stream-select")...');
const result = openModal('modal-stream-select');
console.log('Result:', result);

// Check if modal got the open class
setTimeout(() => {
  const hasOpenClass = document.getElementById('modal-stream-select').classList.contains('open');
  console.log('\nAfter openModal call:');
  console.log('Modal has open class:', hasOpenClass);
  console.log('Modal display:', getComputedStyle(document.getElementById('modal-stream-select')).display);
}, 100);
```

## What to Check

### If Modal Doesn't Open:

**Common Issues:**

1. **Modal element not found** → The HTML might be malformed or the ID is wrong
2. **Display still showing "none"** → CSS issue or class not being added
3. **JavaScript error in console** → Check for red error messages
4. **openModal not defined** → Function might not be loaded

### Step-by-Step Debugging:

**If the modal element is NOT found:**
- Search the page HTML for id="modal-stream-select"
- Make sure the element exists in the HTML

**If the modal element IS found but doesn't display:**
- Check the browser console for any JavaScript errors (red text)
- Run: `document.getElementById('modal-stream-select').classList.add('open')` manually
- If that works, the CSS is fine but something is preventing the class from being added

**If openModal returns false:**
- Check the console for CRITICAL error messages
- The function has logging built in, so errors will show there

### Step 3: Click the Button and Monitor Console

1. Keep the **Console** tab open
2. Click the **"Select Waste Streams"** button in the app
3. Watch for console output:
   - You should see: `openModal("modal-stream-select") called`
   - Then: `Modal found: modal-stream-select`
   - Then: `✓ Open class added to modal: modal-stream-select`
   - Then: `Rendering stream selector...`

4. **If you don't see these messages**, the button click isn't calling the function

### Step 4: Check Network Tab

- Go to the **Network** tab
- Click the button again
- Look for any failed requests (red icons)
- If photos are being uploaded, they might be blocking the modal

## Additional Tests

### Test the Modal Manually in Console:

```javascript
// Open the modal directly
openModal('modal-stream-select');

// Check if it's open
document.getElementById('modal-stream-select').classList.contains('open');

// Close the modal
closeModal('modal-stream-select');
```

### Test the Button Click:

```javascript
// Get the button
const btn = document.querySelector('[onclick="openStreamSelectHome()"]');

// Check if it's clickable
console.log('Button enabled:', !btn.disabled);
console.log('Button visible:', btn.offsetHeight > 0);
```

## Common Root Causes

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Modal element not found | HTML corrupted or ID mismatch | Check HTML structure |
| Modal doesn't display after adding class | CSS issue with z-index or display | Check CSS for modal-overlay.open |
| openStreamSelectHome not called | Button HTML is wrong | Check onclick attribute |
| Function error | JavaScript syntax error earlier in file | Check browser console for all errors |
| Modal flashes then closes | Click event listener removing it | Check modal-overlay click handlers |

## Report Back With:

1. **Console output** from the diagnostic script
2. **Any red errors** you see in the console
3. **What happens** when you click the button
4. **Whether the modal element exists** in the DOM

This will help identify the exact point of failure.
