#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/backend"
if ! command -v java >/dev/null 2>&1; then
  echo "Java 21 or newer is required. Install it from https://adoptium.net/ and try again."
  exit 1
fi
JAVA_MAJOR=$(java -version 2>&1 | head -n 1 | sed -E 's/.* version "([0-9]+).*/\1/')
if [ "${JAVA_MAJOR:-0}" -lt 21 ]; then
  echo "Java 21 or newer is required. Detected Java ${JAVA_MAJOR}."
  exit 1
fi
if command -v mvn >/dev/null 2>&1; then
  mvn spring-boot:run
else
  echo "Maven is not installed. The project includes a lightweight Maven bootstrap script."
  ../mvnw spring-boot:run
fi
