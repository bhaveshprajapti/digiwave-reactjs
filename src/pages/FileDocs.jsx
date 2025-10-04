import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Search, Edit, Trash2, Eye, Folder, FolderOpen, 
  File, Upload, Download, ArrowLeft, MoreVertical
} from 'lucide-react';
import { fileDocsAPI, projectsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { showDeleteConfirmDialog } from '../utils/sweetAlert';
import toast from 'react-hot-toast';

const FolderModal = ({ isOpen, onClose, onSubmit, folder = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: folder?.name || '',
    project: folder?.project?.id || ''
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsAPI.getAll()
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
    <Modal isOpen={isOpen} onClose={onClose} title={folder ? 'Edit Folder' : 'Create Folder'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Folder Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project (Optional)
          </label>
          <select
            name="project"
            value={formData.project}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Project</option>
            {projects?.data?.results?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.project_name}
              </option>
            ))}
          </select>
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
            {isLoading ? 'Creating...' : (folder ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const SubFolderModal = ({ isOpen, onClose, onSubmit, subfolder = null, folderId, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: subfolder?.name || '',
    folder: folderId || subfolder?.folder?.id || ''
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
    <Modal isOpen={isOpen} onClose={onClose} title={subfolder ? 'Edit Subfolder' : 'Create Subfolder'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subfolder Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            {isLoading ? 'Creating...' : (subfolder ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const FileUploadModal = ({ isOpen, onClose, onSubmit, folderId, subfolderId = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    file: null,
    folder: folderId,
    subfolder: subfolderId
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error('Please select a file');
      return;
    }
    
    const uploadData = new FormData();
    uploadData.append('name', formData.name);
    uploadData.append('file', formData.file);
    uploadData.append('folder', formData.folder);
    if (formData.subfolder) {
      uploadData.append('subfolder', formData.subfolder);
    }
    
    onSubmit(uploadData);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload File">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            File Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select File *
          </label>
          <input
            type="file"
            name="file"
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            {isLoading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const FileDocs = () => {
  const [currentView, setCurrentView] = useState('folders'); // 'folders', 'folder', 'subfolder'
  const [currentFolder, setCurrentFolder] = useState(null);
  const [currentSubfolder, setCurrentSubfolder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isSubfolderModalOpen, setIsSubfolderModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [editingSubfolder, setEditingSubfolder] = useState(null);
  
  const queryClient = useQueryClient();

  // Queries
  const { data: folders, isLoading: foldersLoading } = useQuery({
    queryKey: ['folders', { search: searchTerm }],
    queryFn: () => fileDocsAPI.getFolders({ search: searchTerm || undefined }),
    enabled: currentView === 'folders',
  });

  const { data: folderContents, isLoading: folderLoading } = useQuery({
    queryKey: ['folder-contents', currentFolder?.id],
    queryFn: () => fileDocsAPI.getFolderContents(currentFolder.id),
    enabled: currentView === 'folder' && currentFolder,
  });

  const { data: subfolderContents, isLoading: subfolderLoading } = useQuery({
    queryKey: ['subfolder-contents', currentSubfolder?.id],
    queryFn: () => fileDocsAPI.getSubfolderContents(currentSubfolder.id),
    enabled: currentView === 'subfolder' && currentSubfolder,
  });

  // Mutations
  const createFolderMutation = useMutation({
    mutationFn: fileDocsAPI.createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success('Folder created successfully');
      setIsFolderModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create folder');
    },
  });

  const createSubfolderMutation = useMutation({
    mutationFn: fileDocsAPI.createSubfolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folder-contents'] });
      toast.success('Subfolder created successfully');
      setIsSubfolderModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create subfolder');
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: fileDocsAPI.uploadFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folder-contents'] });
      queryClient.invalidateQueries({ queryKey: ['subfolder-contents'] });
      toast.success('File uploaded successfully');
      setIsFileModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    },
  });

  const deleteFolderMutation = useMutation({
    mutationFn: fileDocsAPI.deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast.success('Folder deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete folder');
    },
  });

  const deleteSubfolderMutation = useMutation({
    mutationFn: fileDocsAPI.deleteSubfolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folder-contents'] });
      toast.success('Subfolder deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete subfolder');
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: fileDocsAPI.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folder-contents'] });
      queryClient.invalidateQueries({ queryKey: ['subfolder-contents'] });
      toast.success('File deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete file');
    },
  });

  // Handlers
  const handleCreateFolder = (formData) => {
    createFolderMutation.mutate(formData);
  };

  const handleCreateSubfolder = (formData) => {
    createSubfolderMutation.mutate(formData);
  };

  const handleUploadFile = (formData) => {
    uploadFileMutation.mutate(formData);
  };

  const handleDeleteFolder = async (folderId) => {
    const confirmed = await showDeleteConfirmDialog('this folder and all its contents');
    if (confirmed) {
      deleteFolderMutation.mutate(folderId);
    }
  };

  const handleDeleteSubfolder = async (subfolderId) => {
    const confirmed = await showDeleteConfirmDialog('this subfolder and all its contents');
    if (confirmed) {
      deleteSubfolderMutation.mutate(subfolderId);
    }
  };

  const handleDeleteFile = async (fileId) => {
    const confirmed = await showDeleteConfirmDialog('this file');
    if (confirmed) {
      deleteFileMutation.mutate(fileId);
    }
  };

  const handleFolderClick = (folder) => {
    setCurrentFolder(folder);
    setCurrentView('folder');
  };

  const handleSubfolderClick = (subfolder) => {
    setCurrentSubfolder(subfolder);
    setCurrentView('subfolder');
  };

  const handleBackClick = () => {
    if (currentView === 'subfolder') {
      setCurrentView('folder');
      setCurrentSubfolder(null);
    } else if (currentView === 'folder') {
      setCurrentView('folders');
      setCurrentFolder(null);
    }
  };

  const renderBreadcrumb = () => {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <button 
          onClick={() => setCurrentView('folders')}
          className="hover:text-blue-600"
        >
          File Docs
        </button>
        {currentFolder && (
          <>
            <span>/</span>
            <button 
              onClick={() => setCurrentView('folder')}
              className="hover:text-blue-600"
            >
              {currentFolder.name}
            </button>
          </>
        )}
        {currentSubfolder && (
          <>
            <span>/</span>
            <span className="text-gray-900">{currentSubfolder.name}</span>
          </>
        )}
      </div>
    );
  };

  const renderFolders = () => {
    if (foldersLoading) {
      return <LoadingSpinner size="lg" />;
    }

    const foldersList = folders?.data?.results || [];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {foldersList.map((folder) => (
          <div
            key={folder.id}
            className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div 
                className="flex items-center flex-1"
                onClick={() => handleFolderClick(folder)}
              >
                <FolderOpen className="h-8 w-8 text-blue-500 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600">
                    {folder.name}
                  </h3>
                  {folder.project && (
                    <p className="text-sm text-gray-500">{folder.project.project_name}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {new Date(folder.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingFolder(folder);
                    setIsFolderModalOpen(true);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFolder(folder.id);
                  }}
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
    );
  };

  const renderFolderContents = () => {
    if (folderLoading) {
      return <LoadingSpinner size="lg" />;
    }

    const subfolders = folderContents?.data?.subfolders || [];
    const files = folderContents?.data?.files || [];

    return (
      <div className="space-y-6">
        {/* Subfolders */}
        {subfolders.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Subfolders</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {subfolders.map((subfolder) => (
                <div
                  key={subfolder.id}
                  className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex items-center flex-1"
                      onClick={() => handleSubfolderClick(subfolder)}
                    >
                      <Folder className="h-6 w-6 text-yellow-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                          {subfolder.name}
                        </h4>
                        <p className="text-xs text-gray-400">
                          {new Date(subfolder.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSubfolder(subfolder.id);
                        }}
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
        )}

        {/* Files */}
        {files.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Files</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center flex-1">
                      <File className="h-6 w-6 text-gray-500 mr-3" />
                      <div>
                        <h4 className="font-medium text-gray-900">{file.name}</h4>
                        <p className="text-xs text-gray-400">
                          {new Date(file.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {file.file && (
                        <a
                          href={file.file}
                          download
                          className="p-1 text-gray-400 hover:text-green-600"
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteFile(file.id)}
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
        )}

        {subfolders.length === 0 && files.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>This folder is empty</p>
          </div>
        )}
      </div>
    );
  };

  const renderSubfolderContents = () => {
    if (subfolderLoading) {
      return <LoadingSpinner size="lg" />;
    }

    const files = subfolderContents?.data?.files || [];

    return (
      <div>
        {files.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center flex-1">
                    <File className="h-6 w-6 text-gray-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">{file.name}</h4>
                      <p className="text-xs text-gray-400">
                        {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {file.file && (
                      <a
                        href={file.file}
                        download
                        className="p-1 text-gray-400 hover:text-green-600"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDeleteFile(file.id)}
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
        ) : (
          <div className="text-center py-12 text-gray-500">
            <File className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No files in this subfolder</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            {currentView !== 'folders' && (
              <button
                onClick={handleBackClick}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-2xl font-bold text-gray-900">File Management</h1>
          </div>
          {renderBreadcrumb()}
        </div>
        
        <div className="flex gap-2">
          {currentView === 'folders' && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search folders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setIsFolderModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                New Folder
              </button>
            </>
          )}
          
          {currentView === 'folder' && (
            <>
              <button
                onClick={() => setIsSubfolderModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                New Subfolder
              </button>
              <button
                onClick={() => setIsFileModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Upload className="h-4 w-4" />
                Upload File
              </button>
            </>
          )}
          
          {currentView === 'subfolder' && (
            <button
              onClick={() => setIsFileModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Upload className="h-4 w-4" />
              Upload File
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {currentView === 'folders' && renderFolders()}
        {currentView === 'folder' && renderFolderContents()}
        {currentView === 'subfolder' && renderSubfolderContents()}
      </div>

      {/* Modals */}
      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => {
          setIsFolderModalOpen(false);
          setEditingFolder(null);
        }}
        onSubmit={handleCreateFolder}
        folder={editingFolder}
        isLoading={createFolderMutation.isPending}
      />

      <SubFolderModal
        isOpen={isSubfolderModalOpen}
        onClose={() => setIsSubfolderModalOpen(false)}
        onSubmit={handleCreateSubfolder}
        folderId={currentFolder?.id}
        isLoading={createSubfolderMutation.isPending}
      />

      <FileUploadModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        onSubmit={handleUploadFile}
        folderId={currentFolder?.id}
        subfolderId={currentSubfolder?.id}
        isLoading={uploadFileMutation.isPending}
      />
    </div>
  );
};

export default FileDocs;