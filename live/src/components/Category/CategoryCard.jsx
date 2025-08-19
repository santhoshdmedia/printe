/* eslint-disable react/prop-types */
import { Link, useNavigate } from "react-router-dom";

const CategoryCard = ({ data }) => {
  const navigate = useNavigate();
  return (
    <Link to={`/categories/${data._id}`} className="mr-10 group flex flex-col items-center justify-center">
      <div className=" bg-primary_faded h-[10rem] w-[10rem] rounded-[50%] shadow-lg">
        <img src={data.sub_category_image} alt="" className="relative  object-contain drop-shadow group-hover:scale-110 transition-all duration-700 w-[10rem] h-[10rem]" />
      </div>
      <p className="para text-center text-secondary">{data.sub_category_name}</p>
    </Link>
  );
};

export default CategoryCard;
