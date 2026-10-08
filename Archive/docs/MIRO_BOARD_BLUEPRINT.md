# Spare-it Site Visit Form · Miro Board Blueprint

## Board Overview & Organization Strategy

This document outlines the structure for presenting the UX audit on a Miro board for team review and feedback.

---

## MIRO BOARD LAYOUT (5 Main Sections)

### **SECTION 1: TIMELINE (Left Column - 20% width)**
**Purpose:** Visual evolution from concept to current state

```
┌─────────────────────────────────────┐
│     EVOLUTION TIMELINE              │
│     (12 weeks, 7 phases)            │
├─────────────────────────────────────┤
│                                     │
│ Phase 1: CONCEPT                    │
│ └─ Basic form + 2 workflows         │
│                                     │
│ Phase 2: PIN UX                     │
│ └─ Feedback #1-2                    │
│ └─ Resolution: Unified workflows    │
│                                     │
│ Phase 3: GATEWAYS + DISPLAYS        │
│ └─ Feedback #3-4                    │
│ └─ Added: Yellow, Purple colors     │
│                                     │
│ Phase 4: RENDERING FIXES            │
│ └─ Feedback #5-6                    │
│ └─ Fixed: Display pins, highlighting│
│                                     │
│ Phase 5: DATA PERSISTENCE           │
│ └─ Feedback #7                      │
│ └─ Fixed: Render logic, validation  │
│                                     │
│ Phase 6: REPOSITIONING              │
│ └─ Feedback #8                      │
│ └─ Fixed: Confirmation modals       │
│                                     │
│ Phase 7: POLISH                     │
│ └─ Feedback #9                      │
│ └─ Added: btn-blue, --purple        │
│                                     │
└─────────────────────────────────────┘
```

**Miro Elements:**
- Timeline line with vertical milestones
- Color-coded phase tags
- Expandable feedback boxes with "Before/After" comparison
- Connected decision tree for each phase

---

### **SECTION 2: ARCHITECTURE (Top Center - 40% width)**
**Purpose:** System overview and data model

```
┌───────────────────────────────────────────────────────────────┐
│              SYSTEM ARCHITECTURE                              │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐                                          │
│  │  LOCAL STORAGE  │                                          │
│  │  (localStorage) │                                          │
│  └────────┬────────┘                                          │
│           │                                                   │
│  ┌────────▼─────────────────────────────────────┐            │
│  │     STATE OBJECT (S)                         │            │
│  │  ┌─────────────────────────────────────────┐ │            │
│  │  │ Building Info                           │ │            │
│  │  │ Waste Streams                           │ │            │
│  │  │ Context Photos                          │ │            │
│  │  │ Floors [] {                             │ │            │
│  │  │   Stations [] {id, letter, x, y, ...}  │ │            │
│  │  │   Gateways [] {id, label, x, y, ...}   │ │            │
│  │  │   Displays [] {id, label, x, y, ...}   │ │            │
│  │  │ }                                       │ │            │
│  │  └─────────────────────────────────────────┘ │            │
│  └──────────────────────────────────────────────┘            │
│           │                                                   │
│           ├─► persist()     (save to localStorage)           │
│           └─► render*()     (UI updates)                     │
│                                                               │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│              COLOR SYSTEM                                     │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  [████] Green #34A853      → Stations, Primary Actions      │
│  [████] Yellow #FFD600     → Gateways, Secondary Actions    │
│  [████] Purple #8B5CF6     → Displays, Tertiary Actions     │
│  [████] Blue #2563EB       → Position Buttons               │
│  [████] Red #EE4547        → Danger/Delete                  │
│  [████] Gray #EFEFEF       → Backgrounds, Borders           │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

**Miro Elements:**
- System diagram showing data flow
- Color palette with hex codes
- Component hierarchy tree
- Function categories (State, Render, Pin, Object, Modal, Utility)

---

### **SECTION 3: SCREENS & FLOWS (Center - 60% width)**
**Purpose:** Detailed view of all screens and their interactions

#### **Row 3.1: Screen Cards (S1-S6)**

```
┌──────────────────────────────────────────────────────────────────┐
│  S1: HOME              │  S2: FLOORS       │  S3: FLOOR DETAIL   │
│  ┌────────────────────┐ ┌───────────────┐ ┌──────────────────┐ │
│  │ [Building Info]    │ │ [Floor List]  │ │ [Floor Plan]     │ │
│  │ [Auditor]          │ │ [Stats]       │ │ [Pins]           │ │
│  │ [Streams Selector] │ │ [+ Add Floor] │ │ [Add Pin Button] │ │
│  │ [Begin Site Visit] │ │               │ │ [Lists below]    │ │
│  └────────────────────┘ └───────────────┘ └──────────────────┘ │
│           │                    │                     │           │
│           └────────────────────┼─────────────────────┘           │
│                                ▼                                 │
├──────────────────────────────────────────────────────────────────┤
│  S4: STATION DETAIL    │  S5: GATEWAY DETAIL   │  S6: DISPLAY   │
│  ┌────────────────────┐ ┌──────────────────┐  ┌──────────────┐ │
│  │ [Station Letter]   │ │ [Gateway Label]  │  │ [Display Label] │
│  │ [Location]         │ │ [Location]       │  │ [Location]  │ │
│  │ [Streams]          │ │ [Coverage Notes] │  │ [Notes]     │ │
│  │ [Bins List]        │ │ [Photo]          │  │ [Photo]     │ │
│  │ [Position Button]  │ │ [Position Button]│  │ [Position]  │ │
│  │ [Photo]            │ │ [Delete Button]  │  │ [Delete]    │ │
│  └────────────────────┘ └──────────────────┘  └──────────────┘ │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### **Row 3.2: Pin Placement Workflow (4 Paths)**

