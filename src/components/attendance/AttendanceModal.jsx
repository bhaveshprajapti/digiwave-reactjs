import React from 'react';
import { X } from 'lucide-react';
import Modal from '../Modal';
import LoadingSpinner from '../LoadingSpinner';

const AttendanceModal = ({ isOpen, onClose, attendanceData, isLoading }) => {
  const {
    date,
    user,
    sessions = [],
    clock_in_count = 0,
    clock_out_count = 0,
    break_count = 0,
    total_hours = '0:00',
    total_break = '0:00',
    on_full_leave = false
  } = attendanceData || {};

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div className="flex items-center gap-2">
          <span>Attendance on {date ? formatDate(date) : 'Loading...'}</span>
          {user && <span className="text-sm font-normal text-gray-600">({user})</span>}
        </div>
      }
      size="4xl"
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {/* Sessions Table */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">#</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Clock In</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Clock Out</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {on_full_leave ? (
                <tr>
                  <td colSpan="3" className="px-4 py-8 text-center text-red-600 font-medium">
                    Full day leave - No attendance data
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                    No sessions recorded
                  </td>
                </tr>
              ) : (
                sessions.map((session, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 border-b">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-b">
                      {formatTime(session.clock_in)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 border-b">
                      {formatTime(session.clock_out)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Statistics */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Attendance Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border">
              <div className="text-sm text-gray-600">Clock In Count</div>
              <div className="text-xl font-bold text-green-600">{clock_in_count}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <div className="text-sm text-gray-600">Clock Out Count</div>
              <div className="text-xl font-bold text-red-600">{clock_out_count}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <div className="text-sm text-gray-600">Break Count</div>
              <div className="text-xl font-bold text-yellow-600">{break_count}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <div className="text-sm text-gray-600">Total Worked Hours</div>
              <div className="text-xl font-bold text-blue-600">{total_hours}</div>
            </div>
            <div className="bg-white rounded-lg p-4 border">
              <div className="text-sm text-gray-600">Total Break</div>
              <div className="text-xl font-bold text-purple-600">{total_break}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
          </>
        )} 
      </div>
    </Modal>
  );
};

export default AttendanceModal;
