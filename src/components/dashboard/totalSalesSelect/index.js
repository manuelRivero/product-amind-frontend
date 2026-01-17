import React, { useEffect, useMemo, useState } from 'react'
import Box from '@material-ui/core/Box'
import { makeStyles } from '@material-ui/core/styles'
import { useDispatch, useSelector } from 'react-redux'
import { getSalesByDate } from 'store/dashboard'
import {
    MuiPickersUtilsProvider,
    DatePicker 
} from '@material-ui/pickers'
import MomentUtils from '@date-io/moment'
import PropTypes from 'prop-types'
import moment from 'moment'
import Chip from '@material-ui/core/Chip'
import IconButton from '@material-ui/core/IconButton'
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft'
import ChevronRightIcon from '@material-ui/icons/ChevronRight'

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
    },
    shortcutsRow: {
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem',
    },
    dateRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
    },
    activeChip: {
        backgroundColor: '#0088ff',
        color: theme.palette.primary.contrastText,
    },
}))

const defaultShortcuts = [
    {
        key: 'today',
        label: 'Hoy',
        getDate: () => moment(),
    },
    {
        key: 'yesterday',
        label: 'Ayer',
        getDate: () => moment().subtract(1, 'day'),
    },
    {
        key: 'sevenDays',
        label: 'Hace 7 días',
        getDate: () => moment().subtract(7, 'day'),
    },
    {
        key: 'thirtyDays',
        label: 'Hace 30 días',
        getDate: () => moment().subtract(30, 'day'),
    },
]

export default function TotalSalesSelect({ onDateChange, showShortcuts, shortcuts, initialDate }) {
    const classes = useStyles()

    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)

    const [selectedValue, setSelectedValue] = useState(
        initialDate ? moment(initialDate, 'DD-MM-YYYY') : moment()
    )
    const resolvedShortcuts = shortcuts || defaultShortcuts

    const onChange = (value) => {
        onDateChange(value)
        setSelectedValue(value)
        dispatch(getSalesByDate({ access: user.token, from: value.toDate() }))

        return
    }

    const activeShortcutKey = useMemo(() => {
        const match = resolvedShortcuts.find((shortcut) =>
            selectedValue.isSame(shortcut.getDate(), 'day')
        )
        return match?.key
    }, [resolvedShortcuts, selectedValue])

    const isToday = selectedValue.isSame(moment(), 'day')

    const handleStepDay = (direction) => {
        const nextDate = selectedValue.clone().add(direction, 'day')
        if (nextDate.isAfter(moment(), 'day')) {
            return
        }
        onChange(nextDate)
    }

    useEffect(() => {
        if (!initialDate) return
        setSelectedValue(moment(initialDate, 'DD-MM-YYYY'))
    }, [initialDate])

    return (
        <MuiPickersUtilsProvider utils={MomentUtils}>
            <Box>
                {showShortcuts && (
                    <Box className={classes.shortcutsRow}>
                        {resolvedShortcuts.map((shortcut) => {
                            const shortcutDate = shortcut.getDate()
                            const isActive = activeShortcutKey === shortcut.key
                            return (
                                <Chip
                                    key={shortcut.key}
                                    label={shortcut.label}
                                    className={isActive ? classes.activeChip : undefined}
                                    variant={isActive ? 'default' : 'outlined'}
                                    onClick={() => onChange(shortcutDate)}
                                    size="small"
                                />
                            )
                        })}
                    </Box>
                )}
                <Box className={classes.root}>
                    <Box className={classes.dateRow}>
                        <IconButton
                            aria-label="Día anterior"
                            onClick={() => handleStepDay(-1)}
                            size="small"
                        >
                            <ChevronLeftIcon fontSize="small" />
                        </IconButton>
                        <DatePicker 
                            maxDate={new Date()}
                            onChange={onChange}
                            value={selectedValue}
                            variant="inline"
                            label="Fecha"
                            openTo="day"
                            helperText="Seleccione el día para ver las ventas"
                        />
                        <IconButton
                            aria-label="Día siguiente"
                            onClick={() => handleStepDay(1)}
                            size="small"
                            disabled={isToday}
                        >
                            <ChevronRightIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
            </Box>
        </MuiPickersUtilsProvider>
    )
}

TotalSalesSelect.propTypes = {
    onDateChange: PropTypes.func.isRequired,
    showShortcuts: PropTypes.bool,
    initialDate: PropTypes.string,
    shortcuts: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            getDate: PropTypes.func.isRequired,
        })
    ),
}