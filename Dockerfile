FROM node:20-slim

RUN apt-get update && \
    apt-get install -y bash && \
    apt-get clean

WORKDIR /app

COPY package.json tsconfig.json ./

COPY logpilot-rest-server ./logpilot-rest-server
COPY logpilot-grpc-server ./logpilot-grpc-server
COPY shared ./shared
COPY start-server.ts ./

RUN npm install

ENV LOGPILOT_MODE=rest
ENV LOGPILOT_STORAGE_DIR=/data

EXPOSE 8080 50051

CMD ["npm", "start"]
