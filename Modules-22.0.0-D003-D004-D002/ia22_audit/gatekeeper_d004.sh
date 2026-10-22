#!/bin/bash
# IA22 GATEKEEPER D004 V4.6.5 - ETHIQUE + TRACE FIX
CLE_OFFICIELLE="1776"
LOG_ETHIQUE="/sdcard/IA22/ethique.log"

echo "🟦 IA22 D004 - AUTHENTIFICATION ETHIQUE"
read -s -p "🔓 Code d'accès IA22: " KEY
echo ""

if [ "$KEY" != "$CLE_OFFICIELLE" ]; then
  echo "❌ D004 ERREUR ETHIQUE - ACCES REFUSE"
  echo "$(date) [D004] TENTATIVE ECHOUEE" >> $LOG_ETHIQUE
  exit 1
fi

USER=$(whoami)
AUDIT_DIR=$(ls -td audit_IA22_v* 2>/dev/null | head -1)

if [ -n "$AUDIT_DIR" ]; then
  HASH=$(sha256sum "$AUDIT_DIR/RESUME_CISO.txt" 2>/dev/null | awk '{print $1}')
  echo "$(date) [D004] USER=$USER | CLE=1776 | HASH=$HASH" >> "$AUDIT_DIR/RESUME_CISO.txt"
fi

echo "$(date) [D004] USER=$USER | CLE=1776" >> $LOG_ETHIQUE
echo "✅ D004 ACCES AUTORISE - $USER"
