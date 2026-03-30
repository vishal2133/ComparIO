@echo off
echo === Git Status ===
git status
echo.
echo === Staging all files ===
git add -A
echo.
echo === Files staged ===
git status
echo.
echo === Committing ===
git commit -m "Update ComparIO - backend API and frontend improvements"
echo.
echo === Pushing to GitHub ===
git push origin main
echo.
echo === Done! ===
