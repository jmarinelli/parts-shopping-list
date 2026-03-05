FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS production
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
