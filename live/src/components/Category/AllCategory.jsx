/* eslint-disable no-empty */
import { Card, Divider, Menu } from "antd";
import Breadcrumbs from "../cards/Breadcrumbs";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import _ from "lodash";

const AllCategory = () => {
  const { menu } = useSelector((state) => state.publicSlice);

  const navigation = useNavigate();

  const [activeMenu, setActiveMenu] = useState("");

  useEffect(() => {
    if (!activeMenu) {
      setActiveMenu(_.get(menu, "[0]._id", ""));
    }
  }, [menu]);

  const handleRedirect = (category) => {
    navigation(`/category/${_.get(category, "main_category_name", "")}/${_.get(category, "_id", "")}`);
  };

  return (
    <div className="p-5 w-full md:px-[8vw] xl:px-[10vw] py-10">
      <Breadcrumbs title={"All Categories"} />

      <div className="grid grid-cols-4 gap-4">
        {menu.map((res, index) => {
          return (
            <Card
              key={index}
              hoverable
              onClick={() => {
                handleRedirect(res);
              }}
            >
              <Card.Meta title={res.main_category_name} />
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AllCategory;
