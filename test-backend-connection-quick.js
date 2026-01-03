// Quick test untuk koneksi backend
const axios = require('axios');

const BASE_URL = 'http://localhost:3003/api';

async function testBackendConnection() {
    console.log('🔍 Testing backend connection...');
    
    try {
        // Test basic health check
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health check:', healthResponse.status);
    } catch (error) {
        console.log('❌ Health check failed:', error.message);
    }
    
    try {
        // Test public endpoints
        const publicResponse = await axios.get(`${BASE_URL}/master-data/public/unit-types`);
        console.log('✅ Public unit-types:', publicResponse.status, publicResponse.data?.length || 0, 'items');
    } catch (error) {
        console.log('❌ Public unit-types failed:', error.message);
    }
    
    try {
        // Test tickets endpoint
        const ticketsResponse = await axios.get(`${BASE_URL}/complaints/tickets`);
        console.log('✅ Tickets endpoint:', ticketsResponse.status);
    } catch (error) {
        console.log('❌ Tickets endpoint failed:', error.message);
    }
    
    try {
        // Test users endpoint
        const usersResponse = await axios.get(`${BASE_URL}/users`);
        console.log('✅ Users endpoint:', usersResponse.status);
    } catch (error) {
        console.log('❌ Users endpoint failed:', error.message);
    }
}

testBackendConnection().catch(console.error);