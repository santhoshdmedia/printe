import React from 'react'
import { LuMail } from "react-icons/lu";
import { GrMapLocation } from "react-icons/gr";
import { IconHelper } from '../../helper/IconHelper';
const Contact = () => {
  return (
    <div className='px-40 pt-10'>
      <div>
        <h1 className='title text-center text-primary'>Help Center</h1>
        <ul className='flex justify-between items-center p-10 text-center'>
            <li className='center_div flex-col '>
                <LuMail size={200} className=''/>
                <h3 className='sub_title'>E-mail us</h3>
                <p className='text-gray-500'>sales enquiries and customer support:</p>
                <p className='text-gray-500'>info@printe.in</p>
            </li>
            <li className='center_div flex-col '>
                <IconHelper.PHONE_CALL_ICON size={180}/>
                <h3 className='sub_title'>Call us for Queries</h3>
                <p className='text-gray-500'>Helpdest: +91 7373610000 </p>
                <p className='text-gray-500'>(Mon-Sat:10:00 AM - 7:00 PM)</p>
            </li>
            <li  className='center_div flex-col '>
                <GrMapLocation size={200}/>
                <h3 className='sub_title'>Postal address</h3>
                <p className='text-gray-500'>Printe.</p>
                <p className='text-gray-500 text-wrap'>No 8, Church Colony Vayalur main road, <br/>Trichy 620017. Tamilnadu,India.</p>
            </li>
        </ul>
      </div>
    </div>
  )
}

export default Contact
