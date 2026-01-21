@echo off
echo ========================================
echo TEST FORM TIKET EKSTERNAL
echo ========================================
echo.

echo Langkah 1: Ambil Unit ID dari database...
echo.

node -e "const fetch = require('node-fetch'); fetch('http://localhost:3004/api/public/units').then(r => r.json()).then(data => { if(data.success && data.data.length > 0) { const unit = data.data[0]; console.log('Unit ID:', unit.id); console.log('Unit Name:', unit.name); console.log(''); console.log('URL untuk test:'); console.log('http://localhost:3002/form/eksternal?unit_id=' + unit.id + '&unit_name=' + encodeURIComponent(unit.name)); } else { console.log('Tidak ada unit ditemukan!'); } }).catch(err => console.error('Error:', err.message));"

echo.
echo ========================================
echo INSTRUKSI:
echo ========================================
echo 1. Copy URL di atas
echo 2. Paste di browser
echo 3. Isi form dan submit
echo 4. Periksa console browser untuk log
echo 5. Periksa terminal backend untuk error
echo.
echo Atau gunakan test-external-ticket-endpoint.html
echo untuk test langsung ke API
echo ========================================
pause
