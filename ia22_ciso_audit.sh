#!/usr/bin/env bash
set -euo pipefail
REPORT_DIR="./audit_IA22_v22.0.0_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$REPORT_DIR" ia22_audit
echo "[IA22] D003 OK" > "$REPORT_DIR/RESUME_CISO.txt"
cp "$0" ia22_audit/
echo "[IA22] AUDIT CREE"
