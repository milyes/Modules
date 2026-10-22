#!/bin/bash
# IA22 D002 - SIGNATURE VERITE
AUDIT_DIR=$(ls -td audit_IA22_v* | head -1)
RESUME="$AUDIT_DIR/RESUME_CISO.txt"
SIG="$AUDIT_DIR/RESUME_CISO.txt.sig"

HASH=$(sha256sum "$RESUME" | awk '{print $1}')
DATE=$(date -Iseconds)
USER=$(whoami)

echo "SHA256: $HASH" > "$SIG"
echo "DATE: $DATE" >> "$SIG"
echo "USER: $USER" >> "$SIG"
echo "CLE: 1776" >> "$SIG"
echo "VERDICT: D002 VERITE SCELLEE" >> "$SIG"

echo "✅ D002 SIGNATURE CREEE: $SIG"
