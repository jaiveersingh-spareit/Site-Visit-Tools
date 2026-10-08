# IMPROVED CRITICAL FUNCTIONS

These are enhanced versions of the critical functions that should fix the three blocking bugs. Replace the existing versions in `Spare-it_site_visit_form.html` with these.

---

## REPLACEMENT 1: Enhanced Event Listener Attachment

**Replace the code at lines 1012-1031 with this:**

```javascript
// ── BEGIN SITE VISIT BUTTON (Enhanced) ──
function attachButtonListeners() {
  console.log('attachButtonListeners() starting...');
  
  try {
    const btn = document.getElementById('btn-start-visit');
    if(!btn) {
      console.error('CRITICAL: btn-start-visit button not found!');
      // Fallback: try again in 100ms
      setTimeout(attachButtonListeners, 100);
      return;
    }
    
    console.log('Button found, attaching listeners...');
    
    // Remove any existing listeners first (prevent duplicates)
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    const freshBtn = document.getElementById('btn-start-visit');
    
    // Click event
    freshBtn.addEventListener('click', function(e) {
      console.log('Click event fired');
      e.preventDefault();
      e.stopPropagation();
      startVisit();
    });
    
    // Touch event (mobile)
    freshBtn.addEventListener('touchend', function(e) {
      console.log('Touchend event fired');
      e.preventDefault();
      e.stopPropagation();
      startVisit();
    });
    
    // Pointerdown event (fallback for some devices)
    freshBtn.addEventListener('pointerdown', function(e) {
      console.log('Pointerdown event fired');
      if(e.pointerType === 'touch') {
        e.preventDefault();
        e.stopPropagation();
        startVisit();
      }
    });
    
    console.log('✓ All button listeners attached successfully');
    
  } catch(e) {
    console.error('ERROR attaching button listeners:', e);
  }
}

// Try to attach immediately
if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachButtonListeners);
} else {
  attachButtonListeners();
}

// Also try on window load
window.addEventListener('load', attachButtonListeners);
```

---

## REPLACEMENT 2: Enhanced openModal Function

**Replace the code at lines 1048-1062 with this:**

```javascript
function openModal(id){
  console.log(`openModal("${id}") called`);
  
  try {
    const modal = document.getElementById(id);
    if(!modal) {
      console.error(`CRITICAL: Modal not found: ${id}`);
      console.log('Available modal elements:', document.querySelectorAll('.modal-overlay'));
      alert(`Error: Modal "${id}" not found. Please refresh the page.`);
      return false;
    }
    
    console.log(`Modal found: ${id}`);
    
    // Check if it's already open
    if(modal.classList.contains('open')) {
      console.log(`Modal already open: ${id}`);
      return true;
    }
    
    // Add open class
    modal.classList.add('open');
    console.log(`✓ Open class added to modal: ${id}`);
    
    // Verify it's actually open
    setTimeout(() => {
      if(!modal.classList.contains('open')) {
        console.error(`WARNING: Open class was removed from ${id}`);
      } else {
        console.log(`✓ Verified: Modal ${id} is open`);
      }
    }, 100);
    
    // Render content if needed
    if(id === 'modal-stream-select') {
      console.log('Rendering stream selector...');
      if(typeof renderStreamSelector === 'function') {
        renderStreamSelector();
      }
    }
    if(id === 'modal-bin') {
      console.log('Rendering bin form...');
      if(typeof renderBinForm === 'function') {
        renderBinForm();
      }
    }
    
    return true;
    
  } catch(e) {
    console.error(`Error opening modal ${id}:`, e);
    console.error('Stack:', e.stack);
    return false;
  }
}
```

---

## REPLACEMENT 3: Enhanced startVisit Function

**Replace the code at lines 1192-1233 with this:**

```javascript
function startVisit(){
  console.log('========== startVisit() CALLED ==========');
  
  try {
    // Get form inputs
    const buildingInput = document.getElementById('inp-building');
    const dateInput = document.getElementById('inp-date');
    const auditorInput = document.getElementById('inp-auditor');
    
    if(!buildingInput || !dateInput || !auditorInput) {
      console.error('CRITICAL: Required input elements not found');
      alert('ERROR: Form fields not found. Please refresh the page.');
      return;
    }
    
    const b = buildingInput.value.trim();
    const d = dateInput.value;
    const a = auditorInput.value.trim();
    
    console.log('Form values:', { building: b, date: d, auditor: a });
    console.log('Selected streams:', S.selectedStreams?.length || 0);
    
    // Validation logic
    const missing = [];
    if(!b) missing.push({field:'Building Name', icon:'🏢'});
    if(!d) missing.push({field:'Visit Date', icon:'📅'});
    if(!a) missing.push({field:'Auditor Name', icon:'👤'});
    if(!S.selectedStreams || !S.selectedStreams.length) {
      missing.push({field:'Waste Streams', icon:'♻️', note:'(tap ⚙️ Select Waste Streams button)'});
    }
    
    console.log(`Validation result: ${missing.length} missing fields`);
    
    if(missing.length > 0) {
      console.log('Showing validation errors...');
      
      // Build error HTML
      const errorHTML = missing.map(item => `
        <div style="background:var(--card);border-left:4px solid #EE4547;padding:12px;margin-bottom:10px;border-radius:6px;">
          <div style="font-weight:600;color:var(--dark);margin-bottom:4px;">${item.icon} ${item.field}</div>
          ${item.note ? `<div style="font-size:12px;color:var(--muted);">${item.note}</div>` : ''}
        </div>
      `).join('');
      
      // Get error container
      const errorListEl = document.getElementById('validation-errors-list');
      if(!errorListEl) {
        console.error('CRITICAL: validation-errors-list not found');
        alert('Missing fields:\n' + missing.map(m => m.field).join('\n'));
        return;
      }
      
      console.log('Populating error list...');
      errorListEl.innerHTML = errorHTML;
      console.log('✓ Error list populated');
      
      // Open modal
      console.log('Opening validation modal...');
      const modalOpened = openModal('modal-validation');
      if(!modalOpened) {
        console.error('Failed to open modal, showing alert instead');
        alert('Please fill in all required fields:\n' + missing.map(m => `• ${m.field}`).join('\n'));
      }
      
      return;
    }
    
    // Validation passed
    console.log('✓ Validation passed, saving form...');
    
    S.building = b;
    S.address = document.getElementById('inp-address')?.value.trim() || '';
    S.hauler = document.getElementById('inp-hauler')?.value.trim() || '';
    S.date = d;
    S.auditor = a;
    S.contactNotes = document.getElementById('inp-contact-notes')?.value.trim() || '';
    
    console.log('Persisting data...');
    if(typeof persist === 'function') {
      persist();
      console.log('✓ Data persisted');
    }
    
    console.log('Navigating to floors...');
    if(typeof goFloors === 'function') {
      goFloors();
      console.log('✓ Navigation successful');
    } else {
      console.error('goFloors() function not found');
      alert('Navigation failed. Please refresh the page.');
    }
    
  } catch(err) {
    console.error('========== EXCEPTION IN startVisit() ==========');
    console.error('Error:', err);
    console.error('Stack:', err.stack);
    alert('An error occurred: ' + err.message);
  }
}
```

