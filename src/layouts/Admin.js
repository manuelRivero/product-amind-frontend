import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
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
    console.log('admin routes')
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
    // initialize and destroy the PerfectScrollbar plugin
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
        const verifyTenant = async ()=>{
            try {
                // Use fetch to verify if the subdomain exists
                const response = await fetch(`/tenant/verify-tenat-admin?subdomain=${subdomain}`);
                console.log('parseResponse', response)
                if (response.ok) {
                  console.log('valid subdomain');
                  setTenant(subdomain)
                }
              } catch (error) {
                console.error('Error fetching tenant:', error);
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

    return (
        <div className={classes.wrapper}>
            <Sidebar
                routes={dashboardRoutes}
                handleDrawerToggle={handleDrawerToggle}
                open={mobileOpen}
                color={color}
                {...rest}
            />
            <div className={classes.mainPanel} ref={mainPanel}>
                <Navbar
                    routes={dashboardRoutes}
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
                                <Redirect from="/admin" to="/admin/dashboard" />
                            </Switch>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
