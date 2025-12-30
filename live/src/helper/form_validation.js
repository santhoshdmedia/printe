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
  const price = Number(totalPrice);
  const disc = Number(discount);
  const discountMultiplier = 1 - (disc / 100);
  const finalPrice = price * discountMultiplier;
  return Number(finalPrice.toFixed(2));
};

export const Gst_HELPER = (gstRate, totalPrice) => {
  const price = Number(totalPrice);
  const gst = Number(gstRate);
  const gstMultiplier = 1 + (gst / 100);
  const finalPrice = price * gstMultiplier;
  return Number(finalPrice.toFixed(2));
};

export const GST_DISCOUNT_HELPER = (discount, totalPrice, gstRate) => {
  const price = Number(totalPrice);
  const disc = Number(discount);
  const gst = Number(gstRate);
  
  // Apply discount
  const discountMultiplier = 1 - (disc / 100);
  const discountedPrice = price * discountMultiplier;
  
  // Apply GST on discounted price
  const gstMultiplier = 1 + (gst / 100);
  const finalPrice = discountedPrice * gstMultiplier;
  
  return Number(finalPrice.toFixed(2));
};

