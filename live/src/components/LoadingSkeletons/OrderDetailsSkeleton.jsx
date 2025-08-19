import { Skeleton } from "antd";
import React from "react";

const OrderDetailsSkeleton = () => {
  return (
    <div>
      <Skeleton.Input
        active={true}
        block={true}
        style={{
          height: 350,
        }}
      />
    </div>
  );
};

export default OrderDetailsSkeleton;
