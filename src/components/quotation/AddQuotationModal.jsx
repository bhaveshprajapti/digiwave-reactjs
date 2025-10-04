import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Building, User, DollarSign, Server, Receipt, UserCheck } from 'lucide-react';
import { usersAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../Modal';
import { FormSection, FormRow, FormField, Input, SelectField, Textarea } from '../form/index.jsx';

const AddQuotationModal = ({ isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    // Company Details (readonly)
    company_name: 'DigiWave Technologies',
    company_address: 'Ashram Road, Ahmedabad',
    company_phone: '9624185617',
    company_email: 'hello.digiwave@gmail.com',
    
    // Client Information
    quotation_no: '', // Auto-generated
    date: '',
    valid_until: '',
    prepared_by: '',
    client_name: '',
    client_contact: '',
    client_address: '',
    lead_source: '',
    
    // Server & Domain Charges
    domain_registration: { included: false, duration: '', unit_price: 0 },
    server_hosting: { included: false, duration: '', unit_price: 0 },
    ssl_certificate: { included: false, duration: '', unit_price: 0 },
    email_hosting: { included: false, duration: '', unit_price: 0 },
    
    // Summary
    discount_type: 'none',
    discount_value: 0,
    tax_rate: 0,
    grand_total: 0,
    payment_terms: '',
    additional_notes: '',
    
    // Authorized Signatory
    signatory_name: '',
    signatory_designation: '',
    signature: null
  });

  const [services, setServices] = useState([
    { category: '', description: '', quantity: 1, unit_price: 0 }
  ]);

  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({ 
    queryKey: ['users'], 
    queryFn: usersAPI.getAll, 
    enabled: isOpen 
  });

  const userOptions = users?.results?.map(userItem => ({
    value: userItem.id,
    label: userItem.first_name && userItem.last_name 
      ? `${userItem.first_name} ${userItem.last_name}` 
      : userItem.username
  })) || [];

  // Set default prepared_by to current user when modal opens
  useEffect(() => {
    if (isOpen && user && !formData.prepared_by) {
      setFormData(prev => ({
        ...prev,
        prepared_by: user.id
      }));
    }
  }, [isOpen, user]);

  const serviceCategories = [
    { value: 'web', label: 'Web Development' },
    { value: 'mobile', label: 'Mobile Development' },
    { value: 'cloud', label: 'Cloud Services' },
    { value: 'ai_ml', label: 'AI/ML Algorithms' }
  ];

  const discountTypes = [
    { value: 'none', label: 'None' },
    { value: 'flat', label: 'Flat' },
    { value: 'percent', label: 'Percent' }
  ];

  const addServiceRow = () => {
    setServices([...services, { category: '', description: '', quantity: 1, unit_price: 0 }]);
  };

  const removeServiceRow = (index) => {
    if (services.length > 1) {
      setServices(services.filter((_, i) => i !== index));
    }
  };

  const updateService = (index, field, value) => {
    const updatedServices = services.map((service, i) => 
      i === index ? { ...service, [field]: value } : service
    );
    setServices(updatedServices);
    calculateTotals(updatedServices);
  };

  const calculateTotals = (currentServices = services) => {
    // Calculate service total
    const serviceTotal = currentServices.reduce((sum, service) => 
      sum + (service.quantity * service.unit_price), 0
    );

    // Calculate server/domain total
    const serverTotal = Object.values(formData).reduce((sum, item) => {
      if (item && typeof item === 'object' && item.included && item.unit_price) {
        return sum + parseFloat(item.unit_price);
      }
      return sum;
    }, 0);

    const subtotal = serviceTotal + serverTotal;
    
    // Calculate discount
    let discountAmount = 0;
    if (formData.discount_type === 'flat') {
      discountAmount = parseFloat(formData.discount_value) || 0;
    } else if (formData.discount_type === 'percent') {
      discountAmount = (subtotal * (parseFloat(formData.discount_value) || 0)) / 100;
    }

    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * (parseFloat(formData.tax_rate) || 0)) / 100;
    const grandTotal = afterDiscount + taxAmount;

    setFormData(prev => ({
      ...prev,
      total_service_charge: serviceTotal,
      total_server_domain_charge: serverTotal,
      tax_amount: taxAmount,
      after_discount_total: afterDiscount,
      grand_total: grandTotal
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Ensure all numeric values are properly converted
    const cleanedServices = services.map(service => ({
      ...service,
      quantity: parseInt(service.quantity) || 1,
      unit_price: parseFloat(service.unit_price) || 0
    }));

    const transformedData = {
      ...formData,
      services: cleanedServices,
      prepared_by: formData.prepared_by || null,
      date: formData.date || null,
      valid_until: formData.valid_until || null,
      // Ensure numeric fields are properly formatted
      discount_value: parseFloat(formData.discount_value) || 0,
      tax_rate: parseFloat(formData.tax_rate) || 0,
      total_service_charge: parseFloat(formData.total_service_charge) || 0,
      total_server_domain_charge: parseFloat(formData.total_server_domain_charge) || 0,
      tax_amount: parseFloat(formData.tax_amount) || 0,
      after_discount_total: parseFloat(formData.after_discount_total) || 0,
      grand_total: parseFloat(formData.grand_total) || 0,
      // Clean server/domain charges
      domain_registration: {
        ...formData.domain_registration,
        unit_price: parseFloat(formData.domain_registration.unit_price) || 0
      },
      server_hosting: {
        ...formData.server_hosting,
        unit_price: parseFloat(formData.server_hosting.unit_price) || 0
      },
      ssl_certificate: {
        ...formData.ssl_certificate,
        unit_price: parseFloat(formData.ssl_certificate.unit_price) || 0
      },
      email_hosting: {
        ...formData.email_hosting,
        unit_price: parseFloat(formData.email_hosting.unit_price) || 0
      }
    };

    console.log('Submitting quotation data:', transformedData);
    console.log('Services data:', cleanedServices);
    onSubmit(transformedData);
    
    // Reset form
    setFormData({
      company_name: 'DigiWave Technologies',
      company_address: 'Ashram Road, Ahmedabad',
      company_phone: '9624185617',
      company_email: 'hello.digiwave@gmail.com',
      quotation_no: '',
      date: '',
      valid_until: '',
      prepared_by: '',
      client_name: '',
      client_contact: '',
      client_email: '',
      client_address: '',
      lead_source: '',
      web_services: [],
      mobile_services: [],
      cloud_services: [],
      ai_ml_services: [],
      total_service_charge: 0,
      domain_registration: { included: false, duration: '', unit_price: 0 },
      server_hosting: { included: false, duration: '', unit_price: 0 },
      ssl_certificate: { included: false, duration: '', unit_price: 0 },
      email_hosting: { included: false, duration: '', unit_price: 0 },
      total_server_domain_charge: 0,
      tax_rate: 0,
      tax_amount: 0,
      discount_type: 'none',
      discount_value: 0,
      after_discount_total: 0,
      grand_total: 0,
      payment_terms: '',
      additional_notes: '',
      signatory_name: '',
      signatory_designation: '',
      signature: null
    });
    setServices([{ category: '', description: '', quantity: 1, unit_price: 0 }]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={<><Plus className="h-5 w-5 mr-2" />Add New Quotation</>} size="6xl">
      <div className="relative">
        <div className="p-6" style={{ maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
              <tbody>
                {/* Company Details */}
                <FormSection title="Company Details" icon={Building} bgColor="bg-indigo-50" textColor="text-indigo-800" />
                
                <FormRow>
                  <FormField label="Company Name" colSpan={3}>
                    <Input value={formData.company_name} readOnly className="bg-gray-50" />
                  </FormField>
                </FormRow>
                
                <FormRow>
                  <FormField label="Company Address" colSpan={3}>
                    <Textarea value={formData.company_address} readOnly className="bg-gray-50" rows={2} />
                  </FormField>
                </FormRow>
                
                <FormRow>
                  <FormField label="Company Phone">
                    <Input value={formData.company_phone} readOnly className="bg-gray-50" />
                  </FormField>
                  <FormField label="Company Email">
                    <Input value={formData.company_email} readOnly className="bg-gray-50" />
                  </FormField>
                </FormRow>

                {/* Client Information */}
                <FormSection title="Client Information" icon={User} bgColor="bg-emerald-50" textColor="text-emerald-800" />
                
                <FormRow>
                  <FormField label="Quotation No">
                    <Input 
                      value={formData.quotation_no} 
                      placeholder="Auto-generated" 
                      readOnly 
                      className="bg-gray-50" 
                    />
                  </FormField>
                  <FormField label="Date">
                    <Input 
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </FormField>
                </FormRow>
                
                <FormRow>
                  <FormField label="Valid Until">
                    <Input 
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                      required
                    />
                  </FormField>
                  <FormField label="Prepared By">
                    <SelectField
                      value={userOptions.find(option => option.value === formData.prepared_by) || null}
                      onChange={(selectedOption) => setFormData({...formData, prepared_by: selectedOption?.value || ''})}
                      options={userOptions}
                      placeholder="Search Employee"
                      isClearable
                    />
                  </FormField>
                </FormRow>
                
                <FormRow>
                  <FormField label="Client Name" colSpan={3}>
                    <Input 
                      value={formData.client_name}
                      onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                      placeholder="Enter client name"
                      required
                    />
                  </FormField>
                </FormRow>
                
                <FormRow>
                  <FormField label="Client Contact">
                    <Input 
                      value={formData.client_contact}
                      onChange={(e) => setFormData({...formData, client_contact: e.target.value})}
                      placeholder="Enter client contact"
                    />
                  </FormField>
                  <FormField label="Client Email">
                    <Input 
                      type="email"
                      value={formData.client_email}
                      onChange={(e) => setFormData({...formData, client_email: e.target.value})}
                      placeholder="Enter client email"
                    />
                  </FormField>
                </FormRow>
                
                <FormRow>
                  <FormField label="Client Address" colSpan={3}>
                    <Textarea 
                      value={formData.client_address}
                      onChange={(e) => setFormData({...formData, client_address: e.target.value})}
                      placeholder="Enter client address"
                      rows={2}
                    />
                  </FormField>
                </FormRow>
                
                <FormRow>
                  <FormField label="Lead Source" colSpan={3}>
                    <Input 
                      value={formData.lead_source}
                      onChange={(e) => setFormData({...formData, lead_source: e.target.value})}
                      placeholder="Enter lead source"
                    />
                  </FormField>
                </FormRow>

                {/* Service Charges */}
                <FormSection title="Service Charges" icon={DollarSign} bgColor="bg-amber-50" textColor="text-amber-800" />
                
                <tr>
                  <th className="p-3 text-left font-medium bg-gray-50 border border-gray-300">Category</th>
                  <th className="p-3 text-left font-medium bg-gray-50 border border-gray-300">Description</th>
                  <th className="p-3 text-left font-medium bg-gray-50 border border-gray-300">Quantity</th>
                  <th className="p-3 text-left font-medium bg-gray-50 border border-gray-300">
                    <div className="flex justify-between items-center">
                      Unit Price (₹)
                      <button
                        type="button"
                        onClick={addServiceRow}
                        className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </th>
                </tr>
                
                {services.map((service, index) => (
                  <tr key={index}>
                    <td className="p-3 border border-gray-300">
                      <SelectField
                        value={serviceCategories.find(cat => cat.value === service.category) || null}
                        onChange={(selectedOption) => updateService(index, 'category', selectedOption?.value || '')}
                        options={serviceCategories}
                        placeholder="-- Select --"
                      />
                    </td>
                    <td className="p-3 border border-gray-300">
                      <Input 
                        value={service.description}
                        onChange={(e) => updateService(index, 'description', e.target.value)}
                        placeholder="Enter description"
                      />
                    </td>
                    <td className="p-3 border border-gray-300">
                      <Input 
                        type="number"
                        value={service.quantity}
                        onChange={(e) => updateService(index, 'quantity', parseInt(e.target.value) || 1)}
                        min="1"
                        placeholder="Qty"
                      />
                    </td>
                    <td className="p-3 border border-gray-300">
                      <div className="flex gap-2">
                        <Input 
                          type="number"
                          value={service.unit_price}
                          onChange={(e) => updateService(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          min="0"
                          placeholder="Unit price"
                        />
                        {services.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeServiceRow(index)}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Server & Domain Charges */}
                <FormSection title="Server & Domain Charges" icon={Server} bgColor="bg-blue-50" textColor="text-blue-800" />
                
                <FormRow>
                  <FormField label="Domain Registration" colSpan={3}>
                    <div className="grid grid-cols-3 gap-2">
                      <SelectField
                        value={{ value: formData.domain_registration.included, label: formData.domain_registration.included ? 'Yes' : 'No' }}
                        onChange={(selectedOption) => setFormData({
                          ...formData, 
                          domain_registration: { ...formData.domain_registration, included: selectedOption?.value || false }
                        })}
                        options={[
                          { value: false, label: 'No' },
                          { value: true, label: 'Yes' }
                        ]}
                      />
                      <Input 
                        value={formData.domain_registration.duration}
                        onChange={(e) => setFormData({
                          ...formData, 
                          domain_registration: { ...formData.domain_registration, duration: e.target.value }
                        })}
                        placeholder="Duration"
                      />
                      <Input 
                        type="number"
                        value={formData.domain_registration.unit_price}
                        onChange={(e) => setFormData({
                          ...formData, 
                          domain_registration: { ...formData.domain_registration, unit_price: parseFloat(e.target.value) || 0 }
                        })}
                        placeholder="Price (₹)"
                        min="0"
                      />
                    </div>
                  </FormField>
                </FormRow>
                
                <FormRow>
                  <FormField label="Server Hosting" colSpan={3}>
                    <div className="grid grid-cols-3 gap-2">
                      <SelectField
                        value={{ value: formData.server_hosting.included, label: formData.server_hosting.included ? 'Yes' : 'No' }}
                        onChange={(selectedOption) => setFormData({
                          ...formData, 
                          server_hosting: { ...formData.server_hosting, included: selectedOption?.value || false }
                        })}
                        options={[
                          { value: false, label: 'No' },
                          { value: true, label: 'Yes' }
                        ]}
                      />
                      <Input 
                        value={formData.server_hosting.duration}
                        onChange={(e) => setFormData({
                          ...formData, 
                          server_hosting: { ...formData.server_hosting, duration: e.target.value }
                        })}
                        placeholder="Duration"
                      />
                      <Input 
                        type="number"
                        value={formData.server_hosting.unit_price}
                        onChange={(e) => setFormData({
                          ...formData, 
                          server_hosting: { ...formData.server_hosting, unit_price: parseFloat(e.target.value) || 0 }
                        })}
                        placeholder="Price (₹)"
                        min="0"
                      />
                    </div>
                  </FormField>
                </FormRow>
                
                <FormRow>
                  <FormField label="SSL Certificate" colSpan={3}>
                    <div className="grid grid-cols-3 gap-2">
                      <SelectField
                        value={{ value: formData.ssl_certificate.included, label: formData.ssl_certificate.included ? 'Yes' : 'No' }}
                        onChange={(selectedOption) => setFormData({
                          ...formData, 
                          ssl_certificate: { ...formData.ssl_certificate, included: selectedOption?.value || false }
                        })}
                        options={[
                          { value: false, label: 'No' },
                          { value: true, label: 'Yes' }
                        ]}
                      />
                      <Input 
                        value={formData.ssl_certificate.duration}
                        onChange={(e) => setFormData({
                          ...formData, 
                          ssl_certificate: { ...formData.ssl_certificate, duration: e.target.value }
                        })}
                        placeholder="Duration"
                      />
                      <Input 
                        type="number"
                        value={formData.ssl_certificate.unit_price}
                        onChange={(e) => setFormData({
                          ...formData, 
                          ssl_certificate: { ...formData.ssl_certificate, unit_price: parseFloat(e.target.value) || 0 }
                        })}
                        placeholder="Price (₹)"
                        min="0"
                      />
                    </div>
                  </FormField>
                </FormRow>
                
                <FormRow>
                  <FormField label="Email Hosting" colSpan={3}>
                    <div className="grid grid-cols-3 gap-2">
                      <SelectField
                        value={{ value: formData.email_hosting.included, label: formData.email_hosting.included ? 'Yes' : 'No' }}
                        onChange={(selectedOption) => setFormData({
                          ...formData, 
                          email_hosting: { ...formData.email_hosting, included: selectedOption?.value || false }
                        })}
                        options={[
                          { value: false, label: 'No' },
                          { value: true, label: 'Yes' }
                        ]}
                      />
                      <Input 
                        value={formData.email_hosting.duration}
                        onChange={(e) => setFormData({
                          ...formData, 
                          email_hosting: { ...formData.email_hosting, duration: e.target.value }
                        })}
                        placeholder="Duration"
                      />
                      <Input 
                        type="number"
                        value={formData.email_hosting.unit_price}
                        onChange={(e) => setFormData({
                          ...formData, 
                          email_hosting: { ...formData.email_hosting, unit_price: parseFloat(e.target.value) || 0 }
                        })}
                        placeholder="Price (₹)"
                        min="0"
                      />
                    </div>
                  </FormField>
                </FormRow>

                {/* Summary */}
                <FormSection title="Summary" icon={Receipt} bgColor="bg-purple-50" textColor="text-purple-800" />
                
                <FormRow>
                  <FormField label="Discount Type">
                    <SelectField
                      value={discountTypes.find(type => type.value === formData.discount_type) || discountTypes[0]}
                      onChange={(selectedOption) => {
                        setFormData({...formData, discount_type: selectedOption?.value || 'none'});
                        calculateTotals();
                      }}
                      options={discountTypes}
                    />
                  </FormField>
                  <FormField label="Discount Value">
                    <Input 
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => {
                        setFormData({...formData, discount_value: parseFloat(e.target.value) || 0});
                        calculateTotals();
                      }}
                      placeholder="Enter value"
                      min="0"
                    />
                  </FormField>
                </FormRow>
                
                <FormRow>
                  <FormField label="Tax Rate (%)">
                    <Input 
                      type="number"
                      value={formData.tax_rate}
                      onChange={(e) => {
                        setFormData({...formData, tax_rate: parseFloat(e.target.value) || 0});
                        calculateTotals();
                      }}
                      placeholder="Enter tax rate"
                      min="0"
                      max="100"
                    />
                  </FormField>
                  <FormField label="Grand Total">
                    <Input 
                      value={`₹${formData.grand_total.toLocaleString('en-IN')}`}
                      readOnly 
                      className="bg-gray-50 font-semibold"
                    />
                  </FormField>
                </FormRow>
                
                <FormRow>
                  <FormField label="Payment Terms" colSpan={3}>
                    <Textarea 
                      value={formData.payment_terms}
                      onChange={(e) => setFormData({...formData, payment_terms: e.target.value})}
                      placeholder="Enter payment terms"
                      rows={3}
                    />
                  </FormField>
                </FormRow>
                
                <FormRow>
                  <FormField label="Additional Notes" colSpan={3}>
                    <Textarea 
                      value={formData.additional_notes}
                      onChange={(e) => setFormData({...formData, additional_notes: e.target.value})}
                      placeholder="Enter additional notes"
                      rows={3}
                    />
                  </FormField>
                </FormRow>

                {/* Authorized Signatory */}
                <FormSection title="Authorized Signatory" icon={UserCheck} bgColor="bg-gray-50" textColor="text-gray-800" />
                
                <FormRow>
                  <FormField label="Name">
                    <Input 
                      value={formData.signatory_name}
                      onChange={(e) => setFormData({...formData, signatory_name: e.target.value})}
                      placeholder="Enter name"
                    />
                  </FormField>
                  <FormField label="Designation">
                    <Input 
                      value={formData.signatory_designation}
                      onChange={(e) => setFormData({...formData, signatory_designation: e.target.value})}
                      placeholder="Enter designation"
                    />
                  </FormField>
                </FormRow>
                
                <FormRow>
                  <FormField label="Signature" colSpan={3}>
                    <Input 
                      type="file"
                      onChange={(e) => setFormData({...formData, signature: e.target.files[0]})}
                      accept="image/*"
                    />
                  </FormField>
                </FormRow>
              </tbody>
            </table>
          </div>
        </div>
        
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
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
            >
              Save Quotation
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default AddQuotationModal;
