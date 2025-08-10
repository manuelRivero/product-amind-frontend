import React, { useState, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import {
    Dialog,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Checkbox,
    CircularProgress
} from '@material-ui/core'
import {
    CheckCircle as CheckCircleIcon
} from '@material-ui/icons'
import Table from '../Table/Table'
import Button from '../CustomButtons/Button'
import { formatNumber } from '../../helpers/product'

import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'
import LoadinScreen from 'components/LoadingScreen'
import client from 'api/client'
import { useSelector } from 'react-redux'

const useStyles = makeStyles((theme) => ({
    dialog: {
        '& .MuiDialog-paper': {
            maxWidth: 1200,
            width: '100%',
            maxHeight: '90vh',
        },
    },
    dialogTitle: {
        backgroundColor: theme.palette.warning.main,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
    dialogContent: {
        padding: theme.spacing(3),
    },
    alert: {
        marginBottom: theme.spacing(3),
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        color: '#856404',
    },
    summarySection: {
        backgroundColor: '#f8f9fa',
        padding: theme.spacing(2),
        borderRadius: theme.spacing(1),
        marginBottom: theme.spacing(3),
        border: '1px solid #dee2e6',
    },
    summaryTitle: {
        fontWeight: 'bold',
        marginBottom: theme.spacing(1),
        color: theme.palette.primary.main,
    },
    summaryItem: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: theme.spacing(0.5),
        fontSize: '0.9rem',
    },
    summaryValue: {
        fontWeight: 'bold',
    },
    tableContainer: {
        marginTop: theme.spacing(2),
    },
    selectionControls: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
        padding: theme.spacing(1.5),
        backgroundColor: '#e3f2fd',
        borderRadius: theme.spacing(1),
        border: '1px solid #bbdefb',
    },
    selectionInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
    },
    selectionCount: {
        fontWeight: 'bold',
        color: theme.palette.primary.main,
    },
    selectionActions: {
        display: 'flex',
        gap: theme.spacing(1),
    },
    productRow: {
        '&:hover': {
            backgroundColor: '#f5f5f5',
        },
    },
    selectedRow: {
        backgroundColor: '#e8f5e8',
        '&:hover': {
            backgroundColor: '#d4edda',
        },
    },
    limitExceeded: {
        color: theme.palette.error.main,
        fontWeight: 'bold',
    },
    limitOk: {
        color: theme.palette.success.main,
        fontWeight: 'bold',
    },
    dialogActions: {
        padding: theme.spacing(2, 3),
        borderTop: '1px solid #e0e0e0',
        backgroundColor: '#fafafa',
    },
}))

