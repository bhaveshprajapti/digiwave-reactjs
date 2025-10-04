import React from 'react';

const DigiwaveLogo = () => (
  <div className="flex items-center space-x-4">
    <svg width="60" height="60" viewBox="0 0 209 123" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 122.205V0.5H55.4949C69.2131 0.5 79.522 3.51351 86.4214 9.54054C93.4024 15.4865 96.8929 23.6486 96.8929 34.027C96.8929 40.5405 95.3411 46.2973 92.2373 51.2973C89.2152 56.2162 85.0837 60.0135 79.8429 62.6892L111.495 122.205H75.7801L48.2321 68.1216H35.6339V122.205H0ZM35.6339 48.9054H51.4643C56.7869 48.9054 60.9185 47.4324 63.8601 44.4865C66.8821 41.5405 68.3929 38.0135 68.3929 33.9054C68.3929 29.7973 66.8821 26.3108 63.8601 23.4459C60.9185 20.5 56.7869 19.027 51.4643 19.027H35.6339V48.9054Z" fill="url(#paint0_linear_invoice)"/>
      <path d="M127.172 1.48861C117.801 1.48861 110.19 4.36361 104.341 10.1136C98.5732 15.7818 95.6894 23.25 95.6894 32.5182C95.6894 42.1363 98.6548 49.8522 104.582 55.6647C110.509 61.4772 118.121 64.3835 127.492 64.3835C132.895 64.3835 137.848 63.3153 142.35 61.1789L146.544 80.2358C140.266 82.5852 133.638 83.7599 126.662 83.7599C110.898 83.7599 98.7101 78.4119 90.0984 67.7187C81.4866 57.0255 77.1808 44.1164 77.1808 28.9914C77.1808 21.1732 78.7299 14.5312 81.8281 9.06532C85.0077 3.51702 89.4714 0.499975 95.2155 0L102.191 21.0312C98.9299 19.5085 95.8456 18.7471 92.9376 18.7471C88.6319 18.7471 85.1234 20.4289 82.412 23.7926C79.782 27.0738 78.4671 31.4346 78.4671 36.8749C78.4671 43.196 80.4007 48.2755 84.2677 52.1136C88.2163 55.8693 93.3035 57.7471 99.524 57.7471C102.622 57.7471 105.72 57.213 108.818 56.1448L127.172 1.48861Z" fill="url(#paint1_linear_invoice)"/>
      <defs>
        <linearGradient id="paint0_linear_invoice" x1="55.7473" y1="0.5" x2="55.7473" y2="122.205" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.8"/>
          <stop offset="1" stopColor="#FFFFFF"/>
        </linearGradient>
        <linearGradient id="paint1_linear_invoice" x1="111.862" y1="0" x2="111.862" y2="83.7599" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.8"/>
          <stop offset="1" stopColor="#FFFFFF"/>
        </linearGradient>
      </defs>
    </svg>
    <div>
      <p className="text-4xl font-extrabold text-white tracking-wider">DIGIWAVE</p>
      <p className="text-xl font-medium text-gray-300 tracking-widest">TECHNOLOGIES</p>
    </div>
  </div>
);

const WaveDivider = () => (
  <div className="relative bg-[#0d3d7c] h-20">
    <svg
      className="absolute bottom-0 w-full"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
    >
      <path
        d="M1440,84.2c-296.2,26.4-550.8-22.1-789.2-57.8C421.4-12.8,210-18.4,0,32.7V120h1440V84.2z"
        fill="white"
      ></path>
    </svg>
  </div>
);

const QrCode = () => (
  <svg width="60" height="60" viewBox="0 0 100 100" className="ml-auto mr-auto md:ml-0">
    <rect width="100" height="100" fill="#fff"/>
    <rect x="10" y="10" width="30" height="30" fill="#000"/>
    <rect x="15" y="15" width="20" height="20" fill="#fff"/>
    <rect x="20" y="20" width="10" height="10" fill="#000"/>
    <rect x="60" y="10" width="30" height="30" fill="#000"/>
    <rect x="65" y="15" width="20" height="20" fill="#fff"/>
    <rect x="70" y="20" width="10" height="10" fill="#000"/>
    <rect x="10" y="60" width="30" height="30" fill="#000"/>
    <rect x="15" y="65" width="20" height="20" fill="#fff"/>
    <rect x="20" y="70" width="10" height="10" fill="#000"/>
    <rect x="45" y="45" width="10" height="10" fill="#000"/>
    <rect x="60" y="45" width="5" height="5" fill="#000"/>
    <rect x="45" y="60" width="5" height="5" fill="#000"/>
    <rect x="70" y="65" width="10" height="10" fill="#000"/>
    <rect x="50" y="75" width="15" height="5" fill="#000"/>
    <rect x="85" y="50" width="5" height="10" fill="#000"/>
  </svg>
);

const QuotationPDF = ({ quotation }) => {
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
    <div className="bg-white min-h-screen font-sans" style={{ width: '210mm', minHeight: '297mm' }}>
      <div className="w-full bg-white">
        {/* Header Section */}
        <header className="bg-[#0d3d7c] p-8 md:p-10 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <DigiwaveLogo />
            <div className="text-left md:text-right mt-6 md:mt-0">
              <p className="text-sm font-light text-gray-300">{quotation.company_address}</p>
              <p className="text-sm font-light text-gray-300">{quotation.company_phone}</p>
              <p className="text-sm font-light text-gray-300">{quotation.company_email}</p>
            </div>
          </div>
        </header>

        {/* Wave Divider */}
        <WaveDivider />

        <main className="p-6">
          {/* Quotation Title and Number */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Quotation</h1>
              <p className="text-gray-500">#{quotation.quotation_no}</p>
            </div>
          </div>
          
          <hr className="mb-8" />

          {/* Dates and To Address */}
          <div className="flex flex-col md:flex-row justify-between mb-10">
            <div className="mb-6 md:mb-0">
              <p className="text-gray-500 mb-2">
                <span className="font-bold text-gray-700">Date:</span> {formatDate(quotation.date)}
              </p>
              <p className="text-gray-500">
                <span className="font-bold text-gray-700">Valid Until:</span> {formatDate(quotation.valid_until)}
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="font-bold text-gray-700 mb-2">To:</p>
              <p className="text-gray-500">{quotation.client_name}</p>
              <p className="text-gray-500">{quotation.client_contact}</p>
              <p className="text-gray-500">{quotation.client_email}</p>
              <p className="text-gray-500">{quotation.client_address}</p>
            </div>
          </div>

          {/* Services Table */}
          <div className="w-full mb-8">
            <div className="flex bg-cyan-50/50 rounded-t-lg font-bold text-gray-700 text-left">
              <div className="p-3 w-2/5">Service</div>
              <div className="p-3 w-1/5 text-center">Quantity</div>
              <div className="p-3 w-1/5 text-right">Price</div>
              <div className="p-3 w-1/5 text-center">Category</div>
              <div className="p-3 w-1/5 text-right">Total</div>
            </div>
            <div className="w-full border-b-2 border-cyan-100 mb-4"></div>
            
            {services.map((service, index) => (
              <div key={index} className="flex text-gray-600 text-left items-center">
                <div className="p-3 w-2/5">{service.description}</div>
                <div className="p-3 w-1/5 text-center">{service.quantity}</div>
                <div className="p-3 w-1/5 text-right">{formatCurrency(service.unit_price)}</div>
                <div className="p-3 w-1/5 text-center capitalize">{service.category}</div>
                <div className="p-3 w-1/5 text-right font-bold">{formatCurrency(service.quantity * service.unit_price)}</div>
              </div>
            ))}
          </div>

          <div className="mt-20 flex flex-col md:flex-row justify-between">
            {/* Notes */}
            <div className="w-full md:w-1/2 mb-10 md:mb-0">
              <h3 className="font-bold text-gray-700 mb-2">Payment Terms:</h3>
              <p className="text-gray-500 text-sm">{quotation.payment_terms || 'No payment terms specified'}</p>
              
              {quotation.additional_notes && (
                <>
                  <h3 className="font-bold text-gray-700 mb-2 mt-4">Additional Notes:</h3>
                  <p className="text-gray-500 text-sm">{quotation.additional_notes}</p>
                </>
              )}
            </div>
            
            {/* Totals */}
            <div className="w-full md:w-2/5">
              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal (Services):</span> 
                  <span>{formatCurrency(serviceTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax:</span> 
                  <span>{formatCurrency(quotation.tax_amount)}</span>
                </div>
                
                {serverCharges.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <span className="text-gray-500">{item.type}:</span> 
                    <span>({item.data.duration}) {formatCurrency(item.data.unit_price)}</span>
                  </div>
                ))}
                
                <div className="flex justify-between font-bold text-cyan-600 border-t pt-2">
                  <span>Total:</span> 
                  <span>{formatCurrency(quotation.grand_total)}</span>
                </div>
              </div>
              
              <div className="mt-4 bg-[#0d3d7c] text-white p-3 rounded-lg flex justify-between font-bold text-lg">
                <span>Amount Due</span>
                <span>{formatCurrency(quotation.grand_total)}</span>
              </div>
            </div>
          </div>
        </main>
        
        <hr className="mt-10"/>

        {/* Footer */}
        <footer className="p-6 text-sm text-gray-600">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div className="mb-8 md:mb-0">
              <p><span className="font-bold">Account Holder:</span> DOSHI NAMAN PRAKASHBHAI</p>
              <p><span className="font-bold">Account Number:</span> 50100463075872</p>
              <p><span className="font-bold">IFSC:</span> HDFC0004227</p>
              <p><span className="font-bold">Branch:</span> JALARAM MANDIR PALDI</p>
              <p><span className="font-bold">Account Type:</span> SAVING</p>
            </div>
            <div className="w-full md:w-auto text-center md:text-right">
              <QrCode />
              <p className="font-bold mt-4">{quotation.signatory_name || 'CEO Naman Doshi'}</p>
              <p className="text-gray-500">{quotation.signatory_designation || 'CEO'}</p>
              <p className="text-gray-500">hello.digiwave@gmail.com</p>
              <p className="text-gray-500">+91 9624185617</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default QuotationPDF;
