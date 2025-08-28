import { Input, Modal, Radio } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  BankOutlined,
  PushpinOutlined
} from '@ant-design/icons';

const AddressModal = ({ editAddressIndex = null, modalType = "Add", handleCancel = () => {}, setEditAddressIndex = (prev) => {} }) => {
  //config
  const dispatch = useDispatch();

  //redux
  const { user, isUserUpdating } = useSelector((state) => state.authSlice);
  console.log("Redux User Data After Update:", user);

  //state
  const initialFormStateModel = {
    name: "",
    mobileNumber: "",
    alternateMobileNumber: "",
    street: "",
    locality: "",
    city: "",
    state: "",
    addressType: "",
    pincode: "",
  };
  const [form, setForm] = useState(initialFormStateModel);

  //render data
  const addresses = user?.addresses ?? [];

  //function
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleOk = () => {
    let updatedAddresses;

    if (form?._id ?? false) {
      updatedAddresses = addresses.map((data) => (data._id === form._id ? form : data));
    } else if (modalType === "Add" || modalType === "Delivery") {
      updatedAddresses = [...addresses, { ...form }];
    } else {
      updatedAddresses = addresses;
    }
    console.log("Updated Addresses Before Dispatch:", updatedAddresses);
    dispatch({
      type: "UPDATE_USER",
      data: { form: { addresses: updatedAddresses } },
    });
    setEditAddressIndex(null);
    handleCancel();
  };

  //mount
  useEffect(() => {
    if (modalType === "Add" || modalType === "Delivery") setForm(initialFormStateModel);
    else if (modalType === "Edit") {
      const val = addresses[editAddressIndex];
      setForm(val);
    }
  }, [modalType]);

  return (
    <Modal 
      title={
        <div className="flex items-center gap-2">
          <EnvironmentOutlined className="text-blue-500" />
          <span className="text-lg font-semibold">{modalType} Address</span>
        </div>
      } 
      open 
      onOk={handleOk} 
      okText={modalType} 
      confirmLoading={isUserUpdating} 
      onCancel={handleCancel}
      width={700}
      okButtonProps={{ className: 'bg-blue-600 hover:bg-blue-700' }}
    >
      <div className="flex flex-col gap-5 py-4">
        {/* Personal Details Section */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
            <UserOutlined className="text-gray-500" />
            Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <Input 
                placeholder="Your Name" 
                required 
                value={form.name} 
                onChange={(e) => handleOnChange(e)} 
                name="name" 
                size="large"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <Input 
                placeholder="10-digit mobile number" 
                pattern="/^[0-9]{10}$/" 
                required 
                name="mobileNumber" 
                value={form.mobileNumber} 
                onChange={(e) => handleOnChange(e)} 
                size="large"
                prefix={<PhoneOutlined className="text-gray-400" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alternate Mobile Number
              </label>
              <Input 
                placeholder="10-digit mobile number" 
                pattern="/^[0-9]{10}$/" 
                name="alternateMobileNumber" 
                value={form.alternateMobileNumber} 
                onChange={(e) => handleOnChange(e)} 
                size="large"
                prefix={<PhoneOutlined className="text-gray-400" />}
              />
            </div>
          </div>
        </div>

        {/* Address Details Section */}
        <div className="border-b border-gray-200 pb-4">
          <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
            <EnvironmentOutlined className="text-gray-500" />
            Address Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode <span className="text-red-500">*</span>
              </label>
              <Input 
                placeholder="Pincode" 
                required 
                value={form.pincode} 
                onChange={(e) => handleOnChange(e)} 
                name="pincode" 
                size="large"
                prefix={<PushpinOutlined className="text-gray-400" />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Locality <span className="text-red-500">*</span>
              </label>
              <Input 
                placeholder="Locality" 
                pattern="/^[0-9]{10}$/" 
                onChange={(e) => handleOnChange(e)} 
                value={form.locality} 
                name="locality" 
                size="large"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street/Area <span className="text-red-500">*</span>
            </label>
            <Input.TextArea 
              placeholder="Street" 
              required 
              value={form.street} 
              onChange={(e) => handleOnChange(e)} 
              name="street" 
              rows={3}
              className="w-full"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City/District/Town <span className="text-red-500">*</span>
              </label>
              <Input 
                placeholder="City/District/Town" 
                required 
                value={form.city} 
                onChange={(e) => handleOnChange(e)} 
                name="city" 
                size="large"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <Input 
                placeholder="State" 
                value={form.state} 
                onChange={(e) => handleOnChange(e)} 
                name="state" 
                size="large"
              />
            </div>
          </div>
        </div>

        {/* Address Type Section */}
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
            <HomeOutlined className="text-gray-500" />
            Address Type
          </h3>
          <Radio.Group 
            name="addressType" 
            onChange={(e) => handleOnChange(e)} 
            value={form.addressType}
            className="flex gap-6"
          >
            <Radio value={"Home"} className="flex items-center">
              <div className="flex items-center gap-2">
                <HomeOutlined className="text-gray-600" />
                <span>Home</span>
              </div>
            </Radio>
            <Radio value={"Work"} className="flex items-center">
              <div className="flex items-center gap-2">
                <BankOutlined className="text-gray-600" />
                <span>Work</span>
              </div>
            </Radio>
          </Radio.Group>
        </div>
      </div>
    </Modal>
  );
};

export default AddressModal;