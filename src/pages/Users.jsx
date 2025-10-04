import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, User, Users as UsersIcon, UserCheck, UserX, Mail, Phone, Calendar, Shield, IdCard, Eye, EyeOff, PlusCircle } from 'lucide-react';
import { usersAPI, rolesAPI, lookupsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { showDeleteConfirmDialog } from '../utils/sweetAlert';
import toast from 'react-hot-toast';
import Modal from '../components/Modal';
import { SelectField } from '../components/form/index.jsx';

const ViewUserModal = ({ isOpen, onClose, user }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showHourlyModal, setShowHourlyModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);

  if (!user) return null;

  const userDetails = useQuery({
    queryKey: ['user', user.id],
    queryFn: async () => {
      const response = await usersAPI.getDetails(user.id);
      return response.data;
    },
    enabled: isOpen && !!user.id,
  });

  const details = userDetails.data || user;

  const handleViewHourlyDetails = (month) => {
    setSelectedMonth(month);
    setShowHourlyModal(true);
  };

  // Calculate total for fixed employee
  const fixedTotal = details.fixed_employee_details?.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0) || 0;

  // Calculate total for hourly employee
  const hourlyTotal = details.hourly_employee_details?.reduce((sum, item) => sum + parseFloat(item.final_total || 0), 0) || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={
      <span className="font-bold text-blue-600 uppercase">{details.username || 'Employee Details'}</span>
    } size="5xl">
      <div className="space-y-4">
        {/* =================== ROW 1: PROFILE + CONTACT =================== */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile */}
              <div className="border-r pr-4 flex items-start">
                <div className="text-center mr-3">
                  <a href={details.profile_picture_url || '#'} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={details.profile_picture_url || `https://ui-avatars.com/api/?name=${details.first_name}+${details.last_name}`}
                      alt={`${details.first_name} ${details.last_name}`}
                      className="w-24 h-24 rounded-full object-cover border mb-2"
                    />
                  </a>
                  {/* Status */}
                  <div className="font-semibold">
                    <span className={`px-2 py-1 rounded text-xs ${details.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {details.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div>
                  <h5 className="mb-2 font-bold text-lg">
                    <span>{details.first_name || '-'}</span> <span>{details.last_name || '-'}</span>
                  </h5>
                  {/* Designations */}
                  <div className="mb-1 text-blue-600 font-semibold text-sm">
                    {details.designations?.map(d => d.title).join(' | ') || '—'}
                  </div>
                  {/* Technologies */}
                  <div className="text-gray-500 text-xs">
                    {details.technologies?.map(t => t.name).join(' | ') || '—'}
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="pl-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Employee ID:</strong> <span>{details.id || '-'}</span></p>
                    <p><strong>Phone:</strong> <span>{details.phone || '-'}</span></p>
                  </div>
                  <div>
                    <p><strong>Email:</strong> <span>{details.email || '-'}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================== ROW 2: PERSONAL + JOB + BANK =================== */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal */}
              <div className={`${details.employee_type === 'salary' ? 'border-r pr-4' : 'md:col-span-1 border-r pr-4'}`} id="pdetails">
                <h6 className="font-bold mb-3 border-b pb-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  Personal Details
                </h6>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {/* Username + Password */}
                  <div>
                    <p><strong>Username:</strong> <span>{details.username || '-'}</span></p>
                  </div>
                  <div>
                    <p className="flex items-center">
                      <strong>Password:</strong>
                      <span className="mx-2">{showPassword ? details.password || 'Not Set' : '••••••••'}</span>
                      <button 
                        type="button"
                        className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </button>
                    </p>
                  </div>

                  {/* Current + Permanent Address */}
                  <div className="col-span-2">
                    <p><strong>Current Address:</strong> <span className="break-words">{details.current_address || '-'}</span></p>
                  </div>
                  <div className="col-span-2">
                    <p><strong>Permanent Address:</strong> <span className="break-words">{details.permanent_address || '-'}</span></p>
                  </div>

                  {/* Gender + Birth Date */}
                  <div>
                    <p><strong>Gender:</strong> <span>{details.gender || '-'}</span></p>
                  </div>
                  <div>
                    <p><strong>Birth Date:</strong> <span>{details.birth_date || '-'}</span></p>
                  </div>

                  {/* Marital Status (full row) */}
                  <div className="col-span-2">
                    <p><strong>Marital Status:</strong> <span>{details.marital_status || '-'}</span></p>
                  </div>
                </div>
              </div>

              {/* Job + Bank */}
              <div className="pl-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Job Section (Salary Employees) */}
                  {details.employee_type === 'salary' && (
                    <div className="border-r pr-4" id="job-section">
                      <h6 className="font-bold mb-3 border-b pb-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Job
                      </h6>
                      <div className="text-sm space-y-1">
                        <p><strong>Type:</strong> <span>{details.employee_type || '-'}</span></p>
                        <p><strong>Shift Time:</strong> <span>{details.shift_time || '-'}</span></p>
                        <p><strong>Salary:</strong> <span>{details.type_salary_value || '-'}</span></p>
                        <p><strong>Joining:</strong> <span>{details.joining_date || '-'}</span></p>
                        <p><strong>Last Date:</strong> <span>{details.last_date || '-'}</span></p>
                      </div>
                    </div>
                  )}

                  {/* Bank */}
                  <div className={details.employee_type === 'salary' ? '' : 'col-span-2'} id="bdetails">
                    <h6 className="font-bold mb-3 border-b pb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      Bank
                    </h6>
                    <div className="text-sm space-y-1">
                      <p className="flex flex-nowrap"><strong className="mr-2">Holder:</strong> <span className="whitespace-nowrap">{details.account_holder || '-'}</span></p>
                      <p className="flex flex-nowrap"><strong className="mr-2">Number:</strong> <span className="whitespace-nowrap">{details.account_number || '-'}</span></p>
                      <p className="flex flex-nowrap"><strong className="mr-2">IFSC:</strong> <span className="whitespace-nowrap">{details.ifsc_code || '-'}</span></p>
                      <p className="flex flex-nowrap"><strong className="mr-2">Branch:</strong> <span className="whitespace-nowrap">{details.branch || '-'}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================== ROW 3: FIXED EMPLOYEE DETAILS =================== */}
        {details.employee_type === 'fixed' && (
          <div className="bg-white rounded-lg border shadow-sm" id="fixed-employee-section">
            <div className="p-4">
              <h6 className="font-bold mb-3 border-b pb-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Job Details
              </h6>

              {/* Top row: Type | Joining | Last */}
              <div className="grid grid-cols-3 gap-4 mb-3 text-center font-semibold text-sm">
                <div><span>Type: {details.employee_type || '-'}</span></div>
                <div><span>Joining Date: {details.joining_date || '-'}</span></div>
                <div><span>Last Date: {details.last_date || '-'}</span></div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left border">Date</th>
                      <th className="px-4 py-2 text-left border">Description</th>
                      <th className="px-4 py-2 text-left border">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.fixed_employee_details && details.fixed_employee_details.length > 0 ? (
                      details.fixed_employee_details.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 border">{item.date || '-'}</td>
                          <td className="px-4 py-2 border">{item.description || '-'}</td>
                          <td className="px-4 py-2 border">{item.amount || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-center border">No details available</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="font-semibold">
                      <th colSpan="2" className="px-4 py-2 text-left border">Total</th>
                      <th className="px-4 py-2 text-left border">{fixedTotal.toFixed(2)}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =================== HOURLY EMPLOYEE DETAILS =================== */}
        {details.employee_type === 'hourly' && (
          <div className="bg-white rounded-lg border shadow-sm" id="hourly-employee-section">
            <div className="p-4">
              <h6 className="font-bold mb-3 border-b pb-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Hourly Job Details
              </h6>

              {/* Top row: Type | Joining | Last */}
              <div className="grid grid-cols-3 gap-4 mb-3 text-center font-semibold text-sm">
                <div><span>Type: {details.employee_type || '-'}</span></div>
                <div><span>Joining: {details.joining_date || '-'}</span></div>
                <div><span>Last: {details.last_date || '-'}</span></div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left border">Date</th>
                      <th className="px-4 py-2 text-left border">Working Hour</th>
                      <th className="px-4 py-2 text-left border">Total</th>
                      <th className="px-4 py-2 text-left border">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.hourly_employee_details && details.hourly_employee_details.length > 0 ? (
                      details.hourly_employee_details.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 border">{item.month || '-'}</td>
                          <td className="px-4 py-2 border">{parseFloat(item.total_hours || 0).toFixed(2)}</td>
                          <td className="px-4 py-2 border">{parseFloat(item.final_total || 0).toFixed(2)}</td>
                          <td className="px-4 py-2 border">
                            <button 
                              type="button" 
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                              onClick={() => handleViewHourlyDetails(item.month)}
                            >
                              <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-2 text-center border">No details available</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="font-semibold">
                      <th colSpan="2" className="px-4 py-2 text-left border">Total</th>
                      <th className="px-4 py-2 text-left border">{hourlyTotal.toFixed(2)}</th>
                      <th className="px-4 py-2 border"></th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =================== ROW 4: OTHER =================== */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4">
            <h6 className="font-bold mb-3 border-b pb-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Other Details
            </h6>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p><strong>Projects:</strong></p>
                {details.projects && details.projects.length > 0 ? (
                  <ul className="list-disc list-inside mt-1">
                    {details.projects.map((project, index) => (
                      <li key={index}>{project}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-gray-500">No projects assigned</p>
                )}
              </div>
              <div>
                <p><strong>Document:</strong></p>
                <div className="mt-1">
                  {details.document_link ? (
                    <a href={details.document_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      View Document
                    </a>
                  ) : (
                    <span className="text-gray-500">No document provided</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Details Modal */}
      {showHourlyModal && selectedMonth && (
        <HourlyDetailsModal
          isOpen={showHourlyModal}
          onClose={() => {
            setShowHourlyModal(false);
            setSelectedMonth(null);
          }}
          userId={details.id}
          month={selectedMonth}
        />
      )}
    </Modal>
  );
};

// Hourly Details Modal Component
const HourlyDetailsModal = ({ isOpen, onClose, userId, month }) => {
  const hourlyDetails = useQuery({
    queryKey: ['hourly-details', userId, month],
    queryFn: async () => {
      const response = await usersAPI.getHourlyDetails(userId, month);
      return response.data.hourwise || [];
    },
    enabled: isOpen && !!userId && !!month,
  });

  const details = hourlyDetails.data || [];
  
  // Calculate grand total
  const grandTotal = details.reduce((sum, item) => sum + parseFloat(item.final_total || 0), 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Hourly Details - ${month}`} size="4xl" nested={true}>
      <div className="bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left border">Date</th>
                <th className="px-4 py-2 text-left border">Working Hour</th>
                <th className="px-4 py-2 text-left border">Description</th>
                <th className="px-4 py-2 text-left border">Amount</th>
                <th className="px-4 py-2 text-left border">Final Total</th>
              </tr>
            </thead>
            <tbody>
              {details.length > 0 ? (
                details.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{item.date || '-'}</td>
                    <td className="px-4 py-2 border">{item.total_hours || 0}</td>
                    <td className="px-4 py-2 border">{item.description || '-'}</td>
                    <td className="px-4 py-2 border">{item.amount || 0}</td>
                    <td className="px-4 py-2 border">{item.final_total || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500 border">
                    No records
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="font-semibold">
                <th colSpan="4" className="px-4 py-2 text-left border">Grand Total</th>
                <th className="px-4 py-2 text-left border">{grandTotal.toFixed(2)}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </Modal>
  );
};

// Add Fixed Amount Modal Component
const AddAmountModal = ({ isOpen, onClose, user }) => {
  const [formData, setFormData] = useState({
    amount: '',
    date: '',
    description: '',
  });
  const queryClient = useQueryClient();

  const addAmountMutation = useMutation({
    mutationFn: async (data) => {
      const response = await usersAPI.addFixedDetails({
        user_id: user.id,
        ...data,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Fixed amount added successfully');
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['user', user.id] });
        onClose();
        setFormData({ amount: '', date: '', description: '' });
      } else {
        if (data.flat_errors) {
          data.flat_errors.forEach(msg => toast.error(msg));
        } else if (data.errors) {
          Object.entries(data.errors).forEach(([field, msgs]) => {
            msgs.forEach(msg => toast.error(`${field}: ${msg}`));
          });
        }
      }
    },
    onError: () => {
      toast.error('Unexpected error while saving fixed amount');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addAmountMutation.mutate(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Fixed Amount Details" size="3xl">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Employee Info */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h6 className="font-bold mb-3 flex items-center text-gray-700">
              <User className="h-4 w-4 mr-2" />
              Employee Info
            </h6>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                <input
                  type="text"
                  value={`${user.first_name} ${user.last_name}`}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Amount Details */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h6 className="font-bold mb-3 flex items-center text-gray-700">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Amount Details
            </h6>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={addAmountMutation.isPending}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {addAmountMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Add Hourly Amount Modal Component
const AddHourlyAmountModal = ({ isOpen, onClose, user }) => {
  const [formData, setFormData] = useState({
    amount: '',
    date: '',
    working_hours: '',
    description: '',
  });
  const queryClient = useQueryClient();

  // Calculate total automatically
  const total = (parseFloat(formData.amount) || 0) * (parseFloat(formData.working_hours) || 0);

  const addHourlyMutation = useMutation({
    mutationFn: async (data) => {
      const response = await usersAPI.addHourlyDetails({
        user_id: user.id,
        ...data,
        total: total.toFixed(2),
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Hourly details added successfully');
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['user', user.id] });
        onClose();
        setFormData({ amount: '', date: '', working_hours: '', description: '' });
      } else {
        if (data.flat_errors) {
          data.flat_errors.forEach(msg => toast.error(msg));
        } else if (data.errors) {
          Object.entries(data.errors).forEach(([field, msgs]) => {
            msgs.forEach(msg => toast.error(`${field}: ${msg}`));
          });
        }
      }
    },
    onError: () => {
      toast.error('Unexpected error while saving hourly details');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addHourlyMutation.mutate(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Hourly Amount Details" size="3xl">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Employee Info */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h6 className="font-bold mb-3 flex items-center text-gray-700">
              <User className="h-4 w-4 mr-2" />
              Employee Info
            </h6>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                <input
                  type="text"
                  value={`${user.first_name} ${user.last_name}`}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Hourly Details */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h6 className="font-bold mb-3 flex items-center text-gray-700">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Hourly Details
            </h6>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount per Hour *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount per hour"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Working Hours *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.working_hours}
                  onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                  placeholder="Enter total working hours"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h6 className="font-bold mb-3 flex items-center text-gray-700">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Additional Info
            </h6>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Final Total</label>
                <input
                  type="text"
                  value={total.toFixed(2)}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 font-semibold text-green-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={addHourlyMutation.isPending}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {addHourlyMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Edit User Modal Component
const EditUserModal = ({ isOpen, onClose, onSubmit, user }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        ...user,
        role: user.role?.id || '',
        designations: user.designations?.map(d => d.id.toString()) || [],
        technologies: user.technologies?.map(t => t.id.toString()) || [],
        password: '', // Don't pre-fill password
      });
      // Set image preview if user has profile picture
      if (user.profile_picture_url) {
        setImagePreview(user.profile_picture_url);
      }
    }
  }, [user, isOpen]);

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesAPI.getAll,
    enabled: isOpen,
  });

  const { data: designations, isLoading: designationsLoading, error: designationsError } = useQuery({
    queryKey: ['designations'],
    queryFn: async () => {
      const response = await lookupsAPI.designations.getAll();
      return response.data;
    },
    enabled: isOpen,
  });

  const { data: technologies, isLoading: technologiesLoading, error: technologiesError } = useQuery({
    queryKey: ['technologies'],
    queryFn: async () => {
      const response = await lookupsAPI.technologies.getAll();
      return response.data;
    },
    enabled: isOpen,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={<><Edit className="h-5 w-5 mr-2" />Edit Employee</>} size="6xl">
      <form onSubmit={handleSubmit}>
        <div className="p-6" style={{ maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <tbody>
                {/* Personal Details */}
                <tr className="bg-blue-50">
                  <th colSpan="4" className="px-4 py-2 text-left border font-semibold">
                    <User className="inline h-4 w-4 mr-2" />Personal Details
                  </th>
                </tr>
                <tr>
                  <th className="px-4 py-2 border bg-gray-50">First Name</th>
                  <td className="px-4 py-2 border">
                    <input type="text" name="first_name" value={formData.first_name || ''} onChange={(e) => setFormData({...formData, first_name: e.target.value})} className="w-full px-2 py-1 border rounded" placeholder="Enter first name" />
                  </td>
                  <th className="px-4 py-2 border bg-gray-50">Last Name</th>
                  <td className="px-4 py-2 border">
                    <input type="text" name="last_name" value={formData.last_name || ''} onChange={(e) => setFormData({...formData, last_name: e.target.value})} className="w-full px-2 py-1 border rounded" placeholder="Enter last name" />
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-2 border bg-gray-50">Username</th>
                  <td className="px-4 py-2 border">
                    <input type="text" name="username" value={formData.username || ''} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full px-2 py-1 border rounded" placeholder="Choose a username" />
                  </td>
                  <th className="px-4 py-2 border bg-gray-50">Password</th>
                  <td className="px-4 py-2 border">
                    <div className="flex gap-2">
                      <input type={showPassword ? "text" : "password"} name="password" value={formData.password || ''} onChange={(e) => setFormData({...formData, password: e.target.value})} className="flex-1 px-2 py-1 border rounded" placeholder="Leave blank to keep current" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-2 py-1 border rounded hover:bg-gray-100">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-2 border bg-gray-50">Gender</th>
                  <td className="px-4 py-2 border">
                    <SelectField
                      value={[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' }
                      ].find(option => option.value === formData.gender) || null}
                      onChange={(selectedOption) => setFormData({...formData, gender: selectedOption?.value || ''})}
                      options={[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' }
                      ]}
                      placeholder="-- Select --"
                      isClearable
                    />
                  </td>
                  <th className="px-4 py-2 border bg-gray-50">Birth Date</th>
                  <td className="px-4 py-2 border">
                    <input type="date" name="birth_date" value={formData.birth_date || ''} onChange={(e) => setFormData({...formData, birth_date: e.target.value})} className="w-full px-2 py-1 border rounded" />
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-2 border bg-gray-50">Marital Status</th>
                  <td colSpan="3" className="px-4 py-2 border">
                    <SelectField
                      value={[
                        { value: 'single', label: 'Single' },
                        { value: 'married', label: 'Married' },
                        { value: 'divorced', label: 'Divorced' },
                        { value: 'widowed', label: 'Widowed' }
                      ].find(option => option.value === formData.marital_status) || null}
                      onChange={(selectedOption) => setFormData({...formData, marital_status: selectedOption?.value || ''})}
                      options={[
                        { value: 'single', label: 'Single' },
                        { value: 'married', label: 'Married' },
                        { value: 'divorced', label: 'Divorced' },
                        { value: 'widowed', label: 'Widowed' }
                      ]}
                      placeholder="-- Select --"
                      isClearable
                    />
                  </td>
                </tr>

                {/* Job Details */}
                <tr className="bg-blue-50">
                  <th colSpan="4" className="px-4 py-2 text-left border font-semibold">
                    <Shield className="inline h-4 w-4 mr-2" />Job Details
                  </th>
                </tr>
                <tr>
                  <th className="px-4 py-2 border bg-gray-50">Employee Type</th>
                  <td className="px-4 py-2 border">
                    <SelectField
                      value={[
                        { value: 'hourly', label: 'Hourly' },
                        { value: 'fixed', label: 'Fixed' },
                        { value: 'salary', label: 'Salary' }
                      ].find(option => option.value === formData.employee_type) || null}
                      onChange={(selectedOption) => setFormData({...formData, employee_type: selectedOption?.value || ''})}
                      options={[
                        { value: 'hourly', label: 'Hourly' },
                        { value: 'fixed', label: 'Fixed' },
                        { value: 'salary', label: 'Salary' }
                      ]}
                      placeholder="-- Select --"
                      isClearable
                    />
                  </td>
                  <th className="px-4 py-2 border bg-gray-50">Salary</th>
                  <td className="px-4 py-2 border">
                    <input type="number" name="salary" value={formData.salary || ''} onChange={(e) => setFormData({...formData, salary: e.target.value})} className="w-full px-2 py-1 border rounded" placeholder="Enter salary" />
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-2 border bg-gray-50">Shift Time</th>
                  <td colSpan="3" className="px-4 py-2 border">
                    <SelectField
                      value={[
                        { value: '10-19', label: '10 AM - 7 PM' },
                        { value: '21-6', label: '9 PM - 6 AM' }
                      ].find(option => option.value === formData.shift_time) || null}
                      onChange={(selectedOption) => setFormData({...formData, shift_time: selectedOption?.value || ''})}
                      options={[
                        { value: '10-19', label: '10 AM - 7 PM' },
                        { value: '21-6', label: '9 PM - 6 AM' }
                      ]}
                      placeholder="-- Select Shift --"
                      isClearable
                    />
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-2 border bg-gray-50">Joining Date</th>
                  <td className="px-4 py-2 border">
                    <input type="date" name="joining_date" value={formData.joining_date || ''} onChange={(e) => setFormData({...formData, joining_date: e.target.value})} className="w-full px-2 py-1 border rounded" />
                  </td>
                  <th className="px-4 py-2 border bg-gray-50">Last Date</th>
                  <td className="px-4 py-2 border">
                    <input type="date" name="last_date" value={formData.last_date || ''} onChange={(e) => setFormData({...formData, last_date: e.target.value})} className="w-full px-2 py-1 border rounded" />
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-2 border bg-gray-50">Designations</th>
                  <td className="px-4 py-2 border">
                    {designationsLoading ? (
                      <div className="text-sm text-gray-500">Loading...</div>
                    ) : designationsError ? (
                      <div className="text-sm text-red-500">Error loading</div>
                    ) : (
                      <SelectField
                        value={designations?.results?.filter(d => formData.designations?.includes(d.id.toString())).map(d => ({ value: d.id, label: d.title })) || []}
                        onChange={(selectedOptions) => {
                          const values = selectedOptions ? selectedOptions.map(option => option.value.toString()) : [];
                          setFormData({...formData, designations: values});
                        }}
                        options={designations?.results?.map(d => ({ value: d.id, label: d.title })) || []}
                        placeholder="Select designations"
                        isMulti
                        closeMenuOnSelect={false}
                      />
                    )}
                  </td>
                  <th className="px-4 py-2 border bg-gray-50">Technologies</th>
                  <td className="px-4 py-2 border">
                    {technologiesLoading ? (
                      <div className="text-sm text-gray-500">Loading...</div>
                    ) : technologiesError ? (
                      <div className="text-sm text-red-500">Error loading</div>
                    ) : (
                      <SelectField
                        value={technologies?.results?.filter(t => formData.technologies?.includes(t.id.toString())).map(t => ({ value: t.id, label: t.name })) || []}
                        onChange={(selectedOptions) => {
                          const values = selectedOptions ? selectedOptions.map(option => option.value.toString()) : [];
                          setFormData({...formData, technologies: values});
                        }}
                        options={technologies?.results?.map(t => ({ value: t.id, label: t.name })) || []}
                        placeholder="Select technologies"
                        isMulti
                        closeMenuOnSelect={false}
                      />
                    )}
                  </td>
                </tr>

                {/* Contact Details */}
                <tr className="bg-blue-50">
                  <th colSpan="4" className="px-4 py-2 text-left border font-semibold">
                    <Phone className="inline h-4 w-4 mr-2" />Contact Details
                  </th>
                </tr>
                <tr>
                  <th className="px-4 py-2 border bg-gray-50">Current Address</th>
                  <td colSpan="3" className="px-4 py-2 border">
                    <textarea name="current_address" value={formData.current_address || ''} onChange={(e) => setFormData({...formData, current_address: e.target.value})} className="w-full px-2 py-1 border rounded" rows="2" placeholder="Enter current address"></textarea>
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-2 border bg-gray-50">Permanent Address</th>
                  <td colSpan="3" className="px-4 py-2 border">
                    <textarea name="permanent_address" value={formData.permanent_address || ''} onChange={(e) => setFormData({...formData, permanent_address: e.target.value})} className="w-full px-2 py-1 border rounded" rows="2" placeholder="Enter permanent address"></textarea>
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-2 border bg-gray-50">Phone</th>
                  <td className="px-4 py-2 border">
                    <input type="text" name="phone" value={formData.phone || ''} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-2 py-1 border rounded" placeholder="Enter phone number" />
                  </td>
                  <th className="px-4 py-2 border bg-gray-50">Email</th>
                  <td className="px-4 py-2 border">
                    <input type="email" name="email" value={formData.email || ''} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-2 py-1 border rounded" placeholder="Enter email address" />
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-2 border bg-gray-50">Document Link</th>
                  <td colSpan="3" className="px-4 py-2 border">
                    <input type="url" name="document_link" value={formData.document_link || ''} onChange={(e) => setFormData({...formData, document_link: e.target.value})} className="w-full px-2 py-1 border rounded" placeholder="https://example.com/document" />
                  </td>
                </tr>

                {/* Bank Details */}
                <tr className="bg-blue-50">
                  <th colSpan="4" className="px-4 py-2 text-left border font-semibold">
                    Bank Details
                  </th>
                </tr>
                <tr>
                  <th className="px-4 py-2 border bg-gray-50">Account Holder Name</th>
                  <td className="px-4 py-2 border">
                    <input type="text" name="account_holder" value={formData.account_holder || ''} onChange={(e) => setFormData({...formData, account_holder: e.target.value})} className="w-full px-2 py-1 border rounded uppercase" placeholder="Enter account holder name" />
                  </td>
                  <th className="px-4 py-2 border bg-gray-50">Account Number</th>
                  <td className="px-4 py-2 border">
                    <input type="text" name="account_number" value={formData.account_number || ''} onChange={(e) => setFormData({...formData, account_number: e.target.value})} className="w-full px-2 py-1 border rounded uppercase" placeholder="Enter account number" />
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-2 border bg-gray-50">IFSC Code</th>
                  <td className="px-4 py-2 border">
                    <input type="text" name="ifsc_code" value={formData.ifsc_code || ''} onChange={(e) => setFormData({...formData, ifsc_code: e.target.value})} className="w-full px-2 py-1 border rounded uppercase" placeholder="Enter IFSC code" />
                  </td>
                  <th className="px-4 py-2 border bg-gray-50">Branch</th>
                  <td className="px-4 py-2 border">
                    <input type="text" name="branch" value={formData.branch || ''} onChange={(e) => setFormData({...formData, branch: e.target.value})} className="w-full px-2 py-1 border rounded uppercase" placeholder="Enter branch" />
                  </td>
                </tr>

                {/* Other */}
                <tr className="bg-blue-50">
                  <th colSpan="4" className="px-4 py-2 text-left border font-semibold">
                    Other
                  </th>
                </tr>
                <tr>
                  <th className="px-4 py-2 border bg-gray-50">Profile Picture</th>
                  <td colSpan="3" className="px-4 py-2 border">
                    <div className="flex items-center gap-4">
                      {imagePreview && (
                        <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-indigo-200" />
                      )}
                      <div className="flex-1">
                        <input 
                          type="file" 
                          name="profile_picture" 
                          id="edit_profile_picture"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            setFormData({...formData, profile_picture: file});
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setImagePreview(reader.result);
                              reader.readAsDataURL(file);
                            }
                          }} 
                          className="hidden"
                          accept="image/*" 
                        />
                        <label 
                          htmlFor="edit_profile_picture"
                          className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-100 cursor-pointer transition-colors"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Choose Image
                        </label>
                        {formData.profile_picture && (
                          <span className="ml-3 text-sm text-gray-600">{formData.profile_picture.name}</span>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-2 border bg-gray-50">Active</th>
                  <td colSpan="3" className="px-4 py-2 border">
                    <label className="flex items-center">
                      <input type="checkbox" name="is_active" checked={formData.is_active || false} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} className="mr-2" />
                      Is Active
                    </label>
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-2 border bg-gray-50">Staff</th>
                  <td colSpan="3" className="px-4 py-2 border">
                    <label className="flex items-center">
                      <input type="checkbox" name="is_staff" checked={formData.is_staff || false} onChange={(e) => setFormData({...formData, is_staff: e.target.checked})} className="mr-2" />
                      Is Staff
                    </label>
                  </td>
                </tr>
                <tr>
                  <th className="px-4 py-2 border bg-gray-50">Superuser</th>
                  <td colSpan="3" className="px-4 py-2 border">
                    <label className="flex items-center">
                      <input type="checkbox" name="is_superuser" checked={formData.is_superuser || false} onChange={(e) => setFormData({...formData, is_superuser: e.target.checked})} className="mr-2" />
                      Is Superuser
                    </label>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            <Edit className="inline h-4 w-4 mr-1" />
            Update Employee
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Add User Modal Component
const AddUserModal = ({ isOpen, onClose, onSubmit }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  
  // CRITICAL SECURITY: Always return fresh empty object - NEVER reference any existing user data
  const getInitialFormData = () => {
    // Create a completely new object each time to prevent any reference issues
    return {
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      employee_type: '',
      salary: '',
      shift_time: '',
      joining_date: '',
      last_date: '',
      designations: [],
      technologies: [],
      current_address: '',
      permanent_address: '',
      document_link: '',
      gender: '',
      birth_date: '',
      marital_status: '',
      account_holder: '',
      account_number: '',
      ifsc_code: '',
      branch: '',
      profile_picture: null,
      is_active: true,
      is_staff: false,
      is_superuser: false,
    };
  };
  
  // CRITICAL: Initialize with empty data - NO DEFAULT STATE
  const [formData, setFormData] = useState(() => getInitialFormData());
  
  // Validation functions
  const validateField = (name, value) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'first_name':
        if (!value.trim()) {
          newErrors.first_name = 'First name is required';
        } else if (value.length < 2) {
          newErrors.first_name = 'First name must be at least 2 characters';
        } else {
          delete newErrors.first_name;
        }
        break;
        
      case 'last_name':
        if (!value.trim()) {
          newErrors.last_name = 'Last name is required';
        } else if (value.length < 2) {
          newErrors.last_name = 'Last name must be at least 2 characters';
        } else {
          delete newErrors.last_name;
        }
        break;
        
      case 'username':
        if (!value.trim()) {
          newErrors.username = 'Username is required';
        } else if (value.length < 3) {
          newErrors.username = 'Username must be at least 3 characters';
        } else {
          delete newErrors.username;
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'password':
        if (!value.trim()) {
          newErrors.password = 'Password is required';
        } else if (value.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else {
          delete newErrors.password;
        }
        break;
        
      case 'phone':
        const phoneRegex = /^[0-9]{10}$/;
        if (value && !phoneRegex.test(value.replace(/\D/g, ''))) {
          newErrors.phone = 'Please enter a valid 10-digit phone number';
        } else {
          delete newErrors.phone;
        }
        break;
        
      case 'birth_date':
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          if (age < 18) {
            newErrors.birth_date = 'Employee must be at least 18 years old';
          } else {
            delete newErrors.birth_date;
          }
        }
        break;
        
      case 'employee_type':
        if (!value) {
          newErrors.employee_type = 'Employee type is required';
        } else {
          delete newErrors.employee_type;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-generate username when first name changes
  const handleFirstNameChange = (e) => {
    const firstName = e.target.value;
    const generatedUsername = firstName ? `DW_${firstName.toUpperCase()}` : '';
    setFormData({
      ...formData, 
      first_name: firstName,
      username: generatedUsername
    });
    validateField('first_name', firstName);
  };

  // Handle input changes with validation
  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };
  
  // CRITICAL SECURITY FIX: Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Force complete reset to empty state - clear all fields
      const emptyData = getInitialFormData();
      setFormData(emptyData);
      setShowPassword(false);
      setImagePreview(null);
      setErrors({});
      
      // Additional security: Log to verify reset
      console.log('🔒 SECURITY: Add Employee Modal Reset - All fields cleared');
    } else {
      // Also reset when closing to prevent any data persistence
      const emptyData = getInitialFormData();
      setFormData(emptyData);
      setShowPassword(false);
      setImagePreview(null);
      setErrors({});
    }
  }, [isOpen]);

  // Load roles for user assignment
  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: rolesAPI.getAll,
    enabled: isOpen,
  });

  const { data: designations, isLoading: designationsLoading, error: designationsError } = useQuery({
    queryKey: ['designations'],
    queryFn: async () => {
      console.log('🔍 Fetching Designations...');
      const response = await lookupsAPI.designations.getAll();
      console.log('✅ Designations Response:', response);
      console.log('📦 Designations Data:', response.data);
      return response.data;
    },
    enabled: isOpen,
  });

  const { data: technologies, isLoading: technologiesLoading, error: technologiesError } = useQuery({
    queryKey: ['technologies'],
    queryFn: async () => {
      console.log('🔍 Fetching Technologies...');
      const response = await lookupsAPI.technologies.getAll();
      console.log('✅ Technologies Response:', response);
      console.log('📦 Technologies Data:', response.data);
      return response.data;
    },
    enabled: isOpen,
  });

  // Debug logging
  useEffect(() => {
    if (isOpen) {
      console.log('🚀 Modal Opened - isOpen:', isOpen);
      console.log('📊 Designations:', designations);
      console.log('📊 Technologies:', technologies);
      console.log('❌ Designations Error:', designationsError);
      console.log('❌ Technologies Error:', technologiesError);
    }
  }, [isOpen, designations, technologies, designationsError, technologiesError]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate all required fields
    const requiredFields = ['first_name', 'last_name', 'username', 'email', 'password', 'employee_type'];
    let hasErrors = false;
    
    requiredFields.forEach(field => {
      if (!validateField(field, formData[field])) {
        hasErrors = true;
      }
    });
    
    // Validate birth_date if provided
    if (formData.birth_date) {
      if (!validateField('birth_date', formData.birth_date)) {
        hasErrors = true;
      }
    }
    
    // Validate phone if provided
    if (formData.phone) {
      if (!validateField('phone', formData.phone)) {
        hasErrors = true;
      }
    }
    
    if (hasErrors) {
      toast.error('Please fix the errors below before submitting');
      return;
    }
    
    onSubmit(formData);
    // CRITICAL SECURITY: Reset form completely after submission
    const emptyData = getInitialFormData();
    setFormData(emptyData);
    setShowPassword(false);
    setImagePreview(null);
    setErrors({});
    console.log('🔒 SECURITY: Form submitted and reset to empty state');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={<><User className="inline h-5 w-5 mr-2" />Add New Employee</>} size="6xl">
      <form onSubmit={handleSubmit}>
        <div className="overflow-x-auto" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <table className="w-full border-collapse border">
            <tbody>
              {/* Personal Details */}
              <tr className="bg-blue-50">
                <th colSpan="4" className="px-4 py-2 text-left border font-semibold">
                  <User className="inline h-4 w-4 mr-2" />Personal Details
                </th>
              </tr>
              <tr>
                <th className="px-4 py-2 border bg-gray-50 w-1/4">First Name *</th>
                <td className="px-4 py-2 border w-1/4">
                  <input 
                    type="text" 
                    name="first_name" 
                    value={formData.first_name} 
                    onChange={handleFirstNameChange} 
                    className={`w-full px-2 py-1 border rounded ${errors.first_name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter first name" 
                  />
                  {errors.first_name && <div className="text-red-500 text-xs mt-1">{errors.first_name}</div>}
                </td>
                <th className="px-4 py-2 border bg-gray-50 w-1/4">Last Name *</th>
                <td className="px-4 py-2 border w-1/4">
                  <input 
                    type="text" 
                    name="last_name" 
                    value={formData.last_name} 
                    onChange={(e) => handleInputChange('last_name', e.target.value)} 
                    className={`w-full px-2 py-1 border rounded ${errors.last_name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter last name" 
                  />
                  {errors.last_name && <div className="text-red-500 text-xs mt-1">{errors.last_name}</div>}
                </td>
              </tr>
              <tr>
                <th className="px-4 py-2 border bg-gray-50">Username *</th>
                <td className="px-4 py-2 border">
                  <input 
                    type="text" 
                    name="username" 
                    value={formData.username} 
                    onChange={(e) => handleInputChange('username', e.target.value)} 
                    className={`w-full px-2 py-1 border rounded bg-gray-50 ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Auto-generated (DW_FIRSTNAME)" 
                  />
                  {errors.username && <div className="text-red-500 text-xs mt-1">{errors.username}</div>}
                </td>
                <th className="px-4 py-2 border bg-gray-50">Password *</th>
                <td className="px-4 py-2 border">
                  <div className="flex gap-1">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="password" 
                      value={formData.password} 
                      onChange={(e) => handleInputChange('password', e.target.value)} 
                      className={`flex-1 px-2 py-1 border rounded ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter password" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-2 py-1 border rounded hover:bg-gray-100">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <div className="text-red-500 text-xs mt-1">{errors.password}</div>}
                </td>
              </tr>
              <tr>
                <th className="px-4 py-2 border bg-gray-50">Gender</th>
                <td className="px-4 py-2 border">
                  <SelectField
                    value={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' }
                    ].find(option => option.value === formData.gender) || null}
                    onChange={(selectedOption) => setFormData({...formData, gender: selectedOption?.value || ''})}
                    options={[
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' }
                    ]}
                    placeholder="-- Select --"
                    isClearable
                  />
                </td>
                <th className="px-4 py-2 border bg-gray-50">Birth Date</th>
                <td className="px-4 py-2 border">
                  <input 
                    type="date" 
                    name="birth_date" 
                    value={formData.birth_date} 
                    onChange={(e) => handleInputChange('birth_date', e.target.value)} 
                    className={`w-full px-2 py-1 border rounded ${errors.birth_date ? 'border-red-500' : 'border-gray-300'}`}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  />
                  {errors.birth_date && <div className="text-red-500 text-xs mt-1">{errors.birth_date}</div>}
                  <div className="text-gray-500 text-xs mt-1">Must be at least 18 years old</div>
                </td>
              </tr>
              <tr>
                <th className="px-4 py-2 border bg-gray-50">Marital Status</th>
                <td colSpan="3" className="px-4 py-2 border">
                  <SelectField
                    value={[
                      { value: 'single', label: 'Single' },
                      { value: 'married', label: 'Married' },
                      { value: 'divorced', label: 'Divorced' },
                      { value: 'widowed', label: 'Widowed' }
                    ].find(option => option.value === formData.marital_status) || null}
                    onChange={(selectedOption) => setFormData({...formData, marital_status: selectedOption?.value || ''})}
                    options={[
                      { value: 'single', label: 'Single' },
                      { value: 'married', label: 'Married' },
                      { value: 'divorced', label: 'Divorced' },
                      { value: 'widowed', label: 'Widowed' }
                    ]}
                    placeholder="-- Select --"
                    isClearable
                  />
                </td>
              </tr>

              {/* Job Details */}
              <tr className="bg-blue-50">
                <th colSpan="4" className="px-4 py-2 text-left border font-semibold">
                  <Shield className="inline h-4 w-4 mr-2" />Job Details
                </th>
              </tr>
              <tr>
                <th className="px-4 py-2 border bg-gray-50">Employee Type *</th>
                <td className="px-4 py-2 border">
                  <SelectField
                    value={[
                      { value: 'hourly', label: 'Hourly' },
                      { value: 'fixed', label: 'Fixed' },
                      { value: 'salary', label: 'Salary' }
                    ].find(option => option.value === formData.employee_type) || null}
                    onChange={(selectedOption) => handleInputChange('employee_type', selectedOption?.value || '')}
                    options={[
                      { value: 'hourly', label: 'Hourly' },
                      { value: 'fixed', label: 'Fixed' },
                      { value: 'salary', label: 'Salary' }
                    ]}
                    placeholder="-- Select --"
                    isClearable
                  />
                  {errors.employee_type && <div className="text-red-500 text-xs mt-1">{errors.employee_type}</div>}
                </td>
                <th className="px-4 py-2 border bg-gray-50">Salary</th>
                <td className="px-4 py-2 border">
                  <input type="number" name="salary" value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} className="w-full px-2 py-1 border rounded" placeholder="Enter salary" />
                </td>
              </tr>
              <tr>
                <th className="px-4 py-2 border bg-gray-50">Shift Time</th>
                <td colSpan="3" className="px-4 py-2 border">
                  <SelectField
                    value={[
                      { value: '10-19', label: '10 AM - 7 PM' },
                      { value: '21-6', label: '9 PM - 6 AM' }
                    ].find(option => option.value === formData.shift_time) || null}
                    onChange={(selectedOption) => setFormData({...formData, shift_time: selectedOption?.value || ''})}
                    options={[
                      { value: '10-19', label: '10 AM - 7 PM' },
                      { value: '21-6', label: '9 PM - 6 AM' }
                    ]}
                    placeholder="-- Select Shift --"
                    isClearable
                  />
                </td>
              </tr>
              <tr>
                <th className="px-4 py-2 border bg-gray-50">Joining Date</th>
                <td className="px-4 py-2 border">
                  <input type="date" name="joining_date" value={formData.joining_date} onChange={(e) => setFormData({...formData, joining_date: e.target.value})} className="w-full px-2 py-1 border rounded" />
                </td>
                <th className="px-4 py-2 border bg-gray-50">Last Date</th>
                <td className="px-4 py-2 border">
                  <input type="date" name="last_date" value={formData.last_date} onChange={(e) => setFormData({...formData, last_date: e.target.value})} className="w-full px-2 py-1 border rounded" />
                </td>
              </tr>
              <tr>
                <th className="px-4 py-2 border bg-gray-50">Designations</th>
                <td className="px-4 py-2 border">
                  {designationsLoading ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                  ) : designationsError ? (
                    <div className="text-sm text-red-500">Error loading</div>
                  ) : (
                    <SelectField
                      value={designations?.results?.filter(d => formData.designations.includes(d.id.toString())).map(d => ({ value: d.id, label: d.title })) || []}
                      onChange={(selectedOptions) => {
                        const values = selectedOptions ? selectedOptions.map(option => option.value.toString()) : [];
                        setFormData({...formData, designations: values});
                      }}
                      options={designations?.results?.map(d => ({ value: d.id, label: d.title })) || []}
                      placeholder="Select designations"
                      isMulti
                      closeMenuOnSelect={false}
                    />
                  )}
                </td>
                <th className="px-4 py-2 border bg-gray-50">Technologies</th>
                <td className="px-4 py-2 border">
                  {technologiesLoading ? (
                    <div className="text-sm text-gray-500">Loading...</div>
                  ) : technologiesError ? (
                    <div className="text-sm text-red-500">Error loading</div>
                  ) : (
                    <SelectField
                      value={technologies?.results?.filter(t => formData.technologies.includes(t.id.toString())).map(t => ({ value: t.id, label: t.name })) || []}
                      onChange={(selectedOptions) => {
                        const values = selectedOptions ? selectedOptions.map(option => option.value.toString()) : [];
                        setFormData({...formData, technologies: values});
                      }}
                      options={technologies?.results?.map(t => ({ value: t.id, label: t.name })) || []}
                      placeholder="Select technologies"
                      isMulti
                      closeMenuOnSelect={false}
                    />
                  )}
                </td>
              </tr>

              {/* Contact Details */}
              <tr className="bg-blue-50">
                <th colSpan="4" className="px-4 py-2 text-left border font-semibold">
                  <Phone className="inline h-4 w-4 mr-2" />Contact Details
                </th>
              </tr>
              <tr>
                <th className="px-4 py-2 border bg-gray-50">Current Address</th>
                <td colSpan="3" className="px-4 py-2 border">
                  <textarea name="current_address" value={formData.current_address} onChange={(e) => setFormData({...formData, current_address: e.target.value})} className="w-full px-2 py-1 border rounded" rows="2" placeholder="Enter current address"></textarea>
                </td>
              </tr>
              <tr>
                <th className="px-4 py-2 border bg-gray-50">Permanent Address</th>
                <td colSpan="3" className="px-4 py-2 border">
                  <textarea name="permanent_address" value={formData.permanent_address} onChange={(e) => setFormData({...formData, permanent_address: e.target.value})} className="w-full px-2 py-1 border rounded" rows="2" placeholder="Enter permanent address"></textarea>
                </td>
              </tr>
              <tr>
                <th className="px-4 py-2 border bg-gray-50">Phone</th>
                <td className="px-4 py-2 border">
                  <input 
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={(e) => handleInputChange('phone', e.target.value)} 
                    className={`w-full px-2 py-1 border rounded ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter 10-digit phone number" 
                  />
                  {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
                </td>
                <th className="px-4 py-2 border bg-gray-50">Email *</th>
                <td className="px-4 py-2 border">
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={(e) => handleInputChange('email', e.target.value)} 
                    className={`w-full px-2 py-1 border rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter email address" 
                  />
                  {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
                </td>
              </tr>
              <tr>
                <th className="px-4 py-2 border bg-gray-50">Document Link</th>
                <td colSpan="3" className="px-4 py-2 border">
                  <input type="url" name="document_link" value={formData.document_link} onChange={(e) => setFormData({...formData, document_link: e.target.value})} className="w-full px-2 py-1 border rounded" placeholder="https://example.com/document" />
                </td>
              </tr>

              {/* Bank Details */}
              <tr className="bg-blue-50">
                <th colSpan="4" className="px-4 py-2 text-left border font-semibold">
                  <IdCard className="inline h-4 w-4 mr-2" />Bank Details
                </th>
              </tr>
              <tr>
                <th className="px-4 py-2 border bg-gray-50">Account Holder Name</th>
                <td className="px-4 py-2 border">
                  <input type="text" name="account_holder" value={formData.account_holder} onChange={(e) => setFormData({...formData, account_holder: e.target.value.toUpperCase()})} className="w-full px-2 py-1 border rounded uppercase" placeholder="Enter account holder name" />
                </td>
                <th className="px-4 py-2 border bg-gray-50">Account Number</th>
                <td className="px-4 py-2 border">
                  <input type="text" name="account_number" value={formData.account_number} onChange={(e) => setFormData({...formData, account_number: e.target.value.toUpperCase()})} className="w-full px-2 py-1 border rounded uppercase" placeholder="Enter account number" />
                </td>
              </tr>
              <tr>
                <th className="px-4 py-2 border bg-gray-50">IFSC Code</th>
                <td className="px-4 py-2 border">
                  <input type="text" name="ifsc_code" value={formData.ifsc_code} onChange={(e) => setFormData({...formData, ifsc_code: e.target.value.toUpperCase()})} className="w-full px-2 py-1 border rounded uppercase" placeholder="Enter IFSC code" />
                </td>
                <th className="px-4 py-2 border bg-gray-50">Branch</th>
                <td className="px-4 py-2 border">
                  <input type="text" name="branch" value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value.toUpperCase()})} className="w-full px-2 py-1 border rounded uppercase" placeholder="Enter branch" />
                </td>
              </tr>

              {/* Other */}
              <tr className="bg-blue-50">
                <th colSpan="4" className="px-4 py-2 text-left border font-semibold">
                  Other
                </th>
              </tr>
              <tr>
                <th className="px-4 py-2 border bg-gray-50">Profile Picture</th>
                <td colSpan="3" className="px-4 py-2 border">
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border-2 border-indigo-200" />
                    )}
                    <div className="flex-1">
                      <input 
                        type="file" 
                        name="profile_picture" 
                        id="profile_picture"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setFormData({...formData, profile_picture: file});
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setImagePreview(reader.result);
                            reader.readAsDataURL(file);
                          }
                        }} 
                        className="hidden"
                        accept="image/*" 
                      />
                      <label 
                        htmlFor="profile_picture"
                        className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200 hover:bg-indigo-100 cursor-pointer transition-colors"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Choose Image
                      </label>
                      {formData.profile_picture && (
                        <span className="ml-3 text-sm text-gray-600">{formData.profile_picture.name}</span>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
              <tr>
                <th className="px-4 py-2 border bg-gray-50">Active</th>
                <td colSpan="3" className="px-4 py-2 border">
                  <label className="flex items-center">
                    <input type="checkbox" name="is_active" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} className="mr-2" />
                    Is Active
                  </label>
                </td>
              </tr>
              <tr>
                <th className="px-4 py-2 border bg-gray-50">Staff</th>
                <td colSpan="3" className="px-4 py-2 border">
                  <label className="flex items-center">
                    <input type="checkbox" name="is_staff" checked={formData.is_staff} onChange={(e) => setFormData({...formData, is_staff: e.target.checked})} className="mr-2" />
                    Is Staff
                  </label>
                </td>
              </tr>
              <tr>
                <th className="px-4 py-2 border bg-gray-50">Superuser</th>
                <td colSpan="3" className="px-4 py-2 border">
                  <label className="flex items-center">
                    <input type="checkbox" name="is_superuser" checked={formData.is_superuser} onChange={(e) => setFormData({...formData, is_superuser: e.target.checked})} className="mr-2" />
                    Is Superuser
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">
            <span className="flex items-center gap-1">Cancel</span>
          </button>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
            <span className="flex items-center gap-1">Save Employee</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddAmountModal, setShowAddAmountModal] = useState(false);
  const [showAddHourlyModal, setShowAddHourlyModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users', { search: searchTerm }],
    queryFn: () => usersAPI.getAll({ search: searchTerm || undefined }),
    placeholderData: (previousData) => previousData,
  });

  const createMutation = useMutation({
    mutationFn: usersAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Employee created successfully');
      setShowAddModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create employee');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: usersAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Employee deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => usersAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Employee updated successfully');
      setShowEditModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update employee');
    },
  });

  const handleCreateUser = (formData) => {
    // Transform data to FormData for file upload and proper backend format
    const data = new FormData();
    
    // Add all form fields to FormData
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      
      if (value !== null && value !== undefined) {
        if (key === 'designations' || key === 'technologies') {
          // Special handling for many-to-many fields - ensure they're arrays
          const arrayValue = Array.isArray(value) ? value : (value ? [value] : []);
          arrayValue.forEach(item => {
            if (item) { // Only add non-empty items
              data.append(key, item);
            }
          });
        } else if (key === 'profile_picture' && value instanceof File) {
          // Handle file upload
          data.append(key, value);
        } else if (key === 'is_active' || key === 'is_staff' || key === 'is_superuser') {
          // Handle boolean fields - Django expects "on" for true checkboxes
          if (value === true) {
            data.append(key, 'on');
          }
          // Don't append anything for false values
        } else if (value !== '') {
          // Regular fields - only add non-empty values
          data.append(key, value);
        }
      }
    });
    
    // Debug: Show what's being sent
    console.log('🚀 Submitting user data:');
    for (let [key, value] of data.entries()) {
      console.log(`${key}:`, value);
    }
    
    createMutation.mutate(data);
  };

  const handleUpdateUser = (formData) => {
    updateMutation.mutate({ id: selectedUser.id, data: formData });
  };

  const handleDeleteUser = async (user) => {
    const confirmed = await showDeleteConfirmDialog(`"${user.first_name} ${user.last_name}"`);
    if (confirmed) {
      deleteMutation.mutate(user.id);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleAddAmount = (user) => {
    setSelectedUser(user);
    setShowAddAmountModal(true);
  };

  const handleAddHourlyAmount = (user) => {
    setSelectedUser(user);
    setShowAddHourlyModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const usersList = users?.data?.results || [];
  
  // Calculate stats
  const totalUsers = usersList.length;
  const activeUsers = usersList.filter(user => user.is_active).length;
  const inactiveUsers = totalUsers - activeUsers;
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const newUsersThisMonth = usersList.filter(user => {
    const createdDate = new Date(user.date_joined);
    return createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear;
  }).length;

  return (
    <div className="space-y-6">
      {/* User Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h6 className="text-sm font-medium text-gray-600 mb-1">Total Users</h6>
              <h4 className="text-2xl font-bold text-blue-600">{totalUsers}</h4>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <UsersIcon className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h6 className="text-sm font-medium text-gray-600 mb-1">Active Users</h6>
              <h4 className="text-2xl font-bold text-green-600">{activeUsers}</h4>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h6 className="text-sm font-medium text-gray-600 mb-1">This Month</h6>
              <h4 className="text-2xl font-bold text-yellow-600">{newUsersThisMonth}</h4>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <IdCard className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h6 className="text-sm font-medium text-gray-600 mb-1">Inactive Users</h6>
              <h4 className="text-2xl font-bold text-red-600">{inactiveUsers}</h4>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">All Employees</h4>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Employee
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usersList.length > 0 ? (
                usersList.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {user.username}
                      </button>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{user.phone || '-'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.designations?.map(d => d.title).join(', ') || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{user.employee_type}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-green-600 hover:text-green-800"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        {user.employee_type === 'fixed' && (
                          <button
                            onClick={() => handleAddAmount(user)}
                            className="text-green-600 hover:text-green-800"
                            title="Add Amount"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                        {user.employee_type === 'hourly' && (
                          <button
                            onClick={() => handleAddHourlyAmount(user)}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Add Hourly Details"
                          >
                            <PlusCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateUser}
      />

      {selectedUser && (
        <EditUserModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateUser}
          user={selectedUser}
        />
      )}

      {selectedUser && (
        <ViewUserModal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          user={selectedUser}
        />
      )}

      {selectedUser && (
        <AddAmountModal
          isOpen={showAddAmountModal}
          onClose={() => {
            setShowAddAmountModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}

      {selectedUser && (
        <AddHourlyAmountModal
          isOpen={showAddHourlyModal}
          onClose={() => {
            setShowAddHourlyModal(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}
    </div>
  );
};

export default Users;
