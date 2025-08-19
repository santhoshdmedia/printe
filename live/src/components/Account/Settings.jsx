/* eslint-disable no-unused-vars */
import { Input, Modal } from "antd";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

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
    <div className="w-full h-auto flex flex-col gap-5 px-4 sm:px-6 md:px-10">
      <div className="px-5 py-5 border shadow-md rounded-lg flex flex-col gap-2">
        <div>
          <h1 className="text-xl font-semibold">Change Password</h1>
          <p className="text-sm sm:text-base px-1 py-2 text-justify">
            If your account was created using social account authentication, you may prefer to add an email log in.
            If you signed up with a social media account, please reset the password for your primary email address (pradeepkrish24rk@gmail.com)
            in order to enable this. Please note that email login is in addition to social login rather than a replacement for it,
            so your authenticated social account will continue to be linked to your account.
          </p>
        </div>
        <button className="button w-full sm:w-auto mt-4">
          Send Link
        </button>
      </div>

      <div className="px-5 py-5 border shadow-md rounded-lg flex flex-col gap-2">
        <div>
          <h1 className="text-xl font-semibold text-red-600">Danger Zone</h1>
          <p className="text-sm sm:text-base px-1 py-2 text-justify text-wrap">
            Deleting your account will:
            <ul className="list-disc p-3">
              <li>
                Delete your profile, along with your authentication associations. This does not include application permissions.
              </li>
              <li>
                Delete any and all content you have, such as articles, comments, or your reading list.
              </li>
              <li>Allow your username to become available to anyone.</li>
            </ul>
          </p>
        </div>
        <button
          className="button bg-red-600 hover:bg-red-500 w-full sm:w-auto"
          onClick={showDeleteConfirm}
        >
          Delete Account
        </button>
      </div>

      <Modal
        title="Are you sure you want to delete this account?"
        open={isModalOpen}
        confirmLoading={isUserDeleting}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Yes, Delete"
        okType="danger"
        cancelText="No, Cancel"
      >
        <>
          <h1>
            If you delete your account, all the details associated with it will
            be permanently deleted. Please <span className="font-bold"> press Esc key</span> to cancel the deletion.
          </h1>
          <p className="">
            Please type your <span className="font-bold">Password</span> for confirmation
          </p>
          <Input.Password
            placeholder="Enter Your Password"
            value={confirmationPassword}
            onChange={handleOnChangePassword}
            className="mt-2"
          />
        </>
      </Modal>
    </div>
  );
};

export default Settings;
