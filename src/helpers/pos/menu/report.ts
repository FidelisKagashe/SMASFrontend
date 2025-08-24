import { can } from "../../permissions";
import { posMenuType } from "./menu";

const reportMenu: posMenuType[] = [
    {
        rank: 0,
        title: "New report",
        icon: "receipt_long",
        link: "/pos/report/form",
        visible: can("create_report"),
    },

    {
        rank: 1,
        title: "income statement",
        icon: "receipt",
        link: "/pos/report/income-statement",
        visible: can("view_income_statement"),
    }

]

export default reportMenu