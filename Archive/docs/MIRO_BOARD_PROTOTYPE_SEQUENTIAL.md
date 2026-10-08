# Miro Board Design: Sequential Prototype Walkthrough
**Demonstrating Current Capabilities Through User Journey**

---

## 📐 BOARD SPECIFICATION

| Property | Value |
|----------|-------|
| **Board Name** | Site Visit Form: Prototype Walkthrough |
| **Layout** | Sequential (Left to Right) |
| **Focus** | Current capabilities demonstration |
| **Audience** | Internal operations team |
| **Dimensions** | 24,000 × 12,000 px |
| **Grid** | 100px alignment |

---

## 🎯 BOARD STRUCTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  HEADER SECTION (Top Center)                                               │
│  "Site Visit Form: Sequential Prototype Walkthrough"                        │
│  "Walk through a complete site visit from start to finish"                  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1: SETUP              PHASE 2: PLANNING              PHASE 3: DATA   │
│  ┌─────────────────┐        ┌──────────────────┐         ┌──────────────┐ │
│  │ [Screenshot S1] │──────→ │ [Screenshot S2]  │────────→│ [Screenshot] │ │
│  │ Home Form       │        │ Create Floors    │         │ Ready to     │ │
│  │ Fill building   │        │ Multi-floor      │         │ add objects  │ │
│  │ info & streams  │        │ support          │         │              │ │
│  │ Capability:     │        │ Capability:      │         │ Capability:  │ │
│  │ • Initial setup │        │ • Floor mgmt     │         │ • Structure  │ │
│  │ • Stream select │        │ • Multi-level    │         │   ready      │ │
│  └─────────────────┘        └──────────────────┘         └──────────────┘ │
│                                                                             │
│  PHASE 4: STATIONS          PHASE 5: GATEWAYS           PHASE 6: DISPLAYS  │
│  ┌──────────────────┐      ┌──────────────────┐        ┌──────────────────┐
│  │ [Screenshot S4]  │──────→│ [Screenshot S5]  │───────→│ [Screenshot S6]  │
│  │ Add Stations     │      │ Add Gateways     │        │ Add Displays     │
│  │ Main entrance    │      │ LoRa devices     │        │ Signage/monitors │
│  │ Capability:      │      │ Capability:      │        │ Capability:      │
│  │ • Create objects │      │ • Gateway mgmt   │        │ • Display mgmt   │
│  │ • Positioning    │      │ • Color-coded    │        │ • 3-object types │
│  │ • Location notes │      │ • Coverage data  │        │ • Unified system │
│  └──────────────────┘      └──────────────────┘        └──────────────────┘
│                                                                             │
│  PHASE 7: COMPLETE          PHASE 8: REVIEW             PHASE 9: EXPORT    │
│  ┌──────────────────┐      ┌──────────────────┐        ┌──────────────────┐
│  │ [Screenshot]     │──────→│ [Screenshot]     │───────→│ [Screenshot]     │
│  │ All objects      │      │ Floor overview   │        │ Export data      │
│  │ positioned       │      │ All 3 types      │        │ CSV export       │
│  │ Capability:      │      │ Capability:      │        │ Capability:      │
│  │ • Full floor     │      │ • Visibility     │        │ • Data export    │
│  │ • Ready for data │      │ • Complete view  │        │ • Integration    │
│  └──────────────────┘      └──────────────────┘        └──────────────────┘
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  BOTTOM SECTION: KEY CAPABILITIES SUMMARY                                   │
│  ┌────────────────────────────────────────────────────────────────────────┐│
│  │ ✅ Multi-floor support | ✅ 3 object types (Stations/Gateways/Displays) │
│  │ ✅ Color-coded system | ✅ Photo capture | ✅ Position management      │
│  │ ✅ Data persistence | ✅ CSV export | ✅ Responsive mobile design     │
│  └────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📸 SCREENSHOT MAPPING (Current 17 images)

### **PHASE 1: Setup (S1 Screenshots)**
- **S1_empty** → "Empty home form - starting point"
- **S1_building** → "Building name entered"
- **S1_address** → "Address entered"
- **S1_hauler** → "Hauler/vendor selected"
- **S1_date** → "Date of visit set"
- **S1_complete** → "Form complete, ready for next step"
- **S1_streams_modal** → "Waste streams selection modal"
- **S1_stream_selected** → "Streams selected, confirmed"

### **PHASE 2: Planning (S2 Screenshots)**
- **S2_empty** → "Empty floors list - begin site visit"
- **S2_add_modal** → "Creating first floor"
- **S2_with_floors** → "Multiple floors created"

