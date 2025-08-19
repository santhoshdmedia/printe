import React, { useEffect, useState } from "react";
import Breadcrumbs from "../../components/cards/Breadcrumbs";
import { useDispatch, useSelector } from "react-redux";
import CarouselListLoadingSkeleton from "../../components/LoadingSkeletons/CarouselListLoadingSkeleton";
import GridList from "../../components/Lists/GridList";

const Popularproduct = () => {
  const { isGettingPopularProduct, popularProduct } = useSelector((state) => state.publicSlice);

  const dispatch = useDispatch();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  let initialState = {
    popular: false,
  };

  const [loadMore, setLoadMore] = useState(initialState);

  useEffect(() => {
    dispatch({ type: "GET_ALL_CATEGORY" });
    dispatch({ type: "GET_HIGHLIGHTED_PRODUCT", data: { popular: true } });
  }, []);

  return (
    <div className="flex justify-center pt-5 pb-10">
      <div className="w-[80%]">
        <Breadcrumbs title={"Popular Product"} />
        <div className="flex flex-col gap-y-6 pt-4">{isGettingPopularProduct ? <CarouselListLoadingSkeleton title="Popular Product" type="Product" /> : <GridList data={popularProduct} type="Product" productCardType="Simple" />}</div>
      </div>
    </div>
  );
};

export default Popularproduct;
