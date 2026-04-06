# Front-end product requirements

**Audience:** Product design, engineering, content.  
**Scope:** Marketing site, auth entry, onboarding, dashboard, and trust/operational UX—structured so backend can evolve independently.  
**Principle:** *Practical, simple, trustworthy, revenue-oriented*—especially for Indian SME buyers who judge legitimacy quickly.

---

## How to use this document

1. **Trust & conversion** → ship early on the marketing site (nav CTAs, proof, pricing, legal, FAQ).  
2. **Guided setup** → onboarding wizard + empty states before deep features.  
3. **Copy** → business language in UI; technical terms only in advanced/docs.  
4. **Handoff** → use §21 wireframe format for Figma/spec tickets.

---

## 1. Requirement layers

### 1.1 Business trust (India SME)

The public site must make obvious:

| Question buyers ask | Surface |
|---------------------|--------|
| What problem, for whom? | Hero, Solutions, Industries |
| How fast to go live? | Hero chips, FAQ, onboarding promise (e.g. go live in ~30 min) |
| WhatsApp? | Hero, FAQ, product cards |
| Human takeover? | Hero chips, FAQ, product |
| Setup help? | Pricing tiers, Book demo, WhatsApp/contact |
| Cost? | **Pricing page** (INR, simple wording—no tokens) |
| Support in India? | Footer, contact, Help |
| Company reliability? | Social proof, legal, contact |

**Public site should include:** pricing, industry use cases, demo booking, testimonials, how it works, FAQ, privacy, terms, contact/WhatsApp sales CTA, clear onboarding promise.

### 1.2 UX for non-technical owners

- Guided onboarding wizard; template-based setup; suggested FAQs by industry.  
- Plain English; **visible next step** after every action; strong empty states.  
- Less dashboard clutter; mobile-friendly admin.  
- Admin wording: **operational** (leads, inbox, follow-ups)—not “orchestration.”

### 1.3 Sales conversion (two modes)

Every important screen should allow:

- Self-exploration  
- Book demo  
- Request setup help  
- Contact sales (e.g. WhatsApp)

### 1.4 Localization-ready (V1 English OK)

Design/copy hooks for: Hindi/Gujarati later; long business names; Indian phone formats; **INR**; local hours; mixed-language bot preview.

### 1.5 Emotional UX

Feel: simple, professional, *for businesses like mine*, in control, can reach a human.  
Avoid: “AI lab” aesthetic—prefer operational, business-safe UI.

---

## 2. Product surface areas (design all web surfaces)

| # | Area |
|---|------|
| 1 | Marketing website |
| 2 | Login |
| 3 | Signup |
| 4 | Onboarding wizard |
| 5 | Template selection |
| 6 | Connect channels |
| 7 | Upload business knowledge |
| 8 | Configure chatbot behavior |
| 9 | Preview/test bot |
| 10 | Publish/go live |
| 11 | Dashboard home |
| 12 | Conversations inbox |
| 13 | Leads view |
| 14 | Contacts / CRM-lite |
| 15 | Knowledge base |
| 16 | Automations |
| 17 | Analytics |
| 18 | Billing |
| 19 | Team management |
| 20 | Settings |
| 21 | Support / help center |

---

## 3. Public website

### 3.1 Header

- **Left:** logo + brand name.  
- **Nav:** Solutions, Industries, Pricing, How it works, Customers, FAQ.  
- **Right:** **Book Demo** (secondary), **Start Free** (primary), optional WhatsApp icon.  
- **Sticky:** solid background + subtle shadow after scroll.  
- **Mobile:** hamburger → full-height drawer with same items + Login + Book Demo + Start Free.

### 3.2 Hero

- **Eyebrow:** e.g. WhatsApp-first AI for Indian businesses.  
- **Headline:** outcome-led (capture leads, reply faster, follow up).  
- **Subhead:** India-first SME platform—website + WhatsApp.  
- **Trust chips:** WhatsApp, multilingual, human handoff, go live ~30 min.  
- **CTAs:** Start Free (primary), Book Live Demo (secondary), text link “See how it works.”  
- **Right:** composite visual (laptop widget + phone WhatsApp + mini lead card).  
- **Optional stat strip:** &lt;30 min setup · 24/7 replies · Built for Indian SMEs · Web + WhatsApp.

### 3.3 Social proof

