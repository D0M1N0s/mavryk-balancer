import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// dashboard routing
const DashboardSell = Loadable(lazy(() => import('views/dashboard/Sell')));
const DashboardBuy = Loadable(lazy(() => import('views/dashboard/Buy')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
    path: '/',
    element: <MainLayout />,
    children: [
        {
            path: '/',
            element: <DashboardBuy />
        },
        {
            path: '/buy',
            element: <DashboardBuy />
        },
        {
            path: '/sell',
            element: <DashboardSell />
        }
    ]
};

export default MainRoutes;