### **PHASE 3: Data Structure (S3 Screenshots)**
- **S3_floor_detail** → "Floor detail - ready for objects"

### **PHASE 4: Stations (S4 Screenshots)**
- **S4_station_modal** → "Creating station"
- **S4_station_filled** → "Station details entered"
- **S4_station_created** → "Station added to floor"

### **PHASE 5: Gateways (S5 Screenshots)**
- **S5_gateway_modal** → "Creating gateway"
- **S5_gateway_created** → "Gateway visible on floor"

### **PHASE 6: Displays (S6 Screenshots)**
- **S6_display_modal** → "Creating display"
- **S6_display_created** → "Display added to floor"

### **PHASE 7-9: Complete & Export (Features)**
- **Feature_complete_floor** → "All objects on floor plan"
- **Feature_color_system** → "Color-coded system visible"
- **Feature_all_badges** → "All three types represented"

---

## 🎨 VISUAL DESIGN

### **Card Layout (Each Screenshot)**
```
┌────────────────────────────────┐
│  [Screenshot: 520px × 600px]   │
├────────────────────────────────┤
│ PHASE N: [Phase Name]           │
│ ──────────────────────────────  │
│ What's Happening:               │
│ [User action description]       │
│                                 │
│ Capability Shown:               │
│ • [Capability 1]                │
│ • [Capability 2]                │
│ • [Capability 3]                │
├────────────────────────────────┤
│ → Next Phase                    │
└────────────────────────────────┘
```

### **Color Scheme**
- **Background:** #F5F5F5 (light gray)
- **Cards:** #FFFFFF (white)
- **Headers:** #34A853 (green)
- **Arrows/Connectors:** #757575 (gray)
- **Station badge:** Green (#34A853)
- **Gateway badge:** Yellow (#FFD600)
- **Display badge:** Purple (#8B5CF6)

### **Typography**
- **Phase Title:** 18px, Bold, #34A853
- **Action Description:** 14px, Regular, #2A2A2A
- **Capability List:** 12px, Regular, #757575
- **Arrow Text:** 11px, Regular, #757575

---

## 📍 POSITIONING GUIDE

### **Layout Math**
- **Total Width:** 24,000px
- **9 Phases × 2,200px each** = 19,800px (left-aligned)
- **Summary Section:** Bottom 3,000px (full width)

### **Phase Card Positions**
```
Phase 1: X: 1,000 - 3,200
Phase 2: X: 3,400 - 5,600
Phase 3: X: 5,800 - 8,000
Phase 4: X: 8,200 - 10,400
Phase 5: X: 10,600 - 12,800
Phase 6: X: 13,000 - 15,200
Phase 7: X: 15,400 - 17,600
Phase 8: X: 17,800 - 20,000

Summary: X: 1,000 - 20,000 | Y: 9,000 - 12,000
```

### **Vertical Alignment**
- **Screenshot:** Y: 1,500 - 3,500
- **Description Box:** Y: 4,000 - 6,500
- **Arrows between phases:** Y: 2,800 (connecting line)

---

## ✅ BUILD CHECKLIST

- [ ] Create 9 phase cards
- [ ] Insert 17 screenshots in correct positions
- [ ] Add phase titles and descriptions
- [ ] Add capability lists under each screenshot
- [ ] Draw connecting arrows between phases
- [ ] Add summary section at bottom
- [ ] Format with consistent styling
- [ ] Align all elements to 100px grid
- [ ] Test zoom levels for readability
- [ ] Add navigation hints if interactive

---

## 💡 HOW TO USE THIS BOARD

**During Presentation:**
1. Start at Phase 1 (Setup) and walk through left to right
2. At each phase, explain what the user sees and what capability it demonstrates
3. Emphasize the logical flow from initial setup through complete data collection
4. Show how all 3 object types (S/G/D) are handled consistently
5. End with summary showing breadth of capabilities

**For Internal Team:**
- Use as reference for new team member onboarding
- Show in meetings to demonstrate current state
- Reference specific screenshots when discussing features
- Update as new capabilities are added

**For Stakeholders:**
- Walk through as proof of concept/working prototype
- Demonstrate operational readiness
- Show mobile-first design and usability
- Highlight the consistent, intuitive workflow

---

## 🔄 EXPANSION STRATEGY

As you capture more screenshots, this sequential layout naturally grows:
- Add more detail phases between current ones
- Insert before/after comparisons
- Add error state examples
- Include advanced workflows
- Show mobile responsiveness across devices

The linear flow makes it easy to insert new content without redesigning the entire board.

---

**Ready to build this board in Miro!** The sequential layout is straightforward to assemble and immediately tells the story of what the application can do through demonstrated user actions.
