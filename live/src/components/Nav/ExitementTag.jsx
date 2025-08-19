/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import { Tag } from "antd";
import _ from "lodash";

const ExitementTag = ({ product }) => {
  return (
    <div>
      {_.get(product, "new_product", "") && (
        <>
          <Tag color="green-inverse">New</Tag>
        </>
      )}
      {_.get(product, "popular_product", "") && (
        <>
          <Tag color="pink-inverse">Popular</Tag>
        </>
      )}
      {_.get(product, "recommended_product", "") && (
        <>
          <Tag color="purple-inverse">Recommended</Tag>
        </>
      )}
    </div>
  );
};

export default ExitementTag;
