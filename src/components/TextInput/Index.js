import React from 'react'
import PropTypes from 'prop-types'
import { InputAdornment, TextField, makeStyles } from '@material-ui/core'
import TextDanger from 'components/Typography/Danger'

const useStyles = makeStyles({
    errorText:{
        marginTop: '5px',
        marginBottom: '0px'
    },
    input:{
        width: '100%',
        "& .MuiInputBase-input": {
      background: "#fff !important"
    }
    }
})
export default function TextInput({
    label,
    value,
    onChange,
    icon,
    helperText,
    error,
    multiline = false,
    rows = 1,
    errorMessage,
    name= 'input',
    className={}
}) {
    const classes = useStyles();
    console.log("input", className)
    return (
        <div style={{width: '100%'}}>
            <TextField
            className={ `${classes.input} ${className}`}
                name={name}
                rows={rows}
                multiline={multiline}
                label={label}
                InputProps={{
                    startAdornment: icon ? (
                        <InputAdornment position="start">{icon}</InputAdornment>
                    ) : null,
                }}
                error={error}
                value={value}
                onChange={onChange}
                variant="outlined"
                helperText={helperText ? helperText : ''}
            />
            {errorMessage && (
                <TextDanger>
                    <p className={classes.errorText}>{errorMessage.message}</p>
                </TextDanger>
            )}
        </div>
    )
}

TextInput.propTypes = {
    name: PropTypes.string,
    errorMessage: PropTypes.object,
    error: PropTypes.bool,
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    icon: PropTypes.func,
    helperText: PropTypes.string,
    multiline: PropTypes.bool,
    rows: PropTypes.number,
    className: PropTypes.object,
}
