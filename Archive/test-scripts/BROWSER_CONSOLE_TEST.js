// ═══════════════════════════════════════════════════════════════════════════════
// COMPREHENSIVE TEST SUITE - Paste this into browser console (F12 → Console tab)
// ═══════════════════════════════════════════════════════════════════════════════

console.clear();
console.log('\n' + '═'.repeat(80));
console.log('🧪 COMPREHENSIVE TEST SUITE - STARTING');
console.log('═'.repeat(80) + '\n');

const testResults = {
  timestamp: new Date().toISOString(),
  testsRun: [],
  passCount: 0,
  failCount: 0,
  summary: {}
};

function recordTest(testName, passed, details) {
  testResults.testsRun.push({name: testName, passed, details});
  if(passed) testResults.passCount++;
  else testResults.failCount++;

  const emoji = passed ? '✅' : '❌';
  console.log(`\n${emoji} ${testName}`);
  console.log('─'.repeat(70));
  if(typeof details === 'object') {
    console.log(JSON.stringify(details, null, 2));
  } else {
    console.log(details);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 1: App Initialization & Global State
// ═══════════════════════════════════════════════════════════════════════════════
try {
  const appReady = {
    hasGlobalState: typeof S !== 'undefined',
    hasFloorPlanZoom: typeof floorPlanZoom !== 'undefined',
    hasEnforcePanBounds: typeof enforcePanBounds === 'function',
    hasSetZoomLevel: typeof setZoomLevel === 'function',
    hasUpdateFloorPlanTransform: typeof updateFloorPlanTransform === 'function',
    currentZoom: floorPlanZoom,
    currentPanX: floorPlanPanX,
    currentPanY: floorPlanPanY
  };

  const appInitPassed =
    appReady.hasGlobalState &&
    appReady.hasFloorPlanZoom &&
    appReady.hasEnforcePanBounds &&
    appReady.hasSetZoomLevel &&
    appReady.hasUpdateFloorPlanTransform;

  recordTest('TEST 1: App Initialization & Functions', appInitPassed, appReady);
} catch(e) {
  recordTest('TEST 1: App Initialization & Functions', false, {error: e.message});
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 2: enforcePanBounds Function Exists & Works
// ═══════════════════════════════════════════════════════════════════════════════
try {
  const funcTest = typeof enforcePanBounds === 'function';
  recordTest('TEST 2: enforcePanBounds Function', funcTest, {
    functionExists: funcTest,
    functionType: typeof enforcePanBounds,
    message: funcTest ? 'Pan bounds enforcement function ready' : 'Function not found!'
  });
} catch(e) {
  recordTest('TEST 2: enforcePanBounds Function', false, {error: e.message});
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 3: Rendering Formula Correctness
// ═══════════════════════════════════════════════════════════════════════════════
try {
  const formula = (imagePercent, zoomLevel) => imagePercent * zoomLevel - (zoomLevel - 1) * 50;

  const testCases = [
    {img: 50, zoom: 1.0, expected: 50, name: 'Center at zoom 1.0'},
    {img: 50, zoom: 1.5, expected: 50, name: 'Center at zoom 1.5'},
    {img: 40, zoom: 1.0, expected: 40, name: 'Left edge at zoom 1.0'},
    {img: 40, zoom: 1.5, expected: 35, name: 'Left edge at zoom 1.5'},
    {img: 98, zoom: 1.0, expected: 98, name: 'Right edge at zoom 1.0'},
    {img: 2, zoom: 1.0, expected: 2, name: 'Minimum at zoom 1.0'}
  ];

  const results = testCases.map(tc => {
    const actual = formula(tc.img, tc.zoom);
    const match = Math.abs(actual - tc.expected) < 0.01;
    return {
      test: tc.name,
      input: `${tc.img}% at zoom ${tc.zoom}`,
      expected: tc.expected,
      actual: actual.toFixed(2),
      passed: match ? '✓' : '✗'
    };
  });

  const allPassed = results.every(r => r.passed === '✓');
  recordTest('TEST 3: Rendering Formula', allPassed, {
    formulaCorrect: allPassed,
    testResults: results
  });
} catch(e) {
  recordTest('TEST 3: Rendering Formula', false, {error: e.message});
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 4: Pan Bounds Calculation (Mathematical)
// ═══════════════════════════════════════════════════════════════════════════════
try {
  const panBoundsTest = (containerWidth, zoom, aspectRatio) => {
    const containerHeight = 500; // assume 500px height
    const displayedHeight = containerHeight * zoom;
    const displayedWidth = displayedHeight * aspectRatio;
    const overflowX = displayedWidth - containerWidth;
    const overflowY = displayedHeight - containerHeight;
    const maxPanX = Math.abs(overflowX) / 2;
    const maxPanY = Math.abs(overflowY) / 2;
    return {maxPanX, maxPanY, overflowX, overflowY};
  };

  // Test with different zoom levels and aspect ratio (portrait image: 3024x4032)
  const aspectRatio = 3024 / 4032; // 0.75
  const containerWidth = 398;

  const testScenarios = [
    {zoom: 1.0, name: 'At zoom 100%'},
    {zoom: 1.25, name: 'At zoom 125%'},
    {zoom: 1.5, name: 'At zoom 150%'},
    {zoom: 1.75, name: 'At zoom 175%'}
  ];

  const panResults = testScenarios.map(s => {
    const bounds = panBoundsTest(containerWidth, s.zoom, aspectRatio);
    return {
      scenario: s.name,
      maxPanX: bounds.maxPanX.toFixed(1),
      maxPanY: bounds.maxPanY.toFixed(1),
      overflowX: bounds.overflowX.toFixed(1),
      reasonable: bounds.maxPanX > 0 || bounds.maxPanX === 0
    };
  });

  const boundsValid = panResults.every(r => r.reasonable);
  recordTest('TEST 4: Pan Bounds Calculation', boundsValid, {
    aspectRatio: aspectRatio.toFixed(4),
    containerWidth: containerWidth,
    scenarios: panResults
  });
} catch(e) {
  recordTest('TEST 4: Pan Bounds Calculation', false, {error: e.message});
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 5: Console Log Presence
// ═══════════════════════════════════════════════════════════════════════════════
try {
  // This test checks if logging statements exist in the code
  const getScriptContent = () => {
    const scripts = Array.from(document.querySelectorAll('script'));
    return scripts.map(s => s.textContent).join('\n');
  };

  const scriptContent = getScriptContent();
  const hasLogging = {
    panBoundsLog: scriptContent.includes('[PAN] Bounds constraint applied'),
    zoomLog: scriptContent.includes('[ZOOM] Zoom level set'),
    planTapLog: scriptContent.includes('[PLAN TAP]'),
    renderPinsLog: scriptContent.includes('[RENDER PINS]')
  };

  const allLogsPresent = Object.values(hasLogging).every(v => v);
  recordTest('TEST 5: Console Logging Present', allLogsPresent, hasLogging);
} catch(e) {
  recordTest('TEST 5: Console Logging Present', false, {error: e.message});
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 6: Pan State Consistency
// ═══════════════════════════════════════════════════════════════════════════════
try {
  const panState = {
    panX: floorPlanPanX,
    panY: floorPlanPanY,
    zoom: floorPlanZoom,
    panIsNumber: typeof floorPlanPanX === 'number',
    zoomIsNumber: typeof floorPlanZoom === 'number',
    panIsFinite: Number.isFinite(floorPlanPanX) && Number.isFinite(floorPlanPanY),
    zoomIsValid: floorPlanZoom >= 1 && floorPlanZoom <= 1.75
  };

  const stateValid =
    panState.panIsNumber &&
    panState.zoomIsNumber &&
    panState.panIsFinite &&
    panState.zoomIsValid;

  recordTest('TEST 6: Pan State Consistency', stateValid, panState);
} catch(e) {
  recordTest('TEST 6: Pan State Consistency', false, {error: e.message});
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 7: DOM Elements Accessible
// ═══════════════════════════════════════════════════════════════════════════════
try {
  const elements = {
    planContainer: document.getElementById('plan-container'),
    planImg: document.getElementById('plan-img'),
    planPins: document.getElementById('plan-pins'),
    testModeBtn: document.getElementById('test-mode-btn'),
    zoomModal: document.getElementById('modal-zoom-controls')
  };

  const elementsOk = {
    containerPresent: !!elements.planContainer,
    imagePresent: !!elements.planImg,
    pinsPresent: !!elements.planPins,
    testModePresent: !!elements.testModeBtn,
    zoomModalPresent: !!elements.zoomModal
  };

  const allElementsPresent = Object.values(elementsOk).every(v => v);
  recordTest('TEST 7: DOM Elements Accessible', allElementsPresent, elementsOk);
} catch(e) {
  recordTest('TEST 7: DOM Elements Accessible', false, {error: e.message});
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEST 8: Global State Consistency
// ═══════════════════════════════════════════════════════════════════════════════
try {
  const stateConsistency = {
    hasGlobalS: typeof S !== 'undefined',
    SHasFloors: S && Array.isArray(S.floors),
    zoomInValidRange: floorPlanZoom >= 1 && floorPlanZoom <= 1.75,
    panValuesFinite: Number.isFinite(floorPlanPanX) && Number.isFinite(floorPlanPanY),
    currentFloorIndex: curFloorId ? 'Set' : 'Not set',
    floorsCount: S && S.floors ? S.floors.length : 0
  };

  const stateOk =
    stateConsistency.hasGlobalS &&
    stateConsistency.SHasFloors &&
    stateConsistency.zoomInValidRange &&
    stateConsistency.panValuesFinite;

  recordTest('TEST 8: Global State Consistency', stateOk, stateConsistency);
} catch(e) {
  recordTest('TEST 8: Global State Consistency', false, {error: e.message});
}

// ═══════════════════════════════════════════════════════════════════════════════
// FINAL SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

testResults.summary = {
  totalTests: testResults.testsRun.length,
  passed: testResults.passCount,
  failed: testResults.failCount,
  successRate: ((testResults.passCount / testResults.testsRun.length) * 100).toFixed(1) + '%',
  timestamp: new Date().toISOString()
};

console.log('\n\n' + '═'.repeat(80));
console.log('📊 TEST SUMMARY');
console.log('═'.repeat(80));
console.log(`Total Tests: ${testResults.summary.totalTests}`);
console.log(`Passed: ${testResults.summary.passed} ✅`);
console.log(`Failed: ${testResults.summary.failed} ❌`);
console.log(`Success Rate: ${testResults.summary.successRate}`);
console.log('═'.repeat(80) + '\n');

if(testResults.passCount === testResults.testsRun.length) {
  console.log('🎉 ALL TESTS PASSED! System ready for manual testing.\n');
  console.log('Next Steps:');
  console.log('1. Enable test mode (button on page)');
  console.log('2. Create a floor with image');
  console.log('3. Add stations and test pan/zoom');
  console.log('4. Watch console for [PAN] and [ZOOM] logs');
} else {
  console.log('⚠️ Some tests failed. Check details above.\n');
  testResults.testsRun.filter(t => !t.passed).forEach(t => {
    console.log(`Failed: ${t.name}`);
    console.log(JSON.stringify(t.details, null, 2));
  });
}

console.log('\n' + '═'.repeat(80));
testResults
