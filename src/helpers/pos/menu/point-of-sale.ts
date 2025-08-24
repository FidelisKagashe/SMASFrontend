import { can } from "../../permissions";
import { posMenuType } from "./menu";

const pointOfSaleMenu: posMenuType[] = [
    {
        rank: 0,
        title: "New sale",
        icon: "add_shopping_cart",
        link: "/pos/sale/form",
        visible: can("create_sale"),
    },

    {
        rank: 4,
        title: "sales",
        icon: "list_alt",
        link: "/pos/sale/list",
        visible: can("list_sale"),
    },

    {
        rank: 2,
        title: "new order",
        icon: "local_offer",
        link: "/pos/sale/order-form",
        visible: can("create_order")
    },
    {
        rank: 5,
        title: "orders",
        icon: "lists",
        link: "/pos/sale/order-list",
        visible: can("list_order")
    },

    {
        rank: 3,
        title: "new proforma invoice",
        icon: "receipt",
        link: "/pos/sale/proforma-invoice-form",
        visible: can("create_proforma_invoice")
    },
    {
        rank: 6,
        title: "list proforma invoices",
        icon: "summarize",
        link: "/pos/sale/proforma-invoice-list",
        visible: can("list_proforma_invoice")
    },
    {
        rank: 7,
        title: "list done proforma invoices",
        icon: "summarize",
        link: "/pos/sale/proforma-done-list",
        visible: can("list_done_proforma_invoice")
    }
]

export default pointOfSaleMenu