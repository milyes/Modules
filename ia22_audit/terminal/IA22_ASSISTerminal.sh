#!/bin/bash
# IA22_ASSISTerminal V4.6.4 - ZERO TRUST - CLE: 1776
CLE="1776"; LOG="/sdcard/IA22/logs.txt"; mkdir -p /sdcard/IA22
login(){ clear; echo "🟦 IA22 V4.6.4"; read -s KEY; [ "$KEY" != "$CLE" ] && exit 1; }
menu(){ while true; do clear; echo "[1] Scanner [2] Vision [3] ZCORE [4] Doctrine [5] Logs [6] Quitter"; read C; done }
login; menu
