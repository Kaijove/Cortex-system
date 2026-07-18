@echo off
REM -----------------------------------------------------------------------------
REM setup.bat - Instal.lacio automatica per a Windows
REM Fes doble clic sobre aquest fitxer (o executa'l des del terminal).
REM Instal.la Node.js (via winget) i les dependencies del projecte.
REM -----------------------------------------------------------------------------

echo == 1/3 Comprovant si Node ja esta instal.lat ==
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Node ja esta instal.lat, OK
    goto :install_deps
)

echo Node no trobat. Instal.lant amb winget...
winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo No s'ha pogut instal.lar automaticament amb winget.
    echo Descarrega'l manualment des de: https://nodejs.org
    pause
    exit /b 1
)

echo.
echo Node instal.lat. IMPORTANT: tanca aquesta finestra i torna a obrir
echo aquesta carpeta, despres torna a fer doble clic a setup.bat
echo perque el sistema reconegui la nova instal.lacio.
pause
exit /b 0

:install_deps
echo == 2/3 Versions instal.lades ==
node -v
npm -v

echo == 3/3 Instal.lant dependencies del projecte ==
cd /d "%~dp0"
call npm install

echo.
echo Tot llest! Per arrencar el projecte escriu:
echo   npm run dev
pause
