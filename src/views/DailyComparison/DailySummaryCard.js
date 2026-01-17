import React from 'react'
import PropTypes from 'prop-types'
import IconButton from '@material-ui/core/IconButton'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

import TotalSalesSelect from 'components/dashboard/totalSalesSelect'

import { formatCurrency } from './utils'
import { useDailySummaryCard } from './hooks'

export default function DailySummaryCard({
    classes,
    defaultDate,
    onSummaryChange,
    rangeType,
    defaultRangeOffset,
}) {
    const {
        date,
        setDate,
        rangeStart,
        rangeEnd,
        setRangeOffset,
        headerLabel,
        isDayMode,
        isNextDisabled,
        financialSummary,
    } = useDailySummaryCard({
        defaultDate,
        rangeType,
        defaultRangeOffset,
        onSummaryChange,
    })

    const handleDaylySaleDate = (value) => {
        const formattedDate = value.format('DD-MM-YYYY')
        setDate(formattedDate)
    }

    return (
        <div style={{ padding: '0.75rem', backgroundColor: '#fff' }}>
            <div className={classes.cardHeaderContent}>
                <h4 className={classes.cardTitleWhite}>{headerLabel}</h4>
            </div>
            {isDayMode ? (
                <div className={classes.selectorContainer}>
                    <TotalSalesSelect
                        onDateChange={handleDaylySaleDate}
                        initialDate={date}
                    />
                </div>
            ) : (
                <div className={classes.rangeNav}>
                    <IconButton
                        aria-label="Periodo anterior"
                        onClick={() => setRangeOffset((value) => value - 1)}
                        size="small"
                    >
                        <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                    <span className={classes.rangeLabel}>
                        {rangeStart} a {rangeEnd}
                    </span>
                    <IconButton
                        aria-label="Periodo siguiente"
                        onClick={() => setRangeOffset((value) => Math.min(0, value + 1))}
                        size="small"
                        disabled={isNextDisabled}
                    >
                        <ChevronRightIcon fontSize="small" />
                    </IconButton>
                </div>
            )}
            <div className={classes.financialSummary}>
                <div className={classes.financialItem}>
                    <div
                        className={classes.financialValue}
                        style={{ color: '#1976d2' }}
                    >
                        {formatCurrency(financialSummary.totalRevenue)}
                    </div>
                    <div className={classes.financialLabel}>
                        Ingresos Totales
                    </div>
                </div>
                <div className={classes.financialItem}>
                    <div
                        className={classes.financialValue}
                        style={{ color: '#4CAF50' }}
                    >
                        {formatCurrency(financialSummary.totalReceived)}
                    </div>
                    <div className={classes.financialLabel}>Total Recibido</div>
                </div>
                <div className={classes.financialItem}>
                    <div
                        className={classes.financialValue}
                        style={{ color: '#ff9800' }}
                    >
                        {formatCurrency(financialSummary.totalCommissions)}
                    </div>
                    <div className={classes.financialLabel}>Comisiones</div>
                </div>
            </div>
        </div>
    )
}

DailySummaryCard.propTypes = {
    classes: PropTypes.object.isRequired,
    defaultDate: PropTypes.string,
    onSummaryChange: PropTypes.func.isRequired,
    rangeType: PropTypes.oneOf(['day', 'week', 'month', 'quarter', 'semester', 'year']),
    defaultRangeOffset: PropTypes.number,
}
