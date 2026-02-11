@echo off
echo Starting build process...

echo Installing root dependencies...
call npm install
if errorlevel 1 exit /b 1

echo Installing frontend dependencies...
cd frontend
call npm install
if errorlevel 1 exit /b 1

echo Building frontend...
call npm run build
if errorlevel 1 exit /b 1

echo Verifying dist folder...
if exist dist (
  echo Build successful! dist folder created.
  dir dist
) else (
  echo Build failed! dist folder not found.
  exit /b 1
)

echo Build process completed successfully!
