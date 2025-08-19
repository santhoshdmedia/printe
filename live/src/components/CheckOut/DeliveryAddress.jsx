import React, { useEffect, useState } from "react";
import AddressCard from "../Account/AddressCard";
import { IconHelper } from "../../helper/IconHelper";
import { Radio } from "antd";

const DeliveryAddress = ({ userAddresses, setCreateOrder = (prev) => {}, setIsDeliveryAddressModalOpen=(prev)=>{} }) => {
  const addresses = userAddresses ?? [];

  //state
  const [value, setValue] = useState(0);

  //mount
  useEffect(() => {
    if (userAddresses.length!==0) {
      const delivery_address = userAddresses[0] || {};
      setCreateOrder((prev) => ({
        ...prev,
        delivery_address,
      }));
    }
  }, [userAddresses]);
  
  useEffect(()=>{
 if(addresses.length===0)
    setIsDeliveryAddressModalOpen(true);
  },[addresses.length])

  //function
  const handleOnChange = (e) => {
    const val = e.target.value;
    setValue(val);
    const delivery_address = userAddresses[val] || {};
    setCreateOrder((prev) => ({
      ...prev,
      delivery_address,
    }));
  };

  return (
    <div className='py-7'>
      {addresses.length === 0 ? (
        <div className='flex justify-center flex-col items-center'>
          <IconHelper.EMPTY_ICON size={50} />
          <h1 className='para'>Empty</h1>
        </div>
      ) : (
        <Radio.Group
          className='grid grid-cols-2 gap-5'
          onChange={handleOnChange}
          value={value}
        >
          {addresses.map((data, index) => (
            <Radio
              value={index}
              key={index}
            >
              <AddressCard
                data={data}
                index={index}
                MenuItems={false}
              />
            </Radio>
          ))}
        </Radio.Group>
      )}
    </div>
  );
};

export default DeliveryAddress;
