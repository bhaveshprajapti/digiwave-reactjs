import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Search, Edit, Trash2, Server, Globe, Shield, 
  Calendar, CheckCircle, XCircle, AlertTriangle, Activity, Database, Eye
} from 'lucide-react';
import { hostingAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { showDeleteConfirmDialog } from '../utils/sweetAlert';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const statusColors = {
    'Active': 'bg-success-100 text-success-800',
    'Inactive': 'bg-error-100 text-error-800',
    'Expired': 'bg-warning-100 text-warning-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const HostCard = ({ host, onEdit, onDelete, onView }) => {
  const isExpiringSoon = host.expiry_date && 
    new Date(host.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="card p-6 hover:shadow-medium transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {host.server_name || 'Unnamed Server'}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {host.hosting_provider} • {host.server_type}
          </p>
          <div className="flex items-center gap-2 mb-3">
            <StatusBadge status={host.status} />
            {isExpiringSoon && (
              <span className="px-2 py-1 bg-warning-100 text-warning-800 text-xs rounded-full">
                Expiring Soon
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(host)}
            className="btn-ghost btn-sm"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(host)}
            className="btn-ghost btn-sm"
            title="Edit Host"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(host)}
            className="btn-ghost btn-sm text-error-600 hover:bg-error-50"
            title="Delete Host"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <span className="text-gray-600">IP Address:</span>
          <p className="font-medium font-mono">
            {host.server_ip || 'Not set'}
          </p>
        </div>
        <div>
          <span className="text-gray-600">Plan:</span>
          <p className="font-medium">
            {host.plan_package || 'Not specified'}
          </p>
        </div>
        <div>
          <span className="text-gray-600">OS:</span>
          <p className="font-medium">
            {host.operating_system || 'Not specified'}
          </p>
        </div>
        <div>
          <span className="text-gray-600">Cost:</span>
          <p className="font-medium">
            {host.server_cost ? `₹${parseFloat(host.server_cost).toLocaleString('en-IN')}` : 'Not set'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <span className="text-gray-600">Purchase Date:</span>
          <p className="font-medium">
            {host.purchase_date ? new Date(host.purchase_date).toLocaleDateString() : 'Not set'}
          </p>
        </div>
        <div>
          <span className="text-gray-600">Expiry Date:</span>
          <p className={`font-medium ${isExpiringSoon ? 'text-warning-600' : ''}`}>
            {host.expiry_date ? new Date(host.expiry_date).toLocaleDateString() : 'Not set'}
          </p>
        </div>
      </div>
      
      {host.project?.length > 0 && (
        <div className="mt-4">
          <span className="text-sm text-gray-600">Projects:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {host.project.slice(0, 2).map((project) => (
              <span
                key={project.id}
                className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded"
              >
                {project.project_name}
              </span>
            ))}
            {host.project.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{host.project.length - 2} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Hosting = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: hosts, isLoading, error } = useQuery({
    queryKey: ['hosts', { search: searchTerm, status: statusFilter }],
    queryFn: () => hostingAPI.getAll({ 
      search: searchTerm || undefined,
      status: statusFilter || undefined 
    }),
    placeholderData: (previousData) => previousData,
  });

  const handleDelete = async (host) => {
    const confirmed = await showDeleteConfirmDialog(`"${host.server_name}"`);
    if (confirmed) {
      // TODO: Implement delete
      console.log('Delete host:', host);
    }
  };

  const handleEdit = (host) => {
    // TODO: Open edit modal
    console.log('Edit host:', host);
  };

  const handleView = (host) => {
    // TODO: Open view modal
    console.log('View host:', host);
  };

  const handleAddHost = () => {
    // TODO: Open add host modal
    console.log('Add new host');
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
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Failed to load hosting data
        </h3>
        <p className="text-gray-600">
          {error.response?.data?.message || 'Something went wrong'}
        </p>
      </div>
    );
  }

  const hostsList = hosts?.data?.results || [];
  const activeHosts = hostsList.filter(h => h.status === 'Active').length;
  const inactiveHosts = hostsList.filter(h => h.status === 'Inactive').length;
  const expiredHosts = hostsList.filter(h => h.status === 'Expired').length;
  const expiringSoon = hostsList.filter(h => 
    h.expiry_date && new Date(h.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hosting & Servers</h1>
          <p className="text-gray-600 mt-1">
            Manage server infrastructure and hosting details
          </p>
        </div>
        
        <button
          onClick={handleAddHost}
          className="btn-primary btn-md flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Server
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search servers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-40"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">{hostsList.length}</p>
              <p className="text-sm text-gray-600">Total Servers</p>
            </div>
            <Server className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-success-600">{activeHosts}</p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
            <Globe className="h-8 w-8 text-success-500" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-error-600">{inactiveHosts + expiredHosts}</p>
              <p className="text-sm text-gray-600">Inactive/Expired</p>
            </div>
            <Database className="h-8 w-8 text-error-500" />
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-warning-600">{expiringSoon}</p>
              <p className="text-sm text-gray-600">Expiring Soon</p>
            </div>
            <Server className="h-8 w-8 text-warning-500" />
          </div>
        </div>
      </div>

      {/* Hosts Grid */}
      {hostsList.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {hostsList.map((host) => (
            <HostCard
              key={host.id}
              host={host}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Server className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No servers found
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by adding your first server.
          </p>
          <button
            onClick={handleAddHost}
            className="btn-primary btn-md"
          >
            Add Server
          </button>
        </div>
      )}
    </div>
  );
};

export default Hosting;
