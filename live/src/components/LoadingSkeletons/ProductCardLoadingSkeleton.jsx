import { Skeleton } from "antd";

const ProductCardLoadingSkeleton = () => {
  return (
    <div>
      <Skeleton.Image active={true} className="!h-[300px] !w-full !p-2" />
    </div>
  );
};

export default ProductCardLoadingSkeleton;
