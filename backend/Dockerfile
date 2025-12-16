FROM node:18-bullseye-slim

# Install curl and build tools for native modules
RUN apt-get update -y && apt-get install -y --no-install-recommends \
		curl python3 make g++ \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first (use package.json + package-lock.json if present)
COPY package.json package-lock.json* ./
RUN npm ci --only=production || npm install --only=production
# Copy source (node_modules excluded by .dockerignore)
COPY . ./
# Safety: ensure bcrypt is built for container architecture
RUN npm rebuild bcrypt --build-from-source || true

# Harden container: run as non-root and set production env
ENV NODE_ENV=production
RUN chown -R node:node /app
USER node

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
