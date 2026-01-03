// Ensure Admin Login for QR Management
// Script untuk memastikan admin sudah login dengan benar

const fs = require('fs');

console.log('🔐 Ensuring Admin Login for QR Management...');
console.log('');

// Create a comprehensive login test page
const loginTestContent = `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login Test - QR Management Fix</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            background: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .test-section { 
            margin: 20px 0; 
            padding: 15px; 
            border: 1px solid #ddd; 
            border-radius: 5px; 
        }
        .success { background-color: #d4edda; border-color: #c3e6cb; }
        .error { background-color: #f8d7da; border-color: #f5c6cb; }
        .info { background-color: #d1ecf1; border-color: #bee5eb; }
        .warning { background-color: #fff3cd; border-color: #ffeaa7; }
        button { 
            padding: 10px 15px; 
            margin: 5px; 
            cursor: pointer; 
            border: none;
            border-radius: 4px;
            background: #007bff;
            color: white;
        }
        button:hover { background: #0056b3; }
        button.danger { background: #dc3545; }
        button.danger:hover { background: #c82333; }
        button.success { background: #28a745; }
        button.success:hover { background: #218838; }
        pre { 
            background: #f8f9fa; 
            padding: 10px; 
            border-radius: 3px; 
            overflow-x: auto; 
            font-size: 12px;
        }
        input {
            padding: 8px;
            margin: 5px;
            border: 1px solid #ddd;
            border-radius: 4px;
            width: 200px;
        }
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        .status-online { background: #28a745; }
        .status-offline { background: #dc3545; }
        .status-warning { background: #ffc107; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 Admin Login Test - QR Management Fix</h1>
        <p>Halaman ini akan membantu memastikan admin sudah login dengan benar untuk mengakses QR Management.</p>
        
        <div class="test-section">
            <h3>1. Server Status Check</h3>
            <button onclick="checkServerStatus()">Check Backend Server</button>
            <div id="serverStatus"></div>
        </div>

        <div class="test-section">
            <h3>2. Current Auth Status</h3>
            <button onclick="checkCurrentAuth()">Check Current Auth</button>
            <button class="danger" onclick="clearAuth()">Clear Auth Data</button>
            <div id="currentAuthStatus"></div>
        </div>

        <div class="test-section">
            <h3>3. Admin Login</h3>
            <div>
                <input type="email" id="loginEmail" placeholder="Email" value="admin@example.com">
                <input type="password" id="loginPassword" placeholder="Password" value="admin123">
                <button class="success" onclick="performLogin()">Login</button>
            </div>
            <div id="loginResult"></div>
        </div>

        <div class="test-section">
            <h3>4. Test Protected Endpoints</h3>
            <button onclick="testUnitsEndpoint()">Test Units Endpoint</button>
            <button onclick="testQRCodesEndpoint()">Test QR Codes Endpoint</button>
            <div id="endpointResults"></div>
        </div>

        <div class="test-section">
            <h3>5. Quick Actions</h3>
            <button onclick="openQRManagement()">Open QR Management Page</button>
            <button onclick="openDashboard()">Open Dashboard</button>
        </div>
    </div>

    <script>
        const API_BASE = 'http://localhost:3003/api';
        
        async function checkServerStatus() {
            const result = document.getElementById('serverStatus');
            result.innerHTML = '<p>🔄 Checking server status...</p>';
            
            try {
                const response = await fetch(\`\${API_BASE}/health\`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    result.innerHTML = \`
                        <div class="success">
                            <span class="status-indicator status-online"></span>
                            <strong>Backend Server Online</strong>
                            <pre>\${JSON.stringify(data, null, 2)}</pre>
                        </div>
                    \`;
                } else {
                    result.innerHTML = \`
                        <div class="error">
                            <span class="status-indicator status-offline"></span>
                            <strong>Backend Server Error</strong>
                            <p>Status: \${response.status}</p>
                            <pre>\${JSON.stringify(data, null, 2)}</pre>
                        </div>
                    \`;
                }
            } catch (error) {
                result.innerHTML = \`
                    <div class="error">
                        <span class="status-indicator status-offline"></span>
                        <strong>Backend Server Offline</strong>
                        <p>Error: \${error.message}</p>
                        <p>Make sure backend server is running on port 3003</p>
                    </div>
                \`;
            }
        }
        
        async function checkCurrentAuth() {
            const result = document.getElementById('currentAuthStatus');
            result.innerHTML = '<p>🔄 Checking current auth status...</p>';
            
            try {
                // Check localStorage for Supabase auth
                const supabaseKeys = Object.keys(localStorage).filter(key => key.includes('supabase'));
                const adminUser = localStorage.getItem('adminUser');
                
                let authToken = null;
                let sessionData = null;
                
                // Find Supabase auth token
                for (const key of supabaseKeys) {
                    if (key.includes('auth-token')) {
                        try {
                            authToken = JSON.parse(localStorage.getItem(key));
                            break;
                        } catch (e) {
                            console.warn('Failed to parse auth token:', e);
                        }
                    }
                }
                
                let statusHtml = \`
                    <div class="info">
                        <h4>Local Storage Status:</h4>
                        <p>Supabase keys found: \${supabaseKeys.length}</p>
                        <p>Auth token exists: \${!!authToken}</p>
                        <p>Admin user data exists: \${!!adminUser}</p>
                \`;
                
                if (adminUser) {
                    try {
                        const userData = JSON.parse(adminUser);
                        statusHtml += \`
                            <h5>Admin User Data:</h5>
                            <pre>\${JSON.stringify(userData, null, 2)}</pre>
                        \`;
                    } catch (e) {
                        statusHtml += '<p>❌ Invalid admin user data format</p>';
                    }
                }
                
                if (authToken) {
                    statusHtml += \`
                        <h5>Auth Token Info:</h5>
                        <p>Token type: \${authToken.token_type || 'unknown'}</p>
                        <p>Expires at: \${authToken.expires_at ? new Date(authToken.expires_at * 1000).toLocaleString() : 'unknown'}</p>
                        <p>User ID: \${authToken.user?.id || 'unknown'}</p>
                        <p>User email: \${authToken.user?.email || 'unknown'}</p>
                    \`;
                    
                    // Test token with backend
                    try {
                        const verifyResponse = await fetch(\`\${API_BASE}/auth/verify\`, {
                            headers: {
                                'Authorization': \`Bearer \${authToken.access_token}\`
                            }
                        });
                        
                        const verifyData = await verifyResponse.json();
                        
                        if (verifyResponse.ok) {
                            statusHtml += \`
                                <div class="success">
                                    <h5>✅ Token Verification:</h5>
                                    <pre>\${JSON.stringify(verifyData, null, 2)}</pre>
                                </div>
                            \`;
                        } else {
                            statusHtml += \`
                                <div class="error">
                                    <h5>❌ Token Verification Failed:</h5>
                                    <pre>\${JSON.stringify(verifyData, null, 2)}</pre>
                                </div>
                            \`;
                        }
                    } catch (verifyError) {
                        statusHtml += \`
                            <div class="error">
                                <h5>❌ Token Verification Error:</h5>
                                <p>\${verifyError.message}</p>
                            </div>
                        \`;
                    }
                }
                
                statusHtml += '</div>';
                result.innerHTML = statusHtml;
                
            } catch (error) {
                result.innerHTML = \`
                    <div class="error">
                        <p>❌ Error checking auth status: \${error.message}</p>
                    </div>
                \`;
            }
        }
        
        function clearAuth() {
            if (confirm('Are you sure you want to clear all auth data?')) {
                // Clear all Supabase related localStorage
                const keysToRemove = Object.keys(localStorage).filter(key => 
                    key.includes('supabase') || key.includes('auth') || key === 'adminUser'
                );
                
                keysToRemove.forEach(key => localStorage.removeItem(key));
                sessionStorage.clear();
                
                document.getElementById('currentAuthStatus').innerHTML = \`
                    <div class="success">
                        <p>✅ Auth data cleared successfully</p>
                        <p>Removed \${keysToRemove.length} keys from localStorage</p>
                    </div>
                \`;
            }
        }
        
        async function performLogin() {
            const result = document.getElementById('loginResult');
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (!email || !password) {
                result.innerHTML = '<div class="error"><p>❌ Please enter email and password</p></div>';
                return;
            }
            
            result.innerHTML = '<p>🔄 Logging in...</p>';
            
            try {
                const response = await fetch(\`\${API_BASE}/auth/login\`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    // Store auth data like the frontend does
                    if (data.data && data.data.session) {
                        // Store Supabase session
                        const hostname = window.location.hostname.replace(/\\./g, '-');
                        const tokenKey = \`sb-\${hostname}-auth-token\`;
                        localStorage.setItem(tokenKey, JSON.stringify(data.data.session));
                        
                        // Store admin user data
                        if (data.data.admin) {
                            localStorage.setItem('adminUser', JSON.stringify(data.data.admin));
                        }
                        
                        result.innerHTML = \`
                            <div class="success">
                                <h4>✅ Login Successful!</h4>
                                <p>Welcome, \${data.data.admin?.full_name || data.data.admin?.username || email}</p>
                                <p>Role: \${data.data.admin?.role || 'admin'}</p>
                                <pre>\${JSON.stringify(data.data.admin, null, 2)}</pre>
                            </div>
                        \`;
                        
                        // Auto-check auth status after login
                        setTimeout(checkCurrentAuth, 1000);
                    } else {
                        result.innerHTML = \`
                            <div class="warning">
                                <h4>⚠️ Login Successful but No Session Data</h4>
                                <pre>\${JSON.stringify(data, null, 2)}</pre>
                            </div>
                        \`;
                    }
                } else {
                    result.innerHTML = \`
                        <div class="error">
                            <h4>❌ Login Failed</h4>
                            <p>Status: \${response.status}</p>
                            <p>Error: \${data.error || data.message || 'Unknown error'}</p>
                            <pre>\${JSON.stringify(data, null, 2)}</pre>
                        </div>
                    \`;
                }
            } catch (error) {
                result.innerHTML = \`
                    <div class="error">
                        <h4>❌ Login Error</h4>
                        <p>\${error.message}</p>
                    </div>
                \`;
            }
        }
        
        async function testUnitsEndpoint() {
            const result = document.getElementById('endpointResults');
            result.innerHTML = '<p>🔄 Testing units endpoint...</p>';
            
            try {
                // Get auth token
                const supabaseKeys = Object.keys(localStorage).filter(key => key.includes('supabase') && key.includes('auth-token'));
                let authToken = null;
                
                for (const key of supabaseKeys) {
                    try {
                        authToken = JSON.parse(localStorage.getItem(key));
                        break;
                    } catch (e) {
                        continue;
                    }
                }
                
                const headers = { 'Content-Type': 'application/json' };
                if (authToken && authToken.access_token) {
                    headers['Authorization'] = \`Bearer \${authToken.access_token}\`;
                }
                
                const response = await fetch(\`\${API_BASE}/units\`, { headers });
                const data = await response.json();
                
                result.innerHTML = \`
                    <div class="\${response.ok ? 'success' : 'error'}">
                        <h4>Units Endpoint Test:</h4>
                        <p>Status: \${response.status}</p>
                        <p>Auth token used: \${!!authToken}</p>
                        <pre>\${JSON.stringify(data, null, 2)}</pre>
                    </div>
                \`;
            } catch (error) {
                result.innerHTML = \`
                    <div class="error">
                        <h4>❌ Units Endpoint Error</h4>
                        <p>\${error.message}</p>
                    </div>
                \`;
            }
        }
        
        async function testQRCodesEndpoint() {
            const result = document.getElementById('endpointResults');
            
            try {
                // Get auth token
                const supabaseKeys = Object.keys(localStorage).filter(key => key.includes('supabase') && key.includes('auth-token'));
                let authToken = null;
                
                for (const key of supabaseKeys) {
                    try {
                        authToken = JSON.parse(localStorage.getItem(key));
                        break;
                    } catch (e) {
                        continue;
                    }
                }
                
                const headers = { 'Content-Type': 'application/json' };
                if (authToken && authToken.access_token) {
                    headers['Authorization'] = \`Bearer \${authToken.access_token}\`;
                }
                
                const response = await fetch(\`\${API_BASE}/qr-codes?page=1&limit=10&include_analytics=true\`, { headers });
                const data = await response.json();
                
                result.innerHTML += \`
                    <div class="\${response.ok ? 'success' : 'error'}">
                        <h4>QR Codes Endpoint Test:</h4>
                        <p>Status: \${response.status}</p>
                        <p>Auth token used: \${!!authToken}</p>
                        <pre>\${JSON.stringify(data, null, 2)}</pre>
                    </div>
                \`;
            } catch (error) {
                result.innerHTML += \`
                    <div class="error">
                        <h4>❌ QR Codes Endpoint Error</h4>
                        <p>\${error.message}</p>
                    </div>
                \`;
            }
        }
        
        function openQRManagement() {
            window.open('http://localhost:3000/tickets/qr-management', '_blank');
        }
        
        function openDashboard() {
            window.open('http://localhost:3000/dashboard', '_blank');
        }
        
        // Auto-check server status on load
        window.addEventListener('load', () => {
            checkServerStatus();
            checkCurrentAuth();
        });
    </script>
    </div>
</body>
</html>`;

console.log('📝 Creating comprehensive login test page...');
fs.writeFileSync('admin-login-test.html', loginTestContent);
console.log('✅ admin-login-test.html created');

console.log('');
console.log('🎉 Admin Login Test Setup Complete!');
console.log('');
console.log('📋 Next Steps:');
console.log('1. Run TEST_QR_MANAGEMENT_AUTH_FIX.bat');
console.log('2. Open admin-login-test.html in browser');
console.log('3. Check server status');
console.log('4. Check current auth status');
console.log('5. Login if needed');
console.log('6. Test protected endpoints');
console.log('7. Open QR Management page');
console.log('');
console.log('🔧 If still having issues:');
console.log('- Make sure backend is running on port 3003');
console.log('- Make sure frontend is running on port 3000');
console.log('- Check if admin user exists in database');
console.log('- Check browser console for detailed errors');