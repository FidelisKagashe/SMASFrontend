import customerManagementMenu from "./menu/customer-management"
import inventoryMenu from "./menu/inventory"
import posMenus from "./menu/menu"
import pointOfSaleMenu from "./menu/point-of-sale"
import reportMenu from "./menu/report"
import userManagementMenu from "./menu/user-management"

export const isPos = (): boolean => window.location.pathname.includes("/pos")

export const menuVariables: any = {
    "pos": posMenus,
    "report": reportMenu,
    "point-of-sale": pointOfSaleMenu,
    "inventory-management": inventoryMenu,
    "user-management": userManagementMenu,
    "customer-management": customerManagementMenu
}
