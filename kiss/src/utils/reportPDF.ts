import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FullReportData } from '../services/reportService';

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'open': return 'Baru';
    case 'in_progress': return 'Sedang Proses';
    case 'resolved': return 'Selesai';
    case 'closed': return 'Ditutup';
    case 'escalated': return 'Eskalasi';
    default: return status;
  }
};

export const generateReportPDF = (data: FullReportData, filters: any) => {
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

  // ===== HALAMAN COVER =====
  doc.setFillColor(19, 127, 236);
  doc.rect(0, 0, pageWidth, 90, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN ANALITIK LAYANAN', pageWidth / 2, 35, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistem Informasi Komplain & Saran (KISS)', pageWidth / 2, 48, { align: 'center' });
  doc.text('RSUD Bendan Kota Pekalongan', pageWidth / 2, 58, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text('Laporan Komprehensif Analisis Layanan Publik', pageWidth / 2, 72, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  yPos = 110;

  // Info Periode
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Periode Laporan:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  const periodLabel = filters.dateRange === 'week' ? 'Minggu Ini' : 
                      filters.dateRange === 'month' ? 'Bulan Ini' :
                      filters.dateRange === 'quarter' ? 'Kuartal Ini' : 
                      filters.dateRange === 'year' ? 'Tahun Ini' : 'Bulan Ini';
  doc.text(periodLabel, 20, yPos + 6);
  
  yPos += 18;
  doc.setFont('helvetica', 'bold');
  doc.text('Tanggal Cetak:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(new Date().toISOString()), 20, yPos + 6);

  // ===== I. RINGKASAN EKSEKUTIF =====
  doc.addPage();
  yPos = 20;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('I. RINGKASAN EKSEKUTIF', 20, yPos);
  yPos += 12;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryText = doc.splitTextToSize(
    `Laporan ini menyajikan analisis komprehensif terhadap layanan publik RSUD Bendan untuk periode ${periodLabel}. ` +
    `Data mencakup pengaduan, saran, permintaan informasi, dan hasil survey kepuasan masyarakat yang telah dikumpulkan ` +
    `melalui berbagai kanal layanan.`,
    pageWidth - 40
  );
  doc.text(summaryText, 20, yPos);
  yPos += summaryText.length * 5 + 10;

  // Tabel KPI Utama
  const kpiData = [
    ['Total Pengaduan', data.kpi.totalComplaints.toString(), `${data.kpi.totalComplaintsChange >= 0 ? '+' : ''}${data.kpi.totalComplaintsChange}%`],
    ['Total Saran', data.kpi.totalSuggestions.toString(), `${data.kpi.totalSuggestionsChange >= 0 ? '+' : ''}${data.kpi.totalSuggestionsChange}%`],
    ['Total Permintaan Informasi', data.kpi.totalRequests.toString(), `${data.kpi.totalRequestsChange >= 0 ? '+' : ''}${data.kpi.totalRequestsChange}%`],
    ['Total Survey', data.kpi.totalSurveys.toString(), `${data.kpi.totalSurveysChange >= 0 ? '+' : ''}${data.kpi.totalSurveysChange}%`],
    ['Tiket Terselesaikan', data.kpi.resolvedComplaints.toString(), `${data.kpi.resolvedComplaintsChange >= 0 ? '+' : ''}${data.kpi.resolvedComplaintsChange}%`],
    ['Rata-rata Waktu Respon', `${data.kpi.averageResponseTime} Menit`, `${data.kpi.averageResponseTimeChange}%`]
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Indikator Kinerja Utama', 'Nilai', 'Perubahan']],
    body: kpiData,
    theme: 'grid',
    headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold', halign: 'center' },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { halign: 'center', cellWidth: 40, fontStyle: 'bold', textColor: [19, 127, 236] },
      2: { halign: 'center', cellWidth: 'auto' }
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
  const totalTickets = data.kpi.totalComplaints + data.kpi.totalSuggestions + data.kpi.totalRequests;
  const resolutionRate = totalTickets > 0 ? Math.round((data.kpi.resolvedComplaints / totalTickets) * 100) : 0;
  const interpretation = doc.splitTextToSize(
    `Pada periode ${periodLabel}, tercatat total ${totalTickets} tiket yang terdiri dari ${data.kpi.totalComplaints} pengaduan, ` +
    `${data.kpi.totalSuggestions} saran, dan ${data.kpi.totalRequests} permintaan informasi. Tingkat penyelesaian mencapai ${resolutionRate}% ` +
    `dengan rata-rata waktu respon ${data.kpi.averageResponseTime} menit. Tren menunjukkan ${data.kpi.totalComplaintsChange >= 0 ? 'peningkatan' : 'penurunan'} ` +
    `${Math.abs(data.kpi.totalComplaintsChange)}% dibanding periode sebelumnya.`,
    pageWidth - 40
  );
  doc.text(interpretation, 20, yPos);
  yPos += interpretation.length * 4.5 + 15;

  // ===== II. DISTRIBUSI STATUS TIKET (PIE CHART) =====
  checkAddPage(140);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('II. DISTRIBUSI STATUS TIKET', 20, yPos);
  yPos += 10;

  // Gunakan statusCounts dari data (semua tiket, bukan hanya yang dipaginasi)
  const statusCounts = data.statusCounts || {
    open: 0,
    in_progress: 0,
    escalated: 0,
    resolved: 0,
    closed: 0
  };

  const totalStatusTickets = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  // Data untuk pie chart
  const pieData = [
    { label: 'Baru', count: statusCounts.open, color: [148, 163, 184], percentage: totalStatusTickets > 0 ? (statusCounts.open / totalStatusTickets * 100).toFixed(1) : '0' },
    { label: 'Sedang Proses', count: statusCounts.in_progress, color: [59, 130, 246], percentage: totalStatusTickets > 0 ? (statusCounts.in_progress / totalStatusTickets * 100).toFixed(1) : '0' },
    { label: 'Eskalasi', count: statusCounts.escalated, color: [249, 115, 22], percentage: totalStatusTickets > 0 ? (statusCounts.escalated / totalStatusTickets * 100).toFixed(1) : '0' },
    { label: 'Selesai', count: statusCounts.resolved, color: [34, 197, 94], percentage: totalStatusTickets > 0 ? (statusCounts.resolved / totalStatusTickets * 100).toFixed(1) : '0' },
    { label: 'Ditutup', count: statusCounts.closed, color: [107, 114, 128], percentage: totalStatusTickets > 0 ? (statusCounts.closed / totalStatusTickets * 100).toFixed(1) : '0' }
  ];

  // Gambar Pie Chart menggunakan circle
  const centerX = 60;
  const centerY = yPos + 40;
  const radius = 35;

  // Gambar pie chart sebagai lingkaran dengan segmen warna
  pieData.forEach((item, index) => {
    if (item.count > 0) {
      const angle = (360 / pieData.length) * index;
      const x = centerX + (radius * 0.6) * Math.cos((angle - 90) * Math.PI / 180);
      const y = centerY + (radius * 0.6) * Math.sin((angle - 90) * Math.PI / 180);
      
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.circle(x, y, radius / pieData.length, 'F');
    }
  });

  // Gambar lingkaran utama
  doc.setFillColor(240, 240, 240);
  doc.circle(centerX, centerY, radius, 'F');
  
  // Gambar segmen dengan rectangle untuk simulasi pie
  let startAngle = 0;
  pieData.forEach((item) => {
    if (item.count > 0) {
      const sliceAngle = (item.count / totalStatusTickets) * 360;
      const midAngle = startAngle + sliceAngle / 2;
      
      // Gambar rectangle sebagai representasi slice
      const rectX = centerX + (radius * 0.5) * Math.cos((midAngle - 90) * Math.PI / 180);
      const rectY = centerY + (radius * 0.5) * Math.sin((midAngle - 90) * Math.PI / 180);
      
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.circle(rectX, rectY, 8, 'F');
      
      startAngle += sliceAngle;
    }
  });

  // Tabel Keterangan di sebelah kanan pie chart
  const legendStartX = 110;
  const legendStartY = yPos + 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Keterangan:', legendStartX, legendStartY);
  
  let legendY = legendStartY + 8;
  pieData.forEach((item) => {
    // Kotak warna
    doc.setFillColor(item.color[0], item.color[1], item.color[2]);
    doc.rect(legendStartX, legendY - 3, 5, 5, 'F');
    
    // Label dan data
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, legendStartX + 8, legendY + 1);
    doc.setFont('helvetica', 'bold');
    doc.text(`${item.count} (${item.percentage}%)`, legendStartX + 55, legendY + 1);
    
    legendY += 8;
  });

  // Total
  legendY += 3;
  doc.setDrawColor(200, 200, 200);
  doc.line(legendStartX, legendY - 2, legendStartX + 70, legendY - 2);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Tiket:', legendStartX, legendY + 3);
  doc.text(totalStatusTickets.toString(), legendStartX + 55, legendY + 3);

  yPos += 90;

  // ===== III. TIKET BERDASARKAN UNIT (GRAFIK BATANG) =====
  if (data.unitCounts && Object.keys(data.unitCounts).length > 0) {
    checkAddPage(120);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('III. TIKET BERDASARKAN UNIT', 20, yPos);
    yPos += 10;

    // Urutkan dan ambil top 10 dari unitCounts
    const sortedUnits = Object.entries(data.unitCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const maxUnitCount = Math.max(...sortedUnits.map(u => u[1]), 1);
    const unitBarMaxWidth = 130;
    const unitBarHeight = 10;
    const unitStartX = 70;

    sortedUnits.forEach(([unitName, count], index) => {
      const barWidth = (count / maxUnitCount) * unitBarMaxWidth;
      const colors = [
        [37, 99, 235],
        [147, 51, 234],
        [236, 72, 153],
        [239, 68, 68],
        [249, 115, 22],
        [34, 197, 94],
        [14, 165, 233],
        [168, 85, 247],
        [244, 63, 94],
        [251, 146, 60]
      ];
      const color = colors[index % colors.length];

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const displayName = unitName.length > 25 ? unitName.substring(0, 22) + '...' : unitName;
      doc.text(displayName, 20, yPos + 7);

      // Background bar
      doc.setFillColor(240, 240, 240);
      doc.rect(unitStartX, yPos, unitBarMaxWidth, unitBarHeight, 'F');

      // Actual bar
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(unitStartX, yPos, barWidth, unitBarHeight, 'F');

      doc.setFont('helvetica', 'bold');
      doc.text(count.toString(), unitStartX + unitBarMaxWidth + 5, yPos + 7);

      yPos += unitBarHeight + 5;
    });

    yPos += 10;
  }

  // ===== IV. VISUALISASI GRAFIK KOMPARASI LAYANAN =====
  checkAddPage(100);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('IV. VISUALISASI GRAFIK KOMPARASI LAYANAN', 20, yPos);
  yPos += 10;

  // Grafik Batang Horizontal
  const maxValue = Math.max(data.kpi.totalComplaints, data.kpi.totalSuggestions, data.kpi.totalRequests, 1);
  const barMaxWidth = 120;
  const barHeight = 12;
  const startX = 80;

  // Pengaduan
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Pengaduan', 20, yPos + 8);
  doc.setFillColor(220, 38, 38);
  const complaintsWidth = (data.kpi.totalComplaints / maxValue) * barMaxWidth;
  doc.rect(startX, yPos, complaintsWidth, barHeight, 'F');
  doc.setFont('helvetica', 'normal');
  doc.text(data.kpi.totalComplaints.toString(), startX + complaintsWidth + 3, yPos + 8);
  yPos += barHeight + 8;

  // Saran
  doc.setFont('helvetica', 'bold');
  doc.text('Saran', 20, yPos + 8);
  doc.setFillColor(147, 51, 234);
  const suggestionsWidth = (data.kpi.totalSuggestions / maxValue) * barMaxWidth;
  doc.rect(startX, yPos, suggestionsWidth, barHeight, 'F');
  doc.setFont('helvetica', 'normal');
  doc.text(data.kpi.totalSuggestions.toString(), startX + suggestionsWidth + 3, yPos + 8);
  yPos += barHeight + 8;

  // Permintaan
  doc.setFont('helvetica', 'bold');
  doc.text('Permintaan', 20, yPos + 8);
  doc.setFillColor(37, 99, 235);
  const requestsWidth = (data.kpi.totalRequests / maxValue) * barMaxWidth;
  doc.rect(startX, yPos, requestsWidth, barHeight, 'F');
  doc.setFont('helvetica', 'normal');
  doc.text(data.kpi.totalRequests.toString(), startX + requestsWidth + 3, yPos + 8);
  yPos += barHeight + 15;

  // ===== V. TREN 7 HARI TERAKHIR =====
  if (data.trends && data.trends.length > 0) {
    checkAddPage(100);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('V. TREN 7 HARI TERAKHIR', 20, yPos);
    yPos += 10;

    const trendData = data.trends.map(t => {
      const percentage = t.complaints > 0 ? Math.round((t.resolved / t.complaints) * 100) : 0;
      return [t.date, t.complaints.toString(), t.resolved.toString(), `${percentage}%`];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Tanggal', 'Total Tiket', 'Terselesaikan', 'Persentase']],
      body: trendData,
      theme: 'striped',
      headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 40, halign: 'center' },
        1: { cellWidth: 40, halign: 'center', fontStyle: 'bold' },
        2: { cellWidth: 40, halign: 'center', fontStyle: 'bold', textColor: [34, 197, 94] },
        3: { cellWidth: 40, halign: 'center', fontStyle: 'bold', textColor: [19, 127, 236] }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 12;

    // Grafik Garis Tren
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Visualisasi Grafik Tren:', 20, yPos);
    yPos += 8;

    // Gambar grafik garis sederhana
    const graphHeight = 60;
    const graphWidth = 160;
    const graphStartX = 20;
    const graphStartY = yPos;
    const maxTrendValue = Math.max(...data.trends.map(t => Math.max(t.complaints, t.resolved)), 1);

    // Border grafik
    doc.setDrawColor(200, 200, 200);
    doc.rect(graphStartX, graphStartY, graphWidth, graphHeight);

    // Grid horizontal
    for (let i = 0; i <= 4; i++) {
      const y = graphStartY + (graphHeight / 4) * i;
      doc.setDrawColor(230, 230, 230);
      doc.line(graphStartX, y, graphStartX + graphWidth, y);
    }

    // Plot data
    data.trends.forEach((trend, index) => {
      const x = graphStartX + (graphWidth / (data.trends.length - 1)) * index;
      const complaintsY = graphStartY + graphHeight - (trend.complaints / maxTrendValue) * graphHeight;
      const resolvedY = graphStartY + graphHeight - (trend.resolved / maxTrendValue) * graphHeight;

      // Titik complaints (biru)
      doc.setFillColor(37, 99, 235);
      doc.circle(x, complaintsY, 2, 'F');

      // Titik resolved (hijau)
      doc.setFillColor(34, 197, 94);
      doc.circle(x, resolvedY, 2, 'F');

      // Garis penghubung
      if (index > 0) {
        const prevX = graphStartX + (graphWidth / (data.trends.length - 1)) * (index - 1);
        const prevComplaintsY = graphStartY + graphHeight - (data.trends[index - 1].complaints / maxTrendValue) * graphHeight;
        const prevResolvedY = graphStartY + graphHeight - (data.trends[index - 1].resolved / maxTrendValue) * graphHeight;

        doc.setDrawColor(37, 99, 235);
        doc.line(prevX, prevComplaintsY, x, complaintsY);

        doc.setDrawColor(34, 197, 94);
        doc.line(prevX, prevResolvedY, x, resolvedY);
      }

      // Label tanggal
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(trend.date, x, graphStartY + graphHeight + 5, { align: 'center' });
    });

    // Legend
    yPos = graphStartY + graphHeight + 12;
    doc.setFontSize(8);
    doc.setFillColor(37, 99, 235);
    doc.circle(25, yPos, 2, 'F');
    doc.setTextColor(0, 0, 0);
    doc.text('Total Tiket', 30, yPos + 1);

    doc.setFillColor(34, 197, 94);
    doc.circle(70, yPos, 2, 'F');
    doc.text('Terselesaikan', 75, yPos + 1);

    yPos += 15;
  }

  // ===== VI. DISTRIBUSI PER KATEGORI LAYANAN =====
  if (data.categoryTrends && data.categoryTrends.length > 0) {
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('VI. DISTRIBUSI PER KATEGORI LAYANAN', 20, yPos);
    yPos += 10;

    const categoryData = data.categoryTrends.slice(0, 15).map((cat, idx) => [
      (idx + 1).toString(),
      cat.categoryName,
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
        1: { cellWidth: 90 },
        2: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 30, halign: 'center', fontStyle: 'bold', textColor: [19, 127, 236] }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 12;

    // Grafik Batang Kategori
    checkAddPage(80);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Visualisasi Grafik Kategori:', 20, yPos);
    yPos += 8;

    const topCategories = data.categoryTrends.slice(0, 5);
    const maxCatValue = Math.max(...topCategories.map(c => c.count), 1);
    const catBarMaxWidth = 140;

    topCategories.forEach((cat, idx) => {
      const barWidth = (cat.count / maxCatValue) * catBarMaxWidth;
      const colors = [
        [37, 99, 235],
        [147, 51, 234],
        [236, 72, 153],
        [239, 68, 68],
        [249, 115, 22]
      ];
      const color = colors[idx % colors.length];

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const catName = cat.categoryName.length > 25 ? cat.categoryName.substring(0, 22) + '...' : cat.categoryName;
      doc.text(catName, 20, yPos + 5);

      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(70, yPos, barWidth, 8, 'F');

      doc.setFont('helvetica', 'bold');
      doc.text(`${cat.count} (${cat.percentage}%)`, 70 + barWidth + 3, yPos + 5);

      yPos += 12;
    });

    yPos += 10;
  }

  // ===== VII. DISTRIBUSI PER JENIS PASIEN =====
  if (data.patientTypeTrends && data.patientTypeTrends.length > 0) {
    checkAddPage(80);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('VII. DISTRIBUSI PER JENIS PASIEN', 20, yPos);
    yPos += 10;

    const patientData = data.patientTypeTrends.map((pt, idx) => [
      (idx + 1).toString(),
      pt.patientTypeName,
      pt.count.toString(),
      `${pt.percentage}%`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['No', 'Jenis Pasien', 'Jumlah', 'Persentase']],
      body: patientData,
      theme: 'striped',
      headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 90 },
        2: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 30, halign: 'center', fontStyle: 'bold', textColor: [19, 127, 236] }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // ===== VIII. DETAIL LAPORAN TIKET =====
  if (data.detailedReports && data.detailedReports.length > 0) {
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('VIII. DETAIL LAPORAN TIKET', 20, yPos);
    yPos += 10;

    const detailData = data.detailedReports.slice(0, 100).map((r, idx) => {
      // Potong text yang terlalu panjang untuk mencegah overflow
      const unitName = r.unitName.length > 18 ? r.unitName.substring(0, 15) + '...' : r.unitName;
      const categoryName = r.categoryName.length > 18 ? r.categoryName.substring(0, 15) + '...' : r.categoryName;
      const patientType = r.patientTypeName ? (r.patientTypeName.length > 15 ? r.patientTypeName.substring(0, 12) + '...' : r.patientTypeName) : '-';
      
      return [
        (idx + 1).toString(),
        r.ticketNumber,
        r.date,
        unitName,
        categoryName,
        patientType,
        getStatusLabel(r.status),
        r.responseTime !== null ? `${r.responseTime}m` : '-'
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['No', 'ID Tiket', 'Tanggal', 'Unit', 'Kategori', 'Jenis Pasien', 'Status', 'Respon']],
      body: detailData,
      theme: 'striped',
      headStyles: { 
        fillColor: [19, 127, 236], 
        fontSize: 8, 
        fontStyle: 'bold', 
        halign: 'center',
        cellPadding: 2
      },
      styles: { 
        fontSize: 7, 
        cellPadding: 2,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 22, overflow: 'linebreak' },
        2: { cellWidth: 20, overflow: 'linebreak' },
        3: { cellWidth: 28, overflow: 'linebreak' },
        4: { cellWidth: 28, overflow: 'linebreak' },
        5: { cellWidth: 22, overflow: 'linebreak' },
        6: { cellWidth: 18, halign: 'center', overflow: 'linebreak' },
        7: { cellWidth: 16, halign: 'center' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    if (data.detailedReports.length > 100) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`Menampilkan 100 dari ${data.detailedReports.length} total tiket`, 20, yPos);
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
      'Laporan Analitik Layanan - KISS',
      20,
      pageHeight - 10
    );
  }

  const fileName = `Laporan_Layanan_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
