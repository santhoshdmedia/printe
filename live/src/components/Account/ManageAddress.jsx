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
      <div className="px-5 md:px-10 py-5 border shadow-md rounded-lg flex flex-col gap-2 bg-white">
        <div className="flex flex-col md:flex-row justify-start md:justify-between gap-3 items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Manage Addresses</h1>

          <button
            className="text-primary hover:text-yellow-500 flex items-center gap-2 py-2 px-4 rounded-md bg-purple-50 hover:bg-purple-100 transition-colors duration-200"
            onClick={showModal}
          >
            <IoIosAddCircle size={24} /> 
            <span className="font-medium">Add New Address</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-3">
          {addresses.length === 0 ? (
            <div className="col-span-full flex justify-center flex-col items-center py-10 bg-gray-50 rounded-lg">
              <FcEmptyTrash size={60} />
              <h1 className="text-gray-500 mt-3 text-lg">No addresses saved yet</h1>
              <p className="text-gray-400 mt-1">Add your first address to get started</p>
            </div>
          ) : (
            addresses.map((data, index) => (
              <div key={index} className="bg-gray-50 p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-full">
                    {data.type || "Address"} {index === 0 && "(Default)"}
                  </span>
                  <Dropdown
                    menu={{ items: createMenuItems(index) }}
                    placement="bottomRight"
                    trigger={["click"]}
                  >
                    <button className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200">
                      <CiMenuKebab size={20} />
                    </button>
                  </Dropdown>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-800">{data.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {data.street}, {data.city}, {data.state} - {data.zipCode}
                  </p>
                  <p className="text-gray-600 text-sm">{data.country}</p>
                  {data.phone && (
                    <p className="text-gray-600 text-sm mt-2">
                      <span className="font-medium">Phone:</span> {data.phone}
                    </p>
                  )}
                </div>
              </div>
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