import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Interface untuk Dashboard Report PDF
export interface DashboardReportData {
  totalTickets: number;
  statusCounts: {
    open: number;
    in_progress: number;
    escalated: number;
    resolved: number;
    closed: number;
  };
  recentTickets?: any[];
  filters: {
    dateRange: string;
    unit: string;
    status: string;
    category: string;
  };
  generatedAt: string;
  categoryBreakdown?: Array<{ category: string; count: number; percentage: number }>;
  unitBreakdown?: Array<{ unit: string; count: number; percentage: number }>;
  trendData?: Array<{ date: string; open: number; resolved: number; total: number }>;
  performanceMetrics?: {
    resolutionRate: number;
    averageResponseTime: number;
    escalationRate: number;
  };
}

// Fungsi untuk download PDF laporan dashboard dengan format lengkap dan profesional
export const generateDashboardReportPDF = (data: DashboardReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  const checkAddPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // ===== HALAMAN COVER =====
  doc.setFillColor(19, 127, 236);
  doc.rect(0, 0, pageWidth, 90, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN DASHBOARD', pageWidth / 2, 35, { align: 'center' });
  doc.text('RINGKASAN TIKET', pageWidth / 2, 48, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistem Informasi Komplain & Saran (KISS)', pageWidth / 2, 62, { align: 'center' });
  doc.text('RSUD Bendan Kota Pekalongan', pageWidth / 2, 72, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  yPos = 110;

  // Info Filter & Periode
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Periode Laporan:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.filters.dateRange, 20, yPos + 6);
  
  yPos += 18;
  if (data.filters.unit && data.filters.unit !== 'Semua Unit') {
    doc.setFont('helvetica', 'bold');
    doc.text('Unit Kerja:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.filters.unit, 20, yPos + 6);
    yPos += 18;
  }
  
  if (data.filters.category && data.filters.category !== 'Semua Kategori') {
    doc.setFont('helvetica', 'bold');
    doc.text('Kategori Layanan:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.filters.category, 20, yPos + 6);
    yPos += 18;
  }
  
  if (data.filters.status && data.filters.status !== 'Semua Status') {
    doc.setFont('helvetica', 'bold');
    doc.text('Filter Status:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.filters.status, 20, yPos + 6);
    yPos += 18;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.text('Tanggal Cetak:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(data.generatedAt), 20, yPos + 6);

  // ===== I. RINGKASAN EKSEKUTIF =====
  doc.addPage();
  yPos = 20;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('I. RINGKASAN EKSEKUTIF', 20, yPos);
  yPos += 12;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const totalResolved = data.statusCounts.resolved + data.statusCounts.closed;
  const resolutionRate = data.totalTickets > 0 ? Math.round((totalResolved / data.totalTickets) * 100) : 0;
  const escalationRate = data.totalTickets > 0 ? Math.round((data.statusCounts.escalated / data.totalTickets) * 100) : 0;
  
  const summaryText = doc.splitTextToSize(
    `Laporan ini menyajikan ringkasan komprehensif dari dashboard tiket untuk periode ${data.filters.dateRange}. ` +
    `Total ${data.totalTickets} tiket tercatat dengan tingkat penyelesaian ${resolutionRate}% dan tingkat eskalasi ${escalationRate}%. ` +
    `Data mencakup distribusi status, analisis kategori, dan tren kinerja layanan.`,
    pageWidth - 40
  );
  doc.text(summaryText, 20, yPos);
  yPos += summaryText.length * 5 + 10;

  // Tabel KPI Utama
  const kpiData = [
    ['Total Tiket', data.totalTickets.toString(), '100%'],
    ['Tiket Terbuka', data.statusCounts.open.toString(), `${data.totalTickets > 0 ? ((data.statusCounts.open / data.totalTickets) * 100).toFixed(1) : 0}%`],
    ['Tiket Diproses', data.statusCounts.in_progress.toString(), `${data.totalTickets > 0 ? ((data.statusCounts.in_progress / data.totalTickets) * 100).toFixed(1) : 0}%`],
    ['Tiket Eskalasi', data.statusCounts.escalated.toString(), `${escalationRate}%`],
    ['Tiket Selesai', data.statusCounts.resolved.toString(), `${data.totalTickets > 0 ? ((data.statusCounts.resolved / data.totalTickets) * 100).toFixed(1) : 0}%`],
    ['Tiket Ditutup', data.statusCounts.closed.toString(), `${data.totalTickets > 0 ? ((data.statusCounts.closed / data.totalTickets) * 100).toFixed(1) : 0}%`],
    ['Tingkat Penyelesaian', totalResolved.toString(), `${resolutionRate}%`]
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Indikator Kinerja Utama', 'Jumlah', 'Persentase']],
    body: kpiData,
    theme: 'grid',
    headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold', halign: 'center' },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { halign: 'center', cellWidth: 40, fontStyle: 'bold', textColor: [19, 127, 236] },
      2: { halign: 'center', cellWidth: 'auto', fontStyle: 'bold' }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Interpretasi Hasil
  checkAddPage(40);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Interpretasi Hasil:', 20, yPos);
  yPos += 7;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  let interpretation = '';
  if (resolutionRate >= 80) {
    interpretation = `Kinerja layanan sangat baik dengan tingkat penyelesaian ${resolutionRate}%. `;
  } else if (resolutionRate >= 60) {
    interpretation = `Kinerja layanan baik dengan tingkat penyelesaian ${resolutionRate}%. `;
  } else {
    interpretation = `Kinerja layanan perlu ditingkatkan dengan tingkat penyelesaian ${resolutionRate}%. `;
  }
  
  if (escalationRate > 20) {
    interpretation += `Tingkat eskalasi ${escalationRate}% menunjukkan perlu perhatian khusus pada penanganan tiket kompleks.`;
  } else if (escalationRate > 10) {
    interpretation += `Tingkat eskalasi ${escalationRate}% masih dalam batas wajar.`;
  } else {
    interpretation += `Tingkat eskalasi ${escalationRate}% menunjukkan penanganan tiket yang efektif.`;
  }
  
  const interpretationText = doc.splitTextToSize(interpretation, pageWidth - 40);
  doc.text(interpretationText, 20, yPos);
  yPos += interpretationText.length * 4.5 + 15;

  // ===== II. DISTRIBUSI STATUS TIKET =====
  checkAddPage(140);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('II. DISTRIBUSI STATUS TIKET', 20, yPos);
  yPos += 10;

  const statusData = [
    { label: 'Terbuka', count: data.statusCounts.open, color: [148, 163, 184], percentage: data.totalTickets > 0 ? ((data.statusCounts.open / data.totalTickets) * 100).toFixed(1) : '0' },
    { label: 'Diproses', count: data.statusCounts.in_progress, color: [59, 130, 246], percentage: data.totalTickets > 0 ? ((data.statusCounts.in_progress / data.totalTickets) * 100).toFixed(1) : '0' },
    { label: 'Eskalasi', count: data.statusCounts.escalated, color: [249, 115, 22], percentage: data.totalTickets > 0 ? ((data.statusCounts.escalated / data.totalTickets) * 100).toFixed(1) : '0' },
    { label: 'Selesai', count: data.statusCounts.resolved, color: [34, 197, 94], percentage: data.totalTickets > 0 ? ((data.statusCounts.resolved / data.totalTickets) * 100).toFixed(1) : '0' },
    { label: 'Ditutup', count: data.statusCounts.closed, color: [107, 114, 128], percentage: data.totalTickets > 0 ? ((data.statusCounts.closed / data.totalTickets) * 100).toFixed(1) : '0' }
  ];

  // Tabel Status
  const statusTableData = statusData.map(s => [s.label, s.count.toString(), `${s.percentage}%`]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['Status', 'Jumlah', 'Persentase']],
    body: statusTableData,
    theme: 'striped',
    headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold', halign: 'center' },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: 40, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 40, halign: 'center', fontStyle: 'bold', textColor: [19, 127, 236] }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 12;

  // Grafik Batang Horizontal
  checkAddPage(80);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Visualisasi Grafik Distribusi Status:', 20, yPos);
  yPos += 8;

  const maxCount = Math.max(...statusData.map(s => s.count), 1);
  const barMaxWidth = 130;
  const barHeight = 10;
  const startX = 60;

  statusData.forEach((status) => {
    const barWidth = (status.count / maxCount) * barMaxWidth;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(status.label, 20, yPos + 7);
    
    doc.setFillColor(240, 240, 240);
    doc.rect(startX, yPos, barMaxWidth, barHeight, 'F');
    
    doc.setFillColor(status.color[0], status.color[1], status.color[2]);
    doc.rect(startX, yPos, barWidth, barHeight, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.text(`${status.count} (${status.percentage}%)`, startX + barMaxWidth + 5, yPos + 7);
    
    yPos += barHeight + 6;
  });

  yPos += 15;

  // ===== III. DISTRIBUSI PER KATEGORI =====
  if (data.categoryBreakdown && data.categoryBreakdown.length > 0) {
    checkAddPage(100);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('III. DISTRIBUSI PER KATEGORI LAYANAN', 20, yPos);
    yPos += 10;

    const categoryData = data.categoryBreakdown.slice(0, 10).map((cat, idx) => [
      (idx + 1).toString(),
      cat.category,
      cat.count.toString(),
      `${cat.percentage}%`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['No', 'Kategori Layanan', 'Jumlah', 'Persentase']],
      body: categoryData,
      theme: 'striped',
      headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 85 },
        2: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 30, halign: 'center', fontStyle: 'bold', textColor: [19, 127, 236] }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 12;

    // Grafik Kategori Top 5
    checkAddPage(70);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Visualisasi Top 5 Kategori:', 20, yPos);
    yPos += 8;

    const topCategories = data.categoryBreakdown.slice(0, 5);
    const maxCatCount = Math.max(...topCategories.map(c => c.count), 1);

    topCategories.forEach((cat, idx) => {
      const barWidth = (cat.count / maxCatCount) * 130;
      const colors = [[37, 99, 235], [147, 51, 234], [236, 72, 153], [239, 68, 68], [249, 115, 22]];
      const color = colors[idx % colors.length];

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const catName = cat.category.length > 25 ? cat.category.substring(0, 22) + '...' : cat.category;
      doc.text(catName, 20, yPos + 5);

      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(70, yPos, barWidth, 8, 'F');

      doc.setFont('helvetica', 'bold');
      doc.text(`${cat.count} (${cat.percentage}%)`, 70 + barWidth + 3, yPos + 5);

      yPos += 12;
    });

    yPos += 10;
  }

  // ===== IV. DISTRIBUSI PER UNIT KERJA =====
  if (data.unitBreakdown && data.unitBreakdown.length > 0) {
    checkAddPage(100);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('IV. DISTRIBUSI PER UNIT KERJA', 20, yPos);
    yPos += 10;

    const unitData = data.unitBreakdown.slice(0, 10).map((unit, idx) => [
      (idx + 1).toString(),
      unit.unit,
      unit.count.toString(),
      `${unit.percentage}%`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['No', 'Unit Kerja', 'Jumlah', 'Persentase']],
      body: unitData,
      theme: 'striped',
      headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 85 },
        2: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 30, halign: 'center', fontStyle: 'bold', textColor: [19, 127, 236] }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // ===== V. TREN TIKET =====
  if (data.trendData && data.trendData.length > 0) {
    checkAddPage(100);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('V. TREN TIKET HARIAN', 20, yPos);
    yPos += 10;

    const trendTableData = data.trendData.map(t => [
      t.date,
      t.total.toString(),
      t.open.toString(),
      t.resolved.toString(),
      t.total > 0 ? `${Math.round((t.resolved / t.total) * 100)}%` : '0%'
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Tanggal', 'Total', 'Terbuka', 'Terselesaikan', 'Tingkat Penyelesaian']],
      body: trendTableData,
      theme: 'striped',
      headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 40, halign: 'center' },
        1: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
        2: { cellWidth: 30, halign: 'center', fontStyle: 'bold', textColor: [148, 163, 184] },
        3: { cellWidth: 30, halign: 'center', fontStyle: 'bold', textColor: [34, 197, 94] },
        4: { cellWidth: 40, halign: 'center', fontStyle: 'bold', textColor: [19, 127, 236] }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // ===== VI. DETAIL TIKET TERBARU =====
  if (data.recentTickets && data.recentTickets.length > 0) {
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('VI. DETAIL TIKET TERBARU', 20, yPos);
    yPos += 10;

    const ticketData = data.recentTickets.slice(0, 20).map((ticket, idx) => [
      (idx + 1).toString(),
      ticket.ticket_number || '-',
      ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' }) : '-',
      ticket.title ? (ticket.title.length > 30 ? ticket.title.substring(0, 27) + '...' : ticket.title) : '-',
      ticket.status || '-',
      ticket.priority || '-'
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['No', 'No. Tiket', 'Tanggal', 'Judul', 'Status', 'Prioritas']],
      body: ticketData,
      theme: 'striped',
      headStyles: { fillColor: [19, 127, 236], fontSize: 8, fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 7, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 25 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 65 },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 20, halign: 'center' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    if (data.recentTickets.length > 20) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`Menampilkan 20 dari ${data.recentTickets.length} total tiket`, 20, yPos);
    }
  }

  // ===== FOOTER DI SETIAP HALAMAN =====
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    (doc as any).setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    
    doc.text(
      `Halaman ${i} dari ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    
    doc.text(
      `Dicetak: ${new Date().toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`,
      pageWidth - 20,
      pageHeight - 10,
      { align: 'right' }
    );
    
    doc.text(
      'Laporan Dashboard - KISS',
      20,
      pageHeight - 10
    );
  }

  const fileName = `Laporan_Dashboard_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
