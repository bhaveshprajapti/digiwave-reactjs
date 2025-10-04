import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, CheckCircle, XCircle, Clock, Filter, Search, Eye, Check, X } from 'lucide-react';
import { leavesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { showApprovalConfirmDialog } from '../utils/sweetAlert';
import toast from 'react-hot-toast';

const LeaveStatusBadge = ({ status }) => {
  const statusColors = {
    'approved': 'bg-success-100 text-success-800',
    'rejected': 'bg-error-100 text-error-800',
    'pending': 'bg-warning-100 text-warning-800',
    'cancelled': 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const LeaveTypeLabel = ({ type }) => {
  const typeLabels = {
    'full': 'Full Day',
    'first_half': 'First Half',
    'second_half': 'Second Half',
  };

  return typeLabels[type] || type;
};

const Leaves = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Check if user can approve leaves
  const canApproveLeaves = user?.can_approve_leaves || user?.is_superuser;

  const { data: leaves, isLoading } = useQuery({
    queryKey: ['leaves', { search: searchTerm, status: statusFilter }],
    queryFn: () => leavesAPI.getAll({ 
      search: searchTerm || undefined,
      status: statusFilter || undefined 
    }),
    placeholderData: (previousData) => previousData,
  });

  const approveMutation = useMutation({
    mutationFn: leavesAPI.approve,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      toast.success('Leave approved successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve leave');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: leavesAPI.reject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] });
      toast.success('Leave rejected successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reject leave');
    },
  });

  const handleApprove = async (leaveId) => {
    const confirmed = await showApprovalConfirmDialog('approve', 'leave request');
    if (confirmed) {
      approveMutation.mutate(leaveId);
    }
  };

  const handleReject = async (leaveId) => {
    const confirmed = await showApprovalConfirmDialog('reject', 'leave request');
    if (confirmed) {
      rejectMutation.mutate(leaveId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const leavesList = leaves?.data?.results || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Requests</h1>
          <p className="text-gray-600 mt-1">
            Manage employee leave requests and approvals
          </p>
        </div>
        
        <button className="btn-primary btn-md flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Leave Request
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee name..."
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
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-warning-600">
              {leavesList.filter(l => l.status === 'pending').length}
            </p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>
        <div className="card p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-success-600">
              {leavesList.filter(l => l.status === 'approved').length}
            </p>
            <p className="text-sm text-gray-600">Approved</p>
          </div>
        </div>
        <div className="card p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-error-600">
              {leavesList.filter(l => l.status === 'rejected').length}
            </p>
            <p className="text-sm text-gray-600">Rejected</p>
          </div>
        </div>
        <div className="card p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-600">
              {leavesList.length}
            </p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applied On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leavesList.map((leave) => (
                <tr key={leave.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 text-sm font-medium">
                          {leave.user?.first_name?.[0]}{leave.user?.last_name?.[0]}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {leave.user?.first_name} {leave.user?.last_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <LeaveTypeLabel type={leave.leave_type} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {leave.leave_days}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <LeaveStatusBadge status={leave.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(leave.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button className="text-primary-600 hover:text-primary-900">
                        <Eye className="h-4 w-4" />
                      </button>
                      {leave.status === 'pending' && canApproveLeaves && (
                        <>
                          <button 
                            onClick={() => handleApprove(leave.id)}
                            className="text-success-600 hover:text-success-900"
                            disabled={approveMutation.isLoading}
                            title="Approve Leave"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleReject(leave.id)}
                            className="text-error-600 hover:text-error-900"
                            disabled={rejectMutation.isLoading}
                            title="Reject Leave"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {leavesList.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No leave requests found
          </h3>
          <p className="text-gray-600">
            No leave requests match your current filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default Leaves;
