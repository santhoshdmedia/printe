/* eslint-disable react/prop-types */
import { Avatar, Card, Rate, Skeleton, Spin, Tag } from "antd";
import moment from "moment";
import _ from "lodash";
import { useState } from "react";
import { useSelector } from "react-redux";
import { IconHelper } from "../../helper/IconHelper";
import { ERROR_NOTIFICATION, SUCCESS_NOTIFICATION } from "../../helper/notification_helper";
import { deleteMyReview } from "../../helper/api_helper";

const ReviewCard = ({ data, dummy, setDummy, setId }) => {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useSelector((state) => state.authSlice);

  const handleReadMore = (id) => {
    setActive(active === id ? "" : id);
  };

  const profileImageName = _.get(data, "user_data[0].name[0]", "") || "";

  const handleRemoveReview = async () => {
    try {
      setLoading(true);
      const result = await deleteMyReview(_.get(data, "_id", ""));
      SUCCESS_NOTIFICATION(result);
      setDummy(!dummy);
    } catch (err) {
      ERROR_NOTIFICATION(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="!w-full !min-h-[100px] group hover:bg-[#cb7ace4d] relative">
      <Card.Meta
        avatar={
          <Avatar src={_.get(data, "user_data[0].profile_pic", "") || null} size="small" className="text-white !text-sm capitalize bg-hot_pink title">
            {profileImageName}
          </Avatar>
        }
        title={
          <div className="flex flex-col">
            <span className="capitalize">{_.get(data, "user_data[0].name", "")}</span>
            <span className="!text-[12px] !font-light">{moment(data.createdAt).fromNow()}</span>
          </div>
        }
        description={
          <div className="flex flex-col">
            <Rate disabled allowHalf className="!text-sm" value={_.get(data, "rating", 3.5)} />
            <div>
              {active === _.get(data, "_id", "") ? _.get(data, "review", "") : _.get(data, "review", "")?.slice(0, 150)}{" "}
              <div
                onClick={() => {
                  handleReadMore(_.get(data, "_id", ""));
                }}
                className="!text-sm !text-hot_pink cursor-pointer"
              >
                {active === _.get(data, "_id", "") ? "close" : "Read More"}
              </div>
            </div>
          </div>
        }
      />
      <div className={`lg:absolute lg:pt-0 pt-6 top-4 right-4 gap-x-2 flex items-center ${_.get(user, "_id", "") === _.get(data, "user_data[0]._id", "") ? "block" : "hidden"} `}>
        <Spin active spinning={loading} indicator={<IconHelper.CIRCLELOADING_ICON className="!animate-spin !text-hot_pink !text-sm" />} className="!h-[25px] !min-w-[80px]">
          <Tag
            onClick={() => {
              setId(data);
            }}
            className="!h-[25px] center_div cursor-pointer gap-x-2 !rounded-none !bg-white"
          >
            <IconHelper.EDIT_ICON /> Edit
          </Tag>
        </Spin>
        <Spin active spinning={loading} indicator={<IconHelper.CIRCLELOADING_ICON className="!animate-spin !text-hot_pink !text-sm" />} className="!h-[25px] !min-w-[80px]">
          <Tag onClick={handleRemoveReview} className="!h-[25px] center_div cursor-pointer gap-x-2 !border-red-500 !rounded-none !text-red-500">
            <IconHelper.USEREMOVE_ICON /> Remove
          </Tag>
        </Spin>
      </div>
    </Card>
  );
};

export default ReviewCard;
