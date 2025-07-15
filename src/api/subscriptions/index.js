import client from '../client'

export const cancelSubscription = (id) => {
    return client.put(`api/subscriptions/${id}/cancel`)
}

export const pauseSubscription = (id) => {
    return client.put(`api/subscriptions/${id}/pause`)
} 

export const resumeSubscription = (id) => {
    return client.put(`api/subscriptions/${id}/resume`)
} 