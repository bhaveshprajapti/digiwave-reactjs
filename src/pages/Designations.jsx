import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Briefcase } from 'lucide-react';
import { designationsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { showDeleteConfirmDialog } from '../utils/sweetAlert';
import toast from 'react-hot-toast';

const DesignationModal = ({ isOpen, onClose, onSubmit, designation = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: designation?.title || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={designation ? 'Edit Designation' : 'Add Designation'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Designation Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Software Developer, Project Manager"
            required
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : (designation ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const Designations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState(null);
  const queryClient = useQueryClient();

  const { data: designations, isLoading } = useQuery({
    queryKey: ['designations', { search: searchTerm }],
    queryFn: () => designationsAPI.getAll({ search: searchTerm || undefined }),
    placeholderData: (previousData) => previousData,
  });

  const createMutation = useMutation({
    mutationFn: designationsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      toast.success('Designation created successfully');
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 
                          Object.values(error.response?.data || {}).flat().join(', ') ||
                          'Failed to create designation';
      toast.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => designationsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      toast.success('Designation updated successfully');
      setIsEditModalOpen(false);
      setEditingDesignation(null);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 
                          Object.values(error.response?.data || {}).flat().join(', ') ||
                          'Failed to update designation';
      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: designationsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      toast.success('Designation deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete designation');
    },
  });

  const handleCreateDesignation = (formData) => {
    createMutation.mutate(formData);
  };

  const handleEditDesignation = (designation) => {
    setEditingDesignation(designation);
    setIsEditModalOpen(true);
  };

  const handleUpdateDesignation = (formData) => {
    updateMutation.mutate({ id: editingDesignation.id, data: formData });
  };

  const handleDeleteDesignation = async (designationId) => {
    const confirmed = await showDeleteConfirmDialog('this designation');
    if (confirmed) {
      deleteMutation.mutate(designationId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const designationsList = designations?.data?.results || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Designation Management</h1>
          <p className="text-gray-600 mt-1">Manage employee designations and job titles</p>
        </div>
        <div className="text-sm text-gray-500">
          Total Designations: {designationsList.length}
        </div>
      </div>

      {/* Designations Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search designations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Designation
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {designationsList.length > 0 ? (
                designationsList.map((designation, index) => (
                  <tr key={designation.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 text-gray-400 mr-3" />
                        <div className="font-medium text-gray-900">{designation.title}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {designation.created_at ? new Date(designation.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditDesignation(designation)}
                          className="text-blue-600 hover:text-blue-800" 
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDesignation(designation.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    No designations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Designation Modal */}
      <DesignationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateDesignation}
        isLoading={createMutation.isPending}
      />

      {/* Edit Designation Modal */}
      <DesignationModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingDesignation(null);
        }}
        onSubmit={handleUpdateDesignation}
        designation={editingDesignation}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
};

export default Designations;