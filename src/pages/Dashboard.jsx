import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Clock, 
  Calendar, 
  FolderOpen, 
  LogIn,
  LogOut,
  Coffee,
  AlertCircle
} from 'lucide-react';
import { attendanceAPI, leavesAPI, projectsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  
  const { data: todayAttendance, refetch: refetchAttendance } = useQuery({
    queryKey: ['todayAttendance'],
    queryFn: () => attendanceAPI.getAll({ date: new Date().toISOString().split('T')[0] }),
    refetchInterval: 30000,
  });

  const { data: myLeaves } = useQuery({
    queryKey: ['myLeaves'],
    queryFn: () => leavesAPI.getAll({ limit: 5 })
  });

  const { data: myProjects } = useQuery({
    queryKey: ['myProjects'],
    queryFn: () => projectsAPI.getAll({ team_member: user?.id, limit: 5 })
  });

  const handleClockIn = async () => {
    try {
      await attendanceAPI.clockIn();
      toast.success('Clocked in successfully!');
      refetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      await attendanceAPI.clockOut();
      toast.success('Clocked out successfully!');
      refetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clock out');
    }
  };

  const attendance = todayAttendance?.data?.results?.[0];
  const hasActiveSessions = attendance?.sessions?.some(session => 
    session.clock_in && !session.clock_out
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's your dashboard overview for today.
        </p>
      </div>

      {/* Attendance Section */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="h-5 w-5 mr-2" />
          Today's Attendance
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                hasActiveSessions 
                  ? 'bg-success-100 text-success-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {hasActiveSessions ? 'Clocked In' : 'Clocked Out'}
              </span>
            </div>
            
            {attendance && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Hours:</span>
                  <span className="font-medium">{attendance.total_hours_str || '00:00:00'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Break Time:</span>
                  <span className="font-medium">{attendance.total_break_str || '00:00:00'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sessions:</span>
                  <span className="font-medium">{attendance.sessions?.length || 0}</span>
                </div>
              </>
            )}
          </div>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={handleClockIn}
              disabled={hasActiveSessions}
              className={`btn-md flex items-center justify-center gap-2 ${
                hasActiveSessions 
                  ? 'btn-secondary opacity-50 cursor-not-allowed' 
                  : 'btn-success'
              }`}
            >
              <LogIn className="h-4 w-4" />
              Clock In
            </button>
            
            <button
              onClick={handleClockOut}
              disabled={!hasActiveSessions}
              className={`btn-md flex items-center justify-center gap-2 ${
                !hasActiveSessions 
                  ? 'btn-secondary opacity-50 cursor-not-allowed' 
                  : 'btn-error'
              }`}
            >
              <LogOut className="h-4 w-4" />
              Clock Out
            </button>
            
            <button className="btn-outline btn-md flex items-center justify-center gap-2">
              <Coffee className="h-4 w-4" />
              Take Break
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">My Projects</p>
              <p className="text-2xl font-bold text-gray-900">
                {myProjects?.data?.count || 0}
              </p>
            </div>
            <FolderOpen className="h-8 w-8 text-primary-500" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Leave Balance</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
              <p className="text-xs text-gray-500">days remaining</p>
            </div>
            <Calendar className="h-8 w-8 text-success-500" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">22</p>
              <p className="text-xs text-gray-500">working days</p>
            </div>
            <Clock className="h-8 w-8 text-warning-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Leave Requests
          </h3>
          {myLeaves?.data?.results?.length > 0 ? (
            <div className="space-y-3">
              {myLeaves.data.results.slice(0, 3).map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {leave.leave_type.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(leave.start_date).toLocaleDateString()} - 
                      {new Date(leave.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    leave.status === 'approved' ? 'bg-success-100 text-success-800' :
                    leave.status === 'rejected' ? 'bg-error-100 text-error-800' :
                    'bg-warning-100 text-warning-800'
                  }`}>
                    {leave.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent leave requests</p>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            My Projects
          </h3>
          {myProjects?.data?.results?.length > 0 ? (
            <div className="space-y-3">
              {myProjects.data.results.slice(0, 3).map((project) => (
                <div key={project.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">
                    {project.project_name}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-600">
                      {project.project_id}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'Completed' ? 'bg-success-100 text-success-800' :
                      project.status === 'In Progress' ? 'bg-primary-100 text-primary-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No projects assigned</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
