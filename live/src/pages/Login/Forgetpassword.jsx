import { Button, Form, Input } from "antd";
import { emailValidation } from "../../helper/form_validation";
import { ERROR_NOTIFICATION, SUCCESS_NOTIFICATION } from "../../helper/notification_helper";
import { resetPassword, sendForgetPassowrdMail } from "../../helper/api_helper";
import { Link } from "react-router-dom";
import { useState } from "react";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";

const Forgetpassword = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values) => {
    try {
      setLoading(true);
      const result = await sendForgetPassowrdMail(values);
      SUCCESS_NOTIFICATION(result);
    } catch (err) {
      ERROR_NOTIFICATION(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex !font-primary">
      {/* Left side - Illustration */}
      {/* Right side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 bg-white">
        <div className="w-full max-w-md">
          {/* Logo placeholder - replace with your actual logo */}
          <div className="flex justify-center mb-8">
            <div className="h-20 w-20 rounded-full bg-yellow-400 flex items-center justify-center text-white font-bold text-xl">
              PRINT <span className="text-black">E</span>
            </div>
          </div>

          <div className="text-center mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>
            <p className="text-gray-600 mt-3">No worries, we'll help you reset it</p>
          </div>

          <Form 
            layout="vertical" 
            className="mt-8" 
            form={form} 
            onFinish={handleFinish}
          >
            <Form.Item 
              name="mail_id" 
              label="Email Address" 
              rules={emailValidation()}
              className="mb-6"
            >
              <Input 
                prefix={<MailOutlined className="text-gray-400" />} 
                placeholder="Enter your email address" 
                size="large"
                className="rounded-lg py-2 px-4 border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
              />
            </Form.Item>
            
            <Form.Item className="mb-4">
              <Button 
                loading={loading} 
                htmlType="submit" 
                className="w-full h-12 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-white font-semibold text-base"
              >
                Send Reset Link
              </Button>
            </Form.Item>
            
            <div className="text-center">
              <Link 
                to="/login" 
                className="text-black hover:text-yellow-500 font-medium inline-flex items-center"
              >
                <ArrowLeftOutlined className="mr-2" />
                Back to Login
              </Link>
            </div>
          </Form>
        </div>
      </div>
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-yellow-50 to-yellow-300 p-12 flex-col justify-center items-center">
        <div className="max-w-md">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-black mb-4">Reset Your Password</h1>
            <p className="text-lg text-black">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forgetpassword;