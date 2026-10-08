# Site Visit App — Slack Channel & PM Setup Options

**Prepared for:** Jaiveer Singh (Project Manager)
**Scope:** Two related tools tracked in **one** Slack channel
- **VISION Site Visit App** — external-facing tool (no-Zoom HTML), part of the VISION product line
- **Site Visit App (Internal)** — operations tool for populating the admin platform with a site's waste setup

**Purpose of this doc:** lay out the options and best practices so you can pick the setup that fits. Nothing has been posted to Slack yet — this is a draft for your review.

---

## 1. Channel structure (single channel)

Since both tools live in one channel, the challenge is keeping the external and internal workstreams cleanly separated without splitting the channel. Three ways to do that:

**Option A — Threads by workstream (lightest).** Post two pinned "anchor" messages: `🟦 VISION (external)` and `🟩 Internal Ops tool`. Everyone replies in the relevant thread. Cheap to run, but threads get buried over time.

**Option B — Emoji/tag convention (recommended for a single channel).** Every top-level post starts with a tag: `[VISION]`, `[OPS]`, or `[BOTH]`. Combined with a Canvas index (Section 2), this makes search and scanning fast and keeps the main channel readable. Low overhead, high payoff.

**Option C — Canvas-driven with Lists per workstream.** Keep the channel for conversation, and push all *tracking* into two Slack Lists (one per tool) embedded in the channel Canvas. Best structure, slightly more setup.

**Naming suggestion:** `#proj-site-visit-app` (or `#vision-site-visit`). Set a clear channel topic and description that names both tools and links the Canvas.

**Recommendation:** Option B + C together — tag convention for chat, Lists for tracking, Canvas as the home base.

---

## 2. The information repository — how to build the "home base"

You have three realistic homes for a knowledge repository. They are complementary, not mutually exclusive.

**Slack Canvas (recommended as the front door).** A Canvas pinned to the channel acts as the always-visible index. It can hold rich text, links, embedded Lists, and even embedded workflows. Put here: project overview, links to both tools' repos/deploy files, key docs (your Google Docs/Sheets already attached to this project), owners, and a "start here" section. Best for: the curated, rarely-changing reference layer.

**Slack Lists (recommended for anything that changes).** Native project tracking inside Slack — rows = items, columns = assignee, status, due date, priority, workstream. Sort/filter/group by field. Use one List for the **product backlog / bugs** and one for **site deployments** (which building, stage, blockers). Best for: living, filterable trackers.

**External docs (Google Drive) as the deep archive.** Your project already links several Google Docs and Sheets (incl. the *Site Visit Form – Feedback Tracker* and *Batch Sample API*). Keep long-form specs, test logs, and raw data there; link them from the Canvas rather than duplicating. Best for: heavy documents and version history.

**Suggested repository layout (in the Canvas):**
1. **Start Here** — what this channel/project is, the two tools, who owns what
2. **VISION (external) app** — deploy link, feedback tracker, roadmap, known issues
3. **Internal Ops tool** — deploy link, admin-platform setup workflow, SOPs
4. **Trackers** — embedded Lists (backlog/bugs + deployments)
5. **Key docs** — links to Google Drive files (specs, test logs, data)
6. **Decisions log** — dated running list of key decisions
7. **Cadence & rituals** — standup, demo, status-post schedule (Section 4)

---

## 3. Integrations & apps to supercharge the work

Grouped by what you're trying to accomplish. Start with the ⭐ items; add the rest as needed.

**Native Slack (no extra approval needed)**
- ⭐ **Workflow Builder** — automate the repetitive stuff: a "Report a bug" form that files into your bug List; a weekly reminder to post status; an onboarding message for new members. No code.
- ⭐ **Lists** — the trackers described above.
- ⭐ **Canvas** — the repository home base.
- **Huddles + Clips** — quick live syncs and async video updates instead of meetings.
- **Scheduled messages** — pre-write your Monday status post.

**Project / task management (pick one if you want tracking outside Slack)**
- **Asana**, **Jira**, or **Linear** — if engineering already uses one, connect it so issue updates post to the channel. If not, Slack Lists alone may be enough for now.

**Docs & files**
- ⭐ **Google Drive app for Slack** — link-unfurl previews, and get notified on comments/changes to your Feedback Tracker and specs. Fits your existing Google Docs/Sheets.

**Engineering visibility (the app is a single HTML file in a repo)**
- **GitHub / GitLab for Slack** — deploy notifications, PR/commit activity, and issue sync into the channel. Useful given the version history (v3.0) and DAILY_TEST workflow.

**Status & meetings**
- **Google Calendar app** — surfaces site-visit and demo events in Slack.
- A **standup bot** (Geekbot / Standuply, or a Workflow Builder form) — async daily/weekly check-ins so you aren't chasing people.

**Recommendation to start:** Workflow Builder + Lists + Canvas (native) and the Google Drive app. Add GitHub and a standup bot once the channel is live.

> Note: most Slack apps require workspace-admin approval to install. You may need to request these from whoever administers your Slack.

---

## 4. Keeping everyone up to date (PM cadence)

Pick a rhythm and automate the reminders with Workflow Builder so it runs itself:

- **Weekly status post (recommended).** Every Monday, a short update in a consistent format: *Shipped / In progress / Blocked / Next.* Tag `[VISION]` and `[OPS]` sections. Schedule it or trigger a Workflow reminder.
- **Async standup (optional).** 2–3 questions posted daily/2×week via a Workflow form or standup bot.
- **Milestone / demo posts.** When a version ships (like v3.0) or a site goes live, post to the channel and update the Canvas decisions log.
- **Monthly rollup.** A brief summary for stakeholders — pairs well with the existing maintenance-action-plan reporting.

A consistent template matters more than frequency. Keep the format identical each time so people can scan it in seconds.

---

## 5. Suggested rollout order

1. Create/rename the channel; set topic, description, and pin the Canvas.
2. Build the Canvas with the Section 2 layout; link your existing Google docs.
3. Create the two Lists (backlog/bugs + deployments).
4. Add the Google Drive app; add GitHub if engineering wants deploy visibility.
5. Set up a Workflow Builder "Report a bug" form and a weekly status reminder.
6. Post a "Start Here" welcome message and invite the team.

---

## Decisions for you to make

1. **Channel structure:** tag convention (B), Canvas+Lists (C), or both? *(recommended: both)*
2. **Tracking home:** Slack Lists only, or connect Asana/Jira/Linear?
3. **Integrations to request from your Slack admin:** Google Drive, GitHub, Calendar, standup bot — which do you want?
4. **Cadence:** weekly status only, or add async standups?

Once you choose, I can draft the actual Canvas content, the List column schemas, the Workflow Builder steps, and the status-post template — and post them to Slack when you're ready.

---

*Sources: [Slack Canvas](https://slack.com/features/canvas), [Slack Lists announcement](https://slack.com/blog/news/introducing-slack-lists), [Guide to Slack Workflow Builder](https://slack.com/help/articles/360035692513-Guide-to-Slack-Workflow-Builder), [Automate data collection with canvas and Workflow Builder](https://slack.com/help/articles/25883690838419-Automate-data-collection-with-canvas-and-Workflow-Builder), [Guide to Slack channel templates](https://slack.com/help/articles/33223290843667-Guide-to-Slack-channel-templates).*
