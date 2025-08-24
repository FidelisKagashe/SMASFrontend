import React from "react"
import { array } from "fast-web-kit"
import { routerProps } from "../../types"
import { ApplicationContext } from "../../context"
import posMenus, { posMenuType } from "../../helpers/pos/menu/menu"
import { setPageTitle } from "../../helpers"
import PosMenuTile from "../../components/pos/menu-tile"
import { menuVariables } from "../../helpers/pos"

const PosMenu: React.FunctionComponent<routerProps> = React.memo((props: routerProps) => {

    const pathname = props.location.pathname
    const { application } = React.useContext(ApplicationContext)

    React.useEffect(() => {
        setPageTitle("Point of Sale")
        return () => application.unMount()
        // eslint-disable-next-line
    }, [])

    const renderMenus = React.useCallback(() => {
        try {

            const pathnameSplit: string[] = pathname.split("/")
            const menuName = pathnameSplit[2]
            let activeMenu = posMenus

            if (menuName) {
                const menuExist = menuVariables[menuName]
                activeMenu = menuExist
            }


            return array.sort(activeMenu, "asc", "rank").map((menu: posMenuType, index: number) => (
                <div className="" key={index}>
                    <PosMenuTile
                        rank={menu.rank}
                        icon={menu.icon}
                        link={menu.link}
                        title={menu.title}
                        visible={menu.visible}
                        onClick={menu.onClick}
                        reloadLink={menu.reloadLink}
                    />
                </div>
            ))

        } catch (error) {
            application.dispatch({ notification: (error as Error).message })
        }
        // eslint-disable-next-line
    }, [])

    return (
        <div className="row">
            <div className="col s12 l8 offset-l2">
                <div className="pos-menu-container">
                    {renderMenus()}
                </div>
            </div>
        </div>
    )
})

export default PosMenu