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
    <div className="min-h-screen bg-gray-50">
      {/* Header Section with Breadcrumbs */}
        <div className="lg:px-40 px-4 py-6">
          <Breadcrumbs 
            title={_.get(params, "category", "")} 
            titleto={`/category/${_.get(params, "category", "")}/${_.get(params, "categoryid", "")}`} 
            title2={_.get(params, "subcategory", "")} 
          />
        </div>
      

      {/* Banner Section - Fixed image display */}
      {_.get(productDatas, "[0].sub_category_details.sub_category_banner_image", "") && (
        <div className="lg:px-40 px-4 py-6">
          <div className="rounded-xl overflow-hidden shadow-lg bg-gray-200 flex items-center justify-center min-h-[200px]">
            <img 
              src={_.get(productDatas, "[0].sub_category_details.sub_category_banner_image", "")} 
              className="w-full h-auto max-h-[400px] object-contain" 
              alt={_.get(params, "subcategory", "")}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden flex-col items-center justify-center p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500">Banner image failed to load</p>
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      <div className="lg:px-40 px-4 py-8">
        {/* Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 capitalize mb-2">
            {_.get(params, "subcategory", "")}
          </h1>
          <p className="text-gray-600">
            Explore our collection of {_.get(params, "subcategory", "").toLowerCase()} products
          </p>
        </div>

        {/* Products Grid */}
        <div >
          {loading ? (
            <CarouselListLoadingSkeleton type="Product" />
          ) : (
            <>
              
              {productDatas.length > 0 ? (
                <GridList data={productDatas} type="Product" productCardType="Simple" />
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-16" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No products found</h3>
                  <p className="text-gray-500">There are currently no products in this subcategory.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubcategoryProduct;