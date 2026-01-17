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
import HomeIcon from '@material-ui/icons/Home'
// import Person from "@material-ui/icons/Person";
import StorefrontIcon from '@material-ui/icons/Storefront'
import CategoryIcon from '@material-ui/icons/Category'
import ReceiptIcon from '@material-ui/icons/Receipt'
import LocalOfferIcon from '@material-ui/icons/LocalOffer'
import ConfirmationNumberIcon from '@material-ui/icons/ConfirmationNumber'
import ImageIcon from '@material-ui/icons/Image'
import SettingsIcon from '@material-ui/icons/Settings'
import DescriptionIcon from '@material-ui/icons/Description'
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet'
import LockOpenIcon from '@material-ui/icons/LockOpen'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
// core components/views for Admin layout
import DashboardPage from 'views/Dashboard/Dashboard.js'
import DailyComparison from 'views/DailyComparison'

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
import Activation from './views/Activation'
import Home from './views/Home'
import Blogs from './views/Blogs'
import AddBlog from './views/AddBlog'
import ViewBlog from './views/ViewBlog'
import Offers from './views/Offers'
import AddOffer from './views/AddOffer'
import Coupons from './views/Coupons'
import AddCoupon from './views/AddCoupon'
const dashboardRoutes = [
    {
        path: '/inicio',
        name: 'Inicio',
        icon: HomeIcon,
        component:  Home,
        layout: '/admin',
        needConfig: false,
        hidden: false,
        permission: null, // No requiere permisos
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        rtlName: 'لوحة القيادة',
        icon: Dashboard,
        component: DashboardPage,
        layout: '/admin',
        needConfig: true,
        permission: { resource: 'reports', action: 'read' },
        childrens: [
            {
                path: '/daily-comparison',
                name: 'Analisis comparativo',
                component: DailyComparison,
                noshow: true,
            },
            
        ],
    },
    {
        path: '/orders',
        name: 'Ordenes',
        icon: ReceiptIcon,
        component: Sales,
        layout: '/admin',
        needConfig: true,
        permission: { resource: 'sales', action: 'read' },

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
        icon: LocalOfferIcon,
        component: Offers,
        layout: '/admin',
        needConfig: true,
        permission: { resource: 'offers', action: 'read' },

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
        path: '/coupons',
        name: 'Cupones',
        icon: ConfirmationNumberIcon,
        component: Coupons,
        layout: '/admin',
        needConfig: true,
        permission: { resource: 'coupons', action: 'read' },

        childrens: [
            {
                path: '/add-coupon/:id',
                name: 'Agregar cupón',
                noshow: true,
                component: AddCoupon,
            },
            {
                path: '/add-coupon',
                name: 'Agregar cupón',
                noshow: true,
                component: AddCoupon,
            },
        ],
    },
    {
        path: '/banners',
        name: 'Banners',
        icon: ImageIcon,
        component: Banners,
        layout: '/admin',
        needConfig: true,
        permission: { resource: 'banners', action: 'read' },

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
        needConfig: true,
        permission: { resource: 'categories', action: 'read' },
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
        icon: InfoOutlinedIcon,
        component: ProductDetail,
        layout: '/admin',
        needConfig: true,
        childrens: [],
        hidden: true,
        permission: { resource: 'products', action: 'read' },
    },
    {
        path: '/products',
        name: 'Productos',
        icon: StorefrontIcon,
        component: Products,
        layout: '/admin',
        needConfig: true,
        permission: { resource: 'products', action: 'read' },
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
        path: '/blogs',
        name: 'Blogs',
        icon: DescriptionIcon,
        component: Blogs,
        layout: '/admin',
        needConfig: true,
        permission: { resource: 'blogs', action: 'read' },
        childrens: [
            {
                path: '/add-blog',
                name: 'Crear Blog',
                component: AddBlog,
            },
            {
                noshow: true,
                path: '/edit-blog/:id',
                name: 'Editar Blog',
                component: AddBlog,
            },
            {
                noshow: true,
                path: '/view-blog/:id',
                name: 'Ver Blog',
                component: ViewBlog,
            },
        ],
    },
    {
        path: '/config',
        name: 'Configuración',
        icon: SettingsIcon,
        component: ConfigPage,
        layout: '/admin',
        needConfig: true,
        permission: { resource: 'config', action: 'read' },
    },
    {
        path: '/mercado-pago',
        name: 'Cuenta',
        icon: AccountBalanceWalletIcon,
        component: Activation,
        layout: '/admin',
        needConfig: false,
        permission: null, // No requiere permisos
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
        icon: LockOpenIcon,
        component: Login,
        layout: '/auth',
    },
]
export { dashboardRoutes, authRoutes }
