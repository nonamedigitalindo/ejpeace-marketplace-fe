# ===========================================
# EJPEACE MARKETPLACE FRONTEND - DOCKERFILE
# ===========================================
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose Vite development port
EXPOSE 5173

# Start Vite development server
# Using --host to allow connections from outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
