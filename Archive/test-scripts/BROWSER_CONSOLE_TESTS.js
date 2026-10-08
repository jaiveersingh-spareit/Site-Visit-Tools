// ═══════════════════════════════════════════════════════════════════════════
// BROWSER CONSOLE TEST SCRIPT
// ═══════════════════════════════════════════════════════════════════════════
//
// INSTRUCTIONS:
// 1. Open the app: Spare-it_site_visit_form.html
// 2. Open browser console: F12 → Console tab
// 3. Copy and paste this entire script
// 4. Press Enter
// 5. Review results in console and UI
//
// ═══════════════════════════════════════════════════════════════════════════

console.log('🔬 STARTING COMPREHENSIVE DIAGNOSTIC TESTS...\n');

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function logTest(name, status, details = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${name}`);
  if (details) console.log(`   → ${details}`);
  results.tests.push({ name, status, details });
  if (status === 'PASS') results.passed++;
  else if (status === 'FAIL') results.failed++;
  else results.warnings++;
}

// ─────────────────────────────────────────────────────────────────────────
// TEST 1: LIBRARY LOADING
// ─────────────────────────────────────────────────────────────────────────
console.log('\n📦 TEST 1: LIBRARY LOADING\n');

if (typeof JSZip !== 'undefined') {
  logTest('JSZip Library', 'PASS', 'JSZip loaded successfully');
} else {
  logTest('JSZip Library', 'FAIL', 'JSZip not found in window');
}

if (typeof XLSX !== 'undefined') {
  logTest('SheetJS Library', 'PASS', 'SheetJS loaded successfully');
} else {
  logTest('SheetJS Library', 'FAIL', 'SheetJS not found');
}

if (typeof heic2any !== 'undefined') {
  logTest('HEIC2Any Library', 'PASS', 'HEIC2Any loaded successfully');
} else {
  logTest('HEIC2Any Library', 'WARNING', 'HEIC2Any not found (optional for non-iPhone)');
}

// ─────────────────────────────────────────────────────────────────────────
// TEST 2: PHASE 9 ZIP EXPORT FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────
console.log('\n📦 TEST 2: PHASE 9 ZIP EXPORT FUNCTIONS\n');

const phase9Functions = [
  'dataUrlToBlob',
  'getTimestamp',
  'collectPhotosForZip',
  'generateMetadataJson',
  'buildAndDownloadZip',
  'doExportZip'
];

phase9Functions.forEach(fn => {
  if (typeof window[fn] === 'function') {
    logTest(`Function: ${fn}()`, 'PASS', `Callable function`);
  } else {
    logTest(`Function: ${fn}()`, 'FAIL', `Not found in window`);
  }
});

// ─────────────────────────────────────────────────────────────────────────
// TEST 3: BUG FIX #1 - CREATE NEW STATION BUTTON
// ─────────────────────────────────────────────────────────────────────────
console.log('\n🐛 TEST 3: BUG FIX #1 - CREATE NEW STATION BUTTON\n');

const linkStationBtn = document.querySelector('[onclick*="closeModal"]');
if (linkStationBtn) {
  const onclick = linkStationBtn.getAttribute('onclick');
  if (onclick.includes('getNextAvailableLetter') &&
      onclick.includes('populateLocationDropdown') &&
      onclick.includes('modal-station') &&
      !onclick.includes('pinAddStation')) {
    logTest('Create New Button', 'PASS', 'Correctly opens station creation modal');
  } else {
    logTest('Create New Button', 'FAIL', 'Button onclick not properly fixed');
  }
} else {
  logTest('Create New Button', 'WARNING', 'Button not found in current view');
}

// Verify helper functions exist
if (typeof getNextAvailableLetter === 'function') {
  logTest('Helper: getNextAvailableLetter()', 'PASS', 'Function exists');
} else {
  logTest('Helper: getNextAvailableLetter()', 'FAIL', 'Function not found');
}

if (typeof populateLocationDropdown === 'function') {
  logTest('Helper: populateLocationDropdown()', 'PASS', 'Function exists');
} else {
  logTest('Helper: populateLocationDropdown()', 'FAIL', 'Function not found');
}

// ─────────────────────────────────────────────────────────────────────────
// TEST 4: BUG FIX #2 - ADD BIN BUTTON
// ─────────────────────────────────────────────────────────────────────────
console.log('\n🐛 TEST 4: BUG FIX #2 - ADD BIN BUTTON\n');

const addBinBtn = document.querySelector('[onclick="addSelectedBins()"]');
if (addBinBtn) {
  logTest('Add Bin Button', 'PASS', 'Calls correct function (addSelectedBins)');
} else {
  // Check if button exists but with wrong function
  const wrongBtn = document.querySelector('[onclick="addBin()"]');
  if (wrongBtn) {
    logTest('Add Bin Button', 'FAIL', 'Still calls deprecated addBin() function');
  } else {
    logTest('Add Bin Button', 'WARNING', 'Add Bin button not currently visible');
  }
}

if (typeof addSelectedBins === 'function') {
  logTest('Function: addSelectedBins()', 'PASS', 'Function exists');
} else {
  logTest('Function: addSelectedBins()', 'FAIL', 'Function not found');
}

// ─────────────────────────────────────────────────────────────────────────
// TEST 5: BUG FIX #3 - DELETE PHOTO FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────
console.log('\n🐛 TEST 5: BUG FIX #3 - DELETE PHOTO FUNCTIONS\n');

const deletePhotoFunctions = [
  'deleteBinPhoto',
  'deleteGatewayPhoto',
  'deleteDisplayPhoto'
];

deletePhotoFunctions.forEach(fn => {
  if (typeof window[fn] === 'function') {
    logTest(`Function: ${fn}()`, 'PASS', 'Photo deletion enabled');
  } else {
    logTest(`Function: ${fn}()`, 'FAIL', `Function not found`);
  }
});

// Check for delete buttons in HTML
const deleteBinBtn = document.querySelector('[onclick="deleteBinPhoto(binPhotoIdx)"]');
if (deleteBinBtn) {
  logTest('Delete Bin Photo Button', 'PASS', 'Button exists in UI');
} else {
  logTest('Delete Bin Photo Button', 'WARNING', 'Not visible (modal may be closed)');
}

const deleteGwBtn = document.querySelector('[onclick="deleteGatewayPhoto()"]');
if (deleteGwBtn) {
  logTest('Delete Gateway Photo Button', 'PASS', 'Button exists in UI');
} else {
  logTest('Delete Gateway Photo Button', 'WARNING', 'Not visible (modal may be closed)');
}

const displayPhotoBtn = document.querySelector('[onclick="deleteDisplayPhoto()"]');
if (displayPhotoBtn) {
  logTest('Delete Display Photo Button', 'PASS', 'Button exists in UI');
} else {
  logTest('Delete Display Photo Button', 'WARNING', 'Not visible (modal may be closed)');
}

// ─────────────────────────────────────────────────────────────────────────
// TEST 6: EXPORT BUTTONS
// ─────────────────────────────────────────────────────────────────────────
console.log('\n⬇️ TEST 6: EXPORT BUTTONS\n');

const exportButtons = document.querySelectorAll('[onclick="doExportZip()"]');
if (exportButtons.length >= 5) {
  logTest(`Export ZIP Buttons`, 'PASS', `All 5 buttons found and call doExportZip()`);
} else {
  logTest(`Export ZIP Buttons`, 'FAIL', `Expected 5 buttons, found ${exportButtons.length}`);
}

// Check button text
let correctTextCount = 0;
exportButtons.forEach(btn => {
  if (btn.textContent.includes('Export ZIP')) {
    correctTextCount++;
  }
});

if (correctTextCount === exportButtons.length) {
  logTest('Export Button Text', 'PASS', 'All export buttons say "Export ZIP"');
} else {
  logTest('Export Button Text', 'FAIL', `Only ${correctTextCount}/${exportButtons.length} have correct text`);
}

// ─────────────────────────────────────────────────────────────────────────
// TEST 7: PHASE 9 FUNCTION LOGIC (Quick Tests)
// ─────────────────────────────────────────────────────────────────────────
console.log('\n⚙️ TEST 7: PHASE 9 FUNCTION LOGIC\n');

// Test getTimestamp format
try {
  const ts = getTimestamp();
  const regex = /^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/;
  if (regex.test(ts)) {
    logTest('getTimestamp() Format', 'PASS', `Correct format: ${ts}`);
  } else {
    logTest('getTimestamp() Format', 'FAIL', `Invalid format: ${ts}`);
  }
} catch (e) {
  logTest('getTimestamp() Format', 'FAIL', `Error: ${e.message}`);
}

// Test dataUrlToBlob with sample data
try {
  const sampleDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const blob = dataUrlToBlob(sampleDataUrl);
  if (blob instanceof Blob && blob.size > 0) {
    logTest('dataUrlToBlob() Function', 'PASS', `Creates valid Blob (${blob.type})`);
  } else {
    logTest('dataUrlToBlob() Function', 'FAIL', 'Did not create valid Blob');
  }
} catch (e) {
  logTest('dataUrlToBlob() Function', 'FAIL', `Error: ${e.message}`);
}

// Test collectPhotosForZip exists and returns array
try {
  const photos = collectPhotosForZip();
  if (Array.isArray(photos)) {
    logTest('collectPhotosForZip() Return Type', 'PASS', `Returns array (${photos.length} photos found)`);
  } else {
    logTest('collectPhotosForZip() Return Type', 'FAIL', 'Does not return an array');
  }
} catch (e) {
  logTest('collectPhotosForZip() Return Type', 'FAIL', `Error: ${e.message}`);
}

// Test generateMetadataJson returns valid JSON string
try {
  const jsonStr = generateMetadataJson();
  const parsed = JSON.parse(jsonStr);
  if (parsed.export_info && parsed.building && parsed.floors) {
    logTest('generateMetadataJson() Structure', 'PASS', 'Returns valid JSON with required fields');
  } else {
    logTest('generateMetadataJson() Structure', 'FAIL', 'Missing required fields in metadata');
  }
} catch (e) {
  logTest('generateMetadataJson() Structure', 'FAIL', `Error: ${e.message}`);
}

// ─────────────────────────────────────────────────────────────────────────
// TEST 8: GLOBAL STATE
// ─────────────────────────────────────────────────────────────────────────
console.log('\n📊 TEST 8: GLOBAL STATE\n');

if (typeof S !== 'undefined' && typeof S === 'object') {
  logTest('Global State (S)', 'PASS', 'Initialized');
  if (Array.isArray(S.floors)) {
    logTest('  - S.floors', 'PASS', `Array (${S.floors.length} floors)`);
  }
  if (S.building) {
    logTest('  - S.building', 'PASS', `Set: "${S.building}"`);
  }
} else {
  logTest('Global State (S)', 'FAIL', 'Not initialized');
}

// ─────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(70));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(70));
console.log(`✅ PASSED:  ${results.passed}`);
console.log(`❌ FAILED:  ${results.failed}`);
console.log(`⚠️  WARNINGS: ${results.warnings}`);
console.log(`📈 TOTAL:   ${results.tests.length}`);

const passRate = Math.round((results.passed / results.tests.length) * 100);
console.log(`\n📊 PASS RATE: ${passRate}%`);

if (results.failed === 0) {
  console.log('\n🎉 ALL TESTS PASSED! App is ready for functional testing.');
} else {
  console.log(`\n⚠️  ${results.failed} test(s) failed. Review above for details.`);
}

console.log('\n' + '='.repeat(70));
console.log('NEXT STEPS:');
console.log('1. Follow PHASE_9_TEST_PLAN.md for end-to-end testing');
console.log('2. Follow BUG_FIXES_SUMMARY.md for bug fix verification');
console.log('3. Create test building with photos and export ZIP');
console.log('='.repeat(70) + '\n');
