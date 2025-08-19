/* eslint-disable no-empty */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAllBlogs } from "../../helper/api_helper";
import _ from "lodash";
import moment from "moment";
import { Divider } from "antd";
import BlogCards from "../../components/cards/BlogCards";
import Breadcrumbs from "../../components/cards/Breadcrumbs";
const BlogDetails = () => {
  const { id } = useParams();

  const [allBlogs, setAllBlogs] = useState([]);
  const [currentBlog, setCurrentBlog] = useState([]);

  const fetchData = async () => {
    try {
      const result = await getAllBlogs();

      let filteredBlogs = _.get(result, "data.data", []).filter((res) => {
        return res._id === id;
      });
      let filteredBlogs2 = _.get(result, "data.data", []).filter((res) => {
        return res._id != id;
      });
      setAllBlogs(filteredBlogs2);
      setCurrentBlog(_.get(filteredBlogs, "[0]", []));
    } catch {}
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchData();
  }, [id]);

  return (
    <div className="w-full min-h-screen py-10 px-[6vw] md:px-[8vw] xl:px-[10vw] font-primary">
      <Breadcrumbs title={_.get(currentBlog, "blog_name", "")} />
      <div className="w-full  min-h-[100px] flex flex-col md:flex-row items-start gap-x-5 lg:gap-x-10 pt-4">
        <div className="w-full md:w-[70%]">
          <h1 className="text-4xl font-medium">{_.get(currentBlog, "blog_name", "")}</h1>
          <h1 className="py-6  font-light">{moment(_.get(currentBlog, "createdAt", "")).format("llll")}</h1>
          <h1 className="!font-normal  line-clamp-4 mb-4">{_.get(currentBlog, "short_description", "")}</h1>
          <img src={_.get(currentBlog, "blog_image", "")} className="!w-full !object-cover !h-[400px]" />
          <Divider />
          <div>
            {_.get(currentBlog, "blog_descriptions", []).map((res, index) => {
              return (
                <div key={index}>
                  <h1 className="text-4xl font-medium">{_.get(res, "title", "")}</h1>
                  <h1 className="!font-normal  line-clamp-4 my-4">{_.get(res, "description", "")}</h1>
                  <div className="py-4 flex flex-wrap gap-2">
                    {_.get(res, "images", []).map((img, index) => {
                      return <img key={index} src={img} className="!object-cover size-[200px]" />;
                    })}
                  </div>
                  <Divider />
                </div>
              );
            })}
          </div>
        </div>
        <div className="w-full md:w-[30%] px-3">
          <h1 className="font-medium text-4xl pb-4">Recent Posts</h1>
          <div className="space-y-4">
            {allBlogs?.slice(0, 3).map((res, index) => {
              return (
                <div key={index} className="pb-2 bg-white">
                  <BlogCards res={res} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <h1 className="font-medium text-4xl py-4">ALL Blogs</h1>
      <div className="w-full min-h-[100px] pb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 font-primary gap-2">
        {allBlogs.map((res, index) => {
          return (
            <div key={index} className=" pb-2 bg-white">
              <BlogCards res={res} extra={true} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BlogDetails;
