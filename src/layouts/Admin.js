import React from 'react'
import { Switch, Route } from 'react-router-dom'
// creates a beautiful scrollbar
import PerfectScrollbar from 'perfect-scrollbar'
import 'perfect-scrollbar/css/perfect-scrollbar.css'
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles'
// core components
import Navbar from 'components/Navbars/Navbar.js'
import Sidebar from 'components/Sidebar/Sidebar.js'
// import FixedPlugin from 'components/FixedPlugin/FixedPlugin.js'

import { dashboardRoutes } from 'routes.js'

import styles from 'assets/jss/material-dashboard-react/layouts/adminStyle.js'
import { getConfigRequest } from '../store/config'
import { useDispatch, useSelector } from 'react-redux'

let ps

const mainRoutes = dashboardRoutes.map((prop, key) => {
    if (prop.layout === '/admin') {
        return (
            <Route
                exact
                path={prop.layout + prop.path}
                component={prop.component}
                key={key}
            ></Route>
        )
    }
    return null
})

const childRoutes = dashboardRoutes.map((prop) => {
    return prop.childrens
        ? prop.childrens.map((e, i) => {
              // console.log("e", prop.layout + prop.path + e.path)
              return (
                  <Route
                      path={prop.layout + prop.path + e.path}
                      component={e.component}
                      key={`child-${e.path}-${i}`}
                  />
              )
          })
        : null
})

const useStyles = makeStyles(styles)

export default function Admin({ ...rest }) {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { configDetail } = useSelector((state) => state.config)
    // styles
    const classes = useStyles()
    // ref to help us initialize PerfectScrollbar on windows devices
    const mainPanel = React.createRef()
    // states and functions
    const [tenant, setTenant] = React.useState(null)
    const [color] = React.useState('blue')
    const [mobileOpen, setMobileOpen] = React.useState(false)

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    const resizeFunction = () => {
        if (window.innerWidth >= 960) {
            setMobileOpen(false)
        }
    }
    const handleDashboardRoutes = () => {
        return dashboardRoutes.filter((prop) => {
          const isActivate =configDetail?.mercadoPagoConfigured
      
          return (
            prop.layout === '/admin' &&
            (!prop.needConfig || (prop.needConfig && isActivate))
          );
        });
      };
    React.useEffect(() => {
        if (navigator.platform.indexOf('Win') > -1) {
            ps = new PerfectScrollbar(mainPanel.current, {
                suppressScrollX: true,
                suppressScrollY: false,
            })
            document.body.style.overflow = 'hidden'
        }
        window.addEventListener('resize', resizeFunction)
        // Specify how to clean up after this effect:
        return function cleanup() {
            if (navigator.platform.indexOf('Win') > -1) {
                ps.destroy()
            }
            window.removeEventListener('resize', resizeFunction)
        }
    }, [mainPanel])

    React.useEffect(() => {
        const verifyTenant = async () => {
            try {
                // Use fetch to verify if the subdomain exists
                const response = await fetch(
                    `/tenant/verify-tenat-admin?subdomain=${subdomain}`
                )
                console.log('parseResponse', response)
                if (response.ok) {
                    console.log('valid subdomain')
                    setTenant(subdomain)
                }
            } catch (error) {
                console.error('Error fetching tenant:', error)
                setTenant(null)
            }
        }
        const subdomain = window.location.hostname.split('.')[0]
        if (subdomain) {
            verifyTenant(subdomain)
        } else {
            console.error('Tenant not found')
        }
    }, [])

    React.useEffect(() => {
        const getConfig = async () => {
            try {
                dispatch(getConfigRequest({ access: user.token }))
            } catch (error) {
                console.error('Error fetching config:', error)
            }
        }

        getConfig()
    }, [])

    return (
        <div className={classes.wrapper}>
            <Sidebar
                routes={handleDashboardRoutes()}
                handleDrawerToggle={handleDrawerToggle}
                open={mobileOpen}
                color={color}
                {...rest}
            />
            <div className={classes.mainPanel} ref={mainPanel}>
                <Navbar
                    routes={handleDashboardRoutes()}
                    handleDrawerToggle={handleDrawerToggle}
                    {...rest}
                />
                {/* On the /maps route we want the map to be on full screen - this is not possible if the content and conatiner classes are present because they have some paddings which would make the map smaller */}
                <div className={classes.content}>
                    <div className={classes.container}>
                        {/* {console.log("childRoutes", childRoutes)} */}
                        {tenant && (
                            <Switch>
                                {mainRoutes}
                                {childRoutes}
                            </Switch>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
