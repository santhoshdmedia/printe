/* eslint-disable no-unused-vars */
import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./Layout";
import LogoLoader from "../components/reusable/LogoLoader.jsx";

// ─── Route-level code splitting ────────────────────────────────────────────
// Every page below used to be a static import, meaning visiting the
// homepage downloaded the JS for Login, Checkout, Payment, every policy
// page, etc. all at once. Converting these to React.lazy() means each
// route's code only downloads when that route is actually visited.
const Home = lazy(() => import("../pages/Home/Home"));
const Product = lazy(() => import("../pages/Product/Product"));
const Contact = lazy(() => import("../pages/Contact/Contact"));
const Information = lazy(() => import("../pages/Information/Information"));
const Login = lazy(() => import("../pages/Login/Login.jsx"));
const Signup = lazy(() => import("../pages/Signup/Signup.jsx"));
const Account = lazy(() => import("../pages/Account/Account.jsx"));
const Profile = lazy(() => import("../components/Account/Profile.jsx"));
const ManageAddress = lazy(() => import("../components/Account/ManageAddress.jsx"));
const Settings = lazy(() => import("../components/Account/Settings.jsx"));
const UserOrders = lazy(() => import("../components/Account/UserOrders.jsx"));
const WishList = lazy(() => import("../components/Account/WishList.jsx"));
const CategoryProduct = lazy(() => import("../pages/CategoryProduct/CategoryProduct.jsx"));
const CheckOut = lazy(() => import("../pages/CheckOut/CheckOut.jsx"));
const OrderDetails = lazy(() => import("../components/Account/OrderDetails.jsx"));
const BannerProduct = lazy(() => import("../pages/BannerProduct/BannerProduct.jsx"));
const Help = lazy(() => import("../components/Home/Help.jsx"));
const Careers = lazy(() => import("../components/Home/Careers.jsx"));
const BlogDetails = lazy(() => import("../pages/blogs/BlogDetails.jsx"));
const AllCategory = lazy(() => import("../components/Category/AllCategory.jsx"));
const Blog = lazy(() => import("../pages/blogs/Blog.jsx"));
const Forgetpassword = lazy(() => import("../pages/Login/Forgetpassword.jsx"));
const ResetPassword = lazy(() => import("../pages/Login/ResetPassword.jsx"));
const NotFound = lazy(() => import("../pages/Notfound/NotFound.jsx"));
const SubcategoryProduct = lazy(() => import("../pages/CategoryProduct/SubcategoryProduct.jsx"));
const Onlytoday = lazy(() => import("../pages/Only/Onlytoday.jsx"));
const Newproduct = lazy(() => import("../pages/New/Newproduct.jsx"));
const Popularproduct = lazy(() => import("../pages/Popular/Popularproduct.jsx"));
const ShoppingCart = lazy(() => import("../pages/shopping/ShoppingCart.jsx"));
const NewCheckout = lazy(() => import("../pages/shopping/NewCheckout.jsx"));
const SectionExplore = lazy(() => import("../pages/Home/SectionExplore.jsx"));
const HistoryExplore = lazy(() => import("../pages/Product/HistoryExplore.jsx"));
const AboutUs = lazy(() => import("../pages/Information/AboutUs.jsx"));
const CustomerPaymentPage = lazy(() => import("../pages/Payment/CustomerPaymentPage.jsx"));

const Reward = lazy(() => import("../components/Account/Reward.jsx"));

// payment
const PaymentCancelled = lazy(() => import("../pages/shopping/pay/PaymentCancelled.jsx"));
const PaymentFailed = lazy(() => import("../pages/shopping/pay/PaymentFailled.jsx"));
const PaymentSuccess = lazy(() => import("../pages/shopping/pay/PaymentSuccess.jsx"));
const PaymentMethod = lazy(() => import("../components/CheckOut/PaymentMethod.jsx"));
const PaymentError = lazy(() => import("../pages/shopping/pay/PaymentError.jsx"));
const WarrantyActivation = lazy(() => import("../pages/warrenty/Warrenty.jsx"));

// policy
const ReturnPolicy = lazy(() => import("../pages/policys/ReturnPolicy.jsx"));
const ShippingPolicy = lazy(() => import("../pages/policys/ShippingPolicy.jsx"));
const TermsAndConditions = lazy(() => import("../pages/policys/TermsAndConditions.jsx"));
const CancellationPolicy = lazy(() => import("../pages/policys/CancellationPolicy.jsx"));
const PrivacyPolicy = lazy(() => import("../pages/policys/PrivacyPolicy.jsx"));

