import React, { useEffect } from 'react'
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles'
// core components
import GridItem from 'components/Grid/GridItem.js'
import GridContainer from 'components/Grid/GridContainer.js'
import Table from 'components/Table/Table.js'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'
import { useDispatch, useSelector } from 'react-redux'
import { getSale } from 'store/sales'

import { useParams } from 'react-router-dom'
import {
    Box,
    CircularProgress,
    ClickAwayListener,
    Divider,
    Fade,
    IconButton,
    MenuItem,
    MenuList,
    Popper,
} from '@material-ui/core'
import moment from 'moment'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { finalPrice, formatNumber } from '../../helpers/product'
import { Link, useHistory } from 'react-router-dom'
import Button from 'components/CustomButtons/Button'
import { RemoveRedEye } from '@material-ui/icons'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { saleStatus } from '../../const/sales'
import PropTypes from 'prop-types'
import { changeDetailSalesStatus } from '../../store/sales'
import StatusChangeModal from '../../components/StatusChangeModal'
import { useStatusChange } from '../../hooks/useStatusChange'

const styles = {
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
    backButton: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        cursor: 'pointer',
    },
    // Nuevos estilos para mejor UX/UI
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#3C4858',
        marginBottom: '1.5rem',
        paddingBottom: '0.5rem',
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        marginBottom: '3rem',
    },
    infoItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    infoLabel: {
        fontSize: '0.875rem',
        color: '#666',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    infoValue: {
        fontSize: '1.125rem',
        fontWeight: '600',
        color: '#3C4858',
    },
    priceValue: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#00ACC1',
    },
    statusBadge: {
        width: 'fit-content',
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.5rem 1rem',
        borderRadius: '20px',
        fontSize: '0.875rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    statusPaid: {
        background: '#E8F5E8',
        color: '#2E7D32',
    },
    statusSent: {
        background: '#E3F2FD',
        color: '#1565C0',
    },
    statusCancelled: {
        background: '#FFEBEE',
        color: '#C62828',
    },
    statusPending: {
        background: '#FFF3E0',
        color: '#EF6C00',
    },
    customerInfoSection: {
        background: '#f8f9fa',
        padding: '1.5rem',
        borderRadius: '12px',
        borderLeft: '4px solid #00ACC1',
        marginBottom: '2rem',
    },
    orderInfoSection: {
        background: '#f8f9fa',
        padding: '1.5rem',
        borderRadius: '12px',
        borderLeft: '4px solid #4CAF50',
        marginBottom: '2rem',
    },
    tableSection: {
        marginTop: '2rem',
    },
}

const useStyles = makeStyles(styles)

