import client from 'api/client'

export const createBanner = (data, access) => {
    return client.post(`api/banners/create-banner`, data, {
        headers: {
            'x-token': access,
        },
    })
}

export const changeBannerStatus = (id, access) => {
    return client.put(
        `api/banners/change-status`,
        { id },
        {
            headers: {
                'x-token': access,
            },
        }
    )
}

export const getBanners = (access) => {
    return client.get(`api/banners/get-banners`, {
        headers: {
            'x-token': access,
        },
    })
}

export const deleteBanner = (id, access) => {
    return client.delete(`api/banners/delete-banner`, {
        headers: {
            'x-token': access,
        },
        data: { id }, // Coloca el cuerpo aquí
    });
};
