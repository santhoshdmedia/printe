import { Avatar, Input } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconHelper } from "../../helper/IconHelper";

const Profile = () => {
  const { user } = useSelector((state) => state.authSlice);
  console.log(user);
  const { name, email, phone, profile_pic, gst_no } = user;
  const [isEditDisabled, setIsEditDisabled] = useState(true);
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    profile_pic: "",
    gst_no: "",
  });

  const [errorMessage, setErrorMessage] = useState({
    name: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    setForm({ name, email, phone, profile_pic, gst_no });
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
    const isValid = pattern.test(value) && value.length >= 3 && value.length <= 50;

    setErrorMessage((prevError) => ({
      ...prevError,
      name: isValid ? "" : "Name must be at least 3 characters long and contain only alphabets.",
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
    console.log(image);

    setForm((prev) => ({ ...prev, profile_pic: image }));
  };

  const profileImageName = user?.name[0] || "";

  return (
     <div className="w-full max-w-3xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          {/* Header Section with Yellow Background */}
          <div className="bg-[#f9c114] py-6 px-8 text-center">
            <h1 className="text-2xl font-bold text-black">Profile Information</h1>
            <p className="text-black opacity-80 mt-1">Manage your personal details</p>
          </div>
          
          <form onSubmit={(e) => handleOnSubmit(e)} className="px-8 py-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group w-32 h-32 mb-4">
                <Avatar
                  src={form.profile_pic}
                  style={{
                    width: "128px",
                    height: "128px",
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
                {!isEditDisabled && (
                  <>
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

                    <label htmlFor="image" className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-70 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                      <IconHelper.EDIT_ICON className="text-xl" />
                    </label>
                  </>
                )}
              </div>
              
              <div className="flex space-x-3">
                {/* <button 
                  type="button" 
                  className="px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg hover:bg-yellow-600 transition-colors"
                  onClick={() => setIsEditDisabled(!isEditDisabled)}
                >
                  {isEditDisabled ? "Edit Profile" : "Cancel Editing"}
                </button>
                
                <button 
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${isEditDisabled ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"}`} 
                  type="submit" 
                  disabled={isEditDisabled}
                >
                  Save Changes
                </button> */}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input 
                  name="name" 
                  onChange={(e) => handleOnChange(e)} 
                  value={form.name} 
                  placeholder="Enter your name" 
                  style={{ fontSize: "16px", padding: "12px", borderRadius: "8px", border: "2px solid #e5e7eb" }} 
                  disabled={isEditDisabled} 
                  className="w-full hover:border-yellow-400 focus:border-yellow-500 transition-colors" 
                />
                {errorMessage.name && <p className="text-red-500 text-xs mt-2">{errorMessage.name}</p>}
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
                  style={{ fontSize: "16px", padding: "12px", borderRadius: "8px", border: "2px solid #e5e7eb" }} 
                  disabled={isEditDisabled} 
                  className="w-full hover:border-yellow-400 focus:border-yellow-500 transition-colors" 
                />
                {errorMessage.email && <p className="text-red-500 text-xs mt-2">{errorMessage.email}</p>}
              </div>

              {/* Mobile Number Field */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Mobile Number</label>
                <Input 
                  name="phone" 
                  onChange={(e) => handleOnChange(e)} 
                  value={form.phone} 
                  placeholder="Enter your mobile number" 
                  style={{ fontSize: "16px", padding: "12px", borderRadius: "8px", border: "2px solid #e5e7eb" }} 
                  disabled={isEditDisabled} 
                  className="w-full hover:border-yellow-400 focus:border-yellow-500 transition-colors" 
                />
                {errorMessage.phone && <p className="text-red-500 text-xs mt-2">{errorMessage.phone}</p>}
              </div>

              {/* GST Field */}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">GST NO</label>
                <Input 
                  name="gst_no" 
                  onChange={(e) => handleOnChange(e)} 
                  value={form.gst_no} 
                  placeholder="Enter your GST" 
                  style={{ fontSize: "16px", padding: "12px", borderRadius: "8px", border: "2px solid #e5e7eb" }} 
                  disabled={isEditDisabled} 
                  className="w-full hover:border-yellow-400 focus:border-yellow-500 transition-colors" 
                />
              </div>
            </div>

            {/* Bottom Action Buttons */}
            <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </div>
              <div className="flex gap-5">
  <button 
    type="button" 
    className="px-4 py-2 bg-[#f9c114] text-black font-medium rounded-l-lg hover:bg-[#f9c114] transition-colors"
    onClick={() => setIsEditDisabled(!isEditDisabled)}
  >
    {isEditDisabled ? "Edit Profile" : "Cancel Editing"}
  </button>
  <button 
    className={`px-4 py-2 font-medium transition-all rounded-r-lg ${isEditDisabled ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"}`} 
    type="submit" 
    disabled={isEditDisabled}
  >
    Save Changes
  </button>
</div>

            </div>
          </form>
        </div>
      </div>
  );
};

export default Profile;