```
PATH 1: Add Pin → New Station
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│ Tap Floor   │────▶│ Confirm      │────▶│ Choose       │
│ Plan        │     │ Location     │     │ Station      │
└─────────────┘     └──────────────┘     └──────────────┘
                                              │
                    ┌─────────────────────────┤
                    │                         │
                    ▼                         ▼
            ┌──────────────┐          ┌──────────────┐
            │ New Station  │          │ Existing     │
            │ Modal        │          │ Station      │
            └──────────────┘          └──────────────┘
                    │                         │
                    └─────────────────────────┘
                            ▼
                    ┌──────────────┐
                    │ Success      │
                    │ Confirmation │
                    └──────────────┘

PATH 2: Add Station → Position
┌──────────────────┐     ┌──────────────┐     ┌──────────────┐
│ + Add Station    │────▶│ Fill Modal   │────▶│ Success      │
│ Button           │     │              │     │ Modal        │
└──────────────────┘     └──────────────┘     └──────────────┘
                                                      │
                                                      ▼
                                              ┌──────────────┐
                                              │ Position     │
                                              │ Button       │
                                              └──────────────┘
                                                      │
                                    [Then same as Add Pin workflow]

[Similar for Gateways & Displays]
```

**Miro Elements:**
- 6 screen cards with visual mockups (or screenshots)
- 4 workflow diagrams in swimlanes
- Modal connectors showing state transitions
- Success state indicators

---

### **SECTION 4: MODALS MATRIX (Right Column - 30% width)**
**Purpose:** Modal organization by workflow stage

```
┌────────────────────────────────────────┐
│      MODALS REFERENCE MATRIX           │
├────────────────────────────────────────┤
│                                        │
│  SETUP MODALS                          │
│  ├─ modal-stream-select                │
│  └─ modal-floor                        │
│                                        │
│  CREATION MODALS                       │
│  ├─ modal-station                      │
│  ├─ modal-gateway                      │
│  └─ modal-display                      │
│                                        │
│  POSITIONING MODALS                    │
│  ├─ modal-pin-type                     │
│  │  (location confirmation)            │
│  └─ modal-pin-location-confirmed       │
│     (final confirmation)               │
│                                        │
│  SUCCESS MODALS                        │
│  ├─ modal-station-created              │
│  ├─ modal-gateway-added                │
│  └─ modal-display-added                │
│                                        │
│  UTILITY MODALS                        │
│  ├─ modal-link-station                 │
│  ├─ modal-bin-select                   │
│  ├─ modal-edit-bin                     │
│  ├─ modal-position-new-station         │
│  ├─ modal-export                       │
│  └─ modal-validation                   │
│                                        │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│      STATE MANAGEMENT FLOW             │
├────────────────────────────────────────┤
│                                        │
│  pinMode: false/true                   │
│  stationPositioningMode                │
│  gatewayPositioningMode                │
│  displayPositioningMode                │
│  isRepositioning: false/true           │
│  pendingPinX/Y: null/number            │
│                                        │
│  → enterPinMode()                      │
│  → exitPinMode() [clears all]          │
│  → confirmPinLocation()                │
│  → repositionPin()                     │
│                                        │
└────────────────────────────────────────┘
```

**Miro Elements:**
- Modal reference cards with screenshots
- Modal trigger decision tree
- State machine diagram
- Function call stack

---

### **SECTION 5: FEEDBACK & ITERATIONS (Bottom - 100% width)**
**Purpose:** Document lesson learned and problem-solving journey

