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
import ListAltIcon from '@material-ui/icons/ListAlt';
// core components/views for Admin layout
import DashboardPage from 'views/Dashboard/Dashboard.js'
// import UserProfile from "views/UserProfile/UserProfile.js";
import TableList from 'views/TableList/TableList.js'
// core components/views for RTL layout

import Products from 'views/Products'
import Login from 'views/Login'
import UploadProductsFromExcel from 'views/UploadProductsFromExcel'
import UploadImagesFromZip from 'views/uploadImagesFromZip'
import AddProducts from 'views/AddProducts'

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
        path: '/products',
        name: 'Productos',
        rtlName: 'لوحة القيادة',
        icon: StorefrontIcon,
        component: Products,
        layout: '/admin',
        childrens: [
            {
                path: '/add-product',
                name: 'Agregar Producto',
                rtlName: 'لوحة القيادة',
                component: AddProducts,
            },
            {
                path: '/upload-from-excel',
                name: 'Carga masiva de excel',
                rtlName: 'لوحة القيادة',
                component: UploadProductsFromExcel,
            },
            {
                path: '/upload-images-from-zip',
                name: 'Carga masiva de imágenes',
                rtlName: 'لوحة القيادة',
                component: UploadImagesFromZip,
            },
        ],
    },
    // {
    //   path: "/user",
    //   name: "User Profile",
    //   rtlName: "ملف تعريفي للمستخدم",
    //   icon: Person,
    //   component: UserProfile,
    //   layout: "/admin",
    // },
    {
        path: '/orders',
        name: 'Ordenes',
        rtlName: 'قائمة الجدول',
        icon: ListAltIcon,
        component: TableList,
        layout: '/admin',
    },
];
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
