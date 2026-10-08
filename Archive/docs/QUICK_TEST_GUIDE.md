# QUICK TEST GUIDE - Team Feedback Changes

**Changes Implemented:** Station Creation Flow Redesign (Changes 2A-2D)  
**Test Date:** May 15, 2026

---

## QUICK START TEST

### Step 1: Auto-Generated Station Letters
1. Open `Spare-it_site_visit_form.html` in browser
2. Click "Create New Site Visit"
3. Fill in basic info (Building, Date, etc.) and click "Begin Site Visit"
4. Click "Add Station" button

**Expected Result:**
- Modal opens with Station Letter field showing "A"
- Field is READ-ONLY (you can't type in it)
- [✎ Edit] button appears next to the field

### Step 2: Test Edit Letter
1. Click the [✎ Edit] button
2. Try typing in the letter field

**Expected Result:**
- Field becomes editable (read-only removed)
- You can change the letter
- Cursor is focused in the field
- Text is selected for easy replacement

### Step 3: Location Field Removal (VISUAL CHECK)
1. Look at the Add Station modal

**Expected Result:**
- NO dropdown field for "Location / Name"
- NO custom location input field
- NO "+ Add Custom Location" button
- Only Station Letter field visible (plus Cancel/Add buttons)

### Step 4: Create Station with Pre-Populated Bins
1. Before testing stations, go back and select some waste streams
2. In the landing page, select 2-3 waste streams (e.g., Trash, Recycling, Compost)
3. Click "Begin Site Visit"
4. Create a floor with a floor plan
5. Click "Add Station"
6. Accept the auto-generated letter "A" (click "Add Station" button)

**Expected Result:**
- Station A is created
- Click on Station A to view details
- In the Bins section, you should see ALL selected streams as bins:
  - Trash (Medium)
  - Recycling (Medium)
  - Compost (Medium)
- Each bin shows the stream name and scale

### Step 5: Test Bin Deletion
1. In the station detail view, find the Bins section
2. Click the ✕ button on one of the bins

**Expected Result:**
- Bin is deleted
- UI refreshes
- That stream is removed from the station
- Other bins remain intact

### Step 6: Test Multi-Station Flow
1. Back to floor view
2. Click "Add Station" again

**Expected Result:**
- Modal shows "B" (next letter in sequence)
- Create station B
- Station B should also have all selected streams as pre-populated bins

---

## DETAILED TEST CHECKLIST

### Auto-Generated Letters (2A)
- [ ] First station shows "A"
- [ ] Second station shows "B"
- [ ] Edit button allows changing letter
- [ ] Can create station with custom letter
- [ ] Letters save correctly

### Location Field Removal (2B)
- [ ] No location dropdown in modal
- [ ] No custom location input in modal
- [ ] No "+ Add Custom Location" button
- [ ] Station creation still works
- [ ] No console errors

### Station Logic Update (2C)
- [ ] Stations created without location field
- [ ] Can create station with just letter
- [ ] No validation error for missing location
- [ ] Export still works correctly

### Bin Pre-Population (2D)
- [ ] All selected streams appear as bins
- [ ] Each bin defaults to "Medium" scale
- [ ] Can adjust scale for each bin
- [ ] Can delete individual bins
- [ ] Multiple stations each have their own bins
- [ ] Bin changes save correctly

### Data Integrity
- [ ] Exported data includes all bins
- [ ] Station data doesn't have "name" field
- [ ] Bins array is properly structured
- [ ] Photos still work with bins

---

## TESTING AREAS (Optional Deeper Testing)

### Scale Adjustment
1. Create station with pre-populated bins
2. Click on a bin to edit it
3. Change scale from "Medium" to "Small" or "Large"
4. Verify change saves

### Accessories
1. Edit a bin
2. Add accessories (e.g., Button, LOKSAK Bag)
3. Verify accessories display correctly
4. Delete bin and verify

### Multi-Floor Testing
1. Create floor 1 with station A (bins auto-generated)
2. Create floor 2 with station A (bins auto-generated)
3. Verify bins are independent on each floor

### Export Test
1. Create complete site visit with pre-populated bins
2. Click Export ZIP
3. Open exported data
4. Verify bins are included in export
5. Verify structure matches expected format

---

## TROUBLESHOOTING

### Issue: Edit button doesn't work
**Solution:** Refresh page, try again

### Issue: Bins not showing as pre-populated
**Cause:** Streams not selected on landing page  
**Solution:** Go back, select streams, then create station

### Issue: Console errors about undefined functions
**Solution:** Check that you're using the latest updated HTML file

### Issue: Station letter not auto-generating
**Cause:** Old version of file  
**Solution:** Use the updated `Spare-it_site_visit_form.html` from May 15, 2026

---

## WHAT TO REPORT IF ISSUES FOUND

1. **Describe the issue clearly**
2. **Steps to reproduce**
3. **Expected vs. actual result**
4. **Browser and device used**
5. **Screenshot if possible**
6. **Console errors (if any)**

---

**File to Test:** Spare-it_site_visit_form.html (Updated May 15, 2026)  
**Estimated Test Time:** 10-15 minutes for quick test, 30-45 minutes for detailed test
