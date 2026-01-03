import { Request, Response } from 'express';
import supabase from '../config/supabase.js';

export const submitPublicSurvey = async (req: Request, res: Response) => {
    try {
        const {
            unit_tujuan,
            service_type,
            full_name,
            is_anonymous,
            phone,
            email,
            job,
            provinsi,
            kota_kabupaten,
            kecamatan,
            kelurahan,
            age,
            gender,
            q1, q2, q3, q4, q5, q6, q7, q8,
            overall_satisfaction,
            suggestions,
            date,
            qr_code,
            source = 'public_survey'
        } = req.body;

        // Validasi minimal
        if (!service_type || !phone) {
            return res.status(400).json({
                success: false,
                error: 'Jenis layanan dan Nomor HP wajib diisi'
            });
        }

        const surveyData = {
            unit_layanan: unit_tujuan,
            jenis_layanan: service_type,
            nama_responden: is_anonymous ? 'Anonim' : full_name,
            is_anonymous: is_anonymous || false,
            no_hp: phone,
            email: email || null,
            pekerjaan: job || null,
            provinsi: provinsi || null,
            kota_kabupaten: kota_kabupaten || null,
            kecamatan: kecamatan || null,
            kelurahan: kelurahan || null,
            rentang_usia: age || null,
            gender: gender || null,
            nilai_q1: q1 ? parseInt(q1) : null,
            nilai_q2: q2 ? parseInt(q2) : null,
            nilai_q3: q3 ? parseInt(q3) : null,
            nilai_q4: q4 ? parseInt(q4) : null,
            nilai_q5: q5 ? parseInt(q5) : null,
            nilai_q6: q6 ? parseInt(q6) : null,
            nilai_q7: q7 ? parseInt(q7) : null,
            nilai_q8: q8 ? parseInt(q8) : null,
            kepuasan_umum: overall_satisfaction || null,
            saran: suggestions || null,
            tanggal_survei: date ? new Date(date).toISOString() : new Date().toISOString(),
            // Calculate total score or average if needed, for now just store raw
            kepuasan_total: null // Can be calculated later or via trigger
        };

        const { data: survey, error: surveyError } = await supabase
            .from('survei_kepuasan')
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
        if (qr_code) {
            const { data: currentQR } = await supabase
                .from('qr_codes')
                .select('usage_count')
                .eq('code', qr_code)
                .single();

            if (currentQR) {
                await supabase
                    .from('qr_codes')
                    .update({
                        usage_count: (currentQR.usage_count || 0) + 1,
                        updated_at: new Date().toISOString()
                    })
                    .eq('code', qr_code);
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
        // Get survey statistics
        const { data: surveys, error } = await supabase
            .from('survei_kepuasan')
            .select('nilai_q1, nilai_q2, nilai_q3, nilai_q4, nilai_q5, nilai_q6, nilai_q7, nilai_q8, kepuasan_umum, tanggal_survei');

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

        // Simple calculation for now
        const satisfactionRate = 100; // Placeholder

        res.json({
            success: true,
            data: {
                total_surveys: totalSurveys,
                average_overall: 5,
                average_response_time: 5,
                average_solution_quality: 5,
                average_staff_courtesy: 5,
                satisfaction_rate: satisfactionRate
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