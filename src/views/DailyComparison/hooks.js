import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'

import { getSales } from 'store/sales'
import {
    buildDelta,
    buildNarrative,
    formatDifferenceLine,
    formatPercent,
    getRangeForType,
    processSalesData,
} from './utils'

export const useDailySummaryCard = ({
    defaultDate,
    rangeType,
    defaultRangeOffset,
    onSummaryChange,
}) => {
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)

    const [date, setDate] = useState(
        defaultDate || moment(new Date()).format('DD-MM-YYYY')
    )
    const [rangeOffset, setRangeOffset] = useState(defaultRangeOffset)
    const [financialSummary, setFinancialSummary] = useState({
        totalRevenue: 0,
        totalReceived: 0,
        totalCommissions: 0,
    })

    useEffect(() => {
        if (rangeType !== 'day') {
            setRangeOffset(defaultRangeOffset)
        }
    }, [rangeType, defaultRangeOffset])

    const baseDate = moment(date, 'DD-MM-YYYY')
    const rawRange = getRangeForType(rangeType, rangeOffset, baseDate)
    const today = moment().endOf('day')
    const rangeStart = rawRange.start.format('DD-MM-YYYY')
    const rangeEnd = (rawRange.end.isAfter(today) ? today : rawRange.end).format(
        'DD-MM-YYYY'
    )

    const loadCompleteData = useCallback(
        async ({ dateFrom, dateTo }) => {
            if (!user?.token) return
            try {
                const firstPageResponse = await dispatch(
                    getSales({
                        access: user.token,
                        filters: {},
                        page: 0,
                        dateFrom,
                        dateTo,
                    })
                ).unwrap()

                const totalSales = firstPageResponse.data.total || 0
                const itemsPerPage = 10
                const totalPages = Math.ceil(totalSales / itemsPerPage)

                if (totalPages <= 1) {
                    const processedData = processSalesData(
                        firstPageResponse.data.sales || []
                    )
                    setFinancialSummary(processedData)
                    return
                }

                const remainingPagesPromises = []
                for (let page = 1; page < totalPages; page++) {
                    remainingPagesPromises.push(
                        dispatch(
                            getSales({
                                access: user.token,
                                filters: {},
                                page,
                                dateFrom,
                                dateTo,
                            })
                        ).unwrap()
                    )
                }

                const remainingPagesResponses = await Promise.all(
                    remainingPagesPromises
                )
                const allSales = [
                    firstPageResponse.data.sales || [],
                    ...remainingPagesResponses.map(
                        (response) => response.data.sales || []
                    ),
                ].flat()

                const processedData = processSalesData(allSales)
                setFinancialSummary(processedData)
            } catch (error) {
                console.error('Error loading daily data:', error)
                setFinancialSummary({
                    totalRevenue: 0,
                    totalReceived: 0,
                    totalCommissions: 0,
                })
            }
        },
        [dispatch, user?.token]
    )

    useEffect(() => {
        loadCompleteData({
            dateFrom: rangeStart,
            dateTo: rangeEnd,
        })
    }, [rangeStart, rangeEnd, loadCompleteData])

    useEffect(() => {
        const label =
            rangeType === 'day' ? date : `${rangeStart} a ${rangeEnd}`
        onSummaryChange({
            label,
            summary: financialSummary,
        })
    }, [date, financialSummary, onSummaryChange, rangeStart, rangeEnd, rangeType])

    const headerLabel =
        rangeType === 'day' ? date : `${rangeStart} a ${rangeEnd}`

    return {
        date,
        setDate,
        rangeStart,
        rangeEnd,
        rangeOffset,
        setRangeOffset,
        headerLabel,
        isDayMode: rangeType === 'day',
        isNextDisabled: rawRange.end.isSameOrAfter(today),
        financialSummary,
    }
}

export const useDailyComparison = () => {
    const [rangeType, setRangeType] = useState('day')
    const [summaryA, setSummaryA] = useState({
        label: moment().format('DD-MM-YYYY'),
        summary: {
            totalRevenue: 0,
            totalReceived: 0,
            totalCommissions: 0,
        },
    })
    const [summaryB, setSummaryB] = useState({
        label: moment().subtract(1, 'day').format('DD-MM-YYYY'),
        summary: {
            totalRevenue: 0,
            totalReceived: 0,
            totalCommissions: 0,
        },
    })

    const deltas = useMemo(
        () => [
            buildDelta(
                'Ingresos Totales',
                summaryA.summary.totalRevenue,
                summaryB.summary.totalRevenue
            ),
            buildDelta(
                'Total Recibido',
                summaryA.summary.totalReceived,
                summaryB.summary.totalReceived
            ),
        ],
        [summaryA, summaryB]
    )

    const alertThreshold = 15
    const alerts = useMemo(
        () =>
            deltas
                .filter(
                    (item) =>
                        item.percent !== null &&
                        Math.abs(item.percent) >= alertThreshold
                )
                .map((item) => {
                    const trend = item.percent > 0 ? 'subió' : 'bajó'
                    return `${item.label} ${trend} ${formatPercent(
                        Math.abs(item.percent)
                    )} vs ${summaryB.label}`
                }),
        [deltas, summaryB.label]
    )

    const differencesText = useMemo(
        () => [
            formatDifferenceLine({
                label: 'Ingresos Totales',
                aValue: summaryA.summary.totalRevenue,
                bValue: summaryB.summary.totalRevenue,
                labelA: summaryA.label,
                labelB: summaryB.label,
            }),
            formatDifferenceLine({
                label: 'Total Recibido',
                aValue: summaryA.summary.totalReceived,
                bValue: summaryB.summary.totalReceived,
                labelA: summaryA.label,
                labelB: summaryB.label,
            }),
        ],
        [summaryA, summaryB]
    )

    const narrative = useMemo(
        () =>
            buildNarrative({
                valueA: summaryA.summary.totalRevenue,
                valueB: summaryB.summary.totalRevenue,
                labelA: summaryA.label,
                labelB: summaryB.label,
            }),
        [summaryA, summaryB]
    )

    return {
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
    }
}
