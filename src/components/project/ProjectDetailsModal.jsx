import React from 'react';
import { FolderOpen, FileText, Briefcase, DollarSign, Link, X } from 'lucide-react';
import Modal from '../Modal';

const ProjectDetailsModal = ({ isOpen, onClose, project }) => {
  if (!project) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  const formatArray = (array, field = 'name') => {
    if (!array || array.length === 0) return '-';
    return array.map(item => item[field] || item).join(', ');
  };

  const formatLink = (url) => {
    if (!url) return '-';
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-indigo-600 hover:text-indigo-800 underline break-all"
      >
        {url}
      </a>
    );
  };

  const SectionHeader = ({ icon: Icon, title, bgColor, textColor }) => (
    <tr className={`${bgColor}`}>
      <td colSpan="4" className={`p-3 font-semibold ${textColor} border border-gray-300`}>
        <Icon className="inline h-4 w-4 mr-2" />
        {title}
      </td>
    </tr>
  );

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

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div className="flex items-center">
          <FolderOpen className="h-5 w-5 mr-2" />
          <span className="font-bold text-indigo-600 uppercase">
            {project.project_name}
          </span>
        </div>
      } 
      size="6xl"
    >
      <div className="relative">
        {/* Scrollable Content */}
        <div className="p-6" style={{ maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
              <tbody>
                {/* Quotation Details Section */}
                <SectionHeader 
                  icon={FileText} 
                  title="Quotation Details" 
                  bgColor="bg-indigo-50" 
                  textColor="text-indigo-800" 
                />
                
                <DetailRow 
                  label="Quotation" 
                  value={project.quotation?.quotation_no || project.quotation} 
                  colSpan={3} 
                />
                
                <DetailRow 
                  label="Client Name" 
                  value={project.client_name} 
                  colSpan={3} 
                />
                
                <TwoColumnRow 
                  label1="Inquiry Date" 
                  value1={formatDate(project.inquiry_date)}
                  label2="Lead Source" 
                  value2={project.lead_source}
                />
                
                <TwoColumnRow 
                  label1="Quotation Sent?" 
                  value1={project.quotation_sent}
                  label2="Demo Given" 
                  value2={project.demo_given}
                />
                
                <TwoColumnRow 
                  label1="Quotation Amount" 
                  value1={formatCurrency(project.quotation_amount)}
                  label2="Approval Amount" 
                  value2={formatCurrency(project.approval_amount)}
                />
                
                <TwoColumnRow 
                  label1="Client Industry" 
                  value1={project.client_industry}
                  label2="Contract Signed?" 
                  value2={project.contract_signed}
                />

                {/* Project Details Section */}
                <SectionHeader 
                  icon={Briefcase} 
                  title="Project Details" 
                  bgColor="bg-emerald-50" 
                  textColor="text-emerald-800" 
                />
                
                <TwoColumnRow 
                  label1="Project ID" 
                  value1={project.project_id}
                  label2="Project Name" 
                  value2={project.project_name}
                />
                
                <TwoColumnRow 
                  label1="Project Type" 
                  value1={project.project_type}
                  label2="Status" 
                  value2={
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                      project.status === 'On Hold' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {project.status}
                    </span>
                  }
                />
                
                <TwoColumnRow 
                  label1="Start Date" 
                  value1={formatDate(project.start_date)}
                  label2="Deadline" 
                  value2={formatDate(project.deadline)}
                />
                
                <TwoColumnRow 
                  label1="Completed Date" 
                  value1={formatDate(project.completed_date)}
                  label2="Team Members" 
                  value2={formatArray(project.team_members, 'first_name')}
                />
                
                <DetailRow 
                  label="Technologies" 
                  value={formatArray(project.technologies)} 
                  colSpan={3} 
                />
                
                <TwoColumnRow 
                  label1="App Mode" 
                  value1={formatArray(project.app_modes)}
                  label2="Payment Status" 
                  value2={
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      project.payment_status === 'Paid' ? 'bg-green-100 text-green-800' :
                      project.payment_status === 'Advanced' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.payment_status}
                    </span>
                  }
                />

                {/* Financials Section */}
                <SectionHeader 
                  icon={DollarSign} 
                  title="Expense & Income" 
                  bgColor="bg-red-50" 
                  textColor="text-red-800" 
                />
                
                <TwoColumnRow 
                  label1="Other Expense" 
                  value1={formatCurrency(project.other_expense)}
                  label2="Developer Charge" 
                  value2={formatCurrency(project.developer_charge)}
                />
                
                <TwoColumnRow 
                  label1="Server Charge" 
                  value1={formatCurrency(project.server_charge)}
                  label2="3rd Party API Charge" 
                  value2={formatCurrency(project.third_party_api_charge)}
                />
                
                <TwoColumnRow 
                  label1="Mediator Charge" 
                  value1={formatCurrency(project.mediator_charge)}
                  label2="Domain Charge" 
                  value2={formatCurrency(project.domain_charge)}
                />
                
                <TwoColumnRow 
                  label1="Payment Value" 
                  value1={formatCurrency(project.payment_value)}
                  label2="Profit/Loss" 
                  value2={formatCurrency(project.profit_loss)}
                />
                
                <DetailRow 
                  label="Free Service" 
                  value={project.free_service} 
                  colSpan={3} 
                />

                {/* Links Section */}
                <SectionHeader 
                  icon={Link} 
                  title="Project Links" 
                  bgColor="bg-amber-50" 
                  textColor="text-amber-800" 
                />
                
                <DetailRow 
                  label="Live Link" 
                  value={formatLink(project.live_link)} 
                  colSpan={3} 
                />
                
                <DetailRow 
                  label="Postman Collection" 
                  value={formatLink(project.postman_collection)} 
                  colSpan={3} 
                />
                
                <DetailRow 
                  label="Data Folder" 
                  value={formatLink(project.data_folder)} 
                  colSpan={3} 
                />
                
                <DetailRow 
                  label="Other Link" 
                  value={formatLink(project.other_link)} 
                  colSpan={3} 
                />
                
                <DetailRow 
                  label="Frontend Link" 
                  value={formatLink(project.frontend_link)} 
                  colSpan={3} 
                />
                
                <DetailRow 
                  label="Backend Link" 
                  value={formatLink(project.backend_link)} 
                  colSpan={3} 
                />
                
                <DetailRow 
                  label="Notes" 
                  value={project.notes} 
                  colSpan={3} 
                />
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

export default ProjectDetailsModal;
