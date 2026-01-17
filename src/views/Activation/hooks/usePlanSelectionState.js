import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getPlans } from '../../../api/plans';
import { UNAVAILABLE_FEATURE_FALLBACK } from '../../const';
import { isFeatureEnabled } from '../../helpers/planFeatures';

const resolvePlans = (response) => {
    if (!response) {
        return [];
    }
    const data = response.data;
    if (Array.isArray(data)) {
        return data;
    }
    if (Array.isArray(data?.plans)) {
        return data.plans;
    }
    if (Array.isArray(data?.data)) {
        return data.data;
    }
    return [];
};

const findFeatureInfo = (plans, featureKey) => {
    if (!featureKey || !Array.isArray(plans)) {
        return null;
    }
    for (const plan of plans) {
        if (!Array.isArray(plan?.features)) {
            continue;
        }
        const featureItem = plan.features.find((item) => item?.feature?.name === featureKey);
        if (featureItem?.feature) {
            return {
                title: featureItem.feature.title || featureItem.feature.name || featureKey,
            };
        }
    }
    return null;
};

export const usePlanSelectionState = () => {
    const { configDetail } = useSelector((state) => state.config);
    const location = useLocation();
    const [loadingPlans, setLoadingPlans] = useState(false);
    const [plans, setPlans] = useState([]);
    const [featureParam, setFeatureParam] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setFeatureParam(params.get('feature'));
    }, [location.search]);

    useEffect(() => {
        let isMounted = true;
        const fetchPlans = async () => {
            setLoadingPlans(true);
            try {
                const response = await getPlans({ searchAvailable: true });
                const parsedPlans = resolvePlans(response);
                if (isMounted) {
                    setPlans(parsedPlans);
                }
            } catch (error) {
                console.error('Error al obtener planes:', error);
                if (isMounted) {
                    setPlans([]);
                }
            } finally {
                if (isMounted) {
                    setLoadingPlans(false);
                }
            }
        };

        fetchPlans();
        return () => {
            isMounted = false;
        };
    }, []);

    const highlightPlans = useMemo(() => {
        if (!featureParam) {
            return [];
        }
        return plans
            .filter((plan) => isFeatureEnabled(plan, featureParam))
            .map((plan) => plan._id);
    }, [featureParam, plans]);

    const featureInfo = useMemo(() => {
        if (!featureParam) {
            return null;
        }
        const info = findFeatureInfo(plans, featureParam);
        return info || UNAVAILABLE_FEATURE_FALLBACK;
    }, [featureParam, plans]);

    return {
        loadingPlans,
        plans,
        featureParam,
        featureInfo,
        highlightPlans,
        configDetail,
    };
};
