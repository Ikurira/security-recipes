FROM node:18-alpine

# Install newsboat and dependencies
RUN apk add --no-cache \
    newsboat \
    sqlite \
    curl \
    bash

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy app files
COPY . .

# Build Next.js app
RUN npm run build

# Create newsboat directory
RUN mkdir -p /root/.newsboat

# Copy newsboat config
COPY newsboat-urls /root/.newsboat/urls
COPY newsboat-config /root/.newsboat/config

# Set newsboat database path
ENV NEWSBOAT_DB=/root/.newsboat/cache.db

# Create recipes directory
RUN mkdir -p /app/content/recipes

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD curl -f http://localhost:3000 || exit 1

# Start script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "start"]
