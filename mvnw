#!/usr/bin/env bash
# Minimal Maven bootstrapper. Downloads Apache Maven on first use; no wrapper JAR required.
set -euo pipefail
MAVEN_VERSION="3.9.11"
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
CACHE_DIR="${HOME}/.m2/wrapper/dists/apache-maven-${MAVEN_VERSION}"
MAVEN_HOME="${CACHE_DIR}/apache-maven-${MAVEN_VERSION}"
if [ ! -x "${MAVEN_HOME}/bin/mvn" ]; then
  mkdir -p "${CACHE_DIR}"
  ARCHIVE="${CACHE_DIR}/apache-maven-${MAVEN_VERSION}-bin.tar.gz"
  URL="https://archive.apache.org/dist/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz"
  echo "Downloading Apache Maven ${MAVEN_VERSION} (one-time setup)..."
  if command -v curl >/dev/null 2>&1; then curl -fL "$URL" -o "$ARCHIVE"; else wget -O "$ARCHIVE" "$URL"; fi
  tar -xzf "$ARCHIVE" -C "$CACHE_DIR"
  rm -f "$ARCHIVE"
fi
exec "${MAVEN_HOME}/bin/mvn" "$@"
