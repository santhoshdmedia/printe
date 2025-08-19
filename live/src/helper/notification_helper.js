import { notification } from "antd";
import _ from "lodash";
import Swal from "sweetalert2";

export const SUCCESS_NOTIFICATION = (success_message) => {
  return notification.success({ message: _.get(success_message, "data.message", "") });
};

export const ERROR_NOTIFICATION = (error_message) => {
  return notification.error({ message: _.get(error_message, "response.data.message", "") });
};
export const CUSTOM_ERROR_NOTIFICATION = (error_message) => {
  return notification.error({ message: error_message });
};

export const CUSTOM_SUCCESS_SWALFIRE_NOTIFICATION = (values) => {
  const { title, text, icon, confirmButtonText, cancelButtonText } = values;
  return Swal.fire({
    title: title,
    text: text,
    icon: icon,
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButtonText,
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "orange",
    confirmButtonTextColor: "#3085d6",
    cancelButtonTextColor: "#3085d6",
  });
};
