import React, { useState } from 'react'

//form
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
//components
import { makeStyles, TextField } from '@material-ui/core'
import Button from "./../../components/CustomButtons/Button"
import { useDispatch } from 'react-redux'
import { login } from 'store/auth'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'

// schema
const schema = yup.object({
    email: yup.string().email('Email invalido').required('Campo requerido'),
    password: yup
        .string()
        .min(8, 'La contraseña no cumple con las reglas de validación')
        .required('Campo requerido'),
})

const useStyles = makeStyles((theme) => {
    return {
        wrapper: {
            backgroundColor: theme.palette.white,
            padding: theme.spacing(2),
            borderRadius: theme.spacing(1),
            maxWidth: '260px',
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
    }
})

export default function Login() {
    //router
    const history = useHistory()
    const dispatch = useDispatch()
    //styles
    const classes = useStyles()
    //form
    const { control, handleSubmit } = useForm({
        resolver: yupResolver(schema),
    })
    //states
    const [formAlert, setFormAlert] = useState(null)
    const [loadingSubmit, setLoadingSubmit] = useState(false)

    const submit = async (values) => {
        setFormAlert(null)
        setLoadingSubmit(true)
        try {
            const response = await dispatch(login({ data: values }))
            if (response.type === 'login/rejected') {
                console.log('payload', response.payload)
                if (response.payload?.message) {
                    throw new Error(response.payload.message)
                } else {
                    throw new Error('Error al iniciar sesión')
                }
            }
            history.push('/admin')
        } catch (error) {
            setFormAlert(error.message)
        } finally {
            setLoadingSubmit(false)
        }
    }
    console.log("login")
    return (
        <div className={classes.wrapper}>
            <div className={classes.content}>
                <h2>Inicio de sesión</h2>
                <form onSubmit={handleSubmit(submit)} autoComplete={'false'}>
                    <div className={classes.inputWrapper}>
                        <Controller
                            control={control}
                            name="email"
                            render={({ field, fieldState }) => (
                                <>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        value={field.value}
                                        onChange={(e) => field.onChange(e)}
                                        id="email"
                                        label="Email"
                                        variant="outlined"
                                    />
                                    {fieldState.error && (
                                        <p className={classes.inputAlert}>
                                            {fieldState.error.message}
                                        </p>
                                    )}
                                </>
                            )}
                        />
                    </div>
                    <div className={classes.inputWrapper}>
                        <Controller
                            control={control}
                            name="password"
                            render={({ field, fieldState }) => (
                                <>
                                    <TextField
                                        size="small"
                                        type={'password'}
                                        fullWidth
                                        value={field.value}
                                        onChange={(e) => field.onChange(e)}
                                        id="password"
                                        label="Contraseña"
                                        variant="outlined"
                                    />
                                    {fieldState.error && (
                                        <p className={classes.inputAlert}>
                                            {fieldState.error.message}
                                        </p>
                                    )}
                                </>
                            )}
                        />
                    </div>
                    <div>{formAlert && <p>{formAlert}</p>}</div>
                    <div className={classes.submitWrapper}>
                        <Button
                            isLoading={loadingSubmit}
                            variant="contained"
                            color="primary"
                            type="submit"
                        >
                            Ingresar
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
