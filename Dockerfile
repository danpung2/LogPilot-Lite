# 베이스 이미지: Node.js 20 + Debian 기반
FROM node:20-slim

# bash 설치 (알아서 최신 패키지로)
RUN apt-get update && \
    apt-get install -y bash && \
    apt-get clean

# 작업 디렉토리 생성
WORKDIR /app

# 루트 package.json 및 tsconfig.json 복사
COPY package.json tsconfig.json ./

# 하위 프로젝트 복사
COPY logpilot-rest-server ./logpilot-rest-server
COPY logpilot-grpc-server ./logpilot-grpc-server
COPY shared ./shared
COPY start-server.ts ./

# 종속성 설치
RUN npm install

# 환경 변수 기본값 설정
ENV LOGPILOT_MODE=rest
ENV LOGPILOT_STORAGE_DIR=/data

# 포트 노출
EXPOSE 8080 50051

# 기본 실행 명령어
CMD ["npm", "start"]
