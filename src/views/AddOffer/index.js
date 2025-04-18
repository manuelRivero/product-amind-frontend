import {
    Box,
    CircularProgress,
    Dialog,
    DialogActions,
    IconButton,
    makeStyles,
} from '@material-ui/core'
import Table from 'components/Table/Table.js'
import React, { useEffect, useState } from 'react'
import { getProducts } from '../../store/products'
import { getCategories } from '../../store/categories'
import { yupResolver } from '@hookform/resolvers/yup'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import * as yup from 'yup'
import { finalPrice, formatNumber } from '../../helpers/product'
import ReactPaginate from 'react-paginate'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import Button from 'components/CustomButtons/Button.js'

import MomentUtils from '@date-io/moment'
import { DeleteForever, Search } from '@material-ui/icons'
import TextInput from '../../components/TextInput/Index'
import Card from '../../components/Card/Card'
import EmptyTablePlaceholder from '../../components/EmptyTablePlaceholder'
import moment from 'moment'
import { addOffer, resetSuccess } from '../../store/offers'
import CustomModal from '../../components/CustomModal'
import { useHistory } from 'react-router-dom'

const schema = yup.object({
    search: yup.string(),
})

const useStyles = makeStyles({
    cardCategory: {
        color: '#999',
    },
    cardTitle: { color: '#3C4858' },
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
    addProductWrapper: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        height: '100%',
    },
    addProductContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '.5rem',
    },
    actionWrapper: {
        display: 'flex',
        gap: '1rem',
    },
    filterWrapper: {
        marginTop: '1rem',
        display: 'flex',
        gap: '1rem',
    },
    modalBody: {
        padding: '1rem',
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box',
    },
    table: {
        maxHeight: 300,
        overflow: 'auto',
    },
    modalTitle: {
        margin: 0,
    },
    datePicker: {
        '& .MuiInputBase-input': {
            background: '#fff !important',
        },
    },
})

