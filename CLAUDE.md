# Shopping Lists Manager

A web application for managing DIY automotive project shopping lists. Track parts, compare sourcing options, and monitor spending across vehicle projects.

## Documentation

- [Project Specification](docs/project-spec.md) — data model, business rules, and scope
- [Technical Specification](docs/tech-spec.md) — tech stack, infrastructure, shared types, and error handling
- [UI Specification](docs/ui-spec.md) — pages, components, and interaction patterns
- [Design System](docs/design-system.md) — colors, typography, components, and visual patterns
- [Implementation Plan](docs/implementation/implementation-plan.md) — phased delivery plan with per-phase specs

## Language

All code, comments, commit messages, branch names, and documentation must be in English. The chat language with the user may be Spanish, but all project artifacts are in English.

## Project Structure

```
parts-shopping-list/
├── client/                # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/ui/ # Reusable UI components
│   │   ├── hooks/         # React Query custom hooks
│   │   ├── pages/
│   │   ├── services/      # API client functions
│   │   └── types/         # Shared TypeScript types
│   └── Dockerfile
├── server/                # Express + TypeScript API backend
│   ├── src/
│   │   ├── db/schema/     # Drizzle schema files
│   │   ├── routes/
│   │   └── services/
│   └── Dockerfile
├── docs/                  # Project documentation
├── docker-compose.yml     # Production: client + server + db
├── docker-compose.dev.yml # Development: db only
└── CLAUDE.md
```

## Running the Project

### Environment Setup

```bash
# Copy the example env file (if not already done)
cp server/.env.example server/.env
```

### Development

```bash
# Start the database
docker compose -f docker-compose.dev.yml up -d

# Start the server (from server/)
cd server && npm run dev

# Start the client (from client/)
cd client && npm run dev
```

### Production

```bash
docker compose up --build
```

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, dnd-kit, React Query, React Router, Sonner, Phosphor Icons, Geist font
- **Backend**: Node.js, Express, TypeScript, Drizzle ORM
- **Database**: PostgreSQL (Docker in dev, container in prod)
- **Tooling**: ESLint, Prettier
- **Infrastructure**: Docker Compose (prod: 3 containers; dev: DB only)

## Code Conventions

### General

- TypeScript strict mode enabled in both client and server.
- No `any` types unless absolutely unavoidable.
- Prefer `const` over `let`. Never use `var`.
- ESLint and Prettier must pass before committing.

### Naming

- **Files**: kebab-case (e.g., `car-list.tsx`, `exchange-rate.ts`)
- **Components**: PascalCase (e.g., `CarList`, `PartRow`)
- **Functions/variables**: camelCase
- **Database tables/columns**: snake_case
- **API endpoints**: kebab-case for multi-word resources
- **React Query hooks**: `use` prefix (e.g., `useCars`, `useCreateCar`, `useUpdatePart`)

### Frontend

- One React component per file.
- Colocate component-specific styles and types with the component.
- Use functional components with hooks only.
- Use React Query for all server state (no useState for API data).
- API errors are displayed as toast notifications.
- Loading states use skeleton loaders or spinners.

### Backend

- Controllers handle HTTP request/response only.
- Business logic lives in service modules.
- Validate request input at the controller level.
- All errors return `{ "error": { "message": "..." } }`.

## API Conventions

### REST Endpoints

```
GET    /api/cars
POST   /api/cars
GET    /api/cars/:carId
PUT    /api/cars/:carId
DELETE /api/cars/:carId

GET    /api/cars/:carId/projects
POST   /api/cars/:carId/projects
GET    /api/projects/:projectId
PUT    /api/projects/:projectId
DELETE /api/projects/:projectId

GET    /api/projects/:projectId/parts
POST   /api/projects/:projectId/parts
GET    /api/parts/:partId
PUT    /api/parts/:partId
DELETE /api/parts/:partId
PATCH  /api/projects/:projectId/parts/reorder

GET    /api/parts/:partId/options
POST   /api/parts/:partId/options
GET    /api/options/:optionId
PUT    /api/options/:optionId
DELETE /api/options/:optionId
PATCH  /api/parts/:partId/options/:optionId/select

GET    /api/projects/:projectId/exchange-rates
PUT    /api/projects/:projectId/exchange-rates
GET    /api/projects/:projectId/totals?currency=USD&includeOptionals=true
```

### Response Format

```json
// Success
{ "data": { ... } }

// Success (list)
{ "data": [ ... ] }

// Error
{ "error": { "message": "Description of the error" } }
```

## Database Migrations

Using Drizzle Kit for schema migrations:

```bash
# Generate a migration after schema changes
cd server && npx drizzle-kit generate

# Apply pending migrations
cd server && npx drizzle-kit migrate
```

Schema files live in `server/src/db/schema/`. Always generate a migration after modifying the schema.
