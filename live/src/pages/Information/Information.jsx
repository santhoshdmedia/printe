/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { Breadcrumb, Divider } from "antd";
import React, { useEffect } from "react";
import Breadcrumbs from "../../components/cards/Breadcrumbs";

const singleHeading = ({ data, headingImg }) => {
  return (
    <div className="px-[6vw] md:px-[8vw] xl:px-[10vw] py-10">
      <div>
        <Breadcrumbs title={"Privacy Policy"} />
      </div>
      {data.map((main, index) => (
        <div key={index} className="mt-5">
          {headingImg ? (
            <div
              className={`h-40 w-full bg-cover bg-center bg-no-repeat center_div my-5 p-3 rounded-md`}
              style={{
                backgroundImage: ` linear-gradient(to right, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.2)), url(${main.img})`,
                opacity: "0.9",
                backgroundColor: "black",
              }}
            >
              <Divider style={{ borderColor: "white" }}>
                <h1 className={`title text-white`}>{main.title}</h1>
              </Divider>
            </div>
          ) : (
            <h1 className={`title text-primary mt-5`}>{main.title}</h1>
          )}
          <pre className="para py-2 text-justify text-wrap">{main.desc}</pre>
        </div>
      ))}
    </div>
  );
};

const DoubleHeading = ({ data, headingImg, subHeadingImg, breadcrumbs }) => {
  return (
    <div className="px-[6vw] md:px-[8vw] xl:px-[10vw] py-10">
      <div>
        {!breadcrumbs && (
          <>
            <Breadcrumbs title={"Terms & conditions"} />
          </>
        )}
      </div>
      {data.map((main, index) => (
        <div key={index}>
          {headingImg ? (
            <div
              className={`h-40 w-full bg-cover bg-center bg-no-repeat center_div my-5 p-3 rounded-md`}
              style={{
                backgroundImage: ` linear-gradient(to right, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.2)), url(${main.img})`,
                opacity: "0.9",
                backgroundColor: "black",
              }}
            >
              <Divider style={{ borderColor: "white" }}>
                <h1 className={`title text-white`}>{main.title}</h1>
              </Divider>
            </div>
          ) : (
            <h1 className={`title text-primary mt-5`}>{main.title}</h1>
          )}
          <pre className="para py-1 text-justify text-wrap">{main.desc}</pre>
          <div className={`flex flex-col gap-2 ${subHeadingImg && "!gap-5"} `}>
            {main.children?.map((sub, index) => (
              <div key={index} className={`flex gap-2 ${subHeadingImg && "even:flex-row-reverse items-center !gap-10"}  `}>
                <div className="flex-1">
                  <h1 className="sub_title text-primary py-2 ">{sub.title}</h1>
                  <pre className="para py-1 text-justify text-wrap">{sub.desc}</pre>
                </div>
                {subHeadingImg && (
                  <div className={`w-[40rem] rounded-lg center_div p-4 mt-2  `}>
                    <img src={sub.img} alt="" className="object-cover h-auto w-full rounded-lg opacity-95" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const Information = ({ data, subHeadingAvailable = false, headingImg = false, subHeadingImg = false, breadcrumbs = true }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [data]);
  if (!subHeadingAvailable) return singleHeading({ data, headingImg, breadcrumbs });
  else return DoubleHeading({ data, headingImg, subHeadingImg, breadcrumbs });
};

export default Information;
