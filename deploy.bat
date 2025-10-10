@echo off
:: 一键部署 - Windows
set GITHUB_USER=bestxuyi
set REPO_NAME=Elysia
echo 正在部署到 https://%GITHUB_USER%.github.io/%REPO_NAME%/ ...
git init
git add .
git commit -m "Deploy Elysia site"
git branch -M main
git remote remove origin >nul 2>nul
git remote add origin https://github.com/%GITHUB_USER%/%REPO_NAME%.git
git push -f origin main
echo 完成
pause
