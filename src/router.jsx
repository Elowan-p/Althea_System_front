// src/router.jsx
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import CategoryPage from './pages/product/category/CategoryPage';
import DetailsPage from './pages/product/detailsPage';

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
    },
    {
        path: "/login",
        element: <Login />,
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/category/:id",
        element: <CategoryPage />,
    },
    {
        path: "/product/:id",
        element: <DetailsPage />,
    },
    {
        path: "*",
        element: <div>Page non trouvée !</div>,
    },
]);

export default router;