/* require dependencies */
import { lazy } from "react"
import { routerProps } from "../types";

// route
export type route = {
    path: string,
    guest: boolean,
    component: React.LazyExoticComponent<React.FunctionComponent<routerProps>>
}

/* array of posRoutes */
const posRoutes: route[] = [

    // authenticated routes
    // user routes
    {
        path: "/pos/user/form",
        component: lazy(() => import("../pages/user/form")),
        guest: false
    },
    {
        path: "/pos/user/list",
        component: lazy(() => import("../pages/user/list")),
        guest: false
    },
    {
        path: "/pos/user/view",
        component: lazy(() => import("../pages/user/view")),
        guest: false
    },
    {
        path: "/pos/profile/edit",
        component: lazy(() => import("../pages/user/form")),
        guest: false
    },
    {
        path: "/pos/profile/view",
        component: lazy(() => import("../pages/user/view")),
        guest: false
    },

    {
        path: "/pos/profile/password",
        component: lazy(() => import("../pages/user/password")),
        guest: false
    },

    // product route
    {
        path: "/pos/product/form",
        component: lazy(() => import("../pages/product/form")),
        guest: false
    },
    {
        path: "/pos/product/list",
        component: lazy(() => import("../pages/product/list")),
        guest: false
    },
    {
        path: "/pos/product/stock-taking",
        component: lazy(() => import("../pages/product/list")),
        guest: false
    },
    {
        path: "/pos/product/view",
        component: lazy(() => import("../pages/product/view")),
        guest: false
    },
    {
        path: "/pos/product/adjustment-list",
        guest: false,
        component: lazy(() => import("../pages/product/adjustment/list"))
    },
    {
        path: "/pos/product/adjustment-view",
        guest: false,
        component: lazy(() => import("../pages/product/adjustment/view"))
    },


    // expense
    {
        path: "/pos/expense/type-form",
        component: lazy(() => import("../pages/expense/type/form")),
        guest: false
    },
    {
        path: "/pos/expense/type-list",
        component: lazy(() => import("../pages/expense/type/list")),
        guest: false
    },
    {
        path: "/pos/expense/type-view",
        component: lazy(() => import("../pages/expense/type/view")),
        guest: false
    },
    {
        path: "/pos/expense/form",
        component: lazy(() => import("../pages/expense/form")),
        guest: false
    },
    {
        path: "/pos/expense/list",
        component: lazy(() => import("../pages/expense/list")),
        guest: false
    },
    {
        path: "/pos/expense/view",
        component: lazy(() => import("../pages/expense/view")),
        guest: false
    },

    // customer
    {
        path: "/pos/customer/form",
        component: lazy(() => import("../pages/customer/form")),
        guest: false
    },
    {
        path: "/pos/customer/list",
        component: lazy(() => import("../pages/customer/list")),
        guest: false
    },
    {
        path: "/pos/customer/view",
        component: lazy(() => import("../pages/customer/view")),
        guest: false
    },

    // purchase
    {
        path: "/pos/purchase/form",
        component: lazy(() => import("../pages/purchase/form")),
        guest: false
    },
    {
        path: "/pos/purchase/list",
        component: lazy(() => import("../pages/purchase/list")),
        guest: false
    },
    {
        path: "/pos/purchase/view",
        component: lazy(() => import("../pages/purchase/view")),
        guest: false
    },
    {
        path: "/pos/purchase/bulk",
        component: lazy(() => import("../pages/purchase/bulk")),
        guest: false
    },

    // debt routes
    {
        path: "/pos/debt/form",
        guest: false,
        component: lazy(() => import("../pages/debt/form"))
    },
    {
        path: "/pos/debt/list",
        guest: false,
        component: lazy(() => import("../pages/debt/list"))
    }
    ,
    {
        path: "/pos/debt/view",
        guest: false,
        component: lazy(() => import("../pages/debt/view"))
    },
    {
        path: "/pos/debt/history-form",
        guest: false,
        component: lazy(() => import("../pages/debt/history/form"))
    },
    {
        path: "/pos/debt/history-list",
        guest: false,
        component: lazy(() => import("../pages/debt/history/list"))
    },
    {
        path: "/pos/debt/history-view",
        guest: false,
        component: lazy(() => import("../pages/debt/history/view"))
    },

    // sale route
    {
        path: "/pos/sale/form",
        guest: false,
        component: lazy(() => import("../pages/sale/form"))
    },
    {
        path: "/pos/sale/list",
        guest: false,
        component: lazy(() => import("../pages/sale/list"))
    },
    {
        path: "/pos/sale/view",
        guest: false,
        component: lazy(() => import("../pages/sale/view"))
    },
    {
        path: "/pos/sale/order-form",
        guest: false,
        component: lazy(() => import("../pages/sale/form"))
    },
    {
        path: "/pos/sale/order-list",
        guest: false,
        component: lazy(() => import("../pages/sale/order/list"))
    },
    {
        path: "/pos/sale/order-view",
        guest: false,
        component: lazy(() => import("../pages/sale/order/view"))
    },
    {
        path: "/pos/sale/proforma-invoice-form",
        guest: false,
        component: lazy(() => import("../pages/sale/form"))
    },
    {
        path: "/pos/sale/proforma-invoice-list",
        guest: false,
        component: lazy(() => import("../pages/sale/order/list"))
    },

    {
        path: "/pos/sale/proforma-invoice-view",
        guest: false,
        component: lazy(() => import("../pages/sale/order/view"))
    },

    {
        path: "/pos/sale/proforma-done-list",     // ← must match `link` above
        guest: false,
        component: lazy(() => import("../pages/sale/order/list"))
    },

    // role routes
    {
        path: "/pos/role/form",
        guest: false,
        component: lazy(() => import("../pages/role/form"))
    },
    {
        path: "/pos/role/list",
        guest: false,
        component: lazy(() => import("../pages/role/list"))
    },
    {
        path: "/pos/role/view",
        guest: false,
        component: lazy(() => import("../pages/role/view"))
    },

    // branch routes
    {
        path: "/pos/branch/form",
        guest: false,
        component: lazy(() => import("../pages/branch/form"))
    },
    {
        path: "/pos/branch/list",
        guest: false,
        component: lazy(() => import("../pages/branch/list"))
    },
    {
        path: "/pos/branch/view",
        guest: false,
        component: lazy(() => import("../pages/branch/view"))
    },
    {
        path: "/pos/branch/data",
        guest: false,
        component: lazy(() => import("../pages/branch/data"))
    },
    {
        path: "/pos/branch/settings",
        guest: false,
        component: lazy(() => import("../pages/branch/settings"))
    },
    {
        path: "/pos/branch/activity-list",
        guest: false,
        component: lazy(() => import("../pages/activity/list"))
    },

    {
        path: "/pos/payment/form",
        guest: false,
        component: lazy(() => import("../pages/payment/form"))
    },
    {
        path: "/pos/payment/list",
        guest: false,
        component: lazy(() => import("../pages/payment/list"))
    },
    {
        path: "/pos/payment/view",
        guest: false,
        component: lazy(() => import("../pages/payment/view"))
    },

    // message
    {
        path: "/pos/message/form",
        guest: false,
        component: lazy(() => import("../pages/message/form"))
    },
    {
        path: "/pos/message/list",
        guest: false,
        component: lazy(() => import("../pages/message/list"))
    },

    // store
    {
        path: "/pos/store/form",
        guest: false,
        component: lazy(() => import("../pages/store/form"))
    },
    {
        path: "/pos/store/list",
        guest: false,
        component: lazy(() => import("../pages/store/list"))
    },
    {
        path: "/pos/store/view",
        guest: false,
        component: lazy(() => import("../pages/store/view"))
    },

    // store product route
    {
        path: "/pos/store/product-form",
        guest: false,
        component: lazy(() => import("../pages/product/form"))
    },
    {
        path: "/pos/store/product-list",
        guest: false,
        component: lazy(() => import("../pages/product/list"))
    },
    {
        path: "/pos/store/product-view",
        guest: false,
        component: lazy(() => import("../pages/product/view"))
    },
    {
        path: "/pos/store/adjustment-form",
        guest: false,
        component: lazy(() => import("../pages/product/adjustment/form"))
    },
    {
        path: "/pos/store/adjustment-list",
        guest: false,
        component: lazy(() => import("../pages/product/adjustment/list"))
    },
    {
        path: "/pos/store/adjustment-view",
        guest: false,
        component: lazy(() => import("../pages/product/adjustment/view"))
    },

    // store product purchase route
    {
        path: "/pos/store/purchase-form",
        component: lazy(() => import("../pages/purchase/form")),
        guest: false
    },
    {
        path: "/pos/store/purchase-list",
        component: lazy(() => import("../pages/purchase/list")),
        guest: false
    },
    {
        path: "/pos/store/purchase-view",
        component: lazy(() => import("../pages/purchase/view")),
        guest: false
    },
    {
        path: "/pos/store/bulk-purchase",
        component: lazy(() => import("../pages/purchase/bulk")),
        guest: false
    },

    // report routes
    {
        path: "/pos/report/form",
        guest: false,
        component: lazy(() => import("../pages/report/form"))
    },

    {
        path: "/pos/report/income-statement",
        guest: false,
        component: lazy(() => import("../pages/report/income-statement"))
    },

    {
        path: "/pos/dashboard",
        component: lazy(() => import("../pages/dashboard/dashboard")),
        guest: false
    },

    // supplier
    {
        path: "/pos/supplier/form",
        guest: false,
        component: lazy(() => import("../pages/supplier/form"))
    },
    {
        path: "/pos/supplier/list",
        guest: false,
        component: lazy(() => import("../pages/supplier/list"))
    },
    {
        path: "/pos/supplier/view",
        guest: false,
        component: lazy(() => import("../pages/supplier/view"))
    },

    // routes routes
    {
        path: "/pos/route/form",
        guest: false,
        component: lazy(() => import("../pages/truck/route/form"))
    },
    {
        path: "/pos/route/list",
        guest: false,
        component: lazy(() => import("../pages/truck/route/list"))
    },
    {
        path: "/pos/route/view",
        guest: false,
        component: lazy(() => import("../pages/truck/route/view"))
    },

    // truck routes
    {
        path: "/pos/truck/form",
        guest: false,
        component: lazy(() => import("../pages/truck/form"))
    },
    {
        path: "/pos/truck/list",
        guest: false,
        component: lazy(() => import("../pages/truck/list"))
    },
    {
        path: "/pos/truck/view",
        guest: false,
        component: lazy(() => import("../pages/truck/view"))
    },

    // truck order route
    {
        path: "/pos/truck/order-form",
        guest: false,
        component: lazy(() => import("../pages/truck/truck-order/form"))
    },
    {
        path: "/pos/truck/order-list",
        guest: false,
        component: lazy(() => import("../pages/truck/truck-order/list"))
    },
    {
        path: "/pos/truck/order-view",
        guest: false,
        component: lazy(() => import("../pages/truck/truck-order/view"))
    },

    // device routes
    {
        path: "/pos/device/form",
        guest: false,
        component: lazy(() => import("../pages/device/form"))
    },
    {
        path: "/pos/device/list",
        guest: false,
        component: lazy(() => import("../pages/device/list"))
    },
    {
        path: "/pos/device/view",
        guest: false,
        component: lazy(() => import("../pages/device/view"))
    },

    // service routes
    {
        path: "/pos/service/form",
        guest: false,
        component: lazy(() => import("../pages/service/form"))
    },
    {
        path: "/pos/service/list",
        guest: false,
        component: lazy(() => import("../pages/service/list"))
    },
    {
        path: "/pos/service/view",
        guest: false,
        component: lazy(() => import("../pages/service/view"))
    },

    // freight route
    {
        path: "/pos/freight/form",
        component: lazy(() => import("../pages/freight/form")),
        guest: false
    },
    {
        path: "/pos/freight/list",
        component: lazy(() => import("../pages/freight/list")),
        guest: false
    },
    {
        path: "/pos/freight/view",
        component: lazy(() => import("../pages/freight/view")),
        guest: false
    },

    // account routes
    {
        guest: false,
        path: "/pos/transaction/account-form",
        component: lazy(() => import("../pages/transaction/account/form"))
    },
    {
        guest: false,
        path: "/pos/transaction/account-list",
        component: lazy(() => import("../pages/transaction/account/list"))
    },
    {
        guest: false,
        path: "/pos/transaction/account-view",
        component: lazy(() => import("../pages/transaction/account/view"))
    },

    // transaction routes
    {
        guest: false,
        path: "/pos/transaction/form",
        component: lazy(() => import("../pages/transaction/form"))
    },
    {
        guest: false,
        path: "/pos/transaction/list",
        component: lazy(() => import("../pages/transaction/list"))
    },
    {
        guest: false,
        path: "/pos/transaction/view",
        component: lazy(() => import("../pages/transaction/view"))
    },

    // hotel routes
    {
        guest: false,
        path: "/pos/hotel/form",
        component: lazy(() => import("../pages/tourism/hotel/form"))
    },
    {
        guest: false,
        path: "/pos/hotel/list",
        component: lazy(() => import("../pages/tourism/hotel/list"))
    },
    {
        guest: false,
        path: "/pos/hotel/view",
        component: lazy(() => import("../pages/tourism/hotel/view"))
    },

    // attraction route
    {
        guest: false,
        path: "/pos/attraction/form",
        component: lazy(() => import("../pages/tourism/attraction/form"))
    },
    {
        guest: false,
        path: "/pos/attraction/list",
        component: lazy(() => import("../pages/tourism/attraction/list"))
    },
    {
        guest: false,
        path: "/pos/attraction/view",
        component: lazy(() => import("../pages/tourism/attraction/view"))
    },
    {
        guest: false,
        path: "/pos/attraction/item-form",
        component: lazy(() => import("../pages/tourism/attraction/item/form"))
    },
    {
        guest: false,
        path: "/pos/attraction/item-list",
        component: lazy(() => import("../pages/tourism/attraction/item/list"))
    },
    {
        guest: false,
        path: "/pos/attraction/item-view",
        component: lazy(() => import("../pages/tourism/attraction/item/view"))
    },

    // quotation routes
    {
        guest: false,
        path: "/pos/quotation/form",
        component: lazy(() => import("../pages/tourism/quotation/form"))
    },
    {
        guest: false,
        path: "/pos/quotation/list",
        component: lazy(() => import("../pages/tourism/quotation/list"))
    },
    {
        guest: false,
        path: "/pos/quotation/view",
        component: lazy(() => import("../pages/tourism/quotation/view"))
    },
    {
        guest: false,
        path: "/pos/quotation/invoice-form",
        component: lazy(() => import("../pages/tourism/quotation/invoice/form"))
    },
    {
        guest: false,
        path: "/pos/quotation/invoice-list",
        component: lazy(() => import("../pages/tourism/quotation/invoice/list"))
    },
    {
        guest: false,
        path: "/pos/quotation/invoice-view",
        component: lazy(() => import("../pages/tourism/quotation/invoice/view"))
    },

    // category routes
    {
        path: "/pos/product/category-form",
        guest: false,
        component: lazy(() => import("../pages/product/category/form"))
    },
    {
        path: "/pos/product/category-list",
        guest: false,
        component: lazy(() => import("../pages/product/category/list"))
    },
    {
        path: "/pos/product/category-view",
        guest: false,
        component: lazy(() => import("../pages/product/category/view"))
    },

    {
        path: "/pos",
        guest: false,
        component: lazy(() => import("../pos/menu/menu"))
    },

    {
        path: "/pos/inventory-management",
        guest: false,
        component: lazy(() => import("../pos/menu/menu"))
    },

    {
        path: "/pos/point-of-sale",
        guest: false,
        component: lazy(() => import("../pos/menu/menu"))
    },

    {
        path: "/pos/user-management",
        guest: false,
        component: lazy(() => import("../pos/menu/menu"))
    },

    {
        path: "/pos/customer-management",
        guest: false,
        component: lazy(() => import("../pos/menu/menu"))
    },

    {
        path: "/pos/report",
        guest: false,
        component: lazy(() => import("../pos/menu/menu"))
    }

]

export default posRoutes;