import client from '../client'

export const getPlans = (access) => {
    return client.get(`api/plans/get-plans`, {
        headers: {
            'x-token': access,
        },
    })
}
