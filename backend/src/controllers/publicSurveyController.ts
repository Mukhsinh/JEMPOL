import { Request, Response } from 'express';
import supabase from '../config/supabase.js';

export const submitPublicSurvey = async (req: Request, res: Response) => {
    try {
        console.log('📥 Received survey submission:', req.body);
        
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
            education,
            job,
            patient_type,
            // Data alamat
            provinsi,
            kabupaten_kota,
            kota_kabupaten,
            kecamatan,
            kelurahan,
            alamat_jalan,
            alamat_detail,
            regency,
            district,
            address_detail,
            // Skor pertanyaan (format q1-q8 atau q1_score-q8_score) - legacy
            q1, q2, q3, q4, q5, q6, q7, q8,
            q1_score, q2_score, q3_score, q4_score, q5_score, q6_score, q7_score, q8_score,
            // Skor indikator baru (9 unsur x 3 indikator)
            u1_ind1, u1_ind2, u1_ind3,
            u2_ind1, u2_ind2, u2_ind3,
            u3_ind1, u3_ind2, u3_ind3,
            u4_ind1, u4_ind2, u4_ind3,
            u5_ind1, u5_ind2, u5_ind3,
            u6_ind1, u6_ind2, u6_ind3,
            u7_ind1, u7_ind2, u7_ind3,
            u8_ind1, u8_ind2, u8_ind3,
            u9_ind1, u9_ind2, u9_ind3,
            overall_satisfaction,
            comments,
            suggestions,
            qr_code,
            qr_token,
            source = 'public_survey'
        } = req.body;

        // Validasi unit (optional - hanya jika ada)
        const finalUnitId = unit_id || unit_tujuan || null;

        // Hitung skor rata-rata
        const scores = [
            q1 || q1_score, q2 || q2_score, q3 || q3_score, q4 || q4_score,
            q5 || q5_score, q6 || q6_score, q7 || q7_score, q8 || q8_score
        ].filter(s => s !== null && s !== undefined && s !== '').map(s => parseInt(s));
        
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

        // Simpan ke tabel public_surveys dengan semua kolom
        const surveyData: any = {
            unit_id: finalUnitId,
            service_category_id: service_category_id || null,
            visitor_name: is_anonymous ? null : (full_name || reporter_name || null),
            visitor_email: is_anonymous ? null : (email || reporter_email || null),
            visitor_phone: is_anonymous ? null : (phone || reporter_phone || null),
            // Data responden tambahan
            service_type: service_type || null,
            age_range: age || age_range || null,
            gender: gender || null,
            education: education || null,
            job: job || null,
            patient_type: patient_type || null,
            is_anonymous: is_anonymous || false,
            // Data alamat
            provinsi: provinsi || null,
            kabupaten_kota: regency || kabupaten_kota || kota_kabupaten || null,
            kecamatan: district || kecamatan || null,
            kelurahan: kelurahan || null,
            alamat_jalan: address_detail || alamat_jalan || alamat_detail || null,
            // Skor 8 pertanyaan survey (legacy - untuk backward compatibility)
            q1_score: q1 || q1_score ? parseInt(q1 || q1_score) : null,
            q2_score: q2 || q2_score ? parseInt(q2 || q2_score) : null,
            q3_score: q3 || q3_score ? parseInt(q3 || q3_score) : null,
            q4_score: q4 || q4_score ? parseInt(q4 || q4_score) : null,
            q5_score: q5 || q5_score ? parseInt(q5 || q5_score) : null,
            q6_score: q6 || q6_score ? parseInt(q6 || q6_score) : null,
            q7_score: q7 || q7_score ? parseInt(q7 || q7_score) : null,
            q8_score: q8 || q8_score ? parseInt(q8 || q8_score) : null,
            // Skor indikator baru (9 unsur x 3 indikator)
            u1_ind1_score: u1_ind1 ? parseInt(u1_ind1) : null,
            u1_ind2_score: u1_ind2 ? parseInt(u1_ind2) : null,
            u1_ind3_score: u1_ind3 ? parseInt(u1_ind3) : null,
            u2_ind1_score: u2_ind1 ? parseInt(u2_ind1) : null,
            u2_ind2_score: u2_ind2 ? parseInt(u2_ind2) : null,
            u2_ind3_score: u2_ind3 ? parseInt(u2_ind3) : null,
            u3_ind1_score: u3_ind1 ? parseInt(u3_ind1) : null,
            u3_ind2_score: u3_ind2 ? parseInt(u3_ind2) : null,
            u3_ind3_score: u3_ind3 ? parseInt(u3_ind3) : null,
            u4_ind1_score: u4_ind1 ? parseInt(u4_ind1) : null,
            u4_ind2_score: u4_ind2 ? parseInt(u4_ind2) : null,
            u4_ind3_score: u4_ind3 ? parseInt(u4_ind3) : null,
            u5_ind1_score: u5_ind1 ? parseInt(u5_ind1) : null,
            u5_ind2_score: u5_ind2 ? parseInt(u5_ind2) : null,
            u5_ind3_score: u5_ind3 ? parseInt(u5_ind3) : null,
            u6_ind1_score: u6_ind1 ? parseInt(u6_ind1) : null,
            u6_ind2_score: u6_ind2 ? parseInt(u6_ind2) : null,
            u6_ind3_score: u6_ind3 ? parseInt(u6_ind3) : null,
            u7_ind1_score: u7_ind1 ? parseInt(u7_ind1) : null,
            u7_ind2_score: u7_ind2 ? parseInt(u7_ind2) : null,
            u7_ind3_score: u7_ind3 ? parseInt(u7_ind3) : null,
            u8_ind1_score: u8_ind1 ? parseInt(u8_ind1) : null,
            u8_ind2_score: u8_ind2 ? parseInt(u8_ind2) : null,
            u8_ind3_score: u8_ind3 ? parseInt(u8_ind3) : null,
            u9_ind1_score: u9_ind1 ? parseInt(u9_ind1) : null,
            u9_ind2_score: u9_ind2 ? parseInt(u9_ind2) : null,
            u9_ind3_score: u9_ind3 ? parseInt(u9_ind3) : null,
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
            console.error('❌ Error inserting survey:', surveyError);
            return res.status(500).json({
                success: false,
                error: 'Gagal menyimpan survei: ' + surveyError.message
            });
        }

        console.log('✅ Survey saved successfully:', survey.id);

        // Update QR code usage if applicable
        const qrCodeValue = qr_code || qr_token;
        if (qrCodeValue) {
            try {
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
            } catch (qrError) {
                console.warn('⚠️ Failed to update QR code usage:', qrError);
                // Don't fail the whole request if QR update fails
            }
        }

        return res.status(201).json({
            success: true,
            message: 'Survei berhasil dikirim',
            data: survey
        });

    } catch (error: any) {
        console.error('❌ Error submitting public survey:', error);
        return res.status(500).json({
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
        const { start_date, end_date, unit_id, service_type } = req.query;
        
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
        
        // Apply unit filter
        if (unit_id && unit_id !== 'all') {
            query = query.eq('unit_id', unit_id);
        }
        
        // Apply service type filter
        if (service_type && service_type !== 'all') {
            query = query.eq('service_type', service_type);
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

// Get IKM comparison by unit
export const getIKMByUnit = async (req: Request, res: Response) => {
    try {
        const { start_date, end_date, unit_id, service_type } = req.query;

        console.log('📊 Fetching IKM by unit with filters:', { start_date, end_date, unit_id, service_type });

        let query = supabase
            .from('public_surveys')
            .select(`
                unit_id,
                service_type,
                q1_score, q2_score, q3_score, q4_score,
                q5_score, q6_score, q7_score, q8_score,
                units:unit_id (id, name, code)
            `);

        // Apply date filters
        if (start_date) {
            query = query.gte('created_at', start_date);
        }
        if (end_date) {
            const endDateObj = new Date(end_date as string);
            endDateObj.setHours(23, 59, 59, 999);
            query = query.lte('created_at', endDateObj.toISOString());
        }
        
        // Apply unit filter
        if (unit_id && unit_id !== 'all') {
            query = query.eq('unit_id', unit_id);
        }
        
        // Apply service type filter
        if (service_type && service_type !== 'all') {
            query = query.eq('service_type', service_type);
        }

        const { data: surveys, error } = await query;

        if (error) {
            console.error('❌ Error fetching IKM by unit:', error);
            return res.status(500).json({
                success: false,
                error: 'Gagal mengambil data IKM per unit'
            });
        }

        console.log(`📊 Found ${surveys?.length || 0} surveys`);

        // Tentukan apakah grouping berdasarkan unit atau service_type
        const groupByServiceType = unit_id && unit_id !== 'all';
        
        // Group by unit atau service_type dan calculate IKM
        const dataMap = new Map<string, { name: string; scores: number[]; count: number }>();

        surveys?.forEach(survey => {
            // Skip surveys dengan unit_id null jika tidak grouping by service type
            if (!groupByServiceType && !survey.unit_id) {
                console.log('⚠️ Skipping survey with null unit_id');
                return;
            }

            let groupKey: string;
            let groupName: string;
            
            if (groupByServiceType) {
                // Jika filter unit dipilih, group by service_type
                groupKey = survey.service_type || 'lainnya';
                const serviceTypeLabels: Record<string, string> = {
                    'rawat_jalan': 'Rawat Jalan',
                    'rawat_inap': 'Rawat Inap',
                    'darurat': 'IGD',
                    'lainnya': 'Lainnya'
                };
                groupName = serviceTypeLabels[groupKey] || groupKey;
            } else {
                // Jika semua unit, group by unit
                groupKey = survey.unit_id;
                const unitData = Array.isArray(survey.units) ? survey.units[0] : survey.units;
                groupName = unitData?.name || 'Tidak Diketahui';
            }

            if (!dataMap.has(groupKey)) {
                dataMap.set(groupKey, { name: groupName, scores: [], count: 0 });
            }

            const group = dataMap.get(groupKey)!;
            
            // Collect all valid scores (harus > 0 dan tidak null)
            const scores = [
                survey.q1_score, survey.q2_score, survey.q3_score, survey.q4_score,
                survey.q5_score, survey.q6_score, survey.q7_score, survey.q8_score
            ].filter(s => s != null && s > 0);

            // Hanya hitung jika ada minimal 1 score yang valid
            if (scores.length > 0) {
                const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
                group.scores.push(avgScore);
                group.count++;
            } else {
                console.log('⚠️ Survey has no valid scores:', survey.unit_id, survey.service_type);
            }
        });

        console.log(`📊 Grouped into ${dataMap.size} groups`);

        // Calculate IKM for each group and format response
        const unitIKM = Array.from(dataMap.entries())
            .map(([groupId, data]) => {
                const avgScore = data.scores.length > 0
                    ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length
                    : 0;
                const ikmScore = (avgScore / 5) * 100;

                return {
                    unit_id: groupId,
                    unit_name: data.name,
                    total_responses: data.count,
                    average_score: parseFloat(avgScore.toFixed(2)),
                    ikm_score: parseFloat(ikmScore.toFixed(1))
                };
            })
            .filter(unit => unit.total_responses > 0) // Hanya tampilkan yang ada responsenya
            .sort((a, b) => b.ikm_score - a.ikm_score);

        console.log(`✅ Returning ${unitIKM.length} unit IKM data`);

        res.json({
            success: true,
            data: unitIKM
        });

    } catch (error) {
        console.error('❌ Error fetching IKM by unit:', error);
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

// Get address statistics for survey report
export const getAddressStatistics = async (req: Request, res: Response) => {
    try {
        const { start_date, end_date, unit_id, service_type, group_by = 'kabupaten_kota' } = req.query;

        console.log('📊 Fetching address statistics with filters:', { start_date, end_date, unit_id, service_type, group_by });

        let query = supabase
            .from('public_surveys')
            .select('kabupaten_kota, kecamatan, kelurahan, alamat_jalan');

        // Apply date filters
        if (start_date) {
            query = query.gte('created_at', start_date);
        }
        if (end_date) {
            const endDateObj = new Date(end_date as string);
            endDateObj.setHours(23, 59, 59, 999);
            query = query.lte('created_at', endDateObj.toISOString());
        }
        
        // Apply unit filter
        if (unit_id && unit_id !== 'all') {
            query = query.eq('unit_id', unit_id);
        }
        
        // Apply service type filter
        if (service_type && service_type !== 'all') {
            query = query.eq('service_type', service_type);
        }

        const { data: surveys, error } = await query;

        if (error) {
            console.error('❌ Error fetching address statistics:', error);
            return res.status(500).json({
                success: false,
                error: 'Gagal mengambil statistik alamat'
            });
        }

        console.log(`📊 Found ${surveys?.length || 0} surveys with address data`);

        // Group by selected field
        const addressMap = new Map<string, number>();

        surveys?.forEach(survey => {
            let key: string | null = null;
            
            if (group_by === 'kabupaten_kota' && survey.kabupaten_kota) {
                key = survey.kabupaten_kota;
            } else if (group_by === 'kecamatan' && survey.kecamatan) {
                key = survey.kecamatan;
            } else if (group_by === 'kelurahan' && survey.kelurahan) {
                key = survey.kelurahan;
            }

            if (key) {
                addressMap.set(key, (addressMap.get(key) || 0) + 1);
            }
        });

        // Convert to array and sort by count
        const addressStats = Array.from(addressMap.entries())
            .map(([name, count]) => ({
                name,
                count,
                percentage: surveys && surveys.length > 0 
                    ? parseFloat(((count / surveys.length) * 100).toFixed(1))
                    : 0
            }))
            .sort((a, b) => b.count - a.count);

        console.log(`✅ Returning ${addressStats.length} address statistics`);

        res.json({
            success: true,
            data: addressStats,
            total: surveys?.length || 0
        });

    } catch (error) {
        console.error('❌ Error fetching address statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Terjadi kesalahan server'
        });
    }
};