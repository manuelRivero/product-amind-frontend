import client from 'api/client';

export const connectMarketplace = () => {
    return client.post(
        `api/mercado-pago/connect-marketplace`,
    );
}