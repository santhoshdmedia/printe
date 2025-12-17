import React from 'react';
import { Truck, Clock, MapPin, Package, AlertCircle, Mail, Globe, Calendar, Shield, CreditCard } from 'lucide-react';

const ShippingPolicy = () => {
  return (
    <div className=" bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto">
        {/* Header Section */}
        <header className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Truck size={48} style={{ color: '#f2c41a' }} />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black flex items-center justify-center">
                <Shield size={12} className="text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#000' }}>
            Shipping Policy
          </h1>
          <div className="h-1 w-24 mx-auto mb-6" style={{ backgroundColor: '#f2c41a' }}></div>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            At <span className="font-bold" style={{ color: '#f2c41a' }}>Printe.in</span>, we are committed to delivering your customised and printed products safely, efficiently, and on time.
          </p>
        </header>

        {/* Main Content Container */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Key Information Cards */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Processing Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6" style={{ backgroundColor: '#f2c41a' }}>
                <div className="flex items-center">
                  <Clock className="text-black mr-3" size={24} />
                  <h2 className="text-xl font-bold text-black">Order Processing Time</h2>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-4">
                  <li className="flex">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                      <span className="text-black font-bold text-sm">1</span>
                    </div>
                    <p className="text-gray-700">All orders are processed after successful payment confirmation.</p>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                      <span className="text-black font-bold text-sm">2</span>
                    </div>
                    <p className="text-gray-700">Standard processing time is <span className="font-semibold">3–8 business days</span>, depending on product type, customisation requirements, and order quantity.</p>
                  </li>
                  <li className="flex">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 mt-1" style={{ backgroundColor: '#f2c41a' }}>
                      <span className="text-black font-bold text-sm">3</span>
                    </div>
                    <p className="text-gray-700">Bulk or highly customised orders may require additional processing time. Our team will inform you in advance if this applies.</p>
                  </li>
                </ul>
              </div>
            </div>

            {/* Shipping Timeline Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6" style={{ backgroundColor: '#f2c41a' }}>
                <div className="flex items-center">
                  <Calendar className="text-black mr-3" size={24} />
                  <h2 className="text-xl font-bold text-black">Shipping & Delivery Timeline</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <div className="flex items-start mb-4">
                    <Truck className="mr-3 mt-1 flex-shrink-0" style={{ color: '#f2c41a' }} size={20} />
                    <p className="text-gray-700">Once dispatched, orders are typically delivered within <span className="font-semibold">10–20 business days</span>, depending on your location and courier service availability.</p>
                  </div>
                  <div className="flex items-start mb-4">
                    <MapPin className="mr-3 mt-1 flex-shrink-0" style={{ color: '#f2c41a' }} size={20} />
                    <p className="text-gray-700">Delivery timelines may vary for remote or non-serviceable pin codes.</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <div className="flex">
                      <AlertCircle className="mr-3 flex-shrink-0" style={{ color: '#f2c41a' }} size={20} />
                      <p className="text-gray-700 text-sm">Delivery times are estimates and may be affected by factors beyond our control, such as weather conditions, courier delays, or regional restrictions.</p>
                    </div>
                  </div>
                </div>
                
                {/* Visual Timeline */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Typical Order Journey</h3>
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="text-center mb-6 md:mb-0">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: '#f2c41a' }}>
                        <CreditCard className="text-black" size={20} />
                      </div>
                      <p className="text-sm font-semibold">Payment Confirmed</p>
                      <p className="text-xs text-gray-600">Day 1</p>
                    </div>
                    <div className="hidden md:block flex-grow h-0.5 bg-gray-300 mx-4"></div>
                    <div className="text-center mb-6 md:mb-0">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: '#f2c41a' }}>
                        <Package className="text-black" size={20} />
                      </div>
                      <p className="text-sm font-semibold">Processing</p>
                      <p className="text-xs text-gray-600">3-8 Days</p>
                    </div>
                    <div className="hidden md:block flex-grow h-0.5 bg-gray-300 mx-4"></div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: '#f2c41a' }}>
                        <Truck className="text-black" size={20} />
                      </div>
                      <p className="text-sm font-semibold">Delivery</p>
                      <p className="text-xs text-gray-600">10-20 Days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Delivery Address Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <MapPin className="mr-3" style={{ color: '#f2c41a' }} size={24} />
                  <h3 className="font-bold text-gray-900">Delivery Address</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  Customers are responsible for providing accurate and complete delivery information. Printe.in will not be liable for delays or non-delivery caused by incorrect or incomplete address details.
                </p>
              </div>

              {/* Customised Products Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <Package className="mr-3" style={{ color: '#f2c41a' }} size={24} />
                  <h3 className="font-bold text-gray-900">Customised Products</h3>
                </div>
                <p className="text-gray-700 text-sm">
                  As most of our products are made-to-order and personalised, dispatch timelines may vary. Orders once placed and approved for printing cannot be modified or cancelled.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Important Information */}
          <div className="space-y-8">
            {/* Shipping Charges Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center" style={{ color: '#000' }}>
                <CreditCard className="mr-3" style={{ color: '#f2c41a' }} size={22} />
                Shipping Charges
              </h3>
              <p className="text-gray-700 mb-4">
                Shipping charges, if applicable, are calculated at checkout based on product weight, dimensions, and delivery location.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Note:</span> Any applicable shipping fees will be clearly displayed before order confirmation.
                </p>
              </div>
            </div>

            {/* Courier Partners Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center" style={{ color: '#000' }}>
                <Truck className="mr-3" style={{ color: '#f2c41a' }} size={22} />
                Courier Partners
              </h3>
              <p className="text-gray-700 mb-4">
                We work with reliable third-party courier and logistics partners to ensure safe and timely delivery across India.
              </p>
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <p className="text-sm text-gray-700">
                  Order tracking details will be shared via email or SMS once the order is shipped.
                </p>
              </div>
            </div>

            {/* Damaged Packages Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center" style={{ color: '#000' }}>
                <AlertCircle className="mr-3" style={{ color: '#f2c41a' }} size={22} />
                Damaged or Missing Packages
              </h3>
              <p className="text-gray-700 mb-4">
                If you receive a damaged package, please notify us within <span className="font-semibold">48 hours</span> of delivery with clear images of the product and packaging.
              </p>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-700">
                  Any claims raised after this period may not be eligible for replacement or resolution.
                </p>
              </div>
            </div>

            {/* International Shipping Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center" style={{ color: '#000' }}>
                <Globe className="mr-3" style={{ color: '#f2c41a' }} size={22} />
                International Shipping
              </h3>
              <div className="bg-gray-50 p-5 rounded-lg text-center">
                <p className="text-gray-700 mb-3">
                  Currently, Printe.in ships only within India.
                </p>
                <div className="inline-flex items-center justify-center px-4 py-2 rounded-full" style={{ backgroundColor: '#f2c41a' }}>
                  <span className="font-bold text-black text-sm">International shipping is not available at this time</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Us Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <h3 className="text-2xl font-bold mb-8 text-center" style={{ color: '#000' }}>
              Shipping Support & Contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all"
                  style={{ backgroundColor: '#f2c41a' }}
                >
                  <Globe className="text-black" size={32} />
                </div>
                <h4 className="font-bold text-lg mb-2" style={{ color: '#000' }}>Website</h4>
                <a 
                  href="https://www.printe.in" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-black transition-colors"
                >
                  www.printe.in
                </a>
              </div>
              
              <div className="text-center">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg transition-all"
                  style={{ backgroundColor: '#f2c41a' }}
                >
                  <Mail className="text-black" size={32} />
                </div>
                <h4 className="font-bold text-lg mb-2" style={{ color: '#000' }}>Email / Support</h4>
                <p className="text-gray-700">
                  As mentioned on the Contact Us page
                </p>
              </div>
            </div>
            
            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="bg-gray-50 p-5 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-3">Important Reminder</h4>
                <p className="text-gray-700 text-sm">
                  During peak seasons, sales events, or unforeseen circumstances, delivery timelines may be extended. Printe.in is not responsible for delays caused by courier partners, natural calamities, strikes, or government restrictions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
     
      </div>
    </div>
  );
};

export default ShippingPolicy;