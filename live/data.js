import designerAppDesImg1 from "./src/assets/online_designer_app_illu.png";
import designerAppDesImg2 from "./src/assets/powerful_admin_illu.png";
import img1 from "./src/assets/Acrylic Direct Print photo frame/Image 2024-12-03 at 13.24.13_33bf4915.jpg";
import img2 from "./src/assets/Acrylic Direct Print photo frame/WhatsApp Image 2024-12-03 at 13.24.14_39c94a43.jpg";
import img3 from "./src/assets/Acrylic Direct Print photo frame/WhatsApp Image 2024-12-03 at 13.24.15_d4801723.jpg";
import launch_product2 from "./src/assets/Arcylic Reverse Light Boards/IMG-20241203-WA0006.jpg";
import launch_product2_2 from "./src/assets/Arcylic Reverse Light Boards/IMG-20241203-WA0007.jpg";
import launch_product2_3 from "./src/assets/Arcylic Reverse Light Boards/IMG-20241203-WA0008.jpg";
import launch_product2_4 from "./src/assets/Arcylic Reverse Light Boards/IMG-20241203-WA0009.jpg";
import launch_product3  from "./src/assets/Milled Out Board/IMG-20241203-WA0010.jpg";
import launch_product3_2 from "./src/assets/Milled Out Board/IMG-20241203-WA0011.jpg";
import launch_product3_3 from "./src/assets/Milled Out Board/IMG-20241203-WA0012.jpg";
import launch_product3_4 from "./src/assets/Milled Out Board/IMG-20241203-WA0013.jpg";
import launch_product4 from "./src/assets/Roll Up Standees/img1.jpg";
import launch_product4_2 from "./src/assets/Roll Up Standees/img2.jpg";
import launch_product4_3 from "./src/assets/Roll Up Standees/img3.jpg";
import launch_product5 from "./src/assets/Table top acrylic/img1.jpg";
import launch_product5_2 from "./src/assets/Table top acrylic/img2.jpg";
import launch_product6 from "./src/assets/Sunboard Poster/IMG-20241203-WA0016.jpg";
import launch_product6_2 from "./src/assets/Sunboard Poster/IMG-20241203-WA0015.jpg";
import launch_product6_3 from "./src/assets/Sunboard Poster/IMG-20241203-WA0017.jpg";
import launch_product6_4 from "./src/assets/Sunboard Poster/IMG-20241203-WA0018.jpg";
import launch_product6_5 from "./src/assets/Sunboard Poster/IMG-20241203-WA0019.jpg";
import browse_all_category1 from "./src/assets/Browse All Category/browse_all_category1.png";
import browse_all_category2 from "./src/assets/Browse All Category/browse_all_category2.png";
import browse_all_category3 from "./src/assets/Browse All Category/browse_all_category3.png";
import browse_all_category4 from "./src/assets/Browse All Category/browse_all_category4.png";
import browse_all_category5 from "./src/assets/Browse All Category/browse_all_category5.png";
import browse_all_category6 from "./src/assets/Browse All Category/browse_all_category6.png";
import browse_all_category7 from "./src/assets/Browse All Category/browse_all_category7.png";
import browse_all_category8 from "./src/assets/Browse All Category/browse_all_category8.png";
import banner_1 from "./src/assets/CarouselBanner/banner1.webp";
import banner_2 from "./src/assets/CarouselBanner/banner2.webp";
import banner_3 from "./src/assets/CarouselBanner/banner3.webp";
import banner_4 from "./src/assets/CarouselBanner/banner4.webp";
import { CiShoppingCart } from "react-icons/ci";
import { MdOutlineRefresh, MdOutlineSecurity } from "react-icons/md";
import { GoTrophy } from "react-icons/go";
import { ImageHelper } from "./src/helper/ImageHelper";
import { BiSolidMapPin } from "react-icons/bi";

