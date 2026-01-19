import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core'
import Button from 'components/CustomButtons/Button'
import { PASSWORD_RESET_COPY } from './constants'

const useStyles = makeStyles((theme) => ({
    wrapper: {
        backgroundColor: theme.palette.white,
        padding: theme.spacing(2),
        borderRadius: theme.spacing(1),
        maxWidth: '320px',
        textAlign: 'center',
    },
    helperText: {
        fontSize: theme.spacing(1.5),
        textAlign: 'center',
        marginBottom: theme.spacing(2),
    },
}))

export default function PasswordResetSuccess() {
    const classes = useStyles()

    return (
        <div className={classes.wrapper}>
            <h2>{PASSWORD_RESET_COPY.successTitle}</h2>
            <p className={classes.helperText}>{PASSWORD_RESET_COPY.successDescription}</p>
            <Button variant="contained" color="primary" component={Link} to="/auth/login">
                {PASSWORD_RESET_COPY.successCta}
            </Button>
        </div>
    )
}
