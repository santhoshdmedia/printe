import { useEffect, useState } from "react";
import { getAllBlogs } from "../../helper/api_helper";
import _ from "lodash";
import BlogCards from "../../components/cards/BlogCards";
import DividerCards from "../../components/cards/DividerCards";
import Breadcrumbs from "../../components/cards/Breadcrumbs";
import { useHref } from "react-router-dom";

const Blog = () => {
  const [allBlogs, setAllBlogs] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const path = useHref();

  const fetchData = async () => {
    try {
      const result = await getAllBlogs();
      setAllBlogs(_.get(result, "data.data", []));
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className={`${path === "/" ? "pb-10" : "lg:py-6 px-[6vw] md:px-[8vw] xl:px-[10vw]"}`}>
      {path === "/" ? <DividerCards name={"All Blogs"} to="/blogs" /> : <Breadcrumbs title={"All Blogs"} />}

      <div className="w-full min-h-[100px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 lg:px-0 px-4">
        {allBlogs?.slice(0, 6).map((res, index) => {
          return (
            <div key={index} className="pb-2 bg-white">
              <BlogCards res={res} extra={true} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Blog;
