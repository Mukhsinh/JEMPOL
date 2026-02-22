import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SurveyStats {
  total_surveys: number;
  total_responses: number;
  average_completion_rate: number;
  active_surveys: number;
  ikm_score?: number;
  nps_score?: number;
  response_rate?: number;
  average_q1?: number;
  average_q2?: number;
  average_q3?: number;
  average_q4?: number;
  average_q5?: number;
  average_q6?: number;
  average_q7?: number;
  average_q8?: number;
  average_q9?: number;
  average_q10?: number;
  average_q11?: number;
}

interface SurveyResponse {
  id: string;
  date: string;
  unit: string;
  visitor_name: string | null;
  visitor_phone: string;
  is_anonymous: boolean;
  average_rating: number;
  comments: string | null;
}

interface UnitIKM {
  unit_id: string;
  unit_name: string;
  total_responses: number;
  average_score: number;
  ikm_score: number;
}

interface AddressStats {
  name: string;
  count: number;
  percentage: number;
}

interface PDFData {
  stats: SurveyStats | null;
  responses: SurveyResponse[];
  unitIKM: UnitIKM[];
  addressStats: AddressStats[];
  dateRange: { start: string; end: string };
  unitName?: string;
}

const surveyQuestions = [
  { code: 'U1', title: 'Persyaratan' },
  { code: 'U2', title: 'Prosedur' },
  { code: 'U3', title: 'Waktu' },
  { code: 'U4', title: 'Biaya' },
  { code: 'U5', title: 'Produk' },
  { code: 'U6', title: 'Kompetensi' },
  { code: 'U7', title: 'Perilaku' },
  { code: 'U8', title: 'Penanganan Pengaduan' },
  { code: 'U9', title: 'Sarana & Prasarana' },
  { code: 'U10', title: 'Keamanan & Keselamatan' },
  { code: 'U11', title: 'Informasi Layanan' }
];

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

const getSentimentText = (rating: number) => {
  if (rating >= 4) return 'Positif';
  if (rating >= 3) return 'Netral';
  return 'Negatif';
};

