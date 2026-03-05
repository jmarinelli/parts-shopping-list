# PoC Builder Playbook

A step-by-step methodology for building a PoC from an idea using Claude Code. Each step produces a concrete artifact that feeds into the next.

**Default model**: Use **Claude Opus** for all steps unless noted otherwise.

---

## Step 1: Discovery — Scope Definition

**Goal**: Go from a vague idea to a precise project specification.

**Instructions for the user**: Describe your idea in plain language. Don't worry about being precise — Claude will ask clarifying questions.

**Prompt**:

```
I have an idea for a project and I want to define its scope before building anything.

Here's my idea: [DESCRIBE YOUR IDEA]

Before writing anything down:
1. Tell me if you understand the scope.
2. Ask me every question you need answered to fully define the data model, business rules, and edge cases.
3. Do NOT generate any documents yet — just ask questions until you have no more doubts.

Once all questions are resolved, write the spec to `docs/project-spec.md` covering:
- Data model (entities, relationships, fields)
- Business rules (validation, automation, calculations)
- Scope boundaries (what's explicitly out of scope)

Write it in English regardless of the chat language.
```

**Artifact**: `docs/project-spec.md`

**Tips**:
- Answer questions one round at a time. Don't rush — missed requirements are expensive later.
- If Claude stops asking questions too early, say "more questions?" to push for thoroughness.
- Review the generated spec carefully before moving on.

---

## Step 2: Discovery — Tech Stack

**Goal**: Define the technology choices and infrastructure.

**Prompt**:

```
Read `docs/project-spec.md` for context.

Let's define the tech stack for this project. Propose a stack based on the project requirements, considering:
- Frontend framework and key libraries
- Backend framework and ORM
- Database
- Infrastructure (Docker, deployment)
- Development experience (hot reload, linting, formatting)

Ask me about any preferences before finalizing. Once agreed, write the spec to `docs/tech-spec.md` covering:
- Full tech stack with justification
- Project structure (directory layout)
- Development vs production setup
- Shared TypeScript types (if applicable)
- Error handling strategy

Write it in English regardless of the chat language.
```

**Artifact**: `docs/tech-spec.md`

**Tips**:
- Have opinions about what you want (e.g., "I want PostgreSQL, not SQLite") — it speeds things up.
- Make sure dev experience is addressed: how do you run it locally? Docker for everything or just the DB?

---

## Step 3: Discovery — UI Specification

**Goal**: Define the pages, components, and interaction patterns.

**Prompt**:

```
Read `docs/project-spec.md` and `docs/tech-spec.md` for context.

Let's define the UI. I imagine the following pages: [DESCRIBE YOUR PAGES OR SAY "propose a page structure"].

For each page, let's define:
- What it displays
- User actions available
- Navigation between pages
- Component types (modals, panels, inline editing, etc.)

Ask me about interaction preferences before finalizing. Once agreed, write the spec to `docs/ui-spec.md` covering:
- All pages with their components and behaviors
- Modal definitions
- Navigation patterns
- General UI patterns (error handling, loading states, empty states, keyboard shortcuts)

Write it in English regardless of the chat language.
```

**Artifact**: `docs/ui-spec.md`

**Tips**:
- Think about how you'll actually use the app. If a workflow feels clunky in description, it'll feel clunky in practice.
- Consider: accordions vs side panels, modals vs inline editing, drag & drop needs.

---

## Step 4: Discovery — Design System

**Goal**: Define the visual identity, component library, and styling rules before building any UI.

**Prompt**:

```
Read `docs/project-spec.md`, `docs/tech-spec.md`, and `docs/ui-spec.md` for context.

Let's define the design system for this project. Before proposing anything, ask me:
1. What visual style do I want? (e.g., minimal, corporate, dark/industrial, playful)
2. Any component library preference? (e.g., shadcn/ui, Radix, headless)
3. Any font or icon preferences?

Once we agree on the direction, write `docs/design-system.md` covering:
- Color palette (surfaces, text, accent, status, semantic)
- Typography scale (fonts, sizes, weights — with Tailwind classes)
- Component patterns (buttons, cards, modals, inputs, badges, toasts)
- Spacing & layout rules
- Border, shadow, and radius conventions
- Loading, empty, and error states
- Motion guidelines
- Icon library and usage

Then generate a standalone HTML showcase file at `docs/examples/design-system-showcase.html` that visually demonstrates all design tokens and component patterns — inline CSS, no dependencies (except Google Fonts). This file serves as the visual reference for all frontend phases.

Write everything in English regardless of the chat language.
```

