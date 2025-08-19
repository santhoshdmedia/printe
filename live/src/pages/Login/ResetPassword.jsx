import React, { useEffect, useState } from "react";
import { Form, Input, Button, Typography, Card } from "antd";
import _ from "lodash";
import { resetPassword, verfiyLink } from "../../helper/api_helper";
import { useNavigate, useParams } from "react-router-dom";
import { SUCCESS_NOTIFICATION, ERROR_NOTIFICATION } from "../../helper/notification_helper";

const { Title, Text } = Typography;

const passwordValidation = (value) => {
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
  return pattern.test(value);
};

const ResetPassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await verfiyLink(id);
        if (!_.get(result, "data.data.result", false)) {
          navigate("/not-found");
        }
      } catch (error) {
        console.error("Error verifying reset link:", error);
      } finally {
        setVerifying(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await resetPassword({ ...values, reset_url: id });
      SUCCESS_NOTIFICATION(result);
      navigate("/login");
    } catch (err) {
      console.error("Reset password error:", err);
      ERROR_NOTIFICATION(err);
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Text className="text-gray-600">Verifying reset link...</Text>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-96 shadow-md p-6 rounded-lg">
        <Title level={4} className="text-center text-blue-600">
          Reset Your Password
        </Title>
        <Text className="block text-center text-gray-500 mb-4">Enter your new password below.</Text>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Password Field with Strong Validation */}
          <Form.Item
            label="New Password"
            name="password"
            rules={[
              { required: true, message: "Please enter your new password!" },
              { min: 8, message: "Password must be at least 8 characters!" },
              {
                validator: (_, value) => (passwordValidation(value) ? Promise.resolve() : Promise.reject("Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character!")),
              },
            ]}
          >
            <Input.Password placeholder="Enter new password" className="h-[50px]" />
          </Form.Item>

          {/* Confirm Password Field */}
          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match!"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" className="h-[50px]" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="w-full h-[50px]" loading={loading}>
              RESET PASSWORD
            </Button>
          </Form.Item>
        </Form>
        <Text className="text-center block text-blue-600 cursor-pointer hover:underline mt-2" onClick={() => navigate("/login")}>
          Back to Login?
        </Text>
      </Card>
    </div>
  );
};

export default ResetPassword;
