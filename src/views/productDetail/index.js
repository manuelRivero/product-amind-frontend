import React, { useEffect, useMemo } from 'react'

import { makeStyles } from '@material-ui/core/styles'
import { Box, IconButton, Divider, Chip } from '@material-ui/core'

import { useParams, useHistory } from 'react-router-dom'

import { primaryColor } from 'assets/jss/material-dashboard-react.js'
import { useDispatch, useSelector } from 'react-redux'
import LoadinScreen from 'components/LoadingScreen'
import { getProductDetail } from 'store/products'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { formatNumber } from '../../helpers/product'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'
import Button from 'components/CustomButtons/Button'

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
        marginBottom: '2rem',
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
        marginTop: '2rem',
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
        background: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
            transform: 'scale(1.02)',
        },
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
    card: {
        marginBottom: '20px',
    },
    cardTitleWhite: {
        color: '#FFFFFF',
        marginTop: '0px',
        minHeight: 'auto',
        fontWeight: '300',
        fontFamily: "'Roboto",
        marginBottom: '3px',
        textDecoration: 'none',
    },
    cardCategoryWhite: {
        color: 'rgba(255, 255, 255, 0.62)',
        margin: '0',
        fontSize: '14px',
        marginTop: '0',
        marginBottom: '0',
    },
    // Nuevos estilos para mejor UX/UI
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#3C4858',
        marginBottom: '1.5rem',
        paddingBottom: '0.5rem',
    },
    infoCard: {
        background: '#fff',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
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
    statusAvailable: {
        background: '#E8F5E8',
        color: '#2E7D32',
    },
    statusUnavailable: {
        background: '#FFEBEE',
        color: '#C62828',
    },

    descriptionText: {
        fontSize: '1rem',
        lineHeight: '1.6',
        color: '#555',
        margin: '1rem 0',
    },
    variantsSection: {
        background: '#fff',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    variantCard: {
        background: '#f8f9fa',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        border: '1px solid #e9ecef',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)',
        },
    },
    variantHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    variantNumber: {
        background: '#00ACC1',
        color: 'white',
        borderRadius: '50%',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.875rem',
        fontWeight: '600',
        marginRight: '1rem',
    },
    variantTitle: {
        fontSize: '1.125rem',
        fontWeight: '600',
        color: '#3C4858',
        margin: 0,
    },
    variantGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
    },
    variantItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
    },
    variantLabel: {
        fontSize: '0.75rem',
        color: '#666',
        fontWeight: '500',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    variantValue: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#3C4858',
    },
    stockValue: {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: '#00ACC1',
    },
    keywordsSection: {
        background: '#fff',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginTop: '2rem',
    },
    keywordsList: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        marginTop: '1rem',
    },
})