export const SimilarProduct = {
  name: "Similar Product",
  key: "submenu1",
  children: [
    {
      name: "Calendars & Diaries",
      key: "submenu1-setting1",
      img: img1,
      color: "red",
      label: "",
      price: 200,
    },
    {
      name: "Crew Neck Sweatshirt",
      key: "submenu1-setting2",
      img: launch_product2,
      color: "blue",
      label: "new",
      price: 234,
    },
    {
      name: "Rigid Boxes",
      key: "submenu1-setting3",
      img: launch_product3,
      color: "pink",
      label: "",
      price: 134,
    },
    {
      name: "Mono Carton Boxes",
      key: "submenu1-setting4",
      img: launch_product4,
      color: "yellow",
      label: "",
      price: 234,
    },
    {
      name: "Promotional Drinkware",
      key: "submenu1-setting5",
      img: launch_product5,
      color: "green",
      label: "popular",
      price: 284,
    },
    {
      name: "M&S T-Shirts",
      key: "submenu1-setting5",
      img: launch_product6,
      color: "blue",
      label: "popular",
      price: 344,
    },
  ],
};

export const browse_all_category = {
  name: "Browse All Category",
  children: [
    {
      name: "Business Card",
      img: browse_all_category2,
    },
    {
      name: "Stationary",
      img: browse_all_category3,
    },
    {
      name: "Corporate Gift",
      img: browse_all_category4,
    },
    {
      name: "Apparel",
      img: browse_all_category1,
    },
    {
      name: "Photo gift",
      img: browse_all_category5,
    },
    {
      name: "Sticker Label",
      img: browse_all_category6,
    },
    {
      name: "Packaging",
      img: browse_all_category7,
    },
    {
      name: "Signages",
      img: browse_all_category8,
    },
  ],
};

export const designerAppDescription = [
  {
    id: 1,
    title: "Online Designer App",
    img: designerAppDesImg1,
    children: [
      {
        title: "Design any kind of product",
        description:
          "Transform any product with our versatile tool, offering complete customization freedom. Design apparel, accessories, and more with an intuitive interface that combines all essential features into one seamless solution. Bring your unique visions to life effortlessly.",
      },
      {
        title: "Advanced Colour System",
        description:
          "Elevate designs using our advanced color picker tool, granting users the freedom to select any shade or choose from a curated palette for each layer. Sync colors across text and images for unified designs, with the option to limit choices, ensuring a tailored and satisfying design journey.",
      },
      {
        title: "Many Customization Options",
        description:
          "Elevate your products with Fancy Product Designer’s advanced customization. Effortlessly upload images from social media or any device, and dive into extensive text and image transformation options. With custom fonts, color adjustments, and other design features create distinct, personalized items effortlessly.",
      },
      {
        title: "Modular & Responsive",
        description:
          "Fancy Product Designer revolutionizes customization with its modular approach, adapting to your specific needs. Enjoy full responsiveness on any device, comprehensive customization options, and easy translation into any language, setting a new standard for user-friendly, versatile design tools.",
      },
    ],
  },
  {
    id: 2,
    title: "Powerful Admin",
    img: designerAppDesImg2,
    children: [
      {
        title: "Versatile Product Backend",
        description:
          "With Fancy Product Designer, effortlessly craft customizable products, adding multiple views for each product. Tailor every view with specific elements like images, texts, and upload zones. From simple, single-text modifications to complex, multi-layered designs, unlock the potential to create a wide range of customized offerings.",
      },
      {
        title: "Streamlined Order Management",
        description:
          "View and manage orders with customized products effortlessly in our order viewer. Edit orders or export them in various formats (PDF, JPEG, PNG) and sizes. Enhance efficiency with our professional extensions for automated print file exports, including direct import to Dropbox or AWS S3 for new orders",
      },
      {
        title: "Tailor Your Design Interface",
        description:
          "Customize your Product Designer’s interface to perfectly match your website and products. Adjust size, color, and position of elements or select from predefined layouts for optimal display. Choose how the designer appears—directly on the page or via a click, enhancing user interaction and design flow.",
      },
      {
        title: "Intelligent Price Adjustments",
        description:
          "Set dynamic pricing for your products with Fancy Product Designer, allowing different charges for materials, colors, texts, images, and graphics. Assign prices by layer, type, or product view, giving you the freedom to price designs uniquely—whether it’s for a special feature on the back of a shirt or a standard front design.",
      },
    ],
  },
];