export default function SaleDetail() {
    const history = useHistory()
    const { id } = useParams()
    console.log('id', id)
    const classes = useStyles()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { saleData, loadingSaleData } = useSelector((state) => state.sales)

    useEffect(() => {
        dispatch(getSale({ access: user.token, id }))
    }, [])
    return (
        <>
            <IconButton
                className={classes.backButton}
                onClick={() => history.goBack()}
            >
                <ArrowBackIcon />
            </IconButton>
            <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                    <Card>
                        <CardHeader color="primary">
                            <h4 className={classes.cardTitleWhite}>
                                Detalle de la orden {id}
                            </h4>
                            <p className={classes.cardCategoryWhite}>
                                Visualiza los productos y todo el detalle de la
                                orden
                            </p>
                        </CardHeader>
                        <CardBody>
                            {loadingSaleData ? (
                                <Box display="flex" justifyContent="center">
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Box>
                                    {/* Información del cliente */}
                                    <h3 className={classes.sectionTitle}>Información del cliente</h3>
                                    <div className={classes.customerInfoSection}>
                                        <div className={classes.infoGrid}>
                                            <div className={classes.infoItem}>
                                                <span className={classes.infoLabel}>Nombre</span>
                                                <span className={classes.infoValue}>{saleData.name}</span>
                                            </div>
                                            <div className={classes.infoItem}>
                                                <span className={classes.infoLabel}>Apellido</span>
                                                <span className={classes.infoValue}>{saleData.lastName}</span>
                                            </div>
                                            <div className={classes.infoItem}>
                                                <span className={classes.infoLabel}>DNI</span>
                                                <span className={classes.infoValue}>{saleData.dni}</span>
                                            </div>
                                            <div className={classes.infoItem}>
                                                <span className={classes.infoLabel}>Teléfono</span>
                                                <span className={classes.infoValue}>{saleData.phone}</span>
                                            </div>
                                            <div className={classes.infoItem}>
                                                <span className={classes.infoLabel}>Email</span>
                                                <span className={classes.infoValue}>{saleData.user}</span>
                                            </div>
                                            <div className={classes.infoItem}>
                                                <span className={classes.infoLabel}>Dirección</span>
                                                <span className={classes.infoValue}>{saleData.address}</span>
                                            </div>
                                            <div className={classes.infoItem}>
                                                <span className={classes.infoLabel}>Código postal</span>
                                                <span className={classes.infoValue}>{saleData.postalCode}</span>
                                            </div>
                                            <div className={classes.infoItem}>
                                                <span className={classes.infoLabel}>Estado</span>
                                                <span className={`${classes.statusBadge} ${
                                                    saleData.status === 'PAGADO' ? classes.statusPaid :
                                                    saleData.status === 'ENVIADO' ? classes.statusSent :
                                                    saleData.status === 'CANCELADO' ? classes.statusCancelled :
                                                    classes.statusPending
                                                }`}>
                                                    {saleData.status === 'CANCELADO' && saleData.cancelReason 
                                                        ? `${saleData.status} - ${saleData.cancelReason || 'Motivo no especificado'}`
                                                        : saleData.status
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        <ChangeStatusDropdown sale={saleData} />
                                    </div>

                                    <Divider style={{ margin: '2rem 0' }} />

                                    {/* Información de la orden */}
                                    <h3 className={classes.sectionTitle}>Información de la orden</h3>
                                    <div className={classes.orderInfoSection}>
                                        <div className={classes.infoGrid}>
                                            <div className={classes.infoItem}>
                                                <span className={classes.infoLabel}>Fecha de creación</span>
                                                <span className={classes.infoValue}>
                                                    {moment(saleData.createdAt)
                                                        .utc()
                                                        .format('DD-MM-YYYY HH:mm:ss A')}
                                                </span>
                                            </div>
                                            <div className={classes.infoItem}>
                                                <span className={classes.infoLabel}>Total de la orden</span>
                                                <span className={classes.priceValue}>
                                                    ${saleData.products
                                                        .reduce(
                                                            (acc, item) =>
                                                                acc +
                                                                finalPrice(
                                                                    item.data.price,
                                                                    item.data.discount
                                                                ) * item.quantity,
                                                            0
                                                        )
                                                        .toFixed(1)}
                                                </span>
                                            </div>
                                            <div className={classes.infoItem}>
                                                <span className={classes.infoLabel}>Comisión de Marketplace</span>
                                                <span className={classes.infoValue}>
                                                    {(() => {
                                                        const marketplaceFee = saleData.marketplaceFee || 0;
                                                        const feePercentage = marketplaceFee < 1 ? marketplaceFee * 100 : marketplaceFee;
                                                        const totalOrder = saleData.products.reduce(
                                                            (acc, item) =>
                                                                acc + finalPrice(item.data.price, item.data.discount) * item.quantity,
                                                            0
                                                        );
                                                        const commissionAmount = (totalOrder * feePercentage / 100);
                                                        
                                                        return feePercentage > 0 ? (
                                                            `${feePercentage.toFixed(1)}% ($${commissionAmount.toFixed(2)})`
                                                        ) : (
                                                            'Sin comisión'
                                                        );
                                                    })()}
                                                </span>
                                            </div>
                                            <div className={classes.infoItem}>
                                                <span className={classes.infoLabel}>Total Recibido</span>
                                                <span className={classes.priceValue}>
                                                    {(() => {
                                                        const marketplaceFee = saleData.marketplaceFee || 0;
                                                        const feePercentage = marketplaceFee < 1 ? marketplaceFee * 100 : marketplaceFee;
                                                        const totalOrder = saleData.products.reduce(
                                                            (acc, item) =>
                                                                acc + finalPrice(item.data.price, item.data.discount) * item.quantity,
                                                            0
                                                        );
                                                        const commissionAmount = (totalOrder * feePercentage / 100);
                                                        const totalReceived = totalOrder - commissionAmount;
                                                        
                                                        return `$${totalReceived.toFixed(2)}`;
                                                    })()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <Divider style={{ margin: '2rem 0' }} />
                                    
                                    {/* Productos de la orden */}
                                    <h3 className={classes.sectionTitle}>Productos de la orden</h3>
                                    <Table
                                        tableHeaderColor="primary"
                                        tableHead={[
                                            'Id del producto',
                                            'Nombre del producto',
                                            'Cantidad',
                                            'variante',
                                            'Precio',
                                            'Descuento',
                                            'Precio final',
                                            'Acciones',
                                        ]}
                                        tableData={saleData.products.map(
                                            (product) => {
                                                console.log(
                                                    'format number',
                                                    formatNumber(
                                                        finalPrice(
                                                            product.data.price,
                                                            product.data
                                                                .discount
                                                        )
                                                    )
                                                )
                                                return [
                                                    product.data._id,
                                                    product.data.name,
                                                    product.quantity,
                                                    `Color: ${
                                                        product.data.color
                                                    } ${
                                                        product.data.size
                                                            ? '- Talle:' +
                                                              product.data.size
                                                            : ''
                                                    }`,
                                                    '$' +
                                                        formatNumber(
                                                            product.data.price
                                                        ),
                                                    `%${product.data.discount}`,
                                                    `$${formatNumber(
                                                        finalPrice(
                                                            product.data.price,
                                                            product.data
                                                                .discount
                                                        )
                                                    )}`,
                                                    <Link
                                                        key={`detail-button-${product.data._id}`}
                                                        to={`/admin/product-detail/${product.data._id}`}
                                                    >
                                                        <Button
                                                            isLoading={false}
                                                            color="primary"
                                                        >
                                                            <RemoveRedEye />
                                                        </Button>
                                                    </Link>,
                                                ]
                                            }
                                        )}
                                    />
                                </Box>
                            )}
                        </CardBody>
                    </Card>
                </GridItem>
            </GridContainer>
        </>
    )
}

const paymentSchema = yup.object({
    status: yup.string().required(),
})

const ChangeStatusDropdown = ({ sale }) => {
    const statusOptions = ['PAGADO', 'ENVIADO', 'CANCELADO']
    const dispatch = useDispatch()
    const { loadingSaleDetailStatus } = useSelector((state) => state.sales)
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
                changeDetailSalesStatus({
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

    return (
        <>
            <Box>
                {(sale.status !== 'CANCELADO' && sale.status !== 'ENVIADO' || loadingSaleDetailStatus) && (
                    <Button
                        isLoading={loadingSaleDetailStatus}
                        color="primary"
                        onClick={handleClick}
                    >
                        Cambiar estatus
                    </Button>
                )}
                <Popper
                    open={open}
                    anchorEl={anchorEl}
                    transition
                    style={{
                        backgroundColor: 'white',
                        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
                    }}
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
                loading={loadingSaleDetailStatus}
                requireCancelReason={true}
                actionType="ORDER_CANCELLATION"
            />
        </>
    )
}

ChangeStatusDropdown.propTypes = {
    sale: PropTypes.object,
}
