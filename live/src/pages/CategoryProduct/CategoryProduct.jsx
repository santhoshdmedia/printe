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
  const categoryId = _.get(params, "id", "");
  const categoryName = _.get(params, "category", "");

  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!categoryId) {
        console.error("No category ID provided");
        setProductData([]);
        return;
      }

      const result = await getAllCategoryProducts(categoryId);
      const apiData = _.get(result, "data.data", []);
      
      if (!Array.isArray(apiData)) {
        console.error("Invalid data format received from API");
        setProductData([]);
        return;
      }

      // Filter categories that have show: true AND have products
      const filteredCategories = apiData.filter(category => 
        category.show === true && 
        Array.isArray(category.product) && 
        category.product.length > 0
      );

      setProductData(filteredCategories);
      
    } catch (err) {
      console.error("Error fetching category products:", err);
      setError("Failed to load products. Please try again later.");
      setProductData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchData();
    }
  }, [categoryId]);

  // If no category ID, show error
  if (!categoryId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Category Not Found</h2>
          <p className="text-gray-600">The requested category could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="pb-10 relative">
        <div className="lg:px-40 px-0 pt-5 absolute z-10 text-white">
          <Breadcrumbs title={categoryName} />
        </div>
        <Bannear />
      </div>
      
      <div className="lg:px-[5.5rem] px-4 min-h-screen py-10">
        <div>
          {/* Error State */}
          {error && (
            <div className="text-center py-10">
              <p className="text-red-500 text-lg">{error}</p>
              <button 
                onClick={fetchData}
                className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col gap-y-10">
              {[1, 2, 3].map((item) => (
                <div key={item} className="min-h-[100px]">
                  <div className="uppercase h-[50px] center_div font-bold border px-10 mb-4 bg-gray-200 animate-pulse"></div>
                  <CarouselListLoadingSkeleton type="Product" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && productData.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
              <p className="text-gray-500">There are no products available in this category at the moment.</p>
            </div>
          )}

          {/* Success State */}
          {!loading && !error && productData.length > 0 && (
            <div className="flex flex-col gap-y-10">
              {productData.map((category, index) => {
                const subCategoryName = _.get(category, "sub_category_name", "");
                const products = _.get(category, "product", []);
                
                // Additional safety check for products array
                const validProducts = Array.isArray(products) ? products : [];

                return (
                  <div key={index} className="min-h-[100px]">
                    <h1 className="uppercase h-[50px] center_div font-bold border px-10 mb-4 flex items-center justify-center">
                      {subCategoryName}
                    </h1>
                    
                    {validProducts.length > 0 ? (
                      <GridList
                        data={validProducts}
                        type="Product"
                        productCardType="Simple"
                      />
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No products available in this sub-category
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CategoryProduct;