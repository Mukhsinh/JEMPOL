import React, { useState, useEffect } from 'react';
import reportService from '../../services/reportService';

interface SurveyData {
  id: string;
  title: string;
  responses: number;
  completion_rate: number;
  created_at: string;
  status: string;
}

interface SurveyStats {
  total_surveys: number;
  total_responses: number;
  average_completion_rate: number;
  active_surveys: number;
}

const SurveyReport: React.FC = () => {
  const [surveys, setSurveys] = useState<SurveyData[]>([]);
  const [stats, setStats] = useState<SurveyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchSurveyReports();
  }, [dateRange]);

  const fetchSurveyReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch survey reports data
      const [surveysData, statsData] = await Promise.all([
        reportService.getSurveyReports(dateRange.start, dateRange.end),
        reportService.getSurveyStats(dateRange.start, dateRange.end)
      ]);

      setSurveys(surveysData || []);
      setStats(statsData || {
        total_surveys: 0,
        total_responses: 0,
        average_completion_rate: 0,
        active_surveys: 0
      });
    } catch (err: any) {
      console.error('Error fetching survey reports:', err);
      setError(err.message || 'Failed to fetch survey reports');
      
      // Set default data on error
      setSurveys([]);
      setStats({
        total_surveys: 0,
        total_responses: 0,
        average_completion_rate: 0,
        active_surveys: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    try {
      await reportService.exportSurveyReport(dateRange.start, dateRange.end);
    } catch (err: any) {
      console.error('Error exporting report:', err);
      setError(err.message || 'Failed to export report');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Survey Reports</h1>
        <button
          onClick={handleExportReport}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Export Report
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.total_surveys}</div>
            <div className="text-sm text-gray-600">Total Surveys</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.total_responses}</div>
            <div className="text-sm text-gray-600">Total Responses</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats.average_completion_rate.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Avg Completion Rate</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">{stats.active_surveys}</div>
            <div className="text-sm text-gray-600">Active Surveys</div>
          </div>
        </div>
      )}

      {/* Survey List */}
      <div className="bg-white shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Survey Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {surveys.length > 0 ? surveys.map((survey) => (
                <tr key={survey.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {survey.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {survey.responses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {survey.completion_rate.toFixed(1)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      survey.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {survey.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(survey.created_at).toLocaleDateString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No survey data available for the selected date range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SurveyReport;