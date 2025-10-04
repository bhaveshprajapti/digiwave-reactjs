import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Search, Filter, Edit, Trash2, Eye, Users, Calendar, FolderOpen, Clock,
  CheckCircle, XCircle, AlertCircle, Loader
} from 'lucide-react';
import { projectsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AddProjectModal from '../components/project/AddProjectModal';
import EditProjectModal from '../components/project/EditProjectModal';
import ProjectDetailsModal from '../components/project/ProjectDetailsModal';
import UserDetailsModal from '../components/user/UserDetailsModal';
import { showDeleteConfirmDialog } from '../utils/sweetAlert';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const statusColors = {
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Completed': 'bg-green-100 text-green-800',
    'On Hold': 'bg-blue-100 text-blue-800',
    'Cancelled': 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};


const Projects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', { search: searchTerm, status: statusFilter }],
    queryFn: () => projectsAPI.getAll({ 
      search: searchTerm || undefined,
      status: statusFilter || undefined 
    }),
    placeholderData: (previousData) => previousData,
  });

  const createMutation = useMutation({
    mutationFn: projectsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project created successfully');
      setIsAddModalOpen(false);
    },
    onError: (error) => {
      console.error('Project creation error:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail ||
                          Object.values(error.response?.data || {}).flat().join(', ') ||
                          'Failed to create project';
      toast.error(errorMessage);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => projectsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project updated successfully');
      setIsEditModalOpen(false);
      setEditingProject(null);
    },
    onError: (error) => {
      console.error('Project update error:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.detail ||
                          Object.values(error.response?.data || {}).flat().join(', ') ||
                          'Failed to update project';
      toast.error(errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: projectsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    },
  });

  const handleCreateProject = (formData) => {
    createMutation.mutate(formData);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = (formData) => {
    updateMutation.mutate({ id: editingProject.id, data: formData });
  };

  const handleViewProject = (project) => {
    setSelectedProject(project);
    setIsDetailsModalOpen(true);
  };

  const handleViewUser = (user) => {
    // Find all projects where this user is a team member
    const userProjects = projectsList.filter(project => 
      project.team_members?.some(member => member.id === user.id)
    );
    
    // Add projects to user data
    const userWithProjects = {
      ...user,
      projects: userProjects
    };
    
    setSelectedUser(userWithProjects);
    setIsUserModalOpen(true);
  };

  const handleDeleteProject = async (projectId) => {
    const confirmed = await showDeleteConfirmDialog('this project');
    if (confirmed) {
      deleteMutation.mutate(projectId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const projectsList = projects?.data?.results || [];
  
  // Calculate stats
  const totalProjects = projectsList.length;
  const inProgressCount = projectsList.filter(p => p.status === 'In Progress').length;
  const completedCount = projectsList.filter(p => p.status === 'Completed').length;
  const cancelledCount = projectsList.filter(p => p.status === 'Cancelled').length;

  return (
    <div className="space-y-6">
      {/* Project Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h6 className="text-sm font-medium text-gray-600 mb-1">Total Projects</h6>
              <h4 className="text-2xl font-bold text-blue-600">{totalProjects}</h4>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FolderOpen className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h6 className="text-sm font-medium text-gray-600 mb-1">In Progress</h6>
              <h4 className="text-2xl font-bold text-yellow-600">{inProgressCount}</h4>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <Loader className="h-5 w-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h6 className="text-sm font-medium text-gray-600 mb-1">Completed</h6>
              <h4 className="text-2xl font-bold text-green-600">{completedCount}</h4>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h6 className="text-sm font-medium text-gray-600 mb-1">Cancelled</h6>
              <h4 className="text-2xl font-bold text-red-600">{cancelledCount}</h4>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* All Projects Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-semibold text-gray-900">All Projects</h4>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                <Filter className="h-4 w-4" />
                Filter
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Project
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr No.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">App Mode</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Members</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projectsList.length > 0 ? (
                projectsList.map((project, index) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{project.project_id}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div 
                        className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
                        onClick={() => handleViewProject(project)}
                      >
                        {project.project_name}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.start_date ? new Date(project.start_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {project.app_modes?.length > 0 ? project.app_modes.map(mode => mode.name).join(', ') : '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {project.team_members?.slice(0, 3).map((member, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors"
                            title={`${member.first_name} ${member.last_name}`}
                            onClick={() => handleViewUser(member)}
                          >
                            {member.first_name} {member.last_name}
                          </span>
                        ))}
                        {project.team_members?.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            +{project.team_members.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEditProject(project)}
                          className="text-blue-600 hover:text-blue-800" 
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
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
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Project Modal */}
      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateProject}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleUpdateProject}
        project={editingProject}
      />

      {/* Project Details Modal */}
      <ProjectDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedProject(null);
        }}
        project={selectedProject}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </div>
  );
};

export default Projects;