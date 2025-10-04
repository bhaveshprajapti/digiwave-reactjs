import React from 'react';
import { Eye, FolderOpen } from 'lucide-react';
import Modal from '../Modal';

const ViewQuotationModal = ({ isOpen, onClose, quotation }) => {
  if (!quotation) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${parseFloat(amount).toLocaleString('en-IN')}`;
  };

  const services = quotation.services || [];
  const serviceTotal = services.reduce((sum, service) => sum + (service.quantity * service.unit_price), 0);

  // Server & Domain charges
  const serverCharges = [
    { type: 'Domain Registration', data: quotation.domain_registration },
    { type: 'Server Hosting', data: quotation.server_hosting },
    { type: 'SSL Certificate', data: quotation.ssl_certificate },
    { type: 'Email Hosting', data: quotation.email_hosting }
  ].filter(item => item.data && item.data.included);

  const serverTotal = serverCharges.reduce((sum, item) => sum + (parseFloat(item.data.unit_price) || 0), 0);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div className="flex items-center">
          <FolderOpen className="h-5 w-5 mr-2" />
          <span className="font-bold text-primary uppercase">{quotation.quotation_no}</span>
        </div>
      } 
      size="4xl"
    >
      <div className="relative">
        <div className="p-6" style={{ maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
          
          {/* 1. Company & Client Info */}
          <div className="bg-white rounded-lg border shadow-sm mb-4">
            <div className="bg-gray-50 px-4 py-3 border-b rounded-t-lg">
              <h3 className="font-bold text-gray-900">Company & Client Info</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-2"><strong>Company:</strong> {quotation.company_name || '-'}</p>
                  <p className="mb-2"><strong>Address:</strong> {quotation.company_address || '-'}</p>
                  <p className="mb-2"><strong>Phone:</strong> {quotation.company_phone || '-'}</p>
                  <p className="mb-2"><strong>Email:</strong> {quotation.company_email || '-'}</p>
                </div>
                <div>
                  <p className="mb-2"><strong>Quotation No:</strong> {quotation.quotation_no || '-'}</p>
                  <p className="mb-2"><strong>Date:</strong> {formatDate(quotation.date)}</p>
                  <p className="mb-2"><strong>Valid Until:</strong> {formatDate(quotation.valid_until)}</p>
                  <p className="mb-2"><strong>Client Name:</strong> {quotation.client_name || '-'}</p>
                  <p className="mb-2"><strong>Client Contact:</strong> {quotation.client_contact || '-'}</p>
                  <p className="mb-2"><strong>Client Email:</strong> {quotation.client_email || '-'}</p>
                  <p className="mb-2"><strong>Client Address:</strong> {quotation.client_address || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Service Charges */}
          <div className="bg-white rounded-lg border shadow-sm mb-4">
            <div className="bg-gray-50 px-4 py-3 border-b rounded-t-lg">
              <h3 className="font-bold text-gray-900">1. Service Charges</h3>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border">Sr.</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border">Category</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border">Description</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border">Qty / Duration</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border">Unit Price (₹)</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.length > 0 ? services.map((service, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm border">{index + 1}</td>
                        <td className="px-4 py-2 text-sm border capitalize">{service.category}</td>
                        <td className="px-4 py-2 text-sm border">{service.description}</td>
                        <td className="px-4 py-2 text-sm border">{service.quantity}</td>
                        <td className="px-4 py-2 text-sm border">{formatCurrency(service.unit_price)}</td>
                        <td className="px-4 py-2 text-sm border font-medium">{formatCurrency(service.quantity * service.unit_price)}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-4 text-center text-gray-500 border">No services added</td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <p className="mt-3 text-right"><strong>Total Service Charge: {formatCurrency(serviceTotal)}</strong></p>
              </div>
            </div>
          </div>

          {/* 3. Server & Domain Charges */}
          <div className="bg-white rounded-lg border shadow-sm mb-4">
            <div className="bg-gray-50 px-4 py-3 border-b rounded-t-lg">
              <h3 className="font-bold text-gray-900">2. Server & Domain Charges</h3>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border">Charge Type</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border">Included</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border">Duration</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border">Unit Price (₹)</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-600 border">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serverCharges.length > 0 ? serverCharges.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm border">{item.type}</td>
                        <td className="px-4 py-2 text-sm border">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Yes</span>
                        </td>
                        <td className="px-4 py-2 text-sm border">{item.data.duration || '-'}</td>
                        <td className="px-4 py-2 text-sm border">{formatCurrency(item.data.unit_price)}</td>
                        <td className="px-4 py-2 text-sm border font-medium">{formatCurrency(item.data.unit_price)}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-4 text-center text-gray-500 border">No server/domain charges</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 4. Summary */}
          <div className="bg-white rounded-lg border shadow-sm mb-4">
            <div className="bg-gray-50 px-4 py-3 border-b rounded-t-lg">
              <h3 className="font-bold text-gray-900">3. Total Summary</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
                <div className="md:col-span-4">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="py-2">Subtotal (Services)</td>
                        <td className="py-2 text-right">{formatCurrency(serviceTotal)}</td>
                      </tr>
                      <tr>
                        <td className="py-2">Subtotal (Server & Domain)</td>
                        <td className="py-2 text-right">{formatCurrency(serverTotal)}</td>
                      </tr>
                      <tr>
                        <td className="py-2">Discount</td>
                        <td className="py-2 text-right">
                          {quotation.discount_type}: {quotation.discount_type === 'percent' ? quotation.discount_value + '%' : formatCurrency(quotation.discount_value)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2">Tax Amount</td>
                        <td className="py-2 text-right">{formatCurrency(quotation.tax_amount)}</td>
                      </tr>
                      <tr className="border-t-2 border-gray-300">
                        <td className="py-2 font-bold">Grand Total</td>
                        <td className="py-2 text-right font-bold">{formatCurrency(quotation.grand_total)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="md:col-span-3">
                  <div className="mb-4">
                    <p className="font-bold mb-2">Payment Terms:</p>
                    <p className="text-sm">{quotation.payment_terms || 'No payment terms specified'}</p>
                  </div>
                  <div>
                    <p className="font-bold mb-2">Additional Notes:</p>
                    <p className="text-sm">{quotation.additional_notes || 'No additional notes'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Authorized Signatory */}
          <div className="bg-white rounded-lg border shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b rounded-t-lg">
              <h3 className="font-bold text-gray-900">Authorized Signatory</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="font-medium text-gray-600 block mb-2">Signature</label>
                  <div>
                    {quotation.signature ? (
                      <img 
                        src={quotation.signature} 
                        alt="Signature" 
                        className="max-w-full h-20 object-contain border border-gray-200 rounded"
                      />
                    ) : (
                      <div className="h-20 border border-gray-200 rounded flex items-center justify-center text-gray-400 text-sm">
                        No signature uploaded
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-600 block mb-2">Name</label>
                  <div>{quotation.signatory_name || '-'}</div>
                </div>
                <div>
                  <label className="font-medium text-gray-600 block mb-2">Designation</label>
                  <div>{quotation.signatory_designation || '-'}</div>
                </div>
              </div>
            </div>
          </div>

        </div>
        
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

export default ViewQuotationModal;
