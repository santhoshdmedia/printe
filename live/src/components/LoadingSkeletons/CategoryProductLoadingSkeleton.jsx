import React from 'react'
import CarouselListLoadingSkeleton from './CarouselListLoadingSkeleton';

const CategoryProductLoadingSkeleton = () => {
    const list = new Array(3).fill(0);
  return (
    <div className='flex flex-col gap-10 mt-5'>
      {list.map((_,index)=>(
        <div key={index}>
            <CarouselListLoadingSkeleton type='Product'/>
        </div>
      ))}
    </div>
  )
}

export default CategoryProductLoadingSkeleton
