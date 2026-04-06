# Page-specific UX rules (app)

**Audience:** Product, design, engineering.  
**Purpose:** Turn global UX principles into **checkable rules per screen** so every page answers: *where am I*, *what matters*, *what do I do next*.

**Global formula (dashboards & ops):** **State → Action → Evidence**  
(What is true now → what to do → why it matters.)

**One-line flow principle:** Good flows make users feel they are **moving forward**, not figuring things out.

---

## Shared rules (all in-app pages)

| Rule | Requirement |
|------|-------------|
| **Clarity** | Within a few seconds: location, purpose, primary action, what matters most. |
| **Recognition** | Persistent nav; active section obvious; status badges where setup/integration applies (Connected, Not connected, Needs setup, Draft, Live). |
| **Feedback** | Every destructive or important action: loading, success, or error—user never wonders “did that work?” |
| **Trust** | Demo/sample data is labeled; user can tell live vs demo; dismiss or soften recurring banners after first exposure where possible. |
| **Hierarchy** | Scan order: headline → primary CTA → summary metrics/alerts → detail. Avoid explanation-before-action on dashboards. |

---

## Overview (`/dashboard`)

**One main job:** Summarize **health** and drive the **next best activation or operational step**—not explain the product.

### Order (top → bottom)

1. **State (compact):** 3–5 KPIs—conversations (period), open/unread or needs human, leads new or due, setup completion % or “X of Y setup steps done.”
2. **Action:** One **primary** next step (e.g. Connect WhatsApp, Upload knowledge, Install widget, Open conversations with filter)—driven by real state when data exists; sensible default when empty.
3. **Attention:** Short list of **urgent** items (e.g. “3 conversations need reply,” “2 leads unassigned”) with links—empty state if none.
4. **Setup checklist:** Progress visible (“2 of 5”) with links; collapsible or secondary if user is already live.
5. **Evidence:** Trends or week-over-week only after core state/action are clear; keep charts secondary.
6. **Education:** Product explanation, tips, links to Help—**below** operational blocks.

### Must include

- Dismissible or de-emphasized **demo/data-source** banner after acknowledgment.
- **Quick actions** as shortcuts, not a substitute for “next best action.”

### Anti-patterns

- Long explanatory copy before metrics or actions.
- Multiple competing “primary” buttons without hierarchy.
- Banners that draw more attention than KPIs + next step.

---

## Conversations (`/dashboard/chat-logs` and thread views)

**One main job:** Help the team **process threads fast**—read, assign, reply, escalate.

### Order

1. **State:** Inbox summary in header or sticky bar—total open, needs human, unread (definitions consistent app-wide).
2. **Action:** Primary: open next urgent thread or filter to “Needs attention.” Secondary: search, assign, mark done.
3. **Evidence:** Timestamps, channel, lead/customer label on row; SLA or “waiting since” if you add it later.

### Must include

- Filters visible (channel, status, date)—don’t hide behind mystery icons without labels.
- Thread view: clear **reply** affordance; loading on send; message send confirmation.
- Empty state: what “no conversations” means + link to install widget / test bot.

### Anti-patterns

- Decorative chrome that slows scanning.
- Reply actions without loading/success feedback.

---

## Leads (`/dashboard/leads`)

**One main job:** Make **pipeline and ownership** obvious—who owns what, what’s next, what’s stale.

### Order

1. **State:** Counts by stage or status; “needs follow-up” or overdue if applicable.
2. **Action:** Primary: add lead / open next follow-up. Row actions: assign, change stage, log activity.
3. **Evidence:** Source (widget, WhatsApp, etc.), last activity, value if used.

### Must include

- Table or board with **readable labels** (no recall-only icons).
- Empty state: import/add + link to widget/conversations so leads aren’t a dead end.

### Anti-patterns

- Grid of cards with no sort/filter when list grows.
- No owner or next step visible on the row/card.

---

## Knowledge (`/dashboard/knowledge-base` and related)

**One main job:** Let users **edit what the bot knows** safely—structure, status, preview.

### Order

1. **State:** Count of sources/FAQs/documents; “last updated”; sync/index status if relevant.
2. **Action:** Primary: add FAQ / upload / add URL—match your real entry points. Secondary: organize categories.
3. **Evidence:** Preview or “what the bot will use” snippet; clear **Draft vs Live** if versioning exists.

### Must include

- Confirmation on delete; undo where feasible.
- Clear **empty state** with 2–3 paths (upload, paste FAQs, link site)—not a single dead-end CTA.

### Anti-patterns

- Save without visible success.
- Technical jargon in default copy (e.g. “embeddings”) without plain-English equivalent nearby.

---

## Widget (install & preview: e.g. `/dashboard/integrations`, `/dashboard/bot-preview`)

**One main job:** Get the widget **installed and verified** with minimal fear of breaking the site.

### Order

1. **State:** Installed or not; last seen ping or “snippet not detected” if you track it.
2. **Action:** Copy snippet / verify installation / open preview—one clear path for “first time” vs “already installed.”
3. **Evidence:** Preview that matches production behavior; test message success.

### Must include

- **Copy-paste** with success feedback; optional domain allowlist explained in one line.
- Preview page: obvious “this is how visitors see it” vs admin chrome.

### Anti-patterns

- Wall of code with no “you’re done” moment.
- Preview that doesn’t match the live widget configuration.

---

## Automations (`/dashboard/automations`)

**One main job:** Make **rules and outcomes** understandable—what runs, when, and how to pause.

### Order

1. **State:** List of automations with **on/off**, last run, failure count if applicable.
2. **Action:** Create automation; edit; pause/resume—pause must be obvious for trust.
3. **Evidence:** Plain-language trigger + action summary on each row (not only internal IDs).

### Must include

- Empty state: 1–2 suggested templates or examples + link to docs/Help.
- Toggle/publish feedback and error surfacing if a run fails.

### Anti-patterns

- Builder-first screen with no summary list for returning users.
- No way to disable quickly in one action.

---

## Optional: Integrations (channels)

**One main job:** **Connect** or **reconnect** channels with clear connection status.

- Each integration: badge (Connected / Not connected / Error), one primary connect/reconnect, short “what this enables.”
- After OAuth/token flow: return page shows **success or next step** explicitly.

---

## Review checklist (before shipping a page)

1. **Where am I?** — Title + nav match user mental model.  
2. **What matters most?** — Above the fold in the first 1–2 scrolls on desktop.  
3. **What next?** — One dominant primary action; secondaries visible but quieter.  
4. **State → Action → Evidence** — Order respected for dashboard/ops pages.  
5. **No dead ends** — Every empty state has next steps + links.  
6. **Feedback** — Critical actions confirm or fail visibly.  
7. **Trust** — Demo/live and data source are honest and not louder than the job of the page.

---

## Relationship to other docs

- **Product requirements & breadth:** `frontend-product-requirements.md`  
- **This doc:** Per-page UX **rules** for implementation and design QA—not feature backlog.
