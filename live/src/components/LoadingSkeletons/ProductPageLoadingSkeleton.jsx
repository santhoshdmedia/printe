import { Skeleton } from "antd";


const ProductPageLoadingSkeleton = () => {
  return (
    <div className="min-h-screen w-full">
      <div>
        <div className="flex flex-wrap gap-2">
          <Skeleton.Image active className="!w-full !h-[300px]" />
          <div className="flex items-center gap-x-2">
            <Skeleton.Image active className="" />
            <Skeleton.Image active className="" />
          </div>
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default ProductPageLoadingSkeleton;
