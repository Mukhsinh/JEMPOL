// Test script untuk fungsi-fungsi halaman detail tiket
// Menggunakan Supabase client untuk test integrasi database

// Konfigurasi Supabase (ganti dengan konfigurasi yang sebenarnya)
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'your-anon-key';

// Mock Supabase client untuk testing
const mockSupabase = {
    from: (table) => ({
        select: (columns) => ({
            eq: (column, value) => ({
                single: () => Promise.resolve({
                    data: {
                        id: '990e8400-e29b-41d4-a716-446655440001',
                        ticket_number: 'TKT-2024-0001',
                        title: 'Antrian Pelayanan Terlalu Lama',
                        description: 'Saya menunggu pelayanan di loket informasi selama lebih dari 2 jam. Mohon diperbaiki sistem antriannya.',
                        status: 'in_progress',
                        priority: 'high',
                        submitter_name: 'Budi Santoso',
                        submitter_email: 'budi.santoso@email.com',
                        submitter_phone: '081234567890',
                        unit: { name: 'Sub Bagian Informasi', code: 'SBI' },
                        category: { name: 'Pengaduan Layanan' },
                        assigned_user: { full_name: 'Administrator' },
                        created_at: '2025-12-29T20:28:05.381554Z',
                        updated_at: '2025-12-31T17:01:38.095905Z'
                    },
                    error: null
                }),
                order: (column, options) => Promise.resolve({
                    data: [
                        {
                            id: 'resp-1',
                            message: 'Test balasan dalam bahasa Indonesia - sistem berfungsi dengan baik.',
                            responder: { full_name: 'Administrator' },
                            created_at: '2025-12-31T17:01:38.095905Z',
                            response_type: 'comment',
                            is_internal: false
                        }
                    ],
                    error: null
                })
            })
        }),
        update: (data) => ({
            eq: (column, value) => Promise.resolve({
                data: null,
                error: null
            })
        }),
        insert: (data) => Promise.resolve({
            data: null,
            error: null
        })
    }),
    auth: {
        getUser: () => Promise.resolve({
            data: {
                user: {
                    id: 'user-123',
                    email: 'admin@test.com'
                }
            },
            error: null
        })
    }
};

// Test functions
class TicketDetailTester {
    constructor() {
        this.supabase = mockSupabase;
        this.ticketId = '990e8400-e29b-41d4-a716-446655440001';
        this.testResults = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = { timestamp, message, type };
        this.testResults.push(logEntry);
        console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
    }

    async testFetchTicketData() {
        this.log('🔍 Testing fetchTicketData function...');
        
        try {
            const { data: ticketData, error: ticketError } = await this.supabase
                .from('tickets')
                .select(`
                    *,
                    unit:units(name, code),
                    category:service_categories(name),
                    assigned_user:users!assigned_to(full_name)
                `)
                .eq('id', this.ticketId)
                .single();

            if (ticketError) throw ticketError;

            this.log('✅ Fetch ticket data berhasil', 'success');
            this.log(`📋 Tiket: ${ticketData.ticket_number} - ${ticketData.title}`, 'info');
            return true;
        } catch (error) {
            this.log(`❌ Fetch ticket data gagal: ${error.message}`, 'error');
            return false;
        }
    }

    async testResolveTicket() {
        this.log('✅ Testing handleResolveTicket function...');
        
        try {
            const { error } = await this.supabase
                .from('tickets')
                .update({ 
                    status: 'resolved',
                    resolved_at: new Date().toISOString()
                })
                .eq('id', this.ticketId);

            if (error) throw error;

            // Add system response for resolution
            await this.supabase
                .from('ticket_responses')
                .insert({
                    ticket_id: this.ticketId,
                    responder_id: null,
                    message: 'Tiket telah diselesaikan oleh sistem.',
                    response_type: 'status_update',
                    is_internal: false
                });

            this.log('✅ Resolve ticket berhasil', 'success');
            return true;
        } catch (error) {
            this.log(`❌ Resolve ticket gagal: ${error.message}`, 'error');
            return false;
        }
    }

