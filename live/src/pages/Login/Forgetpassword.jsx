import { Button, Form, Input } from "antd";
import { emailValidation } from "../../helper/form_validation";
import { ERROR_NOTIFICATION, SUCCESS_NOTIFICATION } from "../../helper/notification_helper";
import { resetPassword, sendForgetPassowrdMail } from "../../helper/api_helper";
import { Link } from "react-router-dom";
import { useState } from "react";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import abc from "../../assets/logo/ABC.jpg";
import logo from "../../assets/logo/without_bg.png"

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
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6 bg-white relative">
        {/* Logo in top left corner */}
        <div className="absolute top-6 left-6">
          <div className=" p-3 bg-yellow-400 flex items-center justify-center rounded-md">
            <img 
              src={logo} 
              alt="Logo" 
              className="h-8 w-auto object-contain"
            />
          </div>
        </div>

        <div className="w-full max-w-md">
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
      
      {/* Right side - Illustration with background image */}
      <div 
        className="hidden md:flex w-1/2 p-12 flex-col justify-center items-center relative"
        style={{
          backgroundImage: `url(${abc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay for better readability */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        
        <div className="max-w-md relative z-10">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Reset Your Password</h1>
            <p className="text-lg text-white">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forgetpassword;