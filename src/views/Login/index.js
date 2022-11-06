import { Button, makeStyles, TextField } from '@material-ui/core'
import React from 'react'

const useStyles = makeStyles((theme)=>{
    console.log("theme", theme)
    return({
    wrapper: {
        backgroundColor: theme.palette.white,
        padding: theme.spacing(2),
        borderRadius: theme.spacing(1)
    },
    inputWrapper: {
        marginBottom: theme.spacing(4),
    },
    submitWrapper:{
        display:"flex",
        justifyContent:"center"
    }
})})

export default function Login() {
    const classes = useStyles()
    return (
        <div className={classes.wrapper}>
            <div className={classes.content}>
                <h2>Inicio de sesión</h2>
                <div className={classes.inputWrapper}>
                    <TextField
                    size='small'
                        fullWidth
                        id="outlined-basic"
                        label="Email"
                        variant="outlined"
                    />
                </div>
                <div className={classes.inputWrapper}>
                    <TextField
                    size='small'
                        fullWidth
                        id="outlined-basic"
                        label="Contraseña"
                        variant="outlined"
                    />
                </div>
                <div className={classes.submitWrapper}>
                    <Button variant="contained" color="primary">
                        Ingresar
                    </Button>
                </div>
            </div>
        </div>
    )
}
