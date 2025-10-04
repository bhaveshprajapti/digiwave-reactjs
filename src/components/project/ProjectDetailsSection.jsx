import React from 'react';
import { Briefcase } from 'lucide-react';
import { FormSection, FormRow, FormField, Input, SelectField, Textarea } from '../form/index.jsx';

const ProjectDetailsSection = ({ formData, setFormData, technologies, appModes, users }) => {
  const projectTypeOptions = [
    { value: '', label: '-- Select Project Type --' },
    { value: 'Hourly', label: 'Hourly' },
    { value: 'Fixed', label: 'Fix' },
    { value: 'Salary', label: 'Salary' }
  ];

  const statusOptions = [
    { value: '', label: '-- Select --' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Cancelled', label: 'Cancelled' }
  ];

  const paymentStatusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'Paid', label: 'Received' }
  ];

  const technologyOptions = technologies?.data?.results?.map(tech => ({
    value: tech.id,
    label: tech.name
  })) || [];

  const appModeOptions = appModes?.data?.results?.map(mode => ({
    value: mode.id,
    label: mode.name
  })) || [];

  const userOptions = users?.data?.results?.map(user => ({
    value: user.id,
    label: `${user.first_name} ${user.last_name}`
  })) || [];

  const handleProjectTypeChange = (selectedOption) => {
    setFormData({...formData, project_type: selectedOption?.value || ''});
  };

  const handleStatusChange = (selectedOption) => {
    setFormData({...formData, status: selectedOption?.value || ''});
  };

  const handlePaymentStatusChange = (selectedOption) => {
    setFormData({...formData, payment_status: selectedOption?.value || ''});
  };

  const handleTechnologiesChange = (selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData({...formData, technologies: values});
  };

  const handleAppModesChange = (selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData({...formData, app_modes: values});
  };

  const handleTeamMembersChange = (selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setFormData({...formData, team_members: values});
  };

  const selectedTechnologies = technologyOptions.filter(option => 
    formData.technologies.includes(option.value)
  );

  const selectedAppModes = appModeOptions.filter(option => 
    formData.app_modes.includes(option.value)
  );

  const selectedTeamMembers = userOptions.filter(option => 
    formData.team_members.includes(option.value)
  );

  return (
    <>
      <FormSection title="Project Details" icon={Briefcase} bgColor="bg-emerald-50" textColor="text-emerald-800" />
      
      <FormRow>
        <FormField label="Project Name">
          <Input
            required
            value={formData.project_name}
            onChange={(e) => setFormData({...formData, project_name: e.target.value})}
            placeholder="Enter project name"
          />
        </FormField>
        <FormField label="Project Type">
          <SelectField
            value={projectTypeOptions.find(option => option.value === formData.project_type) || null}
            onChange={handleProjectTypeChange}
            options={projectTypeOptions}
            placeholder="-- Select Project Type --"
            isClearable
          />
        </FormField>
      </FormRow>

      <FormRow>
        <FormField label="Start Date">
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({...formData, start_date: e.target.value})}
          />
        </FormField>
        <FormField label="Deadline">
          <Input
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          />
        </FormField>
      </FormRow>

      <FormRow>
        <FormField label="Technologies">
          <SelectField
            value={selectedTechnologies}
            onChange={handleTechnologiesChange}
            options={technologyOptions}
            placeholder="Select technologies"
            isMulti
            closeMenuOnSelect={false}
          />
        </FormField>
        <FormField label="App Mode">
          <SelectField
            value={selectedAppModes}
            onChange={handleAppModesChange}
            options={appModeOptions}
            placeholder="Select app modes"
            isMulti
            closeMenuOnSelect={false}
          />
        </FormField>
      </FormRow>

      <FormRow>
        <FormField label="Status">
          <SelectField
            value={statusOptions.find(option => option.value === formData.status) || null}
            onChange={handleStatusChange}
            options={statusOptions}
            placeholder="-- Select --"
            isClearable
          />
        </FormField>
        <FormField label="Team Members">
          <SelectField
            value={selectedTeamMembers}
            onChange={handleTeamMembersChange}
            options={userOptions}
            placeholder="Select team members"
            isMulti
            closeMenuOnSelect={false}
          />
        </FormField>
      </FormRow>

      <FormRow>
        <FormField label="Payment (₹)">
          <Input
            type="number"
            value={formData.payment_value}
            onChange={(e) => setFormData({...formData, payment_value: e.target.value})}
            placeholder="Enter total payment value"
          />
        </FormField>
        <FormField label="Payment Status">
          <SelectField
            value={paymentStatusOptions.find(option => option.value === formData.payment_status) || null}
            onChange={handlePaymentStatusChange}
            options={paymentStatusOptions}
            placeholder="Select payment status"
          />
        </FormField>
      </FormRow>

      <FormRow>
        <FormField label="Live Link">
          <Input
            type="url"
            value={formData.live_link}
            onChange={(e) => setFormData({...formData, live_link: e.target.value})}
            placeholder="https://example.com"
          />
        </FormField>
        <FormField label="Postman Collection">
          <Input
            type="url"
            value={formData.postman_collection}
            onChange={(e) => setFormData({...formData, postman_collection: e.target.value})}
            placeholder="https://example.com/postman.json"
          />
        </FormField>
      </FormRow>

      <FormRow>
        <FormField label="Data Folder">
          <Input
            type="url"
            value={formData.data_folder}
            onChange={(e) => setFormData({...formData, data_folder: e.target.value})}
            placeholder="https://example.com/data/"
          />
        </FormField>
        <FormField label="Other Link">
          <Input
            type="url"
            value={formData.other_link}
            onChange={(e) => setFormData({...formData, other_link: e.target.value})}
            placeholder="https://example.com/other"
          />
        </FormField>
      </FormRow>

      <FormRow>
        <FormField label="Frontend Link">
          <Input
            type="url"
            value={formData.frontend_link}
            onChange={(e) => setFormData({...formData, frontend_link: e.target.value})}
            placeholder="https://example.com/frontend"
          />
        </FormField>
        <FormField label="Backend Link">
          <Input
            type="url"
            value={formData.backend_link}
            onChange={(e) => setFormData({...formData, backend_link: e.target.value})}
            placeholder="https://example.com/backend"
          />
        </FormField>
      </FormRow>

      <FormRow>
        <FormField label="Other Expense (₹)">
          <Input
            type="number"
            value={formData.other_expense}
            onChange={(e) => setFormData({...formData, other_expense: e.target.value})}
            placeholder="Enter expense amount"
          />
        </FormField>
        <FormField label="Developer Charge (₹)">
          <Input
            type="number"
            value={formData.developer_charge}
            onChange={(e) => setFormData({...formData, developer_charge: e.target.value})}
            placeholder="Enter developer charge"
          />
        </FormField>
      </FormRow>

      <FormRow>
        <FormField label="Server Charge (₹)">
          <Input
            type="number"
            value={formData.server_charge}
            onChange={(e) => setFormData({...formData, server_charge: e.target.value})}
            placeholder="Enter server charge"
          />
        </FormField>
        <FormField label="3rd Party API Charge (₹)">
          <Input
            type="number"
            value={formData.third_party_api_charge}
            onChange={(e) => setFormData({...formData, third_party_api_charge: e.target.value})}
            placeholder="Enter 3rd party API charge"
          />
        </FormField>
      </FormRow>

      <FormRow>
        <FormField label="Mediator Charge (₹)">
          <Input
            type="number"
            value={formData.mediator_charge}
            onChange={(e) => setFormData({...formData, mediator_charge: e.target.value})}
            placeholder="Enter mediator charge"
          />
        </FormField>
        <FormField label="Domain Charge (₹)">
          <Input
            type="number"
            value={formData.domain_charge}
            onChange={(e) => setFormData({...formData, domain_charge: e.target.value})}
            placeholder="Enter Domain charge"
          />
        </FormField>
      </FormRow>

      <FormRow>
        <FormField label="Completed Date">
          <Input
            type="date"
            value={formData.completed_date}
            onChange={(e) => setFormData({...formData, completed_date: e.target.value})}
          />
        </FormField>
        <FormField label="Free Service">
          <Textarea
            value={formData.free_service}
            onChange={(e) => setFormData({...formData, free_service: e.target.value})}
            placeholder="Describe free services included"
            rows={2}
          />
        </FormField>
      </FormRow>

      <FormRow>
        <FormField label="Notes" colSpan={3}>
          <Textarea
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            placeholder="Add any notes for this project"
            rows={3}
          />
        </FormField>
      </FormRow>
    </>
  );
};

export default ProjectDetailsSection;
