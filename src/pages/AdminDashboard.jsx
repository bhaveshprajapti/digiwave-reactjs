import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  FolderOpen, 
  Users, 
  Clock, 
  Calendar, 
  CreditCard, 
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { dashboardAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const StatCard = ({ title, value, icon: Icon, color = 'blue', trend, subtitle }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    yellow: 'from-amber-500 to-amber-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    indigo: 'from-indigo-500 to-indigo-600',
  };

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-3">
                <div className="flex items-center px-2 py-1 bg-emerald-50 rounded-full">
                  <TrendingUp className="h-3 w-3 text-emerald-600 mr-1" />
                  <span className="text-xs font-medium text-emerald-600">{trend}</span>
                </div>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
    </div>
  );
};

const AdminDashboard = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardAPI.getStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

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
        <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Failed to load dashboard
        </h3>
        <p className="text-gray-600">
          {error.response?.data?.message || 'Something went wrong'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Welcome back! Here's what's happening with your projects.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
            Export Data
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all text-sm font-medium shadow-lg">
            Add Project
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Projects"
          value={stats?.total_projects || 0}
          subtitle="All time projects"
          icon={FolderOpen}
          color="blue"
          trend="+12%"
        />
        <StatCard
          title="Active Projects"
          value={stats?.ongoing_projects || 0}
          subtitle="Currently in progress"
          icon={Clock}
          color="yellow"
          trend="+5%"
        />
        <StatCard
          title="Completed"
          value={stats?.completed_projects || 0}
          subtitle="Successfully delivered"
          icon={CheckCircle}
          color="green"
          trend="+8%"
        />
        <StatCard
          title="Team Members"
          value={stats?.total_users || 0}
          subtitle="Active employees"
          icon={Users}
          color="purple"
          trend="+2%"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Today's Attendance"
          value={stats?.today_attendance || 0}
          subtitle="Present today"
          icon={Clock}
          color="indigo"
        />
        <StatCard
          title="Pending Leaves"
          value={stats?.pending_leaves || 0}
          subtitle="Awaiting approval"
          icon={Calendar}
          color="yellow"
        />
        <StatCard
          title="Active Users"
          value={stats?.active_users || 0}
          subtitle="Online now"
          icon={Users}
          color="green"
        />
      </div>

      {/* Revenue and Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Total Revenue
              </h3>
              <p className="text-gray-600">All time payments received</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">
              ₹{stats?.total_payments?.toLocaleString('en-IN') || '0'}
            </span>
            <div className="flex items-center px-3 py-1 bg-emerald-100 rounded-full">
              <TrendingUp className="h-4 w-4 text-emerald-600 mr-1" />
              <span className="text-sm font-medium text-emerald-600">+15.3%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg">
              <FolderOpen className="h-4 w-4" />
              New Project
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium">
              <Users className="h-4 w-4" />
              Manage Team
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium">
              <Calendar className="h-4 w-4" />
              View Reports
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Recent Activity
          </h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <div className="w-3 h-3 bg-emerald-500 rounded-full mr-4"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                New project "E-commerce Website" was created
              </p>
              <p className="text-xs text-gray-500 mt-1">Project management</p>
            </div>
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-lg">2h ago</span>
          </div>
          <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-4"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Payment received for "Mobile App Development"
              </p>
              <p className="text-xs text-gray-500 mt-1">Financial</p>
            </div>
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-lg">4h ago</span>
          </div>
          <div className="flex items-center p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100">
            <div className="w-3 h-3 bg-amber-500 rounded-full mr-4"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Leave request pending approval from John Doe
              </p>
              <p className="text-xs text-gray-500 mt-1">Human Resources</p>
            </div>
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-lg">1d ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