```
┌──────────────────────────────────────────────────────────────────────┐
│              FEEDBACK LOOP & ITERATIONS                              │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  FEEDBACK #1: Inconsistent Workflows                                │
│  ┌─────────────────────┐      ┌─────────────────────┐              │
│  │ BEFORE              │      │ AFTER               │              │
│  │ • Two separate UX   │ ──▶  │ • Unified workflows │              │
│  │   paths             │      │ • Same flow both    │              │
│  │ • Confusing states  │      │   entry points      │              │
│  │ • Unclear position  │      │ • Clear confirmation│              │
│  │   timing            │      │   steps             │              │
│  └─────────────────────┘      └─────────────────────┘              │
│                                                                      │
│  FEEDBACK #2: Double Counting                                       │
│  ┌─────────────────────┐      ┌─────────────────────┐              │
│  │ BEFORE              │      │ AFTER               │              │
│  │ • Multiple ways to  │ ──▶  │ • Single workflow   │              │
│  │   create objects    │      │ • Auto-prompt to    │              │
│  │ • Confusing states  │      │   position          │              │
│  │ • Unclear next step │      │ • Visual status     │              │
│  └─────────────────────┘      │   indicators        │              │
│                                └─────────────────────┘              │
│                                                                      │
│  FEEDBACK #3-9: [Similar before/after cards]                       │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Miro Elements:**
- Before/After comparison cards
- Decision tree for each issue
- Resolution documentation
- Impact assessment

---

## RECOMMENDED MIRO BOARD SETTINGS

### **Board Dimensions**
- **Width:** 20,000 px (accommodate 5 columns)
- **Height:** 12,000 px (accommodate 5 rows)
- **Grid:** 100px (for alignment)

### **Color Coding**
- **Phase 1-7:** Color-coded timeline backgrounds
- **Modals:** Yellow sticky notes
- **Screens:** Blue sticky notes
- **Feedback:** Orange sticky notes
- **Resolutions:** Green sticky notes

### **Interactive Elements**
- Expandable sections for detailed feedback
- Linked arrows showing state transitions
- Comment anchors on each phase for team discussion
- Sticky note areas for team input/feedback

---

## NEXT STEPS

### **Option 1: Full Miro Board Export**
1. Create board layout in Miro
2. Add all screens as embedded images/links
3. Create interactive decision trees
4. Set up comment/feedback sections
5. Share with team for review

### **Option 2: Screenshot-Based Presentation**
1. Capture screenshots of all 6 screens
2. Capture screenshots of all modal flows
3. Create visual flow diagrams
4. Organize in presentation format
5. Share for review and feedback

### **Option 3: Hybrid Approach (Recommended)**
1. Miro board with evolution timeline + architecture
2. Embedded links to live application
3. Screenshot gallery for detailed screen review
4. Comment sections for team feedback
5. Version control document for tracking changes

---

## SCRIPT FOR TEAM WALKTHROUGH

**Opening (2 min):**
"Over the past 12 weeks, we've built a comprehensive site visit platform that evolved through 7 phases based on team feedback. What you're seeing is not just the final product, but the journey of how we got here, including what was working, what wasn't, and how we fixed it."

**Timeline Walk (5 min):**
"Let me take you through the evolution. We started with a basic concept, identified some UX inconsistencies, expanded to support gateways and displays, fixed rendering issues, solved data persistence problems, and finally polished the UI."

**Architecture Explanation (3 min):**
"The system is built on a single state object that's persisted to localStorage. We have three object types—stations, gateways, and displays—each color-coded and managed through unified workflows."

**Screen Tour (8 min):**
"Starting from the home screen where you set up your building info and waste streams, you navigate through a floor-based structure. Each floor can have a floor plan where you pin stations, gateways, and displays. Then you dive into detail views to configure each object."

**Workflow Deep Dive (5 min):**
"The pin placement workflow is the heart of the app. Whether you start from the 'Add Pin' button or create an object first, the workflow converges to the same experience: confirm location, configure details, get confirmation, then see the result on the map."

**Feedback Demonstration (5 min):**
"Here's where I want your input. Each of these feedback items represents either a design decision, a bug fix, or an enhancement based on real usage. Are there any that you think we should revisit or any new feedback based on seeing the complete picture?"

**Closing (2 min):**
"This board is your space to comment, ask questions, and provide feedback. We've built this collaboratively, and this next iteration will continue to reflect your input. Let's make sure we're all aligned on where we are and where we're going."

---

## SUCCESS CRITERIA FOR REVIEW

Team should be able to answer:
- [ ] Can you describe the three main object types and their purposes?
- [ ] Do you understand the two entry points for creating objects?
- [ ] Can you identify what changed between Phase 2 and Phase 3?
- [ ] Do you see any gaps or missing functionality?
- [ ] Are there any UX flows that feel unintuitive?
- [ ] What would you like to see added or changed?

