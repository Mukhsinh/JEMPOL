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

export const generateSurveyReportPDF = (data: PDFData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  const surveyQuestions = [
    { code: 'U1', title: 'Persyaratan', description: 'Kemudahan memenuhi persyaratan' },
    { code: 'U2', title: 'Prosedur', description: 'Kejelasan prosedur pelayanan' },
    { code: 'U3', title: 'Waktu', description: 'Kecepatan waktu pelayanan' },
    { code: 'U4', title: 'Biaya', description: 'Kewajaran biaya pelayanan' },
    { code: 'U5', title: 'Produk', description: 'Kesesuaian produk layanan' },
    { code: 'U6', title: 'Kompetensi', description: 'Kemampuan petugas' },
    { code: 'U7', title: 'Perilaku', description: 'Kesopanan petugas' },
    { code: 'U8', title: 'Penanganan Pengaduan', description: 'Penanganan pengaduan' },
    { code: 'U9', title: 'Sarana & Prasarana', description: 'Kualitas sarana prasarana' },
    { code: 'U10', title: 'Keamanan & Keselamatan', description: 'Jaminan keamanan' },
    { code: 'U11', title: 'Informasi Layanan', description: 'Kejelasan informasi' }
  ];

  // Kategori jawaban survey (skala 1-4)
  const answerCategories = [
    { value: 4, label: 'Sangat Baik', color: [34, 197, 94] },
    { value: 3, label: 'Baik', color: [59, 130, 246] },
    { value: 2, label: 'Kurang Baik', color: [251, 191, 36] },
    { value: 1, label: 'Tidak Baik', color: [239, 68, 68] }
  ];

  const formatDateLong = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getSentimentText = (rating: number) => {
    if (rating >= 3.5) return 'Sangat Puas';
    if (rating >= 3) return 'Puas';
    if (rating >= 2) return 'Kurang Puas';
    return 'Tidak Puas';
  };

  const getScoreInterpretation = (score: number) => {
    if (score >= 3.5) return 'Sangat Baik';
    if (score >= 3.0) return 'Baik';
    if (score >= 2.0) return 'Kurang Baik';
    return 'Tidak Baik';
  };

  const getIKMCategory = (ikm: number) => {
    if (ikm >= 88.31) return 'A - Sangat Baik';
    if (ikm >= 76.61) return 'B - Baik';
    if (ikm >= 65.00) return 'C - Kurang Baik';
    return 'D - Tidak Baik';
  };

  const getNPSCategory = (nps: number) => {
    if (nps >= 50) return 'Excellent (Luar Biasa)';
    if (nps >= 30) return 'Great (Sangat Baik)';
    if (nps >= 10) return 'Good (Baik)';
    if (nps >= 0) return 'Needs Improvement (Perlu Perbaikan)';
    return 'Critical (Kritis)';
  };

  const checkAddPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  // HALAMAN COVER
  doc.setFillColor(19, 127, 236);
  doc.rect(0, 0, pageWidth, 80, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN SURVEY', pageWidth / 2, 30, { align: 'center' });
  doc.text('KEPUASAN MASYARAKAT', pageWidth / 2, 42, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Analisis Komprehensif Kepuasan Masyarakat', pageWidth / 2, 55, { align: 'center' });
  doc.text('Terhadap Layanan Publik', pageWidth / 2, 63, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  yPos = 100;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Periode Laporan:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  const periodText = `${formatDateLong(data.dateRange.start)} s/d ${formatDateLong(data.dateRange.end)}`;
  doc.text(periodText, 20, yPos + 6);
  
  if (data.unitName) {
    yPos += 18;
    doc.setFont('helvetica', 'bold');
    doc.text('Unit Kerja:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.unitName, 20, yPos + 6);
  }
  
  yPos += 18;
  doc.setFont('helvetica', 'bold');
  doc.text('Tanggal Cetak:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDateLong(new Date().toISOString()), 20, yPos + 6);

  // I. RINGKASAN EKSEKUTIF
  doc.addPage();
  yPos = 20;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('I. RINGKASAN EKSEKUTIF', 20, yPos);
  yPos += 10;

  const ikmScore = data.stats?.ikm_score || 0;
  const ikmCategory = getIKMCategory(ikmScore);
  const totalResponses = data.stats?.total_responses || data.responses.length;
  const npsScore = data.stats?.nps_score || 0;
  const npsCategory = getNPSCategory(npsScore);

  const kpiData = [
    ['Total Responden', totalResponses.toLocaleString('id-ID')],
    ['Indeks Kepuasan Masyarakat (IKM)', `${ikmScore.toFixed(2)} / 100`],
    ['Kategori Mutu Pelayanan', ikmCategory],
    ['Net Promoter Score (NPS)', `${npsScore >= 0 ? '+' : ''}${npsScore}`],
    ['Kategori NPS', npsCategory],
    ['Tingkat Respon', `${data.stats?.response_rate || '100'}%`]
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Indikator Kinerja', 'Nilai']],
    body: kpiData,
    theme: 'grid',
    headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold', halign: 'center' },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 110 },
      1: { halign: 'right', cellWidth: 'auto', fontStyle: 'bold', textColor: [19, 127, 236] }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 12;

  // Definisi NPS
  checkAddPage(50);
  doc.setFillColor(240, 248, 255);
  doc.rect(20, yPos, pageWidth - 40, 45, 'F');
  doc.setDrawColor(19, 127, 236);
  doc.rect(20, yPos, pageWidth - 40, 45);
  
  yPos += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Definisi Net Promoter Score (NPS):', 25, yPos);
  yPos += 6;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const npsDefinition = doc.splitTextToSize(
    'NPS adalah metrik yang mengukur loyalitas pelanggan dengan menanyakan seberapa besar kemungkinan mereka ' +
    'merekomendasikan layanan kepada orang lain. Skor dihitung dari persentase Promoter (skor 9-10) dikurangi ' +
    'persentase Detractor (skor 0-6). Nilai NPS berkisar dari -100 hingga +100.',
    pageWidth - 50
  );
  doc.text(npsDefinition, 25, yPos);
  yPos += npsDefinition.length * 4 + 4;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Kategori NPS:', 25, yPos);
  doc.setFont('helvetica', 'normal');
  yPos += 4;
  doc.text('• Excellent (≥50): Luar biasa  • Great (30-49): Sangat baik  • Good (10-29): Baik', 25, yPos);
  yPos += 4;
  doc.text('• Needs Improvement (0-9): Perlu perbaikan  • Critical (<0): Kritis', 25, yPos);
  
  yPos += 15;

  // Interpretasi IKM
  checkAddPage(35);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Interpretasi Hasil:', 20, yPos);
  yPos += 6;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const interpretation = doc.splitTextToSize(
    `Berdasarkan hasil survey kepuasan masyarakat periode ${formatDateShort(data.dateRange.start)} hingga ` +
    `${formatDateShort(data.dateRange.end)}, diperoleh Indeks Kepuasan Masyarakat (IKM) sebesar ${ikmScore.toFixed(2)} ` +
    `yang termasuk dalam kategori "${ikmCategory}". Hasil ini diperoleh dari ${totalResponses} responden yang telah ` +
    `memberikan penilaian terhadap 11 unsur pelayanan dengan skala 1-4.`,
    pageWidth - 40
  );
  doc.text(interpretation, 20, yPos);
  yPos += interpretation.length * 4.5 + 12;

  // II. SKOR PER UNSUR PELAYANAN
  checkAddPage(140);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('II. ANALISIS SKOR PER UNSUR PELAYANAN', 20, yPos);
  yPos += 10;

  const questionScores = surveyQuestions.map((q, idx) => {
    const statsKey = `average_q${idx + 1}` as keyof SurveyStats;
    const score = data.stats?.[statsKey] as number || 0;
    const interpretation = getScoreInterpretation(score);
    return [q.code, q.title, Number(score).toFixed(2), interpretation];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Kode', 'Unsur Pelayanan', 'Skor Rata-rata', 'Interpretasi']],
    body: questionScores,
    theme: 'striped',
    headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold', halign: 'center' },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 70 },
      2: { cellWidth: 28, halign: 'center', fontStyle: 'bold', textColor: [19, 127, 236] },
      3: { cellWidth: 50, halign: 'center' }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Grafik Batang Skor
  checkAddPage(100);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Visualisasi Grafik Skor Per Unsur:', 20, yPos);
  yPos += 10;

  const maxScore = 5;
  const barHeight = 6;
  const barMaxWidth = 130;
  const startX = 60;

  questionScores.forEach((item, idx) => {
    const [code, title, scoreStr] = item;
    const score = parseFloat(scoreStr);
    const barWidth = (score / maxScore) * barMaxWidth;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`${code}`, 20, yPos + 4.5);
    doc.text(`${title}`, 28, yPos + 4.5);
    
    doc.setFillColor(240, 240, 240);
    doc.rect(startX, yPos, barMaxWidth, barHeight, 'F');
    
    const color = score >= 4.5 ? [34, 197, 94] : score >= 4 ? [59, 130, 246] : score >= 3.5 ? [251, 191, 36] : score >= 3 ? [249, 115, 22] : [239, 68, 68];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(startX, yPos, barWidth, barHeight, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.text(scoreStr, startX + barMaxWidth + 3, yPos + 4.5);
    
    yPos += barHeight + 4;
    
    if (idx === 5 || idx === 10) {
      checkAddPage(60);
    }
  });

  yPos += 10;

  // Keterangan Warna
  checkAddPage(25);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Keterangan:', 20, yPos);
  yPos += 5;
  
  const legends = [
    { color: [34, 197, 94], label: '≥ 4.5 = Sangat Baik' },
    { color: [59, 130, 246], label: '4.0 - 4.4 = Baik' },
    { color: [251, 191, 36], label: '3.5 - 3.9 = Cukup Baik' },
    { color: [249, 115, 22], label: '3.0 - 3.4 = Perlu Perbaikan' },
    { color: [239, 68, 68], label: '< 3.0 = Perlu Perbaikan Serius' }
  ];

  legends.forEach((legend, idx) => {
    doc.setFillColor(legend.color[0], legend.color[1], legend.color[2]);
    doc.rect(25 + (idx * 35), yPos, 4, 4, 'F');
    doc.setFont('helvetica', 'normal');
    doc.text(legend.label, 30 + (idx * 35), yPos + 3);
  });

  yPos += 15;

  // III. DISTRIBUSI NILAI PER UNSUR PELAYANAN
  doc.addPage();
  yPos = 20;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('III. DISTRIBUSI NILAI PER UNSUR PELAYANAN', 20, yPos);
  yPos += 8;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('Catatan: Setiap unsur memiliki 4 kategori jawaban (1=Tidak Baik, 2=Kurang Baik, 3=Baik, 4=Sangat Baik)', 20, yPos);
  yPos += 10;

  // Hitung distribusi per unsur
  surveyQuestions.forEach((q, qIdx) => {
    checkAddPage(45);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${q.code}. ${q.title}`, 20, yPos);
    yPos += 6;

    // Hitung distribusi untuk unsur ini
    const distribution = { 4: 0, 3: 0, 2: 0, 1: 0 };
    const questionKey = `q${qIdx + 1}_score` as any;
    
    data.responses.forEach(r => {
      const score = (r as any)[questionKey];
      if (score >= 1 && score <= 4) {
        distribution[score as keyof typeof distribution]++;
      }
    });

    const total = data.responses.length || 1;
    const distData = answerCategories.map(cat => {
      const count = distribution[cat.value as keyof typeof distribution];
      const pct = ((count / total) * 100).toFixed(1);
      return [cat.label, count.toString(), `${pct}%`];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Kategori', 'Jumlah', 'Persentase']],
      body: distData,
      theme: 'plain',
      headStyles: { fillColor: [19, 127, 236], fontSize: 8, fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 7.5, cellPadding: 2.5 },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 30, halign: 'center', fontStyle: 'bold', textColor: [19, 127, 236] }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 8;
  });

  // IV. VISUALISASI GRAFIK DISTRIBUSI PER UNSUR
  doc.addPage();
  yPos = 20;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('IV. VISUALISASI GRAFIK DISTRIBUSI PER UNSUR', 20, yPos);
  yPos += 10;

  surveyQuestions.forEach((q, qIdx) => {
    checkAddPage(35);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${q.code}. ${q.title}`, 20, yPos);
    yPos += 5;

    // Hitung distribusi
    const distribution = { 4: 0, 3: 0, 2: 0, 1: 0 };
    const questionKey = `q${qIdx + 1}_score` as any;
    
    data.responses.forEach(r => {
      const score = (r as any)[questionKey];
      if (score >= 1 && score <= 4) {
        distribution[score as keyof typeof distribution]++;
      }
    });

    const total = data.responses.length || 1;

    // Gambar grafik batang horizontal
    answerCategories.forEach((cat) => {
      const count = distribution[cat.value as keyof typeof distribution];
      const pct = (count / total) * 100;
      const barWidth = (pct / 100) * 120;
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(cat.label, 20, yPos + 3.5);
      
      doc.setFillColor(cat.color[0], cat.color[1], cat.color[2]);
      doc.rect(60, yPos, barWidth, 4.5, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${count} (${pct.toFixed(1)}%)`, 60 + barWidth + 2, yPos + 3.5);
      
      yPos += 5.5;
    });

    yPos += 4;
  });

  // V. DISTRIBUSI NILAI SURVEY KESELURUHAN
  doc.addPage();
  yPos = 20;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('V. DISTRIBUSI NILAI SURVEY KESELURUHAN', 20, yPos);
  yPos += 10;

  const calculateOverallDistribution = () => {
    if (data.responses.length === 0) return [];
    const dist = { 4: 0, 3: 0, 2: 0, 1: 0 };
    data.responses.forEach(r => {
      const avg = Math.round(r.average_rating);
      if (avg >= 1 && avg <= 4) dist[avg as keyof typeof dist]++;
    });
    const total = data.responses.length;
    return answerCategories.map(cat => ({
      label: cat.label,
      count: dist[cat.value as keyof typeof dist],
      pct: ((dist[cat.value as keyof typeof dist] / total) * 100).toFixed(1)
    }));
  };

  const overallDistribution = calculateOverallDistribution();
  const overallDistData = overallDistribution.map(d => [d.label, d.count.toString(), `${d.pct}%`]);

  autoTable(doc, {
    startY: yPos,
    head: [['Kategori Kepuasan', 'Jumlah Responden', 'Persentase']],
    body: overallDistData,
    theme: 'striped',
    headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold', halign: 'center' },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 70, fontStyle: 'bold' },
      1: { cellWidth: 40, halign: 'center' },
      2: { cellWidth: 40, halign: 'center', fontStyle: 'bold', textColor: [19, 127, 236] }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 12;

  // Grafik Distribusi Keseluruhan
  if (overallDistribution.length > 0) {
    checkAddPage(60);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Visualisasi Grafik Distribusi Keseluruhan:', 20, yPos);
    yPos += 8;

    overallDistribution.forEach((item, idx) => {
      const barWidth = (parseFloat(item.pct) / 100) * 120;
      
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(item.label, 20, yPos + 4);
      
      doc.setFillColor(answerCategories[idx].color[0], answerCategories[idx].color[1], answerCategories[idx].color[2]);
      doc.rect(70, yPos, barWidth, 5.5, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${item.count} (${item.pct}%)`, 70 + barWidth + 2, yPos + 4);
      
      yPos += 8;
    });

    yPos += 8;
  }

  // VI. KOMPARASI IKM PER UNIT KERJA
  if (data.unitIKM.length > 0) {
    checkAddPage(80);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('VI. KOMPARASI IKM PER UNIT KERJA', 20, yPos);
    yPos += 10;

    const unitIKMData = data.unitIKM.map((unit, idx) => [
      (idx + 1).toString(),
      unit.unit_name,
      unit.total_responses.toString(),
      unit.average_score.toFixed(2),
      unit.ikm_score.toFixed(2),
      getIKMCategory(unit.ikm_score)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['No', 'Unit Kerja', 'Responden', 'Rata-rata', 'Skor IKM', 'Kategori']],
      body: unitIKMData,
      theme: 'striped',
      headStyles: { fillColor: [19, 127, 236], fontSize: 9, fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 8, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 65 },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
        4: { cellWidth: 22, halign: 'center', fontStyle: 'bold', textColor: [19, 127, 236] },
        5: { cellWidth: 35, halign: 'center', fontSize: 7 }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  // VII. DISTRIBUSI RESPONDEN BERDASARKAN ALAMAT
  if (data.addressStats.length > 0) {
    checkAddPage(80);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('VII. DISTRIBUSI RESPONDEN BERDASARKAN ALAMAT', 20, yPos);
    yPos += 10;

    const addressData = data.addressStats.slice(0, 20).map((addr, idx) => [
      (idx + 1).toString(),
      addr.name,
      addr.count.toString(),
      `${addr.percentage}%`
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['No', 'Wilayah/Alamat', 'Jumlah', 'Persentase']],
      body: addressData,
      theme: 'striped',
      headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 100 },
        2: { cellWidth: 30, halign: 'center' },
        3: { cellWidth: 30, halign: 'center', fontStyle: 'bold', textColor: [19, 127, 236] }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    if (data.addressStats.length > 20) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`Menampilkan 20 dari ${data.addressStats.length} total wilayah`, 20, yPos);
    }
    yPos += 15;
  }

  // VIII. DATA DETAIL RESPONDEN
  if (data.responses.length > 0) {
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('VIII. DATA DETAIL RESPONDEN', 20, yPos);
    yPos += 10;

    const responseData = data.responses.slice(0, 100).map((r, idx) => [
      (idx + 1).toString(),
      formatDateShort(r.date),
      r.is_anonymous ? 'Anonim' : (r.visitor_name || '-'),
      r.visitor_phone || '-',
      r.unit || '-',
      r.average_rating.toFixed(2),
      getSentimentText(r.average_rating)
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['No', 'Tanggal', 'Nama', 'Telepon', 'Unit', 'Rating', 'Sentimen']],
      body: responseData,
      theme: 'striped',
      headStyles: { fillColor: [19, 127, 236], fontSize: 8, fontStyle: 'bold', halign: 'center' },
      styles: { fontSize: 7, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 25 },
        2: { cellWidth: 35 },
        3: { cellWidth: 30 },
        4: { cellWidth: 35 },
        5: { cellWidth: 18, halign: 'center', fontStyle: 'bold', textColor: [19, 127, 236] },
        6: { cellWidth: 28, halign: 'center' }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    if (data.responses.length > 100) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`Menampilkan 100 dari ${data.responses.length} total responden`, 20, yPos);
    }
  }

  // FOOTER DI SETIAP HALAMAN
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
      'Laporan Survey Kepuasan Masyarakat',
      20,
      pageHeight - 10
    );
  }

  const fileName = `Laporan_Survey_${data.dateRange.start}_${data.dateRange.end}.pdf`;
  doc.save(fileName);
};

// Interface untuk Internal Ticket PDF
interface InternalTicketData {
  ticket_number: string;
  reporter_name: string;
  reporter_phone: string;
  reporter_email?: string;
  unit_name?: string;
  issue_category?: string;
  priority?: string;
  description: string;
  created_at?: string;
}

// Fungsi untuk download PDF tiket internal
export const downloadInternalTicketPDF = (ticketData: InternalTicketData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Tiket Internal', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`No. Tiket: ${ticketData.ticket_number}`, pageWidth / 2, 30, { align: 'center' });
  
  // Detail tiket
  let yPos = 45;
  const lineHeight = 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Informasi Pelapor:', 15, yPos);
  yPos += lineHeight;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Nama: ${ticketData.reporter_name}`, 20, yPos);
  yPos += lineHeight;
  doc.text(`Telepon: ${ticketData.reporter_phone}`, 20, yPos);
  yPos += lineHeight;
  
  if (ticketData.reporter_email) {
    doc.text(`Email: ${ticketData.reporter_email}`, 20, yPos);
    yPos += lineHeight;
  }
  
  if (ticketData.unit_name) {
    doc.text(`Unit: ${ticketData.unit_name}`, 20, yPos);
    yPos += lineHeight;
  }
  
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Detail Masalah:', 15, yPos);
  yPos += lineHeight;
  
  doc.setFont('helvetica', 'normal');
  if (ticketData.issue_category) {
    doc.text(`Kategori: ${ticketData.issue_category}`, 20, yPos);
    yPos += lineHeight;
  }
  
  if (ticketData.priority) {
    doc.text(`Prioritas: ${ticketData.priority}`, 20, yPos);
    yPos += lineHeight;
  }
  
  doc.text('Deskripsi:', 20, yPos);
  yPos += lineHeight;
  
  // Split description untuk multiple lines
  const splitDescription = doc.splitTextToSize(ticketData.description, pageWidth - 40);
  doc.text(splitDescription, 20, yPos);
  yPos += splitDescription.length * lineHeight;
  
  if (ticketData.created_at) {
    yPos += 10;
    doc.setFontSize(8);
    doc.text(`Dibuat: ${new Date(ticketData.created_at).toLocaleString('id-ID')}`, 15, yPos);
  }
  
  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Dokumen ini dibuat secara otomatis oleh sistem', pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  // Download
  doc.save(`Tiket_${ticketData.ticket_number}.pdf`);
};

// Interface untuk External Ticket PDF
interface ExternalTicketData {
  ticket_number: string;
  visitor_name: string;
  visitor_phone: string;
  visitor_email?: string;
  issue_category?: string;
  priority?: string;
  description: string;
  created_at?: string;
}

// Fungsi untuk download PDF tiket eksternal
export const downloadExternalTicketPDF = (ticketData: ExternalTicketData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Tiket Pengaduan Masyarakat', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`No. Tiket: ${ticketData.ticket_number}`, pageWidth / 2, 30, { align: 'center' });
  
  // Detail tiket
  let yPos = 45;
  const lineHeight = 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Informasi Pelapor:', 15, yPos);
  yPos += lineHeight;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Nama: ${ticketData.visitor_name}`, 20, yPos);
  yPos += lineHeight;
  doc.text(`Telepon: ${ticketData.visitor_phone}`, 20, yPos);
  yPos += lineHeight;
  
  if (ticketData.visitor_email) {
    doc.text(`Email: ${ticketData.visitor_email}`, 20, yPos);
    yPos += lineHeight;
  }
  
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Detail Pengaduan:', 15, yPos);
  yPos += lineHeight;
  
  doc.setFont('helvetica', 'normal');
  if (ticketData.issue_category) {
    doc.text(`Kategori: ${ticketData.issue_category}`, 20, yPos);
    yPos += lineHeight;
  }
  
  if (ticketData.priority) {
    doc.text(`Prioritas: ${ticketData.priority}`, 20, yPos);
    yPos += lineHeight;
  }
  
  doc.text('Deskripsi:', 20, yPos);
  yPos += lineHeight;
  
  // Split description untuk multiple lines
  const splitDescription = doc.splitTextToSize(ticketData.description, pageWidth - 40);
  doc.text(splitDescription, 20, yPos);
  yPos += splitDescription.length * lineHeight;
  
  if (ticketData.created_at) {
    yPos += 10;
    doc.setFontSize(8);
    doc.text(`Dibuat: ${new Date(ticketData.created_at).toLocaleString('id-ID')}`, 15, yPos);
  }
  
  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Dokumen ini dibuat secara otomatis oleh sistem', pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  // Download
  doc.save(`Tiket_${ticketData.ticket_number}.pdf`);
};

// Interface untuk Survey PDF
interface SurveyPDFData {
  survey_id?: string;
  visitor_name: string;
  visitor_phone: string;
  unit_name?: string;
  q1_score?: number;
  q2_score?: number;
  q3_score?: number;
  q4_score?: number;
  q5_score?: number;
  q6_score?: number;
  q7_score?: number;
  q8_score?: number;
  q9_score?: number;
  q10_score?: number;
  q11_score?: number;
  overall_score?: number;
  comments?: string;
  created_at?: string;
}

// Fungsi untuk download PDF survei
export const downloadSurveyPDF = (surveyData: SurveyPDFData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Bukti Survei Kepuasan', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (surveyData.survey_id) {
    doc.text(`ID: ${surveyData.survey_id}`, pageWidth / 2, 28, { align: 'center' });
  }
  
  // Detail responden
  let yPos = 40;
  const lineHeight = 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Informasi Responden:', 15, yPos);
  yPos += lineHeight;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Nama: ${surveyData.visitor_name}`, 20, yPos);
  yPos += lineHeight;
  doc.text(`Telepon: ${surveyData.visitor_phone}`, 20, yPos);
  yPos += lineHeight;
  
  if (surveyData.unit_name) {
    doc.text(`Unit: ${surveyData.unit_name}`, 20, yPos);
    yPos += lineHeight;
  }
  
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Hasil Penilaian:', 15, yPos);
  yPos += lineHeight;
  
  doc.setFont('helvetica', 'normal');
  
  const questions = [
    { label: 'U1 - Persyaratan', score: surveyData.q1_score },
    { label: 'U2 - Prosedur', score: surveyData.q2_score },
    { label: 'U3 - Waktu', score: surveyData.q3_score },
    { label: 'U4 - Biaya', score: surveyData.q4_score },
    { label: 'U5 - Produk', score: surveyData.q5_score },
    { label: 'U6 - Kompetensi', score: surveyData.q6_score },
    { label: 'U7 - Perilaku', score: surveyData.q7_score },
    { label: 'U8 - Penanganan Pengaduan', score: surveyData.q8_score },
    { label: 'U9 - Sarana & Prasarana', score: surveyData.q9_score },
    { label: 'U10 - Keamanan & Keselamatan', score: surveyData.q10_score },
    { label: 'U11 - Informasi Layanan', score: surveyData.q11_score }
  ];
  
  questions.forEach(q => {
    if (q.score !== undefined && q.score !== null) {
      doc.text(`${q.label}: ${q.score}/5`, 20, yPos);
      yPos += lineHeight;
    }
  });
  
  if (surveyData.overall_score) {
    yPos += 3;
    doc.setFont('helvetica', 'bold');
    doc.text(`Nilai Keseluruhan: ${surveyData.overall_score}/5`, 20, yPos);
    yPos += lineHeight;
  }
  
  if (surveyData.comments) {
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Komentar:', 20, yPos);
    yPos += lineHeight;
    
    doc.setFont('helvetica', 'normal');
    const splitComments = doc.splitTextToSize(surveyData.comments, pageWidth - 40);
    doc.text(splitComments, 20, yPos);
    yPos += splitComments.length * lineHeight;
  }
  
  if (surveyData.created_at) {
    yPos += 10;
    doc.setFontSize(8);
    doc.text(`Tanggal: ${new Date(surveyData.created_at).toLocaleString('id-ID')}`, 15, yPos);
  }
  
  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Terima kasih atas partisipasi Anda', pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  // Download
  const fileName = surveyData.survey_id ? `Survei_${surveyData.survey_id}.pdf` : 'Survei_Kepuasan.pdf';
  doc.save(fileName);
};

// Interface untuk Dashboard Report PDF
interface DashboardReportData {
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
}

// Fungsi untuk download PDF laporan dashboard
export const generateDashboardReportPDF = (data: DashboardReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // HALAMAN COVER
  doc.setFillColor(19, 127, 236);
  doc.rect(0, 0, pageWidth, 80, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN DASHBOARD', pageWidth / 2, 30, { align: 'center' });
  doc.text('RINGKASAN TIKET', pageWidth / 2, 42, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Sistem Informasi Komplain & Saran (KISS)', pageWidth / 2, 55, { align: 'center' });
  doc.text('RSUD Bendan Kota Pekalongan', pageWidth / 2, 63, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  yPos = 100;

  // Info Filter
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Periode:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(data.filters.dateRange, 50, yPos);
  
  yPos += 8;
  if (data.filters.unit && data.filters.unit !== 'Semua Unit') {
    doc.setFont('helvetica', 'bold');
    doc.text('Unit:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.filters.unit, 50, yPos);
    yPos += 8;
  }
  
  if (data.filters.category && data.filters.category !== 'Semua Kategori') {
    doc.setFont('helvetica', 'bold');
    doc.text('Kategori:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.filters.category, 50, yPos);
    yPos += 8;
  }
  
  if (data.filters.status && data.filters.status !== 'Semua Status') {
    doc.setFont('helvetica', 'bold');
    doc.text('Status:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.filters.status, 50, yPos);
    yPos += 8;
  }
  
  doc.setFont('helvetica', 'bold');
  doc.text('Tanggal Cetak:', 20, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(data.generatedAt).toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }), 50, yPos);

  // RINGKASAN TIKET
  yPos += 20;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN TIKET', 20, yPos);
  yPos += 10;

  const summaryData = [
    ['Total Tiket', data.totalTickets.toString()],
    ['Tiket Terbuka', data.statusCounts.open.toString()],
    ['Tiket Diproses', data.statusCounts.in_progress.toString()],
    ['Tiket Eskalasi', data.statusCounts.escalated.toString()],
    ['Tiket Selesai', data.statusCounts.resolved.toString()],
    ['Tiket Ditutup', data.statusCounts.closed.toString()]
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Metrik', 'Jumlah']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [19, 127, 236], fontSize: 11, fontStyle: 'bold', halign: 'center' },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 120 },
      1: { halign: 'center', cellWidth: 'auto', fontStyle: 'bold', textColor: [19, 127, 236], fontSize: 12 }
    }
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // VISUALISASI GRAFIK
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('VISUALISASI DISTRIBUSI STATUS', 20, yPos);
  yPos += 10;

  const statusData = [
    { label: 'Terbuka', count: data.statusCounts.open, color: [148, 163, 184] },
    { label: 'Diproses', count: data.statusCounts.in_progress, color: [59, 130, 246] },
    { label: 'Eskalasi', count: data.statusCounts.escalated, color: [249, 115, 22] },
    { label: 'Selesai', count: data.statusCounts.resolved, color: [34, 197, 94] }
  ];

  const maxCount = Math.max(...statusData.map(s => s.count), 1);
  const barMaxWidth = 130;
  const barHeight = 10;
  const startX = 60;

  statusData.forEach((status) => {
    const barWidth = (status.count / maxCount) * barMaxWidth;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(status.label, 20, yPos + 7);
    
    doc.setFillColor(240, 240, 240);
    doc.rect(startX, yPos, barMaxWidth, barHeight, 'F');
    
    doc.setFillColor(status.color[0], status.color[1], status.color[2]);
    doc.rect(startX, yPos, barWidth, barHeight, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.text(status.count.toString(), startX + barMaxWidth + 5, yPos + 7);
    
    yPos += barHeight + 6;
  });

  yPos += 15;

  // PERSENTASE
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('PERSENTASE DISTRIBUSI', 20, yPos);
  yPos += 10;

  const percentageData = statusData.map(status => {
    const percentage = data.totalTickets > 0 ? ((status.count / data.totalTickets) * 100).toFixed(1) : '0.0';
    return [status.label, status.count.toString(), `${percentage}%`];
  });

  autoTable(doc, {
    startY: yPos,
    head: [['Status', 'Jumlah', 'Persentase']],
    body: percentageData,
    theme: 'striped',
    headStyles: { fillColor: [19, 127, 236], fontSize: 10, fontStyle: 'bold', halign: 'center' },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 40, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 40, halign: 'center', fontStyle: 'bold', textColor: [19, 127, 236] }
    }
  });

  // FOOTER
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150, 150, 150);
  
  doc.text(
    'Halaman 1 dari 1',
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

  const fileName = `Laporan_Dashboard_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Interface untuk Dashboard Report PDF
