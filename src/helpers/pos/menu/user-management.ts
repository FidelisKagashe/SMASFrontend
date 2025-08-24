import { can } from "../../permissions";
import { posMenuType } from "./menu";

const userManagementMenu: posMenuType[] = [
    {
        rank: 0,
        title: "New role",
        icon: "admin_panel_settings",
        link: "/pos/role/form",
        visible: can("create_role"),
    },

    {
        rank: 2,
        title: "roles",
        icon: "list_alt",
        link: "/pos/role/list",
        visible: can("list_role"),
    },

    {
        rank: 3,
        title: "new user",
        icon: "person_add",
        link: "/pos/user/form",
        visible: can("create_order")
    },
    
    {
        rank: 4,
        title: "users",
        icon: "people",
        link: "/pos/user/list",
        visible: can("list_user")
    }
]

export default userManagementMenu