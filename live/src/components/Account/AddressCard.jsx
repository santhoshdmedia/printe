import { Dropdown } from "antd";
import React from "react";
import { CiMenuKebab } from "react-icons/ci";

const AddressCard = ({ data, index, createMenuItems = (index) => {}, MenuItems = true }) => {
  return (
    <div className="w-full h-auto border rounded-md p-3 flex flex-col gap-3" key={index}>
      <div className={`flex ${data.addressType.length !== 0 ? "justify-between" : "justify-end"} items-center`}>
        {data.addressType && <label className=" capitalize border text-white p-1 bg-orange-500 rounded-md">{data.addressType}</label>}
        {MenuItems && (
          <Dropdown
            menu={{
              items: createMenuItems(index),
            }}
            placement="bottom"
          >
            <button className="hover:text-primary">
              <CiMenuKebab />
            </button>
          </Dropdown>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{data.name}</h3>
        </div>

        <div className="flex flex-wrap gap-4 bg-gray-100 p-3 rounded-md">
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium"> Mobile No:</span>
            <span className="text-gray-900 font-semibold">{data.mobileNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-medium"> Alternate Mobile No:</span>
            <span className="text-gray-900 font-semibold">{data.alternateMobileNumber}</span>
          </div>
        </div>
      </div>

      <div>
        <span className="text-wrap">
          {data.street}, {data.locality}, {data.city}, {data.state} - <span className="font-bold">{data.pincode}</span>
        </span>
      </div>
    </div>
  );
};

export default AddressCard;
