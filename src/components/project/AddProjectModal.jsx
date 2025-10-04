import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { usersAPI, lookupsAPI, quotationsAPI } from '../../services/api';
import Modal from '../Modal';
import QuotationSection from './QuotationSection';
import ProjectDetailsSection from './ProjectDetailsSection';

const AddProjectModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    quotation: '', inquiry_date: '', lead_source: '', quotation_sent: '', demo_given: '',
    quotation_amount: '', approval_amount: '', client_industry: '', client_name: '', contract_signed: '',
    project_name: '', project_type: '', start_date: '', deadline: '', technologies: [], app_modes: [],
    status: '', team_members: [], payment_value: '', payment_status: 'Pending',
    live_link: '', postman_collection: '', data_folder: '', other_link: '',
    frontend_link: '', backend_link: '', other_expense: '', developer_charge: '', server_charge: '', 
    domain_charge: '', third_party_api_charge: '', mediator_charge: '', completed_date: '',
    free_service: '', notes: ''
  });

  const { data: quotations } = useQuery({ queryKey: ['quotations'], queryFn: quotationsAPI.getAll, enabled: isOpen });
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: usersAPI.getAll, enabled: isOpen });
  const { data: technologies } = useQuery({ queryKey: ['technologies'], queryFn: lookupsAPI.technologies.getAll, enabled: isOpen });
  const { data: appModes } = useQuery({ queryKey: ['appModes'], queryFn: lookupsAPI.appModes.getAll, enabled: isOpen });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Transform data to match Django serializer expectations
    const transformedData = {
      ...formData,
      // Convert array field names to match serializer
      team_member_ids: formData.team_members,
      technology_ids: formData.technologies,
      app_mode_ids: formData.app_modes,
      // Remove the original array fields
      team_members: undefined,
      technologies: undefined,
      app_modes: undefined,
      // Convert empty strings to null for optional fields
      quotation: formData.quotation || null,
      inquiry_date: formData.inquiry_date || null,
      start_date: formData.start_date || null,
      deadline: formData.deadline || null,
      completed_date: formData.completed_date || null,
      // Convert empty strings to null for numeric fields
      quotation_amount: formData.quotation_amount || null,
      approval_amount: formData.approval_amount || null,
      payment_value: formData.payment_value || null,
      other_expense: formData.other_expense || null,
      developer_charge: formData.developer_charge || null,
      server_charge: formData.server_charge || null,
      domain_charge: formData.domain_charge || null,
      third_party_api_charge: formData.third_party_api_charge || null,
      mediator_charge: formData.mediator_charge || null,
    };

    // Remove undefined fields
    Object.keys(transformedData).forEach(key => {
      if (transformedData[key] === undefined) {
        delete transformedData[key];
      }
    });

    console.log('Submitting project data:', transformedData);
    onSubmit(transformedData);
    
    // Reset form
    setFormData({
      quotation: '', inquiry_date: '', lead_source: '', quotation_sent: '', demo_given: '',
      quotation_amount: '', approval_amount: '', client_industry: '', client_name: '', contract_signed: '',
      project_name: '', project_type: '', start_date: '', deadline: '', technologies: [], app_modes: [],
      status: '', team_members: [], payment_value: '', payment_status: 'Pending',
      live_link: '', postman_collection: '', data_folder: '', other_link: '',
      frontend_link: '', backend_link: '', other_expense: '', developer_charge: '', server_charge: '', 
      domain_charge: '', third_party_api_charge: '', mediator_charge: '', completed_date: '',
      free_service: '', notes: ''
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={<><Plus className="h-5 w-5 mr-2" />Add New Project</>} size="6xl">
      <div className="relative">
        {/* Scrollable Content */}
        <div className="p-6" style={{ maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
              <tbody>
                <QuotationSection 
                  formData={formData} 
                  setFormData={setFormData} 
                  quotations={quotations} 
                />
                <ProjectDetailsSection 
                  formData={formData} 
                  setFormData={setFormData} 
                  technologies={technologies}
                  appModes={appModes}
                  users={users}
                />
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Fixed Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <form onSubmit={handleSubmit} className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            >
              Save Project
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default AddProjectModal;
