// /* eslint-disable no-unused-vars */
// import { Input, Modal } from "antd";
// import React, { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";

// const Settings = () => {
//   const [confirmationPassword, setConfirmationPassword] = useState("");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const dispatch = useDispatch();
//   const { isUserDeleting } = useSelector((state) => state.authSlice);

//   const handleOnChangePassword = (e) => {
//     const { value } = e.target;
//     setConfirmationPassword(value);
//   };
//   const showDeleteConfirm = () => {
//     setIsModalOpen(true);
//   };

//   const handleOk = () => {
//     dispatch({ type: "DELETE_USER", data: { password: confirmationPassword } });
//     setIsModalOpen(false);
//   };

//   const handleCancel = () => {
//     setIsModalOpen(false);
//     setConfirmationPassword("");
//   };

//   return (
//     <div className="w-full h-auto flex flex-col gap-5 px-4 sm:px-6 md:px-10">
//       <div className="px-5 py-5 border shadow-md rounded-lg flex flex-col gap-2">
//         <div>
//           <h1 className="text-xl font-semibold">Change Password</h1>
//           <p className="text-sm sm:text-base px-1 py-2 text-justify">
//             If your account was created using social account authentication, you may prefer to add an email log in.
//             If you signed up with a social media account, please reset the password for your primary email address (pradeepkrish24rk@gmail.com)
//             in order to enable this. Please note that email login is in addition to social login rather than a replacement for it,
//             so your authenticated social account will continue to be linked to your account.
//           </p>
//         </div>
//         <button className="button w-full sm:w-auto mt-4">
//           Send Link
//         </button>
//       </div>

//       <div className="px-5 py-5 border shadow-md rounded-lg flex flex-col gap-2">
//         <div>
//           <h1 className="text-xl font-semibold text-red-600">Danger Zone</h1>
//           <p className="text-sm sm:text-base px-1 py-2 text-justify text-wrap">
//             Deleting your account will:
//             <ul className="list-disc p-3">
//               <li>
//                 Delete your profile, along with your authentication associations. This does not include application permissions.
//               </li>
//               <li>
//                 Delete any and all content you have, such as articles, comments, or your reading list.
//               </li>
//               <li>Allow your username to become available to anyone.</li>
//             </ul>
//           </p>
//         </div>
//         <button
//           className="button bg-red-600 hover:bg-red-500 w-full sm:w-auto"
//           onClick={showDeleteConfirm}
//         >
//           Delete Account
//         </button>
//       </div>

//       <Modal
//         title="Are you sure you want to delete this account?"
//         open={isModalOpen}
//         confirmLoading={isUserDeleting}
//         onOk={handleOk}
//         onCancel={handleCancel}
//         okText="Yes, Delete"
//         okType="danger"
//         cancelText="No, Cancel"
//       >
//         <>
//           <h1>
//             If you delete your account, all the details associated with it will
//             be permanently deleted. Please <span className="font-bold"> press Esc key</span> to cancel the deletion.
//           </h1>
//           <p className="">
//             Please type your <span className="font-bold">Password</span> for confirmation
//           </p>
//           <Input.Password
//             placeholder="Enter Your Password"
//             value={confirmationPassword}
//             onChange={handleOnChangePassword}
//             className="mt-2"
//           />
//         </>
//       </Modal>
//     </div>
//   );
// };

// export default Settings;

/* eslint-disable no-unused-vars */
import { Input, Modal } from "antd";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  LockOutlined, 
  ExclamationCircleOutlined, 
  DeleteOutlined,
  SafetyCertificateOutlined 
} from '@ant-design/icons';

const Settings = () => {
  const [confirmationPassword, setConfirmationPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const { isUserDeleting } = useSelector((state) => state.authSlice);

  const handleOnChangePassword = (e) => {
    const { value } = e.target;
    setConfirmationPassword(value);
  };
  const showDeleteConfirm = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    dispatch({ type: "DELETE_USER", data: { password: confirmationPassword } });
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setConfirmationPassword("");
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-auto flex flex-col gap-6 px-4 sm:px-6 md:px-8 py-6">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
        <p className="text-gray-500">Manage your account settings and preferences</p>
      </div>

      {/* Change Password Section */}
      <div className="px-6 py-5 border border-gray-200 shadow-sm rounded-lg bg-white">
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-full">
            <LockOutlined className="text-blue-600 text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Change Password</h1>
            <p className="text-sm text-gray-600 mt-1">
              Secure your account with a new password or add email authentication
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mt-3">
          <p className="text-sm text-gray-600 text-justify">
            If your account was created using social account authentication, you may prefer to add an email log in.
            If you signed up with a social media account, please reset the password for your primary email address (pradeepkrish24rk@gmail.com)
            in order to enable this. Please note that email login is in addition to social login rather than a replacement for it,
            so your authenticated social account will continue to be linked to your account.
          </p>
        </div>
        
        <button className="button w-full sm:w-auto mt-5 bg-blue-600 hover:bg-blue-700 text-white">
          Send Password Reset Link
        </button>
      </div>

      {/* Danger Zone Section */}
      <div className="px-6 py-5 border border-red-100 shadow-sm rounded-lg bg-white">
        <div className="flex items-start gap-3 mb-4">
          <div className="bg-red-100 p-2 rounded-full">
            <ExclamationCircleOutlined className="text-red-600 text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-red-700">Danger Zone</h1>
            <p className="text-sm text-gray-600 mt-1">
              Irreversible and destructive actions
            </p>
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg mt-3">
          <p className="text-sm text-red-800 font-medium mb-2">
            Deleting your account will:
          </p>
          <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
            <li>Delete your profile, along with your authentication associations</li>
            <li>Permanently remove all your content including articles, comments, and reading lists</li>
            <li>Make your username available to anyone else</li>
          </ul>
        </div>
        
        <button
          className="mt-5 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-medium py-2.5 px-4 rounded-md transition-colors w-full sm:w-auto"
          onClick={showDeleteConfirm}
        >
          <DeleteOutlined />
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ExclamationCircleOutlined className="text-red-600" />
            <span>Delete Account Confirmation</span>
          </div>
        }
        open={isModalOpen}
        confirmLoading={isUserDeleting}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Yes, Delete My Account"
        okType="danger"
        cancelText="Cancel"
        width={520}
      >
        <div className="my-4">
          <div className="flex items-start gap-3 mb-4">
            <SafetyCertificateOutlined className="text-red-600 mt-1" />
            <p className="text-gray-700">
              If you delete your account, all the details associated with it will
              be permanently deleted. Please type your password for confirmation.
            </p>
          </div>
          
          <div className="bg-red-50 border border-red-100 rounded-md p-3 mt-4">
            <label className="block text-sm font-medium text-red-800 mb-2">
              Confirm Password
            </label>
            <Input.Password
              placeholder="Enter your password to confirm deletion"
              value={confirmationPassword}
              onChange={handleOnChangePassword}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-2">
              Press Esc key to cancel deletion
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;