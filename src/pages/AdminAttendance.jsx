import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserCheck, UserX, Eye, ChevronDown, Search } from 'lucide-react';
import { attendanceAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AttendanceModal from '../components/attendance/AttendanceModal';

const AdminAttendance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(20);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const { data: attendanceData, isLoading, error: attendanceError } = useQuery({
    queryKey: ['attendance', { search: searchTerm, page: currentPage, recordsPerPage }],
    queryFn: async () => {
      const response = await attendanceAPI.getAll({
        search: searchTerm || undefined,
        page: currentPage,
        page_size: recordsPerPage,
      });
      return response.data;
    },
    onError: (error) => {
      console.error('Error fetching attendance:', error);
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ['attendanceStats'],
    queryFn: () => attendanceAPI.getStats(),
    onError: (error) => {
      console.error('Error fetching stats:', error);
    },
  });

  const stats = {
    present_today: statsData?.present_today || 0,
    absent_today: statsData?.absent_today || 0,
  };

  const handleViewAttendance = async (record) => {
    setIsModalLoading(true);
    setShowAttendanceModal(true);
    try {
      const response = await attendanceAPI.getAdminDetails(record.user.id, record.date);
      setSelectedAttendance(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance details', error);
      setSelectedAttendance(null);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const records = attendanceData?.results || [];
  const totalPages = Math.ceil((attendanceData?.count || 0) / recordsPerPage);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Manage Attendance</h1>
        <p className="text-gray-500 mt-1">Monitor and manage employee attendance records.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-600">Present Today</h2>
            <p className="text-4xl font-bold text-green-500">{stats.present_today}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-full">
            <UserCheck className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-600">Absent Today</h2>
            <p className="text-4xl font-bold text-red-500">{stats.absent_today}</p>
          </div>
          <div className="bg-red-100 p-4 rounded-full">
            <UserX className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Attendance Log</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
            <div className="relative">
              <select
                value={recordsPerPage}
                onChange={(e) => setRecordsPerPage(Number(e.target.value))}
                className="appearance-none bg-white border rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {attendanceError && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            Error: {attendanceError.message}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b-2 border-gray-200">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-600">Sr No.</th>
                <th className="p-4 text-sm font-semibold text-gray-600">User</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Clock In</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Clock Out</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Total Break</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Total Hours</th>
                <th className="p-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((record, index) => (
                  <tr key={`${record.user.id}-${record.date}`} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 text-gray-700">{(currentPage - 1) * recordsPerPage + index + 1}</td>
                    <td className="p-4 text-gray-700 font-medium">
                      {record.user.first_name && record.user.last_name
                        ? `${record.user.first_name} ${record.user.last_name}`.trim()
                        : record.user.username || record.user.email || 'N/A'}
                    </td>
                    <td className="p-4 text-gray-700">
                      {new Date(record.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-4 text-gray-700">
                      {record.first_in ? new Date(record.first_in).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '-'}
                    </td>
                    <td className="p-4 text-gray-700">
                      {record.last_out ? new Date(record.last_out).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '-'}
                    </td>
                    <td className="p-4 text-gray-700">{record.total_break_str || '-'}</td>
                    <td className="p-4 text-gray-700">{record.total_hours_str || '-'}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleViewAttendance(record)}
                        className="p-2 rounded-full hover:bg-blue-100 text-blue-500"
                        title="View Attendance Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-gray-500">No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Showing {((currentPage - 1) * recordsPerPage) + 1} to {Math.min(currentPage * recordsPerPage, attendanceData?.count || 0)} of {attendanceData?.count || 0} results
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 text-sm rounded ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded disabled:opacity-50 hover:bg-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AttendanceModal
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
        attendanceData={selectedAttendance}
        isLoading={isModalLoading}
      />
    </div>
  );
};

export default AdminAttendance;
