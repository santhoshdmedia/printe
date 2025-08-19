/* eslint-disable react/prop-types */
import { Descriptions } from "antd";
import _ from "lodash";

const MixedProductDescripton = ({ res }) => {
  return (
    <div>
      {_.get(res, "tab_type", "") === "Editor" && (
        <>
          <div dangerouslySetInnerHTML={{ __html: _.get(res, "description", "") }} className="lg:text-sm leading-6 text-justify font-primary py-2 text-wrap"></div>
        </>
      )}
      {_.get(res, "tab_type", "") === "Table" && (
        <>
          <Descriptions bordered>
            {_.get(res, "table_view", []).map((datas, index) => {
              return (
                <Descriptions.Item key={index} label={datas.left}>
                  {datas.right}
                </Descriptions.Item>
              );
            })}
          </Descriptions>
        </>
      )}
      {_.get(res, "tab_type", "") === "Content-With-Image" && (
        <>
          {_.get(res, "content_image_view", []).map((datas, index) => {
            return (
              <div key={index}>
                <h1>{_.get(datas, "content", "")}</h1>
                {_.get(datas, "images", []).map((images_data, index) => {
                  return <img key={index} src={images_data} className="!object-cover size-[200px]" />;
                })}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default MixedProductDescripton;
