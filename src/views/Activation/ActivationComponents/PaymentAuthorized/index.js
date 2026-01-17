import React from 'react';
import { usePaymentAuthorized } from '../../hooks/usePaymentAuthorized';
import { makeStyles } from '@material-ui/core/styles';
import Card from 'components/Card/Card.js';
import CardHeader from 'components/Card/CardHeader.js';
import CardBody from 'components/Card/CardBody.js';
import moment from 'moment';

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
    subtitle: {
        fontWeight: 'bold',
        marginBottom: theme.spacing(1),
    },
    subscriptionDetailsList: {
        listStyle: 'none',
        padding: 0,
        margin: `${theme.spacing(2)} 0`,
    },
    subscriptionDetailItem: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing(1),
        fontSize: '16px',
    },
    subscriptionDetailBullet: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: '#000',
        marginRight: theme.spacing(1),
        flexShrink: 0,
    },
    subscriptionDetailLabel: {
        color: '#666',
        marginRight: theme.spacing(1),
    },
    subscriptionDetailValue: {
        fontWeight: 'bold',
        color: '#333',
    },
}));

const PaymentAuthorized = () => {
    const classes = useStyles();
    const { configDetail } = usePaymentAuthorized();

    return (
        <Card className={classes.card}>
            <CardHeader color="info">
                <h4 className={classes.cardTitleWhite}>
                    Tu pago está autorizado
                </h4>
                <p className={classes.cardCategoryWhite}>
                    Tu tarjeta fue autorizada exitosamente
                </p>
            </CardHeader>
            <CardBody>
                <p>
                    Estamos procesando el pago para activar tu tienda. Este proceso puede tomar unos minutos. Una vez completado, tu tienda estará lista para operar.
                </p>
                <h4 className={classes.subtitle}>Detalles de tu subscripción:</h4>
                <ul className={classes.subscriptionDetailsList}>
                    <li className={classes.subscriptionDetailItem}>
                        <div className={classes.subscriptionDetailBullet}></div>
                        <span className={classes.subscriptionDetailLabel}>Plan:</span>
                        <span className={classes.subscriptionDetailValue}>
                            {configDetail?.plan?.name}
                        </span>
                    </li>
                    <li className={classes.subscriptionDetailItem}>
                        <div className={classes.subscriptionDetailBullet}></div>
                        <span className={classes.subscriptionDetailLabel}>Fecha de autorización:</span>
                        <span className={classes.subscriptionDetailValue}>
                            {moment(configDetail?.startDate).format('DD/MM/YYYY')}
                        </span>
                    </li>
                </ul>
            </CardBody>
        </Card>
    );
};

export default PaymentAuthorized;
