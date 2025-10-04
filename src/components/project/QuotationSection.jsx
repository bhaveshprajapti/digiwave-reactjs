import React from 'react';
import { FileText } from 'lucide-react';
import { FormSection, FormRow, FormField, Input, SelectField } from '../form/index.jsx';

const QuotationSection = ({ formData, setFormData, quotations }) => {
  const quotationOptions = quotations?.data?.results?.map(q => ({
    value: q.id,
    label: `${q.quotation_no} - ${q.client_name}`
  })) || [];

  const yesNoOptions = [
    { value: '', label: '-- Select --' },
    { value: 'Yes', label: 'Yes' },
    { value: 'No', label: 'No' }
  ];

  const handleQuotationChange = (selectedOption) => {
    setFormData({...formData, quotation: selectedOption?.value || ''});
  };

  const handleQuotationSentChange = (selectedOption) => {
    setFormData({...formData, quotation_sent: selectedOption?.value || ''});
  };

  const handleDemoGivenChange = (selectedOption) => {
    setFormData({...formData, demo_given: selectedOption?.value || ''});
  };

  const handleContractSignedChange = (selectedOption) => {
    setFormData({...formData, contract_signed: selectedOption?.value || ''});
  };

  return (
    <>
      <FormSection title="Quotation Details" icon={FileText} bgColor="bg-indigo-50" textColor="text-indigo-800" />
      
      <FormRow>
        <FormField label="Quotation" colSpan={3}>
          <SelectField
            value={quotationOptions.find(option => option.value === formData.quotation) || null}
            onChange={handleQuotationChange}
            options={quotationOptions}
            placeholder="Search quotation"
            isClearable
          />
        </FormField>
      </FormRow>

      <FormRow>
        <FormField label="Inquiry Date">
          <Input
            type="date"
            value={formData.inquiry_date}
            onChange={(e) => setFormData({...formData, inquiry_date: e.target.value})}
          />
        </FormField>
        <FormField label="Lead Source">
          <Input
            value={formData.lead_source}
            onChange={(e) => setFormData({...formData, lead_source: e.target.value})}
            placeholder="Enter lead source"
          />
        </FormField>
      </FormRow>

      <FormRow>
        <FormField label="Quotation Sent">
          <SelectField
            value={yesNoOptions.find(option => option.value === formData.quotation_sent) || null}
            onChange={handleQuotationSentChange}
            options={yesNoOptions}
            placeholder="-- Select --"
            isClearable
          />
        </FormField>
        <FormField label="Demo Given">
          <SelectField
            value={yesNoOptions.find(option => option.value === formData.demo_given) || null}
            onChange={handleDemoGivenChange}
            options={yesNoOptions}
            placeholder="-- Select --"
            isClearable
          />
        </FormField>
      </FormRow>

      <FormRow>
        <FormField label="Quotation Amount (₹)">
          <Input
            type="number"
            step="0.01"
            value={formData.quotation_amount}
            onChange={(e) => setFormData({...formData, quotation_amount: e.target.value})}
            placeholder="Enter quotation amount"
          />
        </FormField>
        <FormField label="Approval Amount (₹)">
          <Input
            type="number"
            step="0.01"
            value={formData.approval_amount}
            onChange={(e) => setFormData({...formData, approval_amount: e.target.value})}
            placeholder="Enter approval amount"
          />
        </FormField>
      </FormRow>

      <FormRow>
        <FormField label="Client Industry">
          <Input
            value={formData.client_industry}
            onChange={(e) => setFormData({...formData, client_industry: e.target.value})}
            placeholder="Enter client industry"
          />
        </FormField>
        <FormField label="Client">
          <Input
            value={formData.client_name}
            onChange={(e) => setFormData({...formData, client_name: e.target.value})}
            placeholder="Enter client name"
          />
        </FormField>
      </FormRow>

      <FormRow>
        <FormField label="Contract Signed" colSpan={3}>
          <SelectField
            value={yesNoOptions.find(option => option.value === formData.contract_signed) || null}
            onChange={handleContractSignedChange}
            options={yesNoOptions}
            placeholder="-- Select --"
            isClearable
          />
        </FormField>
      </FormRow>
    </>
  );
};

export default QuotationSection;
