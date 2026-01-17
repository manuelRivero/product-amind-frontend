import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import moment from 'moment'
import { Link } from 'react-router-dom'
import Chip from '@material-ui/core/Chip'
import IconButton from '@material-ui/core/IconButton'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

import Card from 'components/Card/Card'
import CardBody from 'components/Card/CardBody'
import CardHeader from 'components/Card/CardHeader'
import GridContainer from 'components/Grid/GridContainer'
import GridItem from 'components/Grid/GridItem'
import styles from 'assets/jss/material-dashboard-react/views/dashboardStyle.js'
import { rangeOptions, formatCurrency, formatPercent } from './utils'
import { useDailyComparison } from './hooks'
import DailySummaryCard from './DailySummaryCard'

const useStyles = makeStyles((theme) => ({
    ...styles,
    pageHeader: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginBottom: '1rem',
    },
    headerTitle: {
        margin: 0,
        fontSize: '1.125rem',
        fontWeight: 500,
    },
    headerHint: {
        margin: 0,
        fontSize: '0.875rem',
        color: '#666',
    },
    backLink: {
        display: 'inline-flex',
        alignItems: 'center',
        marginBottom: '0.5rem',
        color: '#333',
    },
    rangeControls: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        marginBottom: '0.75rem',
    },
    rangeChips: {
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
    },
    rangeNav: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    rangeLabel: {
        fontSize: '0.875rem',
        color: '#333',
        fontWeight: 500,
    },
    activeRangeChip: {
        backgroundColor: '#0088ff',
        color: '#fff',
    },
    cardHeaderContent: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        [theme.breakpoints.up('sm')]: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
    },
    cardHeaderDate: {
        fontSize: '0.875rem',
        opacity: 0.9,
    },
    selectorContainer: {
        display: 'flex',
        justifyContent: 'flex-start',
        width: '100%',
    },
    financialSummary: {
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '.5rem',
        marginTop: '1rem',
        padding: '.5rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
    },
    financialItem: {
        textAlign: 'center',
        minWidth: '120px',
    },
    financialValue: {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        marginBottom: '0.25rem',
    },
    financialLabel: {
        fontSize: '0.875rem',
        color: '#666',
    },
    comparisonCard: {
        marginTop: '1rem',
    },
    comparisonRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
    },
    comparisonItem: {
        flex: '1 1 160px',
        backgroundColor: '#f7f9fc',
        borderRadius: '8px',
        padding: '0.75rem',
    },
    comparisonTitle: {
        fontSize: '0.875rem',
        color: '#666',
        marginBottom: '0.25rem',
    },
    comparisonValue: {
        fontSize: '1rem',
        fontWeight: 600,
    },
    deltaPositive: {
        color: '#2e7d32',
    },
    deltaNegative: {
        color: '#c62828',
    },
    deltaNeutral: {
        color: '#616161',
    },
    alertsList: {
        marginTop: '0.75rem',
        display: 'grid',
        gap: '0.5rem',
    },
    alertItem: {
        backgroundColor: '#fff7e6',
        border: '1px solid #ffe2b5',
        borderRadius: '8px',
        padding: '0.75rem',
        fontSize: '0.875rem',
        color: '#8a6d3b',
    },
    narrativeCard: {
        marginTop: theme.spacing(8),
    },
    narrativeText: {
        fontSize: '0.95rem',
        color: '#333',
        marginBottom: '0.5rem',
    },
    narrativeSupport: {
        fontSize: '0.875rem',
        color: '#666',
    },
    narrativeSubtitle: {
        fontSize: '0.875rem',
        color: '#666',
        marginBottom: '0.5rem',
    },
    differencesSummary: {
        marginTop: '0.75rem',
        fontSize: '0.875rem',
        color: '#555',
        lineHeight: 1.4,
    },
}))

