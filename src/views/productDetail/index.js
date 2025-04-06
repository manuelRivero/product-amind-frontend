import React, { useEffect, useMemo } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import { Box, Divider, IconButton } from '@material-ui/core'

import { useParams, useHistory } from 'react-router-dom'

import { primaryColor } from 'assets/jss/material-dashboard-react.js'
import { useDispatch, useSelector } from 'react-redux'
import LoadinScreen from 'components/LoadingScreen'
import { getProductDetail } from 'store/products'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { getCategories } from '../../store/categories'
import { formatNumber } from '../../helpers/product'

const useStyles = makeStyles({
    uploadImage: {
        maxWidth: '50px',
    },
    dropZone: {
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'center',
        padding: '1rem',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '220px',
        boxSizing: 'border-box',
        background: '#fff',
    },
    imagesRow: {
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
    },
    inputRow: {
        margin: '1rem 0',
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
    },
    descriptionRow: {
        margin: '1rem 0',
        display: 'flex',
        gap: '2rem',
        flexWrap: 'wrap',
        '& > *': {
            width: '100%',
        },
        '& .MuiFormControl-root': {
            width: '100%',
        },
    },

    buttonsRow: {
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginTop: '1rem',
    },
    checked: {
        color: primaryColor[0] + '!important',
    },
    errorText: {
        marginBottom: 0,
        marginTop: '5px',
    },
    imagesWrapper: {
        position: 'relative',
        maxWidth: '220px',
        height: '220px',
        width: '100%',
    },
    productImage: {
        borderRadius: '16px',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    trashICon: {
        position: 'absolute',
        top: '5px',
        right: '5px',
        '& img': {
            width: '24px',
        },
    },
    input: {
        '& .MuiInputBase-input': {
            background: '#fff !important',
        },
    },
})

export default function ProductDetail() {
    const history = useHistory()
    const params = useParams()

    const { user } = useSelector((state) => state.auth)

    const { loadingProductDetail, productDetail } = useSelector(
        (state) => state.products
    )
    const { categoriesData, loadingCategoriesData } = useSelector(
        (state) => state.categories
    )

    const category = useMemo(() => {
        if (categoriesData && productDetail) {
            const target = categoriesData.data.find(
                (category) => category._id === productDetail.category
            )
            if (target) {
                return target
            } else {
                return null
            }
        } else {
            return null
        }
    }, [categoriesData, productDetail])
    console.log('category data', categoriesData?.data)
    const dispatch = useDispatch()
    const classes = useStyles()

    //form

    useEffect(() => {
        dispatch(getProductDetail({ access: user.token, id: params.id }))
        dispatch(
            getCategories({
                access: user.token,
                filters: { page: 1, limit: 50 },
            })
        )
    }, [])

    console.log('productDetail', productDetail)
    if (loadingProductDetail || loadingCategoriesData) {
        return <LoadinScreen />
    }

    return (
        <section>
            <IconButton
                className={classes.backButton}
                onClick={() => history.goBack()}
            >
                <ArrowBackIcon />
            </IconButton>
            <Box>
                <h3>Imágenes de tu producto</h3>
            </Box>
            <div className={classes.imagesRow}>
                {productDetail.images.map((image, index) => {
                    return (
                        <div
                            className={classes.imagesWrapper}
                            key={`image-${index}`}
                        >
                            <img
                                className={classes.productImage}
                                src={image.url}
                                alt="product-image"
                            />
                        </div>
                    )
                })}
            </div>
            <Box
                padding={2}
                mt={4}
                style={{ background: '#fff', borderRadius: '16px' }}
            >
                <Box>
                    <h3>Información de tu producto</h3>
                </Box>
                <Box className={classes.inputRow}>
                    <div>
                        <p>Nombre:</p>
                        <p>
                            <strong>{productDetail.name}</strong>
                        </p>
                    </div>
                    <div>
                        <p>Precio</p>
                        <p>
                            <strong>
                                ${formatNumber(productDetail.price)}
                            </strong>
                        </p>
                    </div>
                    <div>
                        <p>Categoría</p>
                        <p>
                            <strong>{category?.name}</strong>
                        </p>
                    </div>
                    <div>
                        <p>Descuento</p>
                        <p>
                            <strong>
                                {formatNumber(productDetail.discount)}%
                            </strong>
                        </p>
                    </div>
                    <div>
                        <p>Estatus</p>
                        <p>
                            <strong>
                                {productDetail.status.available
                                    ? 'Disponible'
                                    : 'No disponible'}
                            </strong>
                        </p>
                    </div>
                </Box>
                <Box marginBottom={4}>
                    <p>Descripción</p>
                    <p>
                        <strong>{productDetail.description}</strong>
                    </p>
                </Box>
            </Box>
            <Box
                padding={2}
                mt={4}
                style={{ background: '#fff', borderRadius: '16px' }}
            >
                <Box>
                    <h3>Variantes de tu producto</h3>
                </Box>
                <>
                    {productDetail.features.map((feature, index) => {
                        return (
                            <>
                                <div key={feature._id}>
                                    <p>
                                        <strong>Variante #{index + 1}</strong>
                                    </p>
                                    {feature.color && (
                                        <Box
                                            marginBottom={2}
                                            className={classes.inputRow}
                                        >
                                            <p style={{ margin: 0 }}>Color:</p>
                                            <p style={{ margin: 0 }}>
                                                <strong>{feature.color}</strong>
                                            </p>
                                        </Box>
                                    )}
                                    {feature.size && (
                                        <Box
                                            marginBottom={2}
                                            className={classes.inputRow}
                                        >
                                            <p style={{ margin: 0 }}>Talla:</p>
                                            <p style={{ margin: 0 }}>
                                                <strong>{feature.size}</strong>
                                            </p>
                                        </Box>
                                    )}
                                    {feature.stock && (
                                        <Box
                                            marginBottom={2}
                                            className={classes.inputRow}
                                        >
                                            <p style={{ margin: 0 }}>Stock</p>
                                            <p style={{ margin: 0 }}>
                                                <strong>{feature.stock}</strong>
                                            </p>
                                        </Box>
                                    )}
                                </div>
                                <Divider />
                            </>
                        )
                    })}
                </>
            </Box>
        </section>
    )
}
