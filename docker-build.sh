#!/bin/bash

# 패키지 버전 읽기
VERSION=$(node -p "require('./package.json').version")

echo "� 감지된 버전: $VERSION"
read -p "로컬 빌드를 진행하시겠습니까? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 사용자에 의해 빌드가 취소되었습니다."
    exit 1
fi

echo "�🐳 Building LogPilot-Lite v$VERSION (Local Architecture)..."

# 로컬 아키텍처용 빌드 (로컬 도커 데몬에 저장)
docker build \
  -t danpung2/logpilot-lite:$VERSION \
  -t danpung2/logpilot-lite:latest \
  .

echo "✅ Build Complete (Local)"
