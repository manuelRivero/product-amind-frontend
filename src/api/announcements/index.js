import client from 'api/client'

export const getAnnouncements = (page = 0, limit = 10) => {
    return client.get(`api/announcements/tenant/list`, {
        params: {
            page,
            limit
        }
    })
}

export const getUnreadCount = () => {
    return client.get(`api/announcements/tenant/unread-count`)
}

export const markAsRead = (id) => {
    return client.post(`api/announcements/tenant/${id}/read`)
}

