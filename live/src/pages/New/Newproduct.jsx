import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Breadcrumbs from "../../components/cards/Breadcrumbs";
import CarouselListLoadingSkeleton from "../../components/LoadingSkeletons/CarouselListLoadingSkeleton";
import GridList from "../../components/Lists/GridList";

const Newproduct = () => {
  const { newLaunchProduct, isGettingNewLaunchProduct } = useSelector((state) => state.publicSlice);

  const dispatch = useDispatch();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  let initialState = {
    newArrival: false,
  };

  useEffect(() => {
    dispatch({ type: "GET_ALL_CATEGORY" });
    dispatch({ type: "GET_HIGHLIGHTED_PRODUCT", data: { newArrival: true } });
  }, []);

  return (
    <div className="flex justify-center pt-5 pb-10">
      <div className="w-[80%]">
        <Breadcrumbs title={"New Launch"} />
        <div className="flex flex-col gap-y-6 pt-4">{isGettingNewLaunchProduct ? <CarouselListLoadingSkeleton title="New Launch" type="Product" /> : <GridList gridItems="3" to="/only-today" data={newLaunchProduct} type="Product" productCardType="Simple" />}</div>
      </div>
    </div>
  );
};

export default Newproduct;
