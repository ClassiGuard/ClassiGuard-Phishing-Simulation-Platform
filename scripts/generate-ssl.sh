#!/usr/bin/env bash
# CyPhish - SSL Certificate Generator
# Generates a modern self-signed certificate OR a CSR with SAN (Subject Alternative Name).

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SSL_DIR="$ROOT_DIR/ssl"
TARGET_HOST="${1:-192.168.88.11}"

mkdir -p "$SSL_DIR"

echo "=============================================="
echo "SSL Certificate Setup for CyPhish Console"
echo "Target Host / IP: $TARGET_HOST"
echo "Output Directory: $SSL_DIR"
echo "=============================================="
echo ""
echo "Please select the type of certificate generation:"
echo "1) Self-Signed Certificate (Auto-generated and pushed to local trust store)"
echo "2) Generate a CSR (Certificate Signing Request for a signed CA)"
read -p "Select option (1 or 2): " SSL_CHOICE

CONFIG_FILE="$SSL_DIR/openssl-san.cnf"

# Determine if TARGET_HOST is an IP address or domain and write config
if [[ "$TARGET_HOST" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
cat > "$CONFIG_FILE" <<IN_EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = req_distinguished_name
x509_extensions = v3_req

[req_distinguished_name]
C = US
ST = Security
L = Cybersecurity
O = CyPhish
OU = Awareness
CN = $TARGET_HOST

[v3_req]
subjectAltName = @alt_names
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment

[alt_names]
IP.1 = $TARGET_HOST
IP.2 = 127.0.0.1
DNS.1 = localhost
IN_EOF
else
cat > "$CONFIG_FILE" <<IN_EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = req_distinguished_name
x509_extensions = v3_req

[req_distinguished_name]
C = US
ST = Security
L = Cybersecurity
O = CyPhish
OU = Awareness
CN = $TARGET_HOST

[v3_req]
subjectAltName = @alt_names
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment

[alt_names]
DNS.1 = $TARGET_HOST
DNS.2 = localhost
IP.1 = 127.0.0.1
IN_EOF
fi

if [ "$SSL_CHOICE" == "2" ]; then
  # Generate CSR
  echo "Generating CSR and Private Key..."
  openssl req -new -nodes -newkey rsa:2048 \
    -keyout "$SSL_DIR/nginx-selfsigned.key" \
    -out "$SSL_DIR/cyphish.csr" \
    -config "$CONFIG_FILE"

  rm -f "$CONFIG_FILE"

  echo ""
  echo "✅ CSR successfully created:"
  echo "   Key: $SSL_DIR/nginx-selfsigned.key"
  echo "   CSR: $SSL_DIR/cyphish.csr"
  echo ""
  echo "==================== NEXT STEPS ===================="
  echo "1. Provide the CSR file ($SSL_DIR/cyphish.csr) to your Certificate Authority (CA) to get it signed."
  echo "2. Once you receive the signed certificate, save it as: $SSL_DIR/nginx-selfsigned.crt"
  echo "3. To ensure secure console loading, add your CA's root certificate to the system trust store on client machines:"
  echo "   - Linux (Debian/Ubuntu): Copy CA to /usr/local/share/ca-certificates/ and run 'sudo update-ca-certificates'"
  echo "   - Linux (RHEL/CentOS): Copy CA to /etc/pki/ca-trust/source/anchors/ and run 'sudo update-ca-trust'"
  echo "   - Windows: Use MMC -> Certificates snap-in -> Trusted Root Certification Authorities -> Import"
  echo "===================================================="

else
  # Generate Self-Signed
  echo "Generating Self-Signed Certificate..."
  openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout "$SSL_DIR/nginx-selfsigned.key" \
    -out "$SSL_DIR/nginx-selfsigned.crt" \
    -config "$CONFIG_FILE"

  rm -f "$CONFIG_FILE"
  
  echo ""
  echo "✅ SSL Certificate successfully created:"
  echo "   Key:  $SSL_DIR/nginx-selfsigned.key"
  echo "   Cert: $SSL_DIR/nginx-selfsigned.crt"
  
  # Attempt to push to trust store if on Linux
  echo ""
  echo "Attempting to add to local trust store..."
  if [ -d "/usr/local/share/ca-certificates" ]; then
    sudo cp "$SSL_DIR/nginx-selfsigned.crt" "/usr/local/share/ca-certificates/cyphish-selfsigned.crt" 2>/dev/null || echo "Note: Run as root or with sudo privileges to copy to trust store"
    sudo update-ca-certificates 2>/dev/null || true
  elif [ -d "/etc/pki/ca-trust/source/anchors" ]; then
    sudo cp "$SSL_DIR/nginx-selfsigned.crt" "/etc/pki/ca-trust/source/anchors/cyphish-selfsigned.crt" 2>/dev/null || echo "Note: Run as root or with sudo privileges to copy to trust store"
    sudo update-ca-trust 2>/dev/null || true
  else
    echo "Could not auto-detect trust store directory. Please add $SSL_DIR/nginx-selfsigned.crt manually to trust the console."
  fi
  echo "=============================================="
fi
