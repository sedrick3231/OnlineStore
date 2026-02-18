import { lazy, Suspense, useEffect } from "react";
import { useDispatch } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AddOrEditModal from "./components/adminPages/AddOrEdit";
import UserNavbar from "./components/navbar/UserNavbar";
import ProductCreateForm from "./components/Products/AddProduct";
import EditProductForm from "./components/Products/EditProduct";
import ProductModal from "./components/Products/ProductModel";
import { fetchProducts, updateProductStock } from "./redux/productSlicer";
import socket from "./socket";
import ScrollToTop from "./utils/ScrollToTop";
import AdminReviewPage from "./components/adminPages/AdminReviewPage";
import CheckLogin from "./utils/CheckLogin";
import ResetPasswordLogin from "./pages/ResetPasswordLogin";
import HeroEditor from "./components/adminPages/heroEditor";
import { fetchHero } from "./redux/HeroSlicer";
import { fetchCategories, removeCategory, upsertCategoryFromSocket } from "./redux/categorySlicer";
import { getOrder } from "./redux/OrderSlicer";
import SalesManagementPage from "./components/adminPages/SalesManagementPage";
import OrderManagementPage from "./components/adminPages/OrderManagementPage";
const RequireAdmin = lazy(() => import("./components/adminPages/isAdmin"));
const Footer = lazy(() => import("./components/Footer/Footer"));
const Home = lazy(() => import("./pages/Home"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const Login = lazy(() => import("./pages/Login"));
const SignupPage = lazy(() => import("./pages/SignUp"));
const Cart = lazy(() => import("./pages/Cart"));
const Shop = lazy(() => import("./pages/Shop"));
const CheckoutWrapper = lazy(() =>
  import("./components/Products/LoadCheckout")
);
const UserDashboard = lazy(() => import("./components/Profile/UserDashboard"));
const NotFound = lazy(() => import("./pages/notFound"));
const AdminDashboard = lazy(() =>
  import("./components/Profile/AdminDashboard")
);
const UsersPage = lazy(() => import("./components/adminPages/UserPage"));
const OrdersPage = lazy(() => import("./components/adminPages/OrderPage"));
const ProductPage = lazy(() => import("./components/adminPages/ProductsPage"));
const CategoryManager = lazy(() =>
  import("./components/adminPages/CategoryManager")
);
const AdminLayout = lazy(() => import("./components/adminPages/AdminLayout"));
const SettingsPage = lazy(() => import("./components/settings/UserSettings"));

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={null}>
        <ScrollToTop />
        <UserNavbar />
        <Home />
        <Footer />
      </Suspense>
    ),
  },
  {
    path: "/show-product/:id",
    element: (
      <Suspense fallback={null}>
        <ScrollToTop />
        <UserNavbar />
        <ProductModal />
        <Footer />
      </Suspense>
    ),
  },
  {
    path: "/contact-us",
    element: (
      <Suspense fallback={null}>
        <ScrollToTop />
        <UserNavbar />
        <ContactUs />
        <Footer />
      </Suspense>
    ),
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={null}>
        <ScrollToTop />
        <UserNavbar />
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/reset-login",
    element: (
      <Suspense fallback={null}>
        <ScrollToTop />
        <UserNavbar />
        <ResetPasswordLogin />
      </Suspense>
    ),
  },
  {
    path: "/signup",
    element: (
      <Suspense fallback={null}>
        <UserNavbar />
        <SignupPage />
      </Suspense>
    ),
  },
  {
    path: "/cart",
    element: (
      <Suspense fallback={null}>
         <CheckLogin/>
        <ScrollToTop />
        <UserNavbar />
        <Cart />
      </Suspense>
    ),
  },
  {
    path: "/shop",
    element: (
      <Suspense fallback={null}>
        <UserNavbar />
        <Shop />
      </Suspense>
    ),
  },
  
  {
    path: "/dashboard",
    element: (
      <Suspense fallback={null}>
         <CheckLogin/>
        <ScrollToTop />
        <UserNavbar />
        <UserDashboard />
      </Suspense>
    ),
  },

  {
    path: "/settings",
    element: (
      <Suspense fallback={null}>
         <CheckLogin/>
        <ScrollToTop />
        <UserNavbar />
        <SettingsPage />
      </Suspense>
    ),
  },

  // Checkout Route
  {
    path: "/checkout",
    element: (
      <Suspense fallback={null}>
        <CheckLogin/>
        <ScrollToTop />
        <UserNavbar />
        <CheckoutWrapper />
      </Suspense>
    ),
  },

  // Admin router
  {
    path: "/admin",
    element: (
      <Suspense fallback={null}>
        <ScrollToTop />
        <RequireAdmin>
          <AdminLayout />
        </RequireAdmin>
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={null}>
            <ScrollToTop />
            <AdminDashboard />
          </Suspense>
        ),
      },
      {
        path: "users",
        element: (
          <Suspense fallback={null}>
            <ScrollToTop />
            <UsersPage />
          </Suspense>
        ),
      },
      {
        path: "hero-section",
        element: (
          <Suspense fallback={null}>
            <ScrollToTop />
            <HeroEditor/>
          </Suspense>
        ),
      },
      {
        path: "orders",
        element: (
          <Suspense fallback={null}>
            <ScrollToTop />
            <OrdersPage />
          </Suspense>
        ),
      },
      {
        path: "products",
        element: (
          <Suspense fallback={null}>
            <ScrollToTop />
            <ProductPage />
          </Suspense>
        ),
      },
      {
        path: "categories",
        element: (
          <Suspense fallback={null}>
            <ScrollToTop />
            <CategoryManager />
          </Suspense>
        ),
      },
      {
        path: "add",
        element: (
          <Suspense fallback={null}>
            <ScrollToTop />
            <AddOrEditModal Component={ProductCreateForm} />
          </Suspense>
        ),
      },
      {
        path: "edit/:productId",
        element: (
          <Suspense fallback={null}>
            <ScrollToTop />
            <AddOrEditModal Component={EditProductForm} />
          </Suspense>
        ),
      },
      {
        path: "reviews/:productId",
        element: (
          <Suspense fallback={null}>
            <ScrollToTop />
            <AddOrEditModal Component={AdminReviewPage} />
          </Suspense>
        ),
      },
      {
        path: "sales",
        element: (
          <Suspense fallback={null}>
            <ScrollToTop />
            <SalesManagementPage />
          </Suspense>
        ),
      },
      {
        path: "order/:orderId",
        element: (
          <Suspense fallback={null}>
            <ScrollToTop />
            <OrderManagementPage />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "*",
    element: (
      <Suspense fallback={null}>
        <NotFound />
      </Suspense>
    ),
  },
]);

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchHero());
    dispatch(fetchCategories());

    socket.on("product:added", (product) => {
      dispatch(fetchProducts());
    });

    // Update product
    socket.on("product:updated", (productId) => {
      dispatch(fetchProducts());
    });

    socket.on("product:popular", () => {
      dispatch(fetchProducts());
    });

    // Delete product
    socket.on("product:deleted", (productId) => {
      dispatch(fetchProducts());
    });

    // Hero updated
    socket.on("hero:updated", () => {
      dispatch(fetchHero());
    });

    socket.on("category:created", (category) => {
      dispatch(upsertCategoryFromSocket(category));
    });

    socket.on("category:updated", (category) => {
      dispatch(upsertCategoryFromSocket(category));
    });

    socket.on("category:deleted", (id) => {
      dispatch(removeCategory(id));
    });

    // Real-time stock updates
    socket.on("stock:updated", (data) => {
      const { productId, productName, newStock, deductedQuantity, timestamp } = data;
      dispatch(updateProductStock({ productId, newStock }));
    });

    // Order created
    socket.on("order:created", (data) => {
      const currentUser = JSON.parse(localStorage.getItem("user"));
      if (currentUser && data?.userId === currentUser._id) {
        dispatch(getOrder({}));
      }
    });

    // Order error
    socket.on("order:error", (data) => {
      console.error(`❌ Order error: ${data.message}`);
    });

    return () => {
      socket.off("product:added");
      socket.off("product:updated");
      socket.off("product:popular");
      socket.off("product:deleted");
      socket.off("category:created");
      socket.off("category:updated");
      socket.off("category:deleted");
      socket.off("stock:updated");
      socket.off("order:created");
      socket.off("order:error");
    };
  }, [dispatch]);

  useEffect(() => {}, []);
  return <RouterProvider router={router} />;
}

export default App;
