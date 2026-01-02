// Test export endpoints directly
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5001/api';

async function testExportEndpoints() {
    console.log('🧪 Testing Export Endpoints...\n');

    // Test PDF export
    console.log('📄 Testing PDF Export...');
    try {
        const pdfResponse = await fetch(`${API_BASE}/reports/export/pdf?dateRange=month`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer test-token',
                'Content-Type': 'application/json'
            }
        });

        console.log(`PDF Response Status: ${pdfResponse.status}`);
        console.log(`PDF Response Headers:`, Object.fromEntries(pdfResponse.headers.entries()));
        
        if (pdfResponse.ok) {
            console.log('✅ PDF export endpoint working!');
        } else {
            const errorText = await pdfResponse.text();
            console.log('❌ PDF export failed:', errorText);
        }
    } catch (error) {
        console.log('❌ PDF export error:', error.message);
    }

    console.log('\n📊 Testing Excel Export...');
    try {
        const excelResponse = await fetch(`${API_BASE}/reports/export/excel?dateRange=month`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer test-token',
                'Content-Type': 'application/json'
            }
        });

        console.log(`Excel Response Status: ${excelResponse.status}`);
        console.log(`Excel Response Headers:`, Object.fromEntries(excelResponse.headers.entries()));
        
        if (excelResponse.ok) {
            console.log('✅ Excel export endpoint working!');
        } else {
            const errorText = await excelResponse.text();
            console.log('❌ Excel export failed:', errorText);
        }
    } catch (error) {
        console.log('❌ Excel export error:', error.message);
    }

    // Test basic reports endpoint
    console.log('\n📈 Testing Basic Reports Endpoint...');
    try {
        const reportsResponse = await fetch(`${API_BASE}/reports?dateRange=month`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer test-token',
                'Content-Type': 'application/json'
            }
        });

        console.log(`Reports Response Status: ${reportsResponse.status}`);
        
        if (reportsResponse.ok) {
            const data = await reportsResponse.json();
            console.log('✅ Basic reports endpoint working!');
            console.log(`Total reports: ${data.totalReports || 0}`);
        } else {
            const errorText = await reportsResponse.text();
            console.log('❌ Reports endpoint failed:', errorText);
        }
    } catch (error) {
        console.log('❌ Reports endpoint error:', error.message);
    }
}

// Run tests
testExportEndpoints().catch(console.error);