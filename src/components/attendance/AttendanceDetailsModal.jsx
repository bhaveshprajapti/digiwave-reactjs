import React from 'react';
import { CheckCircle, Clock, CalendarCheck, X, LogIn, LogOut, Pause, CalendarX } from 'lucide-react';

const AttendanceDetailsModal = ({ isOpen, onClose, attendanceData }) => {
  if (!isOpen || !attendanceData) return null;

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (e) {
      return '-';
    }
  };

  const formatDuration = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return '-';
    
    try {
      const ci = new Date(clockIn);
      const co = new Date(clockOut);
      // Use rounding instead of floor for more accurate calculation
      const diff = Math.round((co - ci) / 1000);
      
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } catch (e) {
      return '-';
    }
  };

  const getStatusBadge = (clockOut) => {
    if (clockOut) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Completed
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Active
        </span>
      );
    }
  };

  const getDurationBadge = (clockIn, clockOut) => {
    if (clockIn && clockOut) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {formatDuration(clockIn, clockOut)}
        </span>
      );
    } else if (clockIn && !clockOut) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          In Progress
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          -
        </span>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Modal container */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <div className="bg-white">
            {/* Modal header */}
            <div className="bg-blue-600 text-white px-4 py-3 sm:px-6 flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium flex items-center">
                <CalendarCheck className="h-5 w-5 mr-2" />
                Attendance Details - {attendanceData.date}
              </h3>
              <button
                type="button"
                className="text-white hover:text-gray-200 focus:outline-none"
                onClick={onClose}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-4 py-5 sm:p-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 p-2 rounded-full">
                      <LogIn className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-900">Clock Ins</p>
                      <p className="text-2xl font-semibold text-green-700">{attendanceData.clock_in_count || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-100 p-2 rounded-full">
                      <LogOut className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-900">Clock Outs</p>
                      <p className="text-2xl font-semibold text-red-700">{attendanceData.clock_out_count || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 p-2 rounded-full">
                      <Pause className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-yellow-900">Breaks</p>
                      <p className="text-2xl font-semibold text-yellow-700">{attendanceData.break_count || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 p-2 rounded-full">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-900">Total Hours</p>
                      <p className="text-2xl font-semibold text-blue-700">{attendanceData.total_hours || '00:00:00'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full day leave message */}
              {attendanceData.on_full_leave && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center mb-6">
                  <CalendarX className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-yellow-800 mb-1">Full Day Leave</h4>
                  <p className="text-yellow-600">No attendance data available for this date.</p>
                </div>
              )}

              {/* Session Details Table */}
              {!attendanceData.on_full_leave && (
                <>
                  <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <span className="bg-gray-100 p-1 rounded mr-2">
                      <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </span>
                    Work Sessions
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock In</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock Out</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {attendanceData.sessions && attendanceData.sessions.map((session, idx) => {
                          let previousClockOut = null;
                          let breakIndex = 1;
                          
                          // Display actual break information from session data
                          let breakElement = null;
                          if (session.break_start_time && session.break_end_time) {
                            const breakDuration = formatDuration(session.break_start_time, session.break_end_time);
                            breakElement = (
                              <tr key={`break-${idx}`}>
                                <td colSpan="5" className="px-6 py-2">
                                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <div className="flex items-center">
                                      <Pause className="h-4 w-4 text-yellow-600 mr-2" />
                                      <div>
                                        <strong>Break {breakIndex++}</strong>: {formatTime(session.break_start_time)} - {formatTime(session.break_end_time)}
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                          {breakDuration}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          }

                          previousClockOut = session.clock_out;

                          return (
                            <React.Fragment key={idx}>
                              {breakElement}
                              <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  Session {idx + 1}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <LogIn className="h-4 w-4 text-green-500 mr-1" />
                                    {formatTime(session.clock_in) === '-' ? (
                                      <span className="text-gray-400">-</span>
                                    ) : (
                                      formatTime(session.clock_in)
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <LogOut className="h-4 w-4 text-red-500 mr-1" />
                                    {formatTime(session.clock_out) === '-' ? (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Active
                                      </span>
                                    ) : (
                                      formatTime(session.clock_out)
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {getDurationBadge(session.clock_in, session.clock_out)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {getStatusBadge(session.clock_out)}
                                </td>
                              </tr>
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Modal footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDetailsModal;