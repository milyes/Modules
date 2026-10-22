#!/bin/bash
# IA22 GATEKEEPER D004 - ETHIQUE + TRACE
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
HASH=$(sha256sum ia22_audit/RESUME_CISO.txt 2>/dev/null | awk '{print $1}')
echo "✅ D004 ACCES AUTORISE - $USER"
echo "$(date) [D004] USER=$USER | CLE=1776 | HASH=$HASH" >> $LOG_ETHIQUE
echo "$(date) [D004] USER=$USER | CLE=1776 | HASH=$HASH" >> audit_IA22_v*/RESUME_CISO.txt
