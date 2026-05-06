FROM node:18-alpine AS builder

WORKDIR /app

# Install openssl for Prisma support on Alpine
RUN apk add --no-cache openssl

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy project files
COPY . .

# Build the project
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Install openssl for Prisma support on Alpine
RUN apk add --no-cache openssl

# Copy necessary files from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY entrypoint.sh ./

# Fix line endings for Windows & making the script executable
RUN sed -i 's/\r$//' entrypoint.sh && chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/bin/sh", "entrypoint.sh"]