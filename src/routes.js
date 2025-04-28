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
import ImageIcon from '@material-ui/icons/Image'
import SettingsIcon from '@material-ui/icons/Settings'
// core components/views for Admin layout
import DashboardPage from 'views/Dashboard/Dashboard.js'

import Products from 'views/Products'
import Login from 'views/Login'
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
import ProductDetail from './views/productDetail'
import ConfigPage from './views/Config'
import Offers from './views/Offers'
import AddOffer from './views/AddOffer'
import Activation from './views/Activation'

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
    {
        path: '/offers',
        name: 'Promociones',
        icon: ListAltIcon,
        component: Offers,
        layout: '/admin',
        childrens: [
            {
                path: '/add-offers/:id',
                name: 'Agregar promoción',
                noshow: true,
                component: AddOffer,
            },
            {
                path: '/add-offers',
                name: 'Agregar promoción',
                noshow: true,

                component: AddOffer,
            },
        ],
    },

    {
        path: '/banners',
        name: 'Banners',
        icon: ImageIcon,
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
        path: '/product-detail/:id',
        name: 'Detalle del producto',
        icon: StorefrontIcon,
        component: ProductDetail,
        layout: '/admin',
        childrens: [],
        hidden: true,
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
            // {
            //     path: '/upload-from-excel',
            //     name: 'Carga masiva de excel',
            //     component: UploadProductsFromExcel,
            // },
            // {
            //     path: '/upload-images-from-zip',
            //     name: 'Carga masiva de imágenes',
            //     component: UploadImagesFromZip,
            // },
        ],
    },
    {
        path: '/config',
        name: 'Configuración',
        icon: SettingsIcon,
        component: ConfigPage,
        layout: '/admin',
    },
    {
        path: '/mercado-pago',
        name: 'Activación de tu cuenta',
        icon: Dashboard,
        component: Activation,
        layout: '/admin',
    },
    // {
    //     path: '/create-sale',
    //     name: 'Crear orden',
    //     rtlName: 'لوحة القيادة',
    //     icon: Dashboard,
    //     component: CreateSale,
    //     layout: '/admin',
    // },
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