export default function DailyComparison() {
    const classes = useStyles()
    const {
        rangeType,
        setRangeType,
        summaryA,
        summaryB,
        setSummaryA,
        setSummaryB,
        deltas,
        alerts,
        differencesText,
        narrative,
    } = useDailyComparison()
    return (
        <div>
            <Link to="/admin/dashboard" className={classes.backLink} aria-label="Volver al dashboard">
                <IconButton size="small">
                    <ArrowBackIcon fontSize="small" />
                </IconButton>
            </Link>
            <Card className={classes.narrativeCard}>
                <CardHeader color="primary">
                <h4 className={classes.cardTitleWhite}>Analisis comparativo</h4>
                </CardHeader>
            <CardBody>

            <div className={classes.rangeControls}>
                <div className={classes.rangeChips}>
                    {rangeOptions.map((option) => {
                        const isActive = rangeType === option.key
                        return (
                            <Chip
                                key={option.key}
                                label={option.label}
                                className={isActive ? classes.activeRangeChip : undefined}
                                variant={isActive ? 'default' : 'outlined'}
                                onClick={() => setRangeType(option.key)}
                                size="small"
                            />
                        )
                    })}
                </div>
            </div>
            <GridContainer spacing={3}>
                <GridItem xs={12} md={6}>
                    <DailySummaryCard
                        classes={classes}
                        defaultDate={moment().format('DD-MM-YYYY')}
                        onSummaryChange={setSummaryA}
                        rangeType={rangeType}
                        defaultRangeOffset={0}
                    />
                </GridItem>
                <GridItem xs={12} md={6}>
                    <DailySummaryCard
                        classes={classes}
                        defaultDate={moment().subtract(1, 'day').format('DD-MM-YYYY')}
                        onSummaryChange={setSummaryB}
                        rangeType={rangeType}
                        defaultRangeOffset={-1}
                    />
                </GridItem>
            </GridContainer>
            </CardBody>
            </Card>
            <Card className={classes.narrativeCard}>
                <CardHeader color="primary">
                    <h4 className={classes.cardTitleWhite}>Resumen</h4>
                </CardHeader>
                <CardBody>
                    <div className={classes.narrativeSubtitle}>
                        Resumen automático basado en los datos seleccionados
                    </div>
                    <div className={classes.narrativeText}>{narrative.main}</div>
                    <div className={classes.narrativeSupport}>{narrative.support}</div>
                </CardBody>
            </Card>
            <Card className={classes.comparisonCard}>
                <CardHeader color="primary">
                    <h4 className={classes.cardTitleWhite}>Diferencias clave</h4>
                </CardHeader>
                <CardBody>
                    <div className={classes.comparisonRow}>
                        {deltas.map((item) => {
                            const deltaClass =
                                item.delta > 0
                                    ? classes.deltaPositive
                                    : item.delta < 0
                                    ? classes.deltaNegative
                                    : classes.deltaNeutral
                            const sign =
                                item.delta > 0 ? '+' : item.delta < 0 ? '−' : ''
                            const favor =
                                item.delta > 0
                                    ? `A (${summaryA.label})`
                                    : item.delta < 0
                                    ? `B (${summaryB.label})`
                                    : 'Sin diferencia'
                            const percentText =
                                item.percent !== null
                                    ? ` (${formatPercent(Math.abs(item.percent))})`
                                    : ''
                            return (
                                <div key={item.label} className={classes.comparisonItem}>
                                    <div className={classes.comparisonTitle}>
                                        {item.label} (A vs B)
                                    </div>
                                    <div className={`${classes.comparisonValue} ${deltaClass}`}>
                                        {item.delta === 0
                                            ? 'Sin cambios'
                                            : `${sign}${formatCurrency(
                                                  Math.abs(item.delta)
                                              )}${percentText}`}
                                        <span> · {favor}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className={classes.differencesSummary}>
                        {differencesText.join(' | ')}
                    </div>
                    {alerts.length > 0 && (
                        <div className={classes.alertsList}>
                            {alerts.map((alertText) => (
                                <div key={alertText} className={classes.alertItem}>
                                    {alertText}
                                </div>
                            ))}
                        </div>
                    )}
                </CardBody>
            </Card>
        </div>
    )
}
