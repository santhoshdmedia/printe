// import { Dropdown } from "antd";
// import React from "react";
// import { CiMenuKebab } from "react-icons/ci";

// const AddressCard = ({ data, index, createMenuItems = (index) => {}, MenuItems = true }) => {
//   return (
//     <div className="w-full h-auto border rounded-md p-3 flex flex-col gap-3" key={index}>
//       <div className={`flex ${data.addressType.length !== 0 ? "justify-between" : "justify-end"} items-center`}>
//         {data.addressType && <label className=" capitalize border text-white p-1 bg-orange-500 rounded-md">{data.addressType}</label>}
//         {MenuItems && (
//           <Dropdown
//             menu={{
//               items: createMenuItems(index),
//             }}
//             placement="bottom"
//           >
//             <button className="hover:text-primary">
//               <CiMenuKebab />
//             </button>
//           </Dropdown>
//         )}
//       </div>
//       <div className="flex flex-col gap-2">
//         <div className="flex items-center justify-between">
//           <h3 className="text-lg font-semibold text-gray-800">{data.name}</h3>
//         </div>

//         <div className="flex flex-wrap gap-4 bg-gray-100 p-3 rounded-md">
//           <div className="flex items-center gap-2">
//             <span className="text-gray-600 font-medium"> Mobile No:</span>
//             <span className="text-gray-900 font-semibold">{data.mobileNumber}</span>
//           </div>

//           <div className="flex items-center gap-2">
//             <span className="text-gray-600 font-medium"> Alternate Mobile No:</span>
//             <span className="text-gray-900 font-semibold">{data.alternateMobileNumber}</span>
//           </div>
//         </div>
//       </div>

//       <div>
//         <span className="text-wrap">
//           {data.street}, {data.locality}, {data.city}, {data.state} - <span className="font-bold">{data.pincode}</span>
//         </span>
//       </div>
//     </div>
//   );
// };

// export default AddressCard;


import { Dropdown } from "antd";
import React from "react";
import { CiMenuKebab } from "react-icons/ci";
import { FaHome, FaBuilding, FaMapMarkerAlt, FaPhone, FaMobile } from "react-icons/fa";

const AddressCard = ({ data, index, createMenuItems = (index) => {}, MenuItems = true }) => {
  // Determine icon based on address type
  const getAddressIcon = () => {
    if (data.addressType?.toLowerCase().includes("home")) return <FaHome className="text-blue-500" />;
    if (data.addressType?.toLowerCase().includes("work")) return <FaBuilding className="text-green-500" />;
    return <FaMapMarkerAlt className="text-purple-500" />;
  };

  return (
    <div className="w-full h-auto bg-white rounded-xl shadow-sm border border-gray-200 p-5 transition-all duration-200 hover:shadow-md">
      <div className={`flex ${data.addressType?.length !== 0 ? "justify-between" : "justify-end"} items-center mb-4`}>
        {data.addressType && (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
            {getAddressIcon()}
            <label className="text-sm font-medium text-blue-700 capitalize">{data.addressType}</label>
          </div>
        )}
        {MenuItems && (
          <Dropdown
            menu={{
              items: createMenuItems(index),
            }}
            placement="bottom"
          >
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <CiMenuKebab className="text-lg" />
            </button>
          </Dropdown>
        )}
      </div>
      
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{data.name}</h3>
        
        <div className="flex flex-col gap-3 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <FaMobile className="text-blue-600" />
            </div>
            <div>
              <span className="text-sm text-gray-500">Mobile</span>
              <p className="text-gray-900 font-medium">{data.mobileNumber}</p>
            </div>
          </div>
          
          {data.alternateMobileNumber && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <FaPhone className="text-green-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500">Alternate Mobile</span>
                <p className="text-gray-900 font-medium">{data.alternateMobileNumber}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 pt-3 border-t border-gray-100">
        <div className="p-2 bg-purple-100 rounded-full mt-1">
          <FaMapMarkerAlt className="text-purple-600" />
        </div>
        <div>
          <span className="text-sm text-gray-500 block mb-1">Address</span>
          <p className="text-gray-700">
            {data.street}, {data.locality}, {data.city}, {data.state} - <span className="font-bold">{data.pincode}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddressCard;