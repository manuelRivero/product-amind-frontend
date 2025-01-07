import React from 'react'
import { Link } from 'react-router-dom'
import { Box, Grid, makeStyles, Paper, Typography } from '@material-ui/core'
import Button from 'components/CustomButtons/Button.js'

const useStyles = makeStyles({
    paper: {
        padding: '1rem',
    },
})

export default function Banners() {
    const classes = useStyles()
    return (
        <Box>
            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Paper className={classes.paper}>
                        <Box
                            display="flex"
                            flexDirection="column"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Typography marginBottom={4}>
                                Agrega un nuevo banner para tu tienda
                            </Typography>
                            <Button
                                color="primary"
                                variant="contained"
                                component={Link}
                                to="banners/add-banner"
                            >
                                Agregar
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper className={classes.paper}>
                        <Box
                            display="flex"
                            flexDirection="column"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Typography marginBottom={4}>
                                Gestiona los banners de tu tienda
                            </Typography>
                            <Button
                                color="primary"
                                variant="contained"
                                component={Link}
                                to="banners/admin-banners"
                            >
                                Gestionar
                            </Button>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}
