#!/bin/bash
echo "Z-CORE DEPLOY GITHUB ROOT"
git add .
git commit -m "Z-CORE v1.2: Update prompts $(date +%d/%m/%Y)"
git push
echo "✅ Pushed to https://milyes.github.io"