- Headline: Trusted by growing Indian businesses.  
- Cards: Real Estate, Clinics, Coaching, Manufacturers, D2C—icon, one-line use case, short quote, “See use case.”  
- If no real logos yet: “Teams like yours” + icons; avoid fake company names.

### 3.4 How it works (4 steps)

1. Capture inquiries (web + WhatsApp)  
2. Answer instantly (your business info)  
3. Qualify customers  
4. Send to team  

Buttons: View product tour; Try live demo.

### 3.5 Industry solutions (tabs)

Tabs: Real Estate, Clinics, Coaching, Exporters, D2C—switch headline, sample questions, benefits.  
CTA: Explore [Industry] template.

### 3.6 Product preview grid

Cards: Team inbox, AI FAQ, Follow-up automation, Lead dashboard, Knowledge upload, Human handoff—Learn more each.

### 3.7 Pricing

Three tiers: Starter, Growth, Pro—INR/month, ideal size, channels, users, setup support, CTA.  
- Starter: Start Free · Growth: Book Demo · Pro: Talk to Sales.  
- No token/compute jargon on public pages.

### 3.8 FAQ (accordion)

Include: WhatsApp, handoff, coding needed?, setup time, upload brochures/FAQs, Hindi/Gujarati?, onboarding support?, multiple staff?

### 3.9 Footer

Columns: Product, Industries, Resources, Company, Legal.  
Links: Pricing, Book Demo, Contact, Help Center, Privacy, Terms, Cookie Policy.  
Bottom: ©, email, WhatsApp sales, LinkedIn.

---

## 4. Signup

### 4.1 Start Free (`/signup`)

**Fields:** Full name, work email, company name, mobile, business type, team size, password ×2.  
**Checkbox:** agree to Terms + Privacy (links).  
**Primary:** Create workspace.  
**Secondary:** Already have account? Sign in.  
**Right panel:** “What happens next?” — workspace → template → channels → knowledge → preview → go live.  
**Reassurance:** No credit card required.

### 4.2 Success screen

Headline: Your workspace is ready.  
Sub: Let’s set up your AI assistant in a few steps.  
**Primary:** Continue setup · **Secondary:** Explore dashboard later.

---

## 5. Onboarding wizard

**Chrome:** Progress bar + (desktop) left step list + right content.

**Suggested steps:** Business → Use cases → Template → Channels → Knowledge → Bot setup → Team notifications → Preview → Go live.

- **Business:** company, category, website, city, country (default India), hours, primary + extra languages. Helper: helps recommend template.  
- **Use cases:** multi-select cards (leads, FAQs, appointments, brochures, qualify, support) · Skip for now.  
- **Templates:** grid with preview · Start from scratch link.  
- **Channels:** Website chat + WhatsApp cards, status badges, Install later / Connect flows (UI wizard even if backend stubbed).  
- **Knowledge:** tiles (import web, PDF, FAQs, paste description, catalog) + drag-drop + suggested FAQs from template.  
- **Bot:** name, welcome, tone (professional / friendly / sales / support), languages, capture toggles, lead notify, handoff.  
- **Team:** emails, WhatsApp alert, assign dropdown, hours, after-hours.  
- **Preview:** tabs Website | WhatsApp; test chips; right rail: lead/intent/confidence/handoff mock.  
- **Go live:** checklist → celebration → Open dashboard / Install widget / Send test.

---

## 6. Dashboard information architecture

**Sidebar:** Home, Conversations, Leads, Contacts, Knowledge, Automations, Templates, Analytics, Team, Billing, Settings.

**Top bar:** workspace switcher, search, notifications, help, profile.

---

## 7. Dashboard home

- Greeting + “what’s happening today.”  
- KPIs: New leads, Resolved, Handoffs, Pending follow-ups.  
- Row: Recent conversations | Funnel mini-chart | Setup checklist.  
- Checklist items: connect web chat, upload FAQs, invite team, test WhatsApp, follow-ups.  
- Quick actions: Add FAQs, Test bot, View leads, Invite team, Install widget.

---

## 8–14. Feature surfaces (summary)

**Conversations:** 3-column inbox (list | thread | customer summary); tabs All/Unread/Me/Needs human/Resolved; search; thread actions (take over, resolve, note, template); composer. Mobile: list → thread → sheet for summary.

**Leads:** filters; table / kanban; slide-over detail (contact, history, AI summary, notes, tasks); actions: status, assign, follow-up, open conversation.

