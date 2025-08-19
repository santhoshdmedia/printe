/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { footerItems } from "../../data";
import { IoCallOutline } from "react-icons/io5";
import { CiMail } from "react-icons/ci";
import { Link, useNavigate } from "react-router-dom";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitterSquare } from "react-icons/fa";
import moment from "moment";
// import { ImageHelper } from "../helper/ImageHelper";
import Logo from "../assets/logo/Printelogo.jpg"

const Footer = () => {
  const navigate = useNavigate();

  const handleMove = (res) => {
    navigate(`${res.link}`);
  };
  // const logocolors = [ImageHelper.COLOR_LOGO1, ImageHelper.COLOR_LOGO2, ImageHelper.COLOR_LOGO3, ImageHelper.COLOR_LOGO4, ImageHelper.COLOR_LOGO5, ImageHelper.COLOR_LOGO6];
  //const bgcolors = ["#1e40af", "#5b21b6", "#9f1239", "#3f6212", "#9a3412", "#292524"];

  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [currentBgColor, setCurrentBgColor] = useState(0);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentColorIndex((prevIndex) => (prevIndex + 1) % logocolors.length);
  //     setCurrentBgColor((prevIndex) => (prevIndex + 1) % bgcolors.length);
  //   }, 60000);

  //   return () => clearInterval(interval);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

 
  return (
    <div className="pt-10 border-t bg-primary !font-primary relative">
      <div className=" w-[200px] h-[70px] absolute -top-6 left-1/2 -translate-x-1/2 border rounded flex items-center justify-center">
        <Link to="/" className="font-bold text-xl text-black rounded hover:text-hot_pink uppercase cursor-pointer !line-clamp-1 ">
          <div className="flex flex-row items-center py-4">
            <img src={Logo} alt="" className="w-auto h-full bg-center bg-cover" />
          </div>
        </Link>
      </div>
      <div id="top" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 justify-between px-[6vw] md:px-[8vw] xl:px-[10vw] items-start text-black py-8">
        {footerItems.map((data, index) => {
          return (
            <ul key={index} className="space-y-4">
              <li className="text-lg font-semibold text-white">{data.title}</li>
              {data.sub.map((items, subIndex) => {
                return (
                  <li key={subIndex} className=" cursor-pointer">
                    <div onClick={() => handleMove(items)} className={`hover:border-b hover:border-b-white w-fit text-white border-b  ${items.link === location.pathname ? "border-b-white" : "border-b-transparent"} !text-sm`}>
                      {items.value}
                    </div>
                  </li>
                );
              })}
            </ul>
          );
        })}

        <div>
          <h1 className="text-lg font-semibold text-white pb-4">Contact</h1>
          <ul className="flex text-white justify-start items-start flex-col gap-4">
            <li className="flex justify-start items-center gap-3">
              <IoCallOutline size={20} />
              <span>+91 9987654321</span>
            </li>
            <li className="flex justify-start items-center gap-3">
              <CiMail size={20} />
              <span>info@printe.in</span>
            </li>
            <li className="flex flex-col xl:flex-row justify-start items-start gap-3">
              <span>Follow us</span>
              <ul className="flex gap-2">
                <li>
                  <FaFacebook size={20} />
                </li>
                <li>
                  <FaInstagram size={20} />
                </li>
                <li>
                  <FaTwitterSquare size={20} />
                </li>
                <li>
                  <FaLinkedin size={20} />
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>

      <div id="bottom" className="center_div h-[50px] bg-white border-t border-slate-400 font-primary flex justify-center items-center">
        <span className="lining-nums text-sm text-center px-5">@{moment().format("YYYY")} Printe Document Services Pvt. Ltd.. All Rights Reserved.</span>
      </div>
    </div>
  );
};

export default Footer;
