import moment from 'moment'

export const rangeOptions = [
    { key: 'day', label: 'Día' },
    { key: 'week', label: 'Semanal' },
    { key: 'month', label: 'Mensual' },
    { key: 'quarter', label: 'Trimestral' },
    { key: 'semester', label: 'Semestral' },
    { key: 'year', label: 'Anual' },
]

export const getRangeForType = (type, offset, baseDate) => {
    if (type === 'day') {
        const start = baseDate.clone().startOf('day')
        const end = baseDate.clone().endOf('day')
        return { start, end }
    }
    if (type === 'semester') {
        const base = moment().add(offset * 6, 'months')
        const startMonth = base.month() < 6 ? 0 : 6
        const start = base.clone().month(startMonth).startOf('month')
        const end = start.clone().add(5, 'months').endOf('month')
        return { start, end }
    }
    if (type === 'week') {
        const start = moment().add(offset, 'weeks').startOf('isoWeek')
        const end = moment().add(offset, 'weeks').endOf('isoWeek')
        return { start, end }
    }
    const unitMap = {
        month: 'months',
        quarter: 'quarters',
        year: 'years',
    }
    const unit = unitMap[type] || 'months'
    const start = moment().add(offset, unit).startOf(type)
    const end = moment().add(offset, unit).endOf(type)
    return { start, end }
}

export const processSalesData = (sales) => {
    let totalRevenue = 0
    let totalReceived = 0

    sales.forEach((sale) => {
        const amount = sale.total || 0
        const marketplaceFee = sale.marketplaceFee || 0
        const feePercentage = marketplaceFee < 1 ? marketplaceFee * 100 : marketplaceFee
        const commissionAmount = (amount * feePercentage) / 100
        const receivedAmount = amount - commissionAmount

        totalRevenue += amount
        totalReceived += receivedAmount
    })

    const totalCommissions = totalRevenue - totalReceived

    return {
        totalRevenue,
        totalReceived,
        totalCommissions,
    }
}

export const formatCurrency = (value) => `$${value.toFixed(2)}`
export const formatPercent = (value) => `${value.toFixed(1)}%`

export const formatLabelForNarrative = (label) => {
    if (label.includes(' a ')) {
        const [start, end] = label.split(' a ')
        return `Desde ${start} hasta ${end}`
    }
    return label
}

export const buildDelta = (label, aValue, bValue) => {
    const delta = aValue - bValue
    const percent = bValue !== 0 ? (delta / bValue) * 100 : null
    return {
        label,
        delta,
        percent,
    }
}

export const formatDifferenceLine = ({ label, aValue, bValue, labelA, labelB }) => {
    const delta = aValue - bValue
    const hasZero = aValue === 0 || bValue === 0
    const percent = !hasZero && bValue !== 0 ? (delta / bValue) * 100 : null
    const sign = delta > 0 ? '+' : delta < 0 ? '−' : ''
    const favor =
        delta > 0
            ? `a favor de ${labelA}`
            : delta < 0
            ? `a favor de ${labelB}`
            : 'sin diferencia'
    const deltaText = delta === 0 ? '0' : `${sign}${formatCurrency(Math.abs(delta))}`
    const percentText = percent !== null ? ` (${formatPercent(Math.abs(percent))})` : ''
    return `${label}: ${deltaText}${percentText} · ${favor}`
}

export const buildNarrative = ({ valueA, valueB, labelA, labelB }) => {
    const formattedLabelA = formatLabelForNarrative(labelA)
    const formattedLabelB = formatLabelForNarrative(labelB)

    if (valueA === 0 && valueB > 0) {
        return {
            main: `${formattedLabelA} no hubo actividad, mientras que en ${formattedLabelB} se registraron ${formatCurrency(
                valueB
            )}. El desempeño fue completamente superior en ${formattedLabelB}.`,
            support: `Actividad solo en ${formattedLabelB}`,
        }
    }

    if (valueA > 0 && valueB === 0) {
        return {
            main: `${formattedLabelA} registró ${formatCurrency(
                valueA
            )}, pero en ${formattedLabelB} no hubo actividad. El desempeño fue completamente superior en ${formattedLabelA}.`,
            support: `Actividad solo en ${formattedLabelA}`,
        }
    }

    if (valueA === 0 && valueB === 0) {
        return {
            main: `No hubo actividad en ${formattedLabelA} ni en ${formattedLabelB}. No se observan ventas en las fechas comparadas.`,
            support: 'Sin actividad en ambas fechas',
        }
    }

    const delta = valueA - valueB
    const percent = (delta / valueB) * 100
    const trend = delta >= 0 ? 'desempeño superior' : 'desempeño inferior'
    return {
        main: `${formattedLabelA} mostró ${trend} frente a ${formattedLabelB} por ${formatCurrency(
            Math.abs(delta)
        )} (${formatPercent(Math.abs(percent))}).`,
        support: `${delta >= 0 ? 'Desempeño superior' : 'Desempeño inferior'} en ${formattedLabelA}`,
    }
}
