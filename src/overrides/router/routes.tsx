import React, { lazy } from 'react';
import themeInit from '../../theme.init';

const LoginApps = lazy(() => import('../../pages/Authentication/Login')); // ไฟล์หลัก
const LoginShop = lazy(() => import('../../pages/Authentication/LoginShop'));  // ไฟล์หลัก
const LoginCustomer = lazy(() => import('../../pages/Authentication/LoginCustomer')); // ไฟล์หลัก
const LoginBusiness = lazy(() => import('../../pages/Authentication/LoginBusiness'));  // ไฟล์หลัก
const MODE = process.env.MODE;
let routePermissions;

if (MODE) {
    const loginComponents: any = {
        admin: LoginApps,
        shop: LoginShop,
        business_unit: LoginBusiness,
        customer: LoginCustomer,
    };
    routePermissions = [
        {
            path: '/apps/login',
            element: MODE in loginComponents ? React.createElement(loginComponents[MODE]) : <LoginCustomer />,
            layout: 'blank',
        },
    ];
} else {
    routePermissions = [
        { path: '/apps/customer-login', element: <LoginCustomer />, layout: 'blank' },
    ];
}
const overrideRoutes = [
    ...routePermissions,
    { path: '/ex_overrides', element: <></> }, 
];
export { overrideRoutes };
