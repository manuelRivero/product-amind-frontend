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
// @material-ui/icons
import Person from '@material-ui/icons/Person'
import Notifications from '@material-ui/icons/Notifications'
// core components
import Button from 'components/CustomButtons/Button.js'
import { useHistory } from 'react-router-dom'

import styles from 'assets/jss/material-dashboard-react/components/headerLinksStyle.js'
import { logout } from 'store/auth'
import { useDispatch, useSelector } from 'react-redux'
import { getNotifications } from 'store/dashboard'
import { setReadednotification } from 'store/dashboard'
import { setNotificationsPage } from 'store/dashboard'
import socketService from '../../services/socket'

const useStyles = makeStyles(styles)

export default function AdminNavbarLinks() {
    const dispatch = useDispatch()
    const history = useHistory()
    const { notifications, notificationsPage } = useSelector(
        (state) => state.dashboard
    )

    const { user } = useSelector((state) => state.auth)

    const classes = useStyles()
    const [openNotification, setOpenNotification] = React.useState(null)
    const [openProfile, setOpenProfile] = React.useState(null)

    // Cargar notificaciones iniciales al montar el componente
    React.useEffect(() => {
        if (user?.token && notificationsPage === 0) {
            dispatch(
                getNotifications({ access: user.token, page: 0 })
            )
        }
    }, [user?.token, dispatch])

    // Cargar más notificaciones cuando cambia la página
    React.useEffect(() => {
        if (user?.token && notificationsPage > 0) {
            dispatch(
                getNotifications({ access: user.token, page: notificationsPage })
            )
        }
    }, [notificationsPage, user?.token, dispatch])

    const handleClickNotification = (event) => {
        if (openNotification && openNotification.contains(event.target)) {
            setOpenNotification(null)
        } else {
            setOpenNotification(event.currentTarget)
            // Marcar notificaciones como leídas cuando se abre el menú
            if (notifications?.notifications) {
                const unreadNotifications = notifications.notifications.filter(
                    (e) => !e.readed
                )
                if (unreadNotifications.length > 0) {
                    dispatch(setReadednotification())
                    // Enviar evento al servidor vía Socket.IO
                    socketService.emitNotificationRead(unreadNotifications)
                }
            }
        }
    }

    const handleCloseNotification = () => {
        setOpenNotification(null)
    }

    const handleNotificationItemClick = (notification) => {
        // Navegar al detalle de la orden al hacer clic en una notificación
        // Intentar obtener el ID de la orden desde diferentes propiedades posibles
        const orderId = notification.saleId || notification.orderId || notification.sale?._id || notification.order?._id
        
        if (orderId) {
            history.push(`/admin/orders/detail/${orderId}`)
        } else {
            // Si no hay ID, navegar a la tabla de órdenes como fallback
            history.push('/admin/orders')
        }
        handleCloseNotification()
    }

    const getMoreNotifications = () => {
        if (notifications?.total && notificationsPage !== undefined) {
            const totalPages = Math.ceil(notifications.total / 10)
            if (notificationsPage + 1 < totalPages) {
                dispatch(setNotificationsPage({ page: notificationsPage + 1 }))
            }
        }
    }

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

    // Contar notificaciones no leídas
    const unreadCount = notifications?.notifications
        ? notifications.notifications.filter((e) => !e.readed).length
        : 0

    // Verificar si hay más páginas disponibles
    const hasMorePages = notifications?.total
        ? Math.ceil(notifications.total / 10) > notificationsPage + 1
        : false

    return (
        <div className={classes.managerWrapper}>
            <div className={classes.manager}>
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
                    {unreadCount > 0 && (
                        <span className={classes.notifications}>
                            {unreadCount}
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
                                        {notifications?.notifications &&
                                        notifications.notifications.length > 0 ? (
                                            <>
                                                {notifications.notifications.map(
                                                    (notification, i) => {
                                                        return (
                                                            <MenuItem
                                                                key={`notification-item-${i}`}
                                                                onClick={() =>
                                                                    handleNotificationItemClick(notification)
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
                                                {hasMorePages && (
                                                    <MenuItem
                                                        role="menu"
                                                        onClick={
                                                            getMoreNotifications
                                                        }
                                                        className={
                                                            classes.dropdownItem
                                                        }
                                                    >
                                                        Cargar más
                                                    </MenuItem>
                                                )}
                                            </>
                                        ) : (
                                            <MenuItem
                                                className={classes.dropdownItem}
                                                disabled
                                            >
                                                No hay notificaciones
                                            </MenuItem>
                                        )}
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Poppers>
            </div>
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
                                            onClick={() => {
                                                handleCloseProfile()
                                                dispatch(logout())
                                            }}
                                            className={classes.dropdownItem}
                                        >
                                            Cerrar sesión
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
