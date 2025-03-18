# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files from frontend directory
COPY frontend/package*.json ./

# Install all dependencies (including devDependencies)
RUN npm install

# Copy source files from frontend directory
COPY frontend/ ./

# Create a default next.config.js if it doesn't exist
RUN if [ ! -f next.config.js ]; then \
    echo "module.exports = {}" > next.config.js; \
    fi

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files from frontend directory
COPY frontend/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port
EXPOSE 3000

# Install wget for healthcheck
RUN apk add --no-cache wget

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget --spider http://localhost:3000 || exit 1

# Start the application
CMD ["npm", "start"]