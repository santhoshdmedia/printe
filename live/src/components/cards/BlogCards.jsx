/* eslint-disable react/prop-types */
import moment from "moment";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const BlogCards = ({ res, extra }) => {
  useEffect(() => {
    window;
  });

  return (
    <>
      <img src={res.blog_image} alt="" className={`!w-full ${extra ? "!h-[300px]" : "!h-[100px]"} p-4 !object-cover border lg:border-none !object-top`} />
      <div className={`${extra ? "" : ""} p-4`}>
        <h1 className="py-4  font-light">{moment(res.createdAt).format("llll")}</h1>
        <h1 className="py-1  font-semibold line-clamp-1">{res.blog_name}</h1>
        <h1 className="text-sm !font-normal  line-clamp-4">{res.short_description}</h1>
        <Link to={`/blog-details/${res._id}`}>
          <div className="text-sm  py-4 text-primary font-medium">Read More</div>
        </Link>
      </div>
    </>
  );
};

export default BlogCards;
