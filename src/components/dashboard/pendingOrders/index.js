import React, { useState, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import GridItem from 'components/Grid/GridItem.js'
import GridContainer from 'components/Grid/GridContainer.js'
import Table from 'components/Table/Table.js'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
    changePendingSalesStatus,
    getPendingOrders,
} from '../../../store/dashboard'
import { useForm } from 'react-hook-form'
import Button from 'components/CustomButtons/Button'
import {
    Box,
    CircularProgress,
    ClickAwayListener,
    Fade,
    MenuItem,
    MenuList,
    Popper,
    Tabs,
    Tab,
    Badge,
} from '@material-ui/core'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import PropTypes from 'prop-types'
import ReactPaginate from 'react-paginate'

import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import { Link } from 'react-router-dom'
import { RemoveRedEye } from '@material-ui/icons'
import { saleStatus } from '../../../const/sales'
import StatusChangeModal from '../../StatusChangeModal'
import { useStatusChange } from '../../../hooks/useStatusChange'
import { formatNumber } from '../../../helpers/product'
import { formatDateToArgentina } from '../../../helpers/date'
import EmptyTablePlaceholder from '../../EmptyTablePlaceholder'

const styles = {
    pagination: {
        display: 'flex',
        margin: 0,
        padding: 0,
        listStyle: 'none',
        gap: '1rem',
        marginTop: '1rem',
        justifyContent: 'center',
        alignItems: 'center',
    },
    page: {
        padding: '.5rem',
        borderRadius: '4px',
        border: 'solid 1px transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '25px',
        height: '25px',
        '& > a': {
            color: '#3c4858',
        },
    },
    activePage: {
        border: 'solid 1px #00ACC1 !important',
        '& > a': {
            color: '#00ACC1',
        },
    },
    cardCategoryWhite: {
        '&,& a,& a:hover,& a:focus': {
            color: 'rgba(255,255,255,.62)',
            margin: '0',
            fontSize: '14px',
            marginTop: '0',
            marginBottom: '0',
        },
        '& a,& a:hover,& a:focus': {
            color: '#FFFFFF',
        },
    },
    cardTitleWhite: {
        color: '#FFFFFF',
        marginTop: '0px',
        minHeight: 'auto',
        fontWeight: '300',
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: '3px',
        textDecoration: 'none',
        '& small': {
            color: '#777',
            fontSize: '65%',
            fontWeight: '400',
            lineHeight: '1',
        },
    },
    filtersWrapper: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    dropdown: {
        backgroundColor: '#fff',
        padding: '1rem',
        borderRadius: '8px',
        zIndex: 100,
        position: 'relative',
    },
    activeStatus: {
        backgroundColor: '#c2c2c2',
    },
    modalBody: {
        padding: '1rem',
    },
    paymentImageRow: {
        display: 'flex',
        justifyContent: 'center',
    },
    paymentImage: {
        maxWidth: '166px',
    },
    dropZone: {
        borderRadius: '16px',
        border: 'solid 1px #c2c2c2',
        display: 'flex',
        justifyContent: 'center',
        padding: '1rem',
        flexDirection: 'column',
        alignItems: 'center',
    },
    modalButtonRow: {
        display: 'flex',
        justifyContent: 'center',
    },
    tabsContainer: {
        marginBottom: '1rem',
        borderBottom: '1px solid #e0e0e0',
    },
    tabRoot: {
        minHeight: '48px',
        textTransform: 'none',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#3c4858',
        '&$selected': {
            color: '#00ACC1',
        },
    },
    selected: {},
    tabIndicator: {
        backgroundColor: '#00ACC1',
    },
    badge: {
        marginLeft: '15px',
    },
}
const useStyles = makeStyles(styles)

