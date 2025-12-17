import React from 'react';
import { Shield, Package, Building, Lock, Eye, Cookie, User, CreditCard, Database, Mail, Globe, Search, Bell, Server, Trash2, Settings, AlertTriangle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
const PrivacyPolicy = () => {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <Helmet>
                <title>Privacy Policy | Printe.in – Data Protection & User Privacy</title>
                <meta name="description" content="Read Printe.in’s Privacy Policy to understand how we collect, use, store, and protect your personal information while providing secure online printing and gifting services." />
                <meta name="keywords" content="printe privacy policy, data protection policy, user privacy printe, personal data security, website privacy india, online printing privacy" />
            </Helmet>
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <header className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f2c41a' }}>
                                <Shield className="text-black" size={40} />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#000' }}>
                        Privacy Policy
                    </h1>
                    <div className="h-1 w-24 mx-auto mb-6" style={{ backgroundColor: '#f2c41a' }}></div>

                    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-sm">
                        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
                            <div className="flex items-center mb-4 sm:mb-0">
                                <Calendar className="mr-2" style={{ color: '#f2c41a' }} size={18} />
                                <span className="text-gray-700 font-medium">Last Updated: {formattedDate}</span>
                            </div>
                            <div className="flex items-center">
                                <Globe className="mr-2" style={{ color: '#f2c41a' }} size={18} />
                                <span className="text-gray-700">www.printe.in</span>
                            </div>
                        </div>

                        <p className="text-gray-800 text-center">
                            Welcome to <span className="font-bold" style={{ color: '#f2c41a' }}>Printe</span>  We operate <span className="font-semibold">www.printe.in</span> We are committed to protecting your privacy and ensuring your personal data is handled in a safe and responsible manner.
                        </p>
                    </div>
                </header>

                {/* Introduction Banner */}
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
                    <div className="flex items-center mb-6">
                        <Eye className="mr-4" style={{ color: '#f2c41a' }} size={28} />
                        <h2 className="text-2xl font-bold" style={{ color: '#000' }}>Our Commitment to Your Privacy</h2>
                    </div>
                    <p className="text-gray-700 text-lg">
                        This Privacy Policy explains how we collect, use, store, disclose, and protect your information when you use our Website and services. Your privacy is our priority.
                    </p>
                </div>

                {/* Main Content */}
                <div className="space-y-8">
                    {/* Section 1: Information We Collect */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-6 flex items-center" style={{ backgroundColor: '#f2c41a' }}>
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black mr-4">
                                <span className="text-white font-bold">1</span>
                            </div>
                            <h2 className="text-xl font-bold text-black">Information We Collect</h2>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Personal Information */}
                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#f2c41a' }}>
                                            <User className="text-black" size={24} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                                    </div>
                                    <ul className="space-y-3">
                                        {['Name', 'Email address', 'Phone number', 'Billing and shipping address', 'Account details', 'Contact information'].map((item, index) => (
                                            <li key={index} className="flex items-center">
                                                <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#f2c41a' }}></div>
                                                <span className="text-gray-700">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Automatically Collected */}
                                <div className="bg-gray-50 p-6 rounded-xl">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#f2c41a' }}>
                                            <Database className="text-black" size={24} />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Automatically Collected</h3>
                                    </div>
                                    <ul className="space-y-3">
                                        {['IP address', 'Browser type and device', 'Pages visited', 'Time spent on site', 'Cookies and tracking data'].map((item, index) => (
                                            <li key={index} className="flex items-center">
                                                <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#f2c41a' }}></div>
                                                <span className="text-gray-700">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <div className="flex items-center mb-4">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#f2c41a' }}>
                                        <CreditCard className="text-black" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Payment Information</h3>
                                        <p className="text-gray-600">If you make a purchase, payment information may be collected by our payment processors.</p>
                                    </div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                    <div className="flex">
                                        <Lock className="text-green-600 mr-3 flex-shrink-0" size={20} />
                                        <p className="text-green-700 text-sm">
                                            <span className="font-semibold">Security Notice:</span> We do not store or directly access your full payment/card details.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: How We Use Your Information */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-6 flex items-center" style={{ backgroundColor: '#f2c41a' }}>
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black mr-4">
                                <span className="text-white font-bold">2</span>
                            </div>
                            <h2 className="text-xl font-bold text-black">How We Use Your Information</h2>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { icon: <Bell size={20} />, text: 'Providing and improving our services' },
                                    { icon: <Package size={20} />, text: 'Order processing, delivery, and support' },
                                    { icon: <Mail size={20} />, text: 'Responding to your queries or requests' },
                                    { icon: <Bell size={20} />, text: 'Sending important notifications and updates' },
                                    { icon: <Search size={20} />, text: 'Website analytics and performance improvement' },
                                    { icon: <Shield size={20} />, text: 'Compliance with legal obligations' },
                                ].map((use, index) => (
                                    <div key={index} className="flex items-start">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#f2c41a' }}>
                                            <div className="text-black">{use.icon}</div>
                                        </div>
                                        <p className="text-gray-700 pt-2">{use.text}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 bg-blue-50 p-5 rounded-lg border border-blue-200">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#f2c41a' }}>
                                        <Bell className="text-black" size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-2">Marketing Communications</h4>
                                        <p className="text-gray-700">
                                            We only send promotions or offers with your explicit consent. You can opt-out at any time.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3 & 4 Side by Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Section 3: Legal Basis */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
                            <div className="p-6 flex items-center" style={{ backgroundColor: '#f2c41a' }}>
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black mr-4">
                                    <span className="text-white font-bold">3</span>
                                </div>
                                <h2 className="text-xl font-bold text-black">Legal Basis for Processing</h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-5">
                                    {[
                                        'Your consent',
                                        'Legitimate business purposes',
                                        'Legal obligations under Indian law',
                                        'Contractual necessity (for purchases or support)'
                                    ].map((basis, index) => (
                                        <div key={index} className="flex items-center">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#f2c41a' }}>
                                                <span className="text-black font-bold text-sm">{index + 1}</span>
                                            </div>
                                            <p className="text-gray-700">{basis}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Sharing Information */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
                            <div className="p-6 flex items-center" style={{ backgroundColor: '#f2c41a' }}>
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black mr-4">
                                    <span className="text-white font-bold">4</span>
                                </div>
                                <h2 className="text-xl font-bold text-black">Sharing of Information</h2>
                            </div>
                            <div className="p-6">
                                <div className="mb-6">
                                    <div className="flex items-center bg-red-50 p-4 rounded-lg mb-4">
                                        <AlertTriangle className="text-red-600 mr-3 flex-shrink-0" size={20} />
                                        <p className="text-red-700 font-medium">
                                            We do not sell or rent your personal data.
                                        </p>
                                    </div>
                                </div>

                                <h3 className="font-bold text-gray-900 mb-3">We may share only with:</h3>
                                <ul className="space-y-3">
                                    {[
                                        'Trusted third-party service providers',
                                        'Legal authorities, when required by law',
                                        'Business partners, only when necessary'
                                    ].map((item, index) => (
                                        <li key={index} className="flex items-center">
                                            <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: '#f2c41a' }}></div>
                                            <span className="text-gray-700">{item}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        All partners are bound by confidentiality and data protection obligations.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 5 & 6 Side by Side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Section 5: Data Retention */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
                            <div className="p-6 flex items-center" style={{ backgroundColor: '#f2c41a' }}>
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black mr-4">
                                    <span className="text-white font-bold">5</span>
                                </div>
                                <h2 className="text-xl font-bold text-black">Data Retention</h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#f2c41a' }}>
                                            <span className="text-black text-sm">⏱</span>
                                        </div>
                                        <p className="text-gray-700">We retain your information only as long as necessary for the purposes stated in this policy.</p>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#f2c41a' }}>
                                            <span className="text-black text-sm">⚖</span>
                                        </div>
                                        <p className="text-gray-700">We meet legal, tax, and regulatory requirements for retention periods.</p>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#f2c41a' }}>
                                            <Trash2 className="text-black" size={16} />
                                        </div>
                                        <p className="text-gray-700">After retention period, information is securely deleted or anonymized.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 6: Data Security */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full">
                            <div className="p-6 flex items-center" style={{ backgroundColor: '#f2c41a' }}>
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black mr-4">
                                    <span className="text-white font-bold">6</span>
                                </div>
                                <h2 className="text-xl font-bold text-black">Data Security</h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {[
                                        'Secure servers with encryption',
                                        'Access control and monitoring',
                                        'Regular security reviews',
                                        'Industry-standard security measures'
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#f2c41a' }}>
                                                <Lock className="text-black" size={16} />
                                            </div>
                                            <span className="text-gray-700">{item}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                    <div className="flex">
                                        <AlertTriangle className="text-yellow-600 mr-3 flex-shrink-0" size={20} />
                                        <p className="text-yellow-700 text-sm">
                                            <span className="font-semibold">Important:</span> No system is 100% secure. You use our Website at your own discretion.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 7: Your Rights */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-6 flex items-center" style={{ backgroundColor: '#f2c41a' }}>
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-black mr-4">
                                <span className="text-white font-bold">7</span>
                            </div>
                            <h2 className="text-xl font-bold text-black">Your Rights</h2>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                {[
                                    { icon: <Eye size={20} />, text: 'Access your personal data' },
                                    { icon: <Settings size={20} />, text: 'Request correction of inaccurate information' },
                                    { icon: <Trash2 size={20} />, text: 'Request deletion of your personal data' },
                                    { icon: <Bell size={20} />, text: 'Withdraw consent (for marketing)' },
                                    { icon: <Mail size={20} />, text: 'Contact us for data concerns' },
                                ].map((right, index) => (
                                    <div key={index} className="flex items-center">
                                        <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#f2c41a' }}>
                                            <div className="text-black">{right.icon}</div>
                                        </div>
                                        <span className="text-gray-700 font-medium">{right.text}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="text-center mt-8 pt-8 border-t border-gray-200">
                                <div className="inline-flex items-center justify-center px-6 py-3 rounded-full" style={{ backgroundColor: '#f2c41a' }}>
                                    <Mail className="text-black mr-2" size={20} />
                                    <span className="font-bold text-black">To exercise these rights, email us at info@printe.in</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Other Sections Grid */}
                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Cookies */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#f2c41a' }}>
                                <Cookie className="text-black" size={24} />
                            </div>
                            <h3 className="font-bold text-gray-900">Cookies & Tracking</h3>
                        </div>
                        <p className="text-gray-700 text-sm mb-4">We use cookies to improve functionality, analyze behavior, and enhance user experience.</p>
                        <div className="text-xs text-gray-500">
                            You may disable cookies via browser settings, but some features may not work properly.
                        </div>
                    </div>

                    {/* Children's Privacy */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#f2c41a' }}>
                                <span className="text-black font-bold text-lg">👶</span>
                            </div>
                            <h3 className="font-bold text-gray-900">Children's Privacy</h3>
                        </div>
                        <p className="text-gray-700 text-sm mb-4">Our services are not intended for children under 13.</p>
                        <div className="text-xs text-gray-500">
                            We do not knowingly collect data from children. Please contact us if you believe a child has provided information.
                        </div>
                    </div>

                    {/* Third-Party Links */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: '#f2c41a' }}>
                                <Globe className="text-black" size={24} />
                            </div>
                            <h3 className="font-bold text-gray-900">Third-Party Links</h3>
                        </div>
                        <p className="text-gray-700 text-sm mb-4">Our Website may contain links to third-party websites.</p>
                        <div className="text-xs text-gray-500">
                            We are not responsible for their privacy practices. Please review their privacy policies separately.
                        </div>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="mt-12 bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8">
                        <div className="text-center">
                            <h3 className="text-2xl font-bold mb-8" style={{ color: '#000' }}>Contact & Grievance Officer</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="text-center">
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#f2c41a' }}>
                                        <Building className="text-black" size={32} />
                                    </div>
                                    <h4 className="font-bold text-lg mb-2" style={{ color: '#000' }}>Company</h4>
                                    <p className="text-gray-700">Printe</p>
                                </div>

                                <div className="text-center">
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#f2c41a' }}>
                                        <Mail className="text-black" size={32} />
                                    </div>
                                    <h4 className="font-bold text-lg mb-2" style={{ color: '#000' }}>Email</h4>
                                    <a
                                        href="mailto:info@printe.in"
                                        className="text-gray-700 hover:text-black hover:underline"
                                    >
                                        info@printe.in
                                    </a>
                                </div>

                                <div className="text-center">
                                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#f2c41a' }}>
                                        <Globe className="text-black" size={32} />
                                    </div>
                                    <h4 className="font-bold text-lg mb-2" style={{ color: '#000' }}>Website</h4>
                                    <a
                                        href="https://www.printe.in"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-700 hover:text-black hover:underline"
                                    >
                                        www.printe.in
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Policy Update Notice */}
                <div className="mt-10 bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <div className="flex items-start">
                        <AlertTriangle className="text-amber-600 mr-3 flex-shrink-0 mt-1" size={24} />
                        <div>
                            <h4 className="font-bold text-amber-800 mb-2">Changes to This Privacy Policy</h4>
                            <p className="text-amber-700">
                                We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Last Updated" date. We encourage you to review it periodically.
                            </p>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
};

// Add Calendar component if not imported
const Calendar = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
);

export default PrivacyPolicy;