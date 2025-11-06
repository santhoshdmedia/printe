/* eslint-disable no-unused-vars */
import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./Layout";
import Home from "../pages/Home/Home";
import Product from "../pages/Product/Product";
import Contact from "../pages/Contact/Contact";
import Information from "../pages/Information/Information";
import { termsAndConditions, privacyPolicy, returnPolicy, cancellingPolicy, aboutUs, shippingAndDeliveryPolicy } from "../../data.js";
import Login from "../pages/Login/Login.jsx";
import Signup from "../pages/Signup/Signup.jsx";
import Account from "../pages/Account/Account.jsx";
import Profile from "../components/Account/Profile.jsx";
import ManageAddress from "../components/Account/ManageAddress.jsx";
import Settings from "../components/Account/Settings.jsx";
import UserOrders from "../components/Account/UserOrders.jsx";
import WishList from "../components/Account/WishList.jsx";
import CategoryProduct from "../pages/CategoryProduct/CategoryProduct.jsx";
import CheckOut from "../pages/CheckOut/CheckOut.jsx";
import OrderDetails from "../components/Account/OrderDetails.jsx";
import BannerProduct from "../pages/BannerProduct/BannerProduct.jsx";
import Help from "../components/Home/Help.jsx";
import Careers from "../components/Home/Careers.jsx";
import BlogDetails from "../pages/blogs/BlogDetails.jsx";
import AllCategory from "../components/Category/AllCategory.jsx";
import Blog from "../pages/blogs/Blog.jsx";
import Forgetpassword from "../pages/Login/Forgetpassword.jsx";
import ResetPassword from "../pages/Login/ResetPassword.jsx";
import NotFound from "../pages/Notfound/NotFound.jsx";
import SubcategoryProduct from "../pages/CategoryProduct/SubcategoryProduct.jsx";
import Onlytoday from "../pages/Only/Onlytoday.jsx";
import Newproduct from "../pages/New/Newproduct.jsx";
import Popularproduct from "../pages/Popular/Popularproduct.jsx";
import ShoppingCart from "../pages/shopping/ShoppingCart.jsx";
import NewCheckout from "../pages/shopping/NewCheckout.jsx";
import SectionExplore from "../pages/Home/SectionExplore.jsx";
import HistoryExplore from "../pages/Product/HistoryExplore.jsx";
import AboutUs from "../pages/Information/AboutUs.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/shopping-cart", element: <ShoppingCart /> },
      { path: "/checkout", element: <NewCheckout /> },
      { path: "/blogs", element: <Blog /> },
      { path: "/all-categories", element: <AllCategory /> },
      { path: "/blog-details/:id", element: <BlogDetails /> },
      { path: "/", element: <Home /> },
      { path: "/product/:id", element: <Product /> },
      { path: "/category/:category/:id", element: <CategoryProduct /> },
      { path: "/category/:category/:subcategory/:categoryid/:id", element: <SubcategoryProduct /> },
      { path: "/contact-us", element: <Contact /> },
      { path: "/see-more/:section_name/:id", element: <SectionExplore /> },
      { path: "/check-out", element: <CheckOut /> },
      { path: "/banner-product/:id", element: <BannerProduct /> },
      { path: "/help", element: <Help /> },
      { path: "/careers", element: <Careers /> },
      { path: "/recent-Products", element: <HistoryExplore /> },
      {
        path: "/only-today",
        element: <Onlytoday />,
      },
      {
        path: "/new-product",
        element: <Newproduct />,
      },
      {
        path: "/popular-product",
        element: <Popularproduct />,
      },
      {
        path: "/terms-&-conditions",
        element: <Information data={termsAndConditions} subHeadingAvailable={true} />,
      },
      {
        path: "/privacy-policy",
        element: <Information data={privacyPolicy} />,
      },
      {
        path: "/return-policy",
        element: <Information data={returnPolicy} subHeadingAvailable={true} />,
      },
      {
        path: "/cancelling-policy",
        element: <Information data={cancellingPolicy} subHeadingAvailable={true} />,
      },
      {
        path: "/shipping-&-delivery-policy",
        element: <Information data={shippingAndDeliveryPolicy} subHeadingAvailable={true} />,
      },
      {
        path: "/about-us",
        element: <AboutUs/>,
      },
      {
        path: "/account",
        element: <Account />,
        children: [
          {
            path: "",
            element: <Navigate to="profile" replace />,
          },
          { path: "profile", element: <Profile /> },
          { path: "manage-addresses", element: <ManageAddress /> },
          { path: "settings", element: <Settings /> },
          {
            path: "my-orders",
            element: <UserOrders />,
          },
          { path: "wishlist", element: <WishList /> },
          {
            path: "my-orders/:order_id",
            element: <OrderDetails />,
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/sign-up",
    element: <Signup />,
  },
  {
    path: "/forget-password",
    element: <Forgetpassword />,
  },
  {
    path: "/reset-password/:id",
    element: <ResetPassword />,
  },
  {
    path: "/not-found",
    element: <NotFound />,
  },
]);
