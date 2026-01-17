import moment from 'moment';
import { isFreePlan } from '../../../utils/planPermissions';
import { ACTIVATION_VIEW_STATES } from '../activationConstants';

const getLastActionInfo = (history = []) => {
    if (!Array.isArray(history) || history.length === 0) {
        return { lastStatus: null, lastPauseDate: null, lastCancelDate: null };
    }

    const lastItem = history[history.length - 1];
    const status = lastItem?.status || lastItem?.action || null;
    const normalized = typeof status === 'string' ? status.toLowerCase() : null;

    const isPaused = normalized === 'paused' || normalized === 'pause';
    const isCancelled = normalized === 'cancelled' || normalized === 'canceled' || normalized === 'cancel';

    return {
        lastStatus: normalized,
        lastPauseDate: isPaused ? lastItem?.date : null,
        lastCancelDate: isCancelled ? lastItem?.date : null,
    };
};

export const useActivationStatus = (configDetail) => {
    const plan = configDetail?.plan;
    const mpSubscriptionId = configDetail?.mpSubscriptionId;
    const paymentStatus = configDetail?.paymentStatus;
    const preapprovalStatus = configDetail?.preapprovalStatus;
    const accessToken = configDetail?.mercadoPagoMarketplaceAccessToken;
    const tokenExpiresAt = configDetail?.mercadoPagoMarketplaceTokenExpiresAt;
    const tokenValid = Boolean(accessToken) && moment(tokenExpiresAt).isAfter(moment());

    const { lastStatus, lastPauseDate, lastCancelDate } = getLastActionInfo(configDetail?.userActionHistory);

    const hasPlan = plan !== null && plan !== undefined;
    const hasSubscription = mpSubscriptionId !== null && mpSubscriptionId !== undefined;
    const isPlanFree = isFreePlan(plan);

    const isPaymentApproved = hasPlan && hasSubscription && (
        (preapprovalStatus === 'approved' && paymentStatus === 'approved') ||
        (preapprovalStatus === 'authorized' && paymentStatus === 'approved')
    );
    const isPaymentAuthorized = hasPlan && hasSubscription && (preapprovalStatus === 'authorized' && paymentStatus === 'authorized');
    const isPaymentPending = hasPlan && hasSubscription && (preapprovalStatus === 'authorized' && paymentStatus === 'pending');
    const isPaymentPaused = hasPlan && hasSubscription && (
        preapprovalStatus === 'paused' ||
        paymentStatus === 'paused' ||
        lastStatus === 'paused' ||
        lastStatus === 'pause'
    );
    const isPaymentCancelled = hasPlan && hasSubscription && (
        preapprovalStatus === 'cancelled' ||
        preapprovalStatus === 'canceled' ||
        paymentStatus === 'cancelled' ||
        paymentStatus === 'canceled' ||
        lastStatus === 'cancelled' ||
        lastStatus === 'canceled' ||
        lastStatus === 'cancel'
    );

    const isSubscriptionActive = hasPlan && (
        isPlanFree ||
        (hasSubscription && isPaymentApproved && !isPaymentCancelled)
    );

    let viewState = ACTIVATION_VIEW_STATES.NEEDS_PLAN;
    if (hasPlan && !hasSubscription) {
        viewState = ACTIVATION_VIEW_STATES.NEEDS_SUBSCRIPTION;
    } else if (isPaymentCancelled) {
        viewState = ACTIVATION_VIEW_STATES.CANCELLED;
    } else if (isPaymentPaused) {
        viewState = ACTIVATION_VIEW_STATES.PAUSED;
    } else if (isPaymentPending) {
        viewState = ACTIVATION_VIEW_STATES.PENDING;
    } else if (isPaymentAuthorized) {
        viewState = ACTIVATION_VIEW_STATES.AUTHORIZED;
    } else if (isSubscriptionActive) {
        viewState = ACTIVATION_VIEW_STATES.ACTIVE;
    }

    const meta = {
        hasPlan,
        hasSubscription,
        isFreePlan: isPlanFree,
        tokenValid,
        lastPauseDate,
        lastCancelDate,
        plan,
        paymentStatus,
        preapprovalStatus,
        isPaymentApproved,
        isPaymentAuthorized,
        isPaymentPending,
        isPaymentPaused,
        isPaymentCancelled,
        isSubscriptionActive,
    };

    return { viewState, meta };
};
