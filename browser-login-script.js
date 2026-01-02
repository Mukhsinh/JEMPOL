// Run this in the browser console to log in
// Make sure you're on the application page (localhost:5173)

async function quickLogin() {
    try {
        // Import the authService from the application
        const { authService } = await import('./src/services/authService.js');
        
        console.log('Attempting login...');
        const result = await authService.login('admin@jempol.com', 'password');
        
        if (result.success) {
            console.log('✅ Login successful!', result);
            console.log('Reloading page...');
            window.location.reload();
        } else {
            console.error('❌ Login failed:', result.error);
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        
        // Fallback: try direct Supabase login
        console.log('Trying direct Supabase login...');
        
        // Create Supabase client
        const { createClient } = supabase;
        const supabaseClient = createClient(
            'https://jxxzbdivafzzwqhagwrf.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg'
        );
        
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: 'admin@jempol.com',
            password: 'password'
        });
        
        if (error) {
            console.error('❌ Direct login failed:', error);
        } else {
            console.log('✅ Direct login successful!');
            
            // Store admin data
            const adminData = {
                id: 'admin-id',
                username: 'admin',
                full_name: 'Administrator',
                email: data.user.email,
                role: 'superadmin'
            };
            localStorage.setItem('adminUser', JSON.stringify(adminData));
            
            console.log('Reloading page...');
            window.location.reload();
        }
    }
}

// Run the login
quickLogin();