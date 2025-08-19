import React, { useState } from "react";

const PaymentMethod = ({ setCreateOrder = (prev) => {} }) => {
  const [selectedMethod, setSelectedMethod] = useState("case-on-payment");

  const handleOnChangeMethod = (value) => {

    setSelectedMethod(value);
    setCreateOrder((prev) => ({
      ...prev,
      payment_method: value,
    }));
  };

  return (
    <div className='flex items-center gap-10'>
      <button
        type="button"
        className={`${
          selectedMethod === "online-payment" ? "button" : "button_inline"
        }`}
        onClick={() => handleOnChangeMethod("online-payment")}
      >
        Online Payment
      </button>
      <button
        type="button"
        className={`${
          selectedMethod === "case-on-payment" ? "button" : "button_inline"
        }`}
        onClick={() => handleOnChangeMethod("case-on-payment")}
      >
        Cash on Delivery
      </button>
    </div>
  );
};

export default PaymentMethod;
