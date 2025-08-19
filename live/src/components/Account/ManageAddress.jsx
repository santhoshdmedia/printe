import { Dropdown, Input, Modal, Radio } from "antd";
import React, { useState } from "react";
import { IoIosAddCircle } from "react-icons/io";
import { CiMenuKebab } from "react-icons/ci";
import { useDispatch, useSelector } from "react-redux";
import { FcEmptyTrash } from "react-icons/fc";
import AddressCard from "./AddressCard";
import AddressModal from "./AddressModal";

const ManageAddress = () => {
  //config
  const dispatch = useDispatch();

  //redux
  const { user } = useSelector((state) => state.authSlice);

  //state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("Add");
  const [isEditKey, setIsEditKey] = useState(null);

  //render data
  const addresses = user?.addresses ?? [];

  //function
  const showModal = () => {
    setModalType("Add");
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleDeleteAddress = (index) => {
    const filterAddresses = addresses.filter((_, i) => i !== index);
    dispatch({
      type: "UPDATE_USER",
      data: { form: { addresses: filterAddresses } },
    });
  };

  const handleUpdateAddress = (index) => {
    setIsModalOpen(true);
    setIsEditKey(index);
    setModalType("Edit");
  };

  const createMenuItems = (index) => [
    {
      key: "1",
      label: <button onClick={() => handleUpdateAddress(index)}>Edit</button>,
    },
    {
      key: "2",
      label: <button onClick={() => handleDeleteAddress(index)}>Delete</button>,
    },
  ];

  return (
    <div className="w-full h-auto">
      <div className="px-5 md:px-10 py-5 border shadow-md rounded-lg flex flex-col gap-2">
        <div className="flex flex-col md:flex-row justify-start md:justify-between gap-3 items-center">
          <h1 className="title ">Manage Addresses</h1>

          <button
            className="text-primary hover:text-purple-600 flex items-center para"
            onClick={showModal}
          >
            <IoIosAddCircle size={40} /> Add Address
          </button>
        </div>
        <div className="flex flex-col gap-3 py-7">
          {addresses.length === 0 ? (
            <div className="flex justify-center flex-col items-center">
              <FcEmptyTrash size={50} />
              <h1 className="para">Empty</h1>
            </div>
          ) : (
            addresses.map((data, index) => (
              <AddressCard
                data={data}
                index={index}
                createMenuItems={createMenuItems}
              />
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <AddressModal
          handleCancel={handleCancel}
          modalType={modalType}
          editAddressIndex={isEditKey}
          setEditAddressIndex={setIsEditKey}
        />
      )}
    </div>
  );
};

export default ManageAddress;