export const generateSurveyReportPDF = (data: PDFData) => {
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

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN SURVEY KEPUASAN MASYARAKAT', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Analisis Komprehensif Kepuasan Masyarakat Terhadap Layanan Publik', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Periode Laporan:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatDate(data.dateRange.start)} - ${formatDate(data.dateRange.end)}`, 60, yPos);
  
  if (data.unitName) {
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Unit Kerja:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.unitName, 60, yPos);
  }
  
  yPos += 10;

  checkAddPage(40);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('I. RINGKASAN EKSEKUTIF', 20, yPos);
  yPos += 8;

  const kpiData = [
    ['Total Responden', (data.stats?.total_responses || data.responses.length).toLocaleString()],
    ['Indeks Kepuasan Masyarakat (IKM)', `${data.stats?.ikm_score?.toFixed(1) || '0'} / 100`],
    ['Net Promoter Score (NPS)', `${data.stats?.nps_score !== undefined ? (data.stats.nps_score >= 0 ? '+' : '') + data.stats.nps_score : '0'}`],
    ['Tingkat Respon', `${data.stats?.response_rate || '100'}%`]
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Indikator', 'Nilai']],
    body: kpiData,
    theme: 'grid',
    headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { halign: 'right', cellWidth: 'auto' }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  checkAddPage(120);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('II. SKOR PER UNSUR PELAYANAN (11 UNSUR)', 20, yPos);
  yPos += 8;

  const questionScores = surveyQuestions.map((q, idx) => {
    const statsKey = `average_q${idx + 1}` as keyof SurveyStats;
    const score = data.stats?.[statsKey] as number || 0;
    return [q.code, q.title, Number(score).toFixed(2)];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Kode', 'Unsur Pelayanan', 'Skor']],
    body: questionScores,
    theme: 'striped',
    headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 110 },
      2: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  checkAddPage(90);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Visualisasi Grafik Skor Per Unsur:', 20, yPos);
  yPos += 8;

  const maxScore = 5;
  const barHeight = 5;
  const barMaxWidth = 140;
  const startX = 55;

  questionScores.forEach((item, idx) => {
    const [code, , scoreStr] = item;
    const score = parseFloat(scoreStr);
    const barWidth = (score / maxScore) * barMaxWidth;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${code}`, 20, yPos + 4);
    
    doc.setFillColor(240, 240, 240);
    doc.rect(startX, yPos, barMaxWidth, barHeight, 'F');
    
    const color = score >= 3.5 ? [34, 197, 94] : score >= 3 ? [59, 130, 246] : score >= 2.5 ? [251, 191, 36] : [239, 68, 68];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(startX, yPos, barWidth, barHeight, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.text(scoreStr, startX + barMaxWidth + 5, yPos + 4);
    
    yPos += barHeight + 3;
    
    if (idx === 5) {
      checkAddPage(50);
    }
  });

  yPos += 10;

  checkAddPage(90);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('III. DISTRIBUSI NILAI SURVEY', 20, yPos);
  yPos += 8;

  const calculateDistribution = () => {
    if (data.responses.length === 0) return [];
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    data.responses.forEach(r => {
      const avg = Math.round(r.average_rating);
      if (avg >= 1 && avg <= 5) dist[avg as keyof typeof dist]++;
    });
    const total = data.responses.length;
    return [
      { label: 'Sangat Puas (5)', count: dist[5], pct: ((dist[5] / total) * 100).toFixed(1) },
      { label: 'Puas (4)', count: dist[4], pct: ((dist[4] / total) * 100).toFixed(1) },
      { label: 'Cukup (3)', count: dist[3], pct: ((dist[3] / total) * 100).toFixed(1) },
      { label: 'Kurang Puas (2)', count: dist[2], pct: ((dist[2] / total) * 100).toFixed(1) },
      { label: 'Tidak Puas (1)', count: dist[1], pct: ((dist[1] / total) * 100).toFixed(1) }
    ];
  };

  const distribution = calculateDistribution();
  const distributionData = distribution.map(d => [d.label, d.count.toString(), `${d.pct}%`]);

  autoTable(doc, {
    startY: yPos,
    head: [['Kategori', 'Jumlah', 'Persentase']],
    body: distributionData,
    theme: 'striped',
    headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 40, halign: 'center', fontStyle: 'bold' }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  if (distribution.length > 0) {
    checkAddPage(60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Visualisasi Grafik Distribusi:', 20, yPos);
    yPos += 8;

    const colors = [
      [34, 197, 94],
      [59, 130, 246],
      [251, 191, 36],
      [249, 115, 22],
      [239, 68, 68]
    ];

    distribution.forEach((item, idx) => {
      const barWidth = (parseFloat(item.pct) / 100) * 140;
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(item.label, 20, yPos + 4);
      
      doc.setFillColor(colors[idx][0], colors[idx][1], colors[idx][2]);
      doc.rect(85, yPos, barWidth, 5, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${item.pct}%`, 85 + barWidth + 3, yPos + 4);
      
      yPos += 8;
    });

    yPos += 5;
  }

  yPos += 10;

  if (data.unitIKM.length > 0) {
    checkAddPage(60);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('IV. KOMPARASI IKM PER UNIT KERJA', 20, yPos);
    yPos += 8;

    const unitIKMData = data.unitIKM.map((unit, idx) => [
      (idx + 1).toString(),
      unit.unit_name,
      unit.total_responses.toString(),
      unit.ikm_score.toFixed(2)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['No', 'Unit Kerja', 'Total Respon', 'Skor IKM']],
      body: unitIKMData,
      theme: 'striped',
      headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 90 },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  if (data.addressStats.length > 0) {
    checkAddPage(60);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('V. DISTRIBUSI RESPONDEN BERDASARKAN ALAMAT', 20, yPos);
    yPos += 8;

    const addressData = data.addressStats.slice(0, 15).map((addr, idx) => [
      (idx + 1).toString(),
      addr.name,
      addr.count.toString(),
      `${addr.percentage}%`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['No', 'Wilayah', 'Jumlah', 'Persentase']],
      body: addressData,
      theme: 'striped',
      headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 90 },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Analisis Komprehensif Kepuasan Masyarakat Terhadap Layanan Publik', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Periode Laporan:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(`${formatDate(data.dateRange.start)} - ${formatDate(data.dateRange.end)}`, 60, yPos);
  
  if (data.unitName) {
    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Unit Kerja:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.unitName, 60, yPos);
  }
  
  yPos += 10;

  checkAddPage(40);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('I. RINGKASAN EKSEKUTIF', 20, yPos);
  yPos += 8;

  const kpiData = [
    ['Total Responden', (data.stats?.total_responses || data.responses.length).toLocaleString()],
    ['Indeks Kepuasan Masyarakat (IKM)', `${data.stats?.ikm_score?.toFixed(1) || '0'} / 100`],
    ['Net Promoter Score (NPS)', `${data.stats?.nps_score !== undefined ? (data.stats.nps_score >= 0 ? '+' : '') + data.stats.nps_score : '0'}`],
    ['Tingkat Respon', `${data.stats?.response_rate || '100'}%`]
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Indikator', 'Nilai']],
    body: kpiData,
    theme: 'grid',
    headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { halign: 'right', cellWidth: 'auto' }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  checkAddPage(120);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('II. SKOR PER UNSUR PELAYANAN', 20, yPos);
  yPos += 8;

  const questionScores = surveyQuestions.map((q, idx) => {
    const statsKey = `average_q${idx + 1}` as keyof SurveyStats;
    const score = data.stats?.[statsKey] as number || 0;
    return [q.code, q.title, Number(score).toFixed(2)];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Kode', 'Unsur Pelayanan', 'Skor']],
    body: questionScores,
    theme: 'striped',
    headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center' },
      1: { cellWidth: 110 },
      2: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  checkAddPage(90);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Visualisasi Grafik Skor Per Unsur:', 20, yPos);
  yPos += 8;

  const maxScore = 5;
  const barHeight = 5;
  const barMaxWidth = 140;
  const startX = 55;

  questionScores.forEach((item, idx) => {
    const [code, , scoreStr] = item;
    const score = parseFloat(scoreStr);
    const barWidth = (score / maxScore) * barMaxWidth;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${code}`, 20, yPos + 4);
    
    doc.setFillColor(240, 240, 240);
    doc.rect(startX, yPos, barMaxWidth, barHeight, 'F');
    
    const color = score >= 3.5 ? [34, 197, 94] : score >= 3 ? [59, 130, 246] : score >= 2.5 ? [251, 191, 36] : [239, 68, 68];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(startX, yPos, barWidth, barHeight, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.text(scoreStr, startX + barMaxWidth + 5, yPos + 4);
    
    yPos += barHeight + 3;
    
    if (idx === 5) {
      checkAddPage(50);
    }
  });

  yPos += 10;

  checkAddPage(90);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('III. DISTRIBUSI NILAI SURVEY', 20, yPos);
  yPos += 8;

  const calculateDistribution = () => {
    if (data.responses.length === 0) return [];
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    data.responses.forEach(r => {
      const avg = Math.round(r.average_rating);
      if (avg >= 1 && avg <= 5) dist[avg as keyof typeof dist]++;
    });
    const total = data.responses.length;
    return [
      { label: 'Sangat Puas (5)', count: dist[5], pct: ((dist[5] / total) * 100).toFixed(1) },
      { label: 'Puas (4)', count: dist[4], pct: ((dist[4] / total) * 100).toFixed(1) },
      { label: 'Cukup (3)', count: dist[3], pct: ((dist[3] / total) * 100).toFixed(1) },
      { label: 'Kurang Puas (2)', count: dist[2], pct: ((dist[2] / total) * 100).toFixed(1) },
      { label: 'Tidak Puas (1)', count: dist[1], pct: ((dist[1] / total) * 100).toFixed(1) }
    ];
  };

  const distribution = calculateDistribution();
  const distributionData = distribution.map(d => [d.label, d.count.toString(), `${d.pct}%`]);

  autoTable(doc, {
    startY: yPos,
    head: [['Kategori', 'Jumlah', 'Persentase']],
    body: distributionData,
    theme: 'striped',
    headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 40, halign: 'center', fontStyle: 'bold' }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  if (distribution.length > 0) {
    checkAddPage(60);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Visualisasi Grafik Distribusi:', 20, yPos);
    yPos += 8;

    const colors = [
      [34, 197, 94],
      [59, 130, 246],
      [251, 191, 36],
      [249, 115, 22],
      [239, 68, 68]
    ];

    distribution.forEach((item, idx) => {
      const barWidth = (parseFloat(item.pct) / 100) * 140;
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(item.label, 20, yPos + 4);
      
      doc.setFillColor(colors[idx][0], colors[idx][1], colors[idx][2]);
      doc.rect(85, yPos, barWidth, 5, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${item.pct}%`, 85 + barWidth + 3, yPos + 4);
      
      yPos += 8;
    });

    yPos += 5;
  }

  yPos += 10;

  if (data.responses.length > 0) {
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('VI. DATA DETAIL RESPONDEN', 20, yPos);
    yPos += 8;

    const responseData = data.responses.slice(0, 50).map((r, idx) => [
      (idx + 1).toString(),
      formatDate(r.date),
      r.is_anonymous ? 'Anonim' : (r.visitor_name || '-'),
      r.unit || '-',
      r.average_rating.toFixed(1),
      getSentimentText(r.average_rating)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['No', 'Tanggal', 'Responden', 'Unit', 'Rating', 'Sentimen']],
      body: responseData,
      theme: 'striped',
      headStyles: { fillColor: [19, 127, 236], fontSize: 9, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 35 },
        2: { cellWidth: 40 },
        3: { cellWidth: 35 },
        4: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 28, halign: 'center' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    if (data.responses.length > 50) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`Menampilkan 50 dari ${data.responses.length} total responden`, 20, yPos);
    }
  }

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
      `Dicetak pada: ${new Date().toLocaleDateString('id-ID', { 
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
  }

  const fileName = `Laporan_Survey_${data.dateRange.start}_${data.dateRange.end}.pdf`;
  doc.save(fileName);
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

const getSentimentText = (rating: number) => {
  if (rating >= 4) return 'Positif';
  if (rating >= 3) return 'Netral';
  return 'Negatif';
};

  if (data.unitIKM.length > 0) {
    checkAddPage(60);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('IV. KOMPARASI IKM PER UNIT KERJA', 20, yPos);
    yPos += 8;

    const unitIKMData = data.unitIKM.map((unit, idx) => [
      (idx + 1).toString(),
      unit.unit_name,
      unit.total_responses.toString(),
      unit.ikm_score.toFixed(2)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['No', 'Unit Kerja', 'Total Respon', 'Skor IKM']],
      body: unitIKMData,
      theme: 'striped',
      headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 90 },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  if (data.addressStats.length > 0) {
    checkAddPage(60);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('V. DISTRIBUSI RESPONDEN BERDASARKAN ALAMAT', 20, yPos);
    yPos += 8;

    const addressData = data.addressStats.slice(0, 15).map((addr, idx) => [
      (idx + 1).toString(),
      addr.name,
      addr.count.toString(),
      `${addr.percentage}%`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['No', 'Wilayah', 'Jumlah', 'Persentase']],
      body: addressData,
      theme: 'striped',
      headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 90 },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  if (data.responses.length > 0) {
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('VI. DATA DETAIL RESPONDEN', 20, yPos);
    yPos += 8;

    const responseData = data.responses.slice(0, 50).map((r, idx) => [
      (idx + 1).toString(),
      formatDate(r.date),
      r.is_anonymous ? 'Anonim' : (r.visitor_name || '-'),
      r.unit || '-',
      r.average_rating.toFixed(1),
      getSentimentText(r.average_rating)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['No', 'Tanggal', 'Responden', 'Unit', 'Rating', 'Sentimen']],
      body: responseData,
      theme: 'striped',
      headStyles: { fillColor: [19, 127, 236], fontSize: 9, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 35 },
        2: { cellWidth: 40 },
        3: { cellWidth: 35 },
        4: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 28, halign: 'center' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    if (data.responses.length > 50) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`Menampilkan 50 dari ${data.responses.length} total responden`, 20, yPos);
    }
  }

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
      `Dicetak pada: ${new Date().toLocaleDateString('id-ID', { 
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
  }

  const fileName = `Laporan_Survey_${data.dateRange.start}_${data.dateRange.end}.pdf`;
  doc.save(fileName);
};
