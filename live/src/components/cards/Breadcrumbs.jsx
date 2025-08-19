/* eslint-disable react/prop-types */
import { Breadcrumb } from "antd";
import { Link } from "react-router-dom";
import { IconHelper } from "../../helper/IconHelper";
// import { MdKeyboardDoubleArrowLeft } from "react-icons/md";
import { IoArrowRedoCircle  } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const Breadcrumbs = ({ title, title2, titleto, title2to, title3 }) => {
  const navigate = useNavigate();

  return (
    <div className="!font-primary pb-4 ">
      <Breadcrumb separator={<span className="!text-[#000000] ">{<IoArrowRedoCircle  className="!mt-1" />}</span>}>
        <Breadcrumb.Item>
          <Link to="/" className="!font-primary !text-[#000000] !font-light flex">
            <div className="center_div gap-x-1 !text-[#f9c114] font-semibold">
              <IconHelper.HOME_ICON className="!text-sm !text-[#000000] font-semibold" /> Home
            </div>
          </Link>
        </Breadcrumb.Item>

        <Breadcrumb.Item
          className={`!font-primary ${titleto ? "!text-[#f9c114]  cursor-pointer font-semibold" : "!text-[#f5f5f5] font-semibold"} font-light`}
          onClick={() => {
            titleto && navigate(titleto);
          }}
        >
          {title}
        </Breadcrumb.Item>
        {title2 && (
          <Breadcrumb.Item>
            <div
              className={`!font-primary ${title2to ? "!text-[#f9c114]  cursor-pointer font-semibold" : "!text-slate-500"} font-light`}
              onClick={() => {
                title2to && navigate(title2to);
              }}
            >
              {title2}
            </div>
          </Breadcrumb.Item>
        )}
        {title3 && (
          <Breadcrumb.Item>
            <div className="center_div gap-x-1 !text-slate-500 !font-light">{title3}</div>
          </Breadcrumb.Item>
        )}
      </Breadcrumb>
    </div>
  );
};

export default Breadcrumbs;
