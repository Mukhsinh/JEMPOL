import api from './api';

export interface EbookSection {
    id: string;
    title: string;
    content: string;
    order: number;
    is_active: boolean;
}

export const getEbookSections = async (): Promise<EbookSection[]> => {
    try {
        const response = await api.get('/ebooks');
        return response.data;
    } catch (error) {
        console.error('Error fetching ebook sections:', error);
        throw error;
    }
};

export const getEbookSection = async (id: string): Promise<EbookSection> => {
    try {
        const response = await api.get(`/ebooks/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching ebook section:', error);
        throw error;
    }
};

export const ebookService = {
    getEbookSections,
    getEbookSection,
};

export default ebookService;