**Artifacts**:
- `docs/design-system.md`
- `docs/examples/design-system-showcase.html`

**Tips**:
- The Q&A is critical here — "dark industrial" vs "clean minimal" produces completely different UIs.
- The HTML showcase is your source of truth for visual decisions. Open it in a browser and iterate until it feels right.
- If the first pass feels generic, push back. Say "more personality" or "less corporate" — specificity drives better results.
- Reference the showcase from your build prompts so Claude follows the visual language during implementation.

---

## Step 5: Setup — CLAUDE.md

**Goal**: Create the project's persistent context file so every future chat session starts with full awareness.

**Prompt**:

```
Read `docs/project-spec.md`, `docs/tech-spec.md`, `docs/ui-spec.md`, and `docs/design-system.md`.

Create a `CLAUDE.md` file at the project root that serves as the persistent context for all future Claude Code sessions. It should include:
- Project overview (1-2 sentences)
- Links to all spec documents (including design system)
- Language rule: all code and artifacts in English
- Project structure
- How to run the project (dev and prod commands)
- Tech stack summary
- Code conventions (naming, file structure, patterns)
- API conventions (endpoint patterns, response format)
- Database migration workflow

Keep it concise but complete — this file is loaded into every conversation.
```

**Artifact**: `CLAUDE.md`

---

## Step 6: Planning — Implementation Phases

**Goal**: Break the project into small, testable, incremental phases.

**Prompt**:

```
Read `CLAUDE.md` and all docs in `docs/`.

Break this project into implementation phases. Each phase should:
- Be self-contained and testable in isolation
- Build on previous phases
- Be small enough to implement in a single chat session
- Alternate between backend and frontend where possible (backend first, then its frontend)

For each phase, write a detailed spec in `docs/implementation/specs/XX-phase-name.md` that includes:
- Goal (one sentence)
- Prerequisites (which phases must be complete)
- Deliverables (schema, endpoints, components, etc.)
- Business logic details
- Tests to write (unit and integration) — tests are written as part of the phase, not in a separate testing phase. Target ~80% coverage.
- Definition of Done with concrete verification commands (curl commands for backend, step-by-step visual checklist for frontend). Every Definition of Done MUST include:
  - `npm run typecheck` passes (zero errors)
  - `npm run lint` passes (zero warnings/errors)
  - `npm run test` passes with coverage ≥ 80% for new code
- Acceptance criteria as a checklist

**Postman collection**: If a phase adds, modifies, or removes API endpoints, the spec must include a requirement to update the shared Postman collection at `docs/api-collection.json`. The collection should:
- Organize requests by resource (e.g., Cars, Projects, Parts)
- Include example request bodies and expected responses
- Use collection variables for `baseUrl`, auth tokens, and dynamic IDs
- If the project has authentication, include a login request that saves the token to a variable for subsequent requests
- Always update the same file — never create a new collection per phase

Also create:
- `docs/implementation/implementation-plan.md` — overview table linking to all phase specs
- `docs/implementation/prompts/XX-phase-name.md` — a ready-to-paste prompt for each phase that includes:
  - Which files to read for context
  - Key decisions already made (don't rely solely on docs being read)
  - Critical business logic reminders
  - Explicit instruction to implement ONLY that phase
  - Reference to the Definition of Done
  - Reminder that typecheck, lint, and tests must pass before the phase is considered done
  - If the phase touches API endpoints: reminder to update `docs/api-collection.json`

Update `CLAUDE.md` to link to the implementation plan.
```

