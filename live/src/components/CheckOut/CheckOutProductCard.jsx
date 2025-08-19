import { Divider, Modal } from "antd";
import React, { useState } from "react";
import UploadFileButton from "../UploadFileButton";
import _ from "lodash";

const CheckOutProductCard = ({ data }) => {
  //destructing
  const variants = _.get(data, "product_variants", {});
  const quantity = _.get(data, "product_quantity", 0);
  const file = _.get(data, "product_design_file", "");
  const price = _.get(data, "product_price", 0);

  //state
  const [viewModal, setViewModal] = useState(false);

  //function
  const handleModalToggle = () => {
    setViewModal(!viewModal);
  };
  return (
    <div className='flex gap-4 bg-purple-50 justify-center items-center shadow-md border rounded-md py-5'>
      <div className='w-[15rem]'>
        <img
          src={_.get(data, "product_image", "")}
          alt=''
        />
      </div>
      <div className='flex-1 px-20 flex gap-3 flex-col'>
        <h1 className='sub_title text-primary'>Variants</h1>
        <Divider
          variant='dashed'
          className='!m-0'
          style={{ backgroundColor: "#b3b3b7" }}
        />
        {Object.keys(variants).map((key) => {
          return (
            <div
              key={key}
              className='flex gap-5 items-center justify-between'
            >
              <label className='para font-bold'>{key}</label>
              <span className='para text-gray-500'>{variants[key]}</span>
            </div>
          );
        })}
        <div className='flex gap-5 items-center justify-between '>
          <label className='para font-bold'>Quantity</label>
          <span className='para text-gray-500'>{quantity}</span>
        </div>
        <div className='flex gap-5 items-center justify-between '>
          <label className='para font-bold'>Price</label>
          <span className='para text-gray-500'>{price}</span>
        </div>
        <Divider
          variant='dashed'
          className='!m-0'
          style={{ backgroundColor: "#b3b3b7" }}
        />
        <div className='flex gap-5 items-center justify-between '>
          <label className='para font-bold'>Your Design</label>
          <div className='flex gap-5 items-center'>
            <button
              className='text-purple-500'
              onClick={handleModalToggle}
              type="button"
            >
              View
            </button>
            <UploadFileButton buttonText='Change file' />
          </div>
        </div>
      </div>

      <Modal
        title='Design'
        footer={false}
        open={viewModal}
        onCancel={handleModalToggle}
        className='flex justify-center '
      >
        <object
          data={file}
          className='!w-[20rem] h-[20rem]'
        />
      </Modal>
    </div>
  );
};

export default CheckOutProductCard;
