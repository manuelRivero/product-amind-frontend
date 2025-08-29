import client from '../client'

export const getPlans = ({searchAvailable = true}) => {
    return client.get(`api/plans/get-plans`, {
        params: {
            searchAvailable
        }
    })
}
