# Manual Testing Guide
## Comprehensive Interactive Testing with Automated Logging

**Date:** June 10, 2026  
**Total Tests:** 26 manual test scenarios  
**Estimated Duration:** 45-60 minutes  
**Status:** Ready to execute

---

## Quick Start

### 1. Load the Script
```javascript
// In Chrome DevTools Console (F12), paste:
// COMPREHENSIVE_MANUAL_TEST_SCRIPT.js (entire content)
```

### 2. You'll See This:
```
📋 TESTING COMPLETE - AVAILABLE COMMANDS

View current results:
  → viewResults()

Mark a test as passed/failed:
  → markTestResult("test_1", "PASS", "optional notes")

Export final report:
  → const report = exportResults()
```

### 3. Follow Test Instructions
- Script guides you through each test
- Perform the interaction described
- Mark PASS or FAIL when done

### 4. Record Results
```javascript
// After completing a test:
markTestResult('test_1', 'PASS')
// or
markTestResult('test_1', 'FAIL', 'Pin appeared 5% off to the right')
```

---

## Test Structure

### 7 Test Sessions

| # | Session | Tests | Duration |
|---|---------|-------|----------|
| 1 | Pan & Drag Interactions | 5 tests | 10 min |
| 2 | Zoom Interactions | 4 tests | 8 min |
| 3 | Repositioning Interactions | 4 tests | 10 min |
| 4 | Gateway & Display Positioning | 3 tests | 8 min |
| 5 | Visual Consistency | 4 tests | 8 min |
| 6 | Edge Cases & Stress Tests | 5 tests | 12 min |
| 7 | Complete Workflow Tests | 2 tests | 10 min |
| | **TOTAL** | **27 tests** | **~60 min** |

---

## How to Use the Script

### Start Testing
1. Open your application in Chrome
2. Press F12 to open DevTools
3. Click "Console" tab
4. Copy entire `COMPREHENSIVE_MANUAL_TEST_SCRIPT.js`
5. Paste into console and press Enter

### Read Test Instructions
The script outputs:
```
──────────────────────────────────────────────────────────────────────────
🧪 TEST test_1: [Pan Direction] Pan Left at 150% Zoom
──────────────────────────────────────────────────────────────────────────

📝 INSTRUCTIONS:
   1. Zoom to 150% (use zoom controls)
   2. With your finger/mouse, drag the image TO THE RIGHT
   3. Drag all the way until the left edge reaches the container left edge
   4. Notice the left edge stops and cannot go further

✓ PASS CRITERIA:
   1. Image moves smoothly when dragging
   2. Pan stops at left edge (cannot drag past)
   3. No black space appears to the left of the image
   4. Dragging feels responsive and not laggy

💬 When done, call: markTestResult('test_1', 'PASS' or 'FAIL', 'optional notes')
```

### Perform the Test
Follow the instructions exactly, checking each pass criterion

### Mark the Result
```javascript
// If everything passed:
markTestResult('test_1', 'PASS')

// If something failed:
markTestResult('test_1', 'FAIL', 'Pan was jerky when reaching the edge')

// With more detail:
markTestResult('test_1', 'FAIL', 'Image jitter at left extreme; also took 2 seconds to respond')
```

### Move to Next Test
Script automatically shows next test instructions

### Check Progress
```javascript
viewResults()
```

Output shows:
```
Total Tests: 27
✅ Passed: 5
❌ Failed: 1
⏳ Pending: 21
Success Rate: 83.3%

Completed Tests:
  ✅ [Pan Direction] Pan Left at 150% Zoom
  ✅ [Pan Direction] Pan Right at 150% Zoom
  ✅ [Pan Direction] Pan Up at 150% Zoom
  ❌ [Pan Direction] Pan Down at 150% Zoom
  ✅ [Pan Direction] Rapid Pan Left/Right at 175% Zoom

Pending Tests:
  ⏳ [Zoom Behavior] Pinch Zoom (if on mobile)
  ...
```

---

## Session Details

