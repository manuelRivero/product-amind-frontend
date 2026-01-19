import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link } from 'react-router-dom'
import { makeStyles, TextField } from '@material-ui/core'
import Button from 'components/CustomButtons/Button'
import { usePasswordResetRequest } from './hooks/usePasswordResetRequest'
import { PASSWORD_RESET_COPY } from './constants'
import { getApiErrorMessage } from './utils'

const schema = yup.object({
    email: yup.string().email('Email inválido').required('Campo requerido'),
})

const useStyles = makeStyles((theme) => ({
    wrapper: {
        backgroundColor: theme.palette.white,
        padding: theme.spacing(2),
        borderRadius: theme.spacing(1),
        maxWidth: '400px',
    },
    inputWrapper: {
        marginBottom: theme.spacing(4),
    },
    submitWrapper: {
        display: 'flex',
        justifyContent: 'center',
    },
    inputAlert: {
        fontSize: theme.spacing(1.5),
        textAlign: 'center',
    },
    helperText: {
        fontSize: theme.spacing(1.5),
        textAlign: 'center',
        marginBottom: theme.spacing(2),
    },
    linkWrapper: {
        marginTop: theme.spacing(2),
        textAlign: 'center',
    },
}))

export default function ForgotPassword() {
    const classes = useStyles()
    const { control, handleSubmit } = useForm({
        resolver: yupResolver(schema),
    })
    const { loading, success, error, submitRequest } = usePasswordResetRequest()

    const submit = async ({ email }) => {
        await submitRequest(email)
    }

    return (
        <div className={classes.wrapper}>
            <h2>{PASSWORD_RESET_COPY.requestTitle}</h2>
            <p className={classes.helperText}>{PASSWORD_RESET_COPY.requestDescription}</p>
            <form onSubmit={handleSubmit(submit)} autoComplete="false">
                <div className={classes.inputWrapper}>
                    <Controller
                        control={control}
                        name="email"
                        render={({ field, fieldState }) => (
                            <>
                                <TextField
                                    size="small"
                                    fullWidth
                                    value={field.value || ''}
                                    onChange={(event) => field.onChange(event)}
                                    id="email"
                                    label="Email"
                                    variant="outlined"
                                />
                                {fieldState.error && (
                                    <p className={classes.inputAlert}>{fieldState.error.message}</p>
                                )}
                            </>
                        )}
                    />
                </div>
                {success && <p className={classes.inputAlert}>{PASSWORD_RESET_COPY.requestSuccess}</p>}
                {error && (
                    <p className={classes.inputAlert}>
                        {getApiErrorMessage(
                            error,
                            'No pudimos enviar el correo. Intenta nuevamente.'
                        )}
                    </p>
                )}
                <div className={classes.submitWrapper}>
                    <Button
                        isLoading={loading}
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={success}
                    >
                        Enviar enlace
                    </Button>
                </div>
            </form>
            <div className={classes.linkWrapper}>
                <Link to="/auth/login">{PASSWORD_RESET_COPY.requestCta}</Link>
            </div>
        </div>
    )
}