**Knowledge:** tabs Documents / FAQs / Website / Products; empty state; add-knowledge modal with tiles; row actions Preview/Rename/Disable/Delete; FAQ table (Q, A, language, category).

**Automations:** tabs Templates / Active / Drafts; cards with toggle + edit; editor as visual step cards (trigger → actions); Save / Test / Turn on.

**Analytics:** date range; KPI strip; charts (trends, source, top questions, bot vs human, funnel); insight cards in plain language.

**Billing:** current plan, usage, add-ons, payment method, history; Upgrade / Contact sales; simple copy.

**Settings:** tabs Workspace, Chat widget, WhatsApp, Team, Notifications, Branding, Privacy, API. Widget: color, position, welcome, avatar, show rules, delay, collect phone—Save + Preview.

---

## 15. UI component guidance

- **Buttons:** Primary solid (rounded ~10–12px); secondary outline; tertiary text; destructive red only for delete.  
- **Inputs:** Visible labels—not placeholder-only.  
- **Cards:** Rounded, light elevation, airy spacing.  
- **Icons:** MessageSquare, Phone, Globe, FileText, Bell, BarChart3, Bot, UserRound, Building2, Calendar, Settings, Languages, Workflow, ChevronRight, Upload, CheckCircle2.  
- **Color:** Trustworthy green or blue-green + neutrals; WhatsApp alignment OK.  
- **Type:** Strong marketing headlines; calmer dashboard type.

---

## 16. Sample journey (clinic owner)

Home → hero → Book demo or Start free → signup → success → onboarding → Clinic template → website chat → upload FAQs/timings → notifications → test questions → Go live → dashboard → inbox → lead → handoff.

**Feel:** guided setup, not software training.

---

## 17. Copy style

**Use:** Leads, inquiries, follow-ups, team inbox, website chat, customer questions, assign to staff, business info.

**Avoid in customer UI:** orchestration, node graph, multi-agent routing, embeddings, vector retrieval, LLM policy engine.

---

## 18. Explicit fixes (from audit)

- Strong **Start free** in header + hero.  
- Social proof section.  
- **Pricing** page + INR.  
- **Footer** + legal pages.  
- **FAQ** section.  
- Industry pages / grounded use cases.  
- Contact / demo / WhatsApp.  
- Accessibility (focus, labels, alt, reduced motion).  
- **SEO:** per-route title/description/OG.

---

## 19. Page list for design handoff

**Public:** Home, Solutions, Industries (+ detail), Pricing, FAQ, Book Demo, Login, Signup, Privacy, Terms, Cookies, Contact (or combined).

**App:** Onboarding wizard, Dashboard home, Conversations, Leads, Contact detail, Knowledge, Automations, Analytics, Billing, Settings, Help center.

---

## 20. What Indian SMEs value most

**Like:** Fast setup, visible WhatsApp, clear leads, team alerts, simple dashboard, affordable pricing, done-for-you feel, industry templates, human contact, no jargon.

**Care less (V1):** Fancy AI terminology, deep bot logic, heavy workflow graphs, dense analytics, too many settings at once.

---

## 21. Wireframe spec format (use per screen)

For each page, specify:

| Field | Notes |
|-------|--------|
| **Page** | Route / name |
| **Goal** | One line |
| **Section** | Named block (top to bottom) |
| **Component** | Cards, tabs, lists, modals |
| **Copy** | Key strings or intent |
| **Buttons** | Primary / secondary / destructive |
| **Interactions** | Open, validate, navigate, skip |
| **Empty state** | Exact message + 1–2 actions |
| **Mobile** | Stack order, drawers, sticky CTAs |

### Example: Marketing header

| Field | Spec |
|-------|------|
| Page | Global marketing shell |
| Goal | Navigate + convert |
| Components | Logo, nav links, Book Demo, Start Free, Sign in, WhatsApp optional |
| Interactions | Scroll adds bg + shadow; mobile drawer |
| Mobile | Drawer lists all links + CTAs at bottom |

### Example: Signup

| Field | Spec |
|-------|------|
| Goal | Create account + consent |
| Sections | Form / “What happens next” / legal |
| Empty/error | Inline validation; API errors plain language |
| Success | Separate view: Continue setup vs Dashboard later |

---

## Revision

Update this document when scope changes; link Figma and engineering tickets from your tracker.
