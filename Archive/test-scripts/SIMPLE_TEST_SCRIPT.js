// AUTOMATED VALIDATION TEST SUITE - PIN COORDINATE SYSTEM REDESIGN
console.clear();
console.log('AUTOMATED VALIDATION TEST SUITE');
console.log('================================\n');

const testResults = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {total: 0, passed: 0, failed: 0},
  issues: []
};

function recordTest(name, passed, details) {
  testResults.tests.push({name, passed, details: details || {}});
  testResults.summary.total++;
  if(passed) testResults.summary.passed++;
  else testResults.summary.failed++;
  const icon = passed ? 'PASS' : 'FAIL';
  console.log('[' + icon + '] ' + name);
}

function recordIssue(severity, description, details) {
  testResults.issues.push({severity, description, details: details || {}});
  console.log('[' + severity + '] ' + description);
}

// TEST GROUP 1: FUNCTION EXISTENCE
console.log('\nTEST GROUP 1: FUNCTION EXISTENCE');
console.log('--------------------------------');

recordTest('showTapHighlight function exists', typeof showTapHighlight === 'function');
recordTest('renderPins function exists', typeof renderPins === 'function');
recordTest('validateDisplayDimensions function exists', typeof validateDisplayDimensions === 'function');
recordTest('setZoomLevel function exists', typeof setZoomLevel === 'function');
recordTest('enforcePanBounds function exists', typeof enforcePanBounds === 'function');

// TEST GROUP 2: DISPLAY DIMENSIONS STATE
console.log('\nTEST GROUP 2: DISPLAY DIMENSIONS STATE');
console.log('---------------------------------------');

recordTest('floorPlanDisplayState exists', typeof floorPlanDisplayState === 'object');
recordTest('displayedWidth is defined', floorPlanDisplayState && typeof floorPlanDisplayState.displayedWidth === 'number', {value: floorPlanDisplayState?.displayedWidth});
recordTest('displayedHeight is defined', floorPlanDisplayState && typeof floorPlanDisplayState.displayedHeight === 'number', {value: floorPlanDisplayState?.displayedHeight});
recordTest('containerWidth is defined', floorPlanDisplayState && typeof floorPlanDisplayState.containerWidth === 'number', {value: floorPlanDisplayState?.containerWidth});
recordTest('containerHeight is defined', floorPlanDisplayState && typeof floorPlanDisplayState.containerHeight === 'number', {value: floorPlanDisplayState?.containerHeight});

// TEST GROUP 3: PAN/ZOOM STATE
console.log('\nTEST GROUP 3: PAN/ZOOM STATE');
console.log('-----------------------------');

recordTest('floorPlanZoom is a number', typeof floorPlanZoom === 'number', {value: floorPlanZoom});
recordTest('floorPlanPanX is a number', typeof floorPlanPanX === 'number', {value: floorPlanPanX});
recordTest('floorPlanPanY is a number', typeof floorPlanPanY === 'number', {value: floorPlanPanY});

// TEST GROUP 4: PIN DATA STRUCTURE
console.log('\nTEST GROUP 4: PIN DATA STRUCTURE');
console.log('---------------------------------');

const hasData = S && S.floors && S.floors[currentFloor];
recordTest('Floor data exists', hasData, {floor: currentFloor});

if(hasData) {
  const floor = S.floors[currentFloor];
  const stations = floor.stations || [];
  const gateways = floor.gateways || [];
  const displays = floor.displays || [];

  recordTest('Stations array exists', Array.isArray(stations), {count: stations.length});
  recordTest('Gateways array exists', Array.isArray(gateways), {count: gateways.length});
  recordTest('Displays array exists', Array.isArray(displays), {count: displays.length});

  const allPins = [].concat(stations, gateways, displays);
  if(allPins.length > 0) {
    const firstPin = allPins[0];
    const hasX = typeof firstPin.x === 'number';
    const hasY = typeof firstPin.y === 'number';

    recordTest('Pin x coordinate is number', hasX, {value: firstPin.x});
    recordTest('Pin y coordinate is number', hasY, {value: firstPin.y});

    if(hasX && hasY) {
      const xInRange = firstPin.x >= 0 && firstPin.x <= 100;
      const yInRange = firstPin.y >= 0 && firstPin.y <= 100;

      recordTest('Pin x in range 0-100', xInRange, {value: firstPin.x});
      recordTest('Pin y in range 0-100', yInRange, {value: firstPin.y});

      if(!xInRange || !yInRange) {
        recordIssue('CRITICAL', 'Pin coordinates out of range', {x: firstPin.x, y: firstPin.y});
      }
    }
  }
}

