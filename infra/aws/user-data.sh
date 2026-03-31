#!/bin/bash
set -euxo pipefail

# ============================================
# EC2 User Data - Docker + docker compose setup
# Amazon Linux 2023
# ============================================

# Docker install
dnf update -y
dnf install -y docker git
systemctl enable docker
systemctl start docker

# docker compose plugin
DOCKER_COMPOSE_VERSION="v2.37.0"
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# ec2-user を docker グループに追加
usermod -aG docker ec2-user

# アプリディレクトリ準備
APP_DIR="/opt/kd1-labs"
mkdir -p "$APP_DIR"

echo "========================================"
echo "Docker setup complete."
echo "Next steps:"
echo "  1. Clone repo to $APP_DIR"
echo "  2. Copy .env file"
echo "  3. docker compose -f docker-compose.yml -f docker-compose.app.yml up -d"
echo "========================================"
