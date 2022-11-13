import React, { useState } from 'react'
import Box from '@material-ui/core/Box'
import SettingsIcon from '@material-ui/icons/Settings'
import { makeStyles } from '@material-ui/core/styles'
import { useDispatch, useSelector } from 'react-redux'
import { getSalesByDate } from 'store/dashboard'

const useStyles = makeStyles({
    root: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: "100%"
    },
    settingButton: {
        cursor: 'pointer',
    },
    menu: {
        position: 'absolute',
        bottom: 0,
        backgroundColor: 'white',
        padding: '1rem',
        width: 120,
        zIndex: 50,
        transform: 'translateY(100%)',
        boxShadow: '0 0 10px -3px rgba(0,0,0,.5)',
        borderRadius: '.5rem',
    },
    menuOption: {
        marginBottom: '1rem',
        cursor: 'pointer',
        padding: '.25rem',
        '& > p': {
            margin: 0,
        },
        '&:hover': {
            backgroundColor: '#c2c2c2',
        },
    },
    range: {
        '& > p': {
            margin: 0,
        },
    },
})

const ranges = {
    week: 'Ultimos 7 dias',
    month: 'Ultimos 30 días',
    year: 'Ultimo año',
}
export default function TotalSalesSelect() {
    const classes = useStyles()
    //redux
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)
    //states
    const [isOpen, setIsOpen] = useState(false)
    const [selectedRange, setSelectedRange] = useState('Ultimos 7 dias')

    const onChange = (value) => {
        dispatch(getSalesByDate({ access: user.token, from: value }))
        setSelectedRange(ranges[value])
    }
    return (
        <Box className={classes.root}>
            <Box className={classes.range}>
                <p>{selectedRange}</p>
            </Box>
            <Box
                className={classes.settingButton}
                onClick={() => setIsOpen(!isOpen)}
            >
                <SettingsIcon />
            </Box>
            {isOpen && (
                <Box className={classes.menu}>
                    <Box
                        onClick={() => onChange('week')}
                        className={classes.menuOption}
                    >
                        <p>Ultimos 7 días</p>
                    </Box>
                    <Box
                        onClick={() => onChange('month')}
                        className={classes.menuOption}
                    >
                        <p>Ultimos 30 días</p>
                    </Box>
                    <Box
                        onClick={() => onChange('year')}
                        className={classes.menuOption}
                    >
                        <p>Ultimo año</p>
                    </Box>
                </Box>
            )}
        </Box>
    )
}
