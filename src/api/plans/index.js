import client from '../client'

export const getPlans = () => {
    return client.get(`api/plans/get-plans`)
}
