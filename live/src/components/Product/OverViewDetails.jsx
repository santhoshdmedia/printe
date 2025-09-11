/* eslint-disable no-empty */
/* eslint-disable react/prop-types */
import { Spin, Tabs } from "antd";
import RatingAndReviews from "./RatingAndReviews";
import { useEffect, useState } from "react";
import _ from "lodash";
import MixedProductDescripton from "./MixedProductDescripton";
import { IconHelper } from "../../helper/IconHelper";

const OverViewDetails = ({
  data = {
    description: "",
  },
}) => {
  const [loading, setLoading] = useState([]);
  const [tabItems, setTabItems] = useState([]);
  const [activeKey, setActiveKey] = useState();
  const [dummy, setDummy] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const items = [
        ..._.get(data, "description_tabs", []).map((res, index) => ({
          key: `${index + 1}`,
          label: <span className="!capitalize">{res.name}</span>,
          children: <MixedProductDescripton res={res} />,
        })),
      ];
      if (_.isEmpty(_.get(data, "description_tabs", []))) {
        setActiveKey(1000);
      } else {
        setActiveKey(1);
      }
      setDummy(!dummy);
      setTabItems(items);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const review = [
    {
      key: 1000,
      label: "Reviews & Rating",
      children: <RatingAndReviews />,
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Spin
      spinning={loading}
      indicator={
        <IconHelper.CIRCLELOADING_ICON className="animate-spin !text-yellow-500" />
      }
    >
      <div className="w-full flex lg:flex-row flex-col gap-6 ">
        <div id="overview" className="scroll-m-[10vh] w-full lg:w-1/2 ">
          {!_.isEmpty(tabItems) && (
            <>
              <Tabs
                defaultActiveKey="1"
                accessKey={activeKey}
                onChange={(keys) => {
                  setActiveKey(keys);
                }}
                items={tabItems}
                type="card"
                className=""
              />
            </>
          )}
        </div>
        <div className="w-full lg:w-1/2 h-full border rounded-xl">
          <RatingAndReviews/>
        </div>
      </div>
    </Spin>
  );
};

export default OverViewDetails;
