import React, { useEffect, useState } from "react";
import Breadcrumbs from "../../components/cards/Breadcrumbs";
import { useDispatch, useSelector } from "react-redux";
import CarouselListLoadingSkeleton from "../../components/LoadingSkeletons/CarouselListLoadingSkeleton";
import GridList from "../../components/Lists/GridList";

const Onlytoday = () => {
  const { isGettingOnlyForTodayProduct, onlyForTodayProduct } = useSelector((state) => state.publicSlice);

  const dispatch = useDispatch();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  let initialState = {
    onlyForToday: false,
  };

  const [loadMore, setLoadMore] = useState(initialState);

  useEffect(() => {
    dispatch({ type: "GET_ALL_CATEGORY" });
    dispatch({ type: "GET_HIGHLIGHTED_PRODUCT", data: { onlyForToday: true } });
  }, []);

  return (
    <div className="flex justify-center pt-5 pb-10">
      <div className="w-[80%]">
        <Breadcrumbs title={"Only For Today"} />
        <div className="flex flex-col gap-y-6 pt-4">{isGettingOnlyForTodayProduct ? <CarouselListLoadingSkeleton title="Only For Today" type="Product" /> : <GridList gridItems="3" to="/only-today" data={onlyForTodayProduct} type="Product" productCardType="Simple" />}</div>
      </div>
    </div>
  );
};

export default Onlytoday;
