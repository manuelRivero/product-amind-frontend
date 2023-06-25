import { Box, ClickAwayListener, makeStyles } from '@material-ui/core'
import GridItem from 'components/Grid/GridItem'
import React, { useEffect, useRef, useState } from 'react'
import debounce from 'lodash.debounce'

import TextInput from 'components/TextInput/Index'
import { getProducts } from 'store/products'
import { useDispatch, useSelector } from 'react-redux'
import GridContainer from 'components/Grid/GridContainer'

const useStyles = makeStyles({
    root: {},
    productCard: {
        borderRadius: '.5rem',
        padding: '.5rem',
        backgroundColor: '#fff',
    },
    inputWrapper: {
        position: 'relative',
    },
    productsList: {
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
})
export default function CreateSale() {
    const formRef = useRef(null)
    const classes = useStyles()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    const { productsData, loadingProductsData } = useSelector(
        (state) => state.products
    )

    const [searchValue, setSearchValue] = useState('')
    const [options, setOptions] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [selectedProducts, setSelectedProducts] = useState([])

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
            setSelectedProducts([...selectedProducts, product])
        }
    }
    const handleTotal = () => {
        let total = 0
        selectedProducts.forEach((e) => {
            total = (e.total * e.quantity) | (1 + total)
        })
        return total
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
                                label={'Busca por nombre o por id'}
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
            <h4>Productos agregados</h4>
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
                                <h5>
                                    Nombre:
                                    <strong>{product.name}</strong>
                                </h5>
                                <p>
                                    Id: <strong>{product._id}</strong>
                                </p>
                                <p>
                                    Cantidad: <strong>5</strong>
                                </p>
                                <p>
                                    Precio: <strong>{product.price}</strong>
                                </p>
                            </Box>
                        </GridItem>
                    )
                })}
            </GridContainer>
            <Box>
                <h4>Total de la orden:{handleTotal()}</h4>
            </Box>
        </Box>
    )
}
