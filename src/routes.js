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
import LibraryBooks from '@material-ui/icons/LibraryBooks'
import BubbleChart from '@material-ui/icons/BubbleChart'
import LocationOn from '@material-ui/icons/LocationOn'
import Notifications from '@material-ui/icons/Notifications'
import Unarchive from '@material-ui/icons/Unarchive'
import Language from '@material-ui/icons/Language'
// core components/views for Admin layout
import DashboardPage from 'views/Dashboard/Dashboard.js'
// import UserProfile from "views/UserProfile/UserProfile.js";
import TableList from 'views/TableList/TableList.js'
import Typography from 'views/Typography/Typography.js'
import Icons from 'views/Icons/Icons.js'
import Maps from 'views/Maps/Maps.js'
import NotificationsPage from 'views/Notifications/Notifications.js'
import UpgradeToPro from 'views/UpgradeToPro/UpgradeToPro.js'
// core components/views for RTL layout
import RTLPage from 'views/RTLPage/RTLPage.js'
import Products from 'views/Products'
import Login from 'views/Login'
import UploadProductsFromExcel from 'views/UploadProductsFromExcel'
import UploadImagesFromZip from 'views/uploadImagesFromZip'

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
        path: '/table',
        name: 'Table List',
        rtlName: 'قائمة الجدول',
        icon: 'content_paste',
        component: TableList,
        layout: '/admin',
    },
    {
        path: '/typography',
        name: 'Typography',
        rtlName: 'طباعة',
        icon: LibraryBooks,
        component: Typography,
        layout: '/admin',
    },
    {
        path: '/icons',
        name: 'Icons',
        rtlName: 'الرموز',
        icon: BubbleChart,
        component: Icons,
        layout: '/admin',
    },
    {
        path: '/maps',
        name: 'Maps',
        rtlName: 'خرائط',
        icon: LocationOn,
        component: Maps,
        layout: '/admin',
    },
    {
        path: '/notifications',
        name: 'Notifications',
        rtlName: 'إخطارات',
        icon: Notifications,
        component: NotificationsPage,
        layout: '/admin',
    },
    {
        path: '/rtl-page',
        name: 'RTL Support',
        rtlName: 'پشتیبانی از راست به چپ',
        icon: Language,
        component: RTLPage,
        layout: '/rtl',
    },
    {
        path: '/upgrade-to-pro',
        name: 'Upgrade To PRO',
        rtlName: 'التطور للاحترافية',
        icon: Unarchive,
        component: UpgradeToPro,
        layout: '/admin',
    },
    {
        path: '/products',
        name: 'Productos',
        icon: Unarchive,
        component: Products,
        layout: '/admin',
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
