// Debug QR Management Auth Issues
// Script untuk menganalisis masalah auth secara detail

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging QR Management Auth Issues...');
console.log('');

// 1. Check if auth service is properly configured
console.log('1. 📋 Checking auth service configuration...');

const authServicePath = 'frontend/src/services/authService.ts';
if (fs.existsSync(authServicePath)) {
    const authServiceContent = fs.readFileSync(authServicePath, 'utf8');
    
    // Check if getToken method exists and is properly implemented
    if (authServiceContent.includes('async getToken()')) {
        console.log('   ✅ getToken method found in authService');
    } else {
        console.log('   ❌ getToken method missing in authService');
    }
    
    // Check if token is retrieved from Supabase session
    if (authServiceContent.includes('supabase.auth.getSession()')) {
        console.log('   ✅ Token retrieval from Supabase session found');
    } else {
        console.log('   ❌ Token retrieval from Supabase session missing');
    }
} else {
    console.log('   ❌ authService.ts not found');
}

// 2. Check API service configuration
console.log('');
console.log('2. 📋 Checking API service configuration...');

const apiServicePath = 'frontend/src/services/api.ts';
if (fs.existsSync(apiServicePath)) {
    const apiServiceContent = fs.readFileSync(apiServicePath, 'utf8');
    
    // Check if request interceptor adds auth token
    if (apiServiceContent.includes('Authorization') && apiServiceContent.includes('Bearer')) {
        console.log('   ✅ Authorization header setup found');
    } else {
        console.log('   ❌ Authorization header setup missing');
    }
    
    // Check if 403 error is handled
    if (apiServiceContent.includes('403')) {
        console.log('   ✅ 403 error handling found');
    } else {
        console.log('   ❌ 403 error handling missing');
    }
} else {
    console.log('   ❌ api.ts not found');
}

// 3. Check backend auth middleware
console.log('');
console.log('3. 📋 Checking backend auth middleware...');

const authMiddlewarePath = 'backend/src/middleware/auth.ts';
if (fs.existsSync(authMiddlewarePath)) {
    const authMiddlewareContent = fs.readFileSync(authMiddlewarePath, 'utf8');
    
    // Check if Supabase token verification exists
    if (authMiddlewareContent.includes('supabase.auth.getUser')) {
        console.log('   ✅ Supabase token verification found');
    } else {
        console.log('   ❌ Supabase token verification missing');
    }
    
    // Check if admin profile lookup exists
    if (authMiddlewareContent.includes('admins') && authMiddlewareContent.includes('is_active')) {
        console.log('   ✅ Admin profile lookup found');
    } else {
        console.log('   ❌ Admin profile lookup missing');
    }
} else {
    console.log('   ❌ auth.ts middleware not found');
}

// 4. Check routes configuration
console.log('');
console.log('4. 📋 Checking routes configuration...');

const unitRoutesPath = 'backend/src/routes/unitRoutes.ts';
if (fs.existsSync(unitRoutesPath)) {
    const unitRoutesContent = fs.readFileSync(unitRoutesPath, 'utf8');
    
    if (unitRoutesContent.includes('authenticateToken')) {
        console.log('   ✅ Units routes protected with authenticateToken');
    } else {
        console.log('   ❌ Units routes not properly protected');
    }
} else {
    console.log('   ❌ unitRoutes.ts not found');
}

const qrRoutesPath = 'backend/src/routes/qrCodeRoutes.ts';
if (fs.existsSync(qrRoutesPath)) {
    const qrRoutesContent = fs.readFileSync(qrRoutesPath, 'utf8');
    
    if (qrRoutesContent.includes('authenticateToken')) {
        console.log('   ✅ QR Code routes protected with authenticateToken');
    } else {
        console.log('   ❌ QR Code routes not properly protected');
    }
} else {
    console.log('   ❌ qrCodeRoutes.ts not found');
}

// 5. Check public routes availability
console.log('');
console.log('5. 📋 Checking public routes availability...');

const publicDataRoutesPath = 'backend/src/routes/publicDataRoutes.ts';
if (fs.existsSync(publicDataRoutesPath)) {
    const publicDataRoutesContent = fs.readFileSync(publicDataRoutesPath, 'utf8');
    
    if (publicDataRoutesContent.includes('/units')) {
        console.log('   ✅ Public units route found');
    } else {
        console.log('   ❌ Public units route missing');
    }
} else {
    console.log('   ❌ publicDataRoutes.ts not found');
}

// 6. Check server.ts configuration
console.log('');
console.log('6. 📋 Checking server configuration...');

const serverPath = 'backend/src/server.ts';
if (fs.existsSync(serverPath)) {
    const serverContent = fs.readFileSync(serverPath, 'utf8');
    
    if (serverContent.includes('/api/public') && serverContent.includes('publicDataRoutes')) {
        console.log('   ✅ Public data routes registered in server');
    } else {
        console.log('   ❌ Public data routes not registered in server');
    }
    
    if (serverContent.includes('/api/units') && serverContent.includes('unitRoutes')) {
        console.log('   ✅ Unit routes registered in server');
    } else {
        console.log('   ❌ Unit routes not registered in server');
    }
    
    if (serverContent.includes('/api/qr-codes') && serverContent.includes('qrCodeRoutes')) {
        console.log('   ✅ QR Code routes registered in server');
    } else {
        console.log('   ❌ QR Code routes not registered in server');
    }
} else {
    console.log('   ❌ server.ts not found');
}

console.log('');
console.log('🔍 Debug Analysis Complete!');
console.log('');
console.log('📋 Common Issues and Solutions:');
console.log('');
console.log('❌ If Authorization header setup is missing:');
console.log('   → Check api.ts request interceptor');
console.log('   → Ensure authService.getToken() is called');
console.log('');
console.log('❌ If Supabase token verification is missing:');
console.log('   → Check auth middleware in backend');
console.log('   → Ensure supabase.auth.getUser() is used');
console.log('');
console.log('❌ If admin profile lookup is missing:');
console.log('   → Check if admin table query exists');
console.log('   → Ensure is_active filter is applied');
console.log('');
console.log('❌ If public routes are missing:');
console.log('   → Check publicDataRoutes.ts');
console.log('   → Ensure routes are registered in server.ts');
console.log('');
console.log('🔧 Recommended Actions:');
console.log('1. Run TEST_QR_MANAGEMENT_AUTH_FIX.bat');
console.log('2. Open test-qr-management-auth-fix.html');
console.log('3. Check auth status and login if needed');
console.log('4. Test endpoints individually');
console.log('5. Check browser console for detailed errors');