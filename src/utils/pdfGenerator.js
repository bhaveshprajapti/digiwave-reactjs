import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generateQuotationPDF = async (quotation) => {
  try {
    // Create a temporary div to render the PDF content
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '210mm'; // A4 width
    tempDiv.style.backgroundColor = 'white';
    
    // Import React and ReactDOM for rendering
    const React = await import('react');
    const ReactDOM = await import('react-dom/client');
    const QuotationPDF = await import('../components/quotation/QuotationPDF.jsx');
    
    document.body.appendChild(tempDiv);
    
    // Create React element
    const element = React.createElement(QuotationPDF.default, { quotation });
    
    // Render the component
    const root = ReactDOM.createRoot(tempDiv);
    root.render(element);
    
    // Wait for rendering to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate canvas from the rendered component
    const canvas = await html2canvas(tempDiv, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      removeContainer: true,
      imageTimeout: 0,
      onclone: (clonedDoc) => {
        // Ensure all styles are applied
        const clonedDiv = clonedDoc.querySelector('div');
        if (clonedDiv) {
          clonedDiv.style.transform = 'scale(1)';
          clonedDiv.style.transformOrigin = 'top left';
        }
      }
    });
    
    // Create PDF with proper dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    // Calculate proper dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasAspectRatio = canvas.height / canvas.width;
    const pdfAspectRatio = pdfHeight / pdfWidth;
    
    let imgWidth, imgHeight;
    
    if (canvasAspectRatio > pdfAspectRatio) {
      // Canvas is taller relative to its width than PDF
      imgHeight = pdfHeight;
      imgWidth = pdfHeight / canvasAspectRatio;
    } else {
      // Canvas is wider relative to its height than PDF
      imgWidth = pdfWidth;
      imgHeight = pdfWidth * canvasAspectRatio;
    }
    
    const imgX = (pdfWidth - imgWidth) / 2;
    const imgY = 0;
    
    pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth, imgHeight);
    
    // Clean up
    document.body.removeChild(tempDiv);
    root.unmount();
    
    // Download the PDF
    pdf.save(`quotation-${quotation.quotation_no}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Alternative simpler approach using window.print
export const printQuotationPDF = (quotation) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  // Create the HTML content
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Quotation ${quotation.quotation_no}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
        .bg-gradient { background: linear-gradient(135deg, #0d3d7c 0%, #1e5aa8 100%); }
      </style>
    </head>
    <body>
      <div class="bg-gray-100 min-h-screen p-4 font-sans">
        <div class="max-w-4xl mx-auto bg-white shadow-2xl">
          <!-- Header -->
          <header class="bg-gradient p-8 text-white">
            <div class="flex justify-between items-start">
              <div class="flex items-center space-x-4">
                <div>
                  <p class="text-4xl font-extrabold text-white tracking-wider">DIGIWAVE</p>
                  <p class="text-xl font-medium text-gray-300 tracking-widest">TECHNOLOGIES</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-light text-gray-300">${quotation.company_address || 'Ashram Road, Ahmedabad'}</p>
                <p class="text-sm font-light text-gray-300">${quotation.company_phone || '9624185617'}</p>
                <p class="text-sm font-light text-gray-300">${quotation.company_email || 'hello.digiwave@gmail.com'}</p>
              </div>
            </div>
          </header>

          <main class="p-8">
            <!-- Title -->
            <div class="flex justify-between items-start mb-8">
              <div>
                <h1 class="text-4xl font-bold text-gray-800">Quotation</h1>
                <p class="text-gray-500">#${quotation.quotation_no}</p>
              </div>
            </div>
            
            <hr class="mb-8" />

            <!-- Dates and Client Info -->
            <div class="flex justify-between mb-10">
              <div>
                <p class="text-gray-500 mb-2"><span class="font-bold text-gray-700">Date:</span> ${new Date(quotation.date).toLocaleDateString()}</p>
                <p class="text-gray-500"><span class="font-bold text-gray-700">Valid Until:</span> ${new Date(quotation.valid_until).toLocaleDateString()}</p>
              </div>
              <div class="text-right">
                <p class="font-bold text-gray-700 mb-2">To:</p>
                <p class="text-gray-500">${quotation.client_name || ''}</p>
                <p class="text-gray-500">${quotation.client_contact || ''}</p>
                <p class="text-gray-500">${quotation.client_email || ''}</p>
                <p class="text-gray-500">${quotation.client_address || ''}</p>
              </div>
            </div>

            <!-- Services Table -->
            <div class="w-full mb-8">
              <div class="flex bg-cyan-50 rounded-t-lg font-bold text-gray-700">
                <div class="p-3 w-2/5">Service</div>
                <div class="p-3 w-1/5 text-center">Quantity</div>
                <div class="p-3 w-1/5 text-right">Price</div>
                <div class="p-3 w-1/5 text-center">Category</div>
                <div class="p-3 w-1/5 text-right">Total</div>
              </div>
              <div class="border-b-2 border-cyan-100 mb-4"></div>
              
              ${(quotation.services || []).map(service => `
                <div class="flex text-gray-600 items-center">
                  <div class="p-3 w-2/5">${service.description}</div>
                  <div class="p-3 w-1/5 text-center">${service.quantity}</div>
                  <div class="p-3 w-1/5 text-right">₹${service.unit_price}</div>
                  <div class="p-3 w-1/5 text-center">${service.category}</div>
                  <div class="p-3 w-1/5 text-right font-bold">₹${service.quantity * service.unit_price}</div>
                </div>
              `).join('')}
            </div>

            <!-- Summary -->
            <div class="flex justify-between mt-20">
              <div class="w-1/2">
                <h3 class="font-bold text-gray-700 mb-2">Payment Terms:</h3>
                <p class="text-gray-500 text-sm">${quotation.payment_terms || 'No payment terms specified'}</p>
                ${quotation.additional_notes ? `
                  <h3 class="font-bold text-gray-700 mb-2 mt-4">Additional Notes:</h3>
                  <p class="text-gray-500 text-sm">${quotation.additional_notes}</p>
                ` : ''}
              </div>
              
              <div class="w-2/5">
                <div class="space-y-3 text-gray-700">
                  <div class="flex justify-between"><span class="text-gray-500">Subtotal:</span> <span>₹${quotation.total_service_charge || 0}</span></div>
                  <div class="flex justify-between"><span class="text-gray-500">Tax:</span> <span>₹${quotation.tax_amount || 0}</span></div>
                  <div class="flex justify-between font-bold text-cyan-600 border-t pt-2"><span>Total:</span> <span>₹${quotation.grand_total}</span></div>
                </div>
                <div class="mt-4 bg-gradient text-white p-3 rounded-lg flex justify-between font-bold text-lg">
                  <span>Amount Due</span>
                  <span>₹${quotation.grand_total}</span>
                </div>
              </div>
            </div>
          </main>
          
          <hr class="mt-10"/>

          <!-- Footer -->
          <footer class="p-8 text-sm text-gray-600">
            <div class="flex justify-between items-start">
              <div>
                <p><span class="font-bold">Account Holder:</span> DOSHI NAMAN PRAKASHBHAI</p>
                <p><span class="font-bold">Account Number:</span> 50100463075872</p>
                <p><span class="font-bold">IFSC:</span> HDFC0004227</p>
                <p><span class="font-bold">Branch:</span> JALARAM MANDIR PALDI</p>
                <p><span class="font-bold">Account Type:</span> SAVING</p>
              </div>
              <div class="text-right">
                <p class="font-bold mt-4">${quotation.signatory_name || 'CEO Naman Doshi'}</p>
                <p class="text-gray-500">${quotation.signatory_designation || 'CEO'}</p>
                <p class="text-gray-500">hello.digiwave@gmail.com</p>
                <p class="text-gray-500">+91 9624185617</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() {
            window.close();
          };
        };
      </script>
    </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
