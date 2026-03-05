# Shopping Lists Manager - Technical Specification

## Tech Stack

### Frontend

- **React** with **TypeScript** (Vite)
- **Tailwind CSS** for styling
- **dnd-kit** for drag & drop reordering of parts
- **React Query (TanStack Query)** for server state management (API data fetching, caching, refetching)
- **React Router** for client-side routing
- **shadcn/ui** for UI components (Button, Dialog, Sheet, Select, Switch, Badge, RadioGroup, Input, Toast/Sonner)
- **Sonner** for toast notifications (via shadcn toast component)
- **Phosphor Icons** (`@phosphor-icons/react`) for all icons
- **Geist** + **Geist Mono** fonts

### Backend

- **Node.js** with **Express** and **TypeScript**
- **Drizzle ORM** for type-safe database access

### Database

- **PostgreSQL**

### Tooling

- **ESLint** for linting (both client and server)
- **Prettier** for code formatting (both client and server)
- Shared config at the root where possible.

### Infrastructure

#### Production

- **Docker Compose** with three containers:

| Container | Description                                     |
| --------- | ----------------------------------------------- |
| `client`  | Nginx serving the static React production build |
| `server`  | Node.js + Express API                           |
| `db`      | PostgreSQL                                      |

- Nginx serves the frontend static files and proxies `/api` requests to the backend container.

#### Development

- **Only the database runs in Docker** (`docker-compose.dev.yml` or a `dev` profile).
- Client runs on the host via `npm run dev` (Vite dev server with hot reload).
- Server runs on the host via `npm run dev` (ts-node or tsx with watch mode).
- Vite dev server proxies `/api` requests to the local Express server.
- This setup provides faster hot reload, easier debugging, and native tooling access.

## Project Structure

```
parts-shopping-list/
├── client/                # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/        # Reusable UI components (modal, button, toast, etc.)
│   │   ├── hooks/         # Custom React Query hooks
│   │   ├── pages/
│   │   ├── services/      # API client functions
│   │   └── types/         # Shared TypeScript types
│   ├── Dockerfile         # Multi-stage: dev (Vite) / prod (Nginx)
│   └── package.json
├── server/
│   ├── src/
│   │   ├── db/
│   │   │   └── schema/
│   │   ├── routes/
│   │   └── services/
│   ├── Dockerfile         # Multi-stage: dev / prod
│   └── package.json
├── docs/                  # Project documentation
├── docker-compose.yml     # Production: all 3 containers
├── docker-compose.dev.yml # Development: DB only
├── .env.example
├── .eslintrc.json
├── .prettierrc
└── CLAUDE.md
```

## Error Handling

### Backend

- All errors return the standard response format: `{ "error": { "message": "..." } }`.
- Use appropriate HTTP status codes: `400` (bad input), `404` (not found), `500` (server error).
- Express global error handler catches unhandled errors and returns `500`.

### Frontend

- API errors trigger toast notifications with the error message from the API.
- Loading states: skeleton loaders or spinners while data is being fetched.
- React Query handles retry logic (default: 3 retries for failed queries).
- Mutations show a success toast on completion and an error toast on failure.

## Shared TypeScript Types

Both client and server share the same domain types. Defined in `client/src/types/` and mirrored as needed. Key types:

```typescript
interface Car {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  carId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Part {
  id: string;
  projectId: string;
  name: string;
  status: "pending" | "ordered" | "owned";
  isOptional: boolean;
  sortOrder: number;
  selectedOptionId: string | null;
  selectedOption: Option | null;
  createdAt: string;
  updatedAt: string;
}

interface Option {
  id: string;
  partId: string;
  name: string;
  price: number;
  currency: string;
  source: string | null;
  link: string | null;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ExchangeRate {
  id: string;
  projectId: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  createdAt: string;
  updatedAt: string;
}

interface ProjectTotals {
  total: number;
  spent: number;
  remaining: number;
  currency: string;
  availableCurrencies: string[];
}
```
