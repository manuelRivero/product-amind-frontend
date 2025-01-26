/*!

=========================================================
* Material Dashboard React - v1.10.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2021 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/material-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
// @material-ui/icons
import Dashboard from '@material-ui/icons/Dashboard'
// import Person from "@material-ui/icons/Person";
import StorefrontIcon from '@material-ui/icons/Storefront'
import CategoryIcon from '@material-ui/icons/Category'
import ListAltIcon from '@material-ui/icons/ListAlt'
// core components/views for Admin layout
import DashboardPage from 'views/Dashboard/Dashboard.js'

import Products from 'views/Products'
import Login from 'views/Login'
import UploadProductsFromExcel from 'views/UploadProductsFromExcel'
// import UploadImagesFromZip from 'views/uploadImagesFromZip'
import AddProducts from 'views/AddProducts'
import Sales from 'views/Sales'
// import CreateSale from 'views/CreateSale';
import SaleDetail from 'views/SaleDetail'
import AddBannersPage from './views/AddBanners'
import Banners from './views/Banners'
import AdminBanners from './views/AdminBanners'
import Categories from 'views/Categories'
import AddCategories from 'views/AddCategories'

const dashboardRoutes = [
    {
        path: '/dashboard',
        name: 'Dashboard',
        rtlName: 'لوحة القيادة',
        icon: Dashboard,
        component: DashboardPage,
        layout: '/admin',
    },
    {
        path: '/banners',
        name: 'Banners',
        icon: Dashboard,
        component: Banners,
        layout: '/admin',
        childrens: [
            {
                path: '/add-banner',
                name: 'Agregar Banner',
                component: AddBannersPage,
            },
            {
                path: '/admin-banners',
                name: 'Administrar Banners',
                component: AdminBanners,
            },
        ],
    },
    {
        path: '/categories',
        name: 'Categorías',
        icon: CategoryIcon,
        component: Categories,
        layout: '/admin',
        childrens: [
            {
                path: '/add-category',
                name: 'Agregar Categoría',
                component: AddCategories,
            },
            {
                noshow: true,
                path: '/edit-category/:name/:id',
                name: 'Editar Categoría',
                component: AddCategories,
            },
        ],
    },
    {
        path: '/products',
        name: 'Productos',
        icon: StorefrontIcon,
        component: Products,
        layout: '/admin',
        childrens: [
            {
                path: '/add-product',
                name: 'Agregar Producto',
                component: AddProducts,
            },
            {
                noshow: true,
                path: '/edit-product/:id',
                name: 'Editar Producto',
                component: AddProducts,
            },
            {
                path: '/upload-from-excel',
                name: 'Carga masiva de excel',
                component: UploadProductsFromExcel,
            },
            // {
            //     path: '/upload-images-from-zip',
            //     name: 'Carga masiva de imágenes',
            //     component: UploadImagesFromZip,
            // },
        ],
    },
    // {
    //     path: '/create-sale',
    //     name: 'Crear orden',
    //     rtlName: 'لوحة القيادة',
    //     icon: Dashboard,
    //     component: CreateSale,
    //     layout: '/admin',
    // },
    {
        path: '/orders',
        name: 'Ordenes',
        icon: ListAltIcon,
        component: Sales,
        layout: '/admin',
        childrens: [
            {
                noshow: true,
                path: '/detail/:id',
                name: 'Detalle de la orden',
                component: SaleDetail,
            },
        ],
    },
]
const authRoutes = [
    {
        path: '/login',
        name: 'Dashboard',
        icon: Dashboard,
        component: Login,
        layout: '/auth',
    },
]
export { dashboardRoutes, authRoutes }
