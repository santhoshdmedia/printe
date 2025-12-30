import { useParams } from "react-router-dom";
import Breadcrumbs from "../../components/cards/Breadcrumbs";
import { useEffect, useState } from "react";
import { getAllSubCategoryProducts,getAllProduct } from "../../helper/api_helper";
import _ from "lodash";
import GridList from "../../components/Lists/GridList";
import CarouselListLoadingSkeleton from "../../components/LoadingSkeletons/CarouselListLoadingSkeleton";

const BniProduct = () => {
  const params = useParams();

  const [productDatas, setProductData] = useState([]);
  const [bannearDatas, setBannearDatas] = useState("");

  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result =  _.get(params, "id", "");
      
      const subcategoryResult = await getAllProduct();
      setBannearDatas(subcategoryResult.data.data.sub_category_banner_image)

      const newproducts=await getAllProduct();
      console.log(newproducts.length,"bni");
      
      // Filter products where is_visible is true
      const filteredProducts = _.get(newproducts, "data.data", []).filter(
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

  const BnisortedProducts=sortedProducts.filter((product)=>product.is_Bni) 


  return (
    <div className="min-h-screen bg-gray-50">
      
      
      <div className="lg:px-40 px-4 py-6  w-full bg-[#ffffff13] z-10 ">
        <Breadcrumbs 
          title="BNI" 
          titleto={`/products`} 
        //   title2={_.get(params, "subcategory", "")} 
        />
      </div>

      {/* Content Section */}
      <div className="lg:px-40 px-4 py-8">
        {/* Category Header */}
       

        {/* Products Grid */}
        <div>
          {loading ? (
            <CarouselListLoadingSkeleton type="Product" />
          ) : (
            <>
              {sortedProducts.length > 0 ? (
                <GridList data={sortedProducts} gridItems="3" type="Product" productCardType="Simple" />
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

export default BniProduct;