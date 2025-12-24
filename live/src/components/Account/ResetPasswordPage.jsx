import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, Alert, Typography, Spin, Row, Col } from "antd";
import { LockOutlined, SafetyOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import api_helper from "../../helper/api_helper.js"

const { Title, Text } = Typography;
const { Password } = Input;

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await api.get(`/auth/verify-reset-token/${token}`);
        if (response.data.success) {
          setValidToken(true);
          setUserEmail(response.data.data.email || "");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Invalid or expired reset link");
        setValidToken(false);
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setError("No reset token provided");
      setVerifying(false);
    }
  }, [token]);

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/reset-password", {
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const passwordRules = [
    { required: true, message: "Please enter a password" },
    { min: 8, message: "Password must be at least 8 characters" },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: "Must contain uppercase, lowercase, and number",
    },
  ];

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="max-w-md w-full text-center">
          <div className="mb-4">
            <SafetyOutlined className="text-red-500 text-4xl" />
          </div>
          <Title level={3} className="mb-4">
            Invalid Reset Link
          </Title>
          <Text className="text-gray-600 mb-6 block">
            {error || "This password reset link is invalid or has expired."}
          </Text>
          <Button
            type="primary"
            onClick={() => navigate("/forgot-password")}
            block
          >
            Request New Reset Link
          </Button>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="max-w-md w-full text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <SafetyOutlined className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <Title level={3} className="mb-4">
            Password Reset Successful!
          </Title>
          <Text className="text-gray-600 mb-6 block">
            Your password has been reset successfully. Redirecting to login page...
          </Text>
          <Button type="link" onClick={() => navigate("/login")}>
            Go to Login Now
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mb-4">
            <SafetyOutlined className="text-blue-500 text-3xl" />
          </div>
          <Title level={2} className="mb-2">
            Set New Password
          </Title>
          <Text className="text-gray-600">
            {userEmail && `Reset password for ${userEmail}`}
          </Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="mb-6"
            closable
            onClose={() => setError("")}
          />
        )}

        <Form
          name="reset-password"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="password"
            rules={passwordRules}
            hasFeedback
          >
            <Password
              prefix={<LockOutlined />}
              placeholder="New Password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
            hasFeedback
          >
            <Password
              prefix={<LockOutlined />}
              placeholder="Confirm New Password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              disabled={loading}
            >
              {loading ? <Spin /> : "Reset Password"}
            </Button>
          </Form.Item>
        </Form>

        <Row justify="center" className="mt-6">
          <Col>
            <Text className="text-gray-500">
              Remember your password?{" "}
              <Button type="link" onClick={() => navigate("/login")} className="p-0">
                Back to Login
              </Button>
            </Text>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;