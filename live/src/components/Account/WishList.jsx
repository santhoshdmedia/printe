/* eslint-disable no-unused-vars */
import React, { useEffect } from "react";
import { MdDelete } from "react-icons/md";
import { Badge, Empty, Tag } from "antd";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";

const WishList = () => {
  const { user, wish_list } = useSelector((state) => state.authSlice);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!user?.wish_list?.length) return;

    dispatch({
      type: "GET_PRODUCT",
      data: { id_list: user.wish_list, type: "wish_list" },
    });
  }, [user, dispatch]);

  const generateLabel = (label) => {
    switch (label) {
      case "new":
        return <Tag color="green">New</Tag>;
      case "popular":
        return <Tag color="purple">Popular</Tag>;
      default:
        return <></>;
    }
  };

  const handleDeleteWishProduct = (index) => {
    const filtedList = user.wish_list.filter((_, i) => i !== index);
    const form = { wish_list: filtedList };
    dispatch({ type: "UPDATE_USER", data: { form, type: "custom", message: "Wished product deleted" } });
  };

  return (
    <div className="w-full">
      <div className="px-5 md:px-10 py-5 border shadow-md rounded-lg flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="title">WishList</h1>
          <Badge count={wish_list.data.length} />
        </div>
        {wish_list.loading ? (
          <div>loading</div>
        ) : wish_list.data.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          wish_list.data.map((data, index) => {
            const img = data.images[0].path;
            const price = data.variants_price[0].price;
            return (
              <div className="border rounded-md shadow-md flex flex-col md:flex-row gap-5 p-4 relative" key={index}>
                <div className="w-[6rem] bg-purple-200">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <>
                    <h3 className="text-wrap pr-5 sub_title">{data.name}</h3>
                    <button className="absolute right-3 top-3" onClick={() => handleDeleteWishProduct(index)}>
                      <MdDelete color="gray" size={20} />
                    </button>
                  </>
                  <div className="flex flex-col md:flex-row items-start md:items-center  gap-3">
                    <span className="text-2xl font-bold text-primary">Rs. {price}</span>
                    {data.label.map((data) => generateLabel(data))}
                    {/* <Tag color='green'>New</Tag> */}
                  </div>
                  <Link to={`/product/${_.get(data, "seo_url", "")}`} className="button text-center hover:text-white  ">
                    Shop
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default WishList;
