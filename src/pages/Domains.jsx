import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, Globe, Calendar, 
  Shield, AlertCircle, CheckCircle, Clock, Server
} from 'lucide-react';
import { domainsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { showDeleteConfirmDialog } from '../utils/sweetAlert';
import toast from 'react-hot-toast';

const StatusBadge = ({ status, expiryDate }) => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  
  let statusColor = 'bg-green-100 text-green-800';
  let statusText = 'Active';
  
  if (daysLeft <= 0) {
    statusColor = 'bg-red-100 text-red-800';
    statusText = 'Expired';
  } else if (daysLeft <= 30) {
    statusColor = 'bg-yellow-100 text-yellow-800';
    statusText = 'Expiring Soon';
  }

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor}`}>
      {statusText}
    </span>
  );
};

const DomainModal = ({ isOpen, onClose, onSubmit, domain = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    domain_name: domain?.domain_name || '',
    sub_domain1: domain?.sub_domain1 || '',
    sub_domain2: domain?.sub_domain2 || '',
    purchase_date: domain?.purchase_date || '',
    expiry_date: domain?.expiry_date || '',
    auto_renewal: domain?.auto_renewal || 'Off',
    registrar: domain?.registrar || '',
    renewal_status: domain?.renewal_status || '',
    dns_configured: domain?.dns_configured || false,
    nameservers: domain?.nameservers || '',
    ssl_installed: domain?.ssl_installed || false,
    ssl_expiry: domain?.ssl_expiry || '',
    credentials_user: domain?.credentials_user || '',
    credentials_pass: domain?.credentials_pass || '',
    linked_services: domain?.linked_services || '',
    domain_charge: domain?.domain_charge || '',
    client_payment_status: domain?.client_payment_status || 'None',
    payment_method: domain?.payment_method || '',
    payment_mode: domain?.payment_mode || 'None',
    notes: domain?.notes || '',
    project: domain?.project || []
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.getAll()
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={domain ? 'Edit Domain' : 'Add Domain'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain Name *
            </label>
            <input
              type="text"
              name="domain_name"
              value={formData.domain_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Registrar
            </label>
            <input
              type="text"
              name="registrar"
              value={formData.registrar}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub Domain 1
            </label>
            <input
              type="text"
              name="sub_domain1"
              value={formData.sub_domain1}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub Domain 2
            </label>
            <input
              type="text"
              name="sub_domain2"
              value={formData.sub_domain2}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purchase Date
            </label>
            <input
              type="date"
              name="purchase_date"
              value={formData.purchase_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              name="expiry_date"
              value={formData.expiry_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Auto Renewal
            </label>
            <select
              name="auto_renewal"
              value={formData.auto_renewal}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Off">Off</option>
              <option value="On">On</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SSL Expiry
            </label>
            <input
              type="date"
              name="ssl_expiry"
              value={formData.ssl_expiry}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain Charge (₹)
            </label>
            <input
              type="number"
              name="domain_charge"
              value={formData.domain_charge}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              name="client_payment_status"
              value={formData.client_payment_status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="None">None</option>
              <option value="Received">Received</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="dns_configured"
              checked={formData.dns_configured}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              DNS Configured
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="ssl_installed"
              checked={formData.ssl_installed}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              SSL Installed
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nameservers
          </label>
          <textarea
            name="nameservers"
            value={formData.nameservers}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter nameservers (one per line)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : (domain ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const Domains = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const queryClient = useQueryClient();

  const { data: domains, isLoading } = useQuery({
    queryKey: ['domains', { search: searchTerm }],
    queryFn: () => domainsAPI.getAll({ search: searchTerm || undefined }),
    placeholderData: (previousData) => previousData,
  });

  const createMutation = useMutation({
    mutationFn: domainsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      toast.success('Domain created successfully');
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to create domain';
      toast.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => domainsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      toast.success('Domain updated successfully');
      setIsEditModalOpen(false);
      setEditingDomain(null);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Failed to update domain';
      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: domainsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      toast.success('Domain deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete domain');
    },
  });

  const handleCreateDomain = (formData) => {
    createMutation.mutate(formData);
  };

  const handleEditDomain = (domain) => {
    setEditingDomain(domain);
    setIsEditModalOpen(true);
  };

  const handleUpdateDomain = (formData) => {
    updateMutation.mutate({ id: editingDomain.id, data: formData });
  };

  const handleDeleteDomain = async (domainId) => {
    const confirmed = await showDeleteConfirmDialog('this domain');
    if (confirmed) {
      deleteMutation.mutate(domainId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const domainsList = domains?.data?.results || [];
  
  // Calculate stats
  const totalDomains = domainsList.length;
  const activeDomains = domainsList.filter(d => {
    const today = new Date();
    const expiry = new Date(d.expiry_date);
    return expiry > today;
  }).length;
  const expiredDomains = totalDomains - activeDomains;
  const expiringSoon = domainsList.filter(d => {
    const today = new Date();
    const expiry = new Date(d.expiry_date);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 && daysLeft <= 30;
  }).length;

  return (
    <div className="space-y-6">
      {/* Domain Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h6 className="text-sm font-medium text-gray-600 mb-1">Total Domains</h6>
              <h4 className="text-2xl font-bold text-blue-600">{totalDomains}</h4>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Globe className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h6 className="text-sm font-medium text-gray-600 mb-1">Active</h6>
              <h4 className="text-2xl font-bold text-green-600">{activeDomains}</h4>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h6 className="text-sm font-medium text-gray-600 mb-1">Expiring Soon</h6>
              <h4 className="text-2xl font-bold text-yellow-600">{expiringSoon}</h4>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h6 className="text-sm font-medium text-gray-600 mb-1">Expired</h6>
              <h4 className="text-2xl font-bold text-red-600">{expiredDomains}</h4>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Domains Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-semibold text-gray-900">Domain Management</h4>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search domains..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Domain
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrar</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SSL</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auto Renewal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {domainsList.length > 0 ? (
                domainsList.map((domain) => (
                  <tr key={domain.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="font-medium text-gray-900">{domain.domain_name}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {domain.registrar || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {domain.purchase_date ? new Date(domain.purchase_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {domain.expiry_date ? new Date(domain.expiry_date).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={domain.status} expiryDate={domain.expiry_date} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {domain.ssl_installed ? (
                        <span className="flex items-center text-green-600">
                          <Shield className="h-4 w-4 mr-1" />
                          Installed
                        </span>
                      ) : (
                        <span className="text-gray-400">Not Installed</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        domain.auto_renewal === 'On' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {domain.auto_renewal}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditDomain(domain)}
                          className="text-blue-600 hover:text-blue-800" 
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDomain(domain.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No domains found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Domain Modal */}
      <DomainModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateDomain}
        isLoading={createMutation.isPending}
      />

      {/* Edit Domain Modal */}
      <DomainModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingDomain(null);
        }}
        onSubmit={handleUpdateDomain}
        domain={editingDomain}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
};

export default Domains;