---

## REPLACEMENT 4: Enhanced File Upload Functions

**Replace the code at lines 1314-1340 with this (promptContextPhotoUpload):**

```javascript
function promptContextPhotoUpload(){
  console.log('promptContextPhotoUpload() called');
  
  if(S.contextPhotos && S.contextPhotos.length >= 5){
    console.warn('Max photos reached (5)');
    alert('Maximum 5 photos reached.');
    return;
  }

  try {
    const input = document.getElementById('context-photo-camera');
    if(!input) {
      console.error('CRITICAL: Camera input not found');
      alert('Camera input unavailable. Try "Choose File" instead.');
      return;
    }

    console.log('Camera input found:', input);
    
    // Reset value to allow same file selection
    input.value = '';
    
    // Check if input is disabled
    if(input.disabled) {
      console.warn('Camera input is disabled');
      alert('Camera input is disabled.');
      return;
    }
    
    // Trigger file dialog
    console.log('Triggering camera input...');
    input.click();
    
    console.log('✓ Camera input triggered');
    
  } catch(e) {
    console.error('Error in promptContextPhotoUpload:', e);
    alert('Unable to open camera: ' + e.message);
  }
}
```

**And replace lines 1342-1368 with this (promptContextPhotoFile):**

```javascript
function promptContextPhotoFile(){
  console.log('promptContextPhotoFile() called');
  
  if(S.contextPhotos && S.contextPhotos.length >= 5){
    console.warn('Max photos reached (5)');
    alert('Maximum 5 photos reached.');
    return;
  }

  try {
    const input = document.getElementById('context-photo-file');
    if(!input) {
      console.error('CRITICAL: File input not found');
      alert('File picker unavailable.');
      return;
    }

    console.log('File input found:', input);
    
    // Reset value to allow same file selection
    input.value = '';
    
    // Check if input is disabled
    if(input.disabled) {
      console.warn('File input is disabled');
      alert('File input is disabled.');
      return;
    }
    
    // Trigger file dialog
    console.log('Triggering file picker...');
    input.click();
    
    console.log('✓ File picker triggered');
    
  } catch(e) {
    console.error('Error in promptContextPhotoFile:', e);
    alert('Unable to open file picker: ' + e.message);
  }
}
```

---

## REPLACEMENT 5: Enhanced closeModal Function

**Replace the code at lines 1165-1176 with this:**

```javascript
function closeModal(id){
  console.log(`closeModal("${id}") called`);
  
  try {
    const modal = document.getElementById(id);
    if(!modal) {
      console.warn(`Modal not found when closing: ${id}`);
      return false;
    }
    
    if(!modal.classList.contains('open')) {
      console.log(`Modal already closed: ${id}`);
      return true;
    }
    
    modal.classList.remove('open');
    console.log(`✓ Modal closed: ${id}`);
    return true;
    
  } catch(e) {
    console.error(`Error closing modal ${id}:`, e);
    return false;
  }
}
```

---

## HOW TO APPLY

1. Open `Spare-it_site_visit_form.html` in a text editor
2. Find each section (use Ctrl+F to search for the line numbers)
3. Replace the entire function with the improved version
4. Save the file
5. Refresh the browser (Ctrl+Shift+R for hard refresh)
6. Test by:
   - Clicking "Begin Site Visit →" with empty fields → Modal should appear with errors
   - Filling in all fields and clicking → Should navigate to next page
   - Clicking "📷 Take Photo" or "🖼️ Choose File" → File picker should open

---

## WHAT CHANGED

### For Button Issues:
- Added multiple event types (click, touchend, pointerdown)
- Added retry logic if button not found initially
- Clone and re-attach button to remove any existing listeners
- Added DOMContentLoaded AND window load handlers

### For Modal Issues:
- Added logging at each step
- Verify modal exists before trying to open
- Verify open class is actually added
- Check if modal is already open

### For Form Validation:
- Extensive logging of each step
- Better error messages if elements missing
- Fallback to alert() if modal fails
- Verify persist() and goFloors() exist

### For File Upload:
- Check if input is disabled
- More robust error handling
- Better user feedback

---

**Test these improvements and report which steps pass/fail in the console.**
