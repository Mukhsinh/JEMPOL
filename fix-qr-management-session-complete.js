// Fix untuk masalah session pada QR Management
// Masalah: "No existing session found" dan error 403 pada API calls

console.log('🔧 Memperbaiki masalah session QR Management...');

// 1. Perbaikan AuthContext - tambahkan session validation
const authContextFix = `
// Tambahkan di AuthContext.tsx setelah line 28
useEffect(() => {
  // Check if user is already logged in
  const initAuth = async () => {
    try {
      console.log('🔄 INITIAL_SESSION Initializing auth...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session error:', error);
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }
      
      if (session?.user) {
        console.log('✅ INITIAL_SESSION Session exists for:', session.user.email);
        
        // Validate session is not expired
        const now = Math.floor(Date.now() / 1000);
        if (session.expires_at && session.expires_at < now) {
          console.warn('⚠️ Session expired, clearing...');
          await supabase.auth.signOut();
          setIsLoading(false);
          return;
        }
        
        // Test token validity with backend
        try {
          const testResponse = await fetch('/api/auth/verify', {
            method: 'GET',
            headers: {
              'Authorization': \`Bearer \${session.access_token}\`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!testResponse.ok) {
            console.warn('⚠️ Token validation failed, clearing session...');
            await supabase.auth.signOut();
            setIsLoading(false);
            return;
          }
        } catch (tokenError) {
          console.warn('⚠️ Token test failed:', tokenError.message);
          // Continue with admin profile check
        }
        
        // Get admin profile with retry mechanism
        let adminProfile = null;
        let profileError = null;
        
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            const { data: profileData, error: error1 } = await supabase
              .from('admins')
              .select('id, username, full_name, email, role, is_active')
              .eq('email', session.user.email)
              .eq('is_active', true)
              .single();
            
            if (error1) {
              profileError = error1;
              if (attempt < 3) {
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
              }
            } else if (profileData) {
              adminProfile = profileData;
              break;
            }
          } catch (error) {
            profileError = error;
            if (attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
          }
        }

        if (profileError || !adminProfile) {
          console.error('❌ Admin profile not found:', profileError);
          await supabase.auth.signOut();
          setIsLoading(false);
          return;
        }

        const userData = {
          id: adminProfile.id,
          username: adminProfile.username,
          full_name: adminProfile.full_name,
          email: adminProfile.email,
          role: adminProfile.role || 'admin',
        };

        setUser(userData);
        console.log('✅ INITIAL_SESSION User restored:', userData.email);
      } else {
        console.log('ℹ️ INITIAL_SESSION No existing session found');
      }
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      await supabase.auth.signOut();
    } finally {
      setIsLoading(false);
    }
  };

  initAuth();

  // Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      console.log('🔄 Auth state change:', event, session?.user?.email);
      
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        console.log('✅ Token refreshed for:', session.user.email);
      }
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}, []);
`;

// 2. Perbaikan QRManagement component - tambahkan session check
const qrManagementFix = `
// Tambahkan di QRManagement.tsx setelah import
import { useAuth } from '../../contexts/AuthContext';

// Tambahkan di dalam component
const { isAuthenticated, isLoading: authLoading, user } = useAuth();

// Tambahkan early return setelah state declarations
if (authLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

if (!isAuthenticated || !user) {
  console.warn('⚠️ QR Management: No authentication, redirecting...');
  window.location.href = '/login';
  return null;
}

// Modifikasi loadData function
const loadData = async () => {
  try {
    setLoading(true);
    
    // Ensure we have valid authentication
    if (!isAuthenticated || !user) {
      console.warn('⚠️ No authentication for data loading');
      window.location.href = '/login';
      return;
    }
    
    console.log('🔄 Loading QR Management data for user:', user.email);
    
    // Load units for dropdown with better error handling
    try {
      const unitsResponse = await unitService.getUnits();
      setUnits(unitsResponse.units || []);
      console.log('✅ Units loaded:', unitsResponse.units?.length || 0);
    } catch (unitsError) {
      console.error('❌ Units loading failed:', unitsError.message);
      // Continue with empty units array
      setUnits([]);
    }

    // Load QR codes with filters
    const params = {
      page: currentPage,
      limit: 10,
      include_analytics: true,
      ...(searchTerm && { search: searchTerm }),
      ...(statusFilter !== 'all' && { is_active: statusFilter === 'active' })
    };

    try {
      const response = await qrCodeService.getQRCodes(params);
      setQrCodes(response.qr_codes || []);
      setTotalPages(response.pagination?.pages || 1);
      console.log('✅ QR codes loaded:', response.qr_codes?.length || 0);
    } catch (qrError) {
      console.error('❌ QR codes loading failed:', qrError.message);
      
      // If it's an auth error, redirect to login
      if (qrError.message?.includes('Token tidak valid') || 
          qrError.message?.includes('Authentication required')) {
        console.warn('🔐 Authentication error, redirecting to login...');
        window.location.href = '/login';
        return;
      }
      
      // For other errors, show empty state
      setQrCodes([]);
      setTotalPages(1);
    }
  } catch (error) {
    console.error('❌ Data loading error:', error);
  } finally {
    setLoading(false);
  }
};
`;

// 3. Perbaikan API service - improve token handling
const apiServiceFix = `
// Modifikasi di api.ts - request interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      // Import authService dynamically to avoid circular dependency
      const { authService } = await import('./authService');
      const token = await authService.getToken();
      
      if (token) {
        // Validate token before using it
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const now = Math.floor(Date.now() / 1000);
          
          if (payload.exp && payload.exp < now) {
            console.warn('⚠️ Token expired, attempting refresh...');
            
            // Try to refresh token
            const { supabase } = await import('../utils/supabaseClient');
            const { data: { session }, error } = await supabase.auth.refreshSession();
            
            if (error || !session?.access_token) {
              console.error('❌ Token refresh failed:', error);
              await authService.logout();
              if (window.location.pathname.startsWith('/admin') || 
                  window.location.pathname.startsWith('/dashboard') || 
                  window.location.pathname.startsWith('/tickets')) {
                window.location.href = '/login';
              }
              return config;
            }
            
            config.headers.Authorization = \`Bearer \${session.access_token}\`;
            console.log('✅ Token refreshed successfully');
          } else {
            config.headers.Authorization = \`Bearer \${token}\`;
          }
        } catch (tokenParseError) {
          console.warn('⚠️ Token parse error:', tokenParseError);
          config.headers.Authorization = \`Bearer \${token}\`;
        }
      } else {
        console.warn('⚠️ No token available for request to:', config.url);
      }
    } catch (error) {
      console.error('❌ Error in request interceptor:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
`;

console.log('✅ Perbaikan session QR Management siap diterapkan');
console.log('\n📋 Langkah-langkah perbaikan:');
console.log('1. Update AuthContext dengan session validation');
console.log('2. Update QRManagement component dengan auth check');
console.log('3. Update API service dengan token refresh');
console.log('4. Test dengan membuka halaman QR Management');

console.log('\n🔧 Implementasi:');
console.log('- Jalankan script ini untuk melihat perbaikan yang diperlukan');
console.log('- Terapkan perubahan pada file-file terkait');
console.log('- Test login dan akses QR Management');

module.exports = {
  authContextFix,
  qrManagementFix,
  apiServiceFix
};