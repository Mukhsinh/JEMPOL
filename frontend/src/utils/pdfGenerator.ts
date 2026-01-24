import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type untuk autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable?: {
      finalY: number;
    };
  }
}

interface TicketData {
  ticket_number: string;
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  unit_name?: string;
  reporter_name?: string;
  reporter_email?: string;
  reporter_phone?: string;
  reporter_address?: string;
  created_at?: string;
  type?: 'internal' | 'external';
  [key: string]: any;
}

interface SurveyData {
  survey_id?: string;
  respondent_name?: string;
  respondent_phone?: string;
  respondent_email?: string;
  service_type?: string;
  unit_name?: string;
  visit_date?: string;
  responses?: any;
  created_at?: string;
  suggestions?: string;
  comments?: string;
  age_range?: string;
  gender?: string;
  education?: string;
  job?: string;
  regency?: string;
  district?: string;
  address_detail?: string;
  [key: string]: any;
}

export class PDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private currentY: number = 20;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  private addHeader(title: string) {
    // Header background
    this.doc.setFillColor(59, 130, 246); // Blue
    this.doc.rect(0, 0, this.pageWidth, 40, 'F');

    // Logo/Icon placeholder
    this.doc.setFillColor(255, 255, 255);
    this.doc.circle(this.margin, 20, 8, 'F');

    // Title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin + 15, 25);

    // Subtitle
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Sistem Manajemen Keluhan - KISS', this.pageWidth - this.margin, 15, { align: 'right' });
    this.doc.text(new Date().toLocaleString('id-ID'), this.pageWidth - this.margin, 22, { align: 'right' });

