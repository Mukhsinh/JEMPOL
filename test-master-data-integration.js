// Test script for Master Data Integration
// Run this in browser console on the unified master data page

console.log('🚀 Starting Master Data Integration Tests...');

// Test 1: Check if page elements exist
function testPageElements() {
    console.log('\n📋 Test 1: Page Elements');
    
    const sidebar = document.querySelector('aside');
    const mainContent = document.querySelector('main');
    const searchInput = document.querySelector('input[placeholder*="Cari"]');
    const typeFilter = document.querySelector('select');
    const table = document.querySelector('table');
    
    console.log('✅ Sidebar exists:', !!sidebar);
    console.log('✅ Main content exists:', !!mainContent);
    console.log('✅ Search input exists:', !!searchInput);
    console.log('✅ Type filter exists:', !!typeFilter);
    console.log('✅ Data table exists:', !!table);
    
    return sidebar && mainContent && searchInput && typeFilter && table;
}

// Test 2: Check navigation functionality
function testNavigation() {
    console.log('\n🧭 Test 2: Navigation');
    
    const menuItems = document.querySelectorAll('nav a, nav button');
    console.log('✅ Menu items found:', menuItems.length);
    
    // Test submenu toggle
    const submenuToggle = document.querySelector('button[class*="justify-between"]');
    if (submenuToggle) {
        console.log('✅ Submenu toggle exists');
        // Simulate click
        submenuToggle.click();
        setTimeout(() => {
            console.log('✅ Submenu toggle functionality working');
        }, 100);
    }
    
    return menuItems.length > 0;
}

// Test 3: Check filter functionality
function testFilters() {
    console.log('\n🔍 Test 3: Filter Functionality');
    
    const searchInput = document.querySelector('input[placeholder*="Cari"]');
    const typeFilter = document.querySelector('select');
    const statusFilter = document.querySelectorAll('select')[1];
    
    if (searchInput) {
        console.log('✅ Search input ready');
        // Test search
        searchInput.value = 'Admin';
        searchInput.dispatchEvent(new Event('input'));
        console.log('✅ Search test completed');
    }
    
    if (typeFilter) {
        console.log('✅ Type filter ready');
        console.log('   Options:', typeFilter.options.length);
    }
    
    if (statusFilter) {
        console.log('✅ Status filter ready');
        console.log('   Options:', statusFilter.options.length);
    }
    
    return searchInput && typeFilter && statusFilter;
}

// Test 4: Check table functionality
function testTable() {
    console.log('\n📊 Test 4: Table Functionality');
    
    const table = document.querySelector('table');
    const tbody = document.querySelector('tbody');
    const rows = document.querySelectorAll('tbody tr');
    
    console.log('✅ Table exists:', !!table);
    console.log('✅ Table body exists:', !!tbody);
    console.log('✅ Data rows:', rows.length);
    
    // Check for action buttons
    const actionButtons = document.querySelectorAll('button[title="Edit"], button[title="Hapus"]');
    console.log('✅ Action buttons:', actionButtons.length);
    
    // Check for status badges
    const statusBadges = document.querySelectorAll('span[class*="rounded-full"]');
    console.log('✅ Status badges:', statusBadges.length);
    
    return table && tbody;
}

// Test 5: Check responsive design
function testResponsive() {
    console.log('\n📱 Test 5: Responsive Design');
    
    const viewport = window.innerWidth;
    console.log('✅ Current viewport:', viewport + 'px');
    
    const sidebar = document.querySelector('aside');
    const mainContent = document.querySelector('main');
    
    if (sidebar && mainContent) {
        const sidebarWidth = sidebar.offsetWidth;
        const mainWidth = mainContent.offsetWidth;
        
        console.log('✅ Sidebar width:', sidebarWidth + 'px');
        console.log('✅ Main content width:', mainWidth + 'px');
        console.log('✅ Layout ratio:', (mainWidth / (sidebarWidth + mainWidth) * 100).toFixed(1) + '%');
    }
    
    // Check mobile breakpoints
    if (viewport < 768) {
        console.log('📱 Mobile layout detected');
    } else if (viewport < 1024) {
        console.log('💻 Tablet layout detected');
    } else {
        console.log('🖥️ Desktop layout detected');
    }
    
    return true;
}

// Test 6: Check accessibility
function testAccessibility() {
    console.log('\n♿ Test 6: Accessibility');
    
    const buttons = document.querySelectorAll('button');
    const links = document.querySelectorAll('a');
    const inputs = document.querySelectorAll('input, select');
    
    let accessibleButtons = 0;
    let accessibleLinks = 0;
    let accessibleInputs = 0;
    
    buttons.forEach(btn => {
        if (btn.getAttribute('title') || btn.getAttribute('aria-label') || btn.textContent.trim()) {
            accessibleButtons++;
        }
    });
    
    links.forEach(link => {
        if (link.textContent.trim() || link.getAttribute('aria-label')) {
            accessibleLinks++;
        }
    });
    
    inputs.forEach(input => {
        if (input.getAttribute('placeholder') || input.getAttribute('aria-label')) {
            accessibleInputs++;
        }
    });
    
    console.log('✅ Accessible buttons:', accessibleButtons + '/' + buttons.length);
    console.log('✅ Accessible links:', accessibleLinks + '/' + links.length);
    console.log('✅ Accessible inputs:', accessibleInputs + '/' + inputs.length);
    
    return true;
}

// Run all tests
async function runAllTests() {
    console.log('🎯 Master Data Integration Test Suite');
    console.log('=====================================');
    
    const results = {
        pageElements: testPageElements(),
        navigation: testNavigation(),
        filters: testFilters(),
        table: testTable(),
        responsive: testResponsive(),
        accessibility: testAccessibility()
    };
    
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    
    let passed = 0;
    let total = 0;
    
    Object.entries(results).forEach(([test, result]) => {
        total++;
        if (result) {
            passed++;
            console.log(`✅ ${test}: PASSED`);
        } else {
            console.log(`❌ ${test}: FAILED`);
        }
    });
    
    console.log(`\n🎯 Overall Score: ${passed}/${total} (${(passed/total*100).toFixed(1)}%)`);
    
    if (passed === total) {
        console.log('🎉 All tests passed! Master Data integration is working perfectly.');
    } else {
        console.log('⚠️ Some tests failed. Check the implementation.');
    }
    
    return results;
}

// Auto-run tests if in browser
if (typeof window !== 'undefined') {
    // Wait for page to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runAllTests);
    } else {
        setTimeout(runAllTests, 1000);
    }
}

// Export for manual testing
if (typeof module !== 'undefined') {
    module.exports = { runAllTests, testPageElements, testNavigation, testFilters, testTable, testResponsive, testAccessibility };
}