import React from 'react';
import { XCircle, AlertTriangle, CheckCircle, ShoppingBag, Mail, Globe, Clock, Package, Shield } from 'lucide-react';

const CancellationPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f2c41a' }}>
                <XCircle className="text-black" size={40} />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                <AlertTriangle className="text-white" size={20} />
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#000' }}>
            Cancellation Policy
          </h1>
          <div className="h-1 w-24 mx-auto mb-6" style={{ backgroundColor: '#f2c41a' }}></div>
          <div className="max-w-3xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <div className="flex items-start">
                <AlertTriangle className="text-red-600 mr-3 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h2 className="text-xl font-bold text-red-800 mb-2">Important Notice</h2>
                  <p className="text-red-700">
                    At <span className="font-bold" style={{ color: '#f2c41a' }}>Printe.in</span>, we do not accept order cancellations for customised or personalised products.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Policy Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10">
          {/* Policy Explanation */}
          <div className="p-8">
            <div className="mb-10">
              <h3 className="text-2xl font-bold mb-6 flex items-center" style={{ color: '#000' }}>
                <ShoppingBag className="mr-3" style={{ color: '#f2c41a' }} size={28} />
                Customised Products Policy
              </h3>
              <div className="bg-gray-50 p-6 rounded-xl border-l-4" style={{ borderColor: '#f2c41a' }}>
                <p className="text-gray-800 leading-relaxed mb-4">
                  All customised products are made specifically based on customer-approved designs, text, colours, and specifications. Once an order is placed and confirmed, it is immediately moved into production.
                </p>
                <div className="flex items-center bg-red-50 p-4 rounded-lg">
                  <XCircle className="text-red-600 mr-3 flex-shrink-0" size={22} />
                  <p className="text-red-700 font-semibold">
                    Due to this process, orders for customised products cannot be cancelled, modified, or refunded.
                  </p>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <AlertTriangle className="mr-3" style={{ color: '#f2c41a' }} size={28} />
                <h3 className="text-2xl font-bold" style={{ color: '#000' }}>
                  Important Notes
                </h3>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                    <CheckCircle className="text-black" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Review Before Ordering</h4>
                    <p className="text-gray-700">
                      Customers are requested to carefully review all product details, customisation inputs, and order information before placing an order.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                    <Clock className="text-black" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Production Timeline</h4>
                    <p className="text-gray-700">
                      Once the order is approved for printing or production, cancellation requests will not be entertained.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                    <span className="text-black font-bold text-lg">!</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Design Variations</h4>
                    <p className="text-gray-700">
                      Minor variations in colour or design placement may occur due to screen display and printing processes and do not qualify for cancellation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Two Column Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Non-Customised Products */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#f2c41a' }}>
                    <Package className="text-black" size={24} />
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: '#000' }}>Non-Customised Products</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                      <span className="text-black font-bold text-xs">✓</span>
                    </div>
                    <p className="text-gray-700">
                      Cancellation for non-customised products (if applicable) may be allowed only before dispatch.
                    </p>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                      <span className="text-black font-bold text-xs">✗</span>
                    </div>
                    <p className="text-gray-700">
                      Once dispatched, such orders cannot be cancelled.
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-300">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Note:</span> Most of our products are customised. Please check product details before ordering.
                  </p>
                </div>
              </div>

              {/* Printe.in Rights */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#f2c41a' }}>
                    <Shield className="text-black" size={24} />
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: '#000' }}>Printe.in Rights</h3>
                </div>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    Printe.in reserves the right to cancel any order due to unforeseen circumstances such as:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#f2c41a' }}></div>
                      <span className="text-gray-700">Payment failure</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#f2c41a' }}></div>
                      <span className="text-gray-700">Technical issues</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#f2c41a' }}></div>
                      <span className="text-gray-700">Product unavailability</span>
                    </li>
                  </ul>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-4">
                    <div className="flex items-center">
                      <CheckCircle className="text-green-600 mr-3 flex-shrink-0" size={20} />
                      <p className="text-green-700 font-medium">
                        In such cases, a full refund will be processed to the original payment method.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Process Flow */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          <h3 className="text-2xl font-bold mb-8 text-center" style={{ color: '#000' }}>
            Order Process Timeline
          </h3>
          <div className="relative">
            {/* Process Steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg" style={{ backgroundColor: '#f2c41a' }}>
                  <ShoppingBag className="text-black" size={24} />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Order Placed</h4>
                <p className="text-xs text-gray-600">Customer submits order</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg" style={{ backgroundColor: '#f2c41a' }}>
                  <CheckCircle className="text-black" size={24} />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Order Confirmed</h4>
                <p className="text-xs text-gray-600">Payment received</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg bg-red-100 border-red-200">
                  <Clock className="text-red-600" size={24} />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Production Starts</h4>
                <p className="text-xs text-gray-600">Immediately after confirmation</p>
                <div className="mt-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                  No Cancellation
                </div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg" style={{ backgroundColor: '#f2c41a' }}>
                  <Package className="text-black" size={24} />
                </div>
                <h4 className="font-bold text-gray-900 mb-1">Order Dispatched</h4>
                <p className="text-xs text-gray-600">Ready for delivery</p>
              </div>
            </div>
            
            {/* Connecting Lines */}
            <div className="hidden md:block absolute top-8 left-1/4 right-0 h-0.5 bg-gray-300 -z-10" style={{ width: '75%' }}></div>
            <div className="hidden md:block absolute top-8 left-1/2 w-0.5 h-0.5 bg-red-500 -z-10"></div>
          </div>
        </div>

        {/* Contact Us Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <h3 className="text-2xl font-bold mb-8 text-center" style={{ color: '#000' }}>
              Need Assistance?
            </h3>
            
            <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-12">
              <a 
                href="mailto:info@printe.in" 
                className="flex flex-col items-center group transition-all hover:-translate-y-1"
              >
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:shadow-xl transition-shadow"
                  style={{ backgroundColor: '#f2c41a' }}
                >
                  <Mail className="text-black" size={32} />
                </div>
                <span className="font-bold text-lg text-gray-900 group-hover:underline">Email Us</span>
                <span className="text-gray-700 mt-2">info@printe.in</span>
              </a>
              
              <a 
                href="https://www.printe.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center group transition-all hover:-translate-y-1"
              >
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-6 group-hover:shadow-xl transition-shadow"
                  style={{ backgroundColor: '#f2c41a' }}
                >
                  <Globe className="text-black" size={32} />
                </div>
                <span className="font-bold text-lg text-gray-900 group-hover:underline">Visit Website</span>
                <span className="text-gray-700 mt-2">www.printe.in</span>
              </a>
            </div>
            
            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="bg-gray-50 p-5 rounded-lg text-center">
                <p className="text-gray-700">
                  For any questions regarding order cancellations, please contact us via email or visit our website for more information.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        
      </div>
    </div>
  );
};

export default CancellationPolicy;