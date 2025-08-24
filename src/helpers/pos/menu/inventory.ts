import { can } from "../../permissions";
import { posMenuType } from "./menu";

const inventoryMenu: posMenuType[] = [
    {
        rank: 0,
        title: "New Product",
        icon: "post_add",
        link: "/pos/product/form",
        visible: can("create_product"),
    },

    {
        rank: 0,
        title: "products",
        icon: "inventory_2",
        link: "/pos/product/list",
        visible: can("create_product"),
    },

    {
        rank: 0,
        title: "Adjustments",
        icon: "change_history",
        link: "/pos/product/adjustment-list",
        visible: can("list_stock_adjustment"),
    },

    {
        rank: 0,
        title: "Stock Taking",
        icon: "inventory",
        link: "/pos/product/stock-taking",
        visible: can("list_stock_adjustment"),
    },

    {
        rank: 0,
        title: "new purchase",
        icon: "add_box",
        link: "/pos/purchase/form",
        visible: can("create_purchase"),
    },

    {
        rank: 0,
        title: "bulk purchase",
        icon: "library_add",
        link: "/pos/purchase/bulk",
        visible: can("create_purchase"),
    },

    {
        rank: 0,
        title: "purchases",
        icon: "local_shipping",
        link: "/pos/purchase/list",
        visible: can("list_purchase"),
    },

    {
        rank: 0,
        title: "new supplier",
        icon: "person_add",
        link: "/pos/supplier/form",
        visible: can("create_supplier"),
    },

    {
        rank: 0,
        title: "suppliers",
        icon: "forklift",
        link: "/pos/supplier/list",
        visible: can("list_supplier"),
    },

]

export default inventoryMenu