export const FrequentlyAskedQuestions = {
  name: "Frequently Asked Questions",
  children: [
    {
      key: "1",
      label: "How do I order my product?",
      children:
        "To order from our website, browse the catalog, select the product you want, add it to the cart, and proceed to checkout to place your order.",
    },
    {
      key: "2",
      label: "How can I customize my own design?",
      children:
        "Check if customization options are available for the product. If so, upload your design or provide specific instructions during the ordering process.",
    },
    {
      key: "3",
      label: "Can I place a single order and receive it in multiple shipments?",
      children:
        "Yes, depending on availability, your order may be shipped in multiple packages. You will be notified of the shipments separately.",
    },
    {
      key: "4",
      label: "What if I canâ€™t find the product Iâ€™m looking for?",
      children:
        "Use the search bar or contact customer support for help. They may assist you in locating or suggesting similar products.",
    },
    {
      key: "5",
      label: "What payment methods can I use?",
      children:
        "Common payment options include credit/debit cards, net banking, digital wallets, UPI, and cash on delivery (if available).",
    },
    {
      key: "6",
      label: "What EMI options are available?",
      children:
        "EMI options depend on your payment method and provider. Check at checkout for applicable plans with your card or payment service.",
    },
    {
      key: "7",
      label: "How do I get a refund if I cancel my order?",
      children:
        "Refunds are usually processed to the original payment method within a few days after cancellation, based on the policy.",
    },
    {
      key: "8",
      label: "Where can I find information about shipping costs?",
      children:
        "Shipping costs are shown during checkout or on the product page. Free shipping may apply to certain orders.",
    },
    {
      key: "9",
      label: "Can I change my delivery address after placing an order?",
      children:
        "You can change the address only if the order hasnâ€™t been shipped. Contact customer support immediately for assistance.",
    },
    {
      key: "10",
      label: "Is there a cancellation fee?",
      children:
        "Cancellation fees depend on the policy. Some orders may have no fee, while others might charge a small amount if processed.",
    },
  ],
};

export const stepProcess = [
  {
    id: 1,
    icon: BiSolidMapPin,
    title: "Worldwide Shipping",
    content: "Send Thoughtful Gifts",
  },
  {
    id: 2,
    icon: MdOutlineRefresh,
    title: "Hassle-Free Process",
    content: "Sit Back and Relax",
  },
  {
    id: 3,
    icon: MdOutlineSecurity,
    title: "Secure Payments",
    content: "100% secure Payments",
  },
  {
    id: 4,
    icon: GoTrophy,
    title: "Best Quality",
    content: "Original Product Quality",
  },
];

export const navItems = [
  { name: "Home", link: "/" },
  { name: "About Us", link: "/about-us" },
  { name: "Blog", link: "/blogs" },
  { name: "Help", link: "/help" },
  { name: "Careers", link: "/careers" },
  { name: "My Account", link: "/account" },
];

export const footerItems = [
  {
    title: "Our Company",
    sub: [
      { value: "Home", link: "/" },
      { value: "About Us", link: "/about-us" },
      { value: "Blog", link: "/blogs" },
    ],
  },
  {
    title: "Support",
    sub: [
      { value: "My Account", link: "/account" },
      { value: "Track Order", link: "/account/my-orders" },
      { value: "Help", link: "/help" },
     
    ],
  },
  {
    title: "Important Links",
    sub: [
      { value: "Privacy Policy", link: "/privacy-policy" },
      { value: "Terms & Conditions", link: "/terms-&-conditions" },
      {
        value: "Shipping & Delivery Policy",
        link: "/shipping-&-delivery-policy",
      },
    ],
  },
  {
    title: "Helpful",
    sub: [
      { value: "Return Policy", link: "/return-policy" },
      { value: "Cancelling Policy", link: "/cancelling-policy" },
      { value: "Careers", link: "/careers" },
    ],
  },
];