// TEST GROUP 5: GREEN CIRCLE POSITIONING
console.log('\nTEST GROUP 5: GREEN CIRCLE POSITIONING');
console.log('--------------------------------------');

const zoomLevels = [1.0, 1.25, 1.5, 1.75];
const testX = 45.5;
const testY = 52.3;

zoomLevels.forEach(function(zoom) {
  try {
    const oldZoom = floorPlanZoom;
    floorPlanZoom = zoom;
    updateDisplayDimensions();
    showTapHighlight(testX, testY);
    const highlight = document.querySelector('.tap-highlight');
    const exists = !!highlight;
    recordTest('Green circle at zoom ' + (zoom * 100).toFixed(0) + '%', exists);
    if(exists) {
      const usesPixels = highlight.style.left.endsWith('px') && highlight.style.top.endsWith('px');
      recordTest('Uses pixel positioning at zoom ' + (zoom * 100).toFixed(0) + '%', usesPixels);
      highlight.remove();
    }
    floorPlanZoom = oldZoom;
  } catch(e) {
    recordTest('Green circle at zoom ' + (zoom * 100).toFixed(0) + '%', false);
    recordIssue('ERROR', 'Exception: ' + e.message);
  }
});

// TEST GROUP 6: RENDER PINS FUNCTION
console.log('\nTEST GROUP 6: RENDER PINS FUNCTION');
console.log('-----------------------------------');

try {
  renderPins();
  recordTest('renderPins executes without error', true);
} catch(e) {
  recordTest('renderPins executes without error', false);
  recordIssue('ERROR', 'renderPins exception: ' + e.message);
}

// TEST GROUP 7: ZOOM LEVEL VALIDATION
console.log('\nTEST GROUP 7: ZOOM LEVEL VALIDATION');
console.log('------------------------------------');

const validZooms = [1.0, 1.25, 1.5, 1.75];
const isValidZoom = validZooms.indexOf(floorPlanZoom) >= 0;
recordTest('Current zoom is valid', isValidZoom, {current: floorPlanZoom});

// TEST GROUP 8: PAN BOUNDS VALIDATION
console.log('\nTEST GROUP 8: PAN BOUNDS VALIDATION');
console.log('------------------------------------');

const dw = floorPlanDisplayState.displayedWidth;
const dh = floorPlanDisplayState.displayedHeight;
const cw = floorPlanDisplayState.containerWidth;
const ch = floorPlanDisplayState.containerHeight;
const ovX = dw - cw;
const ovY = dh - ch;
const maxPX = Math.abs(ovX) / 2;
const maxPY = Math.abs(ovY) / 2;

const panXOk = Math.abs(floorPlanPanX) <= maxPX + 1;
const panYOk = Math.abs(floorPlanPanY) <= maxPY + 1;

recordTest('Pan X within bounds', panXOk, {panX: floorPlanPanX.toFixed(1), maxPanX: maxPX.toFixed(1)});
recordTest('Pan Y within bounds', panYOk, {panY: floorPlanPanY.toFixed(1), maxPanY: maxPY.toFixed(1)});

// FINAL SUMMARY
console.log('\n' + '='.repeat(50));
console.log('TEST SUMMARY');
console.log('='.repeat(50));
console.log('Total: ' + testResults.summary.total);
console.log('Passed: ' + testResults.summary.passed);
console.log('Failed: ' + testResults.summary.failed);
console.log('Issues: ' + testResults.issues.length);

if(testResults.summary.failed === 0) {
  console.log('\nSUCCESS: ALL TESTS PASSED!');
} else {
  console.log('\nWARNING: ' + testResults.summary.failed + ' test(s) failed');
}

console.log('='.repeat(50) + '\n');

testResults;
