@echo off
echo ========================================
echo    SecureVault React Deployment v2.0
echo ========================================
echo.

echo Checking prerequisites...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed!
    echo Please install npm with Node.js
    pause
    exit /b 1
)

echo Node.js and npm are installed ✓
echo.

REM Check if .env file exists
if not exist ".env" (
    echo WARNING: .env file not found!
    echo Please copy config.env.example to .env and configure Supabase credentials
    echo.
    copy config.env.example .env
    echo Created .env file from template
    echo Please edit .env with your Supabase credentials before continuing
    echo.
    pause
)

echo Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo Dependencies installed successfully ✓
echo.

echo Building for production...
npm run build

if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo Build completed successfully ✓
echo.

echo ========================================
echo    Deployment Options
echo ========================================
echo.
echo 1. Deploy to Netlify (Recommended)
echo 2. Deploy to Vercel
echo 3. Deploy to Firebase
echo 4. Local testing only
echo 5. Exit
echo.

set /p choice="Choose deployment option (1-5): "

if "%choice%"=="1" goto netlify
if "%choice%"=="2" goto vercel
if "%choice%"=="3" goto firebase
if "%choice%"=="4" goto local
if "%choice%"=="5" goto exit

echo Invalid choice. Please try again.
pause
goto menu

:netlify
echo.
echo Deploying to Netlify...
echo.
echo Installing Netlify CLI...
npm install -g netlify-cli

if %errorlevel% neq 0 (
    echo ERROR: Failed to install Netlify CLI!
    pause
    exit /b 1
)

echo Deploying to Netlify...
netlify deploy --prod --dir=build

if %errorlevel% neq 0 (
    echo ERROR: Netlify deployment failed!
    pause
    exit /b 1
)

echo Netlify deployment completed successfully! ✓
goto success

:vercel
echo.
echo Deploying to Vercel...
echo.
echo Installing Vercel CLI...
npm install -g vercel

if %errorlevel% neq 0 (
    echo ERROR: Failed to install Vercel CLI!
    pause
    exit /b 1
)

echo Deploying to Vercel...
vercel --prod

if %errorlevel% neq 0 (
    echo ERROR: Vercel deployment failed!
    pause
    exit /b 1
)

echo Vercel deployment completed successfully! ✓
goto success

:firebase
echo.
echo Deploying to Firebase...
echo.
echo Installing Firebase CLI...
npm install -g firebase-tools

if %errorlevel% neq 0 (
    echo ERROR: Failed to install Firebase CLI!
    pause
    exit /b 1
)

echo Deploying to Firebase...
firebase deploy

if %errorlevel% neq 0 (
    echo ERROR: Firebase deployment failed!
    pause
    exit /b 1
)

echo Firebase deployment completed successfully! ✓
goto success

:local
echo.
echo Starting local production server...
echo.
echo Your app is available at: http://localhost:3000
echo.
echo To test the production build locally:
echo npm install -g serve
echo serve -s build -l 3000
echo.
echo Press any key to continue...
pause >nul
goto exit

:success
echo.
echo ========================================
echo    Deployment Successful! 🎉
echo ========================================
echo.
echo Your SecureVault React app has been deployed!
echo.
echo Next steps:
echo 1. Test your deployed app
echo 2. Configure custom domain (optional)
echo 3. Set up monitoring and analytics
echo 4. Share with your team!
echo.

:exit
echo.
echo Press any key to exit...
pause >nul
