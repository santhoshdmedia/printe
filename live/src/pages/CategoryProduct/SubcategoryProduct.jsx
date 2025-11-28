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
      
      // Filter products where is_visible is true
      const filteredProducts = _.get(result, "data.data", []).filter(
        product => product.is_visible === true
      );
      
      setProductData(filteredProducts);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [_.get(params, "id", "")]);

  // Fixed sorting logic - sort by customer price in ascending order
  const sortedProducts = [...productDatas].sort((a, b) => {
    // Helper function to get customer price from product
    const getCustomerPrice = (product) => {
      // For variable products with variants_price array
      if (product.type === "Variable Product" && 
          product.variants_price && 
          product.variants_price.length > 0) {
        // Find the minimum price among variants
        const variantPrices = product.variants_price
          .map(variant => parseFloat(variant.customer_product_price) || 0)
          .filter(price => price > 0);
        
        return variantPrices.length > 0 ? Math.min(...variantPrices) : 0;
      }
      
      // For stand alone products or products without variants
      return parseFloat(product.customer_product_price) || 0;
    };

    const priceA = getCustomerPrice(a);
    const priceB = getCustomerPrice(b);
    

    return priceA - priceB; // Ascending order (lowest to highest)
  });


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="">
        {/* Header Section with Breadcrumbs */}

        {/* Banner Section - Fixed image display */}
        {_.get(productDatas, "[0].sub_category_details.sub_category_banner_image", "") && (
          <div className="">
            <div className=" overflow-hidden shadow-lg bg-gray-200 flex items-center justify-center max-h-[600px]  max-w-[1800px] mx-auto">
              <img 
                src={_.get(productDatas, "[0].sub_category_details.sub_category_banner_image", "")} 
                className="w-full h-auto  object-[100%]" 
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
      </div>
      
      <div className="lg:px-40 px-4 py-6  w-full bg-[#ffffff13] z-10 ">
        <Breadcrumbs 
          title={_.get(params, "category", "")} 
          titleto={`/category/${_.get(params, "category", "")}/${_.get(params, "categoryid", "")}`} 
          title2={_.get(params, "subcategory", "")} 
        />
      </div>

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
        <div>
          {loading ? (
            <CarouselListLoadingSkeleton type="Product" />
          ) : (
            <>
              {sortedProducts.length > 0 ? (
                <GridList data={sortedProducts} type="Product" productCardType="Simple" />
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