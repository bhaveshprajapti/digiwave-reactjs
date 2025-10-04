import React from 'react';
import { User, X } from 'lucide-react';
import Modal from '../Modal';

const UserDetailsModal = ({ isOpen, onClose, user }) => {
  if (!user) return null;

  const formatArray = (array, field = 'project_name') => {
    if (!array || array.length === 0) return 'No projects assigned';
    return array.map(item => item[field] || item).join(', ');
  };

  const DetailRow = ({ label, value, colSpan = 1 }) => (
    <tr>
      <th className="p-3 text-left font-medium bg-gray-50 border border-gray-300 w-1/4">
        {label}
      </th>
      <td colSpan={colSpan} className="p-3 border border-gray-300 text-gray-900">
        {value || '-'}
      </td>
    </tr>
  );

  const TwoColumnRow = ({ label1, value1, label2, value2 }) => (
    <tr>
      <th className="p-3 text-left font-medium bg-gray-50 border border-gray-300 w-1/4">
        {label1}
      </th>
      <td className="p-3 border border-gray-300 text-gray-900 w-1/4">
        {value1 || '-'}
      </td>
      <th className="p-3 text-left font-medium bg-gray-50 border border-gray-300 w-1/4">
        {label2}
      </th>
      <td className="p-3 border border-gray-300 text-gray-900 w-1/4">
        {value2 || '-'}
      </td>
    </tr>
  );

  const getStatusBadge = (isActive) => (
    <span className={`px-2 py-1 rounded text-xs font-medium ${
      isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );

  const getProfilePicture = () => {
    if (user.profile_picture) {
      return (
        <img 
          src={user.profile_picture} 
          alt={`${user.first_name} ${user.last_name}`}
          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
        />
      );
    }
    
    // Default avatar with initials
    const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
    return (
      <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-lg border-2 border-gray-200">
        {initials || <User className="h-8 w-8" />}
      </div>
    );
  };

  const getProjectsList = () => {
    // Check multiple possible project data sources
    const projects = user.projects || user.user_projects || user.assigned_projects || [];
    
    // Also check if projects are available in a different format
    let projectList = [];
    
    if (projects && projects.length > 0) {
      projectList = projects;
    } else {
      // Try to get projects from the global projects data where this user is a team member
      // This would need to be passed from the parent component
      console.log('User data:', user); // Debug log to see the actual structure
    }
    
    if (!projectList || projectList.length === 0) {
      return <span className="text-gray-500 italic">No projects assigned</span>;
    }
    
    return (
      <ul className="list-disc list-inside space-y-1">
        {projectList.map((project, index) => (
          <li key={index} className="text-sm text-gray-700">
            {project.project_name || project.name || project}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div className="flex items-center">
          <User className="h-5 w-5 mr-2" />
          <span className="font-bold">User Details</span>
        </div>
      } 
      size="xl"
    >
      <div className="relative">
        {/* Scrollable Content */}
        <div className="p-6" style={{ maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
              <tbody>
                <DetailRow 
                  label="Username" 
                  value={user.username} 
                  colSpan={3} 
                />
                
                <TwoColumnRow 
                  label1="First Name" 
                  value1={user.first_name}
                  label2="Last Name" 
                  value2={user.last_name}
                />
                
                <TwoColumnRow 
                  label1="Email" 
                  value1={user.email}
                  label2="Phone" 
                  value2={user.phone}
                />
                
                <TwoColumnRow 
                  label1="Designation" 
                  value1={user.designation?.name || user.designation}
                  label2="Status" 
                  value2={getStatusBadge(user.is_active)}
                />
                
                <DetailRow 
                  label="Role" 
                  value={user.role?.display_name || user.role?.name || 'No role assigned'} 
                  colSpan={3} 
                />
                
                <DetailRow 
                  label="Projects" 
                  value={getProjectsList()} 
                  colSpan={3} 
                />
                
                <DetailRow 
                  label="Profile Picture" 
                  value={getProfilePicture()} 
                  colSpan={3} 
                />
                
                {user.date_joined && (
                  <DetailRow 
                    label="Date Joined" 
                    value={new Date(user.date_joined).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} 
                    colSpan={3} 
                  />
                )}
                
                {user.last_login && (
                  <DetailRow 
                    label="Last Login" 
                    value={new Date(user.last_login).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} 
                    colSpan={3} 
                  />
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Fixed Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end">
            <button 
              onClick={onClose} 
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UserDetailsModal;
