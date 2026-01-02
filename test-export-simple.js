// Simple test for export endpoints
const http = require('http');
const https = require('https');
const { URL } = require('url');

const API_BASE = 'http://localhost:5001/api';

// Mock token - replace with actual token if needed
const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTczNTU1NzEyMCwiZXhwIjoxNzM1NjQzNTIwfQ.example';

function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;
        
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'Authorization': `Bearer ${mockToken}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const req = client.request(requestOptions, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    statusText: res.statusMessage,
                    headers: res.headers,
                    data: data,
                    ok: res.statusCode >= 200 && res.statusCode < 300
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

async function testExportEndpoints() {
    console.log('🧪 Testing Export Endpoints...\n');

    // Test PDF Export
    console.log('📄 Testing PDF Export...');
    try {
        const pdfResponse = await makeRequest(`${API_BASE}/reports/export/pdf?dateRange=month`);

        console.log(`PDF Response Status: ${pdfResponse.status} ${pdfResponse.statusText}`);
        
        if (pdfResponse.ok) {
            const contentType = pdfResponse.headers['content-type'];
            console.log(`✅ PDF Export Success! Content-Type: ${contentType}`);
        } else {
            console.log(`❌ PDF Export Failed: ${pdfResponse.data}`);
        }
    } catch (error) {
        console.log(`❌ PDF Export Error: ${error.message}`);
    }

    console.log('');

    // Test Excel Export
    console.log('📊 Testing Excel Export...');
    try {
        const excelResponse = await makeRequest(`${API_BASE}/reports/export/excel?dateRange=month`);

        console.log(`Excel Response Status: ${excelResponse.status} ${excelResponse.statusText}`);
        
        if (excelResponse.ok) {
            const contentType = excelResponse.headers['content-type'];
            console.log(`✅ Excel Export Success! Content-Type: ${contentType}`);
        } else {
            console.log(`❌ Excel Export Failed: ${excelResponse.data}`);
        }
    } catch (error) {
        console.log(`❌ Excel Export Error: ${error.message}`);
    }

    console.log('');

    // Test Report Data API
    console.log('📈 Testing Report Data API...');
    try {
        const reportResponse = await makeRequest(`${API_BASE}/reports?dateRange=month&page=1&limit=5`);

        console.log(`Report Data Response Status: ${reportResponse.status} ${reportResponse.statusText}`);
        
        if (reportResponse.ok) {
            const data = JSON.parse(reportResponse.data);
            console.log(`✅ Report Data Success! Total Reports: ${data.totalReports}`);
            console.log(`KPI: ${data.kpi.totalComplaints} total, ${data.kpi.resolvedComplaints} resolved`);
        } else {
            console.log(`❌ Report Data Failed: ${reportResponse.data}`);
        }
    } catch (error) {
        console.log(`❌ Report Data Error: ${error.message}`);
    }

    console.log('\n🏁 Test Complete!');
}

// Run the test
testExportEndpoints().catch(console.error);