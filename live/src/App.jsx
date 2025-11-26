import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./config/Router.jsx";
import { useDispatch, useSelector } from "react-redux";
import { ConfigProvider, Spin } from "antd";

import { CartProvider } from "./helper/Carthelper.jsx";
import AOS from 'aos';
import 'aos/dist/aos.css'; // AOS styles
const App = () => {
  //config
  const dispatch = useDispatch();

  //redux
  const { isAuthenicating } = useSelector((state) => state.authSlice);


  useEffect(() => {
    const result = dispatch({ type: "CHECK_LOGIN" });

  }, []);
  // aos animation
  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 800, // Animation duration
      easing: 'ease-in-out', // Easing type
      once: true, // Whether animation should happen only once
    });
  }, []);

  return (
    <div className={`${isAuthenicating && "h-screen center_div"}`}>
        <CartProvider>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#0369a1",
            },
          }}
        >
          <Spin spinning={isAuthenicating}>{!isAuthenicating && <RouterProvider router={router} />}</Spin>
        </ConfigProvider>
        </CartProvider>
    </div>
  );
};

export default App;
