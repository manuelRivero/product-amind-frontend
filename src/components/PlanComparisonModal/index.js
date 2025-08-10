import React from 'react'
import PropTypes from 'prop-types'
import { makeStyles } from '@material-ui/core/styles'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box,
    Chip
} from '@material-ui/core'
import {
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    Remove as RemoveIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon
} from '@material-ui/icons'
import {
    FEATURE_CONFIG,
    formatBillingCycle
} from '../../views/helpers/planFeatures'
import { formatNumber } from '../../helpers/product'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'
const useStyles = makeStyles((theme) => ({
    dialog: {
        '& .MuiDialog-paper': {
            maxWidth: 900,
            width: '100%',
        },
    },
    dialogTitle: {
        textAlign: 'center',
        paddingBottom: theme.spacing(2),
    },
    planHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing(2),
        padding: theme.spacing(2),
        borderRadius: theme.spacing(1),
        backgroundColor: '#f5f5f5',
    },
    planInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
    },
    planName: {
        fontWeight: 'bold',
        fontSize: '1.2rem',
        marginBottom: theme.spacing(0.5),
    },
    planPrice: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: theme.palette.primary.main,
        marginBottom: theme.spacing(0.5),
    },
    planBillingCycle: {
        fontSize: '0.9rem',
        color: '#666',
    },
    comparisonArrow: {
        fontSize: '2rem',
        color: theme.palette.primary.main,
        margin: theme.spacing(0, 2),
    },
    tableContainer: {
        marginTop: theme.spacing(2),
    },
    table: {
        minWidth: 650,
        '& .MuiTableCell-root': {
            border: '1px solid #edf0f3',
        }
    },
    tableHead: {
        backgroundColor: "white",
        '& .MuiTableCell-head': {
            fontWeight: 'bold',
        },
    },
    featureCell: {
        fontWeight: 'bold',
        backgroundColor: 'white',
    },
    currentPlanCell: {
        backgroundColor: 'white',
        textAlign: 'center',
    },
    newPlanCell: {
        backgroundColor: 'white',
        textAlign: 'center',
    },
    comparisonCell: {
        textAlign: 'center',
        fontWeight: 'bold',
    },
    upgradeChip: {
        backgroundColor: theme.palette.success.main,
        color: 'white',
        fontWeight: 'bold',
    },
    downgradeChip: {
        backgroundColor: theme.palette.warning.main,
        color: 'white',
        fontWeight: 'bold',
    },
    sameChip: {
        backgroundColor: theme.palette.grey[500],
        color: 'white',
        fontWeight: 'bold',
    },
    unlimitedText: {
        color: theme.palette.success.main,
        fontWeight: 'bold',
    },
    limitedText: {
        color: theme.palette.text.secondary,
    },
    featureIcon: {
        marginRight: theme.spacing(1),
        fontSize: '1rem',
    },
    featureTitle: {
        display: 'flex',
        alignItems: 'center',
        fontWeight: 'bold',
    },
    summarySection: {
        marginTop: theme.spacing(3),
        padding: theme.spacing(2),
        backgroundColor: '#f5f5f5',
        borderRadius: theme.spacing(1),
    },
    summaryTitle: {
        fontWeight: 'bold',
        marginBottom: theme.spacing(1),
    },
    summaryItem: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing(0.5),
    },
    summaryIcon: {
        marginRight: theme.spacing(1),
        fontSize: '1rem',
    },
}))

