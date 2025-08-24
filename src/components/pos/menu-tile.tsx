import React from "react"
import { posMenuType } from "../../helpers/pos/menu/menu"
import { Icon } from "../elements"
import { string } from "fast-web-kit"
import { Link } from "react-router-dom"

const PosMenuTile: React.FunctionComponent<posMenuType> = React.memo((props: posMenuType) => (
    props.reloadLink
        ?
        <a href={props.link} className="pos-menu-item" onClick={props.onClick}>
            <Icon name={props.icon} />
            <span className="title">
                {string.toTitleCase(props.title)}
            </span>
        </a>
        :
        <Link to={props.link} className="pos-menu-item" onClick={props.onClick}>
            <Icon name={props.icon} />
            <span className="title">
                {string.toTitleCase(props.title)}
            </span>
        </Link>
))

export default PosMenuTile
