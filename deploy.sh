#!/bin/bash
# 一键部署 - macOS / Linux
GITHUB_USER="bestxuyi"
REPO_NAME="Elysia"
echo "部署到 https://${GITHUB_USER}.github.io/${REPO_NAME}/ ..."
git init
git add .
git commit -m "Deploy Elysia site"
git branch -M main
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/${GITHUB_USER}/${REPO_NAME}.git
git push -f origin main
echo "Done."
