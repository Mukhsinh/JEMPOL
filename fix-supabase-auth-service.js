// Fix Supabase Auth Service - Solusi untuk masalah QUIC_PROTOCOL_ERROR dan JWT invalid
const { createClient } = require('@supabase/supabase-js');

class FixedSupabaseAuthService {
    constructor() {
        this.supabaseUrl = 'https://jxxzbdivafzzwqhagwrf.supabase.co';
        this.supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg';
        this.supabasePublishableKey = 'sb_publishable_L_ThxWOhbRY5DzSiDCQmZQ_cjV3CjWF';
        
        this.initializeClient();
    }

    initializeClient() {
        try {
            // Konfigurasi client dengan retry dan timeout yang lebih baik
            this.supabase = createClient(this.supabaseUrl, this.supabaseAnonKey, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: false,
                    flowType: 'pkce'
                },
                global: {
                    headers: {
                        'apikey': this.supabaseAnonKey,
                        'Authorization': `Bearer ${this.supabaseAnonKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    fetch: this.customFetch.bind(this)
                },
                db: {
                    schema: 'public'
                }
            });

            console.log('✅ Supabase client initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Supabase client:', error);
            throw error;
        }
    }

    // Custom fetch dengan retry mechanism untuk mengatasi QUIC_PROTOCOL_ERROR
    async customFetch(url, options = {}) {
        const maxRetries = 3;
        const retryDelay = 1000; // 1 second

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Add timeout to prevent hanging requests
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal,
                    headers: {
                        ...options.headers,
                        'Connection': 'keep-alive',
                        'Cache-Control': 'no-cache'
                    }
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return response;
            } catch (error) {
                console.warn(`Attempt ${attempt} failed:`, error.message);

                if (attempt === maxRetries) {
                    throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
                }

                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
            }
        }
    }

    // Clear semua session dan storage yang bermasalah
    async clearAuthState() {
        try {
            // Sign out dari Supabase
            await this.supabase.auth.signOut();

            // Clear localStorage
            if (typeof localStorage !== 'undefined') {
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && (key.includes('supabase') || key.includes('auth'))) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));
            }

            // Clear sessionStorage
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.clear();
            }

            console.log('✅ Auth state cleared successfully');
        } catch (error) {
            console.error('❌ Error clearing auth state:', error);
        }
    }

    // Login dengan error handling yang lebih baik
    async login(email, password) {
        try {
            console.log('🔄 Attempting login...');

            // Clear any existing problematic session
            await this.clearAuthState();

            // Reinitialize client
            this.initializeClient();

            // Attempt login
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password
            });

            if (error) {
                throw error;
            }

            if (!data.user) {
                throw new Error('Login successful but no user data received');
            }

            console.log('✅ Login successful:', data.user.email);
            return {
                success: true,
                user: data.user,
                session: data.session
            };

        } catch (error) {
            console.error('❌ Login error:', error);
            
            // Try with publishable key as fallback
            if (error.message.includes('JWT') || error.message.includes('QUIC')) {
                console.log('🔄 Trying with publishable key...');
                return await this.loginWithPublishableKey(email, password);
            }

            return {
                success: false,
                error: error.message
            };
        }
    }

    // Fallback login dengan publishable key
    async loginWithPublishableKey(email, password) {
        try {
            const publishableClient = createClient(this.supabaseUrl, this.supabasePublishableKey, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true
                },
                global: {
                    fetch: this.customFetch.bind(this)
                }
            });

            const { data, error } = await publishableClient.auth.signInWithPassword({
                email: email.trim(),
                password: password
            });

            if (error) {
                throw error;
            }

            console.log('✅ Login with publishable key successful');
            
            // Update main client
            this.supabase = publishableClient;

            return {
                success: true,
                user: data.user,
                session: data.session
            };

        } catch (error) {
            console.error('❌ Publishable key login error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get current user dengan error handling
    async getCurrentUser() {
        try {
            const { data, error } = await this.supabase.auth.getUser();
            
            if (error) {
                throw error;
            }

            return {
                success: true,
                user: data.user
            };
        } catch (error) {
            console.error('❌ Get user error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Test koneksi
    async testConnection() {
        try {
            const { data, error } = await this.supabase.auth.getSession();
            
            if (error) {
                throw error;
            }

            console.log('✅ Connection test successful');
            return {
                success: true,
                hasSession: !!data.session,
                user: data.session?.user?.email || null
            };
        } catch (error) {
            console.error('❌ Connection test failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Logout
    async logout() {
        try {
            await this.supabase.auth.signOut();
            await this.clearAuthState();
            
            console.log('✅ Logout successful');
            return { success: true };
        } catch (error) {
            console.error('❌ Logout error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Test function
async function testFixedAuthService() {
    console.log('🚀 Testing Fixed Supabase Auth Service...');
    
    const authService = new FixedSupabaseAuthService();
    
    // Test connection
    console.log('\n1. Testing connection...');
    const connectionResult = await authService.testConnection();
    console.log('Connection result:', connectionResult);
    
    // Test login
    console.log('\n2. Testing login...');
    const loginResult = await authService.login('admin@jempol.com', 'admin123');
    console.log('Login result:', loginResult);
    
    if (loginResult.success) {
        // Test get current user
        console.log('\n3. Testing get current user...');
        const userResult = await authService.getCurrentUser();
        console.log('User result:', userResult);
        
        // Test logout
        console.log('\n4. Testing logout...');
        const logoutResult = await authService.logout();
        console.log('Logout result:', logoutResult);
    }
}

// Export untuk digunakan di aplikasi
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FixedSupabaseAuthService;
}

// Run test jika dijalankan langsung
if (require.main === module) {
    testFixedAuthService().catch(console.error);
}