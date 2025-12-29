FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json tsconfig.json tsconfig.esm.json ./
COPY logpilot-rest-server/package.json ./logpilot-rest-server/
COPY logpilot-grpc-server/package.json ./logpilot-grpc-server/

RUN node -e "const pkg=require('./package.json'); pkg.workspaces = pkg.workspaces.filter(w => !w.includes('client') && !w.includes('demo')); require('fs').writeFileSync('package.json', JSON.stringify(pkg, null, 2));"

# Install dependencies for server only
RUN npm install

# Copy source code
COPY . .

RUN rm -rf logpilot-lite-client logpilot-lite-demo-produce logpilot-lite-demo-consume

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
