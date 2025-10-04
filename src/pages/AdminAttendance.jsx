import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { Calendar, Clock, Users, CheckCircle, XCircle, Eye } from 'lucide-react';
import { attendanceAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const StatCard = ({ title, value, icon, subtext }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border">
    <div className="flex flex-row items-center justify-between pb-2">
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </div>
  </div>
);

const AdminAttendance = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const navigate = useNavigate();

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['attendanceReport', { month: selectedMonth, year: selectedYear }],
    queryFn: () => attendanceAPI.getAdminReport({ month: selectedMonth, year: selectedYear }),
    placeholderData: { data: { todayAttendance: [], monthlySummary: [] } },
  });

  const { todayAttendance, monthlySummary } = reportData?.data || { todayAttendance: [], monthlySummary: [] };

  const selectedEmployeeData = useMemo(() => {
    if (selectedEmployeeId === 'all') return null;
    return monthlySummary.find(emp => emp.id.toString() === selectedEmployeeId);
  }, [monthlySummary, selectedEmployeeId]);

  const presentCount = todayAttendance.filter(e => e.status === 'present').length;
  const absentCount = todayAttendance.filter(e => e.status === 'absent').length;

  const overallStats = useMemo(() => {
    if (!monthlySummary || monthlySummary.length === 0) return { avgDays: 0, avgHours: 0, totalHours: 0, expectedHours: 0 };
    const totalDaysWorked = monthlySummary.reduce((acc, emp) => acc + emp.daysWorked, 0);
    const totalHoursPerDay = monthlySummary.reduce((acc, emp) => acc + emp.hoursPerDay, 0);
    const totalHours = monthlySummary.reduce((acc, emp) => acc + emp.totalHours, 0);
    const totalExpected = monthlySummary.reduce((acc, emp) => acc + emp.expectedHours, 0);
    const numEmployees = monthlySummary.length;
    return {
      avgDays: (totalDaysWorked / numEmployees).toFixed(1),
      avgHours: (totalHoursPerDay / numEmployees).toFixed(1),
      totalHours: totalHours.toFixed(0),
      expectedHours: totalExpected.toFixed(0),
      totalDaysInMonth: monthlySummary[0]?.totalDays || 0,
    };
  }, [monthlySummary]);

  const chartData = useMemo(() => monthlySummary.map(emp => ({ ...emp, name: emp.name.split(' ')[0] })), [monthlySummary]);

  if (isLoading) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Attendance Log Management</h1>
            <p className="text-gray-600 mt-1">Track employee attendance, hours, and performance</p>
          </div>
          <div className="flex gap-4">
            <select value={`${selectedYear}-${selectedMonth}`} onChange={e => {
              const [year, month] = e.target.value.split('-');
              setSelectedYear(parseInt(year));
              setSelectedMonth(parseInt(month));
            }} className="w-[180px] bg-white p-2 border rounded-md">
              {[...Array(3)].map((_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                return <option key={i} value={`${d.getFullYear()}-${d.getMonth() + 1}`}>{d.toLocaleString('default', { month: 'long' })} {d.getFullYear()}</option>
              })}
            </select>
            <select value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} className="w-[200px] bg-white p-2 border rounded-md">
              <option value="all">All Employees</option>
              {monthlySummary.map(emp => <option key={emp.id} value={emp.id.toString()}>{emp.name}</option>)}
            </select>
          </div>
        </div>

        <div className="bg-white border-none shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800">Today's Attendance</h2>
            <p className="text-sm text-gray-500 mb-4">Real-time attendance status for {new Date().toLocaleDateString()}</p>
            <div className="flex border-b mb-4">
                <button onClick={() => setActiveTab('all')} className={`py-2 px-4 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}>All ({todayAttendance.length})</button>
                <button onClick={() => setActiveTab('present')} className={`py-2 px-4 ${activeTab === 'present' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}>Present ({presentCount})</button>
                <button onClick={() => setActiveTab('absent')} className={`py-2 px-4 ${activeTab === 'absent' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500'}`}>Absent ({absentCount})</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Employee</th>
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Designation</th>
                    <th className="text-center py-2 px-3 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-center py-2 px-3 text-sm font-semibold text-gray-600">Check In</th>
                    <th className="text-center py-2 px-3 text-sm font-semibold text-gray-600">Check Out</th>
                    <th className="text-center py-2 px-3 text-sm font-semibold text-gray-600">Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAttendance.filter(emp => activeTab === 'all' || emp.status === activeTab).map(emp => (
                    <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 text-sm font-medium">{emp.name}</td>
                      <td className="py-2 px-3 text-sm text-gray-600">{emp.designation}</td>
                      <td className="py-2 px-3 text-center">
                        {emp.status === 'present' ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800"><CheckCircle className="h-3 w-3" />Present</span> : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800"><XCircle className="h-3 w-3" />Absent</span>}
                      </td>
                      <td className="py-2 px-3 text-sm text-center">{emp.checkIn}</td>
                      <td className="py-2 px-3 text-sm text-center">{emp.checkOut}</td>
                      <td className="py-2 px-3 text-sm text-center">{emp.hoursToday > 0 ? `${emp.hoursToday} hrs` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard title="Total Employees" value={monthlySummary.length} icon={<Users className="h-4 w-4 text-blue-600" />} subtext="Active this month" />
          <StatCard title="Avg Days Worked" value={overallStats.avgDays} icon={<Calendar className="h-4 w-4 text-green-600" />} subtext={`Out of ${overallStats.totalDaysInMonth} days`} />
          <StatCard title="Avg Hours/Day" value={overallStats.avgHours} icon={<Clock className="h-4 w-4 text-purple-600" />} subtext="Expected: 8 hours" />
          <StatCard title="Total Hours" value={overallStats.totalHours} icon={<Clock className="h-4 w-4 text-gray-600" />} subtext={`Expected: ${overallStats.expectedHours} hours`} />
        </div>

        {selectedEmployeeId === 'all' ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="font-semibold text-gray-800">Days Worked by Employee</h3>
                    <p className="text-sm text-gray-500 mb-4">Monthly attendance comparison</p>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip />
                            <Bar dataKey="daysWorked" name="Days Worked" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="font-semibold text-gray-800">Total Hours by Employee</h3>
                    <p className="text-sm text-gray-500 mb-4">Monthly hours comparison</p>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip />
                            <Bar dataKey="totalHours" name="Total Hours" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-gray-800">Average Hours per Day</h3>
                <p className="text-sm text-gray-500 mb-4">Daily average working hours by employee</p>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} domain={[0, 10]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="hoursPerDay" name="Avg Hours/Day" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
          </>
        ) : selectedEmployeeData && (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-gray-800">{selectedEmployeeData.name} - {selectedEmployeeData.designation}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
                    <div>
                        <p className="text-sm text-gray-600">Days Worked</p>
                        <p className="text-2xl font-bold mt-1">{selectedEmployeeData.daysWorked}/{selectedEmployeeData.totalDays}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Avg Hours/Day</p>
                        <p className="text-2xl font-bold mt-1">{selectedEmployeeData.hoursPerDay}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Total Hours</p>
                        <p className="text-2xl font-bold mt-1">{selectedEmployeeData.totalHours}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Performance</p>
                        <p className="text-2xl font-bold mt-1">{selectedEmployeeData.performance}%</p>
                    </div>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="font-semibold text-gray-800">Daily Hours Tracking for {selectedEmployeeData.name}</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={selectedEmployeeData.dailyLogs}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={d => new Date(d).getDate()} />
                        <YAxis domain={[0, 12]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="hours" stroke="#4f46e5" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
          </>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-gray-800">Monthly Attendance Summary</h3>
            <div className="overflow-x-auto mt-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-sm font-semibold text-gray-600">Employee</th>
                    <th className="text-center py-2 px-3 text-sm font-semibold text-gray-600">Present</th>
                    <th className="text-center py-2 px-3 text-sm font-semibold text-gray-600">Absent</th>
                    <th className="text-center py-2 px-3 text-sm font-semibold text-gray-600">Avg Hours/Day</th>
                    <th className="text-center py-2 px-3 text-sm font-semibold text-gray-600">Total Hours</th>
                    <th className="text-center py-2 px-3 text-sm font-semibold text-gray-600">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlySummary.map(emp => (
                    <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 text-sm font-medium">{emp.name}</td>
                      <td className="py-2 px-3 text-center text-sm">{emp.presentDays}</td>
                      <td className="py-2 px-3 text-center text-sm">{emp.absentDays}</td>
                      <td className="py-2 px-3 text-center text-sm">{emp.hoursPerDay}</td>
                      <td className="py-2 px-3 text-center text-sm">{emp.totalHours}</td>
                      <td className="py-2 px-3 text-center text-sm">{emp.performance}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;