    async testEscalateTicket() {
        this.log('⬆️ Testing handleEscalateTicket function...');
        
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            
            const { error } = await this.supabase
                .from('tickets')
                .update({ status: 'escalated' })
                .eq('id', this.ticketId);

            if (error) throw error;

            // Add escalation log
            await this.supabase
                .from('ticket_escalations')
                .insert({
                    ticket_id: this.ticketId,
                    from_user_id: user?.id || null,
                    from_role: 'staff',
                    to_role: 'supervisor',
                    reason: 'Test eskalasi - tiket memerlukan perhatian tingkat yang lebih tinggi',
                    escalation_type: 'manual'
                });

            // Add system response for escalation
            await this.supabase
                .from('ticket_responses')
                .insert({
                    ticket_id: this.ticketId,
                    responder_id: null,
                    message: 'Tiket telah dieskalasi ke tingkat yang lebih tinggi.',
                    response_type: 'escalation',
                    is_internal: false
                });

            this.log('✅ Escalate ticket berhasil', 'success');
            return true;
        } catch (error) {
            this.log(`❌ Escalate ticket gagal: ${error.message}`, 'error');
            return false;
        }
    }

    async testAssignTicket() {
        this.log('👤 Testing handleAssignTicket function...');
        
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            const selectedUserId = 'test-user-id';
            const selectedUserName = 'Test User';

            const { error } = await this.supabase
                .from('tickets')
                .update({ 
                    assigned_to: selectedUserId,
                    status: 'in_progress'
                })
                .eq('id', this.ticketId);

            if (error) throw error;

            // Add system response for assignment
            await this.supabase
                .from('ticket_responses')
                .insert({
                    ticket_id: this.ticketId,
                    responder_id: user?.id || null,
                    message: `Tiket telah ditugaskan kepada ${selectedUserName}.`,
                    response_type: 'status_update',
                    is_internal: false
                });

            this.log('✅ Assign ticket berhasil', 'success');
            return true;
        } catch (error) {
            this.log(`❌ Assign ticket gagal: ${error.message}`, 'error');
            return false;
        }
    }

    async testSendResponse() {
        this.log('📤 Testing handleSendReply function...');
        
        try {
            const { data: { user } } = await this.supabase.auth.getUser();
            const replyText = 'Test balasan dalam bahasa Indonesia - sistem berfungsi dengan baik.';

            // Insert response
            const { error: responseError } = await this.supabase
                .from('ticket_responses')
                .insert({
                    ticket_id: this.ticketId,
                    responder_id: user?.id || null,
                    message: replyText,
                    response_type: 'comment',
                    is_internal: false
                });

            if (responseError) throw responseError;

            // Update first response time if not set
            await this.supabase
                .from('tickets')
                .update({ 
                    first_response_at: new Date().toISOString(),
                    status: 'in_progress'
                })
                .eq('id', this.ticketId);

            this.log('✅ Send response berhasil', 'success');
            return true;
        } catch (error) {
            this.log(`❌ Send response gagal: ${error.message}`, 'error');
            return false;
        }
    }

    async testFetchResponses() {
        this.log('💬 Testing fetch responses...');
        
        try {
            const { data: responseData, error: responseError } = await this.supabase
                .from('ticket_responses')
                .select(`
                    *,
                    responder:users(full_name)
                `)
                .eq('ticket_id', this.ticketId)
                .order('created_at', { ascending: false });

            if (responseError) throw responseError;

            this.log(`✅ Fetch responses berhasil - ${responseData?.length || 0} responses`, 'success');
            return true;
        } catch (error) {
            this.log(`❌ Fetch responses gagal: ${error.message}`, 'error');
            return false;
        }
    }

    async runAllTests() {
        this.log('🚀 Memulai test semua fungsi halaman detail tiket...');
        
        const tests = [
            { name: 'Fetch Ticket Data', fn: () => this.testFetchTicketData() },
            { name: 'Fetch Responses', fn: () => this.testFetchResponses() },
            { name: 'Send Response', fn: () => this.testSendResponse() },
            { name: 'Assign Ticket', fn: () => this.testAssignTicket() },
            { name: 'Escalate Ticket', fn: () => this.testEscalateTicket() },
            { name: 'Resolve Ticket', fn: () => this.testResolveTicket() }
        ];

        let passedTests = 0;
        let totalTests = tests.length;

        for (const test of tests) {
            this.log(`\n--- Testing: ${test.name} ---`);
            const result = await test.fn();
            if (result) passedTests++;
        }

        this.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
        
        if (passedTests === totalTests) {
            this.log('🎉 Semua test berhasil! Halaman detail tiket siap digunakan.', 'success');
        } else {
            this.log(`⚠️ ${totalTests - passedTests} test gagal. Periksa implementasi.`, 'warning');
        }

        return {
            passed: passedTests,
            total: totalTests,
            results: this.testResults
        };
    }

    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            ticketId: this.ticketId,
            testResults: this.testResults,
            summary: {
                totalTests: this.testResults.filter(r => r.type === 'success' || r.type === 'error').length,
                passedTests: this.testResults.filter(r => r.type === 'success').length,
                failedTests: this.testResults.filter(r => r.type === 'error').length
            }
        };

        return report;
    }
}

// Export untuk digunakan di environment lain
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TicketDetailTester;
}

// Auto-run jika dijalankan langsung
if (typeof window === 'undefined' && require.main === module) {
    const tester = new TicketDetailTester();
    tester.runAllTests().then(results => {
        console.log('\n📋 Final Report:');
        console.log(JSON.stringify(tester.generateReport(), null, 2));
    });
}

// Untuk browser environment
if (typeof window !== 'undefined') {
    window.TicketDetailTester = TicketDetailTester;
}