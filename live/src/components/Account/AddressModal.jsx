import { Input, Modal, Radio } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

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
    <div>
      <Modal title={`${modalType} Addresses`} open onOk={handleOk} okText={modalType} confirmLoading={isUserUpdating} onCancel={handleCancel}>
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex-1">
              <label>
                Name <span className="text-red-500">*</span>
              </label>
              <Input placeholder="Your Name" required value={form.name} onChange={(e) => handleOnChange(e)} name="name" />
            </div>
            <div className="flex-1">
              <label>
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <Input placeholder="10-digit mobile number" pattern="/^[0-9]{10}$/" required name="mobileNumber" value={form.mobileNumber} onChange={(e) => handleOnChange(e)} />
            </div>
            <div className="flex-1">
              <label>
                Alternate Mobile Number <span className="text-red-500">*</span>
              </label>
              <Input placeholder="10-digit mobile number" pattern="/^[0-9]{10}$/" required name="alternateMobileNumber" value={form.alternateMobileNumber} onChange={(e) => handleOnChange(e)} className="" />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label>
                Pincode <span className="text-red-500">*</span>
              </label>
              <Input placeholder="Pincode" required value={form.pincode} onChange={(e) => handleOnChange(e)} name="pincode" />
            </div>
            <div className="flex-1">
              <label>
                Locality<span className="text-red-500">*</span>
              </label>
              <Input placeholder="Locality" pattern="/^[0-9]{10}$/" onChange={(e) => handleOnChange(e)} value={form.locality} name="locality" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label>
                Street/Area <span className="text-red-500">*</span>
              </label>
              <Input.TextArea placeholder="Street" required value={form.street} onChange={(e) => handleOnChange(e)} name="street" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label>
                City/District/Town <span className="text-red-500">*</span>
              </label>
              <Input placeholder="City/District/Town" required value={form.city} onChange={(e) => handleOnChange(e)} name="city" />
            </div>
            <div className="flex-1">
              <label>
                State<span className="text-red-500">*</span>
              </label>
              <Input placeholder="State" value={form.state} onChange={(e) => handleOnChange(e)} name="state" />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-3">
              <label>Address Type</label>
              <Radio.Group name="addressType" onChange={(e) => handleOnChange(e)} value={form.addressType}>
                <Radio value={"Home"}>Home</Radio>
                <Radio value={"Work"}>Work</Radio>
              </Radio.Group>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AddressModal;
