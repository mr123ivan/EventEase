# Single-stage image for running the development server
FROM node:18-bullseye
WORKDIR /app

# Copy dependency files
COPY package*.json ./
RUN npm install

# Copy all application source code
COPY . .

# Environment variables
ARG VITE_API_BASE_URL=https://api.eventsease.app
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Expose the typical Vite development port
EXPOSE 5173

# Command to run the development server (This must be CMD, not RUN)
# --host 0.0.0.0 is crucial for accessibility outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]