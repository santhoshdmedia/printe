import React from 'react';
import { Shield, User, ShoppingBag, CreditCard, Mail, FileText, AlertTriangle, Lock, Globe, Calendar } from 'lucide-react';

const TermsAndConditions = () => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f2c41a' }}>
                <Shield className="text-black" size={32} />
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#000' }}>
            TERMS & CONDITIONS
          </h1>
          <div className="h-1 w-24 mx-auto mb-6" style={{ backgroundColor: '#f2c41a' }}></div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <div className="flex items-center">
              <Calendar className="mr-2" style={{ color: '#f2c41a' }} size={18} />
              <span className="text-gray-700">Last Updated: {formattedDate}</span>
            </div>
            <div className="hidden sm:block text-gray-400">•</div>
            <div className="flex items-center">
              <Globe className="mr-2" style={{ color: '#f2c41a' }} size={18} />
              <span className="text-gray-700">www.printe.in</span>
            </div>
          </div>
          <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm">
            <p className="text-gray-800">
              Welcome to <span className="font-bold" style={{ color: '#f2c41a' }}>Printe</span> By accessing or using <span className="font-semibold">www.printe.in</span> , you agree to comply with and be bound by these Terms & Conditions. If you do not agree, please do not use our Website.
            </p>
          </div>
        </header>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Section 1: Use of the Website */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 flex items-center" style={{ backgroundColor: '#f2c41a' }}>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black mr-4">
                <span className="text-white font-bold">1</span>
              </div>
              <h2 className="text-xl font-bold text-black">Use of the Website</h2>
            </div>
            <div className="p-6">
              <div className="space-y-5">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                    <User className="text-black" size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Age Requirement</h3>
                    <p className="text-gray-700">You must be at least <span className="font-semibold">18 years old</span> to use our services.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                    <Shield className="text-black" size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Acceptable Use</h3>
                    <p className="text-gray-700">You agree not to misuse the Website or engage in unlawful activities.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                    <Lock className="text-black" size={16} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Account Responsibility</h3>
                    <p className="text-gray-700">You are responsible for maintaining the confidentiality of your account information.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Products & Services */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 flex items-center" style={{ backgroundColor: '#f2c41a' }}>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black mr-4">
                <span className="text-white font-bold">2</span>
              </div>
              <h2 className="text-xl font-bold text-black">Products & Services</h2>
            </div>
            <div className="p-6">
              <div className="space-y-5">
                <div className="flex">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-4 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                    <ShoppingBag className="text-black" size={12} />
                  </div>
                  <p className="text-gray-700">We offer <span className="font-semibold">personalized printing</span> and related services.</p>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-4 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                    <AlertTriangle className="text-black" size={12} />
                  </div>
                  <p className="text-gray-700">Product images are for representation purposes only; <span className="font-semibold">actual products may vary slightly</span>.</p>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-4 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                    <span className="text-black font-bold text-xs">!</span>
                  </div>
                  <p className="text-gray-700">All orders are subject to availability.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 & 4 Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Section 3: Pricing & Payments */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
              <div className="p-6 flex items-center" style={{ backgroundColor: '#f2c41a' }}>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black mr-4">
                  <span className="text-white font-bold">3</span>
                </div>
                <h2 className="text-xl font-bold text-black">Pricing & Payments</h2>
              </div>
              <div className="p-6">
                <div className="space-y-5">
                  <div className="flex items-start">
                    <CreditCard className="mr-3 mt-1 flex-shrink-0" style={{ color: '#f2c41a' }} size={20} />
                    <p className="text-gray-700">Prices listed on the Website are final and inclusive of applicable taxes unless specified.</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                      <span className="text-black font-bold text-xs">↻</span>
                    </div>
                    <p className="text-gray-700">We reserve the right to update prices at any time.</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mt-4">
                    <p className="text-gray-700 text-sm">
                      <span className="font-semibold">Note:</span> Payments must be made online via our supported payment methods.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Order Confirmation */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
              <div className="p-6 flex items-center" style={{ backgroundColor: '#f2c41a' }}>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black mr-4">
                  <span className="text-white font-bold">4</span>
                </div>
                <h2 className="text-xl font-bold text-black">Order Confirmation</h2>
              </div>
              <div className="p-6">
                <div className="space-y-5">
                  <div className="flex">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-4 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                      <Mail className="text-black" size={12} />
                    </div>
                    <p className="text-gray-700">After placing an order, you will receive a <span className="font-semibold">confirmation email</span>.</p>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-4 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                      <span className="text-black font-bold text-xs">✓</span>
                    </div>
                    <p className="text-gray-700">We reserve the right to accept or decline orders at our discretion.</p>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-4 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                      <span className="text-black font-bold text-xs">↶</span>
                    </div>
                    <p className="text-gray-700">If an order is cancelled due to technical or stock issues, you will be notified and refunded.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Intellectual Property */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 flex items-center" style={{ backgroundColor: '#f2c41a' }}>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black mr-4">
                <span className="text-white font-bold">5</span>
              </div>
              <h2 className="text-xl font-bold text-black">Intellectual Property</h2>
            </div>
            <div className="p-6">
              <div className="space-y-5">
                <div className="flex">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-4 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                    <FileText className="text-black" size={12} />
                  </div>
                  <p className="text-gray-700">All content on the Website (logos, text, graphics, images, etc.) is owned by <span className="font-semibold">Printe</span>.</p>
                </div>
                <div className="flex items-center bg-red-50 p-4 rounded-lg border border-red-200">
                  <AlertTriangle className="mr-3 flex-shrink-0 text-red-600" size={20} />
                  <p className="text-red-700 text-sm">
                    You may not copy, reproduce, or distribute any material without prior written permission.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6 & 7 Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Section 6: User Content */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
              <div className="p-6 flex items-center" style={{ backgroundColor: '#f2c41a' }}>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black mr-4">
                  <span className="text-white font-bold">6</span>
                </div>
                <h2 className="text-xl font-bold text-black">User Content (Custom Prints)</h2>
              </div>
              <div className="p-6">
                <div className="space-y-5">
                  <div className="flex">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-4 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                      <User className="text-black" size={12} />
                    </div>
                    <p className="text-gray-700">You are responsible for content uploaded for printing (images, text, graphics, etc.).</p>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-4 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                      <Shield className="text-black" size={12} />
                    </div>
                    <p className="text-gray-700">You must ensure you have rights/permissions to use the uploaded content.</p>
                  </div>
                  <div className="flex items-center bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <AlertTriangle className="mr-3 flex-shrink-0" style={{ color: '#f2c41a' }} size={18} />
                    <p className="text-gray-700 text-sm">
                      We reserve the right to reject content that is offensive, illegal, or violates copyrights.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 7: Limitation of Liability */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
              <div className="p-6 flex items-center" style={{ backgroundColor: '#f2c41a' }}>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black mr-4">
                  <span className="text-white font-bold">7</span>
                </div>
                <h2 className="text-xl font-bold text-black">Limitation of Liability</h2>
              </div>
              <div className="p-6">
                <div className="space-y-5">
                  <div className="flex">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-4 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                      <AlertTriangle className="text-black" size={12} />
                    </div>
                    <p className="text-gray-700">We are <span className="font-semibold">not liable</span> for indirect, incidental, or consequential damages.</p>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-4 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                      <span className="text-black font-bold text-xs">⏱</span>
                    </div>
                    <p className="text-gray-700">We are not responsible for delays caused by courier partners or unforeseen events.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <p className="text-gray-700 text-sm">
                      Please refer to our <span className="font-semibold">Shipping Policy</span> and <span className="font-semibold">Return Policy</span> for more details on delivery timelines and returns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#f2c41a' }}>
                <Mail className="text-black" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#000' }}>Contact Us</h3>
              <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
                For any queries related to these Terms & Conditions or any other concerns, please don't hesitate to contact us.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#f2c41a' }}>
                    <Mail className="text-black" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a 
                      href="mailto:info@printe.in" 
                      className="font-bold text-lg hover:underline" 
                      style={{ color: '#000' }}
                    >
                      info@printe.in
                    </a>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#f2c41a' }}>
                    <Globe className="text-black" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Website</p>
                    <a 
                      href="https://www.printe.in" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-bold text-lg hover:underline" 
                      style={{ color: '#000' }}
                    >
                      www.printe.in
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-8 border-t border-gray-300">
          <div className="text-center text-gray-600">
            <p className="mb-2">By using our website, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.</p>
            <p className="text-sm">
              © {currentDate.getFullYear()} Printe.in. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;