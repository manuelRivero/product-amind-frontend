import React from 'react'
import { Link } from 'react-router-dom'
import { Grid, makeStyles } from '@material-ui/core'
import Button from 'components/CustomButtons/Button.js'
import Card from 'components/Card/Card.js'
import CardHeader from 'components/Card/CardHeader.js'
import CardBody from 'components/Card/CardBody.js'

const useStyles = makeStyles((theme) => ({
    card: {
        maxWidth: 1000,
        margin: 'auto',
        marginTop: theme.spacing(8),
    },
    cardTitleWhite: {
        color: '#FFFFFF',
        marginTop: '0px',
        minHeight: 'auto',
        fontWeight: '300',
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: '3px',
        textDecoration: 'none',
    },
    cardCategoryWhite: {
        color: '#fff',
        margin: '0',
        fontSize: '14px',
        marginTop: '0',
        marginBottom: '0',
    },
    cardBody: {
        padding: theme.spacing(3),
    },
    bannerActionCard: {
        padding: theme.spacing(3),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 180,
    },
    bannerActionTitle: {
        marginBottom: theme.spacing(4),
        fontWeight: 'bold',
        fontSize: '1.1rem',
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        gap: theme.spacing(2),
    },
    planCardHeaderGray: {
        background: '#f5f5f5',
        padding: theme.spacing(2, 2, 2, 2),
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        borderBottom: '1px solid #e0e0e0',
    },
    planTitleDark: {
        color: '#222',
        fontWeight: 'bold',
        margin: 0,
        fontSize: '1.1rem',
    },
    description: {
        fontSize: '0.9rem',
        color: '#555',
        marginBottom: theme.spacing(3),
        textAlign: 'center',
    },
}))

export default function Banners() {
    const classes = useStyles()
    return (
        <Card className={classes.card}>
            <CardHeader color="primary">
                <h4 className={classes.cardTitleWhite}>Panel de Gestión de Banners</h4>
                <p className={classes.cardCategoryWhite}>
                    Aquí puedes agregar nuevos banners para tu tienda o gestionar los existentes de manera sencilla y rápida.
                </p>
            </CardHeader>
            <CardBody className={classes.cardBody}>
                <p className={classes.description}>
                    Para mostrar banners en tu tienda, primero debes crear o subir un nuevo banner. Una vez creado, podrás gestionarlo, editarlo o eliminarlo desde la sección de gestión.
                </p>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardHeader className={classes.planCardHeaderGray}>
                                <h4 className={classes.planTitleDark}>
                                    Agrega un nuevo banner para tu tienda
                                </h4>
                            </CardHeader>
                            <CardBody>
                                <div className={classes.buttonContainer}>
                                    <Button
                                        color="primary"
                                        variant="contained"
                                        component={Link}
                                        to="banners/add-banner"
                                    >
                                        Agregar
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardHeader className={classes.planCardHeaderGray}>
                                <h4 className={classes.planTitleDark}>
                                    Gestiona los banners de tu tienda
                                </h4>
                            </CardHeader>
                            <CardBody>
                                <div className={classes.buttonContainer}>
                                    <Button
                                        color="primary"
                                        variant="contained"
                                        component={Link}
                                        to="banners/admin-banners"
                                    >
                                        Gestionar
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Grid>
                </Grid>
            </CardBody>
        </Card>
    )
}
