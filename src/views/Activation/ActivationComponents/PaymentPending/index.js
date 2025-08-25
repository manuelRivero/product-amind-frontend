import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from 'components/Card/Card.js';
import CardHeader from 'components/Card/CardHeader.js';
import CardBody from 'components/Card/CardBody.js';
import ScheduleIcon from '@material-ui/icons/Schedule';

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
        color: '#FFFFFF',
        margin: '0',
        fontSize: '14px',
        marginTop: '0',
        marginBottom: '0',
    },
    subscriptionPendingBanner: {
        color: theme.palette.info.main,
        display: 'flex',
        alignItems: 'center',
        fontWeight: 'bold',
        fontSize: '1.5rem',
        marginTop: `calc(${theme.spacing(3)}px + 1rem)`,
        marginBottom: theme.spacing(1),
        justifyContent: 'flex-start',
        padding: 0,
    },
    description: {
        color: '#666',
        fontSize: '14px',
        marginTop: theme.spacing(1),
    },
}));

const PaymentPending = () => {
    const classes = useStyles();

    return (
        <Card className={classes.card}>
            <CardHeader color="info">
                <h4 className={classes.cardTitleWhite}>
                    Panel de Activación y Gestión de Suscripción
                </h4>
                <p className={classes.cardCategoryWhite}>
                    Aquí puedes ver el estado de tu suscripción, consultar los detalles de tu plan actual y gestionar acciones como cambiar, pausar o cancelar tu suscripción.
                </p>
            </CardHeader>
            <CardBody>
                <div className={classes.subscriptionPendingBanner}>
                    Tu pago está siendo procesado
                    <ScheduleIcon style={{ marginLeft: 12, fontSize: 32 }} />
                </div>
                <p className={classes.description} style={{ marginTop: 0 }}>
                    Estamos verificando tu pago. Este proceso puede tomar un tiempo. Una vez confirmado, tu tienda se activará automáticamente.
                </p>
                <p className={classes.description} style={{ marginTop: 0 }}>
                    Si tienes alguna duda o tu tienda no se activa en un plazo de 24 horas, contacta a soporte.
                </p>
            </CardBody>
        </Card>
    );
};

export default PaymentPending;