// BNI
const BniLogin = lazy(() => import("../pages/Signup/BniLogin.jsx"));
const BniProduct = lazy(() => import("../pages/CategoryProduct/BniProduct.jsx"));
const AcBNi = lazy(() => import("../pages/CategoryProduct/AcBNi.jsx"));
const SearchProduct = lazy(() => import("../pages/search/SearchProduct.jsx"));

// Shared fallback shown for the brief moment a route chunk is downloading.
// Branded with the logo so route transitions feel intentional rather than
// like a stalled page. Most chunks are small enough this rarely shows.
const RouteFallback = () => <LogoLoader fullScreen size={64} />;

// Wrap every route element in the same Suspense boundary so lazy chunks
// resolve consistently regardless of where the route sits in the tree.
const s = (el) => <Suspense fallback={<RouteFallback />}>{el}</Suspense>;

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/:id", element: s(<ResetPassword />) },
      { path: "/shopping-cart", element: s(<ShoppingCart />) },
      { path: "/checkout", element: s(<NewCheckout />) },
      { path: "/blogs", element: s(<Blog />) },
      { path: "/all-categories", element: s(<AllCategory />) },
      { path: "/blog-details/:slug", element: s(<BlogDetails />) },
      { path: "/", element: s(<Home />) },
      { path: "/product/:id", element: s(<Product />) },
      { path: "/category/:category/:id", element: s(<SubcategoryProduct />) },
      { path: "/products", element: s(<BniProduct />) },
      { path: "/category/:id", element: s(<CategoryProduct />) },
      { path: "/contact-us", element: s(<Contact />) },
      { path: "/see-more/:section_name/:id", element: s(<SectionExplore />) },
      { path: "/check-out", element: s(<CheckOut />) },
      { path: "/banner-product/:id", element: s(<BannerProduct />) },
      { path: "/help", element: s(<Help />) },
      { path: "/careers", element: s(<Careers />) },
      { path: "/recent-Products", element: s(<HistoryExplore />) },
      { path: "/only-today", element: s(<Onlytoday />) },
      { path: "/search", element: s(<SearchProduct />) },
      { path: "/new-product", element: s(<Newproduct />) },
      { path: "/popular-product", element: s(<Popularproduct />) },
      { path: "/terms-&-conditions", element: s(<TermsAndConditions />) },
      { path: "/privacy-policy", element: s(<PrivacyPolicy />) },
      { path: "/return-policy", element: s(<ReturnPolicy />) },
      { path: "/cancelling-policy", element: s(<CancellationPolicy />) },
      { path: "/shipping-&-delivery-policy", element: s(<ShippingPolicy />) },
      { path: "/about-us", element: s(<AboutUs />) },
      {
        path: "/account",
        element: s(<Account />),
        children: [
          { path: "", element: <Navigate to="profile" replace /> },
          { path: "profile", element: s(<Profile />) },
          { path: "manage-addresses", element: s(<ManageAddress />) },
          { path: "settings", element: s(<Settings />) },
          { path: "my-orders", element: s(<UserOrders />) },
          { path: "BNI", element: s(<AcBNi />) },
          { path: "reward", element: s(<Reward />) },
          { path: "wishlist", element: s(<WishList />) },
          { path: "my-orders/:order_id", element: s(<OrderDetails />) },
          { path: "Warranty", element: s(<WarrantyActivation />) },
        ],
      },
    ],
  },
  { path: "/login", element: s(<Login />) },
  // BNI
  { path: "/BNI/Signup", element: s(<BniLogin />) },
  { path: "/sign-up", element: s(<Signup />) },
  { path: "/forget-password", element: s(<Forgetpassword />) },
  { path: "/reset-password/:id", element: s(<ResetPassword />) },

  { path: "/not-found", element: s(<NotFound />) },
  { path: "*", element: s(<NotFound />) },
  { path: "/payment/cancelled", element: s(<PaymentCancelled />) },
  { path: "/payment/success", element: s(<PaymentSuccess />) },
  { path: "/payment/failed", element: s(<PaymentFailed />) },
  { path: "/payment/error", element: s(<PaymentError />) },
  { path: "/payment/:invoice_no", element: s(<CustomerPaymentPage />) },
]);
