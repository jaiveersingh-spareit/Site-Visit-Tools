# 🚀 Feature Improvements Roadmap

**Date:** May 8, 2026  
**Status:** In Progress  
**Based on:** User testing feedback from iOS device  

---

## 📋 Requirements Summary

### User Testing Feedback
Tested on iPhone - buttons work, but UX gaps identified:

---

## 🎯 Feature Implementation Order

### Phase 1: Quick Fixes (Priority 1)
These should be done first as they're quick wins and unblock other features.

#### 1.1 Fix Sync Badge Overlap
- **Issue:** Sync icon overlaps with export button on mobile
- **Solution:** Only show sync badge when something is pending
- **Position:** Top-right corner
- **Estimate:** 15 minutes
- **Status:** 🔴 Not started

#### 1.2 Image Rotation Feature
- **Feature:** Ability to rotate images after upload
- **Applies to:** Context photos, Station photos, Gateway photos
- **UX:** Add rotation buttons (↶ ↷) in photo preview
- **Estimate:** 30 minutes
- **Status:** 🔴 Not started

---

### Phase 2: Pin Management (Priority 1)
Core floor plan functionality - users need this to position pins correctly.

#### 2.1 Pin Edit Toggle Mode
- **Feature:** Toggle button "Edit Pins" to enable drag-to-move mode
- **Current:** Long-press detection exists but may not be obvious
- **New:** Explicit "Edit Pins" toggle button on floor view
- **Behavior:** 
  - Click "Edit Pins" → Pins become draggable
  - Click "Done" → Exit edit mode, save positions
- **Mobile UX:** Clear visual feedback that pins are editable
- **Estimate:** 45 minutes
- **Status:** 🔴 Not started

#### 2.2 Station → Auto-Pin Generation
- **Workflow:** User creates station → Auto-generates pin on floor plan
- **Current State:** Station created separately from pins
- **New Flow:**
  1. User creates station (name, letter, location)
  2. Station saved
  3. Auto-pin appears on floor plan
  4. User can drag pin to precise location
- **Estimate:** 60 minutes
- **Status:** 🔴 Not started

#### 2.3 Station-Pin Auto-Connection in Modal
- **Feature:** New stations auto-show as options when placing pins
- **Current:** Station selection modal shows only existing pinned stations
- **New Behavior:**
  - When placing a pin, modal shows ALL stations (newly created ones too)
  - User can link pin to any station
  - Station automatically marked as "pinned"
- **Estimate:** 45 minutes
- **Status:** 🔴 Not started

---

### Phase 3: Photo Upload Enhancements (Priority 1)
Users need gallery access in addition to camera.

#### 3.1 Multi-Source Photo Upload
- **Current:** Camera only
- **Add:** Phone gallery / camera roll
- **Must Have:**
  - Camera (take photo)
  - Phone gallery / camera roll (select existing photos)
- **Nice-to-Have:**
  - Google Drive (future iteration)
- **UX:** Two buttons: "📷 Take Photo" + "🖼️ Choose File"
- **Applies to:**
  - Context photos
  - Station photos
  - Gateway photos
- **Estimate:** 60 minutes
- **Status:** 🔴 Not started

---

### Phase 4: Gateway Management (Priority 2)
Gateway positioning and editing workflow improvements.

#### 4.1 Gateway Detail Page Edit
- **Current:** Edit pencil icon on floor page
- **New:** Edit on gateway detail page
- **Behavior:**
  - User clicks pencil on gateway detail page
  - Modal opens to edit name/type
  - Pencil removed from floor plan view
- **Estimate:** 30 minutes
- **Status:** 🔴 Not started

#### 4.2 Gateway Floor Plan Positioning
- **Current:** Can't position gateway on floor plan after creation
- **New:** Both options available
  - **Option A:** Create gateway details → Position on floor plan
  - **Option B:** Click floor plan location → Add gateway details
- **Estimate:** 90 minutes
- **Status:** 🔴 Not started

---

### Phase 5: Display Functionality (Priority 2)
New feature equivalent to gateways.

#### 5.1 Display Floor Plan Integration
- **Feature:** Add display placement like gateways
- **Includes:**
  - Display creation form
  - Floor plan positioning (both options)
  - Display detail page with edit capability
  - Photo upload for displays
- **Estimate:** 120 minutes
- **Status:** 🔴 Not started

---

## 📊 Implementation Timeline

| Phase | Feature | Time | Priority | Status |
|-------|---------|------|----------|--------|
| 1.1 | Fix sync badge | 15 min | Critical | 🔴 |
| 1.2 | Image rotation | 30 min | Critical | 🔴 |
| 2.1 | Pin edit toggle | 45 min | Critical | 🔴 |
| 2.2 | Station → auto-pin | 60 min | Critical | 🔴 |
| 2.3 | Station auto-link modal | 45 min | Critical | 🔴 |
| 3.1 | Photo upload sources | 60 min | Critical | 🔴 |
| 4.1 | Gateway edit modal | 30 min | Important | 🔴 |
| 4.2 | Gateway positioning | 90 min | Important | 🔴 |
| 5.1 | Display functionality | 120 min | Important | 🔴 |
| **Total** | | **495 min** | | |

**Estimated Total:** ~8 hours of development + testing

---

## ✅ Iteration Process

For each feature:

1. **Implement** - Code the feature
2. **Test on Mac** - Verify locally with Python server
3. **Test on iPhone** - User testing on actual device
4. **Iterate** - Gather feedback, refine UX
5. **Document** - Update this roadmap
6. **Move next** - Start next feature

---

## 🎯 Next Steps

1. Start with **Phase 1.1** (Fix sync badge) - Quick win
2. Follow with **Phase 1.2** (Image rotation) - Quick win
3. Then **Phase 2.1** (Pin edit toggle) - Core functionality
4. Continue through phases in order

Each feature will be:
- ✅ Implemented
- ✅ Tested on iPhone
- ✅ User feedback gathered
- ✅ Refined/iterated

---

## 📝 Notes

- Image rotation applies to ALL photo uploads (context, station, gateway, display)
- Sync badge: Only show when data is pending sync (not always visible)
- Pin edit mode: Explicit toggle button for clarity (not auto long-press)
- Station workflow: Both paths available for flexibility
- Gateway/Display: Both positioning options available for user choice

---

**Ready to start Phase 1.1?** 🚀