export const cancellingPolicy = [
  {
    title: "Cancellation Policy",
    desc: "At Printe, we strive to ensure that every customer receives the highest level of service and satisfaction. However, we understand that circumstances may arise where you may need to cancel an order. Please review our cancellation policy below:",
    children: [
      {
        title: "Order Cancellation Request",
        desc: `Cancellations can only be made if the order has not yet been processed or printed.
If your order is still in the initial stages of production (designing or pre-press), you may request a cancellation within 24 hours of placing the order.`,
      },
      {
        title: "Cancellation Process",
        desc: `To cancel an order, please contact our customer support team at [99999 99999 / xxxxxx@printe.com] as soon as possible.
Provide your order details (order number, customer name, and reason for cancellation) to help us process your request quickly.
`,
      },
      {
        title: "Refund Policy",
        desc: `If your cancellation request is approved, a full refund will be issued if the order has not been processed.
If the order has already been printed or shipped, no refund will be provided. Any cancellation after production has started may incur a partial refund, depending on the stage of the printing process.
`,
      },
      {
        title: "Non-Cancelable Items",
        desc: `Some custom-made products, such as personalized gifts, custom-designed prints, and bulk orders, may not be eligible for cancellation once production has begun.`,
      },
      {
        title: "Changes to the Order",
        desc: `If you need to make changes to an order (such as adjustments to the design, quantity, or delivery address), please contact us immediately before production begins. Once the order has entered production, changes may not be possible.
We encourage all customers to review their orders carefully before finalizing them to avoid the need for cancellations.
`,
      },
      {
        title: "",
        desc: `If you have any questions or concerns, don’t hesitate to reach out to our customer support team for assistance.`,
      },
    ],
  },
];

export const blogItems = [
  {
    coverImg:
      "https://i0.wp.com/printo.in/blog/wp-content/uploads/2024/03/Reasearch-Blog-banner.jpg?fit=1920%2C1080&ssl=1",
    title: "7 Ways to Stand-Out at Your Next Tradeshow or Conference",
  },
  {
    coverImg:
      "https://i0.wp.com/printo.in/blog/wp-content/uploads/2023/07/Banner.png?fit=1920%2C1080&ssl=1",
    title: "5 Reasons why Signage is Important for your Business",
  },
];

