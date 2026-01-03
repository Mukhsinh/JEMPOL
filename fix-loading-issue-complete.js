// Fix untuk masalah loading terus-menerus
const fs = require('fs');
const path = require('path');

console.log('🔧 MEMPERBAIKI MASALAH LOADING APLIKASI');
console.log('======================================\n');

// 1. Fix AuthContext - Prevent infinite loop
const authContextFixed = `import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../utils/supabaseClient';

interface User {
  id: string;
  username: string;
  full_name?: string;
  email?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error?: string; success: boolean }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (initialized) return;

    let isMounted = true;
    
    const initAuth = async () => {
      try {
        console.log('🔄 Initializing auth...');
        
        // Get current session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        );
        
        const { data: { session }, error } = await Promise.race([
          sessionPromise, 
          timeoutPromise
        ]) as any;

        if (!isMounted) return;

        if (error) {
          console.error('❌ Session error:', error);
          setIsLoading(false);
          setInitialized(true);
          return;
        }

        if (!session?.user) {
          console.log('ℹ️ No active session');
          setIsLoading(false);
          setInitialized(true);
          return;
        }

        console.log('✅ Session found:', session.user.email);

        // Get admin profile with timeout
        const profilePromise = supabase
          .from('admins')
          .select('id, username, full_name, email, role, is_active')
          .eq('email', session.user.email)
          .eq('is_active', true)
          .single();

        const profileTimeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile timeout')), 8000)
        );

        const { data: profileData, error: profileError } = await Promise.race([
          profilePromise,
          profileTimeoutPromise
        ]) as any;

        if (!isMounted) return;

        if (profileError || !profileData) {
          console.error('❌ Profile error:', profileError);
          await supabase.auth.signOut();
          setIsLoading(false);
          setInitialized(true);
          return;
        }

        const userData = {
          id: profileData.id,
          username: profileData.username,
          full_name: profileData.full_name,
          email: profileData.email,
          role: profileData.role || 'admin',
        };

        setUser(userData);
        console.log('✅ User restored:', userData.email);

      } catch (error) {
        console.error('❌ Auth init error:', error);
        if (isMounted) {
          await supabase.auth.signOut();
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setInitialized(true);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [initialized]);

  // Auth state listener
  useEffect(() => {
    if (!initialized) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event);

      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const { data: profileData, error } = await supabase
            .from('admins')
            .select('id, username, full_name, email, role, is_active')
            .eq('email', session.user.email)
            .eq('is_active', true)
            .single();

          if (!error && profileData) {
            setUser({
              id: profileData.id,
              username: profileData.username,
              full_name: profileData.full_name,
              email: profileData.email,
              role: profileData.role || 'admin',
            });
          }
        } catch (error) {
          console.error('❌ Profile fetch error:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [initialized]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔄 Login attempt...');

      await supabase.auth.signOut();
      await new Promise(resolve => setTimeout(resolve, 500));

      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !password) {
        return { success: false, error: 'Email dan password harus diisi' };
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      if (authError) {
        console.error('❌ Auth error:', authError);
        return { success: false, error: 'Email atau password salah' };
      }

      if (!authData?.user) {
        return { success: false, error: 'Login gagal' };
      }

      const { data: adminProfile, error: profileError } = await supabase
        .from('admins')
        .select('id, username, full_name, email, role, is_active')
        .eq('email', cleanEmail)
        .eq('is_active', true)
        .single();

      if (profileError || !adminProfile) {
        await supabase.auth.signOut();
        return { success: false, error: 'Admin tidak ditemukan atau tidak aktif' };
      }

      const userData = {
        id: adminProfile.id,
        username: adminProfile.username,
        full_name: adminProfile.full_name,
        email: adminProfile.email,
        role: adminProfile.role || 'admin',
      };

      setUser(userData);
      console.log('✅ Login successful:', userData.email);
      return { success: true };

    } catch (error: any) {
      console.error('❌ Login error:', error);
      return { success: false, error: 'Terjadi kesalahan sistem' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      setUser(null);
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      isAdmin,
      isSuperAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}`;

console.log('1️⃣ Memperbaiki AuthContext...');
fs.writeFileSync(
  path.join(__dirname, 'frontend/src/contexts/AuthContext.tsx'),
  authContextFixed
);
console.log('✅ AuthContext diperbaiki');