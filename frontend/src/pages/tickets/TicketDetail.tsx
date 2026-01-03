import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { masterDataService } from '../../services/masterDataService';

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  patient_type?: string;
  unit_type?: string;
  service_category?: string;
}

const TicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patientTypes, setPatientTypes] = useState<any[]>([]);
  const [unitTypes, setUnitTypes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

                        // Fetch ticket details
        if (id) {
          // Untuk sementara, gunakan method yang ada
          const ticketData = await complaintService.getComplaintsByUnit('all');
          const foundTicket = ticketData.find((t: any) => t.id === id);
          setTicket(foundTicket || null);
        }

        // Fetch master data for display
        const [patientTypesData, unitTypesData] = await Promise.all([
          masterDataService.getPatientTypes(),
          masterDataService.getUnitTypes()
        ]);

        setPatientTypes(patientTypesData);
        setUnitTypes(unitTypesData);
      } catch (err: any) {
        console.error('Error fetching ticket details:', err);
        setError(err.message || 'Failed to fetch ticket details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      if (!ticket) return;
      
      // Untuk sementara, hanya update local state
      // await complaintService.updateComplaint(ticket.id, { status: newStatus });
      setTicket({ ...ticket, status: newStatus });
      console.log('Status updated to:', newStatus);
    } catch (err: any) {
      console.error('Error updating ticket status:', err);
      setError(err.message || 'Failed to update ticket status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900">Ticket not found</h3>
        <button
          onClick={() => navigate('/tickets')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{ticket.title}</h1>
          <div className="mt-2 flex items-center space-x-4">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              ticket.status === 'open' ? 'bg-green-100 text-green-800' :
              ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {ticket.status}
            </span>
            <span className="text-sm text-gray-500">
              Created: {new Date(ticket.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ticket Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{ticket.description}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Priority</dt>
                  <dd className="mt-1 text-sm text-gray-900">{ticket.priority}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Patient Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {patientTypes.find(pt => pt.id === ticket.patient_type)?.name || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Unit Type</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {unitTypes.find(ut => ut.id === ticket.unit_type)?.name || 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => handleStatusUpdate('in_progress')}
                  className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
                  disabled={ticket.status === 'in_progress'}
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => handleStatusUpdate('resolved')}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  disabled={ticket.status === 'resolved'}
                >
                  Mark Resolved
                </button>
                <button
                  onClick={() => navigate('/tickets')}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Back to Tickets
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;