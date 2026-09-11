# Agency OS

A client onboarding and agency operations platform: the structured path from a
signed contract through onboarding, delivery, reporting, and feedback — one
system for both the agency team and their clients, so nobody ever has to
wonder "what happens now?"

## Live demo

_Pending deployment — see [Deployment](#deployment) below._

## Overview

Every client gets the same clear path:

```
Contract → Welcome → Invoice → Access Request → Kickoff → Project Execution
  → Deliverables → Monthly Reporting → Feedback → Testimonial
```

The **agency workspace** (`/dashboard`) is where the team runs that process:
tracking clients, sending contracts and invoices, uploading deliverables,
publishing reports. The **client portal** (`/portal`) is the one place a
client goes to see where things stand, what's needed from them, and what's
been delivered — never a fake metric, a placeholder testimonial, or a button
that doesn't actually do anything.

## Features

- **Clients** — company records with a lifecycle status (prospect → onboarding
  → active → paused → completed → archived)
- **Contracts** — draft, send, and client e-sign (a plain record-of-agreement,
  explicitly not a substitute for legal review or a certified e-signature
  service)
- **Welcome** — a one-click "send welcome" step the client sees in their portal
- **Invoices** — line-item invoices with automatic numbering, send/paid
  tracking, and a read-time "overdue" status derived from the due date
- **Access requests** — an onboarding checklist (assets, credentials, brand
  guidelines) the client can mark submitted, with notes
- **Projects** — a per-client stage tracker (Discovery → Strategy → Planning →
  Production → Review → Revision → Approval → Delivered) with milestones
- **Meetings** — kickoff calls and check-ins, visible to both sides
- **Deliverables** — file uploads to a private, per-client Supabase Storage
  bucket, moving through a review pipeline the client can approve or send back
  for revision, with comments
- **Reports** — monthly performance reports with metric cards (color **and**
  text status, never color alone), published on the agency's schedule
- **Feedback & testimonials** — a ratings form the agency can request after a
  reporting period, with an opt-in testimonial that goes through an
  approve/publish moderation queue before it's ever treated as public-ready
- **Dashboard** — real aggregation (pending client actions, upcoming meetings,
  recent deliverables/reports) built from actual queries, not mock data;
  every list has a meaningful empty state instead of a bare "No data"

## Architecture

- **Framework:** Next.js 16 (App Router, JavaScript — no TypeScript)
- **Styling:** Tailwind CSS v4 + shadcn/ui (built on
  [Base UI](https://base-ui.com), not Radix — note if you're used to shadcn's
  Radix-based components: buttons/links use a `render` prop instead of
  `asChild`, and `Select.Value` needs an explicit label-mapping function)
- **Database/Auth/Storage:** [Supabase](https://supabase.com) (Postgres)
- **Email:** [Resend](https://resend.com) (test mode — logs instead of sending
  — until `RESEND_API_KEY` is set; not yet wired into any flow)

### Data model

`profiles` (role: admin/client, linked 1:1 with Supabase auth users) ·
`clients` · `contracts` · `invoices` + `invoice_line_items` · `access_requests`
· `projects` + `milestones` · `meetings` · `deliverables` +
`deliverable_comments` · `reports` + `report_metrics` · `feedback` ·
`testimonials`

Every client-owned table carries a `client_id` and a Postgres Row Level
Security policy pair: admins get full access, a client role can only read (and
in a few explicitly-scoped cases, update) rows matching their own
`client_id`. See [Security](#security) below.

### Route map

```
/                                    marketing home
/login                               auth
/dashboard                           agency: pending actions, meetings, deliverables, reports
/dashboard/clients                   client list + create
/dashboard/contracts[/[id]]          contract list, detail, send
/dashboard/invoices                  invoice list, create, send, mark paid
/dashboard/access-requests           checklist across all clients
/dashboard/projects[/[id]]           project list, stage tracker, milestones
/dashboard/meetings                  schedule + list
/dashboard/deliverables              upload, status pipeline, download
/dashboard/reports                   create, publish
/dashboard/feedback                  request feedback, review responses, moderate testimonials
/portal                              client: current project, next meeting, pending actions
/portal/documents[/contracts/[id]]   welcome, contracts (+ sign), invoices
/portal/requests                     access checklist (mark submitted)
/portal/projects[/[id]]              project + milestones
/portal/timeline                     combined onboarding + production stage tracker
/portal/meetings                     upcoming/past calls
/portal/deliverables                 review, approve, request revision
/portal/reports[/[id]]               published reports + metrics
/portal/feedback                     ratings form + testimonial opt-in
```

## Setup

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project URL + publishable key
npm run dev
```

Then, in the Supabase **SQL Editor**, run the migrations in
[`supabase/migrations/`](supabase/migrations) **in order** (`0001` through
`0006`). Each one is idempotent-safe to paste and run once.

### Environment variables

See [`.env.example`](.env.example) for the full list. Nothing is required to
run the app locally — Supabase-backed pages render a "database not
configured" empty state instead of crashing until you add real values.

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | for any real data | Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | for any real data | safe for the browser (RLS-gated) |
| `SUPABASE_SECRET_KEY` | only for `npm run seed:demo` | server-only, never sent to the browser, never committed |
| `RESEND_API_KEY` | no | unset = test mode |
| `NEXT_PUBLIC_SITE_URL` | for correct metadata | defaults to `localhost:3000` |
| `NEXT_PUBLIC_BOOKING_URL` | no | shows a "Schedule a call" link in the client portal when set |

### Demo accounts

To try both roles without creating accounts by hand, add your project's
service-role key as `SUPABASE_SECRET_KEY` in `.env.local`, then run:

```bash
npm run seed:demo
```

This creates a demo client company ("Acme Studios") and two accounts:

| Role   | Email                        | Password          |
| ------ | ---------------------------- | ------------------ |
| Admin  | `demo-admin@agencyos.test`   | `DemoAdmin123!`    |
| Client | `demo-client@agencyos.test`  | `DemoClient123!`   |

These are seed-script defaults for local/demo use only — rotate or remove them
before using this with real client data.

## Testing

```bash
npm test    # unit tests (Node's built-in test runner) for pure logic:
            # invoice totals/overdue derivation, file-upload validation
npm run lint
npm run build
```

The full contract → sign, invoice → send → paid, and access-request →
submitted workflows have been manually verified end-to-end against a real
Supabase project (not just unit-tested), including confirming that a
client-role session is server-redirected away from `/dashboard` even when
navigating there directly.

## Security

- **Authorization is enforced in Postgres, not the frontend.** Every
  client-scoped table has RLS policies; a compromised or hand-crafted request
  still can't read or write another client's rows.
- Two `SECURITY DEFINER` helper functions (`current_role()`,
  `current_client_id()`) let policies check the caller's role/client without
  recursive RLS lookups on `profiles` itself.
- The Supabase **secret** (service-role) key is used only in the local seed
  script, never imported anywhere under `src/`, so it can never end up in the
  client or server bundle.
- File uploads are validated (size cap, blocked executable extensions) before
  reaching a **private** Storage bucket whose own RLS policies restrict each
  client to their own folder prefix.
- No `dangerouslySetInnerHTML` anywhere — all user-entered content (contract
  scope text, feedback notes, testimonial quotes) renders through React's
  default escaping.
- Client-facing mutations that depend on RLS to reject cross-client writes
  (e.g. signing a contract) check the actual affected-row count and surface an
  error rather than reporting false success if RLS silently blocked it.

## Deployment

Not yet deployed. Once it is, this section will include the live URL, and the
GitHub repository's **Website** field will be set to match.

## Known limitations

- No signup UI — accounts are created via the seed script or the Supabase
  dashboard; a proper client-invite flow is planned alongside the access
  request workflow.
- Payments are attested manually ("mark paid") — no real payment processor is
  wired in.
- Meeting scheduling uses a configurable external booking link
  (`NEXT_PUBLIC_BOOKING_URL`), not a live Calendly/Google Calendar API
  integration.
- Testimonials go through an approve/publish status in the database but are
  not automatically surfaced anywhere public — publishing them on the
  marketing site is a deliberate manual step, to avoid ever auto-exposing a
  client quote.
- Email (welcome, invoice, meeting confirmation) is not yet sent — Resend is
  wired for configuration but no templates exist yet.

## Roadmap

- Client invite flow (replace manual/seed account creation)
- Real e-signature and payment integrations, if a real deployment needs them
- Email notifications via Resend
- Google Drive-backed deliverable storage as an alternative to Supabase Storage

## Tech stack

Next.js · React · Tailwind CSS · shadcn/ui (Base UI) · Supabase (Postgres,
Auth, Storage) · Resend

## License

MIT — see [LICENSE](LICENSE).
