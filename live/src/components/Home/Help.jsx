/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { 
  PhoneOutlined, 
  MailOutlined, 
  EnvironmentOutlined,
  CustomerServiceOutlined,
  MessageOutlined,
  SendOutlined,
  PlusOutlined,
  MinusOutlined 
} from "@ant-design/icons";
import { 
  Button, 
  Form, 
  Input, 
  Select, 
  Card, 
  Typography, 
  Collapse, 
  Grid 
} from "antd";
import QAComponents from "../QAComponents";
import { FrequentlyAskedQuestions_one, FrequentlyAskedQuestions_two } from "../../../data";
import { helpcenter } from "../../helper/api_helper";
import { SUCCESS_NOTIFICATION } from "../../helper/notification_helper";

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

const Help = () => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeKey, setActiveKey] = useState(null);
  const screens = useBreakpoint();

const prefixSelector = (
  <Form.Item name="prefix" noStyle initialValue="91">
    <Select style={{ width: 80 }} disabled>
      <Select.Option value="91">+91</Select.Option>
    </Select>
  </Form.Item>
);

  const handleFinish = async (values) => {
    setIsSubmitting(true);
    try {
      const result = await helpcenter(values);
      SUCCESS_NOTIFICATION(result);
      form.resetFields();
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePanelChange = (key) => {
    setActiveKey(key === activeKey ? null : key);
  };

  const customExpandIcon = (props) => {
    return props.isActive ? 
      <MinusOutlined style={{ color: '#f9c114' }} /> : 
      <PlusOutlined style={{ color: '#f9c114' }} />;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Combine and render FAQs
  const renderFAQs = (faqData, prefix) => 
    faqData.children.map((item, index) => (
      <Panel 
        header={<span className="text-md font-semibold text-black">{item.label}</span>} 
        key={`${prefix}-${index}`}
        className="faq-panel mb-4 bg-white rounded-lg overflow-hidden"
      >
        <div className="text-gray-700 pl-2">{item.children}</div>
      </Panel>
    ));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-yellow-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <CustomerServiceOutlined className="text-2xl text-yellow-600" />
          </div>
          <Title level={1} className="!text-3xl md:!text-4xl font-bold text-gray-800 mb-2">
            How can we help you?
          </Title>
          <Text className="text-lg text-gray-600">
            We're here to assist you with any questions or concerns
          </Text>
        </header>

        {/* Contact Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: <PhoneOutlined className="text-xl text-yellow-600" />,
              title: "Call Us",
              description: "Speak directly with our support team",
              contact: "+91 95856 10000",
              href: "tel:+919585610000",
              details: "Mon - Sat: 10:00 AM - 8:00 PM"
            },
            {
              icon: <MailOutlined className="text-xl text-green-600" />,
              title: "Email Us",
              description: "Send us an email for inquiries",
              contact: "info@printe.in",
              href: "mailto:info@printe.in"
            },
            {
              icon: <EnvironmentOutlined className="text-xl text-purple-600" />,
              title: "Visit Us",
              description: "Our office location",
              contact: "Printe #8, Church Colony, Opp. Bishop Heber College, Vayalur Road, Trichy-17."
            }
          ].map((card, index) => (
            <Card key={index} className="text-center border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-xl">
              <div className={`inline-flex items-center justify-center w-12 h-12 ${index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-green-100' : 'bg-purple-100'} rounded-full mb-4 mx-auto`}>
                {card.icon}
              </div>
              <Title level={3} className="!text-lg font-semibold text-gray-800 mb-2">
                {card.title}
              </Title>
              <Text className="text-gray-600 block mb-2">{card.description}</Text>
              {card.href ? (
                <a href={card.href} className={`${index === 0 ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'} font-medium text-lg transition-colors break-all`}>
                  {card.contact}
                </a>
              ) : (
                <div className="text-gray-800 font-medium">{card.contact}</div>
              )}
              {card.details && <div className="mt-3 text-sm text-gray-500">{card.details}</div>}
            </Card>
          ))}
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f9c114] rounded-full mb-4 mx-auto">
              <CustomerServiceOutlined className="text-2xl text-white" />
            </div>
            <Title level={2} className="!text-2xl md:!text-3xl font-bold text-black mb-3">
              Frequently Asked Questions
            </Title>
            <Text className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find quick answers to common questions about our products, services, and policies
            </Text>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Collapse 
              accordion 
              activeKey={activeKey} 
              onChange={handlePanelChange}
              expandIcon={customExpandIcon}
              expandIconPosition="end"
              bordered={false}
              className="faq-collapse bg-transparent"
            >
              {renderFAQs(FrequentlyAskedQuestions_one, 'one')}
            </Collapse>
            
            <Collapse 
              accordion 
              activeKey={activeKey} 
              onChange={handlePanelChange}
              expandIcon={customExpandIcon}
              expandIconPosition="end"
              bordered={false}
              className="faq-collapse bg-transparent"
            >
              {renderFAQs(FrequentlyAskedQuestions_two, 'two')}
            </Collapse>
          </div>
          
          <div className="text-center mt-8 pt-4 border-t border-gray-200">
            <Text className="text-gray-600 block mb-4">
              Still have questions? We're here to help!
            </Text>
            <Button 
              type="primary" 
              size="large"
              className="bg-[#f9c114] hover:bg-[#e0ab0a] border-0 h-12 font-medium rounded-lg shadow-md hover:shadow-lg transition-all px-6"
              onClick={() => document.getElementById('contact-form').scrollIntoView({ behavior: 'smooth' })}
            >
              Contact Support
            </Button>
          </div>
        </section>

        {/* Contact Form */}
        <section id="contact-form">
          <div className="border-0 shadow-md rounded-xl overflow-hidden !p-0  bg-white">
            <div className="md:flex !p-0">
              <div className="md:w-2/5 bg-gradient-to-br from-yellow-600 to-yellow-700 text-white p-8 hidden md:block !m-0">
                <div className="h-full flex flex-col justify-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                    <MessageOutlined className="text-2xl" />
                  </div>
                  <Title level={2} className="!text-2xl font-bold !text-white mb-4">
                    Get in Touch
                  </Title>
                  <Text className="text-yellow-100 text-lg">
                    Have a question or need assistance? Fill out the form and our team will get back to you as soon as possible.
                  </Text>
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-3">
                        <PhoneOutlined className="text-white" />
                      </div>
                      <div>+91 95856 10000</div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-3">
                        <MailOutlined className="text-white" />
                      </div>
                      <div>info@printe.in</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-3/5 p-6 md:p-8">
                <Title level={3} className="!text-xl font-semibold text-gray-800 mb-6">
                  Send us a Message
                </Title>
                
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleFinish}
                  className="contact-form"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Form.Item 
                      name="name" 
                      label="Full Name" 
                      rules={[{ required: true, message: "Please enter your name!" }]}
                    >
                      <Input placeholder="Your full name" size="large" />
                    </Form.Item>
                    
                    <Form.Item
                      name="email"
                      label="Email Address"
                      rules={[
                        { type: "email", message: "Please enter a valid email address!" },
                        { required: true, message: "Please input your email!" },
                      ]}
                    >
                      <Input placeholder="your.email@example.com" size="large" />
                    </Form.Item>
                  </div>
                  
                  <Form.Item
                    name="phone"
                    label="Phone Number"
                    rules={[{ required: true, message: "Please input your phone number!" }]}
                    className="mb-4"
                  >
                    <Input 
                      addonBefore={prefixSelector} 
                      placeholder="Enter your phone number" 
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Your Message"
                    name="message"
                    rules={[{ required: true, message: "Please enter your message!" }]}
                    className="mb-6"
                  >
                    <Input.TextArea rows={5} placeholder="How can we help you?" />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      size="large"
                      icon={<SendOutlined />}
                      loading={isSubmitting}
                      className="w-full bg-yellow-600 hover:!bg-yellow-700 border-0 h-12 text-lg font-medium rounded-lg"
                    >
                      Send Message
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .contact-form :global(.ant-form-item-label > label) {
          font-weight: 500;
          color: #374151;
        }
        
        .contact-form :global(.ant-input),
        .contact-form :global(.ant-input-number-input),
        .contact-form :global(.ant-select-selector) {
          border-radius: 10px;
        }
        
        .faq-collapse :global(.ant-collapse-item) {
          border: none !important;
        }
        
        .faq-collapse :global(.ant-collapse-content) {
          border: none;
          background-color: white;
        }
        
        .faq-collapse :global(.ant-collapse-header) {
          padding: 16px 20px !important;
          background-color: white;
          border-radius: 8px !important;
        }
        
        .faq-panel {
          box-shadow: 0 2px 8px rgba(0,0,0,0.09);
          border: 1px solid #eaeaea;
        }
      `}</style>
    </div>
  );
};

export default Help;