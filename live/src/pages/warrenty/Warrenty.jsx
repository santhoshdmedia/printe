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
  Alert
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
  LoadingOutlined
} from '@ant-design/icons';
import {
  FaQrcode,
  FaCheckCircle,
  FaRegCreditCard,
  FaDownload,
  FaCopy
} from 'react-icons/fa';
import { HiShieldCheck } from 'react-icons/hi';
import { verifywarrnty,activatewarrnty } from '../../helper/api_helper';

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

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
    const datas={...values,
          purchaseDate: values.purchaseDate.format('YYYY-MM-DD')}
    
    try {
      const response = await activatewarrnty(verificationCode,datas)

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
      'not-activated': { color: 'orange', text: 'Not Activated' },
      'pending': { color: 'blue', text: 'Pending' }
    };

    const config = statusConfig[status] || { color: 'gray', text: 'Unknown' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 fade-in">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-blue-100 rounded-full">
            <HiShieldCheck className="text-4xl text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Warranty Activation Portal
        </h1>
        <p className="text-gray-600">
          Verify your product code and activate your 6-month warranty
        </p>
      </div>

      {/* Steps */}
      <div className="mb-8">
        <Steps current={step} className="px-4">
          <Step 
            title="Verify Code" 
            icon={<QrcodeOutlined />} 
            description="Enter product code"
          />
          <Step 
            title="Activate" 
            icon={<CheckCircleOutlined />} 
            description="Fill customer details"
          />
          <Step 
            title="Complete" 
            icon={<FaCheckCircle className="text-lg" />} 
            description="Warranty activated"
          />
        </Steps>
      </div>

      {/* Step 1: Verification */}
      {step === 0 && (
        <div className="slide-in">
          <Card className="shadow-lg border-0">
            <div className="text-center mb-6">
              <FaQrcode className="text-5xl text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Verify Your Product
              </h2>
              <p className="text-gray-600">
                Enter the 12-digit code from your product or scan the QR code
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <Input
                size="large"
                placeholder="Enter warranty code (e.g., PROD-BATCH001-001)"
                prefix={<QrcodeOutlined className="text-gray-400" />}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                onPressEnter={verifyWarrantyCode}
                className="mb-4"
              />

              <Button
                type="primary"
                size="large"
                block
                loading={verifying}
                onClick={verifyWarrantyCode}
                icon={<CheckCircleOutlined />}
              >
                {verifying ? 'Verifying...' : 'Verify Code'}
              </Button>

              <Divider plain>OR</Divider>

              <div className="text-center">
                <Button 
                  type="default" 
                  size="large"
                  icon={<FaQrcode />}
                  className="mb-2"
                >
                  Scan QR Code
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Point your camera at the QR code on your product
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Step 1 Results (Shown during Step 2) */}
      {step >= 1 && warrantyData && (
        <div className="mb-6 fade-in">
          <Card className="shadow-md border-l-4 border-l-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Product Verified Successfully
                </h3>
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-gray-600">Code:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    {verificationCode}
                  </code>
                  <Button 
                    size="small" 
                    type="text"
                    icon={<FaCopy />}
                    onClick={() => copyToClipboard(verificationCode)}
                  />
                </div>
              </div>
              {getStatusBadge(warrantyData.warranty?.status || 'not-activated')}
            </div>

            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} className="mt-4">
              <Descriptions.Item label="Product">
                {warrantyData.product?.name || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Model">
                {warrantyData.product?.model || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Batch">
                {warrantyData.product?.batchNumber || 'N/A'}
              </Descriptions.Item>
              {warrantyData.warranty?.type && (
                <Descriptions.Item label="Warranty Type">
                  {warrantyData.warranty.type}
                </Descriptions.Item>
              )}
              {warrantyData.warranty?.duration && (
                <Descriptions.Item label="Duration">
                  {warrantyData.warranty.duration}
                </Descriptions.Item>
              )}
            </Descriptions>

            {warrantyData.warranty?.status === 'not-activated' && (
              <Alert
                message="Warranty Not Activated"
                description="Please fill in the form below to activate your 6-month warranty."
                type="info"
                showIcon
                className="mt-4"
              />
            )}
          </Card>
        </div>
      )}

      {/* Step 2: Activation Form */}
      {step === 1 && warrantyData && (
        <div className="slide-in">
          <Card 
            title={
              <div className="flex items-center">
                <FaRegCreditCard className="text-blue-500 mr-2" />
                <span>Activate Your Warranty</span>
              </div>
            }
            className="shadow-lg border-0"
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={activateWarranty}
              initialValues={{
                purchaseDate: null
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column - Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <UserOutlined className="mr-2 text-blue-500" />
                    Customer Information
                  </h3>

                  <Form.Item
                    name="customerName"
                    label="Full Name"
                    rules={[
                      { required: true, message: 'Please enter your name' },
                      { min: 2, message: 'Name must be at least 2 characters' }
                    ]}
                  >
                    <Input 
                      size="large" 
                      placeholder="John Doe" 
                      prefix={<UserOutlined />}
                    />
                  </Form.Item>

                  <Form.Item
                    name="customerEmail"
                    label="Email Address"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input 
                      size="large" 
                      placeholder="john@example.com" 
                      prefix={<MailOutlined />}
                    />
                  </Form.Item>

                  <Form.Item
                    name="customerPhone"
                    label="Phone Number"
                    rules={[
                      { required: true, message: 'Please enter your phone number' }
                    ]}
                  >
                    <Input 
                      size="large" 
                      placeholder="+1 (555) 123-4567" 
                      prefix={<PhoneOutlined />}
                    />
                  </Form.Item>
                </div>

                {/* Right Column - Purchase Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <ShoppingOutlined className="mr-2 text-blue-500" />
                    Purchase Information
                  </h3>

                  <Form.Item
                    name="purchaseDate"
                    label="Purchase Date"
                    rules={[
                      { required: true, message: 'Please select purchase date' }
                    ]}
                  >
                    <DatePicker 
                      size="large" 
                      className="w-full"
                      format="YYYY-MM-DD"
                      disabledDate={(current) => current && current > new Date()}
                    />
                  </Form.Item>

                  <Form.Item
                    name="retailerName"
                    label="Retailer/Store Name"
                    rules={[
                      { required: true, message: 'Please enter retailer name' }
                    ]}
                  >
                    <Input 
                      size="large" 
                      placeholder="Tech Store Inc." 
                      prefix={<ShoppingOutlined />}
                    />
                  </Form.Item>

                  <Form.Item
                    name="invoiceNumber"
                    label="Invoice Number"
                    rules={[
                      { required: true, message: 'Please enter invoice number' }
                    ]}
                  >
                    <Input 
                      size="large" 
                      placeholder="INV-2024-001" 
                      prefix={<FileTextOutlined />}
                    />
                  </Form.Item>

                  <Form.Item
                    name="notes"
                    label="Additional Notes (Optional)"
                  >
                    <TextArea 
                      rows={3}
                      placeholder="Any additional information about your purchase..."
                    />
                  </Form.Item>
                </div>
              </div>

              {/* Terms and Conditions */}
              <Alert
                message="Important Information"
                description={
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Warranty valid for 6 months from purchase date</li>
                    <li>Keep your invoice for warranty claims</li>
                    <li>Warranty covers manufacturing defects only</li>
                    <li>Activation cannot be reversed once submitted</li>
                  </ul>
                }
                type="warning"
                showIcon
                className="my-6"
              />

              {/* Buttons */}
              <div className="flex justify-between">
                <Button
                  onClick={resetProcess}
                  disabled={loading}
                >
                  Back to Verification
                </Button>

                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={loading}
                  icon={<CheckCircleOutlined />}
                  className="min-w-[150px]"
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
          <Result
            status="success"
            title="Warranty Activated Successfully!"
            subTitle={`Your product warranty is now active and valid for 6 months.`}
            extra={[
              <Button 
                key="download" 
                type="primary" 
                size="large"
                icon={<FaDownload />}
                onClick={downloadWarrantyCard}
                className="mr-4"
              >
                Download Warranty Card
              </Button>,
              <Button 
                key="new" 
                size="large"
                onClick={resetProcess}
              >
                Activate Another
              </Button>
            ]}
          />

          {/* Warranty Details Card */}
          <Card className="shadow-lg mt-6 border-t-4 border-t-green-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CalendarOutlined className="text-3xl text-green-600 mb-2" />
                <h4 className="font-semibold text-gray-800">Start Date</h4>
                <p className="text-lg font-bold text-gray-900">
                  {form.getFieldValue('purchaseDate')?.format('MMM DD, YYYY') || 'Today'}
                </p>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <CalendarOutlined className="text-3xl text-blue-600 mb-2" />
                <h4 className="font-semibold text-gray-800">End Date</h4>
                <p className="text-lg font-bold text-gray-900">
                  {form.getFieldValue('purchaseDate')?.add(6, 'months').format('MMM DD, YYYY') || '6 months from today'}
                </p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <HiShieldCheck className="text-3xl text-purple-600 mb-2" />
                <h4 className="font-semibold text-gray-800">Status</h4>
                <Tag color="green" className="text-lg px-4 py-1">Active</Tag>
              </div>
            </div>

            <Divider />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Product:</span>
                <span className="font-medium">{warrantyData?.product?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{form.getFieldValue('customerName')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{form.getFieldValue('customerEmail')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Warranty Code:</span>
                <code className="font-mono bg-gray-100 px-2 rounded">
                  {verificationCode}
                </code>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-semibold text-gray-800 mb-2">
                <FileTextOutlined className="mr-2" />
                Important Notes
              </h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Keep this warranty code for future reference</li>
                <li>• Warranty covers manufacturing defects only</li>
                <li>• Contact support for warranty claims</li>
                <li>• Present invoice for any service requests</li>
              </ul>
            </div>
          </Card>
        </div>
      )}

      {/* Footer Help */}
      {step !== 2 && (
        <div className="mt-8 text-center fade-in">
          <div className="inline-flex items-center space-x-2 text-gray-600 bg-white p-4 rounded-lg shadow">
            <HiShieldCheck className="text-green-500" />
            <span>Need help? Contact support at </span>
            <a href="mailto:support@warranty.com" className="text-blue-600 font-medium">
              support@warranty.com
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarrantyActivation;