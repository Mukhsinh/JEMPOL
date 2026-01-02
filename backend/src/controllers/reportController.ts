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

    // Build base query
    let query = supabase
      .from('tickets')
      .select(`
        *,
        units!inner(name),
        service_categories(name),
        ticket_responses(created_at, response_type)
      `)
      .gte('created_at', startDate.toISOString());

    // Apply filters
    if (unitId) {
      query = query.eq('unit_id', unitId);
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }

    const { data: tickets, error } = await query;

    if (error) {
      throw error;
    }

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

    // Calculate trends (last 30 days)
    const trendData = await calculateTrends(startDate, unitId, categoryId);

    // Calculate risk analysis
    const riskAnalysis = await calculateRiskAnalysis(startDate);

    // Get detailed reports with pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const detailedReports = tickets?.slice(offset, offset + parseInt(limit)).map(ticket => ({
      id: ticket.id,
      ticketNumber: ticket.ticket_number,
      date: new Date(ticket.created_at).toLocaleDateString('id-ID'),
      unitName: ticket.units?.name || 'N/A',
      categoryName: ticket.service_categories?.name || 'N/A',
      status: ticket.status,
      responseTime: ticket.first_response_at 
        ? Math.round((new Date(ticket.first_response_at).getTime() - new Date(ticket.created_at).getTime()) / (1000 * 60))
        : null,
      title: ticket.title
    })) || [];

    // Calculate changes (mock data for now - would need historical comparison)
    const kpi = {
      totalComplaints,
      resolvedComplaints,
      averageResponseTime,
      projectedNextWeek: Math.round(totalComplaints * 1.15), // Simple projection
      totalComplaintsChange: 12, // Mock percentage change
      resolvedComplaintsChange: 5,
      averageResponseTimeChange: -2
    };

    res.json({
      kpi,
      trends: trendData,
      riskAnalysis,
      detailedReports,
      totalReports: totalComplaints
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

  // Build base query
  let query = supabase
    .from('tickets')
    .select(`
      *,
      units!inner(name),
      service_categories(name),
      ticket_responses(created_at, response_type)
    `)
    .gte('created_at', startDate.toISOString());

  // Apply filters
  if (unitId) {
    query = query.eq('unit_id', unitId);
  }
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  if (status) {
    query = query.eq('status', status);
  }
  if (priority) {
    query = query.eq('priority', priority);
  }

  const { data: tickets, error } = await query;

  if (error) {
    throw error;
  }

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
    unitName: ticket.units?.name || 'N/A',
    categoryName: ticket.service_categories?.name || 'N/A',
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
    const colWidths = [80, 120, 80, 80, 60, 80];
    
    doc.fontSize(10);
    doc.text('No. Tiket', tableLeft, tableTop);
    doc.text('Tanggal', tableLeft + colWidths[0], tableTop);
    doc.text('Unit', tableLeft + colWidths[0] + colWidths[1], tableTop);
    doc.text('Kategori', tableLeft + colWidths[0] + colWidths[1] + colWidths[2], tableTop);
    doc.text('Status', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], tableTop);
    doc.text('Respons (mnt)', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], tableTop);

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
      doc.text(report.status || '-', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], currentY);
      doc.text(report.responseTime ? `${report.responseTime}` : '-', tableLeft + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], currentY);
      
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