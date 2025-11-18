# ============================================
# Stage 1: The Build Stage (Named 'build')
# Rationale: Uses a powerful Node environment to install all dependencies (including dev)
# and compiles the React application into static files.
# ============================================
FROM node:18-bullseye AS build
WORKDIR /app

# Copy dependency files first for efficient Docker layer caching
COPY package*.json ./
RUN npm install --frozen-lockfile

# Copy all application source code
COPY . .

# Build argument for API base URL (Vite environment variables are baked into the build)
ARG VITE_API_BASE_URL=https://api.eventsease.app
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Execute the production build command (creates /app/dist)
RUN npm run build

# ============================================
# Stage 2: The Runtime Stage (Production Image)
# Rationale: Uses the tiny, secure Nginx base image. It only copies the resulting
# static files from Stage 1, dramatically reducing the final image size.
# ============================================
FROM nginx:alpine

# 1. Inject the custom Nginx configuration file for SPA routing.
# The custom nginx.conf file MUST be in the same directory.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 2. Copy ONLY the production-ready static files from the previous build stage
# to the Nginx web root directory.
COPY --from=build /app/dist /usr/share/nginx/html

# 3. Expose the port Nginx is configured to listen on (Port 80).
EXPOSE 80

# 4. Start Nginx in the foreground (required for Docker and ECS).
CMD ["nginx", "-g", "daemon off;"]