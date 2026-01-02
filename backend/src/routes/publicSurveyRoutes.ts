import { Router } from 'express';
import supabase from '../config/supabase.js';

const router = Router();

// Get units for survey form
router.get('/units', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('units')
            .select('id, name, code')
            .eq('is_active', true)
            .order('name');

        if (error) throw error;

        res.json({
            success: true,
            data: data || []
        });
    } catch (error: any) {
        console.error('Error fetching units:', error);
        res.status(500).json({
            success: false,
            error: 'Gagal memuat data unit'
        });
    }
});

// Get service categories for survey form
router.get('/service-categories', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('service_categories')
            .select('id, name, code')
            .eq('is_active', true)
            .order('name');

        if (error) throw error;

        res.json({
            success: true,
            data: data || []
        });
    } catch (error: any) {
        console.error('Error fetching service categories:', error);
        res.status(500).json({
            success: false,
            error: 'Gagal memuat data kategori layanan'
        });
    }
});

// Submit standalone survey
router.post('/surveys', async (req, res) => {
    try {
        const {
            unit_id,
            service_category_id,
            service_description,
            reporter_name,
            reporter_email,
            reporter_phone,
            is_anonymous,
            overall_score,
            response_time_score,
            solution_quality_score,
            staff_courtesy_score,
            comments,
            qr_token
        } = req.body;

        // Validation
        if (!unit_id || !service_category_id || !service_description?.trim()) {
            return res.status(400).json({
                success: false,
                error: 'Unit, kategori layanan, dan deskripsi layanan wajib diisi'
            });
        }

        // At least one rating must be provided
        const hasRating = overall_score || response_time_score || solution_quality_score || staff_courtesy_score;
        if (!hasRating) {
            return res.status(400).json({
                success: false,
                error: 'Minimal satu penilaian harus diisi'
            });
        }

        // Prepare survey data
        const surveyData = {
            unit_id,
            service_category_id,
            service_description: service_description.trim(),
            reporter_name: is_anonymous ? null : reporter_name?.trim() || null,
            reporter_email: is_anonymous ? null : reporter_email?.trim() || null,
            reporter_phone: is_anonymous ? null : reporter_phone?.trim() || null,
            is_anonymous: Boolean(is_anonymous),
            overall_score: overall_score ? parseInt(overall_score) : null,
            response_time_score: response_time_score ? parseInt(response_time_score) : null,
            solution_quality_score: solution_quality_score ? parseInt(solution_quality_score) : null,
            staff_courtesy_score: staff_courtesy_score ? parseInt(staff_courtesy_score) : null,
            comments: comments?.trim() || null,
            qr_token: qr_token?.trim() || null,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            source: qr_token ? 'qr_code' : 'web'
        };

        // Insert survey
        const { data, error } = await supabase
            .from('standalone_surveys')
            .insert([surveyData])
            .select()
            .single();

        if (error) throw error;

        // Update QR code usage if applicable
        if (qr_token) {
            try {
                // Get current usage count first
                const { data: qrData } = await supabase
                    .from('qr_codes')
                    .select('usage_count')
                    .eq('token', qr_token)
                    .single();

                if (qrData) {
                    await supabase
                        .from('qr_codes')
                        .update({ 
                            usage_count: (qrData.usage_count || 0) + 1,
                            updated_at: new Date().toISOString()
                        })
                        .eq('token', qr_token);
                }
            } catch (qrError) {
                console.error('Error updating QR code usage:', qrError);
                // Don't fail the survey submission if QR update fails
            }
        }

        res.json({
            success: true,
            message: 'Survei berhasil dikirim',
            data: {
                id: data.id,
                submitted_at: data.submitted_at
            }
        });

    } catch (error: any) {
        console.error('Error submitting survey:', error);
        res.status(500).json({
            success: false,
            error: 'Gagal mengirim survei'
        });
    }
});

// Get survey statistics (for admin)
router.get('/surveys/stats', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('standalone_surveys')
            .select(`
                id,
                overall_score,
                response_time_score,
                solution_quality_score,
                staff_courtesy_score,
                submitted_at,
                units!inner(name),
                service_categories!inner(name)
            `)
            .order('submitted_at', { ascending: false });

        if (error) throw error;

        // Calculate statistics
        const totalSurveys = data?.length || 0;
        const avgOverallScore = data?.reduce((sum: number, survey: any) => sum + (survey.overall_score || 0), 0) / totalSurveys || 0;
        const avgResponseTimeScore = data?.reduce((sum: number, survey: any) => sum + (survey.response_time_score || 0), 0) / totalSurveys || 0;
        const avgSolutionQualityScore = data?.reduce((sum: number, survey: any) => sum + (survey.solution_quality_score || 0), 0) / totalSurveys || 0;
        const avgStaffCourtesyScore = data?.reduce((sum: number, survey: any) => sum + (survey.staff_courtesy_score || 0), 0) / totalSurveys || 0;

        res.json({
            success: true,
            data: {
                totalSurveys,
                averageScores: {
                    overall: Math.round(avgOverallScore * 100) / 100,
                    responseTime: Math.round(avgResponseTimeScore * 100) / 100,
                    solutionQuality: Math.round(avgSolutionQualityScore * 100) / 100,
                    staffCourtesy: Math.round(avgStaffCourtesyScore * 100) / 100
                },
                surveys: data || []
            }
        });

    } catch (error: any) {
        console.error('Error fetching survey stats:', error);
        res.status(500).json({
            success: false,
            error: 'Gagal memuat statistik survei'
        });
    }
});

export default router;