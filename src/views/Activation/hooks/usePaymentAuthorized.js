import { useSelector } from 'react-redux';

export const usePaymentAuthorized = () => {
    const { configDetail } = useSelector((state) => state.config);
    return { configDetail };
};