export default function ProductDetail() {
    const history = useHistory()
    const params = useParams()

    const { user } = useSelector((state) => state.auth)

    const { loadingProductDetail, productDetail } = useSelector(
        (state) => state.products
    )
    const dispatch = useDispatch()
    const classes = useStyles()

    //form

    useEffect(() => {
        dispatch(getProductDetail({ access: user.token, id: params.id }))
    }, [dispatch, user.token, params.id])

    const categoryName = useMemo(() => {
        return productDetail?.categoryDetail?.[0]?.name || 'Sin categoría'
    }, [productDetail])

    const formattedPrice = useMemo(
        () => `$${formatNumber(productDetail?.price ?? 0)}`,
        [productDetail]
    )
    const formattedCost = useMemo(() => {
        if (productDetail?.cost === null || productDetail?.cost === undefined) {
            return 'No informado'
        }
        return `$${formatNumber(productDetail.cost)}`
    }, [productDetail])

    const hasVariants = useMemo(
        () => productDetail?.features?.some((feature) => feature.color || feature.size),
        [productDetail]
    )

    const generalStock = useMemo(() => {
        if (productDetail?.stock !== undefined && productDetail?.stock !== null) {
            return productDetail.stock
        }
        const baseFeature = productDetail?.features?.find((feature) => !feature.color && !feature.size)
        return baseFeature?.stock ?? 0
    }, [productDetail])

    const keywords = productDetail?.keywords || []

    const renderFeatureValue = (value, fallback = 'Sin información') => {
        if (value === null || value === undefined || value === '') return fallback
        if (typeof value === 'string') return value
        if (typeof value === 'object') {
            return (
                value.name ||
                value.label ||
                value.hexCode ||
                value.value ||
                value._id ||
                fallback
            )
        }
        return String(value)
    }

    console.log('productDetail', productDetail)
    if (loadingProductDetail) {
        return <LoadinScreen />
    }

    if (!productDetail) {
        return (
            <section>
                <IconButton
                    className={classes.backButton}
                    onClick={() => history.goBack()}
                >
                    <ArrowBackIcon />
                </IconButton>
                <Card className={classes.card}>
                    <CardHeader color="primary">
                        <h4 className={classes.cardTitleWhite}>Detalle del producto</h4>
                    </CardHeader>
                    <CardBody>
                        <p>No se encontró información para este producto.</p>
                    </CardBody>
                </Card>
            </section>
        )
    }

    return (
        <section>
            <IconButton
                className={classes.backButton}
                onClick={() => history.goBack()}
            >
                <ArrowBackIcon />
            </IconButton>
            <Card className={classes.card}>
                <CardHeader color="primary">
                    <h4 className={classes.cardTitleWhite}>Detalle del producto</h4>
                    <p className={classes.cardCategoryWhite}>
                        Consulta la información y variantes de tu producto.
                    </p>
                </CardHeader>
                <CardBody>
                    {/* Sección de imágenes */}
                    <h3 className={classes.sectionTitle}>Imágenes del producto</h3>
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
                                        alt={`product-image-${index + 1}`}
                                    />
                                </div>
                            )
                        })}
                    </div>
                    <Divider style={{ margin: '2rem 0' }} />

                    {/* Sección de información principal */}
                    <h3 className={classes.sectionTitle}>Información del producto</h3>
                    <div className={classes.infoGrid}>
                        <div className={classes.infoItem}>
                            <span className={classes.infoLabel}>Nombre</span>
                            <span className={classes.infoValue}>{productDetail.name}</span>
                        </div>
                        <div className={classes.infoItem}>
                            <span className={classes.infoLabel}>Precio</span>
                            <span className={classes.priceValue}>{formattedPrice}</span>
                        </div>
                        <div className={classes.infoItem}>
                            <span className={classes.infoLabel}>Categoría</span>
                            <span className={classes.infoValue}>{categoryName}</span>
                        </div>
                        <div className={classes.infoItem}>
                            <span className={classes.infoLabel}>Descuento</span>
                            <span className={classes.infoValue}>{formatNumber(productDetail.discount ?? 0)}%</span>
                        </div>
                        <div className={classes.infoItem}>
                            <span className={classes.infoLabel}>Costo</span>
                            <span className={classes.infoValue}>{formattedCost}</span>
                        </div>
                        {productDetail.offerDiscount && <div className={classes.infoItem}>
                            <span className={classes.infoLabel}>Descuento de oferta asociado</span>
                            <span className={classes.infoValue}>{`${productDetail.offerDiscount ?? 0}%`}</span>
                        </div>}
                        <div className={classes.infoItem}>
                            <span className={classes.infoLabel}>Estado</span>
                            <span
                                className={`${classes.statusBadge} ${
                                    productDetail.status?.available
                                        ? classes.statusAvailable
                                        : classes.statusUnavailable
                                }`}
                            >
                                {productDetail.status?.available ? 'Disponible' : 'No disponible'}
                            </span>
                        </div>
                        {productDetail.features.filter((feature) => !feature.color && !feature.size).length > 0 && (
                            <div className={classes.infoItem}>
                                <span className={classes.infoLabel}>Stock general</span>
                                <span className={classes.stockValue}>{generalStock} unidades</span>
                            </div>
                        )}
                    </div>

                    {/* Descripción */}
                    <span className={classes.infoLabel}>Descripción</span>
                    <div
                        className={classes.descriptionText}
                        dangerouslySetInnerHTML={{ __html: productDetail.description || '<p>Sin descripción</p>' }}
                    />
                    
                    {hasVariants && (
                        <>
                            <Divider style={{ margin: '2rem 0' }} />
                            <h3 className={classes.sectionTitle}>Variantes del producto</h3>
                            {productDetail.features
                                .filter((feature) => feature.color || feature.size)
                                .map((feature, index) => {
                                    return (
                                        <div key={feature._id} className={classes.variantCard}>
                                            <div className={classes.variantHeader}>
                                                <div className={classes.variantNumber}>
                                                    {index + 1}
                                                </div>
                                                <h4 className={classes.variantTitle}>
                                                    Variante #{index + 1}
                                                </h4>
                                            </div>
                                            <div className={classes.variantGrid}>
                                                {feature.color && (
                                                    <div className={classes.variantItem}>
                                                        <span className={classes.variantLabel}>Color</span>
                                                        <span className={classes.variantValue}>
                                                            {renderFeatureValue(feature.color)}
                                                        </span>
                                                    </div>
                                                )}
                                                {feature.size && (
                                                    <div className={classes.variantItem}>
                                                        <span className={classes.variantLabel}>Talla</span>
                                                        <span className={classes.variantValue}>
                                                            {renderFeatureValue(feature.size)}
                                                        </span>
                                                    </div>
                                                )}
                                                {feature.stock && (
                                                    <div className={classes.variantItem}>
                                                        <span className={classes.variantLabel}>Stock</span>
                                                        <span className={classes.stockValue}>{feature.stock} unidades</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                        </>
                    )}
                    {keywords.length > 0 && (
                        <Box className={classes.keywordsSection}>
                            <h3 className={classes.sectionTitle}>Palabras clave</h3>
                            <Box className={classes.keywordsList}>
                                {keywords.map((keyword) => (
                                    <Chip key={keyword} label={keyword} color="primary" variant="outlined" />
                                ))}
                            </Box>
                        </Box>
                    )}
                    <Box className={classes.buttonsRow}>
                        <Button
                            color="primary"
                            onClick={() => history.push(`/admin/products/edit-product/${params.id}`)}
                        >
                            Editar producto
                        </Button>
                    </Box>
                </CardBody>
            </Card>
        </section>
    )
}
