@echo off
REM CyPhish - SSL Certificate Generator for Windows
REM Generates a self-signed certificate OR a CSR with SAN.
setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
set ROOT_DIR=%SCRIPT_DIR%..
set SSL_DIR=%ROOT_DIR%\ssl
set TARGET_HOST=%1
if "%TARGET_HOST%"=="" set TARGET_HOST=192.168.88.11

if not exist "%SSL_DIR%" mkdir "%SSL_DIR%"

echo ==============================================
echo SSL Certificate Setup for CyPhish Console
echo Target Host / IP: %TARGET_HOST%
echo Output Directory: %SSL_DIR%
echo ==============================================
echo.
echo Please select the type of certificate generation:
echo 1) Self-Signed Certificate (Auto-generated and pushed to local trust store)
echo 2) Generate a CSR (Certificate Signing Request for a signed CA)
set /p SSL_CHOICE="Select option (1 or 2): "

set CONFIG_FILE=%SSL_DIR%\openssl-san.cnf

(
echo [req]
echo default_bits = 2048
echo prompt = no
echo default_md = sha256
echo distinguished_name = req_distinguished_name
echo x509_extensions = v3_req
echo.
echo [req_distinguished_name]
echo C = US
echo ST = Security
echo L = Cybersecurity
echo O = CyPhish
echo OU = Awareness
echo CN = %TARGET_HOST%
echo.
echo [v3_req]
echo subjectAltName = @alt_names
echo basicConstraints = CA:FALSE
echo keyUsage = nonRepudiation, digitalSignature, keyEncipherment
echo.
echo [alt_names]
echo IP.1 = %TARGET_HOST%
echo IP.2 = 127.0.0.1
echo DNS.1 = localhost
) > "%CONFIG_FILE%"

if "%SSL_CHOICE%"=="2" (
  echo Generating CSR and Private Key...
  openssl req -new -nodes -newkey rsa:2048 -keyout "%SSL_DIR%\nginx-selfsigned.key" -out "%SSL_DIR%\cyphish.csr" -config "%CONFIG_FILE%"
  if exist "%CONFIG_FILE%" del "%CONFIG_FILE%"

  echo.
  echo [OK] CSR successfully created:
  echo    Key: %SSL_DIR%\nginx-selfsigned.key
  echo    CSR: %SSL_DIR%\cyphish.csr
  echo.
  echo ==================== NEXT STEPS ====================
  echo 1. Provide the CSR file (%SSL_DIR%\cyphish.csr) to your Certificate Authority ^(CA^) to get it signed.
  echo 2. Once you receive the signed certificate, save it as: %SSL_DIR%\nginx-selfsigned.crt
  echo 3. To ensure secure console loading, import your CA's root certificate into Windows:
  echo    - Open MMC -^> Add/Remove Snap-in -^> Certificates ^(Computer Account^)
  echo    - Navigate to Trusted Root Certification Authorities -^> Certificates
  echo    - Right-click -^> All Tasks -^> Import
  echo ====================================================
) else (
  echo Generating Self-Signed Certificate...
  openssl req -x509 -nodes -days 3650 -newkey rsa:2048 -keyout "%SSL_DIR%\nginx-selfsigned.key" -out "%SSL_DIR%\nginx-selfsigned.crt" -config "%CONFIG_FILE%"
  if exist "%CONFIG_FILE%" del "%CONFIG_FILE%"

  echo.
  echo [OK] SSL Certificate successfully created:
  echo    Key:  %SSL_DIR%\nginx-selfsigned.key
  echo    Cert: %SSL_DIR%\nginx-selfsigned.crt
  
  echo.
  echo Attempting to push to local trust store...
  certutil -addstore -f "Root" "%SSL_DIR%\nginx-selfsigned.crt"
  echo ==============================================
)
