# Miro Board Integration Guide
**Step-by-Step Instructions for Building the Board**

---

## 📋 PRE-SETUP CHECKLIST

Before starting, ensure you have:

- [ ] Miro account access
- [ ] All screenshots captured (currently 17+, targeting 85+)
- [ ] Screenshot manifest file
- [ ] This integration guide
- [ ] MIRO_BOARD_DESIGN_RADIAL.md (layout reference)
- [ ] UX_AUDIT_AND_EVOLUTION.md (content reference)
- [ ] 1-2 hours blocked for setup

---

## 🚀 QUICK START (30 minutes)

### **Phase 1: Create Base Board (5 min)**

1. Go to miro.com → Create new board
2. Set name: "Site Visit Form: Evolution & Capabilities"
3. Set size: Custom → 24000 × 20000
4. Enable grid: Grid → 100px
5. Save

### **Phase 2: Add Timeline Center (10 min)**

1. Insert shape: Vertical line (height: 4000px)
2. Position at center: (12000, 8000)
3. Add 7 circles along line (Phase 1-7)
4. Label each phase:
   - Phase 1: Concept
   - Phase 2: Pin UX
   - Phase 3: Expand
   - Phase 4: Rendering
   - Phase 5: Data
   - Phase 6: Reposition
   - Phase 7: Polish
5. Color code each phase (use green shades)

### **Phase 3: Add Section Headers (10 min)**

1. Add text box top center: "ARCHITECTURE"
   - Position: 12000 x 1500
   - Size: 4000 × 2000

2. Add text box right: "SCREENS & WORKFLOWS"
   - Position: 20000 x 8000
   - Size: 4000 × 8000

3. Add text box bottom: "CAPABILITIES"
   - Position: 12000 x 16500
   - Size: 4000 × 2000

4. Add text box left: "KEY LEARNINGS"
   - Position: 4000 x 9000
   - Size: 4000 × 8000

5. Add text box bottom-right: "FEEDBACK & ITERATIONS"
   - Position: 18000 x 17000
   - Size: 4000 × 2000

### **Phase 4: Import Screenshots (5 min)**

1. Drag/drop screenshot folder into Miro
2. Organize by section (sort into piles)
3. Position roughly in correct sections
4. Don't worry about precise layout yet

---

## 🔧 DETAILED SETUP (Full Process)

### **SECTION 1: ARCHITECTURE (Top)**

**Position:** 10000 - 14000 x 1500 - 3500

**Content to Add:**

1. **System Diagram Card** (left side)
   - Create rectangle frame
   - Add title: "System Architecture"
   - Add 3 boxes:
     - "localStorage" → "State Object" → "UI Render"
   - Connect with arrows

2. **Data Model Card** (center)
   - Add code block or text box
   - Show JSON structure (buildings, floors, stations, gateways, displays)