export const termsAndConditions = [
  {
    title: "Terms and Conditions",
    desc: `Welcome to Printe! By accessing and using our website and services, you agree to comply with the following terms and conditions. Please read them carefully before placing an order or using our website. These terms govern your use of Printe’s services and products.`,
    children: [
      {
        title: "Acceptance of Terms",
        desc: `By using Printe’s website or services, you agree to these Terms and Conditions. If you do not agree with any part of these terms, please refrain from using our services.`,
      },
      {
        title: "Services Provided",
        desc: "Printe offers custom designing and printing services, which include but are not limited to business cards, brochures, invitations, custom gifts, banners, vinyl stickers, and more. Our products are made to order, based on the specifications and designs provided by you, the customer.",
      },
      {
        title: "Account Registration",
        desc: `To place an order, you may be required to register for an account with us. You agree to provide accurate and complete information during registration and to keep your account details secure. You are responsible for all activities under your account.`,
      },
      {
        title: "Order Confirmation",
        desc: `After placing an order, you will receive an order confirmation via email. This confirmation is an acknowledgment of your order but does not constitute acceptance of your order. Printe reserves the right to cancel any order for reasons such as product unavailability or errors in pricing or product information.`,
      },
      {
        title: "Pricing and Payment",
        desc: "All prices listed on our website are in [INR] and are subject to change without notice. Payment for orders is due at the time of placing the order. We accept various payment methods, which may include credit cards, debit cards, and online payment options.",
      },
      {
        title: "Customization and Design",
        desc: "You are responsible for providing accurate and final design files or specifications for customized products. Printe is not liable for errors in the final product resulting from incorrect or unclear instructions provided by you. Any changes or corrections to the design after order confirmation may incur additional charges.",
      },
      {
        title: "Production and Delivery",
        desc: "Once an order is placed, production will begin as per the agreed timeline. Delivery times are estimates and may vary based on factors such as order complexity, customization, and location. We offer delivery services to various locations, and delivery charges will be added to your total order cost. Delivery times may also depend on third-party carriers.",
      },
      {
        title: "Cancellations and Modifications",
        desc: "Orders can be canceled only if they have not yet entered the production phase. Requests for cancellations should be made within 24 hours of placing the order.Changes to orders are allowed before the production phase begins. Once production starts, changes may not be possible.",
      },
      {
        title: "Returns and Refunds",
        desc: `Returns are only accepted for defective or incorrect products. Custom-made or personalized products are generally not eligible for return unless there is a manufacturing defect. Refunds or replacements will be provided at Printe’s discretion, depending on the circumstances of the return.`,
      },
      {
        title: "Intellectual Property",
        desc: "All content on the Printe website, including logos, images, designs, and text, is the intellectual property of Printe and may not be used without prior written consent. You retain ownership of any custom designs submitted to Printe but grant us a license to use those designs for the purpose of fulfilling your order.",
      },
      {
        title: "Privacy and Data Protection",
        desc: "We take your privacy seriously. By using our website and services, you consent to our collection, use, and storage of your personal information in accordance with our Privacy Policy. We will not share your personal data with third parties except as required for processing your orders.",
      },
      {
        title: "Limitation of Liability",
        desc: `Printe is not liable for any indirect, incidental, special, or consequential damages arising from the use of our products or services. Our liability is limited to the value of the product or service purchased.`,
      },
      {
        title: "Indemnification",
        desc: "You agree to indemnify and hold harmless Printe, its employees, agents, and affiliates from any claims, losses, or damages (including legal fees) arising from your use of our website, products, or services.",
      },
      {
        title: "Governing Law",
        desc: "These Terms and Conditions are governed by the laws, and any disputes arising from or related to these terms shall be resolved in the courts of Trichy District.",
      },
      {
        title: "Changes to Terms and Conditions",
        desc: `Printe reserves the right to modify or update these Terms and Conditions at any time. Any changes will be posted on this page, and the revised terms will take effect immediately upon posting.`,
      },
      {
        title: "Contact Information",
        desc: `If you have any questions or concerns about these Terms and Conditions, please contact us at:
    Email: xxxxxxx@printe.com
    Phone: 99999 99999`,
      },
    ],
  },
  {
    title: "",
    desc: "By using Printe's services and website, you acknowledge that you have read, understood, and agree to these Terms and Conditions.",
  },
];

