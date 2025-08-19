import React from 'react'
import CheckOutProductCard from './CheckOutProductCard'

const CheckOutProduct = ({products}) => {
  return (
    <div className='flex flex-col gap-3'>
      <CheckOutProductCard data={products}/>
      {/* <CheckOutProductCard/> */}
    </div>
  )
}

export default CheckOutProduct
