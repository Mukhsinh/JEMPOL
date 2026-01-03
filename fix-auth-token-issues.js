// Script untuk memperbaiki masalah token dan multiple instances
console.log('🔧 Fixing auth token and multiple instances issues...');

// Clear all auth-related localStorage items
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('supabase') || key.includes('auth'))) {
    keysToRemove.push(key);
  }
}

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log('🗑️ Removed:', key);
});

// Clear sessionStorage
sessionStorage.clear();
console.log('🗑️ Cleared sessionStorage');

// Clear any existing cookies
document.cookie.split(";").forEach(function(c) { 
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
});
console.log('🗑️ Cleared cookies');

console.log('✅ Auth cleanup completed. Please refresh the page and try logging in again.');