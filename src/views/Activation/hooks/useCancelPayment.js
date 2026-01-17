import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const getLastCancelledDate = (history = []) => {
    if (!Array.isArray(history) || history.length === 0) {
        return null;
    }
    const lastItem = history[history.length - 1];
    const status = (lastItem?.status || lastItem?.action || '').toLowerCase();
    if (status === 'cancelled' || status === 'canceled' || status === 'cancel') {
        return lastItem?.date || null;
    }
    return null;
};

export const useCancelPayment = () => {
    const { configDetail } = useSelector((state) => state.config);
    const lastCancelDate = useMemo(() => getLastCancelledDate(configDetail?.userActionHistory), [configDetail?.userActionHistory]);

    return { configDetail, lastCancelDate };
};
