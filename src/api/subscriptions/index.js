import client from '../client'

export const cancelSubscription = () => {
    return client.post(`api/subscriptions/cancel`)
}

export const pauseSubscription = () => {
    return client.post(`api/subscriptions/pause`)
} 