export default function AddOffer() {
    const dispatch = useDispatch()
    const history = useHistory()

    const { user } = useSelector((state) => state.auth)
    const { productsData, loadingProductsData } = useSelector(
        (state) => state.products
    )
    const { categoriesData, loadingCategoriesData } = useSelector(
        (state) => state.categories
    )
    const { loadingAddOffer, successAddOffer } = useSelector(
        (state) => state.offers
    )
    const classes = useStyles()

    console.log(
        'loadingAddOffer, successAddOffer',
        loadingAddOffer,
        successAddOffer
    )

    const [selectedProducts, setSelectedProducts] = useState([])
    const [openProductModal, setOpenProductModal] = useState(false)
    const [name, setName] = useState('')
    const [startDate, setStartDate] = useState(null)
    const [endDate, setEndDate] = useState(null)
    const [discount, setDiscount] = useState(null)
    const [page, setPage] = useState(0)

    //form
    const { watch, reset, handleSubmit, control } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            search: '',
        },
    })

    const watchSearch = watch('search')

    const handlePageClick = ({ selected }) => {
        console.log('selected', selected)
        setPage(selected)
        const element = document.getElementById('table-header')
        element.scrollIntoView()
    }

    const productCategory = (categoryId) => {
        if (categoriesData.data) {
            const hasCategory = categoriesData.data.some(
                (category) => category._id === categoryId
            )

            const categoryName = hasCategory
                ? categoriesData.data.find(
                      (category) => category._id === categoryId
                  ).name
                : 'N/A'

            return categoryName
        }
    }

    const handleDeleteSearch = () => {
        setPage(0)
        reset({
            search: '',
        })
        dispatch(
            getProducts({
                access: user.token,
                filters: { page: 0 },
            })
        )
    }

    const submitSearch = () => {
        setPage(0)
        dispatch(
            getProducts({
                access: user.token,
                filters: { search: watchSearch, page: 0 },
            })
        )
    }

    const submit = () => {
        dispatch(
            addOffer({
                name,
                startDate: startDate.toDate(),
                endDate: endDate.toDate(),
                products: selectedProducts.map((product) => product._id),
                discount,
            })
        )
    }

    const addProducts = (product) => {
        setSelectedProducts((prev) => [...prev, product])
    }
    const removeProduct = (productId) => {
        console.log('productId', productId)
        setSelectedProducts((prev) =>
            prev.filter((product) => product._id !== productId)
        )
    }

    useEffect(() => {
        if (productsData) {
            dispatch(
                getCategories({
                    access: user.token,
                    filters: {
                        page: 0,
                        ids: productsData.data.products.map(
                            (product) => product.category
                        ),
                    },
                })
            )
        }
    }, [productsData])
    useEffect(() => {
        const params = {
            access: user.token,
            filters: {
                page,
            },
        }
        if (watchSearch) {
            params.filters.search = watchSearch
        }
        dispatch(getProducts(params))
    }, [page])
    const datesValidation = startDate && endDate
    const productsValidation = selectedProducts.length > 0
    return (
        <>
            <MuiPickersUtilsProvider locale={'es'} utils={MomentUtils}>
                <h3 style={{ marginBottom: '2rem' }}>Crear nueva promoción</h3>
                <form autoComplete="off">
                    <Box
                        display="flex"
                        flexWrap="wrap"
                        alignItems="center"
                        style={{ gap: '2rem' }}
                    >
                        <Box
                            display="flex"
                            flexWrap="wrap"
                            alignItems="center"
                            style={{ gap: '2rem' }}
                        >
                            <Box width={250}>
                                <DatePicker
                                    minDate={new Date()}
                                    lang="es"
                                    onChange={(date) => {
                                        setStartDate(date)
                                    }}
                                    value={startDate}
                                    className={classes.datePicker}
                                    inputVariant="outlined"
                                    openTo="date"
                                    views={['month', 'date']}
                                    label="Fecha inicio"
                                    helperText={
                                        <small>Seleccione día y mes</small>
                                    }
                                    autoOk={true}
                                    variant="dialog" // O "inline" si lo preferís embebido
                                    fullWidth
                                />
                            </Box>
                            <Box width={250}>
                                <DatePicker
                                    TextFieldProps={{ variant: 'outlined' }}
                                    minDate={new Date(moment().add(1, 'day'))}
                                    lang="es"
                                    onChange={(date) => {
                                        setEndDate(date)
                                    }}
                                    className={classes.datePicker}
                                    inputVariant="outlined"
                                    value={endDate}
                                    openTo="date"
                                    views={['month', 'date']}
                                    label="Fecha fin"
                                    helperText={
                                        <small>Seleccione día y mes</small>
                                    }
                                    autoOk={true}
                                    fullWidth
                                />
                            </Box>
                            <Box width={250}>
                                <TextInput
                                    icon={null}
                                    label={'Descuento en procentaje'}
                                    value={discount ?? ''}
                                    helperText={
                                        <small>
                                            Descuento para los productos
                                            seleccionados
                                        </small>
                                    }
                                    onChange={(e) =>
                                        setDiscount(
                                            e.target.value.replace(/[^\d]/g, '')
                                        )
                                    }
                                />
                            </Box>
                        </Box>
                        <Box width={250}>
                            <TextInput
                                icon={null}
                                label={'Nombre de la promoción'}
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Box>
                    </Box>
                </form>
            </MuiPickersUtilsProvider>
            <Box>
                <Card style={{ padding: '1rem', boxSizing: 'border-box' }}>
                    <Box>
                        <Box display="flex" justifyContent="end">
                            <Button
                                isLoading={false}
                                variant="contained"
                                color="primary"
                                type="button"
                                onClick={() => {
                                    setOpenProductModal(true)
                                }}
                            >
                                Agregar producto
                            </Button>
                        </Box>
                        {selectedProducts.length > 0 && (
                            <>
                                <Table
                                    styles={{
                                        tableWrapper: {
                                            minHeight: 300,
                                        },
                                    }}
                                    tableHeaderColor="primary"
                                    tableHead={[
                                        'id',
                                        'Nombre',
                                        'Categoría',
                                        'Precio',
                                        'Descuento',
                                        'Precio final',
                                        'Estatus',
                                        'Acciones',
                                    ]}
                                    tableData={selectedProducts.map((e) => {
                                        return [
                                            e._id,
                                            e.name,
                                            productCategory(e.category),
                                            `$${formatNumber(
                                                e.price.toFixed(1)
                                            )}`,
                                            e.discount ? `${e.discount}%` : 0,
                                            `$${formatNumber(
                                                finalPrice(e.price, e.discount)
                                            )}`,
                                            e.status
                                                ? e.status.available
                                                    ? 'Disponible'
                                                    : 'No disponible'
                                                : 'Sin información',
                                            <Button
                                                type="button"
                                                color="primary"
                                                key={e._id}
                                                onClick={() =>
                                                    removeProduct(e._id)
                                                }
                                            >
                                                Quitar
                                            </Button>,
                                        ]
                                    })}
                                />
                            </>
                        )}
                        {selectedProducts.length === 0 && (
                            <EmptyTablePlaceholder
                                title={'No has seleccionado ningún producto'}
                            />
                        )}
                    </Box>
                </Card>
                {datesValidation && productsValidation && discount && name && (
                    <Box display="flex" justifyContent="center">
                        <Button
                            onClick={submit}
                            isLoading={loadingAddOffer}
                            color="primary"
                            type="button"
                        >
                            Guardar
                        </Button>
                    </Box>
                )}
            </Box>

            <Dialog
                PaperProps={{
                    style: {
                        width: '100%',
                    },
                }}
                open={openProductModal}
                style={{ overflowY: 'hidden', width: '100%' }}
                onClose={() => setOpenProductModal(false)}
            >
                <Box className={classes.modalBody}>
                    <Box mb={4}>
                        <h5 className={classes.modalTitle}>
                            Agrega productos a tu promoción
                        </h5>
                        <form onSubmit={handleSubmit(submitSearch)}>
                            <Box className={classes.filterWrapper}>
                                <Box>
                                    <Controller
                                        name="search"
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <TextInput
                                                error={
                                                    fieldState.error
                                                        ? true
                                                        : false
                                                }
                                                errorMessage={fieldState.error}
                                                icon={null}
                                                label={'Nombre del producto'}
                                                value={field.value}
                                                onChange={({ target }) => {
                                                    field.onChange(target.value)
                                                }}
                                            />
                                        )}
                                    />
                                </Box>
                                {watchSearch && (
                                    <Box display="flex" flex={1}>
                                        <IconButton
                                            variant="contained"
                                            color="primary"
                                            type="submit"
                                            style={{
                                                alignSelf: 'center',
                                                color: 'rgba(0,175,195, 1)',
                                            }}
                                        >
                                            <Search />
                                        </IconButton>
                                        <IconButton
                                            onClick={handleDeleteSearch}
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
                            </Box>
                        </form>
                    </Box>
                    {loadingProductsData || loadingCategoriesData ? (
                        <Box display="flex" justifyContent="center" mt="2rem">
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box className={classes.table}>
                            <Table
                                styles={{
                                    tableWrapper: {
                                        overflowX: 'hidden',
                                        width: 'fit-content',
                                    },
                                }}
                                tableHeaderColor="primary"
                                tableHead={[
                                    'id',
                                    'Nombre',
                                    'Categoría',
                                    'Precio',
                                    'Descuento',
                                    'Precio final',
                                    'Estatus',
                                    'Acciones',
                                ]}
                                tableData={productsData.data.products.map(
                                    (e) => {
                                        return [
                                            e._id,
                                            e.name,
                                            productCategory(e.category),
                                            `$${formatNumber(
                                                e.price.toFixed(1)
                                            )}`,
                                            e.discount ? `${e.discount}%` : 0,
                                            `$${formatNumber(
                                                finalPrice(e.price, e.discount)
                                            )}`,
                                            e.status
                                                ? e.status.available
                                                    ? 'Disponible'
                                                    : 'No disponible'
                                                : 'Sin información',
                                            <Button
                                                type="button"
                                                color="primary"
                                                key={e._id}
                                                onClick={() => addProducts(e)}
                                            >
                                                Agregar
                                            </Button>,
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
                                onPageChange={(e) => handlePageClick(e)}
                                pageRangeDisplayed={5}
                                pageCount={Math.ceil(
                                    productsData.data.total / 10
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
                        </Box>
                    )}
                </Box>
                <DialogActions>
                    <Button
                        color="primary"
                        type="button"
                        onClick={() => setOpenProductModal(false)}
                    >
                        Listo
                    </Button>
                </DialogActions>
            </Dialog>

            <CustomModal
                open={successAddOffer}
                handleClose={() => {
                    history.push('/admin/offers')

                    dispatch(resetSuccess())
                }}
                icon={'success'}
                title="¡Listo!"
                subTitle="Tu promoción se guardo exitosamente"
                hasCancel={false}
                hasConfirm={true}
                cancelCb={() => {}}
                confirmCb={() => {
                    history.push('/admin/offers')
                    dispatch(resetSuccess())
                }}
            />
        </>
    )
}
