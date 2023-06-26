import React from 'react'
import classNames from 'classnames'
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles'
import MenuItem from '@material-ui/core/MenuItem'
import MenuList from '@material-ui/core/MenuList'
import Grow from '@material-ui/core/Grow'
import Paper from '@material-ui/core/Paper'
import ClickAwayListener from '@material-ui/core/ClickAwayListener'
import Poppers from '@material-ui/core/Popper'
import Divider from '@material-ui/core/Divider'
// @material-ui/icons
import Person from '@material-ui/icons/Person'
// import Notifications from '@material-ui/icons/Notifications'
// core components
import Button from 'components/CustomButtons/Button.js'

import styles from 'assets/jss/material-dashboard-react/components/headerLinksStyle.js'
import { logout } from 'store/auth'
import { useDispatch } from 'react-redux'
// import { notificationAdded } from 'store/dashboard'
// import { getNotifications } from 'store/dashboard'
// import { setReadednotification } from 'store/dashboard'
// import { setNotificationsPage } from 'store/dashboard'
// import io from 'socket.io-client'

// const socket = io('ws://localhost:5000')

const useStyles = makeStyles(styles)

export default function AdminNavbarLinks() {
    const dispatch = useDispatch()
    // const { notifications, notificationsPage } = useSelector(
    //     (state) => state.dashboard
    // )

    // const { user } = useSelector((state) => state.auth)

    const classes = useStyles()
    // const [openNotification, setOpenNotification] = React.useState(null)
    const [openProfile, setOpenProfile] = React.useState(null)
    // const handleClickNotification = (event) => {
    //     if (openNotification && openNotification.contains(event.target)) {
    //         setOpenNotification(null)
    //     } else {
    //         setOpenNotification(event.currentTarget)
    //         dispatch(setReadednotification())
    //         socket.emit('notification-readed', notifications.notifications)
    //     }
    // }
    // const handleCloseNotification = () => {
    //     setOpenNotification(null)
    // }
    const handleClickProfile = (event) => {
        if (openProfile && openProfile.contains(event.target)) {
            setOpenProfile(null)
        } else {
            setOpenProfile(event.currentTarget)
        }
    }
    const handleCloseProfile = () => {
        setOpenProfile(null)
    }
    // const getMoreNotifications = () => {
    //     console.log('load more')
    //     dispatch(setNotificationsPage({ page: notificationsPage + 1 }))
    // }
    // useEffect(() => {
    //     socket.on('notification', (user) => {
    //         dispatch(notificationAdded(user))
    //     })
    // }, [])
    // useEffect(() => {
    //     dispatch(
    //         getNotifications({ access: user.token, page: notificationsPage })
    //     )
    // }, [notificationsPage])

    return (
        <div className={classes.managerWrapper}>
            {/* <div className={classes.manager}>
                <Button
                    color={window.innerWidth > 959 ? 'transparent' : 'white'}
                    justIcon={window.innerWidth > 959}
                    simple={!(window.innerWidth > 959)}
                    aria-owns={
                        openNotification ? 'notification-menu-list-grow' : null
                    }
                    aria-haspopup="true"
                    onClick={handleClickNotification}
                    className={classes.buttonLink}
                >
                    <Notifications className={classes.icons} />
                    {notifications &&
                        notifications.notifications.filter((e) => !e.readed)
                            .length > 0 && (
                            <span className={classes.notifications}>
                                {
                                    notifications.notifications.filter(
                                        (e) => !e.readed
                                    ).length
                                }
                            </span>
                        )}
                </Button>
                <Poppers
                    open={Boolean(openNotification)}
                    anchorEl={openNotification}
                    transition
                    disablePortal
                    className={
                        classNames({
                            [classes.popperClose]: !openNotification,
                        }) +
                        ' ' +
                        classes.popperNav
                    }
                >
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            id="notification-menu-list-grow"
                            style={{
                                transformOrigin:
                                    placement === 'bottom'
                                        ? 'center top'
                                        : 'center bottom',
                            }}
                        >
                            <Paper>
                                <ClickAwayListener
                                    onClickAway={handleCloseNotification}
                                >
                                    <MenuList role="menu">
                                        {notifications?.notifications.map(
                                            (notification, i) => {
                                                return (
                                                    <MenuItem
                                                        key={`notification-item-${i}`}
                                                        onClick={
                                                            handleCloseNotification
                                                        }
                                                        className={
                                                            classes.dropdownItem
                                                        }
                                                    >
                                                        {notification.body}
                                                    </MenuItem>
                                                )
                                            }
                                        )}
                                       {console.log("math", Math.ceil(notifications?.total / 10))}
                                        {Math.ceil(notifications?.total / 10) >
                                            notificationsPage + 1 && (
                                            <MenuItem
                                                role="menu"
                                                onClick={() =>
                                                    getMoreNotifications()
                                                }
                                            >
                                                <p>Cargar más</p>
                                            </MenuItem>
                                        )}
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Poppers>
            </div> */}
            <div className={classes.manager}>
                <Button
                    color={window.innerWidth > 959 ? 'transparent' : 'white'}
                    justIcon={window.innerWidth > 959}
                    simple={!(window.innerWidth > 959)}
                    aria-owns={openProfile ? 'profile-menu-list-grow' : null}
                    aria-haspopup="true"
                    onClick={handleClickProfile}
                    className={classes.buttonLink}
                >
                    <Person className={classes.icons} />
                </Button>
                <Poppers
                    open={Boolean(openProfile)}
                    anchorEl={openProfile}
                    transition
                    disablePortal
                    className={
                        classNames({ [classes.popperClose]: !openProfile }) +
                        ' ' +
                        classes.popperNav
                    }
                >
                    {({ TransitionProps, placement }) => (
                        <Grow
                            {...TransitionProps}
                            id="profile-menu-list-grow"
                            style={{
                                transformOrigin:
                                    placement === 'bottom'
                                        ? 'center top'
                                        : 'center bottom',
                            }}
                        >
                            <Paper>
                                <ClickAwayListener
                                    onClickAway={handleCloseProfile}
                                >
                                    <MenuList role="menu">
                                        <MenuItem
                                            onClick={handleCloseProfile}
                                            className={classes.dropdownItem}
                                        >
                                            Profile
                                        </MenuItem>
                                        <MenuItem
                                            onClick={handleCloseProfile}
                                            className={classes.dropdownItem}
                                        >
                                            Settings
                                        </MenuItem>
                                        <Divider light />
                                        <MenuItem
                                            onClick={() => {
                                                handleCloseProfile()
                                                dispatch(logout())
                                            }}
                                            className={classes.dropdownItem}
                                        >
                                            Logout
                                        </MenuItem>
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Poppers>
            </div>
        </div>
    )
}
