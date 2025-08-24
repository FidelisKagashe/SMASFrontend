import { can } from "../../permissions";
import { posMenuType } from "./menu";

const customerManagementMenu: posMenuType[] = [
    {
        rank: 0,
        title: "New customer",
        icon: "person_add",
        link: "/pos/customer/form",
        visible: can("create_customer"),
    },

    {
        rank: 2,
        title: "customers",
        icon: "groups",
        link: "/pos/customer/list",
        visible: can("list_customer"),
    },

    {
        rank: 3,
        title: "new debt",
        icon: "request_quote",
        link: "/pos/debt/form",
        visible: can("create_debt")
    },

    {
        rank: 4,
        title: "debts",
        icon: "people",
        link: "/pos/debt/list",
        visible: can("list_debt")
    },

    {
        rank: 5,
        title: "debt history",
        icon: "people",
        link: "/pos/debt/history-list",
        visible: can("list_debt_history")
    }
]

export default customerManagementMenu