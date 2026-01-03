@echo off
echo ========================================
echo    FIX SUPABASE CONNECTION TIMEOUT
echo ========================================
echo.

echo [1/4] Testing Supabase connection from backend...
node fix-supabase-connection-timeout.js
echo.

echo [2/4] Opening connection test in browser...
start "" "test-login-connection-fix-final.html"
echo.

echo [3/4] Checking environment configuration...
echo Frontend .env:
type frontend\.env
echo.
echo Backend .env:
type backend\.env
echo.

echo [4/4] Recommendations for fixing QUIC protocol errors:
echo.
echo 1. BROWSER SETTINGS:
echo    - Chrome: Go to chrome://flags/#enable-quic and set to "Disabled"
echo    - Edge: Go to edge://flags/#enable-quic and set to "Disabled"
echo    - Firefox: Set network.http.http3.enabled to false in about:config
echo.
echo 2. NETWORK TROUBLESHOOTING:
echo    - Check internet connection stability
echo    - Try using a different DNS (8.8.8.8, 1.1.1.1)
echo    - Consider using a VPN if regional connectivity issues exist
echo.
echo 3. APPLICATION FIXES:
echo    - Updated Supabase client with retry mechanism
echo    - Added timeout handling (30 seconds)
echo    - Implemented automatic retry for network errors
echo.
echo 4. ALTERNATIVE SOLUTIONS:
echo    - Use HTTP/1.1 instead of HTTP/2 if issues persist
echo    - Clear browser cache and cookies
echo    - Try incognito/private browsing mode
echo.

echo ========================================
echo Test completed! Check the browser window for detailed results.
echo ========================================
pause