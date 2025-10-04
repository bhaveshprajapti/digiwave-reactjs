import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Search, Filter, Edit, Download, Eye, FileText, Calendar, 
  CheckCircle, XCircle, AlertCircle, Building, User, DollarSign, Server, Receipt, UserCheck, Trash2
} from 'lucide-react';
import { quotationsAPI, usersAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AddQuotationModal from '../components/quotation/AddQuotationModal';
import EditQuotationModal from '../components/quotation/EditQuotationModal';
import ViewQuotationModal from '../components/quotation/ViewQuotationModal';
import { showDownloadConfirmDialog, showErrorAlert, showDeleteConfirmDialog } from '../utils/sweetAlert';
import { useAuth } from '../contexts/AuthContext';
import { generateQuotationPDF } from '../utils/pdfGenerator';
import toast from 'react-hot-toast';

const StatusBadge = ({ validUntil }) => {
  const today = new Date();
  const validDate = new Date(validUntil);
  const isActive = validDate >= today;
  
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${
      isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {isActive ? 'Active' : 'Expired'}
    </span>
  );
};

const Quotations = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const queryClient = useQueryClient();

  const { data: quotations, isLoading, error } = useQuery({
    queryKey: ['quotations', { search: searchTerm }],
    queryFn: () => quotationsAPI.getAll({ 
      search: searchTerm || undefined
    }),
    placeholderData: (previousData) => previousData,
  });


  const createMutation = useMutation({
    mutationFn: quotationsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation created successfully');
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      console.error('Quotation creation error:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail ||
                          Object.values(error.response?.data || {}).flat().join(', ') ||
                          'Failed to create quotation';
      toast.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => quotationsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation updated successfully');
      setIsEditModalOpen(false);
      setEditingQuotation(null);
    },
    onError: (error) => {
      console.error('Quotation update error:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail ||
                          Object.values(error.response?.data || {}).flat().join(', ') ||
                          'Failed to update quotation';
      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: quotationsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      toast.success('Quotation deleted successfully');
    },
    onError: (error) => {
      console.error('Quotation delete error:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail ||
                          'Failed to delete quotation';
      toast.error(errorMessage);
    },
  });

  const handleCreateQuotation = (formData) => {
    createMutation.mutate(formData);
  };

  const handleEditQuotation = (quotation) => {
    setEditingQuotation(quotation);
    setIsEditModalOpen(true);
  };

  const handleUpdateQuotation = (formData) => {
    updateMutation.mutate({ id: editingQuotation.id, data: formData });
  };

  const handleViewQuotation = (quotation) => {
    setSelectedQuotation(quotation);
    setIsViewModalOpen(true);
  };

  const handleDownloadQuotation = async (quotation) => {
    const confirmed = await showDownloadConfirmDialog('this quotation');
    if (confirmed) {
      // Show loading toast
      const loadingToast = toast.loading('Generating PDF...');
      
      try {
        // Use the direct PDF generation function
        await generateQuotationPDF(quotation);
        toast.dismiss(loadingToast);
        toast.success('Quotation PDF downloaded successfully');
      } catch (error) {
        toast.dismiss(loadingToast);
        console.error('Error generating PDF:', error);
        toast.error('Failed to generate PDF. Please try again.');
      }
    }
  };

  const handleDeleteQuotation = async (quotation) => {
    // Check permissions: superadmin can delete all, others can only delete their own
    const canDelete = user?.is_superuser || quotation.prepared_by?.id === user?.id;
    
    if (!canDelete) {
      toast.error('You can only delete quotations you created');
      return;
    }

    const confirmed = await showDeleteConfirmDialog(`quotation ${quotation.quotation_no}`);
    if (confirmed) {
      deleteMutation.mutate(quotation.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Quotations</h3>
          <p className="text-gray-500 mb-4">{error.message || 'Failed to load quotations'}</p>
          <button 
            onClick={async () => {
              await showErrorAlert({
                title: 'Reloading Page',
                text: 'The page will be refreshed to try loading the data again.',
                confirmButtonText: 'OK'
              });
              window.location.reload();
            }} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Handle different response formats - ensure we get an array
  let quotationsList = [];
  
  if (quotations) {
    // Axios response structure: { data: {...}, status: 200, headers: {...} }
    const responseData = quotations.data || quotations;
    
    if (Array.isArray(responseData)) {
      quotationsList = responseData;
    } else if (responseData.results && Array.isArray(responseData.results)) {
      quotationsList = responseData.results;
    } else if (responseData.data && Array.isArray(responseData.data)) {
      quotationsList = responseData.data;
    }
  }

  // Calculate stats with safety checks
  const totalQuotations = quotationsList.length;
  const today = new Date();
  const activeQuotations = quotationsList.filter(q => {
    try {
      return q.valid_until && new Date(q.valid_until) >= today;
    } catch (e) {
      return false;
    }
  }).length;
  const expiredQuotations = quotationsList.filter(q => {
    try {
      return q.valid_until && new Date(q.valid_until) < today;
    } catch (e) {
      return false;
    }
  }).length;
  const thisMonthQuotations = quotationsList.filter(q => {
    try {
      if (!q.date) return false;
      const quotationDate = new Date(q.date);
      return quotationDate.getMonth() === today.getMonth() && quotationDate.getFullYear() === today.getFullYear();
    } catch (e) {
      return false;
    }
  }).length;

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Quotations</p>
              <p className="text-2xl font-bold text-indigo-600">{totalQuotations}</p>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Quotations</p>
              <p className="text-2xl font-bold text-green-600">{activeQuotations}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expired Quotations</p>
              <p className="text-2xl font-bold text-red-600">{expiredQuotations}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-amber-600">{thisMonthQuotations}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold text-gray-900">All Quotations</h2>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search quotations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Quotation
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quotation No</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Until</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grand Total</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quotationsList.length > 0 ? (
                quotationsList.map((quotation, index) => (
                  <tr key={quotation.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{quotation.quotation_no}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div 
                        className="font-medium text-indigo-600 cursor-pointer hover:text-indigo-800"
                        onClick={() => handleViewQuotation(quotation)}
                      >
                        {quotation.client_name}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{quotation.company_name}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(quotation.date)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(quotation.valid_until)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(quotation.grand_total)}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge validUntil={quotation.valid_until} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditQuotation(quotation)}
                          className="text-indigo-600 hover:text-indigo-800" 
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadQuotation(quotation)}
                          className="text-green-600 hover:text-green-800"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {(user?.is_superuser || quotation.prepared_by?.id === user?.id) && (
                          <button
                            onClick={() => handleDeleteQuotation(quotation)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    No quotations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Quotation Modal */}
      <AddQuotationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateQuotation}
      />

      {/* Edit Quotation Modal */}
      <EditQuotationModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingQuotation(null);
        }}
        onSubmit={handleUpdateQuotation}
        quotation={editingQuotation}
      />

      {/* View Quotation Modal */}
      <ViewQuotationModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedQuotation(null);
        }}
        quotation={selectedQuotation}
      />
    </div>
  );
};

export default Quotations;
