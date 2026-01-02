// Script untuk membuat user admin di Supabase Auth
// Jalankan di browser console pada halaman login

const createAdminUsers = async () => {
  const admins = [
    {
      email: 'mukhsin9@gmail.com',
      password: 'admin123',
      full_name: 'Mukhsin Superadmin'
    },
    {
      email: 'admin@jempol.com', 
      password: 'admin123',
      full_name: 'Administrator'
    }
  ];

  for (const admin of admins) {
    try {
      console.log(`Creating user for: ${admin.email}`);
      
      // Gunakan signup untuk membuat user
      const response = await fetch('https://jxxzbdivafzzwqhagwrf.supabase.co/auth/v1/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4eHpiZGl2YWZ6endxaGFnd3JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5MTkwNTEsImV4cCI6MjA4MDQ5NTA1MX0.ICOtGuxrD19GtawdR9JAsnFn9XsHxWkr1aHCEkgHqXg'
        },
        body: JSON.stringify({
          email: admin.email,
          password: admin.password,
          data: {
            full_name: admin.full_name
          }
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ User created successfully for: ${admin.email}`);
        console.log('User ID:', result.user?.id);
      } else {
        console.log(`❌ Error creating user for ${admin.email}:`, result);
      }
    } catch (error) {
      console.error(`Error creating user for ${admin.email}:`, error);
    }
  }
};

// Jalankan fungsi
createAdminUsers();