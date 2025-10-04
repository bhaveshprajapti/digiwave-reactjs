import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Plus, Search, Eye, DollarSign, TrendingUp } from 'lucide-react';
import { paymentsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Payments = () => {
  const [activeTab, setActiveTab] = useState('projects');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: projectPayments, isLoading: projectPaymentsLoading } = useQuery({
    queryKey: ['projectPayments', { search: searchTerm }],
    queryFn: () => paymentsAPI.projects.getAll({ search: searchTerm || undefined }),
    enabled: activeTab === 'projects',
    placeholderData: (previousData) => previousData,
  });

  const { data: developerPayments, isLoading: developerPaymentsLoading } = useQuery({
    queryKey: ['developerPayments', { search: searchTerm }],
    queryFn: () => paymentsAPI.developers.getAll({ search: searchTerm || undefined }),
    enabled: activeTab === 'developers',
    placeholderData: (previousData) => previousData,
  });

  const isLoading = projectPaymentsLoading || developerPaymentsLoading;

  const projectPaymentsList = projectPayments?.data?.results || [];
  const developerPaymentsList = developerPayments?.data?.results || [];

  const totalProjectPayments = projectPaymentsList.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
  const totalDeveloperPayments = developerPaymentsList.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-600 mt-1">
            Track project payments and developer compensations
          </p>
        </div>
        
        <button className="btn-primary btn-md flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Payment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Project Payments</p>
              <p className="text-3xl font-bold text-gray-900">
                ₹{totalProjectPayments.toLocaleString('en-IN')}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-success-500 mr-1" />
                <span className="text-sm text-success-600">+12% from last month</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-success-500 text-white">
              <CreditCard className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Developer Payments</p>
              <p className="text-3xl font-bold text-gray-900">
                ₹{totalDeveloperPayments.toLocaleString('en-IN')}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-primary-500 mr-1" />
                <span className="text-sm text-primary-600">+8% from last month</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-primary-500 text-white">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p className="text-3xl font-bold text-gray-900">
                ₹{(totalProjectPayments - totalDeveloperPayments).toLocaleString('en-IN')}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-warning-500 mr-1" />
                <span className="text-sm text-warning-600">Profit margin</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-warning-500 text-white">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('projects')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'projects'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Project Payments ({projectPaymentsList.length})
            </button>
            <button
              onClick={() => setActiveTab('developers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'developers'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Developer Payments ({developerPaymentsList.length})
            </button>
          </nav>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <>
              {activeTab === 'projects' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Project
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {projectPaymentsList.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {payment.project?.project_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {payment.milestone_name || 'General Payment'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ₹{parseFloat(payment.amount).toLocaleString('en-IN')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                              {payment.payment_method}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'Not set'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-primary-600 hover:text-primary-900">
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'developers' && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Developer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Project
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {developerPaymentsList.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-primary-600 text-sm font-medium">
                                  {payment.developer?.first_name?.[0]}{payment.developer?.last_name?.[0]}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {payment.developer?.first_name} {payment.developer?.last_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {payment.project?.project_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ₹{parseFloat(payment.amount).toLocaleString('en-IN')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-secondary-100 text-secondary-800 text-xs rounded-full">
                              {payment.payment_method}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'Not set'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-primary-600 hover:text-primary-900">
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {((activeTab === 'projects' && projectPaymentsList.length === 0) ||
                (activeTab === 'developers' && developerPaymentsList.length === 0)) && (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No payments found
                  </h3>
                  <p className="text-gray-600">
                    No {activeTab} payments match your current search.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payments;
