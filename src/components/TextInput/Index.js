import React from 'react'
import PropTypes from 'prop-types'
import { InputAdornment, TextField } from '@material-ui/core'

export default function TextInput({
    label,
    value,
    onChange,
    icon,
    helperText,
    error,
}) {
    return (
        <div>
            <TextField
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
        </div>
    )
}

TextInput.propTypes = {
    error: PropTypes.bool,
    label: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    icon: PropTypes.func,
    helperText: PropTypes.string,
}
