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
    <div className="w-full min-h-screen bg-white font-primary">
      {/* Minimalist Header */}
      <div className="max-w-4xl mx-auto px-6 md:px-8 pt-12 md:pt-20 pb-8">
        <Breadcrumbs title={_.get(currentBlog, "blog_name", "")} />
        
        {/* Title & Meta */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 mt-8 mb-6 leading-tight tracking-tight">
          {_.get(currentBlog, "blog_name", "")}
        </h1>
        
        <div className="flex items-center gap-6 text-gray-500 text-sm md:text-base border-l-2 border-gray-900 pl-4">
          <time dateTime={_.get(currentBlog, "createdAt", "")}>
            {moment(_.get(currentBlog, "createdAt", "")).format("MMMM DD, YYYY")}
          </time>
          <span>·</span>
          <span>5 min read</span>
        </div>

        {/* Short Description */}
        <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mt-8 font-light italic border-l-4 border-gray-200 pl-6">
          {_.get(currentBlog, "short_description", "")}
        </p>
      </div>

      {/* Featured Image - Full Width */}
      <div className="w-full h-[50vh] md:h-[70vh] my-12 md:my-16">
        <img 
          src={_.get(currentBlog, "blog_image", "")} 
          className="w-full h-full object-cover"
          alt={_.get(currentBlog, "blog_name", "")}
        />
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-6 md:px-8 pb-20">
        <article className="prose prose-lg md:prose-xl max-w-none">
          {_.get(currentBlog, "blog_descriptions", []).map((res, index) => {
            return (
              <section key={index} className="mb-16 md:mb-20">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6 leading-tight">
                  {_.get(res, "title", "")}
                </h2>
                
                <div className="text-lg md:text-xl text-gray-700 leading-relaxed space-y-4 whitespace-pre-line">
                  {_.get(res, "description", "")}
                </div>

                {/* Section Images - Masonry Style */}
                {_.get(res, "images", []).length > 0 && (
                  <div className="mt-10 space-y-6">
                    {_.get(res, "images", []).map((img, imgIndex) => {
                      return (
                        <figure key={imgIndex} className="w-full">
                          <img 
                            src={img} 
                            className="w-full h-auto object-cover rounded-sm"
                            alt={`${_.get(res, "title", "")} - Figure ${imgIndex + 1}`}
                          />
                        </figure>
                      );
                    })}
                  </div>
                )}

                {index < _.get(currentBlog, "blog_descriptions", []).length - 1 && (
                  <hr className="mt-16 border-gray-200" />
                )}
              </section>
            );
          })}
        </article>

        {/* Author/Share Section */}
        <div className="mt-16 pt-12 border-t-2 border-gray-900">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h3 className="text-sm uppercase tracking-wider text-gray-500 mb-2">Share this article</h3>
              <div className="flex gap-4">
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  <span className="text-sm underline">Twitter</span>
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  <span className="text-sm underline">Facebook</span>
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  <span className="text-sm underline">LinkedIn</span>
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                  <span className="text-sm underline">Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Articles - Minimal Grid */}
      <div className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-12">
            Continue Reading
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {allBlogs.slice(0, 3).map((res, index) => {
              return (
                <div key={index} className="group">
                  <BlogCards res={res} />
                </div>
              );
            })}
          </div>

          {allBlogs.length > 3 && (
            <>
              <hr className="my-16 border-gray-300" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
                {allBlogs.slice(3).map((res, index) => {
                  return (
                    <div key={index} className="group">
                      <BlogCards res={res} extra={true} />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;