const ProductSelectionModal = ({
    open,
    onClose,
    newPlan,
    onConfirm,
}) => {
    const classes = useStyles()
    const { configDetail } = useSelector((state) => state.config)

    const [selectedProducts, setSelectedProducts] = useState([])
    const [selectAll, setSelectAll] = useState(false)
    const [products, setProducts] = useState()
    const [loading, setLoading] = useState(true)

    // Obtener límites de productos
    const getProductLimit = (plan) => {
        if (!plan) return 0

        const feature = plan.features?.createProducts
        if (!feature || !feature.enabled) return 0

        const limits = feature.limits
        if (!limits) return 0

        if (limits.unlimited) return Infinity

        return limits.maxProducts || 0
    }

    const newLimit = getProductLimit(newPlan)
    const currentProductLimit = configDetail?.currentPlan?.features?.createProducts?.limits?.maxProducts || Infinity;
    const isLimitExceeded = useMemo(()=>{
        return newLimit !== Infinity && products > newLimit && products.length > 0
    },[]) 

    // Inicializar selección cuando se abre el modal
    useEffect(() => {
        if (open && isLimitExceeded && products.length > 0) {
            // Seleccionar los primeros productos hasta el límite
            const initialSelection = products.slice(0, newLimit).map(p => p._id)
            setSelectedProducts(initialSelection)
            setSelectAll(false)
        } else if (open) {
            setSelectedProducts([])
            setSelectAll(false)
        }
    }, [open, products, newLimit, isLimitExceeded])

    useEffect(() => {
        const getData =async () => {
            setLoading(true)
            try {
                // Obtener productos del usuario
                const response = await client.get('api/products/admin-products?limit=1000');
                console.log('Respuesta completa de productos:', response);
                const products = response.data?.products || [];

                console.log('Productos obtenidos:', products.length);
                console.log('¿Exceden el límite?', products.length > newLimit);

                if (products.length > newLimit) {
                    console.log('Mostrando modal de selección de productos');
                    setProducts(products);
                    return;
                } else {
                    console.log('No hay productos que excedan el límite, procediendo con cambio directo');
                }
            } catch (error) {
                console.error('Error obteniendo productos:', error);
                return;
            } finally {
                setLoading(false);
            }
        }
       if(newLimit !== Infinity && newLimit < currentProductLimit){
            getData()
        }
    }, [])

    // Manejar selección individual
    const handleProductToggle = (productId) => {
        setSelectedProducts(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId)
            } else {
                // Solo agregar si no excede el límite
                if (prev.length < newLimit) {
                    return [...prev, productId]
                }
                return prev
            }
        })
    }

    // Manejar selección de todos
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedProducts([])
            setSelectAll(false)
        } else {
            const maxSelectable = newLimit === Infinity ? products.length : Math.min(newLimit, products.length)
            const allIds = products.slice(0, maxSelectable).map(p => p._id)
            setSelectedProducts(allIds)
            setSelectAll(true)
        }
    }

    // Manejar deselección de todos
    const handleDeselectAll = () => {
        setSelectedProducts([])
        setSelectAll(false)
    }

    // Obtener productos seleccionados
    const getSelectedProducts = () => {
        return products?.filter(p => selectedProducts.includes(p._id))
    }

    // Función para obtener el nombre de la categoría
    const getCategoryName = (category) => {
        return category?.name || 'Sin categoría'
    }

    // Función para calcular precio final
    const getFinalPrice = (price, discount) => {
        if (!discount) return price
        return price - (price * discount / 100)
    }

    // Función para obtener el estado del producto
    const getProductStatus = (status) => {
        if (!status) return 'Sin información'
        return status.available ? 'Disponible' : 'No disponible'
    }

    // Preparar datos de la tabla
    const tableData = products?.map(product => [
        product._id,
        product.name,
        getCategoryName(product.category),
        `$${formatNumber((product.price || 0).toFixed(1))}`,
        product.discount ? `${product.discount}%` : '0%',
        `$${formatNumber(getFinalPrice(product.price || 0, product.discount || 0).toFixed(1))}`,
        getProductStatus(product.status),
        <Checkbox
            key={`checkbox-${product._id}`}
            checked={selectedProducts.includes(product._id)}
            onChange={() => handleProductToggle(product._id)}
            color="primary"
            disabled={!selectedProducts.includes(product._id) && selectedProducts.length >= newLimit && newLimit !== Infinity}
        />
    ])

    // Obtener productos que se mantendrán
    const productsToKeep = getSelectedProducts()
    const productsToRemove = products?.filter(p => !selectedProducts.includes(p._id))

    const handleConfirm = () => {
        onConfirm({
            productsToKeep,
            productsToRemove,
            selectedProducts
        })
    }

    if (!open) return null
    if(loading) return <LoadinScreen />

    return (
        <Dialog 
            open={open} 
            onClose={()=> {}} 
            className={classes.dialog}
            maxWidth="lg"
            fullWidth
        >
           
            
            <DialogContent className={classes.dialogContent}>
                <Card>
                    <CardHeader color="primary">
                        <h4 className={classes.cardTitleWhite}>
                            Límite de productos excedido
                        </h4>
                    </CardHeader>
                    <CardBody>
                {/* Alerta informativa */}
                <Box className={classes.alert}>
                    <Typography variant="body1">
                        <strong>Tu nuevo plan tiene un límite menor de productos.</strong> 
                        Debes seleccionar qué productos mantener en tu tienda.
                    </Typography>
                </Box>

                {/* Resumen de límites */}
                <Box className={classes.summarySection}>
                    <Typography className={classes.summaryTitle}>
                        Resumen de Límites
                    </Typography>
                    <Box className={classes.summaryItem}>
                        <span>Productos actuales:</span>
                        <span className={classes.summaryValue}>{products.length}</span>
                    </Box>
                    <Box className={classes.summaryItem}>
                        <span>Límite del nuevo plan:</span>
                        <span className={classes.summaryValue}>
                            {newLimit === Infinity ? 'Ilimitado' : newLimit}
                        </span>
                    </Box>
                    <Box className={classes.summaryItem}>
                        <span>Productos a mantener:</span>
                        <span className={classes.summaryValue}>
                            {selectedProducts.length} / {newLimit === Infinity ? products.length : newLimit}
                        </span>
                    </Box>
                    <Box className={classes.summaryItem}>
                        <span>Productos a eliminar:</span>
                        <span className={classes.summaryValue}>
                            {productsToRemove.length}
                        </span>
                    </Box>
                </Box>
                        
                {/* Controles de selección */}
                <Box className={classes.selectionControls}>
                    <Box className={classes.selectionInfo}>
                        <CheckCircleIcon color="primary" />
                        <Typography>
                            Productos seleccionados: 
                            <span className={classes.selectionCount}> {selectedProducts.length}</span>
                            {newLimit !== Infinity && (
                                <span className={selectedProducts.length > newLimit ? classes.limitExceeded : classes.limitOk}>
                                    {' '}/ {newLimit}
                                </span>
                            )}
                        </Typography>
                    </Box>
                    <Box className={classes.selectionActions}>
                        <Button
                            color="primary"
                            size="sm"
                            onClick={handleSelectAll}
                            disabled={selectAll}
                        >
                            Seleccionar todos
                        </Button>
                        <Button
                            color="warning"
                            size="sm"
                            onClick={handleDeselectAll}
                            disabled={selectedProducts.length === 0}
                        >
                            Deseleccionar todos
                        </Button>
                    </Box>
                </Box>

                {/* Tabla de productos */}
                <Box className={classes.tableContainer}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" mt="2rem">
                            <CircularProgress />
                        </Box>
                    ) : products.length === 0 ? (
                        <Box display="flex" justifyContent="center" mt="2rem">
                            <Typography variant="body1" color="textSecondary">
                                No hay productos para mostrar
                            </Typography>
                        </Box>
                    ) : (
                        <Table
                            tableHeaderColor="primary"
                            tableHead={[
                                'ID',
                                'Nombre',
                                'Categoría',
                                'Precio',
                                'Descuento',
                                'Precio Final',
                                'Estado',
                                'Seleccionar'
                            ]}
                            tableData={tableData}
                        />
                    )}
                </Box>

                {/* Resumen final */}
                {selectedProducts.length > 0 && (
                    <Box className={classes.summarySection}>
                        <Typography className={classes.summaryTitle}>
                            Resumen de Cambios
                        </Typography>
                        <Box className={classes.summaryItem}>
                            <span>Productos que mantendrás:</span>
                            <span className={classes.summaryValue}>{productsToKeep.length}</span>
                        </Box>
                        <Box className={classes.summaryItem}>
                            <span>Productos que se eliminarán:</span>
                            <span className={classes.summaryValue}>{productsToRemove.length}</span>
                        </Box>
                        <Box style={{ 
                            marginTop: 16, 
                            padding: 16, 
                            backgroundColor: '#e3f2fd', 
                            border: '1px solid #bbdefb', 
                            borderRadius: 4,
                            color: '#1976d2'
                        }}>
                            <Typography variant="body2">
                                Los productos no seleccionados serán eliminados de tu tienda. 
                                Esta acción no se puede deshacer.
                            </Typography>
                        </Box>
                    </Box>
                )}
                    </CardBody>
                </Card>

            </DialogContent>
            
            <DialogActions className={classes.dialogActions}>
                <Button
                    color="transparent"
                    onClick={onClose}
                    disabled={loading}
                >
                    Cancelar
                </Button>
                <Button
                    color="primary"
                    onClick={handleConfirm}
                    disabled={loading || selectedProducts.length === 0}
                    loading={loading}
                >
                    Confirmar Selección
                </Button>
            </DialogActions>
        </Dialog >
    )
}

ProductSelectionModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    newPlan: PropTypes.object.isRequired,
    onConfirm: PropTypes.func.isRequired,
}

export default ProductSelectionModal 