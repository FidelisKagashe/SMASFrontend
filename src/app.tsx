/* dependencies */
import { time } from "fast-web-kit"
import React, { Suspense } from "react"
import Loader from "./components/loader"
import { Helmet, HelmetProvider } from "react-helmet-async"
import Sidebar from "./components/sidebar"
import Notification from "./components/notification"
import { ApplicationContext } from "./context"
import { Main } from "./components/elements"
import { useLocation } from "react-router-dom"
import PosHeader from "./components/pos-header"

/* creating memorized application functional component */
const App: React.FunctionComponent = React.memo(() => {

  // application context
  const location = useLocation()
  const currentHour = time.currentHour()
  const { application } = React.useContext(ApplicationContext)

  React.useEffect(() => {
    application.dispatch({ isPos: location.pathname.includes("pos") })
    // eslint-disable-next-line
  }, [location.pathname])

  // application.dispatch({ isPos: pathname.includes("pos") })
  const theme = application.state.theme !== "auto" ? `${application.state.theme}` : ((currentHour >= 18) || (currentHour <= 6)) ? "dark" : "light"

  // changing primary color
  React.useEffect(() => {
    let primaryColor: string = application.state.primaryColor
    document.documentElement.style.setProperty("--primary-color", primaryColor)
  }, [application.state.primaryColor])

  React.useEffect(() => {
    if (application.user?.branch) {
      const { branch: { settings: { primary_color } } } = application.user
      if (primary_color)
        application.dispatch({ primaryColor: primary_color })
    }
    // eslint-disable-next-line
  }, [])

  const history = window.history;

  React.useEffect(() => {
    const handlePopstate = (event: any) => {
      // Check if can go back or forward
      if (event.state) {
        // Go back or forward to the previous/next state in History
        history.go(event.state.delta);
      }
    };

    window.addEventListener('popstate', handlePopstate);

    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
    // eslint-disable-next-line
  }, [history]);

  return (
    <HelmetProvider>
      <Helmet>
        <link rel="stylesheet" href={`/${theme}.css`} />
        <meta name="theme-color" content={theme === "light" ? application.state.lightColor : application.state.darkColor} />
        <meta name="msapplication-TileColor" content={theme === "light" ? application.state.lightColor : application.state.darkColor} />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color={theme === "light" ? application.state.lightColor : application.state.darkColor} />
      </Helmet>
      <Suspense fallback={<Loader loading={true} />}>
        <Loader />
        {
          application.state.authenticated
            ?
            <>
              {application.state.isPos ? <PosHeader /> : <Sidebar />}
            </>
            : null
        }
        <Notification />
        <Main />
      </Suspense>
    </HelmetProvider>
  )
})

/* exporting application component */
export default App