# Phase 1: Scaffolding

## Goal

Set up the project infrastructure so that the development environment is fully functional: database in Docker, client and server running on the host, with hot reload and connectivity between all services.

## Deliverables

### Docker Compose (Development)

`docker-compose.dev.yml` with one service:

- `db`: PostgreSQL 16 container with a named volume for data persistence. Exposes port `5432` to the host.

```yaml
# docker-compose.dev.yml (reference structure)
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### Docker Compose (Production)

`docker-compose.yml` with three services:

```yaml
# docker-compose.yml (reference structure)
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - pgdata:/var/lib/postgresql/data

  server:
    build:
      context: ./server
      target: production
    environment:
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@db:5432/${DB_NAME}
    depends_on:
      - db
    expose:
      - "3001"

  client:
    build:
      context: ./client
      target: production
    ports:
      - "80:80"
    depends_on:
      - server

volumes:
  pgdata:
```

### Environment Variables

`.env.example` (committed):

```
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=shopping_lists
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shopping_lists
```

`.env` is in `.gitignore`.

### Server

- Initialize a Node.js + TypeScript project in `server/`.
- Express app with a health check endpoint: `GET /api/health` → `{ "status": "ok" }`.
- Drizzle ORM configured and connected to PostgreSQL via `DATABASE_URL`.
- TypeScript strict mode enabled.
- `tsconfig.json`, `package.json` with scripts:
  - `dev`: runs with watch mode (tsx or ts-node-dev)
  - `build`: compiles TypeScript
  - `start`: runs compiled JS (for production)
- ESLint + Prettier configured.

#### Server Dockerfile

```dockerfile
# server/Dockerfile (reference structure)
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS production
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
```

### Client

- Initialize a React + TypeScript project with Vite in `client/`.
- Tailwind CSS installed and configured.
- React Router installed (routing setup in Phase 3).
- React Query installed (usage in Phase 3).
- shadcn/ui initialized and configured (usage in Phase 3).
- Sonner installed (toast notifications, usage in Phase 3).
- Phosphor Icons installed (usage in Phase 3).
- Geist font installed and configured.
- A minimal landing page that fetches and displays the response from `GET /api/health` to prove client-server connectivity.
- TypeScript strict mode enabled.
- Vite dev server proxies `/api` requests to `http://localhost:3001`.
- ESLint + Prettier configured.

#### Client Dockerfile

```dockerfile
# client/Dockerfile (reference structure)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

#### Nginx Config

```nginx
# client/nginx.conf
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location /api {
        proxy_pass http://server:3001;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Git Setup

- `.gitignore` covering: `node_modules/`, `.env`, `dist/`, `.vite/`, `*.log`.

## Definition of Done

Verify each item by running the listed commands:

### Development environment

```bash
# 1. Start the database
docker compose -f docker-compose.dev.yml up -d

# 2. Verify DB is running
docker compose -f docker-compose.dev.yml ps
# → db container should be "running" / "healthy"

# 3. Start the server
cd server && npm run dev
# → Should print "Server running on port 3001" or similar

# 4. Test the health endpoint
curl http://localhost:3001/api/health
# → Expected: { "status": "ok" }

# 5. Start the client
cd client && npm run dev
# → Should print Vite dev server URL (e.g., http://localhost:5173)

# 6. Open the browser at the Vite URL
# → Should display the health check response from the API

# 7. Verify hot reload: edit a file in server/ or client/ and confirm changes reflect without restart
```

### Production environment

```bash
# 1. Build and start all containers
docker compose up --build

# 2. Verify all 3 containers are running
docker compose ps
# → client, server, db should all be "running"

# 3. Test the health endpoint via nginx proxy
curl http://localhost/api/health
# → Expected: { "status": "ok" }

# 4. Open http://localhost in the browser
# → Should display the React app with the health check response

# 5. Verify data persistence
docker compose down
docker compose up -d
# → DB data should still be present (named volume)
```

### Tooling

```bash
# Linting passes
cd server && npx eslint .
cd client && npx eslint .

# Formatting passes
cd server && npx prettier --check .
cd client && npx prettier --check .
```

## Acceptance Criteria

- [ ] `docker compose -f docker-compose.dev.yml up -d` starts PostgreSQL without errors.
- [ ] `npm run dev` in `server/` starts Express with hot reload on port 3001.
- [ ] `npm run dev` in `client/` starts Vite dev server with hot reload.
- [ ] `GET http://localhost:3001/api/health` returns `{ "status": "ok" }`.
- [ ] The React app loads in the browser and displays the health check response (proving client → server → works).
- [ ] `docker compose up --build` starts all three production containers.
- [ ] `GET http://localhost/api/health` returns `{ "status": "ok" }` via Nginx proxy.
- [ ] PostgreSQL data persists across container restarts (named volume).
- [ ] `.env.example` is committed; `.env` is in `.gitignore`.
- [ ] ESLint and Prettier pass for both client and server.
