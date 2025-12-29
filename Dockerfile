FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json tsconfig.json tsconfig.esm.json ./
COPY logpilot-rest-server/package.json ./logpilot-rest-server/
COPY logpilot-grpc-server/package.json ./logpilot-grpc-server/
COPY logpilot-lite-client/package.json ./logpilot-lite-client/
COPY logpilot-lite-demo-produce/package.json ./logpilot-lite-demo-produce/
COPY logpilot-lite-demo-consume/package.json ./logpilot-lite-demo-consume/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build
RUN npm run build

# Expose ports
EXPOSE 8080 50051

# Environment variables
ENV LOGPILOT_MODE=rest
ENV LOGPILOT_STORAGE_DIR=/data
ENV LOGPILOT_DB_PATH=/data/logpilot.db

# Volumne for persistence
VOLUME ["/data"]

# Start server
CMD ["node", "dist/cjs/start-server.js"]
