// import { useState } from 'react';
// import { FaCreditCard, FaSpinner, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCity, FaGlobeAsia, FaMapPin } from 'react-icons/fa';

// const Checkout = () => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     address: '',
//     city: '',
//     state: '',
//     pincode: '',
//   });

//   const orderAmount = 1000;

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     setError('');
//   };

//   const validateForm = () => {
//     const requiredFields = [
//       { field: 'name', message: 'Please enter your name' },
//       { field: 'email', message: 'Please enter a valid email address', test: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) },
//       { field: 'phone', message: 'Please enter a valid 10-digit phone number', test: (val) => /^\d{10}$/.test(val.replace(/\D/g, '')) },
//       { field: 'address', message: 'Please enter your address' },
//       { field: 'city', message: 'Please enter your city' },
//       { field: 'state', message: 'Please enter your state' },
//       { field: 'pincode', message: 'Please enter a valid 6-digit pincode', test: (val) => /^\d{6}$/.test(val) },
//     ];

//     for (const { field, message, test } of requiredFields) {
//       const value = formData[field].trim();
//       if (!value) {
//         setError(message);
//         return false;
//       }
//       if (test && !test(value)) {
//         setError(message);
//         return false;
//       }
//     }
//     return true;
//   };

//   const handlePayment = async () => {
//     if (!validateForm()) return;

//     setLoading(true);
//     setError('');

//     try {
//       const orderId = `ORD_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

//       const paymentData = {
//         amount: orderAmount,
//         order_id: orderId,
//         billing_name: formData.name,
//         billing_email: formData.email,
//         billing_tel: formData.phone,
//         billing_address: formData.address,
//         billing_city: formData.city,
//         billing_state: formData.state,
//         billing_zip: formData.pincode,
//         billing_country: 'India',
//         delivery_name: formData.name,
//         delivery_address: formData.address,
//         delivery_city: formData.city,
//         delivery_state: formData.state,
//         delivery_zip: formData.pincode,
//         delivery_country: 'India',
//         delivery_tel: formData.phone,
//         currency: 'INR',
//       };

//       await initiateCCAvenuePayment(paymentData);
//     } catch (err) {
//       console.error('Payment error:', err);
//       setError(err?.message || 'Failed to process payment. Please try again.');
//       setLoading(false);
//     }
//   };

//   const InputField = ({ label, name, type = 'text', placeholder, icon: Icon, maxLength, ...props }) => (
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-2">
//         {label}
//       </label>
//       <div className="relative">
//         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//           <Icon className="h-5 w-5 text-gray-400" />
//         </div>
//         <input
//           type={type}
//           name={name}
//           value={formData[name]}
//           onChange={handleInputChange}
//           className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//           placeholder={placeholder}
//           maxLength={maxLength}
//           disabled={loading}
//           {...props}
//         />
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-8 px-4">
//       <div className="max-w-4xl mx-auto">
//         <div className="text-center mb-8">
//           <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
//           <p className="text-gray-600">Complete your purchase securely</p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Shipping Information */}
//           <div className="bg-white rounded-2xl shadow-xl p-8">
//             <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
//               <FaUser className="text-blue-600" />
//               Shipping Information
//             </h2>

//             <div className="space-y-6">
//               <InputField
//                 label="Full Name *"
//                 name="name"
//                 placeholder="John Doe"
//                 icon={FaUser}
//               />

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <InputField
//                   label="Email Address *"
//                   name="email"
//                   type="email"
//                   placeholder="john@example.com"
//                   icon={FaEnvelope}
//                 />

//                 <InputField
//                   label="Phone Number *"
//                   name="phone"
//                   type="tel"
//                   placeholder="9876543210"
//                   maxLength={10}
//                   icon={FaPhone}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Address *
//                 </label>
//                 <div className="relative">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-start pt-3 pointer-events-none">
//                     <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
//                   </div>
//                   <textarea
//                     name="address"
//                     value={formData.address}
//                     onChange={handleInputChange}
//                     className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
//                     placeholder="Street address"
//                     rows={3}
//                     disabled={loading}
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <InputField
//                   label="City *"
//                   name="city"
//                   placeholder="Mumbai"
//                   icon={FaCity}
//                 />

//                 <InputField
//                   label="State *"
//                   name="state"
//                   placeholder="Maharashtra"
//                   icon={FaGlobeAsia}
//                 />

//                 <InputField
//                   label="Pincode *"
//                   name="pincode"
//                   placeholder="400001"
//                   maxLength={6}
//                   icon={FaMapPin}
//                 />
//               </div>

//               {error && (
//                 <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-pulse">
//                   <p className="text-red-700 text-sm font-medium">{error}</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Order Summary & Payment */}
//           <div className="space-y-6">
//             <div className="bg-white rounded-2xl shadow-xl p-8">
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

//               <div className="space-y-4">
//                 <div className="flex justify-between items-center py-3 border-b border-gray-200">
//                   <span className="text-gray-600">Subtotal:</span>
//                   <span className="font-semibold">₹{orderAmount.toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between items-center py-3 border-b border-gray-200">
//                   <span className="text-gray-600">Shipping:</span>
//                   <span className="text-green-600 font-semibold">FREE</span>
//                 </div>
//                 <div className="flex justify-between items-center py-3 border-b border-gray-200">
//                   <span className="text-gray-600">Tax:</span>
//                   <span className="font-semibold">₹0.00</span>
//                 </div>
//                 <div className="flex justify-between items-center pt-4 text-xl font-bold">
//                   <span>Total Amount:</span>
//                   <span className="text-blue-600">₹{orderAmount.toFixed(2)}</span>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-2xl shadow-xl p-8">
//               <button
//                 onClick={handlePayment}
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold flex items-center justify-center gap-3 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:scale-100 shadow-lg hover:shadow-xl"
//               >
//                 {loading ? (
//                   <>
//                     <FaSpinner className="w-5 h-5 animate-spin" />
//                     Processing Payment...
//                   </>
//                 ) : (
//                   <>
//                     <FaCreditCard className="w-5 h-5" />
//                     Pay ₹{orderAmount.toFixed(2)}
//                   </>
//                 )}
//               </button>

//               <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
//                 <div className="flex items-center justify-center gap-2 text-blue-700">
//                   <div className="flex items-center gap-1 text-sm">
//                     <span>🔒</span>
//                     <span className="font-medium">Secure Payment</span>
//                   </div>
//                   <span className="text-blue-400">•</span>
//                   <span className="text-sm">Powered by CCAvenue</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Checkout;