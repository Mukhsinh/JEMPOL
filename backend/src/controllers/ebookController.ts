import { Request, Response } from 'express';
import supabase from '../config/supabase.js';

export const getEbookSections = async (req: Request, res: Response) => {
    try {
        const { data: sections, error } = await supabase
            .from('ebook_sections')
            .select('*')
            .eq('is_active', true)
            .order('order');

        if (error) throw error;

        res.json(sections || []);
    } catch (error: any) {
        console.error('Error fetching ebook sections:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getEbookSection = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data: section, error } = await supabase
            .from('ebook_sections')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        if (!section) {
            return res.status(404).json({ error: 'Section not found' });
        }

        res.json(section);
    } catch (error: any) {
        console.error('Error fetching ebook section:', error);
        res.status(500).json({ error: error.message });
    }
};