export const privacyPolicy = [
  {
    title: "Privacy Policy of Printo and it's associated apps",
    desc: `We Take Your Privacy Seriously

At Printe, we take your personal privacy very seriously. Protecting your online privacy is important to us, not just from a business perspective, but from an ethical one as well. We therefore are proud to share with you our honest, open and 100% understandable privacy and security policy. We do not sell our database of information about you. That is NOT our revenue model.

We do not sell or rent your personal information to third parties for their marketing purposes without your explicit consent and we only use your information as described in the Privacy Policy. We view protection of your privacy as a very important community principle. We understand clearly that you and Your Information is one of our most important assets. We store and process your personal Information on our servers which are protected by physical as well as technological security devices. We use third parties to verify and certify our privacy principles. If you object to your Information being transferred or used in this way please do not use the Site.

We collect "personal" information from you when you provide it to us. For example, if you purchase a product from us, we may collect your name, mailing address, telephone number and email address. If you sign up to receive a newsletter, we will collect your email address. If you take advantage of special services offered by us, we may collect other personal information about you. We use your personal information for internal purposes such as processing and keeping you informed of your order.

Under no circumstances do we rent, trade or share your Personal Information that we have collected with any other company for their marketing purposes without your consent. We reserve the right to communicate your personal information to any third party that makes a legally-compliant request for its disclosure. Otherwise, however, we will not disclose your name, address and other information which identifies you personally to any third party without your consent. We reserve the right to collect general demographic and other anonymous information that does not personally identify you. This information is not associated with your personally identifiable information and cannot be linked to you personally.

If you are no longer interested in receiving e-mail announcements and other marketing information from us, or you want us to remove any Information that we have collected about you, please e-mail us your request.

We use cookies and other technologies such as pixel tags and clear gifs to store certain types of information each time you visit any page on our website. Cookies enable this site to recognize the information you have consented to give to this website and help us determine what portions of this website are most appropriate for your professional needs. We may also use cookies to serve advertising banners to you. These banners may be served by us or by a third party on our behalf. These cookies will not contain any personal information.

Whether you want your web browser to accept cookies or not is up to you. If you haven't changed your computer's settings, most likely your browser already accepts cookies. If you choose to decline cookies, you may not be able to fully experience all features of the site. You can also delete your browser cookies of disable them entirely. But this may significantly impact your experience with our site and may make parts of our website nonfunctional or inaccessible. We recommend that you leave them turned on.

We use third-party service providers to serve ads on our behalf across the Internet and sometimes on this site. They may collect anonymous information about your visits to our website, and your interaction with our products and services. They may also use information about your visits to this and other sites to target advertisements for goods and services. This anonymous information is collected through the use of a pixel tag, which is industry standard technology used by most major websites. No personally identifiable information is collected or used in this process. They do not know the name, phone number, address, email address, or any personally identifying information about the user.`,
  },
];

export const returnPolicy = [
  {
    title: "Return and Refund Policy",
    desc: "At Printe, customer satisfaction is our top priority. We are committed to providing high-quality, custom-printed products. However, we understand that in some cases, returns may be necessary. Please review our return policy below:",
    children: [
      {
        title: "Eligibility for Returns",
        desc: `Returns can only be accepted if there is a defect in the product or if the product does not match the order specifications.
We do not accept returns for products that are customized (e.g., personalized gifts, custom designs) unless there is a manufacturing defect or an error on our part.
The return request must be made within 7 days of receiving the product.`,
      },
      {
        title: "Return Process",
        desc: `To initiate a return, please contact our customer support team at [95856 10000/ help@printe.com] with your order number, a description of the issue, and photos of the product if applicable.
Our team will review your request and guide you through the return process.
All refunds will be processed through Razorpay to the original payment method.`,
      },
      {
        title: "Refund Timeline",
        desc: `Once we receive and inspect your returned item, we will send you an email to notify you that we have received your returned item.
We will also notify you of the approval or rejection of your refund.
If approved, your refund will be processed through Razorpay, and a credit will automatically be applied to your original method of payment within 7-10 business days.`,
      },
      {
        title: "Conditions for Returns",
        desc: `The product must be unused, in its original packaging, and in the same condition as it was received.
For defective products, we may ask for photographs or other supporting evidence to help assess the issue.`,
      },
      {
        title: "Refund or Replacement",
        desc: `If your return request is approved, we will either offer a replacement of the product or a refund. The choice will depend on the circumstances of the return.
If the product is defective or the wrong item was delivered, we will cover the cost of return shipping.
If the return is due to customer error (e.g., incorrect order placement), the customer may be responsible for return shipping costs.`,
      },
      {
        title: "Non-Returnable Items",
        desc: `Custom-made or personalized products, such as printed items with custom designs, bulk orders, and specific business-related prints, are generally not eligible for return.
Items that have been altered or damaged after delivery cannot be returned.`,
      },
      {
        title: "Exceptions",
        desc: `We reserve the right to refuse returns for any reason if the product has been altered, damaged, or used in a way that does not meet the return conditions.
We are committed to providing high-quality products and services. If you encounter any issues with your order, please contact us promptly so we can assist you in resolving the situation. Your satisfaction is important to us, and we strive to ensure every experience with Printe is a positive one.`,
      },
    ],
  },
];

