export const emailValidation = () => [
  {
    type: "email",
    message: "Enter valid email address",
  },
  {
    required: true,
    message: "Enter email address",
  },
];

export const formValidation = (message) => [
  {
    required: true,
    message: message,
  },
];

export const DISCOUNT_HELPER = (discount, totalPrice) => {
  return Number(totalPrice) - Number(totalPrice) * (Number(discount) / 100);
};
