import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { isFreePlan } from '../../../utils/planPermissions';

const formatDate = (value) => {
    if (!value) {
        return null;
    }
    return moment(value).format('DD/MM/YYYY');
};

export const useSubscriptionDetails = () => {
    const { configDetail, loadingCancelSubscription, loadingPauseSubscription } = useSelector((state) => state.config);
    const isCurrentPlanFree = useMemo(() => isFreePlan(configDetail?.plan), [configDetail?.plan]);

    const nextPaymentDate = useMemo(() => {
        const rawDate = configDetail?.nextPaymentDate
            || configDetail?.preapprovalNextPaymentDate
            || configDetail?.nextBillingDate;
        return formatDate(rawDate);
    }, [configDetail?.nextPaymentDate, configDetail?.preapprovalNextPaymentDate, configDetail?.nextBillingDate]);

    return {
        configDetail,
        loadingCancelSubscription,
        loadingPauseSubscription,
        isCurrentPlanFree,
        nextPaymentDate,
    };
};