### SESSION 1: Pan & Drag Interactions (5 tests)
**What:** Test dragging at different directions and zoom levels  
**Duration:** ~10 minutes  
**Key scenarios:**
- Pan left at 150% zoom
- Pan right at 150% zoom  
- Pan up at 150% zoom
- Pan down at 150% zoom
- Rapid pan at 175% zoom

**What you're looking for:**
- Smooth dragging (no jitter)
- Pan stops at edges (doesn't drag past)
- No black space around image
- Responsive controls

---

### SESSION 2: Zoom Interactions (4 tests)
**What:** Test zoom functionality and zoom + pan combinations  
**Duration:** ~8 minutes  
**Key scenarios:**
- Pinch zoom on mobile (if applicable)
- Pan, then zoom (rescaling)
- Zoom back to 100% while panned
- Zoom through all levels while panning

**What you're looking for:**
- Smooth zoom transitions
- Pan rescales correctly
- View stays centered
- No sudden jumps

---

### SESSION 3: Repositioning Interactions (4 tests)
**What:** Test adding and repositioning stations at various zoom/pan levels  
**Duration:** ~10 minutes  
**Key scenarios:**
- Add station at 100% zoom
- Add station while panned at 150%
- Reposition station at pan extreme
- Add stations at different zoom levels

**What you're looking for:**
- Green circle at tap location
- Position matches where you tapped
- Accurate coordinates despite zoom/pan
- No offset errors

---

### SESSION 4: Gateway & Display Positioning (3 tests)
**What:** Test gateway and display placement  
**Duration:** ~8 minutes  
**Key scenarios:**
- Add gateway at 150% panned
- Add display at pan extreme
- Add all three object types on same floor

**What you're looking for:**
- Each object type places accurately
- Coordinates are correct
- Objects don't conflict
- No performance issues

---

### SESSION 5: Visual Consistency (4 tests)
**What:** Verify no visual glitches or black space  
**Duration:** ~8 minutes  
**Key scenarios:**
- No black space at any pan extreme
- Pin visibility after pan/zoom
- Smooth bounds enforcement
- Zoom transition smoothness

**What you're looking for:**
- Image always fills container
- No empty space around edges
- Pins stay visible and accessible
- Smooth animations (no jank)

---

### SESSION 6: Edge Cases & Stress Tests (5 tests)
**What:** Push the app to its limits  
**Duration:** ~12 minutes  
**Key scenarios:**
- Rapid drag at maximum zoom
- Pan to extreme then add station
- Zoom while at pan extreme
- Reposition multiple times
- Create 5+ stations at various positions

**What you're looking for:**
- App doesn't crash
- Bounds enforced even under stress
- Coordinates stay accurate
- No performance degradation
- Responsive under heavy use

---

### SESSION 7: Workflow Tests (2 tests)
**What:** Test complete real-world workflows  
**Duration:** ~10 minutes  
**Key scenarios:**
- Complete floor plan setup (upload, create, add objects)
- Edit/reposition objects after creation

**What you're looking for:**
- Smooth workflow from start to finish
- No data loss
- Changes persist
- Ready for operations team

---

## Recording Results

### PASS
```javascript
markTestResult('test_5', 'PASS')
```

### FAIL with Details
```javascript
markTestResult('test_5', 'FAIL', 'Pan was jerky at the left extreme')

markTestResult('test_5', 'FAIL', 'Station placed 10% too far right; coordinate offset')

markTestResult('test_5', 'FAIL', 'Black space appeared at right edge; bounds not enforced')
```

### Pending (Skip for Now)
Just don't mark it - script tracks pending tests

---

## Viewing Results

### Quick Status Check
```javascript
viewResults()
```

Shows summary and what's done/pending

### Detailed Test Info
```javascript
// View all test details
manualTestSuite.results.forEach(t => {
  console.log(`${t.testId}: ${t.testName} - ${t.result}`);
});

// View specific test
manualTestSuite.results[0]
```

### Export Final Report
```javascript
const report = exportResults()
```

Outputs JSON that you can save/share

---

## Best Practices

### 1. Test One Session at a Time
- Don't jump around
- Complete a session before moving to next
- Gives brain time to focus

### 2. Be Systematic
- Follow instructions exactly
- Don't skip steps
- Test one variable at a time

### 3. Note Edge Cases
- If something feels off, add notes:
  ```javascript
  markTestResult('test_12', 'PASS', 'Works but slightly laggy at 175% zoom')
  ```

### 4. Test on Real Device If Possible
- Desktop browser gives one perspective
- Mobile browser gives another
- Both are valid test environments

### 5. Take Breaks
- 60 minutes is a lot of testing
- Take 5-minute breaks between sessions
- Keeps you fresh and focused

---

## Troubleshooting

### Script doesn't work after pasting?
```javascript
// Check if script loaded:
manualTestSuite

// Should show object with timestamp, results array, etc.
```

### Can't find a test?
```javascript
// Search by name:
manualTestSuite.results.find(t => t.testName.includes('Pan Left'))

// View first test:
manualTestSuite.results[0]
```

### Need to re-run a test?
```javascript
// Just mark it again (overwrites previous result):
markTestResult('test_1', 'PASS', 'Re-tested, now passing')
```

### Lost track of which test you're on?
```javascript
// View pending tests only:
manualTestSuite.results.filter(t => t.status === 'pending').slice(0, 3)
```

---

## Export & Share Results

### Get JSON Report
```javascript
const report = exportResults()
```

Copy the JSON output and save to file

### Share with Team
```javascript
// Email the JSON, paste in Slack, or save to file
JSON.stringify(report, null, 2)
```

Report includes:
- Test name and category
- Pass/fail status
- Your notes
- Timestamp
- Duration of each test

---

## Success Criteria

### ✅ All Tests PASS if:
- Pan works smoothly in all directions
- Zoom transitions smoothly
- Repositioning is accurate at all zoom/pan levels
- No black space appears
- No visual jitter or glitches
- App handles stress testing well
- Complete workflows execute smoothly

### ⚠️ Acceptable Issues:
- Minor lag on very old devices
- Slight pan jitter under extreme stress
- Imperceptible coordinate rounding (< 1%)

### ❌ Critical Issues:
- App crashes
- Pan drags past image bounds
- Black space appears around image
- Coordinates off by significant margin (> 5%)
- Pins disappear or become inaccessible
- Repositioning doesn't work

---

## Time Management

```
Session 1 (Pan):           0:00 - 0:10 (10 min)
Session 2 (Zoom):          0:10 - 0:18 (8 min)
Break:                     0:18 - 0:23 (5 min)
Session 3 (Reposition):    0:23 - 0:33 (10 min)
Session 4 (Gateway/Disp):  0:33 - 0:41 (8 min)
Break:                     0:41 - 0:46 (5 min)
Session 5 (Visual):        0:46 - 0:54 (8 min)
Session 6 (Edge Cases):    0:54 - 1:06 (12 min)
Session 7 (Workflow):      1:06 - 1:16 (10 min)
─────────────────────────────────────────
Total:                     ~60 minutes
```

---

## What to Capture

### For Each FAIL, Note:
1. **Exact action taken** - What you did step-by-step
2. **Expected behavior** - What should have happened
3. **Actual behavior** - What actually happened
4. **Zoom level & pan position** - Context
5. **Device/browser** - For reproduction

Example:
```javascript
markTestResult('test_3', 'FAIL', `
Action: Zoomed to 150%, panned left -85.75px, tapped center
Expected: Green circle at center (50%, 50%)
Actual: Green circle appeared ~5% too far left
Zoom: 150%, Pan: -85.75px
Device: Chrome on MacBook
`)
```

---

## Next Steps After Testing

1. **Compile results** - Export report
2. **Identify patterns** - Are failures similar?
3. **Prioritize fixes** - Critical vs nice-to-have
4. **Create issues** - Document each failure
5. **Re-test** - After fixes, run relevant tests again

---

## Summary

You now have:
- ✅ 27 structured manual tests
- ✅ Automated result logging
- ✅ Progress tracking
- ✅ JSON export for reporting
- ✅ Clear pass/fail criteria

**Estimated total time:** 60 minutes  
**Expected result:** 95%+ tests should PASS (app is mathematically sound)

---

**Ready to test? Paste the script and start with Session 1!**