export default function PendingOrders() {
    const { user } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const { loadingPendingOrders, loadingChangeStatus } = useSelector(
        (state) => state.dashboard
    )
    const classes = useStyles()
    // Paginación independiente para cada tab
    const [deliveryPage, setDeliveryPage] = useState(0)
    const [pickUpPage, setPickUpPage] = useState(0)
    
    // Estado local para mantener datos de cada tipo
    const [deliveryOrdersData, setDeliveryOrdersData] = useState(null)
    const [pickUpOrdersData, setPickUpOrdersData] = useState(null)
    
    // Estado para mantener los datos de la página 0 (para badges)
    const [deliveryPage0Data, setDeliveryPage0Data] = useState(null)
    const [pickUpPage0Data, setPickUpPage0Data] = useState(null)

    // Cargar datos iniciales para ambos tabs
    useEffect(() => {
        const loadInitialData = async () => {
            // Cargar datos de DELIVERY (página 0)
            const deliveryResult = await dispatch(getPendingOrders({ 
                access: user.token, 
                page: 0, 
                deliveryType: 'DELIVERY' 
            })).unwrap()
            setDeliveryOrdersData(deliveryResult)
            setDeliveryPage0Data(deliveryResult)
            
            // Cargar datos de PICK-UP (página 0)
            const pickUpResult = await dispatch(getPendingOrders({ 
                access: user.token, 
                page: 0, 
                deliveryType: 'PICK-UP' 
            })).unwrap()
            setPickUpOrdersData(pickUpResult)
            setPickUpPage0Data(pickUpResult)
        }
        loadInitialData()
    }, [])
    
    // Cargar datos cuando cambia la página del tab activo
    useEffect(() => {
        const loadData = async () => {
            if (tabValue === 0) {
                // Tab de DELIVERY
                const result = await dispatch(getPendingOrders({ 
                    access: user.token, 
                    page: deliveryPage, 
                    deliveryType: 'DELIVERY' 
                })).unwrap()
                setDeliveryOrdersData(result)
            } else {
                // Tab de PICK-UP
                const result = await dispatch(getPendingOrders({ 
                    access: user.token, 
                    page: pickUpPage, 
                    deliveryType: 'PICK-UP' 
                })).unwrap()
                setPickUpOrdersData(result)
            }
        }
        loadData()
    }, [deliveryPage, pickUpPage, tabValue])
    
    // Recargar datos cuando se completa un cambio de estado
    // Usamos useRef para evitar recargas innecesarias
    const prevLoadingStatus = useRef(loadingChangeStatus)
    useEffect(() => {
        // Solo recargar si el estado cambió de un ID a null (cambio completado)
        if (prevLoadingStatus.current !== null && loadingChangeStatus === null) {
            const reloadData = async () => {
                // Recargar el tab actual
                if (tabValue === 0) {
                    const result = await dispatch(getPendingOrders({ 
                        access: user.token, 
                        page: deliveryPage, 
                        deliveryType: 'DELIVERY' 
                    })).unwrap()
                    setDeliveryOrdersData(result)
                } else {
                    const result = await dispatch(getPendingOrders({ 
                        access: user.token, 
                        page: pickUpPage, 
                        deliveryType: 'PICK-UP' 
                    })).unwrap()
                    setPickUpOrdersData(result)
                }
                
                // Recargar página 0 de ambos tabs para actualizar badges
                const deliveryPage0Result = await dispatch(getPendingOrders({ 
                    access: user.token, 
                    page: 0, 
                    deliveryType: 'DELIVERY' 
                })).unwrap()
                setDeliveryPage0Data(deliveryPage0Result)
                
                const pickUpPage0Result = await dispatch(getPendingOrders({ 
                    access: user.token, 
                    page: 0, 
                    deliveryType: 'PICK-UP' 
                })).unwrap()
                setPickUpPage0Data(pickUpPage0Result)
            }
            reloadData()
        }
        prevLoadingStatus.current = loadingChangeStatus
    }, [loadingChangeStatus])

    const renderOrdersTable = (filteredOrders, currentPage, setCurrentPage, totalOrders) => {
        if (!filteredOrders || filteredOrders.length === 0) {
            return (
                <EmptyTablePlaceholder title="No hay órdenes para mostrar" />
            )
        }

        return (
            <>
                <Table
                    tableHeaderColor="primary"
                    tableHead={[
                        'Id',
                        'Total',
                        'Fecha',
                        'Estatus',
                        'Cambiar estatus',
                        'Acciones',
                    ]}
                    tableData={filteredOrders.map((e) => {
                        // Mostrar motivo de cancelación si el estado es CANCELADO
                        const statusDisplay = e.status === 'CANCELADO' && e.cancelReason 
                            ? `${e.status} - ${e.cancelReason || 'Motivo no especificado'}`
                            : e.status

                        // Calcular comisión y total recibido
                        const marketplaceFee = e.marketplaceFee || 0;
                        // Si marketplaceFee es menor que 1, asumimos que viene como decimal (0.03 = 3%)
                        const feePercentage = marketplaceFee < 1 ? marketplaceFee * 100 : marketplaceFee;
                        
                        // Calcular el total final considerando el cupón
                        // Usar e.total o e.totalPrice (verificar cuál está disponible, total tiene prioridad)
                        let finalTotal = e.total || e.totalPrice || 0;
                        if (e.coupon && e.coupon.discount > 0) {
                            // Si el backend envía totalBeforeCoupon, usarlo, sino calcular desde total + discount
                            if (e.coupon.totalBeforeCoupon) {
                                finalTotal = e.coupon.totalBeforeCoupon - e.coupon.discount;
                            } else {
                                // Si no viene totalBeforeCoupon, restar el descuento del cupón
                                finalTotal = finalTotal - e.coupon.discount;
                            }
                        }
                        
                        const commissionAmount = (finalTotal * feePercentage / 100);
                        const totalReceived = finalTotal - commissionAmount;

                        return [
                            <p key={`sale-id-${e._id}`}>
                                {e._id}
                            </p>,
                            <p
                                key={`sale-total-${e._id}`}
                            >
                                ${formatNumber(totalReceived.toFixed(2))}
                            </p>,
                            <p
                                key={`sale-date-${e._id}`}
                            >
                                {formatDateToArgentina(e.createdAt)}
                            </p>,
                            <p
                                key={`sale-status-${e._id}`}
                            >
                                {statusDisplay}
                            </p>,
                            <ChangeStatusDropdown
                                key={e._id}
                                sale={e}
                            />,
                            <Link
                                key={`detail-button-${e._id}`}
                                to={`/admin/orders/detail/${e._id}`}
                            >
                                <Button
                                    isLoading={false}
                                    variant="contained"
                                    color="primary"
                                    type="button"
                                >
                                    <RemoveRedEye />
                                </Button>
                            </Link>,
                        ]
                    })}
                />
                <ReactPaginate
                    forcePage={currentPage}
                    pageClassName={classes.page}
                    containerClassName={classes.pagination}
                    activeClassName={classes.activePage}
                    breakLabel="..."
                    nextLabel={
                        <Button
                            isLoading={false}
                            variant="contained"
                            color="primary"
                            type="button"
                            justIcon
                        >
                            <ChevronRightIcon />
                        </Button>
                    }
                    onPageChange={(e) => {
                        setCurrentPage(e.selected)
                    }}
                    pageRangeDisplayed={5}
                    pageCount={Math.ceil(
                        totalOrders / 10
                    )}
                    previousLabel={
                        <Button
                            isLoading={false}
                            variant="contained"
                            color="primary"
                            type="button"
                            justIcon
                        >
                            <ChevronLeftIcon />
                        </Button>
                    }
                    renderOnZeroPageCount={null}
                />
            </>
        )
    }

    // Usar datos locales (ya vienen filtrados del backend)
    const deliveryOrders = deliveryOrdersData?.data?.sales || []
    const pickUpOrders = pickUpOrdersData?.data?.sales || []

    // Calcular totales para los badges (solo órdenes pendientes - estado PAGADO)
    // Usar los datos de la página 0 para el badge
    const deliveryOrdersCount = (deliveryPage0Data?.data?.sales || []).filter(order => order.status === 'PAGADO').length
    const pickUpOrdersCount = (pickUpPage0Data?.data?.sales || []).filter(order => order.status === 'PAGADO').length

    const [tabValue, setTabValue] = useState(0)

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
    }

    return (
        <div>
            <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                    <Card>
                        <CardHeader color="primary">
                            <h4 className={classes.cardTitleWhite}>
                                Órdenes pendientes
                            </h4>
                        </CardHeader>
                        <CardBody>
                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                className={classes.tabsContainer}
                                classes={{
                                    root: classes.tabsContainer,
                                    indicator: classes.tabIndicator,
                                }}
                            >
                                <Tab
                                    label={
                                        <Badge
                                            badgeContent={deliveryOrdersCount}
                                            color="primary"
                                            className={classes.badge}
                                        >
                                            <span>Envío a domicilio</span>
                                        </Badge>
                                    }
                                    classes={{
                                        root: classes.tabRoot,
                                        selected: classes.selected,
                                    }}
                                />
                                <Tab
                                    label={
                                        <Badge
                                            badgeContent={pickUpOrdersCount}
                                            color="primary"
                                            className={classes.badge}
                                        >
                                            <span>Recoger en local</span>
                                        </Badge>
                                    }
                                    classes={{
                                        root: classes.tabRoot,
                                        selected: classes.selected,
                                    }}
                                />
                            </Tabs>
                            {tabValue === 0 && (
                                loadingPendingOrders ? (
                                    <Box
                                        display="flex"
                                        justifyContent="center"
                                        padding={4}
                                    >
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    renderOrdersTable(
                                        deliveryOrders,
                                        deliveryPage,
                                        setDeliveryPage,
                                        deliveryOrdersData?.data?.total || 0
                                    )
                                )
                            )}
                            {tabValue === 1 && (
                                loadingPendingOrders ? (
                                    <Box
                                        display="flex"
                                        justifyContent="center"
                                        padding={4}
                                    >
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    renderOrdersTable(
                                        pickUpOrders,
                                        pickUpPage,
                                        setPickUpPage,
                                        pickUpOrdersData?.data?.total || 0
                                    )
                                )
                            )}
                        </CardBody>
                    </Card>
                </GridItem>
            </GridContainer>
        </div>
    )
}
const paymentSchema = yup.object({
    status: yup.string().required(),
})
const ChangeStatusDropdown = ({ sale }) => {
    const statusOptions = ['PAGADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO']

    const dispatch = useDispatch()
    const { loadingChangeStatus } = useSelector((state) => state.dashboard)

    const classes = useStyles()

    useForm({
        resolver: yupResolver(paymentSchema),
        defaultValues: {
            status: saleStatus[sale.status],
        },
    })
    const [anchorEl, setAnchorEl] = React.useState(null)
    const [open, setOpen] = React.useState(false)
    const { modalState, openModal, closeModal } = useStatusChange()

    const handleClick = (event) => {
        setOpen(!open)
        setAnchorEl(anchorEl ? null : event.currentTarget)
    }

    const onStatusChange = async (status, reason = null) => {
        try {
            setOpen(false)
            setAnchorEl(anchorEl ? null : event.currentTarget)
            const result = await dispatch(
                changePendingSalesStatus({
                    id: sale._id,
                    status,
                    paymentMethod: null,
                    reason,
                })
            ).unwrap()
            return result
        } catch (error) {
            throw new Error(error.message || 'Error al cambiar el estado de la orden')
        }
    }

    console.log()

    return (
        <>
            <Box>
                {(sale.status !== 'CANCELADO' && sale.status !== 'ENTREGADO' || loadingChangeStatus === sale._id) && (
                    <Button
                        isLoading={loadingChangeStatus === sale._id}
                        variant="contained"
                        color="primary"
                        type="button"
                        onClick={handleClick}
                    >
                        Cambiar estatus
                    </Button>
                )}
                <Popper
                    open={open}
                    anchorEl={anchorEl}
                    transition
                    placement={'top-start'}
                    modifiers={{
                        preventOverflow: {
                            enabled: true,
                            boundariesElement: 'scrollParent',
                        },
                        flip: {
                            enabled: false,
                        },
                    }}
                >
                    {({ TransitionProps }) => (
                        <Fade {...TransitionProps}>
                            <ClickAwayListener
                                onClickAway={() => {
                                    setOpen(false)
                                    setAnchorEl(null)
                                }}
                            >
                                <div className={classes.dropdown}>
                                    <MenuList role="menu">
                                        {statusOptions
                                            .filter((option, _, array) => {
                                                // Ocultar ENVIADO si deliveryType no es DELIVERY
                                                if (option === 'ENVIADO' && sale.deliveryType !== 'DELIVERY') {
                                                    return false
                                                }

                                                // Si es PICK-UP y el estado actual es PAGADO, ocultar ENVIADO
                                                if (option === 'ENVIADO' && sale.deliveryType === 'PICK-UP' && sale.status === 'PAGADO') {
                                                    return false
                                                }

                                                // Si es DELIVERY y el estado actual es PAGADO, ocultar ENTREGADO (debe pasar por ENVIADO primero)
                                                if (option === 'ENTREGADO' && sale.deliveryType === 'DELIVERY' && sale.status === 'PAGADO') {
                                                    return false
                                                }

                                                const currentIndex = array.findIndex(
                                                    (element) =>
                                                        element === sale.status
                                                )
                                                const optionIndex = array.indexOf(
                                                    option
                                                )

                                                const isAfterCurrent =
                                                    optionIndex > currentIndex

                                                const isCancelOption =
                                                    option === 'CANCELADO'
                                                const isCurrentEnviado =
                                                    sale.status === 'ENVIADO'
                                                const isCurrentEntregado =
                                                    sale.status === 'ENTREGADO'

                                                // Solo mostrar opciones después de la actual
                                                // Y si el estado actual es ENVIADO o ENTREGADO, ocultar la opción CANCELADO
                                                return (
                                                    isAfterCurrent &&
                                                    !(
                                                        (isCurrentEnviado || isCurrentEntregado) &&
                                                        isCancelOption
                                                    )
                                                )
                                            })
                                            .map((status, index) => (
                                                <MenuItem
                                                    key={index}
                                                    onClick={() => {
                                                        openModal(status)
                                                    }}
                                                    className={
                                                        sale.status === status
                                                            ? classes.activeStatus
                                                            : ''
                                                    }
                                                >
                                                    {status}
                                                </MenuItem>
                                            ))}
                                    </MenuList>
                                </div>
                            </ClickAwayListener>
                        </Fade>
                    )}
                </Popper>
            </Box>
            <StatusChangeModal
                open={modalState.open}
                onClose={closeModal}
                onConfirm={async (data) => {
                    const { nextStatus, cancelReason } = data
                    const statusIndex = saleStatus[nextStatus]
                    await onStatusChange(statusIndex, cancelReason)
                    closeModal()
                }}
                nextStatus={modalState.nextStatus}
                loading={loadingChangeStatus === sale._id}
                requireCancelReason={true}
                actionType="ORDER_CANCELLATION"
            />
        </>
    )
}

ChangeStatusDropdown.propTypes = {
    sale: PropTypes.object,
}
