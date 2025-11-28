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
  return Number(totalPrice) - Number(totalPrice) * (Number(discount) / 100).toFixed(2);
};
export const Gst_HELPER = (Gst, totalPrice) => {
  return Number(totalPrice)+Number(totalPrice) * Number(Gst)/100 .toFixed(2);
};
export const GST_DISCOUNT_HELPER = (discount, totalPrice,Gst) => {
    const discountedPrice = Number(totalPrice) * (1 - Number(discount) / 100);
  const finalPrice = discountedPrice * ( Number(Gst) / 100);
  const Gst_price= discountedPrice + finalPrice;
  return Gst_price.toFixed(2);
};


