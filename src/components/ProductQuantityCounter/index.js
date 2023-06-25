import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Box, makeStyles } from '@material-ui/core'
import AddIcon from '@material-ui/icons/Add'
import RemoveIcon from '@material-ui/icons/Remove'
const useStyles = makeStyles({
    root: {
        display: 'flex',
        gap: '.5rem',
        alignItems: 'center',
    },
    button:{
        cursor:'pointer'
    }
})

export default function ProductQuantityCounter({ product, onChange }) {
    const classes = useStyles()
    const [counter, setCounter] = useState(1)
    const addHandler = () => {
        if (counter === product.stock) return
        setCounter(counter + 1)
        onChange(product, counter + 1)
    }
    const removeHandler = () => {
        if (counter === 1) return
        setCounter(counter - 1)
        onChange(product, counter - 1)
    }
    return (
        <Box className={classes.root}>
            <Box onClick={addHandler} className={classes.button}>
                <AddIcon />
            </Box>
            <Box>
                <p>{counter}</p>
            </Box>
            <Box onClick={removeHandler} className={classes.button}>
                <RemoveIcon />
            </Box>
        </Box>
    )
}

ProductQuantityCounter.propTypes = {
    onChange: PropTypes.func,
    product: PropTypes.object,
}
