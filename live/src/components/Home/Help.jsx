/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { PhoneOutlined, MailOutlined, EnvironmentOutlined } from "@ant-design/icons";
import QAComponents from "../QAComponents";
import { FrequentlyAskedQuestions } from "../../../data";
import { Button, Form, Input, Select } from "antd";
import { Option } from "antd/es/mentions";
import { helpcenter } from "../../helper/api_helper";
import { SUCCESS_NOTIFICATION } from "../../helper/notification_helper";

const Help = () => {
  const prefixSelector = (
    <Form.Item name="prefix" noStyle>
      <Select
        style={{
          width: 80,
        }}
      >
        <Option value="91">+91</Option>
        <Option value="92">+92</Option>
      </Select>
    </Form.Item>
  );

  const [form] = Form.useForm();

  const handleFinish = async (values) => {
    try {
      const result = await helpcenter(values);
      SUCCESS_NOTIFICATION(result);
      form.resetFields("");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  });

  return (
    <div className="px-[6vw] md:px-[8vw] xl:px-[10vw] py-10 bg-gray-100">
      <div className="mb-10 text-center">
        <h1 className="text-3xl lg:text-4xl font-bold text-primary">Help Center</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="flex flex-col items-center text-center bg-white p-8 rounded-lg shadow-lg">
          <PhoneOutlined className="text-3xl text-primary mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Call us for Queries</h2>
          <p className="text-gray-600">
            Helpdesk:{" "}
            <a href="tel:+919513734374" className="text-blue-600 hover:underline">
              +91 8888888888
            </a>
          </p>
          <p className="text-gray-500">(Mon - Sat: 10:00 AM - 7:00 PM)</p>
        </div>

        <div className="flex flex-col items-center text-center bg-white p-8 rounded-lg shadow-lg">
          <MailOutlined className="text-3xl text-primary mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">E-Mail us</h2>
          <p className="text-gray-600">
            Sales enquiries and customer support:{" "}
            <a href="mailto:care@printo.in" className="text-blue-600 hover:underline">
              care@printe.in
            </a>
          </p>
        </div>

        <div className="flex flex-col items-center text-center bg-white p-8 rounded-lg shadow-lg">
          <EnvironmentOutlined className="text-3xl text-primary mb-4" />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Printe Postal Address</h2>
          <p className="text-gray-600">Printe Document Services Pvt. Ltd.</p>
          <p className="text-gray-600">No. 1, xyz, xyz 34546456.</p>
        </div>
      </div>

      <div className="my-10 w-full h-auto">
        <QAComponents data={FrequentlyAskedQuestions} />
      </div>

      <div className="text-center">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          className="p-10
         rounded-lg shadow-lg bg-white"
        >
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please enter your name!" }]}>
            <Input placeholder="Enter your Name" className="!w-full !h-[50px]" />
          </Form.Item>
          <Form.Item
            name="email"
            label="E-mail"
            rules={[
              {
                type: "email",
                message: "The input is not valid E-mail!",
              },
              {
                required: true,
                message: "Please input your E-mail!",
              },
            ]}
          >
            <Input placeholder="Enter your E-mail" className="!w-full !h-[50px]" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              {
                required: true,
                message: "Please input your phone number!",
              },
            ]}
          >
            <Input addonBefore={prefixSelector} placeholder="Enter your Phone" className="!w-full !h-[50px] phone" />
          </Form.Item>

          <Form.Item
            label="Message"
            name="message"
            rules={[
              {
                required: true,
                message: "Please enter your message!",
              },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Enter your message!" className="w-full !h-[100px] " />
          </Form.Item>

          <div className="w-full h-auto">
            <Button type="primary" htmlType="submit" className="bg-primary w-full !h-[50px] text-lg ">
              Send
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Help;
