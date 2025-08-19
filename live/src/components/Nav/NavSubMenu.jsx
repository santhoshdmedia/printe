import { Tag } from "antd";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const NavSubMenu = ({ activeMenu }) => {
  const [subMenu, setSubMenu] = useState(null);
  const { menu } = useSelector((state) => state.publicSlice);
  useEffect(() => {
    const foundMenu = menu.find((data) => data._id === activeMenu);
    setSubMenu(foundMenu || null);
  }, [activeMenu]);

  if (!subMenu) {
    return null; 
  }

  // const colorVariants = {
  //   new: {
  //     bg: "bg-green-300",
  //     text: "text-green-700",
  //     border: "border-green-400",
  //   },
  //   popular: {
  //     bg: "bg-purple-300",
  //     text: "text-purple-700",
  //     border: "border-purple-600",
  //   },
  // };

  return (
    <div className="absolute mt-2 top-[30px] left-0 bg-white shadow-lg border rounded-lg p-4 grid grid-cols-3 gap-4 z-50">
      {subMenu.sub_category_details?.map((group) => (
        <div className="col-span-1" key={group.sub_category_id}>
          <h4 className="sub_title mb-2 text-primary ">{group.sub_category_name}</h4>
          <hr />
          <ul className="space-y-1 mt-2">
            {group.sub_products.map((item) => {
              return (
                <li className="hover:cursor-pointer para flex gap-2 items-center" key={item._id}>
                  <Link to={`/categories/${group.sub_category_id}?pc=${item._id}`} className="hover:text-primary">
                    {item.sub_product_name}
                  </Link>{" "}
                  <div className="">
                    {/* {item.label &&
                      item.label.map((val, index) => {
                        const color = val === "new" ? "green" : "purple";
                        return <Tag color={color}>{val}</Tag>;
                      })} */}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default NavSubMenu;
