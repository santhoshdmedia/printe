

import React from 'react';
import { CheckOutlined, StarOutlined, TeamOutlined, SafetyCertificateOutlined, RocketOutlined, HeartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';



const AboutUs = () => {
  const coreValues = [
    {
      icon: <StarOutlined />,
      title: "Quality Commitment",
      description: "We maintain strict quality standards in every product and service"
    },
    {
      icon: <HeartOutlined />,
      title: "Customer Focus",
      description: "Every project is handled with care, precision, and focus on long-term relationships"
    },
    {
      icon: <RocketOutlined />,
      title: "Innovation",
      description: "We continuously adopt new technologies to deliver better results and improved experiences"
    },
    {
      icon: <SafetyCertificateOutlined />,
      title: "Integrity",
      description: "Transparency and trust form the foundation of everything we do"
    }
  ];

  const whyChooseUs = [
    "State-of-the-art printing infrastructure",
    "Professional design and branding support",
    "Competitive pricing with uncompromised quality",
    "Pan-India delivery and secure logistics",
    "Dedicated customer support team",
    "Fast turnaround times"
  ];

  const services = [
    {
      category: "Business Stationery",
      items: ["Visiting Cards", "Letterheads", "Envelopes"]
    },
    {
      category: "Marketing Collaterals",
      items: ["Flyers", "Brochures", "Posters", "Banners"]
    },
    {
      category: "Corporate Solutions",
      items: ["Corporate Gifts", "Office Supplies", "Customized Merchandise", "Packaging Solutions"]
    },
    {
      category: "Display Materials",
      items: ["Stickers", "Labels", "Display Materials"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-yellow-50">
      {/* Hero Section */}
      <section className="py-16  relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              About <span className="text-yellow-600">Printe.in</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
             Printe.in is a professionally managed online printing and branding solutions provider, dedicated to delivering high-quality, customized printing services for businesses, corporates, and professionals across India.With a strong focus on innovation, precision, and reliability, we aim to simplify the printing process through technology-driven solutions and customer-centric services.
            </p>
          </div>
        </div>
        <div className="absolute">
            <img src="" alt="" />
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Mission */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-6">
                <RocketOutlined className="text-yellow-600 text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                To empower businesses with reliable, high-quality, and affordable printing solutions, 
                delivered seamlessly through an efficient online platform.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We strive to bridge the gap between traditional printing services and modern digital 
                convenience — ensuring faster turnaround times, consistent quality, and complete satisfaction.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-[#f2c41a] rounded-lg flex items-center justify-center mb-6">
                <TeamOutlined className="text-[#ffffff] text-2xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                To be recognized as India's most trusted and preferred online printing partner, 
                known for innovation, integrity, and excellence in every print we deliver.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-gray-600 text-lg">The principles that guide everything we do</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {coreValues.map((value, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-white text-2xl">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-gray-600 text-lg">Comprehensive printing and branding solutions</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
                  {service.category}
                </h3>
                <ul className="space-y-2">
                  {service.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-gray-600">
                      <CheckOutlined className="text-green-500 mr-2 text-sm" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Printe.in</h2>
              <p className="text-gray-600 text-lg">Experience the difference of professional printing</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {whyChooseUs.map((item, index) => (
                <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-yellow-50 transition-colors duration-300">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                    <CheckOutlined className="text-yellow-600" />
                  </div>
                  <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default AboutUs;