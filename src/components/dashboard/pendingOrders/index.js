import React, { useState } from 'react'
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
} from '@material-ui/core'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import PropTypes from 'prop-types'
import moment from 'moment'
import ReactPaginate from 'react-paginate'

import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import { Link } from 'react-router-dom'
import { RemoveRedEye } from '@material-ui/icons'
import { saleStatus } from '../../../const/sales'
import StatusChangeModal from '../../StatusChangeModal'
import { useStatusChange } from '../../../hooks/useStatusChange'
import { formatNumber } from '../../../helpers/product'

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
}
const useStyles = makeStyles(styles)

export default function PendingOrders() {
    const { user } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const { pendingOrders, loadingPendingOrders } = useSelector(
        (state) => state.dashboard
    )
    const classes = useStyles()
    const [page, setPage] = useState(0)

    useEffect(() => {
        const getData = async () => {
            dispatch(getPendingOrders({ access: user.token, page: 0 }))
        }
        getData()
    }, [])
    useEffect(() => {
        dispatch(getPendingOrders({ access: user.token, page }))
    }, [page])
    return (
        <div>
            <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                    <Card>
                        <CardHeader color="primary">
                            <h4 className={classes.cardTitleWhite}>
                                Ordenes pendientes de envio
                            </h4>
                        </CardHeader>
                        <CardBody>
                            {loadingPendingOrders ? (
                                <Box
                                    display="flex"
                                    justifyContent="center"
                                    padding={4}
                                >
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <>
                                    <Table
                                        tableHeaderColor="primary"
                                        tableHead={[
                                            'Id',
                                            'Total',
                                            'Descuentos',
                                            'Comisión',
                                            'Total Recibido',
                                            'Fecha',
                                            'Estatus',
                                            'Cambiar estatus',
                                            'Acciones',
                                        ]}
                                                                                 tableData={pendingOrders.data.sales.map(
                                             (e) => {
                                                
                                                 
                                                 // Mostrar motivo de cancelación si el estado es CANCELADO
                                                 const statusDisplay = e.status === 'CANCELADO' && e.cancelReason 
                                                     ? `${e.status} - ${e.cancelReason || 'Motivo no especificado'}`
                                                     : e.status
                                                 
                                                 // Calcular descuentos de productos y ofertas
                                                 let productDiscounts = 0;
                                                 let offerDiscounts = 0;
                                                 
                                                 if (e.products && Array.isArray(e.products)) {
                                                     e.products.forEach((item) => {
                                                         const product = item.data || {};
                                                         const price = product.price || 0;
                                                         const quantity = item.quantity || 0;
                                                         const discount = product.discount || 0;
                                                         const offerDiscount = product.offerDiscount || 0;
                                                         
                                                         // Calcular descuento de producto
                                                         if (discount > 0) {
                                                             const discountAmount = (price * discount / 100) * quantity;
                                                             productDiscounts += discountAmount;
                                                         }
                                                         
                                                         // Calcular descuento de oferta
                                                         if (offerDiscount > 0) {
                                                             const offerDiscountAmount = (price * offerDiscount / 100) * quantity;
                                                             offerDiscounts += offerDiscountAmount;
                                                         }
                                                     });
                                                 }

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

                                                 // Información del cupón
                                                 const couponDiscount = e.coupon?.discount || 0;
                                                 
                                                 // Calcular total de descuentos (suma de productos + ofertas + cupón)
                                                 const totalDiscounts = productDiscounts + offerDiscounts + couponDiscount;
                                                 
                                                 // Mostrar total de descuentos
                                                 const discountsDisplay = totalDiscounts > 0
                                                     ? <p style={{ color: '#1976d2' }}>-${formatNumber(totalDiscounts.toFixed(2))}</p>
                                                     : <p>-</p>;
                                                 
                                                 // Total de la orden (sin modificaciones)
                                                 const orderTotal = e.total || e.totalPrice || 0;

                                                 return [
                                                     <p key={`sale-id-${e._id}`}>
                                                         {e._id}
                                                     </p>,
                                                     <p
                                                         key={`sale-total-${e._id}`}
                                                     >
                                                         ${formatNumber(orderTotal.toFixed(2))}
                                                     </p>,
                                                     <div key={`sale-discounts-${e._id}`}>{discountsDisplay}</div>,
                                                     <p
                                                         key={`sale-commission-${e._id}`}
                                                     >
                                                         {feePercentage > 0 ? (
                                                             <>
                                                                 {feePercentage.toFixed(1)}% (${formatNumber(commissionAmount.toFixed(2))})
                                                             </>
                                                         ) : (
                                                             'Sin comisión'
                                                         )}
                                                     </p>,
                                                     <p
                                                         key={`sale-total-received-${e._id}`}
                                                     >
                                                         ${formatNumber(totalReceived.toFixed(2))}
                                                     </p>,
                                                     <p
                                                         key={`sale-date-${e._id}`}
                                                     >
                                                         {moment(e.createdAt)
                                                             .utc()
                                                             .format(
                                                                 'DD-MM-YYYY HH:mm:ss A'
                                                             )}
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
                                             }
                                         )}
                                    />
                                    <ReactPaginate
                                        forcePage={page}
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
                                            setPage(e.selected)
                                        }}
                                        pageRangeDisplayed={5}
                                        pageCount={Math.ceil(
                                            pendingOrders.data.total / 10
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
    const statusOptions = ['PAGADO', 'ENVIADO', 'CANCELADO']

    const dispatch = useDispatch()
    const { loadingChangeStatus } = useSelector((state) => state.dashboard)
    const { user } = useSelector((state) => state.auth)

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
                    access: user.token,
                    id: sale._id,
                    status,
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
                {(sale.status !== 'CANCELADO' && sale.status !== 'ENVIADO' || loadingChangeStatus === sale._id) && (
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

                                                // Solo mostrar opciones después de la actual
                                                // Y si el estado actual es ENVIADO, ocultar la opción CANCELADO
                                                return (
                                                    isAfterCurrent &&
                                                    !(
                                                        isCurrentEnviado &&
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
                    const statusIndex = statusOptions.findIndex(option => option === nextStatus) + 1
                    return await onStatusChange(statusIndex, cancelReason)
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
