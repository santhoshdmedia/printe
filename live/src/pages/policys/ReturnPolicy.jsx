import React from 'react';
import { Mail, Globe, AlertTriangle, CheckCircle } from 'lucide-react';

const ReturnPolicy = () => {
  return (
    <div className=" bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className=" mx-auto">
        {/* Header Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#000' }}>
            Return Policy
          </h1>
          <div className="h-1 w-24 mx-auto mb-6" style={{ backgroundColor: '#f2c41a' }}></div>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            At <span className="font-bold" style={{ color: '#f2c41a' }}>Printe.in</span>, we are committed to quality and customer satisfaction. Please review our return policy below.
          </p>
        </header>

        {/* Main Policy Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10">
          {/* Policy Warning Header */}
          <div 
            className="py-5 px-6 flex items-center"
            style={{ backgroundColor: '#f2c41a' }}
          >
            <AlertTriangle className="text-black mr-3" size={24} />
            <h2 className="text-xl font-bold text-black">Important Policy Notice</h2>
          </div>
          
          <div className="p-8">
            <div className="mb-10">
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#000' }}>
                Personalised & Customised Products
              </h3>
              <div className="bg-gray-50 p-5 rounded-lg border-l-4" style={{ borderColor: '#f2c41a' }}>
                <p className="text-gray-800 leading-relaxed">
                  We do not accept returns for personalised or customised products. All customised items are created specifically based on customer-selected designs, text, colours, or specifications. Due to the personalised nature of these products, returns, exchanges, or refunds are not permitted once the order has been confirmed and processed.
                </p>
              </div>
            </div>

            {/* Exceptions Section */}
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <CheckCircle className="mr-3" style={{ color: '#f2c41a' }} size={28} />
                <h3 className="text-2xl font-bold" style={{ color: '#000' }}>
                  Exceptions
                </h3>
              </div>
              
              <p className="mb-5 text-gray-700">
                Returns or replacements will be considered only if:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 p-5 rounded-lg text-center hover:shadow-md transition-shadow">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ backgroundColor: '#f2c41a' }}>
                    <span className="font-bold text-black">1</span>
                  </div>
                  <h4 className="font-bold mb-2 text-gray-900">Damaged in Transit</h4>
                  <p className="text-gray-700 text-sm">Product received is damaged during shipping</p>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg text-center hover:shadow-md transition-shadow">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ backgroundColor: '#f2c41a' }}>
                    <span className="font-bold text-black">2</span>
                  </div>
                  <h4 className="font-bold mb-2 text-gray-900">Manufacturing Defect</h4>
                  <p className="text-gray-700 text-sm">Issues resulting from the production process</p>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg text-center hover:shadow-md transition-shadow">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-4" style={{ backgroundColor: '#f2c41a' }}>
                    <span className="font-bold text-black">3</span>
                  </div>
                  <h4 className="font-bold mb-2 text-gray-900">Incorrect Product</h4>
                  <p className="text-gray-700 text-sm">Wrong item has been delivered</p>
                </div>
              </div>
              
              <div className="bg-amber-50 p-5 rounded-lg border border-amber-200">
                <p className="text-gray-800 mb-3">
                  <strong>Important:</strong> Any such issue must be reported within <span className="font-bold">48 hours</span> of delivery, along with clear images of the product and original packaging, for verification.
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Note:</span> Minor variations in colour, size, or print placement may occur due to screen or printing limitations and do not qualify for returns.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Us Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <h3 className="text-2xl font-bold mb-8 text-center" style={{ color: '#000' }}>
              Contact Us for Assistance
            </h3>
            
            <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-12">
              <a 
                href="mailto:info@printe.in" 
                className="flex flex-col items-center group transition-transform hover:-translate-y-1"
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow"
                  style={{ backgroundColor: '#f2c41a' }}
                >
                  <Mail className="text-black" size={28} />
                </div>
                <span className="font-semibold text-gray-900">Email Us</span>
                <span className="text-gray-700 mt-1">info@printe.in</span>
              </a>
              
              <a 
                href="https://www.printe.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center group transition-transform hover:-translate-y-1"
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:shadow-lg transition-shadow"
                  style={{ backgroundColor: '#f2c41a' }}
                >
                  <Globe className="text-black" size={28} />
                </div>
                <span className="font-semibold text-gray-900">Visit Website</span>
                <span className="text-gray-700 mt-1">www.printe.in</span>
              </a>
            </div>
            
            <div className="mt-10 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-600">
                We aim to respond to all return-related inquiries within 24 hours during business days.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
      </div>
    </div>
  );
};

export default ReturnPolicy;