3. **Color Palette Card** (right side)
   - 5 colored squares
   - Labels:
     - Green: Stations (#34A853)
     - Yellow: Gateways (#FFD600)
     - Purple: Displays (#8B5CF6)
     - Blue: Actions (#2563EB)
     - Red: Delete (#EE4547)

**Implementation Steps:**
1. Create 3 frame cards (size: 1200 × 1500 each)
2. Arrange horizontally with 200px gaps
3. Add colored backgrounds
4. Insert descriptions as text

---

### **SECTION 2: SCREENS & WORKFLOWS (Right)**

**Position:** 18000 - 22000 x 6000 - 14000

**6 Main Screen Cards (3×2 Grid):**

Layout:
```
[S1: Home]      [S2: Floors]    [S3: Floor Detail]
[S4: Station]   [S5: Gateway]   [S6: Display]
```

For each screen:
1. Insert screenshot (430px wide)
2. Add frame label below (e.g., "S1: Home Screen")
3. Add short description (10-20 words)
4. Color-code borders by object type

**Pin Placement Workflows (Below screens):**

Create 4 workflow diagrams:
```
Workflow 1: Add Pin → New Station
  [Floor Plan] → [Tap] → [Modal] → [Created]

Workflow 2: Add Station → Position
  [Button] → [Form] → [Floor Plan] → [Positioned]

Workflow 3: Add Gateway → Position
  [Button] → [Form] → [Floor Plan] → [Positioned]

Workflow 4: Add Display → Position
  [Button] → [Form] → [Floor Plan] → [Positioned]
```

**Implementation Steps:**
1. Create 6 frames (520px × 600px each)
2. Arrange in 3×2 grid
3. Insert screenshots (resize to fit)
4. Add titles and descriptions
5. Create 4 flow diagrams below
6. Use arrows to show progression

---

### **SECTION 3: CAPABILITIES (Bottom)**

**Position:** 10000 - 14000 x 16000 - 18500

**3 Capability Cards:**

1. **Feature Checklist**
   - Title: "✅ Implemented Features"
   - 15 checkmarked items
   - Size: 2000 × 1800

2. **Metrics Card**
   - Title: "📊 Key Metrics"
   - 6 stat boxes (6 screens, 15+ modals, 4 workflows, etc.)
   - Size: 2000 × 1800

3. **Roadmap Preview**
   - Title: "🔄 Future Enhancements"
   - 8 upcoming items
   - Size: 2000 × 1800

**Implementation Steps:**
1. Create 3 cards side-by-side
2. Add checkmarks/bullets for lists
3. Format numbers prominently
4. Use light background colors

---

### **SECTION 4: KEY LEARNINGS (Left)**

**Position:** 2000 - 6000 x 6000 - 14000

**5 Learning Cards (Vertical Stack):**

For each learning:
1. Create frame (3200px wide)
2. Split into 2 halves: BEFORE | AFTER
3. Left side (red tint): Problem state
4. Right side (green tint): Solution
5. Arrow connecting them

**Cards:**
1. **Unified Workflows** (top)
   - Before: Separate entry points
   - After: Single consistent flow

2. **Position as State** (2nd)
   - Before: Optional positioning
   - After: Explicit status indicators

3. **Color Coding** (middle)
   - Before: No visual distinction
   - After: S/G/D color system

4. **Modal-Driven Workflows** (4th)
   - Before: Unclear boundaries
   - After: Clear step progression

5. **Data Persistence** (bottom)
   - Before: Objects disappearing
   - After: Preserved throughout

**Implementation Steps:**
1. Create 5 frames (3200 × 1200 each)
2. Arrange vertically with 300px gaps
3. Add colored backgrounds (before/after)
4. Use icons/symbols for visual clarity
5. Add brief explanations

---

### **SECTION 5: FEEDBACK & ITERATIONS (Bottom-Right)**

**Position:** 14000 - 22000 x 16000 - 19000

**9 Feedback Cards (3×3 Grid):**

For each feedback item:
1. Create frame (2200 × 1600)
2. Title: Issue name
3. Problem description (4-5 words)
4. Solution description (4-5 words)
5. Impact statement

**Feedback Items:**
1. Inconsistent Workflows
2. Double Counting
3. Gateway Support
4. Display Support
5. Display Visibility
6. Green Highlight Remaining
7. Object Disappearing
8. Repositioning Inconsistencies
9. Visual Design Issues

**Implementation Steps:**
1. Create 9 frames in 3×3 grid
2. Use consistent sizing (2200 × 1600)
3. Add before/after sections
4. Color gradient: red (before) → green (after)
5. Include resolution approach

---

## 🎨 STYLING & FORMATTING

### **Color Scheme**

```css
/* Section backgrounds */
--architecture-bg: #E8F5E9 (light green)
--screens-bg: #E3F2FD (light blue)
--capabilities-bg: #FFF3E0 (light orange)
--learnings-bg: #F3E5F5 (light purple)
--feedback-bg: #FCE4EC (light pink)

/* Text */
--header-text: #34A853 (green)
--body-text: #2A2A2A (dark)
--secondary-text: #757575 (gray)

/* Accents */
--station-color: #34A853 (green)
--gateway-color: #FFD600 (yellow)
--display-color: #8B5CF6 (purple)
--action-color: #2563EB (blue)
--error-color: #EE4547 (red)
```

### **Typography**

- **Headers**: 24-28px, Bold (#34A853)
- **Titles**: 18-20px, Semibold (#2A2A2A)
- **Body**: 14-16px, Regular (#2A2A2A)
- **Labels**: 12-13px, Regular (#757575)

### **Spacing**

- Section gaps: 800-1000px
- Card gaps: 200-300px
- Internal padding: 20-30px
- Line height: 1.6

---

## 📐 PRECISE POSITIONING GUIDE

### **Center Timeline**
- X: 12000
- Y: 8000 (center)
- Height: 4000px
- 7 phases at 500px intervals

### **Architecture**
- X: 12000
- Y: 2500
- 3 cards horizontal

### **Screens (Right)**
- X: 20000
- Y: 10000
- 3×2 grid

### **Capabilities (Bottom)**
- X: 12000
- Y: 17250
- 3 cards horizontal

### **Learnings (Left)**
- X: 4000
- Y: 10000
- 5 cards vertical

### **Feedback (Bottom-Right)**
- X: 18000
- Y: 17500
- 3×3 grid

---

## ✅ BUILD CHECKLIST

### **Phase 1: Setup**
- [ ] Create board (24K × 20K)
- [ ] Set up grid (100px)
- [ ] Add board title

### **Phase 2: Timeline & Headers**
- [ ] Add center timeline
- [ ] Add 7 phase markers
- [ ] Add 5 section headers
- [ ] Color-code timeline

### **Phase 3: Architecture Section**
- [ ] Add system diagram
- [ ] Add data model
- [ ] Add color palette
- [ ] Format and style

### **Phase 4: Screens & Workflows**
- [ ] Insert 6 screen screenshots
- [ ] Add labels and descriptions
- [ ] Create 4 workflow diagrams
- [ ] Add navigation arrows

### **Phase 5: Capabilities Section**
- [ ] Add feature checklist
- [ ] Add metrics card
- [ ] Add roadmap preview
- [ ] Format lists

### **Phase 6: Key Learnings Section**
- [ ] Create 5 learning cards
- [ ] Add before/after sections
- [ ] Color backgrounds
- [ ] Add explanations

### **Phase 7: Feedback Section**
- [ ] Create 9 feedback cards
- [ ] Add issue descriptions
- [ ] Add resolutions
- [ ] Color-code items

### **Phase 8: Final Polish**
- [ ] Align all elements to grid
- [ ] Add shadows/borders
- [ ] Verify spacing
- [ ] Add legend/key
- [ ] Review overall flow

### **Phase 9: Finalization**
- [ ] Add comments for sections
- [ ] Set up team access
- [ ] Create presentation view
- [ ] Test navigation
- [ ] Share with team

---

## 🎯 QUICK REFERENCE: Element Sizes

| Element | Width | Height | Color |
|---------|-------|--------|-------|
| Section header | 4000 | 800 | #34A853 |
| Screen frame | 520 | 600 | Varies |
| Learning card | 3200 | 1200 | Varies |
| Feedback card | 2200 | 1600 | Varies |
| Timeline phase | 400 | 400 | Green shade |
| Capability card | 2000 | 1800 | #FFF3E0 |

---

## 💡 TIPS FOR SUCCESS

1. **Use frames**: Group related elements in frames for easier organization
2. **Name everything**: Label all shapes and frames for team clarity
3. **Color consistently**: Stick to the color scheme throughout
4. **Grid alignment**: Use grid to keep everything neat and professional
5. **Test zoom levels**: Verify legibility at different zoom levels
6. **Share early**: Get feedback before final polish
7. **Document connections**: Use arrows to show relationships
8. **Keep it readable**: Don't overcrowd; use whitespace effectively

---

## 📞 SUPPORT RESOURCES

- **Design questions**: Refer to MIRO_BOARD_DESIGN_RADIAL.md
- **Content questions**: Refer to UX_AUDIT_AND_EVOLUTION.md
- **Screenshot naming**: Check SCREENSHOTS_STATUS.md
- **Manifest data**: Review MANIFEST.json for all captured images

---

**Ready to build? Start with the Quick Start section (30 min) or follow the full Detailed Setup for comprehensive implementation (2 hours).**

