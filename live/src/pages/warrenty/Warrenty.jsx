import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Card,
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Tag,
  Divider,
  Space,
  Spin,
  Descriptions,
  Result,
  Steps,
  Alert,
  Typography
} from 'antd';
import {
  QrcodeOutlined,
  CheckCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  CalendarOutlined,
  LoadingOutlined,
  SafetyOutlined,
  GiftOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import {
  FaQrcode,
  FaCheckCircle,
  FaRegCreditCard,
  FaDownload,
  FaCopy,
  FaShieldAlt
} from 'react-icons/fa';
import { HiShieldCheck } from 'react-icons/hi';
import { verifywarrnty,activatewarrnty } from '../../helper/api_helper';

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

// Yellow color theme
const YELLOW_THEME = {
  primary: '#f2c41a',
  light: '#fdf6e3',
  dark: '#d4ac0d',
  bg: '#fffdf5'
};

const WarrantyActivation = () => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [warrantyData, setWarrantyData] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [form] = Form.useForm();

  // Step 1: Verify Code
  const verifyWarrantyCode = async () => {
    if (!verificationCode.trim()) {
      toast.error('Please enter a warranty code');
      return;
    }

    setVerifying(true);
    
    try {
      // Mock API call - replace with actual API
      const response = await verifywarrnty(verificationCode);
      
      if (response.data.success) {
        setWarrantyData(response.data);
        toast.success('Warranty verified successfully!');
        setStep(1); // Move to activation step
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid warranty code';
      toast.error(errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  // Step 2: Activate Warranty
  const activateWarranty = async (values) => {
    if (!warrantyData) return;

    setLoading(true);
    
    try {
      const response = await activateWarranty(verificationCode, {
        code: verificationCode,
        ...values,
        purchaseDate: values.purchaseDate.format('YYYY-MM-DD')
      });

      if (response.data.success) {
        toast.success('Warranty activated successfully!');
        setStep(2); // Move to success step
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Activation failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  // Download Warranty Card
  const downloadWarrantyCard = () => {
    toast.success('Warranty card downloaded!');
    // In a real app, this would generate and download a PDF
  };

  // Reset to start
  const resetProcess = () => {
    setStep(0);
    setVerificationCode('');
    setWarrantyData(null);
    form.resetFields();
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { color: 'green', text: 'Active' },
      'expired': { color: 'red', text: 'Expired' },
      'not-activated': { color: YELLOW_THEME.primary, text: 'Not Activated' },
      'pending': { color: YELLOW_THEME.dark, text: 'Pending' }
    };

    const config = statusConfig[status] || { color: 'gray', text: 'Unknown' };
    return <Tag color={config.color} style={{ fontWeight: 600 }}>{config.text}</Tag>;
  };

  return (
    <div className="max-w-5xl mx-auto px-4" style={{ backgroundColor: YELLOW_THEME.bg, minHeight: '100vh', padding: '20px 0' }}>
      {/* Header */}
      <div className="text-center mb-10 fade-in">
        <div className="flex justify-center mb-6">
          <div 
            className="p-5 rounded-full"
            style={{ 
              backgroundColor: YELLOW_THEME.light,
              border: `3px solid ${YELLOW_THEME.primary}`
            }}
          >
            <HiShieldCheck style={{ fontSize: '48px', color: YELLOW_THEME.primary }} />
          </div>
        </div>
        <Title level={2} style={{ color: '#1a202c', marginBottom: '8px' }}>
          Warranty Activation Portal
        </Title>
        <Text style={{ color: '#4a5568', fontSize: '16px' }}>
          Activate your product warranty and enjoy 6 months of protection
        </Text>
      </div>

      {/* Progress Bar */}
      <div className="mb-10" style={{ padding: '0 20px' }}>
        <div 
          className="h-2 rounded-full mb-6"
          style={{ 
            backgroundColor: '#e2e8f0',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ 
              width: step === 0 ? '33%' : step === 1 ? '66%' : '100%',
              backgroundColor: YELLOW_THEME.primary
            }}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className={`text-center ${step >= 0 ? 'text-gray-800' : 'text-gray-400'}`}>
            <div 
              className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${step >= 0 ? 'shadow-lg' : 'bg-gray-100'}`}
              style={{ 
                backgroundColor: step >= 0 ? YELLOW_THEME.primary : '#f7fafc',
                color: step >= 0 ? 'white' : '#a0aec0'
              }}
            >
              <QrcodeOutlined style={{ fontSize: '20px' }} />
            </div>
            <Text strong>Verify Code</Text>
          </div>
          <div className={`text-center ${step >= 1 ? 'text-gray-800' : 'text-gray-400'}`}>
            <div 
              className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${step >= 1 ? 'shadow-lg' : 'bg-gray-100'}`}
              style={{ 
                backgroundColor: step >= 1 ? YELLOW_THEME.primary : '#f7fafc',
                color: step >= 1 ? 'white' : '#a0aec0'
              }}
            >
              <CheckCircleOutlined style={{ fontSize: '20px' }} />
            </div>
            <Text strong>Activate</Text>
          </div>
          <div className={`text-center ${step >= 2 ? 'text-gray-800' : 'text-gray-400'}`}>
            <div 
              className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${step >= 2 ? 'shadow-lg' : 'bg-gray-100'}`}
              style={{ 
                backgroundColor: step >= 2 ? YELLOW_THEME.primary : '#f7fafc',
                color: step >= 2 ? 'white' : '#a0aec0'
              }}
            >
              <GiftOutlined style={{ fontSize: '20px' }} />
            </div>
            <Text strong>Complete</Text>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '0 20px' }}>
        {/* Step 1: Verification */}
        {step === 0 && (
          <div className="slide-in">
            <Card 
              className="shadow-xl border-0"
              style={{ 
                borderRadius: '16px',
                borderTop: `6px solid ${YELLOW_THEME.primary}`,
                overflow: 'hidden'
              }}
            >
              <div className="text-center mb-8">
                <div className="mb-6">
                  <FaQrcode style={{ fontSize: '64px', color: YELLOW_THEME.primary }} />
                </div>
                <Title level={3} style={{ color: '#1a202c', marginBottom: '8px' }}>
                  Verify Your Product Code
                </Title>
                <Text style={{ color: '#718096', fontSize: '15px' }}>
                  Enter the unique 9-digit code from your product packaging or scan the QR code
                </Text>
              </div>

              <div className="max-w-md mx-auto">
                <Input
                  size="large"
                  placeholder="Enter warranty code (e.g., WRT-9A8B7C6D)"
                  prefix={<QrcodeOutlined style={{ color: YELLOW_THEME.primary }} />}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  onPressEnter={verifyWarrantyCode}
                  className="mb-6"
                  style={{ 
                    borderRadius: '8px',
                    border: `2px solid #e2e8f0`,
                    padding: '12px 16px',
                    fontSize: '16px'
                  }}
                />

                <Button
                  type="primary"
                  size="large"
                  block
                  loading={verifying}
                  onClick={verifyWarrantyCode}
                  icon={<CheckCircleOutlined />}
                  style={{
                    backgroundColor: YELLOW_THEME.primary,
                    borderColor: YELLOW_THEME.primary,
                    borderRadius: '8px',
                    height: '52px',
                    fontSize: '16px',
                    fontWeight: 600
                  }}
                  className="hover:opacity-90 transition-opacity"
                >
                  {verifying ? 'Verifying...' : 'Verify Product Code'}
                </Button>

                <div className="text-center mt-6">
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    <SafetyOutlined className="mr-2" />
                    Your information is secure and encrypted
                  </Text>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 1 Results */}
        {step >= 1 && warrantyData && (
          <div className="mb-8 fade-in">
            <Card 
              className="shadow-lg border-0"
              style={{ 
                borderRadius: '12px',
                borderLeft: `6px solid ${YELLOW_THEME.primary}`,
                backgroundColor: YELLOW_THEME.light
              }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircleOutlined style={{ color: YELLOW_THEME.primary, fontSize: '20px' }} />
                    <Title level={4} style={{ margin: 0, color: '#1a202c' }}>
                      Product Verified Successfully
                    </Title>
                  </div>
                  <div className="flex items-center flex-wrap gap-2">
                    <Text type="secondary">Code:</Text>
                    <div 
                      className="px-4 py-2 rounded-lg font-mono"
                      style={{ backgroundColor: 'white', border: `1px dashed ${YELLOW_THEME.primary}` }}
                    >
                      {verificationCode}
                    </div>
                    <Button 
                      type="text" 
                      size="small"
                      icon={<FaCopy />}
                      onClick={() => copyToClipboard(verificationCode)}
                      style={{ color: YELLOW_THEME.primary }}
                    />
                  </div>
                </div>
                {getStatusBadge(warrantyData.warranty?.status || 'not-activated')}
              </div>

              <Divider style={{ margin: '16px 0', borderColor: '#e2e8f0' }} />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <Text type="secondary">Product</Text>
                  <div className="font-semibold text-lg">{warrantyData.product?.name || 'N/A'}</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <Text type="secondary">Model</Text>
                  <div className="font-semibold text-lg">{warrantyData.product?.model || 'N/A'}</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <Text type="secondary">Batch</Text>
                  <div className="font-semibold text-lg">{warrantyData.product?.batchNumber || 'N/A'}</div>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <Text type="secondary">Warranty</Text>
                  <div className="font-semibold text-lg">{warrantyData.warranty?.duration || '6 Months'}</div>
                </div>
              </div>

              {warrantyData.warranty?.status === 'not-activated' && (
                <Alert
                  message="Ready for Activation"
                  description="Your product is verified and ready for warranty activation. Please complete the form below."
                  type="info"
                  showIcon
                  style={{ 
                    marginTop: '20px',
                    border: `1px solid ${YELLOW_THEME.primary}`,
                    backgroundColor: 'rgba(242, 196, 26, 0.1)'
                  }}
                />
              )}
            </Card>
          </div>
        )}

        {/* Step 2: Activation Form */}
        {step === 1 && warrantyData && (
          <div className="slide-in">
            <Card 
              className="shadow-xl border-0"
              style={{ 
                borderRadius: '16px',
                borderTop: `6px solid ${YELLOW_THEME.primary}`,
                overflow: 'hidden'
              }}
              title={
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: YELLOW_THEME.light }}
                  >
                    <IdcardOutlined style={{ color: YELLOW_THEME.primary, fontSize: '20px' }} />
                  </div>
                  <Title level={4} style={{ margin: 0 }}>
                    Complete Your Warranty Registration
                  </Title>
                </div>
              }
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={activateWarranty}
                initialValues={{ purchaseDate: null }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div>
                    <div 
                      className="p-4 rounded-lg mb-6"
                      style={{ backgroundColor: YELLOW_THEME.light }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <UserOutlined style={{ color: YELLOW_THEME.primary }} />
                        <Text strong style={{ fontSize: '16px' }}>Customer Information</Text>
                      </div>
                      <Text type="secondary">
                        Please provide your contact details for warranty communications
                      </Text>
                    </div>

                    <Form.Item
                      name="customerName"
                      label={<Text strong>Full Name</Text>}
                      rules={[{ required: true, message: 'Please enter your full name' }]}
                    >
                      <Input 
                        size="large" 
                        placeholder="John Doe" 
                        prefix={<UserOutlined style={{ color: YELLOW_THEME.primary }} />}
                        style={{ borderRadius: '8px', padding: '12px' }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="customerEmail"
                      label={<Text strong>Email Address</Text>}
                      rules={[
                        { required: true, message: 'Please enter your email' },
                        { type: 'email', message: 'Please enter a valid email' }
                      ]}
                    >
                      <Input 
                        size="large" 
                        placeholder="john@example.com" 
                        prefix={<MailOutlined style={{ color: YELLOW_THEME.primary }} />}
                        style={{ borderRadius: '8px', padding: '12px' }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="customerPhone"
                      label={<Text strong>Phone Number</Text>}
                      rules={[{ required: true, message: 'Please enter your phone number' }]}
                    >
                      <Input 
                        size="large" 
                        placeholder="+1 (555) 123-4567" 
                        prefix={<PhoneOutlined style={{ color: YELLOW_THEME.primary }} />}
                        style={{ borderRadius: '8px', padding: '12px' }}
                      />
                    </Form.Item>
                  </div>

                  {/* Right Column */}
                  <div>
                    <div 
                      className="p-4 rounded-lg mb-6"
                      style={{ backgroundColor: YELLOW_THEME.light }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <ShoppingOutlined style={{ color: YELLOW_THEME.primary }} />
                        <Text strong style={{ fontSize: '16px' }}>Purchase Details</Text>
                      </div>
                      <Text type="secondary">
                        Provide your purchase information for warranty validation
                      </Text>
                    </div>

                    <Form.Item
                      name="purchaseDate"
                      label={<Text strong>Purchase Date</Text>}
                      rules={[{ required: true, message: 'Please select purchase date' }]}
                    >
                      <DatePicker 
                        size="large" 
                        className="w-full"
                        style={{ borderRadius: '8px', padding: '12px', width: '100%' }}
                        format="MMMM DD, YYYY"
                        suffixIcon={<CalendarOutlined style={{ color: YELLOW_THEME.primary }} />}
                      />
                    </Form.Item>

                    <Form.Item
                      name="retailerName"
                      label={<Text strong>Retailer/Store Name</Text>}
                      rules={[{ required: true, message: 'Please enter retailer name' }]}
                    >
                      <Input 
                        size="large" 
                        placeholder="Tech Store Inc." 
                        prefix={<ShoppingOutlined style={{ color: YELLOW_THEME.primary }} />}
                        style={{ borderRadius: '8px', padding: '12px' }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="invoiceNumber"
                      label={<Text strong>Invoice Number</Text>}
                      rules={[{ required: true, message: 'Please enter invoice number' }]}
                    >
                      <Input 
                        size="large" 
                        placeholder="INV-2024-001" 
                        prefix={<FileTextOutlined style={{ color: YELLOW_THEME.primary }} />}
                        style={{ borderRadius: '8px', padding: '12px' }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="notes"
                      label={<Text strong>Additional Notes (Optional)</Text>}
                    >
                      <TextArea 
                        rows={3}
                        placeholder="Any additional information about your purchase..."
                        style={{ borderRadius: '8px', padding: '12px' }}
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* Terms Alert */}
                <Alert
                  message="Warranty Terms & Conditions"
                  description={
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div style={{ color: YELLOW_THEME.primary, marginTop: '2px' }}>•</div>
                        <Text>Warranty is valid for 6 months from the purchase date</Text>
                      </div>
                      <div className="flex items-start gap-2">
                        <div style={{ color: YELLOW_THEME.primary, marginTop: '2px' }}>•</div>
                        <Text>Coverage includes manufacturing defects only</Text>
                      </div>
                      <div className="flex items-start gap-2">
                        <div style={{ color: YELLOW_THEME.primary, marginTop: '2px' }}>•</div>
                        <Text>Keep your invoice for all warranty claims</Text>
                      </div>
                      <div className="flex items-start gap-2">
                        <div style={{ color: YELLOW_THEME.primary, marginTop: '2px' }}>•</div>
                        <Text>Warranty activation cannot be reversed once submitted</Text>
                      </div>
                    </div>
                  }
                  type="warning"
                  showIcon
                  style={{ 
                    margin: '24px 0',
                    borderRadius: '8px',
                    border: `1px solid ${YELLOW_THEME.primary}`
                  }}
                />

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
                  <Button
                    onClick={resetProcess}
                    disabled={loading}
                    size="large"
                    style={{ 
                      borderRadius: '8px',
                      padding: '0 32px',
                      height: '48px'
                    }}
                  >
                    Back to Verification
                  </Button>

                  <Button
                    type="primary"
                    size="large"
                    htmlType="submit"
                    loading={loading}
                    icon={<CheckCircleOutlined />}
                    style={{
                      backgroundColor: YELLOW_THEME.primary,
                      borderColor: YELLOW_THEME.primary,
                      borderRadius: '8px',
                      padding: '0 48px',
                      height: '48px',
                      fontSize: '16px',
                      fontWeight: 600,
                      minWidth: '200px'
                    }}
                    className="hover:opacity-90 transition-opacity"
                  >
                    {loading ? 'Activating...' : 'Activate Warranty'}
                  </Button>
                </div>
              </Form>
            </Card>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 2 && (
          <div className="fade-in">
            <Card 
              className="shadow-xl border-0 text-center"
              style={{ 
                borderRadius: '16px',
                borderTop: `6px solid ${YELLOW_THEME.primary}`,
                backgroundColor: YELLOW_THEME.light
              }}
            >
              <div className="mb-8">
                <div 
                  className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{ 
                    backgroundColor: YELLOW_THEME.primary,
                    boxShadow: `0 8px 24px rgba(242, 196, 26, 0.3)`
                  }}
                >
                  <FaCheckCircle style={{ fontSize: '48px', color: 'white' }} />
                </div>
                <Title level={2} style={{ color: '#1a202c', marginBottom: '12px' }}>
                  Warranty Activated Successfully!
                </Title>
                <Text style={{ color: '#4a5568', fontSize: '18px' }}>
                  Your product is now protected for 6 months
                </Text>
              </div>

              {/* Warranty Summary */}
              <div 
                className="mb-10 p-8 rounded-xl mx-auto max-w-2xl"
                style={{ 
                  backgroundColor: 'white',
                  border: `2px solid ${YELLOW_THEME.primary}`
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-4">
                    <div 
                      className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center"
                      style={{ backgroundColor: YELLOW_THEME.light }}
                    >
                      <CalendarOutlined style={{ color: YELLOW_THEME.primary, fontSize: '24px' }} />
                    </div>
                    <Text strong style={{ display: 'block', marginBottom: '4px' }}>Start Date</Text>
                    <Text style={{ fontSize: '16px', fontWeight: 600 }}>
                      {form.getFieldValue('purchaseDate')?.format('MMM DD, YYYY') || 'Today'}
                    </Text>
                  </div>
                  <div className="text-center p-4">
                    <div 
                      className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center"
                      style={{ backgroundColor: YELLOW_THEME.light }}
                    >
                      <CalendarOutlined style={{ color: YELLOW_THEME.primary, fontSize: '24px' }} />
                    </div>
                    <Text strong style={{ display: 'block', marginBottom: '4px' }}>End Date</Text>
                    <Text style={{ fontSize: '16px', fontWeight: 600 }}>
                      {form.getFieldValue('purchaseDate')?.add(6, 'months').format('MMM DD, YYYY')}
                    </Text>
                  </div>
                  <div className="text-center p-4">
                    <div 
                      className="w-12 h-12 rounded-lg mx-auto mb-3 flex items-center justify-center"
                      style={{ backgroundColor: YELLOW_THEME.light }}
                    >
                      <FaShieldAlt style={{ color: YELLOW_THEME.primary, fontSize: '24px' }} />
                    </div>
                    <Text strong style={{ display: 'block', marginBottom: '4px' }}>Status</Text>
                    <Tag 
                      color="green" 
                      style={{ 
                        fontSize: '14px', 
                        padding: '4px 12px',
                        fontWeight: 600 
                      }}
                    >
                      ACTIVE
                    </Tag>
                  </div>
                </div>

                <Divider style={{ borderColor: '#e2e8f0' }} />

                <div className="space-y-4 text-left max-w-md mx-auto">
                  <div className="flex justify-between">
                    <Text type="secondary">Product</Text>
                    <Text strong>{warrantyData?.product?.name}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">Customer</Text>
                    <Text strong>{form.getFieldValue('customerName')}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">Warranty Code</Text>
                    <code 
                      className="font-mono px-3 py-1 rounded"
                      style={{ backgroundColor: YELLOW_THEME.light }}
                    >
                      {verificationCode}
                    </code>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <Button
                  type="primary"
                  size="large"
                  icon={<FaDownload />}
                  onClick={downloadWarrantyCard}
                  style={{
                    backgroundColor: YELLOW_THEME.primary,
                    borderColor: YELLOW_THEME.primary,
                    borderRadius: '8px',
                    height: '52px',
                    padding: '0 40px',
                    fontSize: '16px',
                    fontWeight: 600
                  }}
                >
                  Download Warranty Card
                </Button>
                <Button
                  size="large"
                  onClick={resetProcess}
                  style={{
                    borderRadius: '8px',
                    height: '52px',
                    padding: '0 40px',
                    fontSize: '16px'
                  }}
                >
                  Activate Another Product
                </Button>
              </div>

              {/* Important Notes */}
              <div 
                className="p-6 rounded-lg max-w-2xl mx-auto"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <FileTextOutlined style={{ color: YELLOW_THEME.primary, fontSize: '18px' }} />
                  <Text strong style={{ fontSize: '16px' }}>Important Information</Text>
                </div>
                <div className="space-y-2 text-left">
                  <div className="flex items-start gap-3">
                    <div style={{ color: YELLOW_THEME.primary, marginTop: '4px' }}>•</div>
                    <Text>Save your warranty code for future reference and claims</Text>
                  </div>
                  <div className="flex items-start gap-3">
                    <div style={{ color: YELLOW_THEME.primary, marginTop: '4px' }}>•</div>
                    <Text>Keep your purchase invoice in a safe place</Text>
                  </div>
                  <div className="flex items-start gap-3">
                    <div style={{ color: YELLOW_THEME.primary, marginTop: '4px' }}>•</div>
                    <Text>Contact support for any warranty-related inquiries</Text>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Help Section */}
        {step !== 2 && (
          <div className="mt-10 text-center fade-in">
            <div 
              className="inline-flex items-center gap-3 px-6 py-4 rounded-xl"
              style={{ 
                backgroundColor: 'white',
                border: `1px solid ${YELLOW_THEME.primary}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
              }}
            >
              <HiShieldCheck style={{ color: YELLOW_THEME.primary, fontSize: '20px' }} />
              <Text style={{ color: '#4a5568' }}>
                Need assistance? Contact our support team at{' '}
                <a 
                  href="mailto:support@example.com"
                  style={{ 
                    color: YELLOW_THEME.primary,
                    fontWeight: 600,
                    textDecoration: 'underline'
                  }}
                >
                  support@example.com
                </a>
              </Text>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarrantyActivation;