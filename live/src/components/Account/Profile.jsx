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
    }
  };

  const handleUploadImage = (image) => {
    console.log(image);

    setForm((prev) => ({ ...prev, profile_pic: image }));
  };

  const profileImageName = user?.name[0] || "";

  return (
    <div className="w-full h-auto">
      <form onSubmit={(e) => handleOnSubmit(e)} className="py-6 px-8 rounded-lg border shadow-md bg-white flex flex-col gap-6">
        <div className="rounded-t-lg bg-secondary h-[10rem] -my-6 -mx-8"></div>

        <div className="relative -mt-16 flex justify-center">
          <div className="relative group w-24 h-24">
            <Avatar
              src={form.profile_pic}
              style={{
                width: "96px",
                height: "96px",
                objectFit: "cover",
                textTransform: "capitalize",
                borderRadius: "50%",
              }}
              className="text-primary capitalize text-5xl bg-purple-300 title"
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

                <label htmlFor="image" className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 text-white flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                  <IconHelper.EDIT_ICON />
                </label>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <Input name="name" onChange={(e) => handleOnChange(e)} value={form.name} placeholder="Enter your name" style={{ fontSize: "16px" }} disabled={isEditDisabled} className="w-full" />
            {errorMessage.name && <p className="text-red-500 text-xs mt-1">{errorMessage.name}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <Input name="email" onChange={(e) => handleOnChange(e)} value={form.email} placeholder="Enter your email" style={{ fontSize: "16px" }} disabled={isEditDisabled} className="w-full" />
            {errorMessage.email && <p className="text-red-500 text-xs mt-1">{errorMessage.email}</p>}
          </div>

          {/* Mobile Number Field */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">Mobile Number</label>
            <Input name="phone" onChange={(e) => handleOnChange(e)} value={form.phone} placeholder="Enter your mobile number" style={{ fontSize: "16px" }} disabled={isEditDisabled} className="w-full" />
            {errorMessage.phone && <p className="text-red-500 text-xs mt-1">{errorMessage.phone}</p>}
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">GST NO</label>
          <Input name="gst_no" onChange={(e) => handleOnChange(e)} value={form.gst_no} placeholder="Enter your GST " style={{ fontSize: "16px" }} disabled={isEditDisabled} className="w-full" />
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center mt-4">
          <button type="button" className="text-purple-600 text-sm font-medium hover:underline" onClick={() => setIsEditDisabled(!isEditDisabled)}>
            {isEditDisabled ? "Edit" : "Cancel"}
          </button>
          <button className={`${isEditDisabled ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-purple-600 text-white hover:bg-purple-700"} px-4 py-2 rounded text-sm font-medium transition-colors`} type="submit" disabled={isEditDisabled}>
            Update Details
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
