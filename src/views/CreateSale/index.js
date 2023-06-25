import { Box, Checkbox, ClickAwayListener, makeStyles } from '@material-ui/core'
import GridItem from 'components/Grid/GridItem'
import React, { useEffect, useRef, useState } from 'react'
import debounce from 'lodash.debounce'

import TextInput from 'components/TextInput/Index'
import { getProducts } from 'store/products'
import { useDispatch, useSelector } from 'react-redux'
import GridContainer from 'components/Grid/GridContainer'
import ProductQuantityCounter from 'components/ProductQuantityCounter'
import Button from 'components/CustomButtons/Button.js'

//icons
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import CustomModal from 'components/CustomModal'
import { resetCreateSaleSuccess } from 'store/sales'
import { createSale } from 'store/sales'

const useStyles = makeStyles({
    root: {},
    productCard: {
        position: 'relative',
        borderRadius: '.5rem',
        padding: '.5rem',
        backgroundColor: '#fff',
        paddingTop: '1rem',
    },
    inputWrapper: {
        position: 'relative',
    },
    productsList: {
        zIndex: 100,
        boxShadow: '10px 11px 43px -18px rgba(0,0,0,0.75)',
        position: 'absolute',
        bottom: 0,
        left: 0,
        borderRadius: '.5rem',
        padding: '.5rem',
        backgroundColor: '#fff',
        transform: 'translateY(100%)',
        width: '100%',
        maxWidth: '350px',
    },
    productsListItem: {
        cursor: 'pointer',
        padding: '5px',
        '& > p': {
            margin: 0,
        },
        '&:hover': {
            backgroundColor: '#c2c2c2',
        },
    },
    productQuantityWrapper: {
        display: 'flex',
        gap: '.5rem',
    },
    trashIcon: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        color: 'red',
        cursor: 'pointer',
    },
    paymentWrapper: {
        display: 'flex',
        gap: '1rem',
    },
})
export default function CreateSale() {
    const formRef = useRef(null)
    const classes = useStyles()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { productsData, loadingProductsData } = useSelector(
        (state) => state.products
    )

    const { loadingCreateSale, createSaleSuccess } = useSelector(
        (state) => state.sales
    )

    const [searchValue, setSearchValue] = useState('')
    const [options, setOptions] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [selectedProducts, setSelectedProducts] = useState([])
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(0)
    const [formAlert, setFormAlert] = useState(null)

    const changeInputHandler = async () => {
        const value = formRef.current.elements.search.value
        dispatch(
            getProducts({
                access: user.token,
                filters: { search: value, page: 0 },
            })
        )
    }
    const debouncedChangeHandler = React.useMemo(
        () => debounce(changeInputHandler, 1000),
        []
    )
    const addProduct = (product) => {
        const productList = [...selectedProducts]
        const targetProduct = productList.findIndex(
            (e) => e._id === product._id
        )
        if (targetProduct < 0) {
            setSelectedProducts([
                ...selectedProducts,
                { ...product, selectedQuantity: 1 },
            ])
        }
    }
    const handleQuantity = (product, quantity) => {
        console.log('product id', product._id)
        const productList = [...selectedProducts]
        const targetProduct = productList.findIndex(
            (e) => e._id === product._id
        )
        console.log('target product', targetProduct)
        if (targetProduct >= 0) {
            productList[targetProduct].selectedQuantity = quantity
        }
        setSelectedProducts(productList)
    }
    const handleTotal = () => {
        let total = 0
        selectedProducts.forEach((e) => {
            total = e.price * e.selectedQuantity + total
        })
        return total
    }
    const removeProduct = (id) => {
        const productList = [...selectedProducts].filter((e) => e._id !== id)
        setSelectedProducts(productList)
    }
    const handleSuccess = () => {
        dispatch(resetCreateSaleSuccess())
        setSelectedProducts([])
    }
    const submit = () => {
        if (selectedProducts.length > 0) {
            setFormAlert(null)

            dispatch(
                createSale({
                    access: user.token,
                    saleData: {
                        products: selectedProducts.map((e) => ({
                            _id: e._id,
                            quantity: e.selectedQuantity,
                        })),
                        paymentMethod: selectedPaymentMethod,
                    },
                })
            )
        } else{
            setFormAlert("No has seleccionado ningún producto")
        }
    }
    useEffect(() => {
        console.log('product data', productsData)
        if (productsData?.data && productsData.data.length > 0) {
            setOptions(productsData.data)
            setIsOpen(true)
            return
        } else {
            setOptions([])
            setIsOpen(false)
            return
        }
    }, [loadingProductsData, productsData])
    return (
        <Box>
            <Box>
                <h4>Agrega productos a tu nueva orden</h4>
                <Box>
                    <form ref={formRef}>
                        <Box className={classes.inputWrapper}>
                            <TextInput
                                name={'search'}
                                error={false}
                                errorMessage={null}
                                icon={null}
                                label={'Busca por nombre'}
                                value={searchValue}
                                onChange={({ target }) => {
                                    setSearchValue(target.value)
                                    debouncedChangeHandler(target.value)
                                }}
                            />
                            {isOpen && (
                                <ClickAwayListener
                                    onClickAway={() => setIsOpen(false)}
                                >
                                    <Box className={classes.productsList}>
                                        {options.map((product, index) => {
                                            return (
                                                <Box
                                                    key={`product-item-${index}`}
                                                    className={
                                                        classes.productsListItem
                                                    }
                                                    onClick={() => {
                                                        addProduct(product)
                                                        setIsOpen(false)
                                                        setSearchValue('')
                                                    }}
                                                >
                                                    <p>{product.name}</p>
                                                </Box>
                                            )
                                        })}
                                    </Box>
                                </ClickAwayListener>
                            )}
                        </Box>
                    </form>
                </Box>
            </Box>
            <h4>Productos agregados:</h4>
            <GridContainer>
                {selectedProducts.map((product, index) => {
                    return (
                        <GridItem
                            key={`selected-product-${index}`}
                            xs={12}
                            sm={6}
                            md={4}
                        >
                            <Box className={classes.productCard}>
                                <Box
                                    className={classes.trashIcon}
                                    onClick={() => removeProduct(product._id)}
                                >
                                    <DeleteForeverIcon />
                                </Box>
                                <p>
                                    Nombre: <strong>{product.name}</strong>
                                </p>
                                <p>
                                    Id: <strong>{product._id}</strong>
                                </p>
                                <Box className={classes.productQuantityWrapper}>
                                    <p>Cantidad:</p>
                                    <ProductQuantityCounter
                                        onChange={(product, quantity) =>
                                            handleQuantity(product, quantity)
                                        }
                                        product={product}
                                    />
                                </Box>
                                <p>
                                    Precio: <strong>{product.price}</strong>
                                </p>
                            </Box>
                        </GridItem>
                    )
                })}
                {selectedProducts.length === 0 && (
                    <GridItem>
                        <p>No has seleccionado ningún producto</p>
                    </GridItem>
                )}
            </GridContainer>
            <Box>
                <h5>Metodo de pago:</h5>
                <Box className={classes.paymentWrapper}>
                    <Box>
                        <label htmlFor="cash">
                            Efectivo
                            <Checkbox
                                id="cash"
                                classes={{
                                    checked: classes.checked,
                                }}
                                checked={
                                    selectedPaymentMethod === 0 ? true : false
                                }
                                onChange={() => setSelectedPaymentMethod(0)}
                                inputProps={{
                                    'aria-label': 'primary checkbox',
                                }}
                            />
                        </label>
                    </Box>
                    <Box>
                        <label htmlFor="card">
                            Transferencia o pago con tarjeta
                            <Checkbox
                                id="card"
                                classes={{
                                    checked: classes.checked,
                                }}
                                checked={
                                    selectedPaymentMethod === 1 ? true : false
                                }
                                onChange={() => setSelectedPaymentMethod(1)}
                                inputProps={{
                                    'aria-label': 'primary checkbox',
                                }}
                            />
                        </label>
                    </Box>
                </Box>
            </Box>
            <Box>
                <h4>Total de la orden:{handleTotal()}</h4>
            </Box>
            {formAlert && <Box><p>{formAlert}</p></Box>}
            <Box className={classes.submitRow}>
                <Button
                    isLoading={loadingCreateSale}
                    variant="contained"
                    color="primary"
                    type="button"
                    onClick={submit}
                >
                    Guardar orden
                </Button>
            </Box>
            <CustomModal
                open={createSaleSuccess}
                handleClose={handleSuccess}
                icon={'success'}
                title="¡Listo!"
                subTitle="Tu orden se guardo exitosamente"
                hasCancel={false}
                hasConfirm={true}
                cancelCb={() => {}}
                confirmCb={handleSuccess}
            />
        </Box>
    )
}
