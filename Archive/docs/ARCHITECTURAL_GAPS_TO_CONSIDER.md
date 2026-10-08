# Architectural Gaps - Missing Context for the Meeting

## What the Slack Conversation Covered ✅
- Problem 1: Pre-population
- Problem 2: Cloud photo storage
- Solution options: API, Firebase, hybrid
- Security concerns
- Stack considerations

---

## What's MISSING (Architectural Context)

### **GAP 1: Existing Spare-it Data Assets** 🏗️

**Question:** What data already exists in VISION that you could leverage?

**Missing context:**
- Does VISION already have buildings, addresses, client info?
- Does VISION already have floor plans uploaded?
- Can you query existing PwC sites from VISION?
- What's the source of truth for "building data"?

**Why it matters:**
If PwC's 10 sites already exist in VISION with floor plans, you don't need new API—you query what's already there.

**For the meeting:**
*"Before building new API endpoints, can we leverage existing PwC data in VISION?"*

---

### **GAP 2: Existing Auth/User Management** 🔐

**Question:** Does Spare-it already have authentication?

**Missing context:**
- Does VISION already have OAuth, JWT, user roles?
- Are sites tied to users/customers?
- Can you use existing Spare-it auth instead of building new?
- How do multi-tenant permissions work?

**Why it matters:**
If Spare-it has auth, Firebase adds it redundantly. If you use existing auth, security is simpler.

**For the meeting:**
*"Should we use existing Spare-it authentication instead of adding Firebase auth?"*

---

### **GAP 3: Existing Storage Infrastructure** ☁️

**Question:** What storage does Spare-it already use?

**Missing context:**
- Is AWS already your infrastructure?
- Do you already use S3 for other assets?
- Why introduce Firebase (Google Cloud) if you're AWS-first?
- Is there cost/vendor lock-in concern?

**Why it matters:**
Romain suggested Firebase for simplicity. But if you're AWS-only, S3 + Lambda is simpler (one vendor, one bill, one security model).

**For the meeting:**
*"Given our existing AWS infrastructure, should photos live in S3 with Lambda functions instead of Firebase?"*

---

### **GAP 4: Relationship to Existing TRACK/ENGAGE** 🔗

**Question:** How does this site visit form fit into the broader product?

**Missing context:**
- Is this a VISION module, or standalone?
- Do ops teams use ENGAGE already? Should data appear there?
- Does TRACK (IoT) have building/bin data that should pre-populate?
- Should this integrate with existing dashboards?

**Why it matters:**
If it's truly standalone, Firebase makes sense. If it's part of larger product, integrate with existing infrastructure.

**For the meeting:**
*"Is this a standalone Ops tool, or should it integrate with VISION/TRACK/ENGAGE? That affects architecture."*

---

### **GAP 5: Existing Operations Workflows** 👥

**Question:** How does Lowell's team currently work?

**Missing context:**
- What tools does ops team already use? (Slack? Dashboard? Email?)
- Where do they review data now?
- Should photos appear in existing ENGAGE portal?
- Can you auto-sync to their existing workflow?

**Why it matters:**
Building new UI in Firebase might create duplicate work. If ops team already has a dashboard, sync photos there instead.

**For the meeting:**
*"Lowell, where should photos appear in your existing workflow? Should this tool push data to ENGAGE, or pull from VISION?"*

---

### **GAP 6: Offline Sync Strategy** 🔄

**Question:** How does offline sync work with existing architecture?

**Missing context:**
- If you use Firebase, how do you sync back to VISION?
- If you use AWS API, how do you queue offline changes?
- What's the single source of truth?
- How do you handle conflicts if auditor edits offline then online?

**Why it matters:**
The choice of backend affects how you handle offline → online transition and data consistency.

**For the meeting:**
*"Once data syncs from mobile to cloud, where does it live? VISION database? Firebase? Both?"*

---

### **GAP 7: Multi-Site, Multi-Customer Complexity** 🏢

**Question:** How does data ownership work?

**Missing context:**
- 10 PwC sites = 10 separate audits?
- Can different ops teams see different sites?
- Is there customer-level access control?
- Should photos be private per customer or shared?

**Why it matters:**
This affects database schema, API permissions, and auth model. It's bigger than just "store photos."

**For the meeting:**
*"How should we structure permissions? Can PwC site A only see their photos, not site B?"*

---

### **GAP 8: Data Lifecycle and Compliance** 📋

**Question:** What happens to photos after the audit?

**Missing context:**
- How long are photos retained?
- Do you need audit trail (who captured, when)?
- Are photos tied to waste categorization for reporting?
- Do you need to comply with data retention policies?

**Why it matters:**
Simple cloud storage isn't enough if you need compliance, reporting, or audit trails.

**For the meeting:**
*"How should photos integrate with existing Spare-it reporting? Should they show in carbon footprint reports?"*

---

### **GAP 9: Integration with Existing Waste Categories** 🗑️

**Question:** Does Spare-it have waste stream definitions?

**Missing context:**
- Are waste streams (Trash, Compost, Recycling) defined in VISION?
- Should they be pre-populated in the site visit form?
- Should photos be tagged with waste stream?
- Should this feed into existing analytics?

**Why it matters:**
Photos aren't just images—they're data points tied to waste streams and carbon impact.

**For the meeting:**
*"Should photos auto-link to waste streams so ops team can report: 'Cardboard station captured 47 photos'?"*

---

### **GAP 10: Operational Handoff** 🤝

**Question:** What happens after survey is complete?

**Missing context:**
- Who receives the data? (Support email?)
- How does it transition to deployment workflow?
- Should ops team have a checklist/workflow to act on it?
- Where does deployment tracking happen?

**Why it matters:**
Photos in cloud are worthless if they don't enable action.

**For the meeting:**
*"Once survey is complete, what's ops team's next action? How should photos enable that?"*

---

## Strategic Questions to Raise

### **For Laurent (Architecture):**
*"Should this be built as a VISION module using existing infrastructure, or as a standalone tool? That determines everything."*

### **For Romain (R&D):**
*"Before we choose between API/Firebase, can we audit what authentication, storage, and data infrastructure already exists?"*

### **For Lowell (Operations):**
*"How do you want to consume this data? In your current dashboard? Via email? In real-time? That affects the solution."*

---

## The Missing Piece

**What's not being discussed:**
> "How does this site visit app fit into Spare-it's broader product architecture?"

**This affects EVERYTHING:**
- If standalone → Firebase might be best (simple, self-contained)
- If integrated → Use existing VISION infrastructure (cleaner long-term)
- If operations-focused → Sync to existing ops dashboards (actionable)

---

## What to Add to the Conversation

**One strategic question that changes the discussion:**

*"Before we decide on backend technology, should we clarify:*
1. *Is this a VISION feature or standalone tool?*
2. *Can we use existing Spare-it infrastructure (auth, storage, database)?*
3. *Where should data appear for ops team to act on it?"*

**Once those three are answered, the best technology choice becomes obvious.**

---

## Recommendation

Suggest in the meeting:

*"I think we should agree on two things first:*
1. *How this integrates with existing Spare-it architecture*
2. *Where operations team interacts with the data*

*Then the choice between API, Firebase, or hybrid becomes clearer."*

This shows strategic thinking + prevents over-engineering.