    this.currentY = 50;
  }

  private addFooter() {
    const footerY = this.pageHeight - 15;
    
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5);
    
    this.doc.setTextColor(100, 100, 100);
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Dokumen ini dibuat secara otomatis oleh sistem', this.pageWidth / 2, footerY, { align: 'center' });
    this.doc.text(`Halaman ${this.doc.getCurrentPageInfo().pageNumber}`, this.pageWidth - this.margin, footerY, { align: 'right' });
  }

  private addSection(title: string) {
    if (this.currentY > this.pageHeight - 40) {
      this.doc.addPage();
      this.currentY = 20;
    }

    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 10, 'F');
    
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin + 5, this.currentY + 7);
    
    this.currentY += 15;
  }

  private addField(label: string, value: string) {
    if (this.currentY > this.pageHeight - 30) {
      this.doc.addPage();
      this.currentY = 20;
    }

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(60, 60, 60);
    this.doc.text(label + ':', this.margin + 5, this.currentY);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    // Handle long text with wrapping
    const maxWidth = this.pageWidth - 2 * this.margin - 60;
    const lines = this.doc.splitTextToSize(value || '-', maxWidth);
    this.doc.text(lines, this.margin + 60, this.currentY);
    
    this.currentY += 7 * lines.length;
  }

  private addTable(headers: string[], data: any[][]) {
    if (this.currentY > this.pageHeight - 50) {
      this.doc.addPage();
      this.currentY = 20;
    }

    this.doc.autoTable({
      startY: this.currentY,
      head: [headers],
      body: data,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [0, 0, 0]
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { left: this.margin, right: this.margin }
    });

    this.currentY = this.doc.lastAutoTable?.finalY || this.currentY + 10;
  }

  public generateInternalTicketPDF(data: TicketData): void {
    this.addHeader('TIKET INTERNAL');

    // Informasi Tiket
    this.addSection('INFORMASI TIKET');
    this.addField('Nomor Tiket', data.ticket_number);
    this.addField('Judul', data.title || '-');
    this.addField('Kategori', data.category || '-');
    this.addField('Prioritas', data.priority || '-');
    this.addField('Unit Tujuan', data.unit_name || '-');
    this.addField('Tanggal Dibuat', data.created_at ? new Date(data.created_at).toLocaleString('id-ID') : '-');

    this.currentY += 5;

    // Informasi Pelapor
    this.addSection('INFORMASI PELAPOR');
    this.addField('Nama', data.reporter_name || '-');
    this.addField('Email', data.reporter_email || '-');
    this.addField('Telepon', data.reporter_phone || '-');
    if (data.reporter_address) {
      this.addField('Alamat', data.reporter_address);
    }

    this.currentY += 5;

    // Deskripsi
    this.addSection('DESKRIPSI MASALAH');
    this.currentY += 3;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const descLines = this.doc.splitTextToSize(data.description || 'Tidak ada deskripsi', this.pageWidth - 2 * this.margin - 10);
    this.doc.text(descLines, this.margin + 5, this.currentY);
    this.currentY += 7 * descLines.length + 10;

    // Footer
    this.addFooter();

    // Save
    this.doc.save(`Tiket_Internal_${data.ticket_number}.pdf`);
  }

  public generateExternalTicketPDF(data: TicketData): void {
    this.addHeader('TIKET EKSTERNAL');

    // Informasi Tiket
    this.addSection('INFORMASI LAPORAN');
    this.addField('Nomor Tiket', data.ticket_number);
    this.addField('Judul', data.title || '-');
    this.addField('Kategori', data.category || '-');
    this.addField('Prioritas', data.priority || '-');
    this.addField('Unit Terkait', data.unit_name || '-');
    this.addField('Tanggal Dibuat', data.created_at ? new Date(data.created_at).toLocaleString('id-ID') : '-');

    this.currentY += 5;

    // Informasi Pelapor
    this.addSection('INFORMASI PELAPOR');
    this.addField('Nama', data.reporter_name || '-');
    this.addField('Email', data.reporter_email || '-');
    this.addField('Telepon', data.reporter_phone || '-');
    if (data.reporter_address) {
      this.addField('Alamat', data.reporter_address);
    }

    this.currentY += 5;

    // Deskripsi
    this.addSection('DESKRIPSI LAPORAN');
    this.currentY += 3;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    const descLines = this.doc.splitTextToSize(data.description || 'Tidak ada deskripsi', this.pageWidth - 2 * this.margin - 10);
    this.doc.text(descLines, this.margin + 5, this.currentY);
    this.currentY += 7 * descLines.length + 10;

    // Footer
    this.addFooter();

    // Save
    this.doc.save(`Tiket_Eksternal_${data.ticket_number}.pdf`);
  }

  public generateSurveyPDF(data: SurveyData): void {
    this.addHeader('HASIL SURVEI KEPUASAN');

    // Informasi Responden
    this.addSection('INFORMASI RESPONDEN');
    this.addField('Nama', data.respondent_name || '-');
    this.addField('Telepon', data.respondent_phone || '-');
    if (data.respondent_email) {
      this.addField('Email', data.respondent_email);
    }
    this.addField('Jenis Layanan', data.service_type || '-');
    this.addField('Unit Layanan', data.unit_name || '-');
    if (data.visit_date) {
      this.addField('Tanggal Kunjungan', new Date(data.visit_date).toLocaleDateString('id-ID'));
    }
    this.addField('Tanggal Survei', data.created_at ? new Date(data.created_at).toLocaleString('id-ID') : '-');

    this.currentY += 5;

    // Identitas Lengkap (jika ada)
    if (data.age_range || data.gender || data.education || data.job || data.regency) {
      this.addSection('IDENTITAS LENGKAP');
      if (data.age_range) this.addField('Usia', data.age_range);
      if (data.gender) this.addField('Jenis Kelamin', data.gender === 'L' ? 'Laki-laki' : 'Perempuan');
      if (data.education) this.addField('Pendidikan', data.education);
      if (data.job) this.addField('Pekerjaan', data.job);
      if (data.regency) this.addField('Kab/Kota', data.regency);
      if (data.district) this.addField('Kecamatan', data.district);
      if (data.address_detail) this.addField('Alamat Detail', data.address_detail);
      
      this.currentY += 5;
    }

    // Hasil Penilaian
    this.addSection('HASIL PENILAIAN');
    
    if (data.responses && typeof data.responses === 'object') {
      const questions = [
        { key: 'q1', label: 'Persyaratan pelayanan' },
        { key: 'q2', label: 'Prosedur pelayanan' },
        { key: 'q3', label: 'Waktu pelayanan' },
        { key: 'q4', label: 'Biaya/tarif' },
        { key: 'q5', label: 'Produk spesifikasi jenis pelayanan' },
        { key: 'q6', label: 'Kompetensi pelaksana' },
        { key: 'q7', label: 'Perilaku pelaksana' },
        { key: 'q8', label: 'Penanganan pengaduan' },
        { key: 'q9', label: 'Sarana dan prasarana' }
      ];

      const tableData = questions.map((q, idx) => [
        (idx + 1).toString(),
        q.label,
        this.getRatingText(data.responses[q.key] || 0)
      ]);

      this.addTable(
        ['No', 'Aspek Penilaian', 'Nilai'],
        tableData
      );

      this.currentY += 5;
    }

    // Saran dan Masukan
    if (data.suggestions || data.comments) {
      this.addSection('SARAN DAN MASUKAN');
      this.currentY += 3;
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      const suggestions = data.suggestions || data.comments || 'Tidak ada saran';
      const suggLines = this.doc.splitTextToSize(suggestions, this.pageWidth - 2 * this.margin - 10);
      this.doc.text(suggLines, this.margin + 5, this.currentY);
      this.currentY += 7 * suggLines.length + 10;
    }

    // Footer
    this.addFooter();

    // Save
    const surveyId = data.survey_id || new Date().getTime().toString();
    this.doc.save(`Survei_${surveyId}.pdf`);
  }

  private getRatingText(rating: number): string {
    const ratings: { [key: number]: string } = {
      1: '1 - Tidak Baik',
      2: '2 - Kurang Baik',
      3: '3 - Baik',
      4: '4 - Sangat Baik',
      5: '5 - Sangat Baik Sekali'
    };
    return ratings[rating] || '-';
  }
}

// Export helper functions
export const downloadInternalTicketPDF = (data: TicketData) => {
  const generator = new PDFGenerator();
  generator.generateInternalTicketPDF(data);
};

export const downloadExternalTicketPDF = (data: TicketData) => {
  const generator = new PDFGenerator();
  generator.generateExternalTicketPDF(data);
};

export const downloadSurveyPDF = (data: SurveyData) => {
  const generator = new PDFGenerator();
  generator.generateSurveyPDF(data);
};
