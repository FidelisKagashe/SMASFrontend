import React from "react"
import { ApplicationContext } from "../context"
import { Icon } from "./elements"
import { applicationName, text } from "../helpers"
import { useHistory } from "react-router-dom"

const PosHeader: React.FunctionComponent = React.memo(() => {

    const history = useHistory()
    const { application } = React.useContext(ApplicationContext)

    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const iconName: string = isFullscreen ? "fullscreen_exit" : "fullscreen"

    const toggleFullscreen = () => {
        if (!isFullscreen) {
            if (document.documentElement.requestFullscreen)
                document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen)
                document.exitFullscreen();
        }
        setIsFullscreen(!isFullscreen);
    }

    const goBack = () => {
        history.goBack();
    };


    return (
        <nav className="pos-header">
            <div className="section" onClick={goBack}>
                <Icon name="arrow_circle_left" />
            </div>
            <div className="center-section">
                <span className="name">{application.user.branch ? text.reFormat(application.user.branch.name) : applicationName}</span>
            </div>
            <div className="section right-section">
                <Icon name={iconName} onClick={toggleFullscreen} />
            </div>
        </nav>
    )

})

export default PosHeader