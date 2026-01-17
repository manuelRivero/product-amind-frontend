import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { isFreePlan } from '../../../utils/planPermissions';

const getLastPausedDate = (history = []) => {
    if (!Array.isArray(history) || history.length === 0) {
        return null;
    }
    const lastItem = history[history.length - 1];
    const status = (lastItem?.status || lastItem?.action || '').toLowerCase();
    if (status === 'paused' || status === 'pause') {
        return lastItem?.date || null;
    }
    return null;
};

export const usePausePayment = () => {
    const { configDetail, loadingCancelSubscription } = useSelector((state) => state.config);

    const lastPauseDate = useMemo(() => getLastPausedDate(configDetail?.userActionHistory), [configDetail?.userActionHistory]);
    const isCurrentPlanFree = useMemo(() => isFreePlan(configDetail?.plan), [configDetail?.plan]);

    return {
        configDetail,
        lastPauseDate,
        loadingCancelSubscription,
        isCurrentPlanFree,
    };
};
