import React, { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Link, useHistory, useLocation } from 'react-router-dom'
import { makeStyles, TextField } from '@material-ui/core'
import Button from 'components/CustomButtons/Button'
import { usePasswordResetToken } from './hooks/usePasswordResetToken'
import { usePasswordResetConfirm } from './hooks/usePasswordResetConfirm'
import { PASSWORD_RESET_COPY, PASSWORD_RULES_TEXT, RESET_ROUTES } from './constants'
import { PASSWORD_REGEX, getTokenFromSearch, getResetTokenErrorMessage, getApiErrorMessage } from './utils'

const schema = yup.object({
    newPassword: yup
        .string()
        .matches(PASSWORD_REGEX, PASSWORD_RULES_TEXT)
        .required('Campo requerido'),
})

const useStyles = makeStyles((theme) => ({
    wrapper: {
        backgroundColor: theme.palette.white,
        padding: theme.spacing(2),
        borderRadius: theme.spacing(1),
        maxWidth: '320px',
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
    title: {
        textAlign: 'center',
    },
    linkWrapper: {
        marginTop: theme.spacing(2),
        textAlign: 'center',
    },
}))

export default function PasswordReset() {
    const classes = useStyles()
    const location = useLocation()
    const history = useHistory()
    const token = useMemo(() => getTokenFromSearch(location.search), [location.search])
    const { loading: validating, validateToken } = usePasswordResetToken()
    const { loading: submitting, submitNewPassword } = usePasswordResetConfirm()
    const [status, setStatus] = useState('checking')
    const [tokenMessage, setTokenMessage] = useState('')
    const [formAlert, setFormAlert] = useState(null)

    const { control, handleSubmit } = useForm({
        resolver: yupResolver(schema),
    })

    useEffect(() => {
        let isActive = true
        const runValidation = async () => {
            if (!token) {
                setStatus('invalid')
                setTokenMessage(getResetTokenErrorMessage('TOKEN_INVALID'))
                return
            }
            setStatus('checking')
            const result = await validateToken(token)
            if (!isActive) return
            if (result.ok) {
                setStatus('form')
                return
            }
            const errorCode = result.error?.response?.data?.code
            setTokenMessage(getResetTokenErrorMessage(errorCode))
            setStatus('invalid')
        }
        runValidation()
        return () => {
            isActive = false
        }
    }, [token, validateToken])

    const submit = async ({ newPassword }) => {
        setFormAlert(null)
        const result = await submitNewPassword({ token, newPassword })
        if (result.ok) {
            history.push(RESET_ROUTES.SUCCESS)
            return
        }
        setFormAlert(
            getApiErrorMessage(
                result.error,
                'No pudimos actualizar tu contraseña. Intenta nuevamente.'
            )
        )
    }

    if (status === 'checking') {
        return (
            <div className={classes.wrapper}>
                <h3 className={classes.title}>{PASSWORD_RESET_COPY.resetTitle}</h3>
                <p className={classes.helperText}>{PASSWORD_RESET_COPY.validating}</p>
                {validating && <p className={classes.inputAlert}>Un momento...</p>}
            </div>
        )
    }

    if (status === 'invalid') {
        return (
            <div className={classes.wrapper}>
                <h4 className={classes.title}>{PASSWORD_RESET_COPY.invalidTitle}</h4>
                <p className={classes.helperText}>
                    {tokenMessage || PASSWORD_RESET_COPY.invalidDescription}
                </p>
                <div className={classes.submitWrapper}>
                    <Button
                        variant="contained"
                        color="primary"
                        component={Link}
                        to={RESET_ROUTES.REQUEST}
                    >
                        {PASSWORD_RESET_COPY.invalidCta}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className={classes.wrapper}>
            <h3 className={classes.title}>{PASSWORD_RESET_COPY.resetTitle}</h3>
            <p className={classes.helperText}>{PASSWORD_RESET_COPY.resetDescription}</p>
            <form onSubmit={handleSubmit(submit)} autoComplete="false">
                <div className={classes.inputWrapper}>
                    <Controller
                        control={control}
                        name="newPassword"
                        render={({ field, fieldState }) => (
                            <>
                                <TextField
                                    size="small"
                                    type="password"
                                    fullWidth
                                    value={field.value || ''}
                                    onChange={(event) => field.onChange(event)}
                                    id="newPassword"
                                    label="Nueva contraseña"
                                    variant="outlined"
                                />
                                {fieldState.error && (
                                    <p className={classes.inputAlert}>{fieldState.error.message}</p>
                                )}
                            </>
                        )}
                    />
                </div>
                {formAlert && <p className={classes.inputAlert}>{formAlert}</p>}
                <div className={classes.submitWrapper}>
                    <Button
                        isLoading={submitting}
                        variant="contained"
                        color="primary"
                        type="submit"
                    >
                        Actualizar contraseña
                    </Button>
                </div>
            </form>
            <div className={classes.linkWrapper}>
                <Link to="/auth/login">Volver a iniciar sesión</Link>
            </div>
        </div>
    )
}