export const aboutUs = [
  {
    title: "About Us",
    img: ImageHelper.ABOUT_US_IMG1,
    desc: `Welcome to Printe – where printing meets simplicity and excellence! Printe is more than just a printing service; it’s the result of over 20 years of passion and expertise in the printing industry. Founded by an experienced professional with a deep understanding of the field, Printe was created with a vision to serve people across the globe – no matter the location, size, or scope of their needs.
    
We are committed to making your printing experience as easy as possible, without ever compromising on quality. From small personal projects to large-scale corporate needs, Printe provides customized solutions tailored to meet your unique requirements. Our motto is simple: steadfast printing with a focus on exceptional quality every time.
`,
    children: [
      {
        title: "Our Facilities & Reach",
        img: ImageHelper.ABOUT_US_IMG1,
        desc: `Headquartered in Tamil Nadu, Printe operates from a sprawling 12,000 square feet production facility. With seven retail stores across major cities, we have built a strong presence to serve customers both near and far. Our dedicated team of over 65 professionals ensures that we continue to deliver excellence, no matter the project size.`,
      },
      {
        title: "Expanding Horizons",
        img: ImageHelper.ABOUT_US_IMG2,
        desc: `In response to the world’s evolving digital landscape, Printe has embraced digital displays to keep pace with the modern, technology-driven world. This expansion allows us to offer our customers even more creative possibilities for their branding and marketing needs.`,
      },
      {
        title: "Custom Design & Printing Under One Roof",
        img: ImageHelper.ABOUT_US_IMG3,
        desc: `Printe offers an extensive array of printing services all under one roof. Whether you're looking for individual items or business solutions, we’ve got you covered. From letterheads, brochures, pamphlets, and invitations to flex prints, banners, vinyl stickers, business cards, custom gifts, and more – we can create anything and everything.

We strive to make the process as seamless as possible, with easy door-to-door delivery at great prices. No matter what you need, Printe is here to turn your ideas into reality, with high-quality prints delivered right to your doorstep.

Explore our range of services and let us help bring your ideas to life today!
`,
      },
    ],
  },
];

export const carouselBanner = [
  {
    id: 3,
    img: ImageHelper.BANNER_IMG2,
  },
  {
    id: 4,
    img: ImageHelper.BANNER_IMG3,
  },
  {
    id: 5,
    img: ImageHelper.BANNER_IMG4,
  },
];

