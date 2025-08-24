import { can } from "../../permissions"

export type posMenuType = {
    rank: number
    link: string
    icon: string
    title: string
    onClick?(): void,
    visible: boolean
    reloadLink?: boolean
}

const posMenus: posMenuType[] = [
    {
        rank: 0,
        icon: "dashboard",
        title: "dashboard",
        link: "/pos/dashboard",
        visible: can("view_dashboard")
    },

    {
        rank: 3,
        visible: true,
        icon: "point_of_sale",
        title: "Point of Sale",
        link: "/pos/point-of-sale",
    },
    {
        rank: 1,
        visible: true,
        icon: "inventory",
        title: "Inventory Management",
        link: "/pos/inventory-management",
    },
    {
        rank: 5,
        visible: true,
        link: "/pos/report",
        icon: "receipt_long",
        title: "Report & analytics",
    },
    {
        rank: 4,
        visible: true,
        icon: "groups",
        title: "Customer Management",
        link: "/pos/customer-management",
    },
    {
        rank: 3,
        visible: true,
        title: "User Management",
        icon: "admin_panel_settings", // manage_accounts
        link: "/pos/user-management",
    },
    {
        rank: 7,
        visible: true,
        icon: "finance_chip", //contactless
        title: "Payments",
        link: "/pos/payment/list",
    },
    {
        rank: 11,
        visible: true,
        icon: "settings",
        title: "Settings",
        link: "/pos/settings",
    },
    {
        rank: 10,
        visible: true,
        icon: "help", // support
        title: "Help & Support",
        link: "/pos/help-and-support",
    },
    {
        rank: 12,
        link: "#",
        visible: true,
        icon: "logout",
        title: "Logout",
        onClick: () => {
            window.localStorage.clear()
            window.location.reload()
        }
    },
    {
        rank: 9,
        link: "/",
        visible: true,
        reloadLink: true,
        title: "main system",
        icon: "switch_access_2"
    },

    {
        rank: 8,
        icon: "read_more",
        visible: true,
        title: "Additional features",
        link: "/pos/additional-features"
    }
]

export default posMenus