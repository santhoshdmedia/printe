import { Button, Form, Input } from "antd";
import { emailValidation } from "../../helper/form_validation";
import { ERROR_NOTIFICATION, SUCCESS_NOTIFICATION } from "../../helper/notification_helper";
import { resetPassword, sendForgetPassowrdMail } from "../../helper/api_helper";
import { Link } from "react-router-dom";
import { useState } from "react";

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
    <div className="w-full h-screen center_div !font-primary flex-col">
      <h1 className="font-medium text-lg text-center text-primary">
        Sorry to hear you forgot your password
        <br /> but don&apos;t worry!
      </h1>
      <Form layout="vertical" className="!bg-white !shadow-2xl !p-10" form={form} onFinish={handleFinish}>
        <Form.Item name="mail_id" label="Enter your email to get a reset link!" rules={emailValidation()}>
          <Input placeholder="Enter your mail id" className="!h-[50px] !w-[400px] !shadow-inner" />
        </Form.Item>
        <Form.Item>
          <Button loading={loading} htmlType="submit" className="!w-[400px] !h-[50px] !font-medium !uppercase !bg-primary !text-white">
            Get Reset Link
          </Button>
        </Form.Item>
        <Link to="/login" className="pt-3 center_div">
          <span className="para text-primary font-medium">Back to Login?</span>
        </Link>
      </Form>
    </div>
  );
};

export default Forgetpassword;