const PlanComparisonModal = ({
    open,
    onClose,
    currentPlan,
    newPlan,
    onConfirm
}) => {
    const classes = useStyles()

    if (!currentPlan || !newPlan) {
        return null
    }

    // Función para obtener el valor de límite de una feature
    const getFeatureLimit = (plan, featureKey) => {
        const feature = plan.features?.[featureKey]
        if (!feature || !feature.enabled) {
            return { value: null, enabled: false }
        }

        const config = FEATURE_CONFIG[featureKey]
        if (!config || !config.limitationKey) {
            return { value: 'Disponible', enabled: true }
        }

        const limits = feature.limits
        if (!limits) {
            return { value: 'Disponible', enabled: true }
        }

        if (limits.unlimited) {
            return { value: 'Ilimitado', enabled: true }
        }

        const limitValue = limits[config.limitationKey]
        return {
            value: limitValue !== undefined && limitValue !== null ? limitValue : 'Disponible',
            enabled: true
        }
    }

    // Función para comparar dos valores
    const compareValues = (currentValue, newValue) => {
        console.log('currentValue', currentValue)
        console.log('newValue', newValue)
        console.log('if comparison', Boolean(!currentValue && newValue))
        if (!currentValue && !newValue) return 'same'
        if (currentValue === null && newValue) return 'upgrade'
        if (currentValue === newValue) return 'same'
        if (currentValue === 'Ilimitado' && newValue !== 'Ilimitado') return 'downgrade'
        if (newValue === 'Ilimitado' && currentValue !== 'Ilimitado') return 'upgrade'
        if (typeof currentValue === 'number' && typeof newValue === 'number') {
            return newValue > currentValue ? 'upgrade' : 'downgrade'
        }
        return 'same'
    }

    // Función para obtener el icono de comparación
    const getComparisonIcon = (comparison) => {
        switch (comparison) {
            case 'upgrade':
                return <TrendingUpIcon className={classes.featureIcon} style={{ color: 'green' }} />
            case 'downgrade':
                return <TrendingDownIcon className={classes.featureIcon} style={{ color: 'orange' }} />
            case 'same':
                return <RemoveIcon className={classes.featureIcon} style={{ color: 'grey' }} />
            default:
                return null
        }
    }

    // Función para obtener el chip de comparación
    const getComparisonChip = (comparison) => {
        switch (comparison) {
            case 'upgrade':
                return <Chip label="Mejora" className={classes.upgradeChip} size="small" />
            case 'downgrade':
                return <Chip label="Reducción" className={classes.downgradeChip} size="small" />
            case 'same':
                return <Chip label="Igual" className={classes.sameChip} size="small" />
            default:
                return null
        }
    }

    // Obtener todas las features únicas de ambos planes
    const allFeatures = new Set([
        ...Object.keys(currentPlan.features || {}),
        ...Object.keys(newPlan.features || {})
    ])

    // Calcular resumen de cambios
    const summary = {
        upgrade: 0,
        downgrade: 0,
        same: 0,
        priceDifference: newPlan.price - currentPlan.price
    }

    allFeatures.forEach(featureKey => {
        const currentLimit = getFeatureLimit(currentPlan, featureKey)
        const newLimit = getFeatureLimit(newPlan, featureKey)
        const comparison = compareValues(currentLimit.value, newLimit.value)
        console.log("featureKey", summary, comparison)
        summary[comparison]++
    })
    console.log("summary", summary)
    return (
        <Dialog
            open={open}
            onClose={onClose}
            className={classes.dialog}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle className={classes.dialogTitle}>
                Comparación de Planes
            </DialogTitle>

            <DialogContent>
                {/* Header con información de planes */}
                <Box className={classes.planHeader}>
                    <Box className={classes.planInfo}>
                        <Typography className={classes.planName}>
                            Plan Actual
                        </Typography>
                        <Typography className={classes.planPrice}>
                            ${formatNumber(currentPlan.price.toFixed(1))}
                        </Typography>
                        <Typography className={classes.planBillingCycle}>
                            {formatBillingCycle(currentPlan.billingCycle)}
                        </Typography>
                    </Box>

                    <TrendingUpIcon className={classes.comparisonArrow} />

                    <Box className={classes.planInfo}>
                        <Typography className={classes.planName}>
                            Nuevo Plan
                        </Typography>
                        <Typography className={classes.planPrice}>
                            ${formatNumber(newPlan.price.toFixed(1))}
                        </Typography>
                        <Typography className={classes.planBillingCycle}>
                            {formatBillingCycle(newPlan.billingCycle)}
                        </Typography>
                    </Box>
                </Box>

                {/* Tabla de comparación */}
                <Card>
                    <CardHeader color="primary">
                        <h4 className={classes.cardTitleWhite}>
                            Comparación de Planes
                        </h4> 
                    </CardHeader>
                    <CardBody>
                    <TableContainer className={classes.tableContainer}>
                        <Table className={classes.table}>
                            <TableHead className={classes.tableHead}>
                                <TableRow>
                                    <TableCell>Característica</TableCell>
                                    <TableCell align="center">Plan Actual</TableCell>
                                    <TableCell align="center">Nuevo Plan</TableCell>
                                    <TableCell align="center">Comparación</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Array.from(allFeatures).map((featureKey) => {
                                    const currentLimit = getFeatureLimit(currentPlan, featureKey)
                                    console.log('currentLimit', currentLimit)
                                    const newLimit = getFeatureLimit(newPlan, featureKey)
                                    const comparison = compareValues(currentLimit.value, newLimit.value)
                                    const feature = newPlan.features?.[featureKey] || currentPlan.features?.[featureKey]

                                    return (
                                        <TableRow key={featureKey}>
                                            <TableCell className={classes.featureCell}>
                                                <div className={classes.featureTitle}>
                                                    {currentLimit.enabled || newLimit.enabled ? (
                                                        <CheckCircleIcon className={classes.featureIcon} style={{ color: 'green' }} />
                                                    ) : (
                                                        <CancelIcon className={classes.featureIcon} style={{ color: 'red' }} />
                                                    )}
                                                    {feature?.title || featureKey}
                                                </div>
                                            </TableCell>
                                            <TableCell className={classes.currentPlanCell}>
                                                {currentLimit.enabled ? (
                                                    <Typography
                                                        className={currentLimit.value === 'Ilimitado' ? classes.unlimitedText : classes.limitedText}
                                                    >
                                                        {currentLimit.value}
                                                    </Typography>
                                                ) : (
                                                    <Typography color="error">No disponible</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell className={classes.newPlanCell}>
                                                {newLimit.enabled ? (
                                                    <Typography
                                                        className={newLimit.value === 'Ilimitado' ? classes.unlimitedText : classes.limitedText}
                                                    >
                                                        {newLimit.value}
                                                    </Typography>
                                                ) : (
                                                    <Typography color="error">No disponible</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell className={classes.comparisonCell}>
                                                {getComparisonIcon(comparison)}
                                                {getComparisonChip(comparison)}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    </CardBody>
                </Card>

                {/* Resumen de cambios */}
                <Card>
                    <CardHeader color="primary">
                        <h4 className={classes.cardTitleWhite}>
                            Resumen de Cambios
                        </h4>
                    </CardHeader>
                    <CardBody>
                        
                    <Box className={classes.summaryItem}>
                        <TrendingUpIcon className={classes.summaryIcon} style={{ color: 'green' }} />
                        <Typography>
                            {summary.upgrade} mejora{summary.upgrade !== 1 ? 's' : ''}
                        </Typography>
                    </Box>

                    <Box className={classes.summaryItem}>
                        <TrendingDownIcon className={classes.summaryIcon} style={{ color: 'orange' }} />
                        <Typography>
                            {summary.downgrade} reducción{summary.downgrade !== 1 ? 'es' : ''}
                        </Typography>
                    </Box>

                    <Box className={classes.summaryItem}>
                        <RemoveIcon className={classes.summaryIcon} style={{ color: 'grey' }} />
                        <Typography>
                            {summary.same} sin cambios
                        </Typography>
                    </Box>

                    <Box className={classes.summaryItem}>
                        <Typography variant="h6">
                            Diferencia de precio: ${formatNumber(Math.abs(summary.priceDifference).toFixed(1))}
                            {summary.priceDifference >= 0 ? ' más' : ' menos'}
                        </Typography>
                    </Box>
                    </CardBody>
                </Card>
            </DialogContent>

            <DialogActions>
                <button onClick={onClose} style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Cancelar
                </button>
                <button
                    onClick={onConfirm}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#1976d2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Confirmar Cambio
                </button>
            </DialogActions>
        </Dialog>
    )
}

PlanComparisonModal.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    currentPlan: PropTypes.object,
    newPlan: PropTypes.object,
    onConfirm: PropTypes.func.isRequired,
}

export default PlanComparisonModal 