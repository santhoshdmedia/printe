import React from 'react';
import { Award, Target, Shield, Heart, Package, Palette, Users, Clock, Star, TrendingUp, Globe, Building } from 'lucide-react';
import {Helmet} from 'react-helmet-async';

const AboutUs = () => {
  return (
    <div className=" bg-gradient-to-b from-gray-50 to-gray-100">
       <Helmet>
        <title>About Printe.in | Trusted Online Printing & Custom Gifting Brand</title>
        <meta name="description" content="Learn about Printe.in — a trusted online printing and personalized gifting brand delivering quality prints, custom gifts, and branding solutions backed by years of industry expertise." />
        <meta name="keywords" content="about printe, printe.in company, online printing brand india, custom printing company, personalized gifts provider, printing experts india, corporate printing solutions" />
    </Helmet>
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/70 z-0"></div>
        <div 
          className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1586880244406-556ebe35f282?q=80&w=2070")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ backgroundColor: '#f2c41a' }}>
              <Building className="text-black" size={36} />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Welcome to <span style={{ color: '#f2c41a' }}>Printe</span>
            </h1>
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Your reliable online destination for premium printing, personalised gifts, and complete branding solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Company Identity Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="md:flex">
              <div className="md:w-2/3 p-10">
                <div className="flex items-center mb-8">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mr-6" style={{ backgroundColor: '#f2c41a' }}>
                    <Shield className="text-black" size={28} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold" style={{ color: '#000' }}>Our Foundation</h2>
                    <p className="text-gray-600">Built on quality, innovation, and customer trust</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <p className="text-gray-700 text-lg">
                    <span className="font-bold" style={{ color: '#f2c41a' }}>Printe</span> is the brand name of <span className="font-semibold">PAZHANAM DESIGNS AND CONSTRUCTIONS PRIVATE LIMITED</span>, powered by D Media (www.dmedia.in), a trusted name in the print and media industry with over 15 years of proven experience.
                  </p>
                  
                  <p className="text-gray-700 text-lg">
                    We bring traditional print expertise into a modern e-commerce experience. Our platform is designed to help individuals, startups, and enterprises create impactful print and personalised products with ease.
                  </p>
                  
                  <div className="flex items-center bg-gray-50 p-5 rounded-xl">
                    <Clock className="mr-4 flex-shrink-0" style={{ color: '#f2c41a' }} size={24} />
                    <div>
                      <h3 className="font-bold text-gray-900">15+ Years of Excellence</h3>
                      <p className="text-gray-600">Proven expertise in print and media industry</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/3 p-10 flex items-center justify-center" style={{ backgroundColor: '#f2c41a' }}>
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full bg-black flex items-center justify-center mx-auto mb-6">
                    <span className="text-white text-4xl font-bold">D</span>
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-2">Powered by</h3>
                  <a 
                    href="https://www.dmedia.in" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-3xl font-bold text-black hover:underline"
                  >
                    D Media
                  </a>
                  <p className="text-black/80 mt-2">www.dmedia.in</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6" style={{ backgroundColor: '#f2c41a' }}>
              <Target className="text-black" size={30} />
            </div>
            <h2 className="text-4xl font-bold mb-6" style={{ color: '#000' }}>What We Do</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transforming ideas into tangible impact through premium printing and personalisation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Heart className="text-black" size={28} />,
                title: "Personalised Gifts",
                description: "Custom-printed products that carry special meaning and memories",
                color: "bg-pink-50"
              },
              {
                icon: <Users className="text-black" size={28} />,
                title: "Corporate Gifting",
                description: "Employee kits and corporate gifts that reflect your brand values",
                color: "bg-blue-50"
              },
              {
                icon: <Palette className="text-black" size={28} />,
                title: "Business Stationery",
                description: "Professional stationery and promotional materials for your business",
                color: "bg-purple-50"
              },
              {
                icon: <TrendingUp className="text-black" size={28} />,
                title: "Brand Merchandise",
                description: "Custom merchandise and bulk order solutions for brand promotion",
                color: "bg-green-50"
              },
              {
                icon: <Package className="text-black" size={28} />,
                title: "Premium Finishing",
                description: "Professional packaging and finishing for exceptional presentation",
                color: "bg-amber-50"
              },
              {
                icon: <Award className="text-black" size={28} />,
                title: "Complete Solutions",
                description: "End-to-end branding solutions from concept to delivery",
                color: "bg-indigo-50"
              }
            ].map((service, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
              >
                <div className={`p-8 ${service.color}`}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#f2c41a' }}>
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: '#000' }}>{service.title}</h3>
                  <p className="text-gray-700">{service.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mission Statement */}
          <div className="mt-16 bg-white rounded-3xl shadow-xl p-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8" style={{ backgroundColor: '#f2c41a' }}>
                <Star className="text-black" size={36} />
              </div>
              <p className="text-2xl text-gray-800 italic mb-8">
                "At Printe, we focus on delivering products that reflect your brand's identity and values. Every order is handled with precision, from design to final delivery, ensuring consistency and superior quality."
              </p>
              <div className="h-1 w-32 mx-auto mb-6" style={{ backgroundColor: '#f2c41a' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Commitment Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#f2c41a' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-black">Our Commitment</h2>
            <p className="text-xl text-black/80 max-w-3xl mx-auto">
              Built on a foundation of trust, craftsmanship, and innovation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black rounded-2xl p-8 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#f2c41a' }}>
                <Building className="text-black" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Backed by Excellence</h3>
              <p className="text-gray-300">
                PAZHANAM DESIGNS AND CONSTRUCTIONS PRIVATE LIMITED provides the foundation for our quality and reliability.
              </p>
            </div>

            <div className="bg-black rounded-2xl p-8 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#f2c41a' }}>
                <Globe className="text-black" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Powered by D Media</h3>
              <p className="text-gray-300">
                15+ years of print and media expertise powering every product we create.
              </p>
            </div>

            <div className="bg-black rounded-2xl p-8 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#f2c41a' }}>
                <Users className="text-black" size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Expert Team</h3>
              <p className="text-gray-300">
                Experienced production and creative teams dedicated to delivering excellence.
              </p>
            </div>
          </div>

          <div className="mt-12 bg-white rounded-2xl p-8 text-center max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6" style={{ color: '#000' }}>
              Transparent & Dependable
            </h3>
            <p className="text-gray-700 text-lg">
              We maintain transparent processes and dependable service, ensuring every client receives the attention and quality they deserve.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8" style={{ backgroundColor: '#f2c41a' }}>
              <Heart className="text-black" size={40} />
            </div>
            <h2 className="text-4xl font-bold mb-6" style={{ color: '#000' }}>
              Turning Ideas Into Memories
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Printe by D Media stands for trust, craftsmanship, and innovation—helping businesses and individuals turn ideas into memorable print and gift experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a 
                href="https://www.printe.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg"
                style={{ backgroundColor: '#f2c41a', color: '#000' }}
              >
                Visit Our Store
              </a>
              <a 
                href="https://www.dmedia.in" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-8 py-4 rounded-full font-bold text-lg border-2 transition-all hover:scale-105"
                style={{ borderColor: '#f2c41a', color: '#000' }}
              >
                Learn About D Media
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      
    </div>
  );
};

export default AboutUs;