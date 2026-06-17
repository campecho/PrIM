# syntax=docker/dockerfile:1

# ---- Build stage: compile the Vite static bundle ----
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies against the lockfile for reproducible builds.
COPY package.json package-lock.json ./
RUN npm ci

# Build the static site into /app/dist.
COPY . .
RUN npm run build

# ---- Serve stage: nginx serving the static bundle ----
FROM nginx:1.27-alpine

# The official nginx entrypoint runs envsubst over files in
# /etc/nginx/templates/, writing the result to /etc/nginx/conf.d/.
# This lets us bind to Cloud Run's injected $PORT at container start.
# Only variables that exist in the environment are substituted, so
# nginx's own runtime variables ($uri, $host, ...) are left intact.
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

# Cloud Run sends traffic to $PORT (8080 by default). Set a default so
# the image also runs locally with `docker run -p 8080:8080`.
ENV PORT=8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
