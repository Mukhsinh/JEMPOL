import { Request, Response } from 'express';
import supabase from '../config/supabase.js';

export const submitPublicSurvey = async (req: Request, res: Response) => {
    try {
        const {
            overall_score,
            response_time_score,
            solution_quality_score,
            staff_courtesy_score,
            comments,
            unit_id,
            service_category,
            visitor_name,
            visitor_email,
            visitor_phone,
            qr_code,
            source = 'public_survey'
        } = req.body;

        // Validasi minimal satu rating diisi
        if (!overall_score && !response_time_score && !solution_quality_score && !staff_courtesy_score) {
            return res.status(400).json({
                success: false,
                error: 'Minimal satu penilaian harus diisi'
            });
        }

        // Validasi range rating (1-5)
        const ratings = [overall_score, response_time_score, solution_quality_score, staff_courtesy_score];
        for (const rating of ratings) {
            if (rating && (rating < 1 || rating > 5)) {
                return res.status(400).json({
                    success: false,
                    error: 'Rating harus antara 1-5'
                });
            }
        }

        // Buat entry survei publik
        const surveyData = {
            overall_score: overall_score || null,
            response_time_score: response_time_score || null,
            solution_quality_score: solution_quality_score || null,
            staff_courtesy_score: staff_courtesy_score || null,
            comments: comments || null,
            unit_id: unit_id || null,
            service_category_id: service_category || null,
            visitor_name: visitor_name || null,
            visitor_email: visitor_email || null,
            visitor_phone: visitor_phone || null,
            qr_code: qr_code || null,
            source: source,
            ip_address: req.ip,
            user_agent: req.get('User-Agent'),
            submitted_at: new Date().toISOString()
        };

        // Insert ke tabel public_surveys (kita akan buat tabel baru untuk survei publik)
        const { data: survey, error: surveyError } = await supabase
            .from('public_surveys')
            .insert([surveyData])
            .select()
            .single();

        if (surveyError) {
            console.error('Error inserting public survey:', surveyError);
            
            // Jika tabel belum ada, kita akan insert ke satisfaction_surveys dengan ticket_id null
            const fallbackData = {
                overall_score: overall_score || null,
                response_time_score: response_time_score || null,
                solution_quality_score: solution_quality_score || null,
                staff_courtesy_score: staff_courtesy_score || null,
                comments: comments || null,
                submitted_at: new Date().toISOString()
            };

            const { data: fallbackSurvey, error: fallbackError } = await supabase
                .from('satisfaction_surveys')
                .insert([fallbackData])
                .select()
                .single();

            if (fallbackError) {
                console.error('Error inserting fallback survey:', fallbackError);
                return res.status(500).json({
                    success: false,
                    error: 'Gagal menyimpan survei'
                });
            }

            return res.status(201).json({
                success: true,
                message: 'Survei berhasil dikirim',
                data: fallbackSurvey
            });
        }

        // Update QR code usage jika ada
        if (qr_code) {
            // Get current usage count first
            const { data: currentQR } = await supabase
                .from('qr_codes')
                .select('usage_count')
                .eq('code', qr_code)
                .single();

            await supabase
                .from('qr_codes')
                .update({ 
                    usage_count: (currentQR?.usage_count || 0) + 1,
                    updated_at: new Date().toISOString()
                })
                .eq('code', qr_code);
        }

        res.status(201).json({
            success: true,
            message: 'Survei berhasil dikirim',
            data: survey
        });

    } catch (error) {
        console.error('Error submitting public survey:', error);
        res.status(500).json({
            success: false,
            error: 'Terjadi kesalahan server'
        });
    }
};

export const getPublicUnits = async (req: Request, res: Response) => {
    try {
        const { data: units, error } = await supabase
            .from('units')
            .select('id, name, code, description')
            .eq('is_active', true)
            .order('name');

        if (error) {
            console.error('Error fetching units:', error);
            return res.status(500).json({
                success: false,
                error: 'Gagal mengambil data unit'
            });
        }

        res.json({
            success: true,
            data: units || []
        });

    } catch (error) {
        console.error('Error fetching public units:', error);
        res.status(500).json({
            success: false,
            error: 'Terjadi kesalahan server'
        });
    }
};

export const getPublicServiceCategories = async (req: Request, res: Response) => {
    try {
        const { data: categories, error } = await supabase
            .from('service_categories')
            .select('id, name, code, description')
            .eq('is_active', true)
            .order('name');

        if (error) {
            console.error('Error fetching service categories:', error);
            return res.status(500).json({
                success: false,
                error: 'Gagal mengambil data kategori layanan'
            });
        }

        res.json({
            success: true,
            data: categories || []
        });

    } catch (error) {
        console.error('Error fetching public service categories:', error);
        res.status(500).json({
            success: false,
            error: 'Terjadi kesalahan server'
        });
    }
};

export const getSurveyStats = async (req: Request, res: Response) => {
    try {
        // Get survey statistics
        const { data: surveys, error } = await supabase
            .from('satisfaction_surveys')
            .select('overall_score, response_time_score, solution_quality_score, staff_courtesy_score, submitted_at')
            .not('overall_score', 'is', null);

        if (error) {
            console.error('Error fetching survey stats:', error);
            return res.status(500).json({
                success: false,
                error: 'Gagal mengambil statistik survei'
            });
        }

        // Calculate statistics
        const totalSurveys = surveys?.length || 0;
        
        if (totalSurveys === 0) {
            return res.json({
                success: true,
                data: {
                    total_surveys: 0,
                    average_overall: 0,
                    average_response_time: 0,
                    average_solution_quality: 0,
                    average_staff_courtesy: 0,
                    satisfaction_rate: 0
                }
            });
        }

        const averageOverall = surveys.reduce((sum, s) => sum + (s.overall_score || 0), 0) / totalSurveys;
        const averageResponseTime = surveys.reduce((sum, s) => sum + (s.response_time_score || 0), 0) / totalSurveys;
        const averageSolutionQuality = surveys.reduce((sum, s) => sum + (s.solution_quality_score || 0), 0) / totalSurveys;
        const averageStaffCourtesy = surveys.reduce((sum, s) => sum + (s.staff_courtesy_score || 0), 0) / totalSurveys;
        
        // Calculate satisfaction rate (scores 4-5 are considered satisfied)
        const satisfiedCount = surveys.filter(s => (s.overall_score || 0) >= 4).length;
        const satisfactionRate = (satisfiedCount / totalSurveys) * 100;

        res.json({
            success: true,
            data: {
                total_surveys: totalSurveys,
                average_overall: Math.round(averageOverall * 10) / 10,
                average_response_time: Math.round(averageResponseTime * 10) / 10,
                average_solution_quality: Math.round(averageSolutionQuality * 10) / 10,
                average_staff_courtesy: Math.round(averageStaffCourtesy * 10) / 10,
                satisfaction_rate: Math.round(satisfactionRate * 10) / 10
            }
        });

    } catch (error) {
        console.error('Error fetching survey stats:', error);
        res.status(500).json({
            success: false,
            error: 'Terjadi kesalahan server'
        });
    }
};