export const reviewData = [
  {
    _id: "1",
    user: {
      name: "Pradeepkumar",
      profile_pic: img1,
    },
    rating: 3,
    review:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque quo sapiente libero consequatur labore laboriosam explicabo voluptate quam, consectetur ad dolore cum deserunt! Eaque, iste exercitationem vero animi voluptate molestias.",
    createdAt: "2024-12-18T12:08:32.373Z",
  },
  {
    _id: "2",
    user: {
      name: "Krish",
      profile_pic: img2,
    },
    rating: 2,
    review:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque quo sapiente libero consequatur labore laboriosam explicabo voluptate quam, consectetur ad dolore cum deserunt! Eaque, iste exercitationem vero animi voluptate molestias.",
    createdAt: "2024-12-18T12:08:32.373Z",
  },
  {
    _id: "3",
    user: {
      name: "chanse",
      profile_pic: img1,
    },
    rating: 4.2,
    review:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque quo sapiente libero consequatur labore laboriosam explicabo voluptate quam, consectetur ad dolore cum deserunt! Eaque, iste exercitationem vero animi voluptate molestias.",
    createdAt: "2024-12-18T12:08:32.373Z",
  },
  {
    _id: "4",
    user: {
      name: "ramesh",
      profile_pic: img3,
    },
    rating: 3.6,
    review:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque quo sapiente libero consequatur labore laboriosam explicabo voluptate quam, consectetur ad dolore cum deserunt! Eaque, iste exercitationem vero animi voluptate molestias.",
    createdAt: "2024-12-18T12:08:32.373Z",
  },
  {
    _id: "5",
    user: {
      name: "Mounika",
      profile_pic: img1,
    },
    rating: 5,
    review:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque quo sapiente libero consequatur labore laboriosam explicabo voluptate quam, consectetur ad dolore cum deserunt! Eaque, iste exercitationem vero animi voluptate molestias.",
    createdAt: "2024-12-18T12:08:32.373Z",
  },
  {
    _id: "6",
    user: {
      name: "Ranjeeth",
      profile_pic: img1,
    },
    rating: 5,
    review: "",
    createdAt: "2024-12-18T12:08:32.373Z",
  },
  {
    _id: "7",
    user: {
      name: "Kumar",
      profile_pic: img1,
    },
    rating: 5,
    review: "",
    createdAt: "2024-12-18T12:08:32.373Z",
  },
  {
    _id: "8",
    user: {
      name: "pradeep",
      profile_pic: img1,
    },
    rating: 1,
    review: "",
    createdAt: "2024-12-18T12:08:32.373Z",
  },
];

export const shippingAndDeliveryPolicy = [
  {
    title: "Shipping & Delivery Policy",
    desc: "",
    children: [
      {
        title: "Order Processing Time",
        desc: `All orders are processed within [1-3 business days]. Orders placed on weekends or holidays will be processed on the next business day. You will receive a confirmation email with your order details and tracking information once your order has been shipped.`,
      },
      {
        title: "Shipping Methods and Delivery Time",
        desc: `We offer the following shipping options:
-> Standard Shipping: Estimated delivery within [5-7 business days].
-> Express Shipping: Estimated delivery within [2-3 business days].
-> Overnight Shipping: Next-day delivery for orders placed before [2 PM local time].
Delivery timelines may vary depending on your location and external factors such as weather or courier delays.`,
      },
      {
        title: "Shipping Charges",
        desc: `Shipping charges are calculated at checkout and depend on the shipping method selected and your location.
-> Free shipping on orders above ₹[amount].
-> A flat shipping fee of ₹[amount] applies for orders below ₹[amount].`,
      },
      {
        title: "Tracking Your Order",
        desc: `Once your order is shipped, a tracking number will be provided via email or SMS. You can track your package using the courier service's tracking portal.`,
      },
      {
        title: "International Shipping",
        desc: `We currently ship to the following countries: [list of countries]. International orders may be subject to customs duties, taxes, or additional fees imposed by the destination country. These charges are the buyer’s responsibility.`,
      },
      {
        title: "Delivery Issues",
        desc: `If you experience any delays or issues with your delivery, please contact our customer support team at [support email/phone] within [7 days] of the expected delivery date.`,
      },
      {
        title: "Undelivered Packages",
        desc: `In the event of a failed delivery due to an incorrect address or unavailability of the recipient, the package may be returned to us. Additional shipping charges may apply for re-dispatching the package.`,
      },
      {
        title: "Missing or Damaged Products",
        desc: `If any items are missing or damaged upon delivery, notify us within [48 hours] by contacting our support team at [support email/phone]. We will investigate and resolve the issue promptly.`,
      },
      {
        title: "Changes to This Policy",
        desc: `We reserve the right to modify this policy at any time. Any updates will be posted on this page, and we encourage you to review it periodically.`,
      },
    ],
  },
];
