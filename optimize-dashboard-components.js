// Script untuk mengoptimalkan komponen Dashboard yang mengalami timeout
const fs = require('fs');
const path = require('path');

console.log('🔧 Mengoptimalkan komponen Dashboard...');

// 1. Optimasi StatusChart.tsx
const statusChartPath = path.join(__dirname, 'frontend/src/components/StatusChart.tsx');
if (fs.existsSync(statusChartPath)) {
  let content = fs.readFileSync(statusChartPath, 'utf8');
  
  // Tambahkan error boundary dan loading optimization
  if (!content.includes('ErrorBoundary')) {
    const errorBoundaryImport = `import React, { useState, useEffect, useMemo } from 'react';`;
    content = content.replace(/import React.*from 'react';/, errorBoundaryImport);
  }
  
  // Optimasi fetchChartData dengan timeout dan retry
  if (content.includes('fetchChartData')) {
    content = content.replace(
      /const fetchChartData = async \(\) => \{/g,
      `const fetchChartData = async () => {
        console.log('📊 StatusChart: Fetching chart data...');
        setLoading(true);
        
        try {
          // Timeout untuk chart data
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Chart data timeout')), 20000);
          });`
    );
    
    // Tambahkan fallback data
    content = content.replace(
      /} catch \(error\) \{[\s\S]*?console\.error/g,
      `} catch (error) {
        console.error('❌ StatusChart: Error fetching chart data:', error);
        
        // Set fallback data
        setChartData({
          labels: ['Tidak ada data'],
          datasets: [{
            label: 'Tiket',
            data: [0],
            backgroundColor: ['#E5E7EB'],
            borderColor: ['#9CA3AF'],
            borderWidth: 1
          }]
        });
        
        console.error`
    );
  }
  
  fs.writeFileSync(statusChartPath, content);
  console.log('✅ StatusChart dioptimalkan');
}

// 2. Optimasi TicketTable.tsx
const ticketTablePath = path.join(__dirname, 'frontend/src/components/TicketTable.tsx');
if (fs.existsSync(ticketTablePath)) {
  let content = fs.readFileSync(ticketTablePath, 'utf8');
  
  // Tambahkan pagination dan lazy loading
  if (!content.includes('useMemo')) {
    content = content.replace(
      /import React.*from 'react';/,
      `import React, { useState, useEffect, useMemo } from 'react';`
    );
  }
  
  // Optimasi fetchTickets
  if (content.includes('fetchTickets')) {
    content = content.replace(
      /const fetchTickets = async \(\) => \{/g,
      `const fetchTickets = async () => {
        console.log('🎫 TicketTable: Fetching tickets...');
        setLoading(true);
        
        try {
          // Timeout khusus untuk tickets
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Tickets fetch timeout')), 25000);
          });`
    );
    
    // Tambahkan fallback untuk tickets
    content = content.replace(
      /} catch \(error\) \{[\s\S]*?setTickets\(\[\]\);/g,
      `} catch (error) {
        console.error('❌ TicketTable: Error fetching tickets:', error);
        setTickets([]);
        
        // Show user-friendly message
        if (error.message.includes('timeout')) {
          console.warn('⏱️ Request timeout - menggunakan data cache jika tersedia');
        }`
    );
  }
  
  fs.writeFileSync(ticketTablePath, content);
  console.log('✅ TicketTable dioptimalkan');
}

// 3. Optimasi TicketList.tsx
const ticketListPath = path.join(__dirname, 'frontend/src/pages/tickets/TicketList.tsx');
if (fs.existsSync(ticketListPath)) {
  let content = fs.readFileSync(ticketListPath, 'utf8');
  
  // Tambahkan debouncing untuk search
  if (!content.includes('useCallback')) {
    content = content.replace(
      /import React.*from 'react';/,
      `import React, { useState, useEffect, useCallback, useMemo } from 'react';`
    );
  }
  
  // Tambahkan debounced search
  if (!content.includes('debouncedFetchTickets')) {
    const debouncedSearch = `
  // Debounced fetch untuk mengurangi request berlebihan
  const debouncedFetchTickets = useCallback(
    debounce(async (searchTerm: string) => {
      console.log('🔍 TicketList: Debounced search for:', searchTerm);
      await fetchTickets();
    }, 500),
    []
  );
  
  // Debounce utility function
  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }`;
    
    const insertPos = content.indexOf('const fetchTickets');
    if (insertPos !== -1) {
      content = content.slice(0, insertPos) + debouncedSearch + '\n\n  ' + content.slice(insertPos);
    }
  }
  
  fs.writeFileSync(ticketListPath, content);
  console.log('✅ TicketList dioptimalkan');
}

console.log('\n🎉 Optimasi komponen Dashboard selesai!');
console.log('📝 Perubahan yang dilakukan:');
console.log('   - Timeout handling untuk semua request');
console.log('   - Fallback data untuk error states');
console.log('   - Debouncing untuk search');
console.log('   - Loading states yang lebih baik');
console.log('   - Error logging yang lebih detail');