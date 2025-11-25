import { useParams } from "react-router-dom";
import Breadcrumbs from "../../components/cards/Breadcrumbs";
import { useEffect, useState } from "react";
import { getAllCategoryProducts } from "../../helper/api_helper";
import _ from "lodash";
import GridList from "../../components/Lists/GridList";
import CarouselListLoadingSkeleton from "../../components/LoadingSkeletons/CarouselListLoadingSkeleton";
import { Bannear } from "../../components/Lists/SwiperList";

const CategoryProduct = () => {
  const params = useParams();

  const [productDatas, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getAllCategoryProducts(_.get(params, "id", ""));
      setProductData(_.get(result, "data.data", []));
      const fillterCategorey= productDatas.filter(
        product => product.show === true
      );
      setProductData(fillterCategorey)
      
      
      
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
    <>
      <div className="pb-10 relative">
        <div className="lg:px-40 px-0  pt-5 absolute z-10 text-white">
          <Breadcrumbs title={_.get(params, "category", "")} />
        </div>
        <Bannear />
      </div>
      <div className="lg:px-[5.5rem] px-4 min-h-screen py-10">
        <div>
          <div className="flex flex-col gap-y-10">
            {productDatas.map((res, index) => {
              return (
                <div key={index} className="min-h-[100px]">
                  <h1 className="uppercase h-[50px] center_div font-bold  border  px-10 mb-4">
                    {_.get(res, "sub_category_name", "")}
                  </h1>
                  {loading ? (
                    <CarouselListLoadingSkeleton type="Product" />
                  ) : (
                    <GridList
                      data={_.get(res, "product", [])}
                      type="Product"
                      productCardType="Simple"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryProduct;
