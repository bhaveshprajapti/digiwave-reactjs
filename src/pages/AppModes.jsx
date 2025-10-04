import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Smartphone } from 'lucide-react';
import { appModesAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { showDeleteConfirmDialog } from '../utils/sweetAlert';
import toast from 'react-hot-toast';

const AppModeModal = ({ isOpen, onClose, onSubmit, appMode = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: appMode?.name || ''
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
    <Modal isOpen={isOpen} onClose={onClose} title={appMode ? 'Edit App Mode' : 'Add App Mode'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            App Mode Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Web App, Mobile App, Desktop App"
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
            {isLoading ? 'Saving...' : (appMode ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const AppModes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAppMode, setEditingAppMode] = useState(null);
  const queryClient = useQueryClient();

  const { data: appModes, isLoading } = useQuery({
    queryKey: ['appModes', { search: searchTerm }],
    queryFn: () => appModesAPI.getAll({ search: searchTerm || undefined }),
    placeholderData: (previousData) => previousData,
  });

  const createMutation = useMutation({
    mutationFn: appModesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appModes'] });
      toast.success('App mode created successfully');
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 
                          Object.values(error.response?.data || {}).flat().join(', ') ||
                          'Failed to create app mode';
      toast.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => appModesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appModes'] });
      toast.success('App mode updated successfully');
      setIsEditModalOpen(false);
      setEditingAppMode(null);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 
                          Object.values(error.response?.data || {}).flat().join(', ') ||
                          'Failed to update app mode';
      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: appModesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appModes'] });
      toast.success('App mode deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete app mode');
    },
  });

  const handleCreateAppMode = (formData) => {
    createMutation.mutate(formData);
  };

  const handleEditAppMode = (appMode) => {
    setEditingAppMode(appMode);
    setIsEditModalOpen(true);
  };

  const handleUpdateAppMode = (formData) => {
    updateMutation.mutate({ id: editingAppMode.id, data: formData });
  };

  const handleDeleteAppMode = async (appModeId) => {
    const confirmed = await showDeleteConfirmDialog('this app mode');
    if (confirmed) {
      deleteMutation.mutate(appModeId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const appModesList = appModes?.data?.results || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">App Mode Management</h1>
          <p className="text-gray-600 mt-1">Manage application types and platforms</p>
        </div>
        <div className="text-sm text-gray-500">
          Total App Modes: {appModesList.length}
        </div>
      </div>

      {/* App Modes Grid */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search app modes..."
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
              Add App Mode
            </button>
          </div>
        </div>

        {appModesList.length > 0 ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {appModesList.map((appMode) => (
                <div
                  key={appMode.id}
                  className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <Smartphone className="h-6 w-6 text-purple-500 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900">{appMode.name}</h3>
                        {appMode.created_at && (
                          <p className="text-xs text-gray-400">
                            Added {new Date(appMode.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditAppMode(appMode)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAppMode(appMode.id)}
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
            <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No app modes found.</p>
          </div>
        )}
      </div>

      {/* Add App Mode Modal */}
      <AppModeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateAppMode}
        isLoading={createMutation.isPending}
      />

      {/* Edit App Mode Modal */}
      <AppModeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingAppMode(null);
        }}
        onSubmit={handleUpdateAppMode}
        appMode={editingAppMode}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
};

export default AppModes;