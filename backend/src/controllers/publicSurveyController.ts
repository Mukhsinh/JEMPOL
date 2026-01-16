import { Request, Response } from 'express';
import supabase from '../config/supabase.js';

export const submitPublicSurvey = async (req: Request, res: Response) => {
    try {
        const {
            // Data dari berbagai format form
            unit_id,
            unit_tujuan,
            unit_name,
            service_type,
            service_category_id,
            full_name,
            reporter_name,
            reporter_phone,
            reporter_email,
            is_anonymous,
            phone,
            email,
            age,
            age_range,
            gender,
            // Skor pertanyaan (format q1-q8 atau q1_score-q8_score)
            q1, q2, q3, q4, q5, q6, q7, q8,
            q1_score, q2_score, q3_score, q4_score, q5_score, q6_score, q7_score, q8_score,
            overall_satisfaction,
            comments,
            suggestions,
            qr_code,
            qr_token,
            source = 'public_survey'
        } = req.body;

        // Validasi minimal
        const phoneNumber = phone || reporter_phone;
        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                error: 'Nomor HP wajib diisi'
            });
        }

        // Hitung skor rata-rata
        const scores = [
            q1 || q1_score, q2 || q2_score, q3 || q3_score, q4 || q4_score,
            q5 || q5_score, q6 || q6_score, q7 || q7_score, q8 || q8_score
        ].filter(s => s !== null && s !== undefined && s !== '').map(s => parseInt(s));
        
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

        // Simpan ke tabel public_surveys dengan semua kolom
        const surveyData: any = {
            unit_id: unit_id || unit_tujuan || null,
            service_category_id: service_category_id || null,
            visitor_name: is_anonymous ? null : (full_name || reporter_name || null),
            visitor_email: is_anonymous ? null : (email || reporter_email || null),
            visitor_phone: phoneNumber,
            // Data responden tambahan
            service_type: service_type || null,
            age_range: age || age_range || null,
            gender: gender || null,
            is_anonymous: is_anonymous || false,
            // Skor 8 pertanyaan survey
            q1_score: q1 || q1_score ? parseInt(q1 || q1_score) : null,
            q2_score: q2 || q2_score ? parseInt(q2 || q2_score) : null,
            q3_score: q3 || q3_score ? parseInt(q3 || q3_score) : null,
            q4_score: q4 || q4_score ? parseInt(q4 || q4_score) : null,
            q5_score: q5 || q5_score ? parseInt(q5 || q5_score) : null,
            q6_score: q6 || q6_score ? parseInt(q6 || q6_score) : null,
            q7_score: q7 || q7_score ? parseInt(q7 || q7_score) : null,
            q8_score: q8 || q8_score ? parseInt(q8 || q8_score) : null,
            // Skor agregat (untuk kompatibilitas)
            overall_score: overall_satisfaction ? parseInt(overall_satisfaction) : avgScore,
            response_time_score: q3 || q3_score ? parseInt(q3 || q3_score) : null,
            solution_quality_score: q5 || q5_score ? parseInt(q5 || q5_score) : null,
            staff_courtesy_score: q7 || q7_score ? parseInt(q7 || q7_score) : null,
            comments: comments || suggestions || null,
            qr_code: qr_code || qr_token || null,
            source: source
        };
        
        console.log('📝 Survey data to insert:', surveyData);

        const { data: survey, error: surveyError } = await supabase
            .from('public_surveys')
            .insert([surveyData])
            .select()
            .single();

        if (surveyError) {
            console.error('Error inserting survey:', surveyError);
            return res.status(500).json({
                success: false,
                error: 'Gagal menyimpan survei: ' + surveyError.message
            });
        }

        // Update QR code usage if applicable
        const qrCodeValue = qr_code || qr_token;
        if (qrCodeValue) {
            const { data: currentQR } = await supabase
                .from('qr_codes')
                .select('usage_count')
                .or(`code.eq.${qrCodeValue},token.eq.${qrCodeValue}`)
                .single();

            if (currentQR) {
                await supabase
                    .from('qr_codes')
                    .update({
                        usage_count: (currentQR.usage_count || 0) + 1,
                        updated_at: new Date().toISOString()
                    })
                    .or(`code.eq.${qrCodeValue},token.eq.${qrCodeValue}`);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Survei berhasil dikirim',
            data: survey
        });

    } catch (error: any) {
        console.error('Error submitting public survey:', error);
        res.status(500).json({
            success: false,
            error: 'Terjadi kesalahan server: ' + error.message
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
        const { start_date, end_date } = req.query;
        
        // Get survey statistics from public_surveys table
        let query = supabase
            .from('public_surveys')
            .select('*');
        
        // Apply date filters if provided
        if (start_date) {
            query = query.gte('created_at', start_date);
        }
        if (end_date) {
            const endDateObj = new Date(end_date as string);
            endDateObj.setHours(23, 59, 59, 999);
            query = query.lte('created_at', endDateObj.toISOString());
        }
        
        const { data: surveys, error } = await query;

        if (error) {
            console.error('Error fetching survey stats:', error);
            return res.status(500).json({
                success: false,
                error: 'Gagal mengambil statistik survei'
            });
        }

        const totalSurveys = surveys?.length || 0;

        if (totalSurveys === 0) {
            return res.json({
                success: true,
                data: {
                    total_surveys: 0,
                    total_responses: 0,
                    average_overall: 0,
                    average_q1: 0,
                    average_q2: 0,
                    average_q3: 0,
                    average_q4: 0,
                    average_q5: 0,
                    average_q6: 0,
                    average_q7: 0,
                    average_q8: 0,
                    ikm_score: 0,
                    nps_score: 0,
                    response_rate: 100,
                    average_completion_rate: 100,
                    active_surveys: 0
                }
            });
        }

        // Calculate averages for each question (support both q1_score format and legacy format)
        const calcAvg = (field: string, legacyField?: string) => {
            const values = surveys.filter(s => {
                const val = s[field] ?? (legacyField ? s[legacyField] : null);
                return val != null;
            }).map(s => s[field] ?? (legacyField ? s[legacyField] : null));
            return values.length > 0 ? parseFloat((values.reduce((a: number, b: number) => a + b, 0) / values.length).toFixed(2)) : 0;
        };

        // Calculate average scores for 8 questions
        // Map legacy fields to new q1-q8 format for backward compatibility
        const avgQ1 = calcAvg('q1_score'); // Persyaratan
        const avgQ2 = calcAvg('q2_score'); // Prosedur
        const avgQ3 = calcAvg('q3_score', 'response_time_score'); // Waktu
        const avgQ4 = calcAvg('q4_score'); // Biaya
        const avgQ5 = calcAvg('q5_score', 'solution_quality_score'); // Produk
        const avgQ6 = calcAvg('q6_score'); // Kompetensi
        const avgQ7 = calcAvg('q7_score', 'staff_courtesy_score'); // Perilaku
        const avgQ8 = calcAvg('q8_score'); // Pengaduan

        // Calculate IKM (Indeks Kepuasan Masyarakat) from all available scores
        const allScores: number[] = [];
        surveys.forEach(s => {
            // Collect all available scores (both new and legacy format)
            const scores = [
                s.q1_score, s.q2_score, s.q3_score, s.q4_score,
                s.q5_score, s.q6_score, s.q7_score, s.q8_score,
                s.overall_score, s.response_time_score, s.solution_quality_score, s.staff_courtesy_score
            ].filter(v => v != null);
            allScores.push(...scores);
        });
        
        const ikmScore = allScores.length > 0 
            ? parseFloat(((allScores.reduce((a, b) => a + b, 0) / allScores.length) / 5 * 100).toFixed(1))
            : 0;

        // Calculate NPS (Net Promoter Score) based on overall satisfaction
        // Use overall_score or calculate from average of all scores
        const npsScores: number[] = [];
        surveys.forEach(s => {
            if (s.overall_score != null) {
                npsScores.push(s.overall_score);
            } else {
                // Calculate average from available scores
                const scores = [
                    s.q1_score, s.q2_score, s.q3_score, s.q4_score,
                    s.q5_score, s.q6_score, s.q7_score, s.q8_score,
                    s.response_time_score, s.solution_quality_score, s.staff_courtesy_score
                ].filter(v => v != null);
                if (scores.length > 0) {
                    npsScores.push(Math.round(scores.reduce((a, b) => a + b, 0) / scores.length));
                }
            }
        });
        
        const promoters = npsScores.filter(s => s >= 4).length;
        const detractors = npsScores.filter(s => s <= 2).length;
        const npsScore = npsScores.length > 0 
            ? Math.round(((promoters - detractors) / npsScores.length) * 100)
            : 0;

        res.json({
            success: true,
            data: {
                total_surveys: totalSurveys,
                total_responses: totalSurveys,
                average_overall: calcAvg('overall_score'),
                average_q1: avgQ1,
                average_q2: avgQ2,
                average_q3: avgQ3,
                average_q4: avgQ4,
                average_q5: avgQ5,
                average_q6: avgQ6,
                average_q7: avgQ7,
                average_q8: avgQ8,
                ikm_score: ikmScore,
                nps_score: npsScore,
                response_rate: 100,
                average_completion_rate: 100,
                active_surveys: totalSurveys
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

// Get all survey responses with filters
export const getSurveyResponses = async (req: Request, res: Response) => {
    try {
        const { start_date, end_date, unit_id, service_type, limit = 100, offset = 0 } = req.query;

        let query = supabase
            .from('public_surveys')
            .select(`
                *,
                units:unit_id (id, name, code)
            `)
            .order('created_at', { ascending: false });

        // Apply filters
        if (start_date) {
            query = query.gte('created_at', start_date);
        }
        if (end_date) {
            const endDateObj = new Date(end_date as string);
            endDateObj.setHours(23, 59, 59, 999);
            query = query.lte('created_at', endDateObj.toISOString());
        }
        if (unit_id && unit_id !== 'all') {
            query = query.eq('unit_id', unit_id);
        }
        if (service_type && service_type !== 'all') {
            query = query.eq('service_type', service_type);
        }

        // Pagination
        query = query.range(Number(offset), Number(offset) + Number(limit) - 1);

        const { data: surveys, error, count } = await query;

        if (error) {
            console.error('Error fetching survey responses:', error);
            return res.status(500).json({
                success: false,
                error: 'Gagal mengambil data survei'
            });
        }

        // Transform data for frontend
        const transformedSurveys = surveys?.map(survey => {
            // Calculate average rating from all available scores
            const avgRating = calculateAverageRating(survey);
            
            return {
                id: survey.id,
                date: survey.created_at,
                unit: survey.units?.name || 'Tidak Diketahui',
                unit_id: survey.unit_id,
                service_type: survey.service_type,
                visitor_name: survey.visitor_name,
                visitor_phone: survey.visitor_phone,
                visitor_email: survey.visitor_email,
                is_anonymous: survey.is_anonymous,
                age_range: survey.age_range,
                gender: survey.gender,
                // Scores - support both new q1-q8 format and legacy format
                q1_score: survey.q1_score,
                q2_score: survey.q2_score,
                q3_score: survey.q3_score ?? survey.response_time_score,
                q4_score: survey.q4_score,
                q5_score: survey.q5_score ?? survey.solution_quality_score,
                q6_score: survey.q6_score,
                q7_score: survey.q7_score ?? survey.staff_courtesy_score,
                q8_score: survey.q8_score,
                overall_score: survey.overall_score,
                // Legacy scores for backward compatibility
                response_time_score: survey.response_time_score,
                solution_quality_score: survey.solution_quality_score,
                staff_courtesy_score: survey.staff_courtesy_score,
                comments: survey.comments,
                // Calculate average rating
                average_rating: avgRating
            };
        }) || [];

        res.json({
            success: true,
            data: transformedSurveys,
            total: count || transformedSurveys.length
        });

    } catch (error) {
        console.error('Error fetching survey responses:', error);
        res.status(500).json({
            success: false,
            error: 'Terjadi kesalahan server'
        });
    }
};

// Helper function to calculate average rating from all available scores
function calculateAverageRating(survey: any): number {
    const scores = [
        // New format q1-q8
        survey.q1_score, survey.q2_score, survey.q3_score, survey.q4_score,
        survey.q5_score, survey.q6_score, survey.q7_score, survey.q8_score,
        // Legacy format
        survey.overall_score, survey.response_time_score, 
        survey.solution_quality_score, survey.staff_courtesy_score
    ].filter(s => s != null);
    
    if (scores.length === 0) return 0;
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}