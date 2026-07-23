#!/usr/bin/env bash
# pack.sh — build, package .ehpk, generate QR code for Even Hub sideload
# Usage: ./pack.sh [version]   (defaults to version from app.json)
set -euo pipefail
cd "$(dirname "$0")"

VERSION=$(node -e "console.log(require('./app.json').version)")
APPNAME=$(node -e "console.log(require('./app.json').name)")

echo "→ Building ${APPNAME} v${VERSION}..."
npm run build

echo "→ Packaging .ehpk..."
mkdir -p builds
npx evenhub pack app.json dist/ -o "builds/${APPNAME}-v${VERSION}.ehpk"

echo "→ Generating QR code..."
IP=$(ipconfig getifaddr en0 2>/dev/null || echo 'LOCAL_IP')
python3 -c "
import qrcode
qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=2)
qr.add_data('http://${IP}:5173/')
qr.make(fit=True)
img = qr.make_image(fill_color='black', back_color='white')
img.save('builds/${APPNAME}-v${VERSION}-qr.png')
print('QR saved: builds/${APPNAME}-v${VERSION}-qr.png')
"

echo "→ Done!"
echo "   .ehpk: builds/${APPNAME}-v${VERSION}.ehpk"
echo "   QR:    builds/${APPNAME}-v${VERSION}-qr.png"
echo "   URL:   http://${IP}:5173/"
echo ""
echo "→ To test: ./sim.sh"
echo "→ To sideload: scan builds/${APPNAME}-v${VERSION}-qr.png with Even Hub on your phone"
