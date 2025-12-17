import { Avatar, Input } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconHelper } from "../../helper/IconHelper";
import { Button } from "antd";
import { Helmet } from "react-helmet-async";

const Profile = () => {
  const { user } = useSelector((state) => state.authSlice);
  const { name, email, phone, picture, gst_no } = user;
  const [isEditDisabled, setIsEditDisabled] = useState(true);
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    picture: "",
    gst_no: "",
  });

  const [errorMessage, setErrorMessage] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    setForm({ name, email, phone, picture, gst_no });
  }, [user]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const emailValidation = (value) => {
    const pattern = /^[a-z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = pattern.test(value);

    setErrorMessage((prevError) => ({
      ...prevError,
      email: isValid ? "" : "Invalid email address.",
    }));

    return isValid;
  };

  const nameValidation = (value) => {
    const pattern = /^[a-zA-Z]+([ ][a-zA-Z]+)*$/;
    const isValid =
      pattern.test(value) && value.length >= 3 && value.length <= 50;

    setErrorMessage((prevError) => ({
      ...prevError,
      name: isValid
        ? ""
        : "Name must be at least 3 characters long and contain only alphabets.",
    }));

    return isValid;
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();

    const isNameValid = nameValidation(form.name);
    const isEmailValid = emailValidation(form.email);

    if (isNameValid && isEmailValid) {
      dispatch({ type: "UPDATE_USER", data: { form } });
      setIsEditDisabled(true);
    }
  };

  const handleUploadImage = (image) => {
    setForm((prev) => ({ ...prev, picture: image }));
  };

  const profileImageName = user?.name[0] || "";

  return (
    <div className="w-full max-w-6xl bg-white">
       <Helmet>
        <title>My Profile – Printe.in Account | Manage Your Printing Orders & Details</title>
        <meta name="description" content="Access and update your Printe.in account profile to manage your printing orders, personal details, preferences, and delivery information securely." />
        <meta name="keywords" content="printe profile, account profile, manage account, printing orders, user dashboard, update details, Printe.in account" />
    </Helmet>
      <form className="px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex">
            <h2 className="text-2xl font-bold text-gray-800">
              Profile Details
            </h2>
          </div>



          <div className="flex gap-4 items-center">
            {/* Edit/Cancel Button */}
            <Button
              type={isEditDisabled ? "primary" : "default"}
              danger={!isEditDisabled}
              className={`font-medium rounded-lg h-auto px-4 py-2 ${isEditDisabled
                  ? 'bg-yellow-500 text-black border-yellow-500 hover:!bg-yellow-600 hover:border-yellow-600'
                  : ''
                }`}
              onClick={() => setIsEditDisabled(!isEditDisabled)}
            >
              {isEditDisabled ? "Edit Profile" : "Cancel Editing"}
            </Button>

            {/* Save Changes Button */}
            {!isEditDisabled && (
              <Button
                type="primary"
                className="font-medium rounded-lg h-auto px-4 py-2 bg-black text-white border-black hover:!bg-gray-800 hover:border-gray-800 shadow-md "
                onClick={(e) => handleOnSubmit(e)}
              >
                Save Changes
              </Button>
            )}
          </div>
        </div>


        {/* Main Content - Two Column Layout */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Form Fields */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name Field */}
              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="name"
                  onChange={(e) => handleOnChange(e)}
                  value={form.name}
                  placeholder="Enter your name"
                  style={{
                    fontSize: "16px",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "2px solid #e5e7eb",
                  }}
                  disabled={isEditDisabled}
                  className="w-full hover:border-yellow-400 focus:border-yellow-500 transition-colors"
                />
                {errorMessage.name && (
                  <p className="text-red-500 text-xs mt-2">{errorMessage.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  name="email"
                  onChange={(e) => handleOnChange(e)}
                  value={form.email}
                  placeholder="Enter your email"
                  style={{
                    fontSize: "16px",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "2px solid #e5e7eb",
                  }}
                  disabled={isEditDisabled}
                  className="w-full hover:border-yellow-400 focus:border-yellow-500 transition-colors"
                />
                {errorMessage.email && (
                  <p className="text-red-500 text-xs mt-2">
                    {errorMessage.email}
                  </p>
                )}
              </div>

              {/* Mobile Number Field */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Mobile Number
                </label>
                <Input
                  name="phone"
                  onChange={(e) => handleOnChange(e)}
                  value={form.phone}
                  placeholder="Enter your mobile number"
                  style={{
                    fontSize: "16px",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "2px solid #e5e7eb",
                  }}
                  disabled={isEditDisabled}
                  className="w-full hover:border-yellow-400 focus:border-yellow-500 transition-colors"
                />
                {errorMessage.phone && (
                  <p className="text-red-500 text-xs mt-2">
                    {errorMessage.phone}
                  </p>
                )}
              </div>

              {/* GST Field */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  GST NO
                </label>
                <Input
                  name="gst_no"
                  onChange={(e) => handleOnChange(e)}
                  value={form.gst_no}
                  placeholder="Enter your GST"
                  style={{
                    fontSize: "16px",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "2px solid #e5e7eb",
                  }}
                  disabled={isEditDisabled}
                  className="w-full hover:border-yellow-400 focus:border-yellow-500 transition-colors"
                />
              </div>
            </div>

            {/* Bottom Action Buttons - Only show when NOT in edit-disabled mode */}
            {!isEditDisabled && (
              <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Profile Image */}
          <div className={`md:w-1/3 flex flex-col items-center ${isEditDisabled ? "hidden" : ""} `}>
            {!isEditDisabled ? (
              // Edit Mode - Full upload functionality
              <div className="flex flex-col items-center">
                <div className="relative group w-40 h-40 mb-4">
                  <Avatar
                    src={form.picture}
                    style={{
                      width: "160px",
                      height: "160px",
                      objectFit: "cover",
                      textTransform: "capitalize",
                      borderRadius: "50%",
                      border: "4px solid #FFD700",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                    className="text-black capitalize text-5xl bg-yellow-100 font-semibold"
                  >
                    {profileImageName}
                  </Avatar>

                  <input
                    type="file"
                    name="image"
                    id="image"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        dispatch({
                          type: "UPLOAD_IMAGE",
                          data: { file, handleUploadImage },
                        });
                      }
                    }}
                    style={{ display: "none" }}
                  />

                  <label
                    htmlFor="image"
                    className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-70 text-white flex flex-col items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                  >
                    <IconHelper.EDIT_ICON className="text-2xl mb-1" />
                    <span className="text-sm">Change Photo</span>
                  </label>
                </div>
                <p className="text-gray-600 text-sm text-center mt-2">
                  Click the avatar to upload a new photo
                </p>
              </div>
            ) : (
              // View Mode - Just display the avatar
              <div className="flex flex-col items-center">
                <Avatar
                  src={form.picture}
                  style={{
                    width: "160px",
                    height: "160px",
                    objectFit: "cover",
                    textTransform: "capitalize",
                    borderRadius: "50%",
                    border: "4px solid #f0f0f0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  className="text-black capitalize text-5xl bg-gray-100 font-semibold"
                >
                  {profileImageName}
                </Avatar>
                <p className="text-gray-500 text-sm text-center mt-4">
                  Profile photo
                </p>
              </div>
            )}

            {/* Optional: Add some vertical spacing on mobile */}
            <div className="mt-6 md:mt-0"></div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Profile;