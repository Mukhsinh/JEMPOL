import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

interface ReportFilters {
  dateRange?: string;
  unitId?: string;
  categoryId?: string;
  status?: string;
  priority?: string;
}

export const getReportData = async (req: Request, res: Response) => {
  try {
    const {
      dateRange = 'month',
      unitId,
      categoryId,
      status,
      priority,
      page = 1,
      limit = 10
    } = req.query as any;

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Build query untuk tickets (internal)
    let ticketsQuery = supabase
      .from('tickets')
      .select(`
        *,
        units!inner(name),
        service_categories(name),
        ticket_responses(created_at, response_type)
      `)
      .gte('created_at', startDate.toISOString());

    // Apply filters untuk tickets
    if (unitId) {
      ticketsQuery = ticketsQuery.eq('unit_id', unitId);
    }
    if (categoryId) {
      ticketsQuery = ticketsQuery.eq('category_id', categoryId);
    }
    if (status) {
      ticketsQuery = ticketsQuery.eq('status', status);
    }
    if (priority) {
      ticketsQuery = ticketsQuery.eq('priority', priority);
    }

    // Build query untuk external_tickets dengan join yang benar
    let externalTicketsQuery = supabase
      .from('external_tickets')
      .select(`
        *,
        units!external_tickets_unit_id_fkey(name),
        service_categories!external_tickets_service_category_id_fkey(name),
        patient_types!external_tickets_patient_type_id_fkey(name)
      `)
      .gte('created_at', startDate.toISOString());

    // Apply filters untuk external_tickets
    if (unitId) {
      externalTicketsQuery = externalTicketsQuery.eq('unit_id', unitId);
    }
    if (categoryId) {
      externalTicketsQuery = externalTicketsQuery.eq('service_category_id', categoryId);
    }
    if (status) {
      externalTicketsQuery = externalTicketsQuery.eq('status', status);
    }
    if (priority) {
      externalTicketsQuery = externalTicketsQuery.eq('priority', priority);
    }

    const [ticketsResult, externalTicketsResult] = await Promise.all([
      ticketsQuery,
      externalTicketsQuery
    ]);

    if (ticketsResult.error) {
      throw ticketsResult.error;
    }
    if (externalTicketsResult.error) {
      throw externalTicketsResult.error;
    }

    // Gabungkan dan normalize data dari kedua tabel
    const internalTickets = (ticketsResult.data || []).map((t: any) => ({
      ...t,
      patient_type_name: '-',
      category_name: t.service_categories?.name || 'N/A',
      unit_name: t.units?.name || 'N/A',
      ticket_source: 'internal',
      type: t.type || 'complaint'
    }));

    const externalTickets = (externalTicketsResult.data || []).map((et: any) => ({
      ...et,
      patient_type_name: et.patient_types?.name || '-',
      category_name: et.service_categories?.name || 'N/A',
      unit_name: et.units?.name || 'N/A',
      ticket_source: 'external',
      type: et.service_type || 'complaint',
      category_id: et.service_category_id,
      ticket_responses: []
    }));

    const tickets = [...internalTickets, ...externalTickets];

    // Calculate KPIs by type
    const totalComplaints = tickets?.filter(t => t.type === 'complaint').length || 0;
    const totalSuggestions = tickets?.filter(t => t.type === 'suggestion').length || 0;
    const totalRequests = tickets?.filter(t => t.type === 'information').length || 0;
    const totalSurveys = tickets?.filter(t => t.type === 'satisfaction').length || 0;
    const resolvedComplaints = tickets?.filter(t => t.status === 'resolved' || t.status === 'closed').length || 0;

    // Calculate average response time
    const responseTimes = tickets?.map(ticket => {
      if (ticket.first_response_at && ticket.created_at) {
        return new Date(ticket.first_response_at).getTime() - new Date(ticket.created_at).getTime();
      }
      return null;
    }).filter(time => time !== null) || [];

    const averageResponseTime = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length / (1000 * 60)) // in minutes
      : 0;

    // Calculate trends (last 30 days)
    const trendData = await calculateTrends(startDate, unitId, categoryId);

    // Calculate category trends
    const categoryTrends = await calculateCategoryTrends(startDate, unitId);

    // Calculate patient type trends
    const patientTypeTrends = await calculatePatientTypeTrends(startDate, unitId);

    // Calculate risk analysis
    const riskAnalysis = await calculateRiskAnalysis(startDate);

    // Get detailed reports with pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const detailedReports = tickets?.slice(offset, offset + parseInt(limit)).map(ticket => ({
      id: ticket.id,
      ticketNumber: ticket.ticket_number,
      date: new Date(ticket.created_at).toLocaleDateString('id-ID'),
      unitName: ticket.unit_name || ticket.units?.name || 'N/A',
      categoryName: ticket.category_name || ticket.service_categories?.name || 'N/A',
      patientTypeName: ticket.patient_type_name || '-',
      status: ticket.status,
      responseTime: ticket.first_response_at
        ? Math.round((new Date(ticket.first_response_at).getTime() - new Date(ticket.created_at).getTime()) / (1000 * 60))
        : null,
      title: ticket.title
    })) || [];

    // Calculate changes (mock data for now - would need historical comparison)
    const kpi = {
      totalComplaints,
      totalSuggestions,
      totalRequests,
      totalSurveys,
      resolvedComplaints,
      averageResponseTime,
      projectedNextWeek: Math.round((totalComplaints + totalSuggestions + totalRequests + totalSurveys) * 1.15), // Simple projection
      totalComplaintsChange: 12, // Mock percentage change
      totalSuggestionsChange: 8,
      totalRequestsChange: 5,
      totalSurveysChange: 3,
      resolvedComplaintsChange: 5,
      averageResponseTimeChange: -2
    };

    res.json({
      kpi,
      trends: trendData,
      categoryTrends,
      patientTypeTrends,
      riskAnalysis,
      detailedReports,
      totalReports: (totalComplaints + totalSuggestions + totalRequests + totalSurveys)
    });

  } catch (error) {
    console.error('Error fetching report data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const calculateTrends = async (startDate: Date, unitId?: string, categoryId?: string) => {
  try {
    let query = supabase
      .from('tickets')
      .select('created_at, status')
      .gte('created_at', startDate.toISOString());

    if (unitId) query = query.eq('unit_id', unitId);
    if (categoryId) query = query.eq('category_id', categoryId);

    const { data: tickets } = await query;

    // Group by week for the last 4 weeks
    const weeks = [];
    const now = new Date();

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
      const weekEnd = new Date(weekStart.getTime() + (7 * 24 * 60 * 60 * 1000));

      const weekTickets = tickets?.filter(ticket => {
        const ticketDate = new Date(ticket.created_at);
        return ticketDate >= weekStart && ticketDate < weekEnd;
      }) || [];

      weeks.push({
        date: `Minggu ${4 - i}`,
        complaints: weekTickets.length,
        resolved: weekTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length
      });
    }

    return weeks;
  } catch (error) {
    console.error('Error calculating trends:', error);
    return [];
  }
};

