import React, { useEffect, useState } from 'react'
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles'
// core components
import GridItem from 'components/Grid/GridItem.js'
import GridContainer from 'components/Grid/GridContainer.js'
import Table from 'components/Table/Table.js'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'
import Button from 'components/CustomButtons/Button'
import { useDispatch, useSelector } from 'react-redux'
import { getSales, changeSalesStatus } from 'store/sales'
import StatusChangeModal from '../../components/StatusChangeModal'
import { useStatusChange } from '../../hooks/useStatusChange'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

// form
import { Controller, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

import {
    Box,
    CircularProgress,
    ClickAwayListener,
    Fade,
    IconButton,
    MenuItem,
    MenuList,
    Popper,
} from '@material-ui/core'
import moment from 'moment-timezone'
import ReactPaginate from 'react-paginate'
import { formatNumber } from '../../helpers/product'
import TextInput from '../../components/TextInput/Index'
import { DeleteForever, Search } from '@material-ui/icons'
import { useLocation } from 'react-router-dom'
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import EmptyTablePlaceholder from '../../components/EmptyTablePlaceholder'
import { scrollToTop } from '../../utils/globals'
import CustomModal from '../../components/CustomModal'

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
        marginTop: '1rem',
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
    filterWrapper: {
        marginTop: '1rem',
        marginBottom: '1rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
}

const useStyles = makeStyles(styles)

const schema = yup.object({
    search: yup.string().nullable(),
})

export default function Sales() {
    const classes = useStyles()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { salesData, loadingSalesData } = useSelector((state) => state.sales)

    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const dateFrom = queryParams.get('from')
    const dateTo = queryParams.get('to')
    const { control, handleSubmit, setValue, watch, reset } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            search: null,
            start: dateFrom ? moment(dateFrom, 'DD-MM-YYYY').toDate() : '',
            end: dateTo ? moment(dateTo, 'DD-MM-YYYY').toDate() : '',
        },
    })

    const watchSearch = watch('search')
    const watchStartDate = watch('start')
    const watchEndDate = watch('end')
    const [filter, setFilter] = useState(null)
    const [page, setPage] = useState(0)
    const [searchType, setSearchType] = useState(
        dateFrom && dateTo ? 'date' : 'id'
    )

    // Helpers
    const fetchSales = (params = {}) => {
        console.log('fetch', params)
        dispatch(
            getSales({
                access: user.token,
                page: params.page || page,
                ...params,
            })
        )
    }
    const handleFilter = (newFilter) => {
        setFilter(newFilter)
        setValue('search', '')
        setPage(0)
    }

    const handleSearch = ({ search }) => {
        setFilter(null)
        setPage(0)
        fetchSales({ filters: { search }, page: 0 })
    }

    const handleSearchByDate = ({ start, end }) => {
        setPage(0)
        fetchSales({
            filters: {},
            page: 0,
            dateFrom: moment(start).format('DD-MM-YYYY'),
            dateTo: moment(end).format('DD-MM-YYYY'),
        })
    }

    const handleDeleteSearch = () => {
        fetchSales({ filters: {}, page: 0 })
        setFilter(null)
        setValue('search', '')
        setPage(0)
    }

    const handleDeleteDateSearch = () => {
        console.log('reset')
        reset({ start: null, end: null })
        fetchSales({
            filters: {},
            page: 0,
        })
    }

    const handleChangeSearch = (type) => {
        setSearchType(type)
        setFilter(null)
        setValue('search', '')
        setPage(0)
        reset({ start: null, end: null })
        fetchSales({
            filters: {},
            page: 0,
        })
    }

    // Cargar datos iniciales
    useEffect(() => {
        const params = {
            filters: { status: filter, search: watchSearch },
            page,
        }
        if (watchStartDate && watchEndDate) {
            console.log('params', watchStartDate, watchEndDate)
            params.dateFrom = moment(watchStartDate).format('DD-MM-YYYY')
            params.dateTo = moment(watchEndDate).format('DD-MM-YYYY')
        }

        fetchSales({
            ...params,
        })
    }, [filter, page])

    useEffect(() => {
        scrollToTop(100)
    }, [salesData])

    // Render
    const renderTableRows = () =>
        salesData.sales.map((e) => {


            // Mostrar motivo de cancelación si el estado es CANCELADO
            const statusDisplay = e.status === 'CANCELADO' && e.cancelReason
                ? `${e.status} - ${e.cancelReason || 'Motivo no especificado'}`
                : e.status

            return [
                <p key={`sale-id-${e._id}`}>{e._id}</p>,
                <p key={`sale-total-${e._id}`}>${formatNumber(e.total)}</p>,
                <p key={`sale-date-${e._id}`}>
                    {moment(e.createdAt).utc().format('DD-MM-YYYY HH:mm:ss A')}
                </p>,
                <p key={`sale-status-${e._id}`}>{statusDisplay}</p>,
                <ChangeStatusDropdown key={e._id} sale={e} />,
                <Link
                    key={`detail-button-${e._id}`}
                    to={`/admin/orders/detail/${e._id}`}
                >
                    <Button variant="contained" color="primary">
                        Ver detalle
                    </Button>
                </Link>,
            ]
        })

    const handleTableContent = () => {
        return salesData.sales.length === 0 ? (
            <EmptyTablePlaceholder title="No hay datos para la busqueda seleccionada" />
        ) : (
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
                    tableData={renderTableRows()}
                />
                <ReactPaginate
                    forcePage={page}
                    pageClassName={classes.page}
                    containerClassName={classes.pagination}
                    activeClassName={classes.activePage}
                    breakLabel="..."
                    nextLabel={
                        <Button
                            variant="contained"
                            color="primary"
                            justIcon
                        >
                            <ChevronRightIcon />
                        </Button>
                    }
                    previousLabel={
                        <Button
                            variant="contained"
                            color="primary"
                            justIcon
                        >
                            <ChevronLeftIcon />
                        </Button>
                    }
                    onPageChange={(e) => {
                        console.log('Page changed to:', e.selected)
                        setPage(e.selected)

                        // Scroll al inicio con offset de 100px para dar espacio al header

                    }}
                    pageRangeDisplayed={5}
                    pageCount={Math.max(1, Math.ceil(
                        salesData.total / 10
                    ))}
                    renderOnZeroPageCount={null}
                />
            </>
        )
    }

    return (
        <MuiPickersUtilsProvider locale={'es'} utils={MomentUtils}>
            <div>
                <GridContainer id="sales-table">
                    <GridItem xs={12} sm={12} md={12}>
                        <Card>
                            <CardHeader color="primary">
                                <h4 className={classes.cardTitleWhite}>
                                    Tabla de órdenes
                                </h4>
                                <p className={classes.cardCategoryWhite}>
                                    Aquí podrás visualizar todas tus órdenes,
                                    cambiar su estatus y acceder al detalle de cada
                                    una.
                                </p>
                            </CardHeader>
                            <CardBody>
                                <Box marginBottom={2}>
                                    {searchType === 'date' && (
                                        <h5>Estas buscando por fecha y estatus</h5>
                                    )}
                                    {searchType === 'id' && (
                                        <h5>Estas buscando por el id de orden</h5>
                                    )}
                                    {searchType === 'date' && (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleChangeSearch('id')}
                                        >
                                            Buscar por id
                                        </Button>
                                    )}
                                    {searchType === 'id' && (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() =>
                                                handleChangeSearch('date')
                                            }
                                        >
                                            Buscar por fecha o estatus
                                        </Button>
                                    )}
                                </Box>
                                {searchType === 'id' ? (
                                    <Box mb={2}>
                                        <form onSubmit={handleSubmit(handleSearch)}>
                                            <Box className={classes.filterWrapper}>
                                                <Box style={{ flexBasis: '300px' }}>
                                                    <Controller
                                                        name="search"
                                                        control={control}
                                                        render={({
                                                            field,
                                                            fieldState,
                                                        }) => (
                                                            <TextInput
                                                                error={
                                                                    !!fieldState.error
                                                                }
                                                                errorMessage={
                                                                    fieldState.error
                                                                }
                                                                label="Id de la orden"
                                                                value={field.value}
                                                                onChange={(e) =>
                                                                    field.onChange(
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                    />
                                                </Box>
                                                {watchSearch && (
                                                    <>
                                                        <IconButton
                                                            variant="contained"
                                                            color="primary"
                                                            type="submit"
                                                            style={{
                                                                color:
                                                                    'rgba(0,175,195, 1)',
                                                            }}
                                                        >
                                                            <Search />
                                                        </IconButton>
                                                        <IconButton
                                                            onClick={
                                                                handleDeleteSearch
                                                            }
                                                            variant="contained"
                                                            color="primary"
                                                            style={{ color: 'red' }}
                                                        >
                                                            <DeleteForever />
                                                        </IconButton>
                                                    </>
                                                )}
                                            </Box>
                                        </form>
                                    </Box>
                                ) : (
                                    <Box>
                                        <form
                                            onSubmit={handleSubmit(
                                                handleSearchByDate
                                            )}
                                        >
                                            <Box
                                                display="flex"
                                                style={{ gap: '1rem', flexWrap: 'wrap' }}
                                            >
                                                <Controller
                                                    name="start"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <DatePicker
                                                            lang="es"
                                                            maxDate={new Date()}
                                                            onChange={
                                                                field.onChange
                                                            }
                                                            value={field.value}
                                                            variant="outline"
                                                            format="DD-MM-YYYY"
                                                            openTo="date"
                                                            views={[
                                                                'year',
                                                                'month',
                                                                'date',
                                                            ]}
                                                            label="Fecha de inicio"
                                                            helperText="Seleccione una fecha"
                                                        />
                                                    )}
                                                />
                                                <Controller
                                                    name="end"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <DatePicker
                                                            lang="es"
                                                            minDate={watchStartDate}
                                                            maxDate={new Date()}
                                                            onChange={
                                                                field.onChange
                                                            }
                                                            value={field.value}
                                                            variant="outlined"
                                                            format="DD-MM-YYYY"
                                                            openTo="date"
                                                            views={[
                                                                'year',
                                                                'month',
                                                                'date',
                                                            ]}
                                                            label="Fecha fin"
                                                            helperText="Seleccione una fecha"
                                                        />
                                                    )}
                                                />
                                            </Box>
                                            {watchStartDate && watchEndDate && (
                                                <Box
                                                    display="flex"
                                                    flex={1}
                                                    style={{ gap: '1rem', flexWrap: 'wrap' }}
                                                >
                                                    <IconButton
                                                        variant="contained"
                                                        color="primary"
                                                        type="submit"
                                                        style={{
                                                            alignSelf: 'center',
                                                            color:
                                                                'rgba(0,175,195, 1)',
                                                        }}
                                                    >
                                                        <Search />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={
                                                            handleDeleteDateSearch
                                                        }
                                                        variant="contained"
                                                        color="primary"
                                                        style={{
                                                            alignSelf: 'center',
                                                            color: 'red',
                                                        }}
                                                    >
                                                        <DeleteForever />
                                                    </IconButton>
                                                </Box>
                                            )}
                                        </form>
                                        <Box className={classes.filtersWrapper}>
                                            {[
                                                { label: 'Todos', value: null },
                                                { label: 'Pagado', value: 1 },
                                                { label: 'Enviado', value: 2 },
                                                { label: 'Cancelado', value: 3 },
                                            ].map(({ label, value }) => (
                                                <Box
                                                    key={label}
                                                    style={{
                                                        padding: '0 4px',
                                                        border:
                                                            filter === value
                                                                ? 'solid 1px #c2c2c2'
                                                                : '',
                                                        borderRadius: '8px',
                                                    }}
                                                >
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() =>
                                                            handleFilter(value)
                                                        }
                                                    >
                                                        {label}
                                                    </Button>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                {loadingSalesData ? (
                                    <Box display="flex" justifyContent="center">
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    handleTableContent()
                                )}
                            </CardBody>
                        </Card>
                    </GridItem>
                </GridContainer>
            </div>
        </MuiPickersUtilsProvider>
    )
}

const paymentSchema = yup.object({
    status: yup.string().required(),
})
const ChangeStatusDropdown = ({ sale }) => {
    const statusOptions = ['PAGADO', 'ENVIADO', 'CANCELADO']
    const dispatch = useDispatch()
    const { loadingChangeStatus } = useSelector((state) => state.sales)

    const classes = useStyles()
    //form

    useForm({
        resolver: yupResolver(paymentSchema),
        defaultValues: {
            paymentMethod: '0',
            status: 2,
        },
    })
    const [anchorEl, setAnchorEl] = React.useState(null)
    const [open, setOpen] = React.useState(false)
    const { modalState, openModal, closeModal } = useStatusChange()
    const [showSuccessModal, setShowSuccessModal] = React.useState(false)
    const [showErrorModal, setShowErrorModal] = React.useState(false)
    const handleClick = (event) => {
        setOpen(!open)
        setAnchorEl(anchorEl ? null : event.currentTarget)
    }

    const onStatusChange = async (status, reason = null) => {
        try {
            setOpen(false)
            setAnchorEl(null)
            await dispatch(
                changeSalesStatus({
                    id: sale._id,
                    status,
                    reason
                })
            ).unwrap()
            closeModal()
            setShowSuccessModal(true)
        } catch (error) {
            throw new Error(error.message || 'Error al cambiar el estado de la orden')
        }
    }

    return (
        <>
            <Box>
                {((sale.status !== 'CANCELADO' && sale.status !== 'ENVIADO') ||
                    loadingChangeStatus === sale._id) && (
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
                    onStatusChange(statusIndex, cancelReason)
                }}
                nextStatus={modalState.nextStatus}
                loading={loadingChangeStatus === sale._id}
                requireCancelReason={true}
                actionType="ORDER_CANCELLATION"
            />
            <CustomModal
                open={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false)
                }}
                icon="success"
                title="Cambiar estatus"
                subTitle="Estatus cambiado correctamente"
                confirmText="Aceptar"
                hasCancel={false}
                hasConfirm={true}
                confirmCb={() => {
                    setShowSuccessModal(false)
                }}
                />
            <CustomModal
                open={showErrorModal}
                onClose={() => {
                    setShowErrorModal(false)
                }}
                icon="error"
                title="error"
                subTitle="Error al cambiar el estado de la orden"
                confirmText="Aceptar"
                hasCancel={false}
                hasConfirm={true}
                confirmCb={() => {
                    setShowErrorModal(false)
                }}
            />
        </>
    )
}

ChangeStatusDropdown.propTypes = {
    sale: PropTypes.object,
}
