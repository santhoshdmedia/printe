import { Skeleton } from 'antd'


const CategoryCardLoadingSkeleton = () => {
  return (
    <div>
      <Skeleton.Image active={true} size={"large"} />
    </div>
  );
}

export default CategoryCardLoadingSkeleton
