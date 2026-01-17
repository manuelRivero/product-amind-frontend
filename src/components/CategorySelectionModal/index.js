import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import {
    Dialog,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    Checkbox,
} from '@material-ui/core'
import Table from '../Table/Table'
import Button from '../CustomButtons/Button'

import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'
import LoadinScreen from 'components/LoadingScreen'
import { useDispatch, useSelector } from 'react-redux'
import { getCategories } from 'store/categories'

const useStyles = makeStyles((theme) => ({
    dialog: {
        '& .MuiDialog-paper': {
            maxWidth: 700,
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
        backgroundColor: 'white',
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
        marginLeft: 'auto',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
        padding: theme.spacing(1.5),
        backgroundColor: 'white',
        borderRadius: theme.spacing(1),
        border: '1px solid #dee2e6',
        maxWidth: 'fit-content'
    },
    selectionInfo: {
        display: 'flex',
        justifyContent: 'space-between',
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
    supportText: {
        marginTop: theme.spacing(2),
        color: theme.palette.text.secondary,
        fontSize: '0.875rem',
    },
}))

const CategorySelectionModal = ({
    open,
    onClose,
    newPlan,
    onConfirm,
    supportMessage,
}) => {
    const classes = useStyles()
    const dispatch = useDispatch()
    const { configDetail } = useSelector((state) => state.config)
    const { categoriesData, loadingCategoriesData, categoriesDataError } = useSelector((state) => state.categories)

    const [selectedCategories, setSelectedCategories] = useState([])
    console.log("categories Data", categoriesData?.data, categoriesDataError)
    // Obtener límites de productos
    const getCategoriesLimit = (plan) => {
        if (!plan) return 0

        const feature = plan.features?.createCategories
        if (!feature || !feature.enabled) return 0

        const limits = feature.limits
        if (!limits) return 0

        if (limits.unlimited) return Infinity

        return limits.maxCategories || 0
    }

    const newLimit = getCategoriesLimit(newPlan)
    const currentCategoryLimit = configDetail?.currentPlan?.features?.createCategories?.limits?.maxCategories || Infinity;



    useEffect(() => {

        const getData = async () => {
            if (newLimit !== Infinity && newLimit < currentCategoryLimit) {
            dispatch(getCategories(
                    {
                        access: "",
                        filters: {
                        },
                        ids: [],
                        page: 0,
                    }
                ))
            }
        }
        getData()
    }, [])

    // Manejar selección individual
    const handleCategoriesToggle = (productId) => {
        setSelectedCategories(prev => {
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


    // Obtener productos seleccionados
    const getSelectedCategories = () => {
        return categoriesData?.data.filter(p => selectedCategories.includes(p._id))
    }


    // Preparar datos de la tabla
    const tableData = categoriesData ? categoriesData?.data.map(category => [
        category._id,
        category.name,
        <Checkbox
            key={`checkbox-${category._id}`}
            checked={selectedCategories.includes(category._id)}
            onChange={() => handleCategoriesToggle(category._id)}
            color="primary"
            disabled={!selectedCategories.includes(category._id) && selectedCategories.length >= newLimit && newLimit !== Infinity}
        />
    ]) : []

    // Obtener productos que se mantendrán
    const categoriesToKeep = categoriesData ? getSelectedCategories() : []
    const categoriesToRemove = categoriesData ? categoriesData?.data.filter(p => !selectedCategories.includes(p._id)) : []

    const handleConfirm = () => {
        onConfirm({
            categoriesToKeep,
            categoriesToRemove,
            selectedCategories
        })
    }

    if (!open) return null
    if (loadingCategoriesData || !categoriesData) return <LoadinScreen />

    return (
        <Dialog
            open={open}
            onClose={()=>{}}
            className={classes.dialog}
            maxWidth="lg"
            fullWidth
        >


            <DialogContent className={classes.dialogContent}>
                <Card>
                    <CardHeader color="primary">
                        <h4 className={classes.cardTitleWhite}>
                            Límite de categorías excedido
                        </h4>
                    </CardHeader>
                    <CardBody>
                        {/* Alerta informativa */}
                        <Box className={classes.alert}>
                            <Typography variant="body1">
                                <strong>Tu nuevo plan tiene un límite menor de categorías.</strong>
                                Debes seleccionar qué categorías mantener en tu tienda.
                            </Typography>
                        </Box>

                        {/* Resumen de límites */}
                        <Box className={classes.summarySection}>
                            <Typography className={classes.summaryTitle}>
                                Resumen de Límites
                            </Typography>
                            <Box className={classes.summaryItem}>
                                <span>Categorías actuales:</span>
                                <span className={classes.summaryValue}>{categoriesData?.data.length}</span>
                            </Box>
                            <Box className={classes.summaryItem}>
                                <span>Límite del nuevo plan:</span>
                                <span className={classes.summaryValue}>
                                    {newLimit === Infinity ? 'Ilimitado' : newLimit}
                                </span>
                            </Box>
                            <Box className={classes.summaryItem}>
                                <span>Categorías a mantener:</span>
                                <span className={classes.summaryValue}>
                                    {selectedCategories?.length} / {newLimit === Infinity ? categoriesData?.data.length : newLimit}
                                </span>
                            </Box>
                            <Box className={classes.summaryItem}>
                                <span>Categorías a eliminar:</span>
                                <span className={classes.summaryValue}>
                                    {categoriesToRemove?.length}
                                </span>
                            </Box>
                        </Box>

                        {/* Controles de selección */}
                        <Box className={classes.selectionControls}>
                            <Box className={classes.selectionInfo}>
                                <Typography>
                                    Categorías seleccionados:
                                    <span className={classes.selectionCount}> {selectedCategories.length}</span>
                                    {newLimit !== Infinity && (
                                        <span className={selectedCategories.length > newLimit ? classes.limitExceeded : classes.limitOk}>
                                            {' '}/ {newLimit}
                                        </span>
                                    )}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Tabla de productos */}
                        <Box className={classes.tableContainer}>
                            {categoriesData?.data.length === 0 ? (
                                <Box display="flex" justifyContent="center" mt="2rem">
                                    <Typography variant="body1" color="textSecondary">
                                        No hay categorías para mostrar
                                    </Typography>
                                </Box>
                            ) : (
                                <Table
                                    tableHeaderColor="primary"
                                    tableHead={[
                                        'ID',
                                        'Nombre',
                                        'Seleccionar'
                                    ]}
                                    tableData={tableData}
                                />
                            )}
                        </Box>

                        {/* Resumen final */}
                        {selectedCategories.length > 0 && (
                            <Box className={classes.summarySection}>
                                <Typography className={classes.summaryTitle}>
                                    Resumen de Cambios
                                </Typography>
                                <Box className={classes.summaryItem}>
                                    <span>Categorías que mantendrás:</span>
                                    <span className={classes.summaryValue}>{categoriesToKeep.length}</span>
                                </Box>
                                <Box className={classes.summaryItem}>
                                    <span>Categorías que se eliminarán:</span>
                                    <span className={classes.summaryValue}>{categoriesToRemove.length}</span>
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
                                        Las categorías no seleccionados serán eliminados de tu tienda.
                                        Esta acción no se puede deshacer.
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </CardBody>
                </Card>

                {supportMessage && (
                    <Typography className={classes.supportText}>
                        {supportMessage}
                    </Typography>
                )}
            </DialogContent>

            <DialogActions className={classes.dialogActions}>
                <Button
                    color="transparent"
                    onClick={onClose}
                    disabled={loadingCategoriesData}
                >
                    Cancelar
                </Button>
                <Button
                    color="primary"
                    onClick={handleConfirm}
                    disabled={loadingCategoriesData || selectedCategories.length === 0}
                    loading={loadingCategoriesData}
                >
                    Confirmar Selección
                </Button>
            </DialogActions>
        </Dialog >
    )
}

CategorySelectionModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    newPlan: PropTypes.object.isRequired,
    onConfirm: PropTypes.func.isRequired,
    supportMessage: PropTypes.string,
}

export default CategorySelectionModal 