const calculateCategoryTrends = async (startDate: Date, unitId?: string) => {
  try {
    console.log('📊 Calculating category trends from', startDate.toISOString());

    // Query tickets internal dengan kategori
    let ticketsQuery = supabase
      .from('tickets')
      .select(`
        id,
        category_id,
        service_categories!inner(id, name)
      `)
      .gte('created_at', startDate.toISOString());

    if (unitId) {
      ticketsQuery = ticketsQuery.eq('unit_id', unitId);
    }

    // Query external tickets dengan kategori
    let externalTicketsQuery = supabase
      .from('external_tickets')
      .select(`
        id,
        service_category_id,
        service_categories!external_tickets_service_category_id_fkey(id, name)
      `)
      .gte('created_at', startDate.toISOString());

    if (unitId) {
      externalTicketsQuery = externalTicketsQuery.eq('unit_id', unitId);
    }

    const [ticketsResult, externalTicketsResult] = await Promise.all([
      ticketsQuery,
      externalTicketsQuery
    ]);

    if (ticketsResult.error) {
      console.error('❌ Error fetching tickets for category trends:', ticketsResult.error);
      return [];
    }
    if (externalTicketsResult.error) {
      console.error('❌ Error fetching external tickets for category trends:', externalTicketsResult.error);
      return [];
    }

    // Gabungkan data
    const allTickets = [
      ...(ticketsResult.data || []).map((t: any) => ({
        categoryName: t.service_categories?.name || 'Tidak Berkategori'
      })),
      ...(externalTicketsResult.data || []).map((et: any) => ({
        categoryName: et.service_categories?.name || 'Tidak Berkategori'
      }))
    ];

    // Hitung per kategori
    const categoryCount: { [key: string]: number } = {};
    allTickets.forEach(ticket => {
      const catName = ticket.categoryName;
      categoryCount[catName] = (categoryCount[catName] || 0) + 1;
    });

    const totalTickets = allTickets.length;

    // Convert ke array dan sort
    const categoryTrends = Object.entries(categoryCount)
      .map(([categoryName, count]) => ({
        categoryName,
        count,
        percentage: totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Ambil top 10 kategori

    console.log('📊 Category trends calculated:', categoryTrends);
    return categoryTrends;
  } catch (error) {
    console.error('❌ Error calculating category trends:', error);
    return [];
  }
};

const calculatePatientTypeTrends = async (startDate: Date, unitId?: string) => {
  try {
    console.log('📊 Calculating patient type trends from', startDate.toISOString());

    // Query external tickets dengan patient types
    let externalTicketsQuery = supabase
      .from('external_tickets')
      .select(`
        id,
        patient_type_id,
        patient_types!external_tickets_patient_type_id_fkey(id, name)
      `)
      .gte('created_at', startDate.toISOString());

    if (unitId) {
      externalTicketsQuery = externalTicketsQuery.eq('unit_id', unitId);
    }

    const { data: externalTickets, error } = await externalTicketsQuery;

    if (error) {
      console.error('❌ Error fetching external tickets for patient type trends:', error);
      return [];
    }

    // Hitung per jenis pasien
    const patientTypeCount: { [key: string]: number } = {};
    (externalTickets || []).forEach((ticket: any) => {
      const typeName = ticket.patient_types?.name || 'Tidak Diketahui';
      patientTypeCount[typeName] = (patientTypeCount[typeName] || 0) + 1;
    });

    const totalTickets = externalTickets?.length || 0;

    // Convert ke array dan sort
    const patientTypeTrends = Object.entries(patientTypeCount)
      .map(([patientTypeName, count]) => ({
        patientTypeName,
        count,
        percentage: totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    console.log('📊 Patient type trends calculated:', patientTypeTrends);
    return patientTypeTrends;
  } catch (error) {
    console.error('❌ Error calculating patient type trends:', error);
    return [];
  }
};

const calculateRiskAnalysis = async (startDate: Date) => {
  try {
    const { data: units } = await supabase
      .from('units')
      .select('id, name')
      .eq('is_active', true);

    if (!units) return [];

    const riskAnalysis = [];

    for (const unit of units) {
      const { data: tickets } = await supabase
        .from('tickets')
        .select('*')
        .eq('unit_id', unit.id)
        .gte('created_at', startDate.toISOString());

      if (tickets) {
        const totalTickets = tickets.length;
        const overdueTickets = tickets.filter(ticket => {
          if (ticket.sla_deadline && ticket.status !== 'resolved' && ticket.status !== 'closed') {
            return new Date(ticket.sla_deadline) < new Date();
          }
          return false;
        }).length;

        const riskPercentage = totalTickets > 0 ? Math.round((overdueTickets / totalTickets) * 100) : 0;

        let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (riskPercentage >= 80) riskLevel = 'critical';
        else if (riskPercentage >= 60) riskLevel = 'high';
        else if (riskPercentage >= 40) riskLevel = 'medium';

        riskAnalysis.push({
          unitName: unit.name,
          riskPercentage,
          riskLevel
        });
      }
    }

    return riskAnalysis.sort((a, b) => b.riskPercentage - a.riskPercentage).slice(0, 4);
  } catch (error) {
    console.error('Error calculating risk analysis:', error);
    return [];
  }
};

// Helper function to get report data for export
const getReportDataForExport = async (
  dateRange: string = 'month',
  unitId?: string,
  categoryId?: string,
  status?: string,
  priority?: string
) => {
  // Calculate date range
  const now = new Date();
  let startDate: Date;

  switch (dateRange) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'quarter':
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      startDate = new Date(now.getFullYear(), quarterStart, 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // Build query untuk tickets (internal)
  let ticketsQuery = supabase
    .from('tickets')
    .select(`
      *,
      units!inner(name),
      service_categories(name),
      ticket_responses(created_at, response_type)
    `)
    .gte('created_at', startDate.toISOString());

  // Apply filters untuk tickets
  if (unitId) {
    ticketsQuery = ticketsQuery.eq('unit_id', unitId);
  }
  if (categoryId) {
    ticketsQuery = ticketsQuery.eq('category_id', categoryId);
  }
  if (status) {
    ticketsQuery = ticketsQuery.eq('status', status);
  }
  if (priority) {
    ticketsQuery = ticketsQuery.eq('priority', priority);
  }

  // Build query untuk external_tickets dengan join yang benar
  let externalTicketsQuery = supabase
    .from('external_tickets')
    .select(`
      *,
      units!external_tickets_unit_id_fkey(name),
      service_categories!external_tickets_service_category_id_fkey(name),
      patient_types!external_tickets_patient_type_id_fkey(name)
    `)
    .gte('created_at', startDate.toISOString());

  // Apply filters untuk external_tickets
  if (unitId) {
    externalTicketsQuery = externalTicketsQuery.eq('unit_id', unitId);
  }
  if (categoryId) {
    externalTicketsQuery = externalTicketsQuery.eq('service_category_id', categoryId);
  }
  if (status) {
    externalTicketsQuery = externalTicketsQuery.eq('status', status);
  }
  if (priority) {
    externalTicketsQuery = externalTicketsQuery.eq('priority', priority);
  }

  const [ticketsResult, externalTicketsResult] = await Promise.all([
    ticketsQuery,
    externalTicketsQuery
  ]);

  if (ticketsResult.error) {
    throw ticketsResult.error;
  }
  if (externalTicketsResult.error) {
    throw externalTicketsResult.error;
  }

  // Gabungkan dan normalize data dari kedua tabel
  const internalTickets = (ticketsResult.data || []).map((t: any) => ({
    ...t,
    patient_type_name: '-',
    category_name: t.service_categories?.name || 'N/A',
    unit_name: t.units?.name || 'N/A',
    ticket_source: 'internal',
    type: t.type || 'complaint',
    ticket_responses: t.ticket_responses || []
  }));

  const externalTickets = (externalTicketsResult.data || []).map((et: any) => ({
    ...et,
    patient_type_name: et.patient_types?.name || '-',
    category_name: et.service_categories?.name || 'N/A',
    unit_name: et.units?.name || 'N/A',
    ticket_source: 'external',
    type: et.service_type || 'complaint',
    category_id: et.service_category_id,
    ticket_responses: []
  }));

  const tickets = [...internalTickets, ...externalTickets];

  // Calculate KPIs
  const totalComplaints = tickets?.length || 0;
  const resolvedComplaints = tickets?.filter(t => t.status === 'resolved' || t.status === 'closed').length || 0;

  // Calculate average response time
  const responseTimes = tickets?.map(ticket => {
    if (ticket.first_response_at && ticket.created_at) {
      return new Date(ticket.first_response_at).getTime() - new Date(ticket.created_at).getTime();
    }
    return null;
  }).filter(time => time !== null) || [];

  const averageResponseTime = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length / (1000 * 60)) // in minutes
    : 0;

  // Calculate trends (last 4 weeks)
  const trendData = await calculateTrends(startDate, unitId, categoryId);

  // Calculate risk analysis
  const riskAnalysis = await calculateRiskAnalysis(startDate);

  // Get all detailed reports (no pagination for export)
  const detailedReports = tickets?.map(ticket => ({
    id: ticket.id,
    ticketNumber: ticket.ticket_number,
    date: new Date(ticket.created_at).toLocaleDateString('id-ID'),
    unitName: ticket.unit_name || ticket.units?.name || 'N/A',
    categoryName: ticket.category_name || ticket.service_categories?.name || 'N/A',
    patientTypeName: ticket.patient_type_name || '-',
    status: ticket.status,
    responseTime: ticket.first_response_at
      ? Math.round((new Date(ticket.first_response_at).getTime() - new Date(ticket.created_at).getTime()) / (1000 * 60))
      : null,
    title: ticket.title
  })) || [];

  const kpi = {
    totalComplaints,
    resolvedComplaints,
    averageResponseTime,
    projectedNextWeek: Math.round(totalComplaints * 1.15), // Simple projection
    totalComplaintsChange: 12, // Mock percentage change
    resolvedComplaintsChange: 5,
    averageResponseTimeChange: -2
  };

  return {
    kpi,
    trends: trendData,
    riskAnalysis,
    detailedReports
  };
};

// Helper function to get period text
const getPeriodText = (dateRange: string): string => {
  const now = new Date();

  switch (dateRange) {
    case 'week':
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return `${weekStart.toLocaleDateString('id-ID')} - ${now.toLocaleDateString('id-ID')}`;
    case 'month':
      return `${new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('id-ID')} - ${now.toLocaleDateString('id-ID')}`;
    case 'quarter':
      const quarterStart = Math.floor(now.getMonth() / 3) * 3;
      const quarterStartDate = new Date(now.getFullYear(), quarterStart, 1);
      return `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()} (${quarterStartDate.toLocaleDateString('id-ID')} - ${now.toLocaleDateString('id-ID')})`;
    case 'year':
      return `${now.getFullYear()}`;
    default:
      return `${new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('id-ID')} - ${now.toLocaleDateString('id-ID')}`;
  }
};

export const exportToPDF = async (req: Request, res: Response) => {
  try {
    const {
      dateRange = 'month',
      unitId,
      categoryId,
      status,
      priority
    } = req.query as any;

    // Get report data
    const reportData = await getReportDataForExport(dateRange, unitId, categoryId, status, priority);

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=laporan-keluhan-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add title
    doc.fontSize(20).text('Laporan Keluhan dan Pengaduan', { align: 'center' });
    doc.moveDown();

    // Add period info
    const periodText = getPeriodText(dateRange);
    doc.fontSize(12).text(`Periode: ${periodText}`, { align: 'center' });
    doc.moveDown(2);

    // Add KPI summary
    doc.fontSize(16).text('Ringkasan KPI', { underline: true });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Total Keluhan: ${reportData.kpi.totalComplaints}`);
    doc.text(`Keluhan Terselesaikan: ${reportData.kpi.resolvedComplaints}`);
    doc.text(`Rata-rata Waktu Respons: ${reportData.kpi.averageResponseTime} menit`);
    doc.text(`Proyeksi Minggu Depan: ${reportData.kpi.projectedNextWeek} keluhan`);
    doc.moveDown(2);

    // Add detailed reports table
    doc.fontSize(16).text('Detail Laporan', { underline: true });
    doc.moveDown();

    // Table headers
    const tableTop = doc.y;
    const tableLeft = 50;
    const colWidths = [80, 120, 80, 80, 80, 60, 80];

    doc.fontSize(10);
    doc.text('No. Tiket', tableLeft, tableTop);
    doc.text('Tanggal', tableLeft + colWidths[0], tableTop);
    doc.text('Unit', tableLeft + colWidths[0] + colWidths[1], tableTop);
    doc.text('Kategori', tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop);
    doc.text('Jenis Pasien', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop);
    doc.text('Status', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], tableTop);
    doc.text('Respons (mnt)', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], tableTop);

    // Draw line under headers
    doc.moveTo(tableLeft, tableTop + 15)
      .lineTo(tableLeft + colWidths.reduce((a, b) => a + b, 0), tableTop + 15)
      .stroke();

    // Add data rows
    let currentY = tableTop + 25;
    reportData.detailedReports.forEach((report: any, index: number) => {
      if (currentY > 700) { // Start new page if needed
        doc.addPage();
        currentY = 50;
      }

      doc.text(report.ticketNumber || '-', tableLeft, currentY);
      doc.text(report.date || '-', tableLeft + colWidths[0], currentY);
      doc.text(report.unitName || '-', tableLeft + colWidths[0] + colWidths[1], currentY);
      doc.text(report.categoryName || '-', tableLeft + colWidths[0] + colWidths[1] + colWidths[2], currentY);
      doc.text(report.patientTypeName || '-', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], currentY);
      doc.text(report.status || '-', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], currentY);
      doc.text(report.responseTime ? `${report.responseTime}` : '-', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], currentY);

      currentY += 20;
    });

    // Add footer
    doc.fontSize(8).text(`Digenerate pada: ${new Date().toLocaleString('id-ID')}`, 50, doc.page.height - 50);

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Error exporting PDF:', error);
    res.status(500).json({ error: 'Error exporting PDF' });
  }
};

export const exportToExcel = async (req: Request, res: Response) => {
  try {
    const {
      dateRange = 'month',
      unitId,
      categoryId,
      status,
      priority
    } = req.query as any;

    // Get report data
    const reportData = await getReportDataForExport(dateRange, unitId, categoryId, status, priority);

    // Create workbook
    const workbook = new ExcelJS.Workbook();

    // Add KPI worksheet
    const kpiSheet = workbook.addWorksheet('Ringkasan KPI');

    // Add KPI data
    kpiSheet.addRow(['Metrik', 'Nilai']);
    kpiSheet.addRow(['Total Keluhan', reportData.kpi.totalComplaints]);
    kpiSheet.addRow(['Keluhan Terselesaikan', reportData.kpi.resolvedComplaints]);
    kpiSheet.addRow(['Rata-rata Waktu Respons (menit)', reportData.kpi.averageResponseTime]);
    kpiSheet.addRow(['Proyeksi Minggu Depan', reportData.kpi.projectedNextWeek]);

    // Style KPI sheet
    kpiSheet.getRow(1).font = { bold: true };
    kpiSheet.columns = [
      { width: 30 },
      { width: 20 }
    ];

    // Add detailed reports worksheet
    const detailSheet = workbook.addWorksheet('Detail Laporan');

    // Add headers
    detailSheet.addRow([
      'No. Tiket',
      'Tanggal',
      'Unit',
      'Kategori',
      'Jenis Pasien',
      'Status',
      'Waktu Respons (menit)',
      'Judul'
    ]);

    // Add data rows
    reportData.detailedReports.forEach((report: any) => {
      detailSheet.addRow([
        report.ticketNumber || '-',
        report.date || '-',
        report.unitName || '-',
        report.categoryName || '-',
        report.patientTypeName || '-',
        report.status || '-',
        report.responseTime || '-',
        report.title || '-'
      ]);
    });

    // Style detail sheet
    detailSheet.getRow(1).font = { bold: true };
    detailSheet.columns = [
      { width: 15 },
      { width: 12 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 12 },
      { width: 18 },
      { width: 30 }
    ];

    // Add trends worksheet if data exists
    if (reportData.trends && reportData.trends.length > 0) {
      const trendsSheet = workbook.addWorksheet('Tren');

      trendsSheet.addRow(['Periode', 'Jumlah Keluhan', 'Terselesaikan']);
      reportData.trends.forEach((trend: any) => {
        trendsSheet.addRow([trend.date, trend.complaints, trend.resolved]);
      });

      trendsSheet.getRow(1).font = { bold: true };
      trendsSheet.columns = [
        { width: 15 },
        { width: 18 },
        { width: 15 }
      ];
    }

    // Add risk analysis worksheet if data exists
    if (reportData.riskAnalysis && reportData.riskAnalysis.length > 0) {
      const riskSheet = workbook.addWorksheet('Analisis Risiko');

      riskSheet.addRow(['Unit', 'Persentase Risiko (%)', 'Level Risiko']);
      reportData.riskAnalysis.forEach((risk: any) => {
        riskSheet.addRow([risk.unitName, risk.riskPercentage, risk.riskLevel]);
      });

      riskSheet.getRow(1).font = { bold: true };
      riskSheet.columns = [
        { width: 25 },
        { width: 20 },
        { width: 15 }
      ];
    }

    // Set response headers
    const filename = `laporan-keluhan-${dateRange}-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error exporting Excel:', error);
    res.status(500).json({ error: 'Error exporting Excel' });
  }
};

export const getUnits = async (req: Request, res: Response) => {
  try {
    const { data: units, error } = await supabase
      .from('units')
      .select('id, name, code, description, is_active')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw error;
    }

    res.json(units || []);
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { data: categories, error } = await supabase
      .from('service_categories')
      .select('id, name, code, description, is_active')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw error;
    }

    res.json(categories || []);
  } catch (error) {
    console.error('Error fetching service categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSurveyReports = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query as any;

    let query = supabase
      .from('standalone_surveys')
      .select(`
        *,
        units(name),
        service_categories(name)
      `)
      .order('submitted_at', { ascending: false });

    if (start_date) {
      query = query.gte('submitted_at', start_date);
    }
    if (end_date) {
      const endDateObj = new Date(end_date);
      endDateObj.setHours(23, 59, 59, 999);
      query = query.lte('submitted_at', endDateObj.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching survey reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSurveyStats = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query as any;

    let query = supabase
      .from('standalone_surveys')
      .select(`
        id,
        overall_score,
        response_time_score,
        solution_quality_score,
        staff_courtesy_score,
        submitted_at
      `);

    if (start_date) {
      query = query.gte('submitted_at', start_date);
    }
    if (end_date) {
      const endDateObj = new Date(end_date);
      endDateObj.setHours(23, 59, 59, 999);
      query = query.lte('submitted_at', endDateObj.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    const totalSurveys = data?.length || 0;
    const avgOverallScore = data?.reduce((sum, survey) => sum + (survey.overall_score || 0), 0) / totalSurveys || 0;
    const avgResponseTimeScore = data?.reduce((sum, survey) => sum + (survey.response_time_score || 0), 0) / totalSurveys || 0;
    const avgSolutionQualityScore = data?.reduce((sum, survey) => sum + (survey.solution_quality_score || 0), 0) / totalSurveys || 0;
    const avgStaffCourtesyScore = data?.reduce((sum, survey) => sum + (survey.staff_courtesy_score || 0), 0) / totalSurveys || 0;

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const activeSurveys = data?.filter(s => new Date(s.submitted_at) >= oneDayAgo).length || 0;

    res.json({
      total_surveys: totalSurveys,
      total_responses: totalSurveys,
      average_completion_rate: 100,
      active_surveys: activeSurveys,
      average_scores: {
        overall: Math.round(avgOverallScore * 100) / 100,
        response_time: Math.round(avgResponseTimeScore * 100) / 100,
        solution_quality: Math.round(avgSolutionQualityScore * 100) / 100,
        staff_courtesy: Math.round(avgStaffCourtesyScore * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error fetching survey stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const exportSurveyReport = async (req: Request, res: Response) => {
  try {
    const { start_date, end_date, format = 'excel' } = req.query as any;

    // Query surveys from multiple tables
    let standaloneSurveysQuery = supabase
      .from('standalone_surveys')
      .select(`
        *,
        units(name),
        service_categories(name)
      `)
      .order('submitted_at', { ascending: false });

    let publicSurveysQuery = supabase
      .from('public_surveys')
      .select(`
        *,
        units(name),
        service_categories(name)
      `)
      .order('submitted_at', { ascending: false });

    let satisfactionSurveysQuery = supabase
      .from('satisfaction_surveys')
      .select(`
        *,
        tickets(ticket_number, title)
      `)
      .order('submitted_at', { ascending: false });

    if (start_date) {
      standaloneSurveysQuery = standaloneSurveysQuery.gte('submitted_at', start_date);
      publicSurveysQuery = publicSurveysQuery.gte('submitted_at', start_date);
      satisfactionSurveysQuery = satisfactionSurveysQuery.gte('submitted_at', start_date);
    }
    if (end_date) {
      const endDateObj = new Date(end_date);
      endDateObj.setHours(23, 59, 59, 999);
      standaloneSurveysQuery = standaloneSurveysQuery.lte('submitted_at', endDateObj.toISOString());
      publicSurveysQuery = publicSurveysQuery.lte('submitted_at', endDateObj.toISOString());
      satisfactionSurveysQuery = satisfactionSurveysQuery.lte('submitted_at', endDateObj.toISOString());
    }

    const [standaloneSurveys, publicSurveys, satisfactionSurveys] = await Promise.all([
      standaloneSurveysQuery,
      publicSurveysQuery,
      satisfactionSurveysQuery
    ]);

    // Combine all surveys
    const allSurveys: any[] = [];

    // Add standalone surveys
    standaloneSurveys.data?.forEach((survey: any) => {
      allSurveys.push({
        id: survey.id,
        type: 'Standalone',
        submitted_at: survey.submitted_at,
        reporter_name: survey.reporter_name || 'Anonim',
        reporter_email: survey.reporter_email || '-',
        unit_name: survey.units?.name || '-',
        category_name: survey.service_categories?.name || '-',
        overall_score: survey.overall_score || 0,
        response_time_score: survey.response_time_score || 0,
        solution_quality_score: survey.solution_quality_score || 0,
        staff_courtesy_score: survey.staff_courtesy_score || 0,
        comments: survey.comments || '-',
        source: survey.source || 'web'
      });
    });

    // Add public surveys
    publicSurveys.data?.forEach((survey: any) => {
      allSurveys.push({
        id: survey.id,
        type: 'Publik',
        submitted_at: survey.submitted_at,
        reporter_name: survey.visitor_name || 'Anonim',
        reporter_email: survey.visitor_email || '-',
        unit_name: survey.units?.name || '-',
        category_name: survey.service_categories?.name || '-',
        overall_score: survey.overall_score || 0,
        response_time_score: survey.response_time_score || 0,
        solution_quality_score: survey.solution_quality_score || 0,
        staff_courtesy_score: survey.staff_courtesy_score || 0,
        comments: survey.comments || '-',
        source: survey.source || 'public_survey'
      });
    });

    // Add satisfaction surveys
    satisfactionSurveys.data?.forEach((survey: any) => {
      allSurveys.push({
        id: survey.id,
        type: 'Kepuasan Tiket',
        submitted_at: survey.submitted_at,
        reporter_name: survey.tickets?.ticket_number || '-',
        reporter_email: '-',
        unit_name: '-',
        category_name: survey.tickets?.title || '-',
        overall_score: survey.overall_score || 0,
        response_time_score: survey.response_time_score || 0,
        solution_quality_score: survey.solution_quality_score || 0,
        staff_courtesy_score: survey.staff_courtesy_score || 0,
        comments: survey.comments || '-',
        source: 'ticket'
      });
    });

    // Sort by submitted_at descending
    allSurveys.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

    if (format === 'pdf') {
      // Export to PDF
      const doc = new PDFDocument({ margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=laporan-survei-${new Date().toISOString().split('T')[0]}.pdf`);

      doc.pipe(res);

      doc.fontSize(20).text('Laporan Survei Kepuasan', { align: 'center' });
      doc.moveDown();

      const periodText = start_date && end_date 
        ? `${new Date(start_date).toLocaleDateString('id-ID')} - ${new Date(end_date).toLocaleDateString('id-ID')}`
        : 'Semua Periode';
      doc.fontSize(12).text(`Periode: ${periodText}`, { align: 'center' });
      doc.moveDown(2);

      // Summary
      doc.fontSize(16).text('Ringkasan', { underline: true });
      doc.moveDown();
      doc.fontSize(12);
      doc.text(`Total Survei: ${allSurveys.length}`);
      
      const avgOverall = allSurveys.length > 0 
        ? (allSurveys.reduce((sum, s) => sum + s.overall_score, 0) / allSurveys.length).toFixed(2)
        : 0;
      doc.text(`Rata-rata Skor Keseluruhan: ${avgOverall}`);
      doc.moveDown(2);

      // Detail table
      doc.fontSize(16).text('Detail Survei', { underline: true });
      doc.moveDown();

      allSurveys.slice(0, 50).forEach((survey, index) => {
        if (doc.y > 700) {
          doc.addPage();
        }
        doc.fontSize(10);
        doc.text(`${index + 1}. ${survey.type} - ${new Date(survey.submitted_at).toLocaleDateString('id-ID')}`);
        doc.text(`   Nama: ${survey.reporter_name} | Unit: ${survey.unit_name}`);
        doc.text(`   Skor: ${survey.overall_score}/5 | Komentar: ${survey.comments.substring(0, 50)}...`);
        doc.moveDown(0.5);
      });

      doc.fontSize(8).text(`Digenerate pada: ${new Date().toLocaleString('id-ID')}`, 50, doc.page.height - 50);
      doc.end();
    } else {
      // Export to Excel
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Laporan Survei');

      // Add headers
      sheet.addRow([
        'No',
        'Tipe Survei',
        'Tanggal',
        'Nama Responden',
        'Email',
        'Unit',
        'Kategori',
        'Skor Keseluruhan',
        'Skor Waktu Respons',
        'Skor Kualitas Solusi',
        'Skor Keramahan Staff',
        'Komentar',
        'Sumber'
      ]);

      // Style header
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF137FEC' }
      };
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      // Add data rows
      allSurveys.forEach((survey, index) => {
        sheet.addRow([
          index + 1,
          survey.type,
          new Date(survey.submitted_at).toLocaleDateString('id-ID'),
          survey.reporter_name,
          survey.reporter_email,
          survey.unit_name,
          survey.category_name,
          survey.overall_score,
          survey.response_time_score,
          survey.solution_quality_score,
          survey.staff_courtesy_score,
          survey.comments,
          survey.source
        ]);
      });

      // Set column widths
      sheet.columns = [
        { width: 5 },
        { width: 15 },
        { width: 12 },
        { width: 20 },
        { width: 25 },
        { width: 20 },
        { width: 20 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 15 },
        { width: 40 },
        { width: 12 }
      ];

      const filename = `laporan-survei-${new Date().toISOString().split('T')[0]}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

      await workbook.xlsx.write(res);
      res.end();
    }
  } catch (error) {
    console.error('Error exporting survey report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};