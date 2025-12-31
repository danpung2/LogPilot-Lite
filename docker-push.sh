#!/bin/bash

# 패키지 버전 읽기
VERSION=$(node -p "require('./package.json').version")

echo "🚀 감지된 버전: $VERSION"
read -p "멀티 플랫폼 빌드 및 푸시를 진행하시겠습니까? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 사용자에 의해 푸시가 취소되었습니다."
    exit 1
fi

echo "🚀 Pushing LogPilot-Lite v$VERSION (Multi-Arch: amd64 + arm64)..."

# 멀티 플랫폼 빌더 확인 및 생성
if ! docker buildx inspect multi-arch-builder > /dev/null 2>&1; then
  echo "🛠 Creating new buildx builder..."
  docker buildx create --use --name multi-arch-builder
else
  echo "🛠 Using existing buildx builder..."
  docker buildx use multi-arch-builder
fi

# 멀티 플랫폼 빌드 및 푸시
# 주의: 멀티 플랫폼 빌드는 로컬에 저장되지 않고 레지스트리로 바로 푸시됩니다.
docker buildx build --platform linux/amd64,linux/arm64 \
  -t danpung2/logpilot-lite:$VERSION \
  -t danpung2/logpilot-lite:latest \
  --push .

echo "✅ Push Complete"