**Artifacts**:
- `docs/implementation/implementation-plan.md`
- `docs/implementation/specs/*.md`
- `docs/implementation/prompts/*.md`
- Updated `CLAUDE.md`

**Tips**:
- Review all specs before starting to build. Catch inconsistencies now, not during implementation.
- The prompts should be self-sufficient — someone (or a future chat) should be able to pick one up and execute without reading this chat.

---

## Step 7: Validation — Cross-Check Specs

**Goal**: Ensure all documents are consistent with each other before writing any code.

**Model exception**: Use **Claude Sonnet** for this step — it's a thorough review task that doesn't need Opus.

**Prompt**:

```
Read ALL files in `docs/` and `CLAUDE.md`. Cross-validate them for consistency:

1. CLAUDE.md vs tech-spec.md: tech stack, structure, conventions
2. tech-spec.md types vs phase specs: are type shapes identical?
3. API endpoints in CLAUDE.md vs phase specs: same param names, same paths?
4. project-spec.md business rules vs phase specs: are rules fully captured?
5. ui-spec.md vs frontend phase specs: do descriptions match?
6. Infrastructure setup: do running instructions match what scaffolding spec describes?

Report inconsistencies with specific quotes from each file. Classify by severity (significant vs minor).
```

**Artifact**: List of inconsistencies to fix (fix them before proceeding).

---

## Step 8: Build — Execute Each Phase

**Goal**: Implement the project one phase at a time.

**Instructions for the user**: Start a **new chat session** for each phase. Copy the prompt from `docs/implementation/prompts/XX-phase-name.md`.

**Workflow per phase**:

1. Open a new Claude Code chat.
2. Paste the phase prompt.
3. Let Claude implement. Review as it goes.
4. Verify: `npm run typecheck && npm run lint && npm run test` must all pass.
5. If the phase touches API endpoints, verify `docs/api-collection.json` is updated.
6. Test using the Definition of Done checklist.
7. Fix any issues in the same chat.
8. Once the phase passes all checks, move to the next phase in a new chat.

**Tips**:
- A new chat per phase keeps context clean and focused.
- If a phase grows too large or the context gets cluttered, don't hesitate to start a fresh chat for the same phase.
- If you find a spec issue during build, fix the spec first (in the current chat), then continue building.
- Commit after each successful phase.
- Tests are not optional — they're part of the deliverable. A phase without tests is not done.
- The Postman collection is cumulative. Import it into Postman at any point to have a working API playground.

---

## Summary

| Step | What                    | Artifact                              | Model   |
| ---- | ----------------------- | ------------------------------------- | ------- |
| 1    | Scope definition        | `docs/project-spec.md`                | Opus    |
| 2    | Tech stack              | `docs/tech-spec.md`                   | Opus    |
| 3    | UI specification        | `docs/ui-spec.md`                     | Opus    |
| 4    | Design system           | `docs/design-system.md` + HTML showcase | Opus  |
| 5    | CLAUDE.md setup         | `CLAUDE.md`                           | Opus    |
| 6    | Implementation planning | `docs/implementation/`                | Opus    |
| 7    | Cross-validation        | Fix list                              | Sonnet  |
| 8    | Build (per phase)       | Code + tests + `api-collection.json`  | Opus    |

---

## Key Principles

1. **Never generate artifacts without asking questions first** (steps 1-4). The Q&A is where quality comes from.
2. **Documents are the source of truth**, not chat history. If it's not in a doc, it doesn't exist for the next session.
3. **One chat per phase**. Fresh context, focused scope.
4. **Definition of Done must be verifiable**. If you can't run a command to check it, it's not defined enough.
5. **Fix specs before fixing code**. If the spec is wrong, the code will be wrong too.
6. **Cross-validate before building**. 10 minutes of review saves hours of rework.
7. **Tests are part of every phase**, not a separate step. Write tests alongside the code they validate.
8. **Typecheck + lint = gate**. No phase is done until `typecheck` and `lint` pass with zero errors.
9. **One Postman collection, always current**. Every API change updates the same file — it's a living document.
