import React from 'react'

//form
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup"
//components
import { Button, makeStyles, TextField } from '@material-ui/core'

// schema
const schema = yup.object({
    email: yup.string().email("Email invalido").required("Campo requerido"),
    password: yup.string().min(8, "La contraseña no cumple con las reglas de validación").required("Campo requerido")
})

const useStyles = makeStyles((theme) => {
    console.log('theme', theme)
    return {
        wrapper: {
            backgroundColor: theme.palette.white,
            padding: theme.spacing(2),
            borderRadius: theme.spacing(1),
            maxWidth:"260px"
        },
        inputWrapper: {
            marginBottom: theme.spacing(4),
        },
        submitWrapper: {
            display: 'flex',
            justifyContent: 'center',
        },
        inputAlert:{
            fontSize : theme.spacing(1.5),
            textAlign:"center"
        }
    }
})

export default function Login() {
    const classes = useStyles()
    //form
    const { control, handleSubmit } = useForm({
        resolver:yupResolver(schema)
    })

    const submit = async (values) => {
        console.log('values', values)
    }
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
                                        id="outlined-basic"
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
                                        id="outlined-basic"
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
                    <div className={classes.submitWrapper}>
                        <Button
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
