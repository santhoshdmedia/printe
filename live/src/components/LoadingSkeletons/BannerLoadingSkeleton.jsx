import { Skeleton } from 'antd'
import React from 'react'

const BannerLoadingSkeleton = () => {
  return (
    <div>
      <Skeleton.Node
        active={true}
        style={{
          height: "100vh",
          width: "99vw",
        }}
        className="overflow-clip"
      />
    </div>
  );
}


export default BannerLoadingSkeleton
