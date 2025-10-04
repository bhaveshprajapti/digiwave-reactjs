import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Code } from 'lucide-react';
import { technologiesAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { showDeleteConfirmDialog } from '../utils/sweetAlert';
import toast from 'react-hot-toast';

const TechnologyModal = ({ isOpen, onClose, onSubmit, technology = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: technology?.name || ''
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
    <Modal isOpen={isOpen} onClose={onClose} title={technology ? 'Edit Technology' : 'Add Technology'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Technology Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., React, Node.js, Python, Java"
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
            {isLoading ? 'Saving...' : (technology ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const Technologies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTechnology, setEditingTechnology] = useState(null);
  const queryClient = useQueryClient();

  const { data: technologies, isLoading } = useQuery({
    queryKey: ['technologies', { search: searchTerm }],
    queryFn: () => technologiesAPI.getAll({ search: searchTerm || undefined }),
    placeholderData: (previousData) => previousData,
  });

  const createMutation = useMutation({
    mutationFn: technologiesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] });
      toast.success('Technology created successfully');
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 
                          Object.values(error.response?.data || {}).flat().join(', ') ||
                          'Failed to create technology';
      toast.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => technologiesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] });
      toast.success('Technology updated successfully');
      setIsEditModalOpen(false);
      setEditingTechnology(null);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 
                          Object.values(error.response?.data || {}).flat().join(', ') ||
                          'Failed to update technology';
      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: technologiesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['technologies'] });
      toast.success('Technology deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete technology');
    },
  });

  const handleCreateTechnology = (formData) => {
    createMutation.mutate(formData);
  };

  const handleEditTechnology = (technology) => {
    setEditingTechnology(technology);
    setIsEditModalOpen(true);
  };

  const handleUpdateTechnology = (formData) => {
    updateMutation.mutate({ id: editingTechnology.id, data: formData });
  };

  const handleDeleteTechnology = async (technologyId) => {
    const confirmed = await showDeleteConfirmDialog('this technology');
    if (confirmed) {
      deleteMutation.mutate(technologyId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const technologiesList = technologies?.data?.results || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Technology Management</h1>
          <p className="text-gray-600 mt-1">Manage technologies and programming languages</p>
        </div>
        <div className="text-sm text-gray-500">
          Total Technologies: {technologiesList.length}
        </div>
      </div>

      {/* Technologies Grid */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search technologies..."
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
              Add Technology
            </button>
          </div>
        </div>

        {technologiesList.length > 0 ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {technologiesList.map((technology) => (
                <div
                  key={technology.id}
                  className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <Code className="h-6 w-6 text-blue-500 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">{technology.name}</h3>
                        {technology.created_at && (
                          <p className="text-xs text-gray-400">
                            Added {new Date(technology.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditTechnology(technology)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTechnology(technology.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No technologies found.</p>
          </div>
        )}
      </div>

      {/* Add Technology Modal */}
      <TechnologyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateTechnology}
        isLoading={createMutation.isPending}
      />

      {/* Edit Technology Modal */}
      <TechnologyModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTechnology(null);
        }}
        onSubmit={handleUpdateTechnology}
        technology={editingTechnology}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
};

export default Technologies;