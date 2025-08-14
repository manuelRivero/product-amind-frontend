import React, { useState } from 'react'
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

const useStyles = makeStyles({
    root: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'flex-end',
    },
})

export default function TotalSalesSelect({onDateChange}) {
    const classes = useStyles()

    const dispatch = useDispatch()
    const { user } = useSelector((state) => state.auth)

    const [selectedValue, setSelectedValue] = useState(new Date())

    const onChange = (value) => {
        onDateChange(value)
        setSelectedValue(value)
        dispatch(getSalesByDate({ access: user.token, from: value.toDate() }))

        return
    }
    return (
        <MuiPickersUtilsProvider utils={MomentUtils}>
            <Box className={classes.root}>
                <DatePicker 
                    maxDate={new Date()}
                    onChange={onChange}
                    value={selectedValue}
                    variant="inline"
                    label="Fecha"
                    openTo="day"
                    helperText="Seleccione el día para ver las ventas"
                />
            </Box>
        </MuiPickersUtilsProvider>
    )
}

TotalSalesSelect.propTypes = {
    onDateChange: PropTypes.function
}