import { useParams } from "react-router-dom";
import Breadcrumbs from "../../components/cards/Breadcrumbs";
import { useEffect, useState } from "react";
import { getAllSubCategoryProducts } from "../../helper/api_helper";
import _ from "lodash";
import GridList from "../../components/Lists/GridList";
import CarouselListLoadingSkeleton from "../../components/LoadingSkeletons/CarouselListLoadingSkeleton";

const SubcategoryProduct = () => {
  const params = useParams();

  const [productDatas, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getAllSubCategoryProducts(_.get(params, "id", ""));
      setProductData(_.get(result, "data.data", []));
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [_.get(params, "id", "")]);

  return (
    <div className="lg:px-40 px-4 min-h-screen py-10">
      <Breadcrumbs title={_.get(params, "category", "")} titleto={`/category/${_.get(params, "category", "")}/${_.get(params, "categoryid", "")}`} title2={_.get(params, "subcategory", "")} />
      {_.get(productDatas, "[0].sub_category_details.sub_category_banner_image", "") && (
        <>
          <img src={_.get(productDatas, "[0].sub_category_details.sub_category_banner_image", "")} className="mb-4 lg:!h-[350px] !w-full !object-contain" />
        </>
      )}

      <div>
        <div className="!bg-white flex flex-col">
          <h1 className="uppercase h-[50px] center_div  border font-bold mb-6 ">{_.get(params, "subcategory", "")}</h1>

          {loading ? <CarouselListLoadingSkeleton type="Product" /> : <GridList data={productDatas} type="Product" productCardType="Simple" />}
        </div>
      </div>
    </div>
  );
};

export default SubcategoryProduct;
